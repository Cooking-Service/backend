import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ResponseDto } from 'src/common/dto/response.dto';
import { Company, CompanyDocument } from './schemas/company.schema';

@Injectable()
export class CompaniesService {
  constructor(
    @InjectModel(Company.name) private companyModel: Model<CompanyDocument>,
  ) {}

  /**
   * 
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
}
