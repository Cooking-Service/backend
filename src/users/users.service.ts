import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Model } from 'mongoose';
import { ResponseDto } from 'src/common/dto/response.dto';
import { EmailTemplate, sendEmail } from 'src/common/mailer/node.mailer';
import { CompaniesService } from 'src/companies/companies.service';
import {
  ModifyUserDto,
  RegisterUserDto,
  UserFiltersDto,
} from './dto/users.dto';
import { HashType } from './schemas/user-hash.schema';
import {
  User,
  UserDocument,
  UserRoles,
  UserStatus,
} from './schemas/user.schema';
import { UsersHashesService } from './users-hashes.service';
import { generateUsername } from './utils/user.utils';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectConnection() private connection: mongoose.Connection,
    private companiesService: CompaniesService,
    private usersHashesService: UsersHashesService,
    private config: ConfigService,
  ) {}

  /**
   * Used by Auth module DO NOT TOUCH
   */
  async findByUsername(username: string): Promise<User> {
    const user = await this.userModel.findOne({ username }).select('+password');

    return user;
  }

  /**
   * Used by Auth module DO NOT TOUCH
   */
  async getUserRoles(id: number): Promise<string[]> {
    const user = await this.userModel.findById(id);
    return user.roles;
  }

  async getProfile(username: string): Promise<ResponseDto<User>> {
    const user = await this.userModel
      .findOne({ username })
      .select({
        createdOn: 0,
        createdBy: 0,
        updatedOn: 0,
        updatedBy: 0,
        status: 0,
        lastLogin: 0,
      })
      .populate({
        path: 'company',
        select: '-createdOn -createdBy -updatedOn -updatedBy',
      });
    return {
      success: true,
      response: user,
    };
  }

  async getUserList(filters: UserFiltersDto): Promise<ResponseDto<any>> {
    let {
      limit = 10,
      skip = 1,
      search = '',
      role = null,
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
      $or: [
        { nameFilter: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { username: { $regex: search, $options: 'i' } },
      ],
      status: status ? { $eq: status } : { $ne: UserStatus.DELETED },
      roles: role ? { $in: [role] } : { $in: Object.values(UserRoles) },
      companyFilter: company ? { $eq: company } : { $regex: '' },
    };

    await this.userModel.find();

    const users = await this.userModel
      .aggregate()
      .addFields({
        nameFilter: {
          $concat: ['$firstName', ' ', '$lastName'],
        },
        companyFilter: {
          $toString: '$company',
        },
      })
      .match(matchQuery)
      .project({
        _id: 1,
        createdOn: 1,
        status: 1,
        roles: 1,
        lastName: 1,
        email: 1,
        username: 1,
        firstName: 1,
      })
      .sort(sortBy)
      .skip(skip * limit - limit)
      .limit(limit);

    const totalUsers: object[] = await this.userModel
      .aggregate()
      .addFields({
        nameFilter: {
          $concat: ['$firstName', ' ', '$lastName'],
        },
        companyFilter: {
          $toString: '$company',
        },
      })
      .match(matchQuery)
      .count('total');

    const totalRecords = totalUsers.length === 0 ? 0 : totalUsers[0]['total'];

    const totalPages = Math.ceil(totalRecords / limit);

    return {
      success: true,
      response: {
        skip,
        limit,
        totalPages,
        totalRecords,
        records: users,
      },
    };
  }

  async getUserById(id: string): Promise<ResponseDto<User>> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new NotFoundException('User Not Found');
    }

    const user = await this.userModel.findById(id).populate([
      {
        path: 'company',
        select: {
          name: 1,
          logo: 1,
        },
      },
      {
        path: 'createdBy',
        select: {
          username: 1,
        },
      },
      {
        path: 'updatedBy',
        select: {
          username: 1,
        },
      },
    ]);

    if (!user) {
      throw new NotFoundException('User Not Found');
    }

    return {
      success: true,
      response: user,
    };
  }

  async create(
    registerUserDto: RegisterUserDto,
    createdBy: User,
  ): Promise<ResponseDto<User>> {
    // session will help us to manage transaccions
    const session = await this.connection.startSession();

    session.startTransaction();

    try {
      // verify if email is already registered on DB.
      const userByEmail = await this.userModel
        .findOne({
          email: registerUserDto.email,
        })
        .session(session);

      // if the email already exists in the database, then cancel the operation.
      if (userByEmail) {
        await session.abortTransaction();
        return {
          success: false,
          message: 'The email is already registered in the system.',
        };
      }

      // verify if company is already registered on DB.
      const company = await this.companiesService.findById(
        registerUserDto.company,
      );

      // if the company doesn't exists in the database, then cancel the operation.
      if (!company.success) {
        await session.abortTransaction();

        return {
          success: false,
          message: 'Company does not exist.',
        };
      }

      delete registerUserDto.company;

      // generate username.
      const username = generateUsername(
        company.response.code,
        registerUserDto.firstName,
        registerUserDto.lastName,
      );

      const newUser = new this.userModel(registerUserDto);

      newUser.createdOn = new Date();
      newUser.createdBy = createdBy;
      newUser.company = company.response;
      newUser.username = username;

      // TODO: To generate avatar.

      await newUser.save({ session: session });

      const user = await this.userModel
        .findOne({ username })
        .select('-createdBy -createdOn -updatedBy -updatedOn -roles -status')
        .session(session);

      const hash = await this.usersHashesService.generateHash(
        user,
        HashType.ACTIVE_ACCOUNT,
        session,
      );

      // Send Email to confirm and active account.
      const hashEncoded = encodeURIComponent(hash.response.hash);
      const link = `${this.config.get('FE_DOMAIN')}?token=${hashEncoded}`;

      const emailConfirmation = await sendEmail({
        to: user.email,
        subject: 'Active Account',
        payload: {
          link,
        },
        template: EmailTemplate.ACTIVE_ACCOUNT,
      });

      if (!emailConfirmation.success) {
        throw new Error('send email');
      }

      // confirm all trnasactions of mongoose.
      await session.commitTransaction();

      return {
        success: true,
        message: 'User Succesfully Created. Please Active Account',
        response: user,
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
    modifyUserDto: ModifyUserDto,
    updatedBy: User,
  ): Promise<ResponseDto<User>> {
    const session = await this.connection.startSession();

    session.startTransaction();

    try {
      const {
        firstName,
        lastName,
        roles,
        status,
        company: companyId,
      } = modifyUserDto;

      // verify if user exist.
      const user = await this.userModel.findById(id).session(session);
      if (!user) {
        throw new NotFoundException('User Not Found.');
      }

      // if email has been send to update, verify if exist on database.
      if (modifyUserDto?.email) {
        if (modifyUserDto.email !== user.email) {
          const userByEmail = await this.userModel
            .findOne({ email: modifyUserDto.email })
            .session(session);
          if (userByEmail) {
            await session.abortTransaction();
            return {
              success: false,
              message: 'The email is already registered in the system.',
            };
          }
          user.email = modifyUserDto.email;
          user.status = UserStatus.PENDINDG;
        } else {
          delete modifyUserDto.email;
        }
      }

      // if company has been send to update, verify if exist on database.
      // TODO: is necesary?
      if (companyId) {
        const { response: company } = await this.companiesService.findById(
          companyId,
        );
        if (!company) {
          await session.abortTransaction();

          return {
            success: false,
            message: 'Company does not exist',
          };
        }
        user.company = company;
      }

      // apply changes to user.
      user.updatedOn = new Date();
      user.updatedBy = updatedBy;
      firstName ? (user.firstName = firstName) : null;
      lastName ? (user.lastName = lastName) : null;
      roles ? (user.roles = roles) : null;
      status ? (user.status = status) : null;

      await user.save({ session });

      // if email has been updated, send new email to active account
      if (modifyUserDto?.email) {
        const { response: hash } = await this.usersHashesService.generateHash(
          user,
          HashType.ACTIVE_ACCOUNT,
          session,
        );
        const hashEncoded = encodeURIComponent(hash.hash);
        const link = `${this.config.get('FE_DOMAIN')}?token=${hashEncoded}`;

        const emailConfirmation = await sendEmail({
          to: user.email,
          subject: 'Active Account',
          payload: {
            link,
          },
          template: EmailTemplate.ACTIVE_ACCOUNT,
        });

        if (!emailConfirmation.success) {
          throw new Error('send email');
        }
      }

      await session.commitTransaction();

      const { response: userRes } = await this.getUserById(id);

      // TODO: Is necessary to send response<User>?
      return {
        success: true,
        message: `User Successsfully Updated. ${
          modifyUserDto?.email ? 'Please Active Account' : ''
        }`,
        response: userRes,
      };
    } catch (error) {
      await session.abortTransaction();
      if (error.status === 404) {
        throw error;
      }

      throw new InternalServerErrorException();
    } finally {
      session.endSession();
    }
  }
}
