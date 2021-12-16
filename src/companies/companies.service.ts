import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Model } from 'mongoose';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { ResponseDto } from 'src/common/dto/response.dto';
import { Status } from 'src/common/types/enums';
import {
  COMPANY_LIST_SELECT,
  USER_SUBDOC_SELECT,
} from 'src/common/types/select.structures';
import { countRecords } from 'src/common/utils/utils';
import { User } from 'src/users/schemas/user.schema';
import {
  ComapnyFiltersDto,
  CreateCompanyDto,
  ModifyCompanyDto,
} from './dto/companies.dto';
import { Company, CompanyDocument } from './schemas/company.schema';

@Injectable()
export class CompaniesService {
  constructor(
    @InjectModel(Company.name) private companyModel: Model<CompanyDocument>,
    @InjectConnection() private connection: mongoose.Connection,
  ) {}

  /**
   * Used By User Service DO NOT TOUCH.
   */
  async findById(id: any): Promise<ResponseDto<Company>> {
    const company = await this.companyModel.findById(id);

    if (!company) {
      return {
        success: false,
      };
    }

    return {
      success: true,
      response: company,
    };
  }

  async getCompanyList(
    filters: ComapnyFiltersDto,
  ): Promise<ResponseDto<PaginationDto<Company>>> {
    let {
      limit = 10,
      skip = 1,
      search = '',
      status = null,
      sortBy = '-createdOn',
    } = filters;

    if (typeof limit === 'string') {
      limit = parseInt(limit);
    }

    if (typeof skip === 'string') {
      skip = parseInt(skip);
    }

    const matchQuery = {
      $or: [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } },
      ],
      status: status ? { $eq: status } : { $ne: Status.DELETED },
    };

    const companies = await this.companyModel
      .aggregate()
      .match(matchQuery)
      .project(COMPANY_LIST_SELECT)
      .sort(sortBy)
      .skip(skip * limit - limit)
      .limit(limit);

    const totalRecords = await countRecords(this.companyModel, matchQuery, {});

    const totalPages = Math.ceil(totalRecords / limit);

    return {
      success: true,
      response: {
        skip,
        limit,
        totalPages,
        totalRecords,
        records: companies,
      },
    };
  }

  async getCompanyById(id: string): Promise<ResponseDto<Company>> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Company Not Found');
    }

    const company = await this.companyModel.findById(id).populate([
      {
        path: 'createdBy',
        select: USER_SUBDOC_SELECT,
      },
      {
        path: 'updatedBy',
        select: USER_SUBDOC_SELECT,
      },
    ]);

    if (!company) {
      throw new NotFoundException('User Not Found');
    }

    return {
      success: true,
      response: company,
    };
  }

  async create(
    createCompanyDto: CreateCompanyDto,
    createdBy: User,
    logo?: Express.Multer.File,
  ): Promise<ResponseDto<Company>> {
    const session = await this.connection.startSession();

    session.startTransaction();

    try {
      const { name, code } = createCompanyDto;

      const existName = await this.companyModel.exists({ name });
      if (existName) {
        await session.abortTransaction();
        return {
          success: false,
          message:
            'The name already exists in the system. Please select another name and try again.',
        };
      }

      const existCode = await this.companyModel.exists({ code });
      if (existCode) {
        await session.abortTransaction();
        return {
          success: false,
          message:
            'The code already exists in the system. Please select another code and try again.',
        };
      }

      const newCompany = new this.companyModel({ session });

      newCompany.name = name;
      newCompany.code = code;
      newCompany.createdBy = createdBy;
      newCompany.createdOn = new Date();
      newCompany.logo = null;

      await newCompany.save({ session });

      session.commitTransaction();

      const company = await this.companyModel
        .findById(newCompany.id)
        .populate({ path: 'createdBy', select: { username: 1 } });

      return {
        success: true,
        message: 'Company Successfully Created.',
        response: company,
      };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async modify(
    id: string,
    modifyCompanyDto: ModifyCompanyDto,
    updatedBy: User,
    clientSessiion?: mongoose.ClientSession,
  ): Promise<ResponseDto<Company>> {
    // session will help us to manage transactions
    const session = clientSessiion
      ? clientSessiion
      : await this.connection.startSession();

    !clientSessiion ? session.startTransaction() : null;

    try {
      const { name, status } = modifyCompanyDto;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new NotFoundException('Company Not Found.');
      }

      // verify if company exist.
      const company = await this.companyModel.findById(id).session(session);
      if (!company) {
        throw new NotFoundException('Company Not Found.');
      }

      if (name) {
        const existCompany = await this.companyModel.exists({
          name: { $regex: `^${name}$`, $options: 'i' },
        });

        if (existCompany) {
          await session.abortTransaction();
          return {
            success: false,
            message: 'A Company with this name already exists.',
          };
        }
      }

      name ? (company.name = name) : null;
      status ? (company.status = status) : null;
      company.updatedBy = updatedBy;
      company.updatedOn = new Date();

      await company.save({ session });

      !clientSessiion ? await session.commitTransaction() : null;

      const { response: companyRes } = await this.getCompanyById(id);

      return {
        success: true,
        message: 'Company Successfully Updated.',
        response: companyRes,
      };
    } catch (error) {
      await session.abortTransaction();

      if (error.status === 404) {
        throw error;
      }

      throw new InternalServerErrorException();
    } finally {
      !clientSessiion ? session.endSession() : null;
    }
  }

  async companyDeletion(
    id: string,
    deletedBy: User,
  ): Promise<ResponseDto<any>> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new NotFoundException();
    }

    const company = await this.companyModel.findByIdAndUpdate(id, {
      $unset: {
        code: 1,
        createdBy: 1,
        createdOn: 1,
        updatedBy: 1,
        updatedOn: 1,
      },
      $set: {
        status: Status.DELETED,
        name: `Deleted By ${deletedBy.username} (${
          deletedBy['id']
        }) on ${new Date().toISOString()}`,
      },
    });

    if (!company) {
      throw new NotFoundException();
    }
    return {
      success: true,
      message: 'Company Successfully Deleted',
    };
  }
}
