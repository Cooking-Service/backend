import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Model } from 'mongoose';
import { ResponseDto } from 'src/common/dto/response.dto';
import { CompaniesService } from 'src/companies/companies.service';
import { User } from 'src/users/schemas/user.schema';
import { CreateBranchDto } from './dto/branches.dto';
import { Branch, BranchDocument } from './schemas/branch.schema';

@Injectable()
export class BranchesService {
  constructor(
    @InjectModel(Branch.name) private branchModel: Model<BranchDocument>,
    @InjectConnection() private connection: mongoose.Connection,
    private companiesService: CompaniesService,
  ) {}

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
        session.abortTransaction();
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
        session.abortTransaction();

        return {
          success: false,
          message: 'A branch with this name already exists',
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
}
