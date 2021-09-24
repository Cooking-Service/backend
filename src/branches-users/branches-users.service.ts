import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Model } from 'mongoose';
import { BranchesService } from 'src/branches/branches.service';
import { AssignBranchUserDto } from 'src/branches/dto/branches.dto';
import { FilterDto } from 'src/common/dto/base-filter.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { ResponseDto } from 'src/common/dto/response.dto';
import {
  CONTACT_LIST_SELECT,
  EMPLOYEE_LIST_SELECT,
} from 'src/common/dto/select.structures';
import { RegisterUserDto } from 'src/users/dto/users.dto';
import { User, UserRoles, UserStatus } from 'src/users/schemas/user.schema';
import { UsersService } from 'src/users/users.service';
import {
  ModifyEmployeeDto,
  RegisterEmployeeDto,
} from './dto/branches-users.dto';
import {
  BranchesUsers,
  BranchesUsersDocument,
  EmployeeType,
} from './schemas/branches-users.schema';

@Injectable()
export class BranchesUsersService {
  constructor(
    @InjectModel(BranchesUsers.name)
    private branchesUsersModel: Model<BranchesUsersDocument>,
    @InjectConnection() private connection: mongoose.Connection,
    private usersService: UsersService,
    private branchesService: BranchesService,
  ) {}

  async getEmployeeType(id: any): Promise<string> {
    const branchUser = await this.branchesUsersModel.findOne({ user: id });

    if (!branchUser) {
      return null;
    }

    return branchUser.employeeType;
  }

  async assignBranchUser(
    assignBranchUserDto: AssignBranchUserDto,
    branch: string,
    currentUser: User,
  ): Promise<ResponseDto<any>> {
    const { user: userId, employeeType } = assignBranchUserDto;

    const existBranch = await this.branchesService.findBranch(branch);

    if (!existBranch) {
      throw new NotFoundException('Branch Not Found');
    }

    if (currentUser.roles.includes(UserRoles.ADMIN)) {
      if (existBranch.company.toString() !== currentUser.company.toString()) {
        throw new ForbiddenException();
      }
    }

    const user = await this.usersService.getUserById(userId);

    if (!user.success) {
      return {
        success: false,
        message: 'User Does Not Exist.',
      };
    }

    if (!mongoose.Types.ObjectId.isValid(branch)) {
      throw new NotFoundException('Branch Not Found');
    }

    const newBranchUser = new this.branchesUsersModel();

    newBranchUser.user = user.response;
    newBranchUser.employeeType = employeeType;
    newBranchUser.branch = existBranch;

    await newBranchUser.save();

    return {
      success: true,
      message: `User Successfully Assigned To ${existBranch.name}`,
    };
  }

  async registerEmployee(
    registerEmployeeDto: RegisterEmployeeDto,
    branchId: string,
    createdBy: User,
  ): Promise<ResponseDto<any>> {
    const session = await this.connection.startSession();

    session.startTransaction();
    try {
      const { firstName, lastName, email, employeeType } = registerEmployeeDto;

      const branch = await this.branchesService.findBranch(branchId);

      if (!branch) {
        throw new NotFoundException('Branch Not Found');
      }

      const company: any = branch.company;

      const registerUserDto: RegisterUserDto = {
        firstName,
        lastName,
        email,
        roles: [UserRoles.EMPLOYEE],
        company,
      };

      const newUser = await this.usersService.create(
        registerUserDto,
        createdBy,
      );

      if (!newUser.success) {
        return newUser;
      }

      const branchUser = new this.branchesUsersModel();

      branchUser.user = newUser.response;
      branchUser.branch = branch;
      branchUser.employeeType = employeeType;

      await branchUser.save();

      await session.commitTransaction();
      return {
        success: true,
        message: 'Employee Successfully Created. Please Confirm Email Account.',
      };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async getEmployeeList(
    branch: string,
    filters: FilterDto,
    currentEmployeeType: EmployeeType,
    currentUser: User,
  ): Promise<ResponseDto<PaginationDto<any>>> {
    let {
      limit = 10,
      skip = 1,
      search = '',
      status = null,
      sortBy = '-firstName',
    } = filters;

    if (typeof limit === 'string') {
      limit = parseInt(limit);
    }

    if (typeof skip === 'string') {
      skip = parseInt(skip);
    }

    const existBranch = await this.branchesService.findBranch(branch);

    if (!existBranch) {
      throw new NotFoundException('Branch Does Not Exist.');
    }

    if (currentUser.roles.includes(UserRoles.EMPLOYEE)) {
      const isValidEmployee = await this.branchesUsersModel.findOne({
        user: currentUser,
        branch: existBranch,
      });

      if (!isValidEmployee) {
        throw new ForbiddenException();
      }
    }

    const matchQuery = {
      branchFilter: { $eq: branch },
      $or: [
        { nameFilter: { $regex: search, $options: 'i' } },
        { username: { $regex: search, $options: 'i' } },
      ],
      'user.status': status ? { $eq: status } : { $ne: UserStatus.DELETED },
    };

    const extraFields = {
      branchFilter: { $toString: '$branch' },
      nameFilter: { $concat: ['$user.firstName', ' ', '$user.lastName'] },
    };

    const project =
      currentEmployeeType === EmployeeType.MANAGER
        ? EMPLOYEE_LIST_SELECT
        : CONTACT_LIST_SELECT;

    const employees = await this.branchesUsersModel
      .aggregate()
      .lookup({
        from: 'users',
        localField: 'user',
        foreignField: '_id',
        as: 'user',
      })
      .unwind('user')
      .addFields(extraFields)
      .match(matchQuery)
      .project(project)
      .sort(sortBy)
      .skip(skip * limit - limit)
      .limit(limit);

    const countRecords = await this.branchesUsersModel
      .aggregate()
      .lookup({
        from: 'users',
        localField: 'user',
        foreignField: '_id',
        as: 'user',
      })
      .unwind('user')
      .addFields(extraFields)
      .match(matchQuery)
      .count('total');

    const totalRecords =
      countRecords.length === 0 ? 0 : countRecords[0]['total'];

    const totalPages = Math.ceil(totalRecords / limit);

    return {
      success: true,
      response: {
        skip,
        limit,
        totalPages,
        totalRecords,
        records: employees,
      },
    };
  }

  async modifyEmployee(
    userId: string,
    branchId: string,
    modifyEmployeeDto: ModifyEmployeeDto,
    updatedBy: User,
  ): Promise<ResponseDto<any>> {
    const session = await this.connection.startSession();
    session.startTransaction();
    try {
      const { employeeType } = modifyEmployeeDto;

      delete modifyEmployeeDto.roles;
      delete modifyEmployeeDto.company;
      delete modifyEmployeeDto.employeeType;

      const branch = await this.branchesService.findBranch(branchId);

      if (!branch) {
        throw new NotFoundException('Branch Does Not Exist');
      }

      const user = await this.usersService.getUserById(userId);

      if (!user.success) {
        throw new NotFoundException('User Does Not Exist');
      }

      const branchUser = await this.branchesUsersModel.findOne({
        branch,
        user: user.response,
      });

      if (!branchUser) {
        return {
          success: false,
          message: 'The user is not an employee of this branch.',
        };
      }

      const updateUser = await this.usersService.modify(
        userId,
        modifyEmployeeDto,
        updatedBy,
        session,
      );

      if (!updateUser.success) {
        await session.abortTransaction();
        return updateUser;
      }

      employeeType ? (branchUser.employeeType = employeeType) : null;

      await branchUser.save();

      await session.commitTransaction();

      return {
        success: true,
        message: 'Employee Successfully Modified.',
      };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }
}
