import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Model } from 'mongoose';
import { ResponseDto } from 'src/common/dto/response.dto';
import { EmailTemplate, sendEmail } from 'src/common/mailer/node.mailer';
import { CompaniesService } from 'src/companies/companies.service';
import { RegisterUserDto } from './dto/users.dto';
import { HashType } from './schemas/user-hash.schema';
import { User, UserDocument } from './schemas/user.schema';
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
      .select('-createdOn -createdBy -updatedOn -updatedBy -status')
      .populate({
        path: 'company',
        select: '-createdOn -createdBy -updatedOn -updatedBy',
      });
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
          message: 'The company does not exist',
        };
      }

      delete registerUserDto.company;

      // generate username.
      const username = generateUsername(
        company.response.code,
        registerUserDto.name,
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
      const link = `${this.config.get('FE_DOMAIN')}/?token=${hashEncoded}`;

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
}
