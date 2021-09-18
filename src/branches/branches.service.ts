import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Model } from 'mongoose';
import { CurrentUser } from 'src/auth/user.guard';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { ResponseDto } from 'src/common/dto/response.dto';
import {
  BRANCH_ITEM_LIST_SELECT,
  COMPANY_SUBDOC_SELECT,
} from 'src/common/dto/select.structures';
import { countRecords } from 'src/common/utils/utils';
import { CompaniesService } from 'src/companies/companies.service';
import { User, UserRoles, UserStatus } from 'src/users/schemas/user.schema';
import {
  BranchFiltersDto,
  CreateBranchDto,
  ModifyBranchDto,
} from './dto/branches.dto';
import { Branch, BranchDocument } from './schemas/branch.schema';

@Injectable()
export class BranchesService {
  constructor(
    @InjectModel(Branch.name) private branchModel: Model<BranchDocument>,
    @InjectConnection() private connection: mongoose.Connection,
    private companiesService: CompaniesService,
  ) {}

  async getBranchList(
    filters: BranchFiltersDto,
  ): Promise<ResponseDto<PaginationDto<Branch>>> {
    let {
      limit = 10,
      skip = 1,
      search = '',
      status = null,
      sortBy = '-createdOn',
      company = null,
    } = filters;

    if (typeof limit === 'string') {
      limit = parseInt(limit);
    }

    if (typeof skip === 'string') {
      skip = parseInt(skip);
    }

    const matchQuery = {
      name: { $regex: search, $options: 'i' },
      status: status ? { $eq: status } : { $ne: UserStatus.DELETED },
      companyFilter: company ? { $eq: company.toString() } : { $regex: '' },
    };

    const extraFields = {
      companyFilter: {
        $toString: '$company',
      },
    };

    const branches = await this.branchModel
      .aggregate()
      .addFields(extraFields)
      .match(matchQuery)
      .project(BRANCH_ITEM_LIST_SELECT)
      .sort(sortBy)
      .skip(skip * limit - limit)
      .limit(limit);

    await this.branchModel.populate(branches, [
      { path: 'company', select: COMPANY_SUBDOC_SELECT },
    ]);

    const totalRecords = await countRecords(
      this.branchModel,
      matchQuery,
      extraFields,
    );

    const totalPages = Math.ceil(totalRecords / limit);

    return {
      success: true,
      response: {
        skip,
        limit,
        totalPages,
        totalRecords,
        records: branches,
      },
    };
  }

  async create(
    createBranchDto: CreateBranchDto,
    createdBy: User,
  ): Promise<ResponseDto<Branch>> {
    const session = await this.connection.startSession();

    session.startTransaction();

    try {
      const { name, company: companyId } = createBranchDto;

      const company = await this.companiesService.findById(companyId);

      if (!company?.success) {
        await session.abortTransaction();
        return {
          success: false,
          message: 'Company Does Not Exist.',
        };
      }

      const existBranch = await this.branchModel.findOne({
        company: company.response,
        name,
      });

      if (existBranch) {
        await session.abortTransaction();

        return {
          success: false,
          message: 'A branch with this name already exists.',
        };
      }

      const newBranch = new this.branchModel({ session });

      newBranch.name = name;
      newBranch.company = company.response;
      newBranch.latitude = createBranchDto.latitude;
      newBranch.longitude = createBranchDto.longitude;

      newBranch.createdBy = createdBy;
      newBranch.createdOn = new Date();

      await newBranch.save({ session });

      await session.commitTransaction();

      const branch = await this.branchModel
        .findById(newBranch.id)
        .populate({
          path: 'createdBy',
          select: { username: 1 },
        })
        .populate({
          path: 'company',
          select: { name: 1, logo: 1 },
        });

      return {
        success: true,
        message: 'Branch Successfullly Created.',
        response: branch,
      };
    } catch (error) {
      await session.abortTransaction();
      throw new InternalServerErrorException();
    } finally {
      session.endSession();
    }
  }

  async modify(
    id: string,
    modifyBranchDto: ModifyBranchDto,
    updatedBy: User,
  ): Promise<ResponseDto<Branch>> {
    const session = await this.connection.startSession();

    session.startTransaction();

    try {
      const { name, status, latitude, longitude } = modifyBranchDto;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new NotFoundException('Branch Does Not Exist.');
      }

      const branch = await this.branchModel.findById(id).session(session);

      if (
        updatedBy.roles.includes(UserRoles.ADMIN) &&
        branch.company.toString() !== updatedBy.company.toString()
      ) {
        throw new ForbiddenException();
      }

      if (!branch) {
        throw new NotFoundException('Branch Does Not Exist.');
      }

      if (name && name !== branch.name) {
        const existName = await this.branchModel.findOne({
          company: branch.company,
          name,
        });

        if (existName) {
          await session.abortTransaction();
          return {
            success: false,
            message: 'A branch with this name already exists.',
          };
        }
      }

      branch.updatedBy = updatedBy;
      branch.updatedOn = new Date();
      name ? (branch.name = name) : null;
      status ? (branch.status = status) : null;
      latitude ? (branch.latitude = latitude) : null;
      longitude ? (branch.longitude = longitude) : null;

      await branch.save({ session });

      await session.commitTransaction();
      return {
        success: true,
        message: 'Branch Successfully Updated.',
      };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }
}
