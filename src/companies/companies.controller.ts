import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { Roles } from 'src/auth/roles.decorator';
import { CurrentUser } from 'src/auth/user.guard';
import { ResponseDto } from 'src/common/dto/response.dto';
import { UserRoles } from 'src/common/types/enums';
import { User } from 'src/users/schemas/user.schema';
import { CompaniesService } from './companies.service';
import {
  ComapnyFiltersDto,
  CreateCompanyDto,
  ModifyCompanyDto,
} from './dto/companies.dto';
import { Company } from './schemas/company.schema';

@Controller('companies')
export class CompaniesController {
  constructor(private service: CompaniesService) {}

  @Get()
  @Roles(UserRoles.SUPER_ADMIN)
  async companyList(
    @Query() filters: ComapnyFiltersDto,
  ): Promise<ResponseDto<any>> {
    return await this.service.getCompanyList(filters);
  }

  @Get(':id')
  @Roles(UserRoles.SUPER_ADMIN)
  async getCompany(@Param('id') id: string): Promise<ResponseDto<Company>> {
    return await this.service.getCompanyById(id);
  }

  @Post()
  @UsePipes(
    new ValidationPipe({
      forbidNonWhitelisted: true,
    }),
  )
  @Roles(UserRoles.SUPER_ADMIN)
  async create(
    @Body() createCompanyDto: CreateCompanyDto,
    @CurrentUser() currentUser: User,
  ): Promise<ResponseDto<Company>> {
    return await this.service.create(createCompanyDto, currentUser);
  }

  @Put('deletion/:id')
  @Roles(UserRoles.SUPER_ADMIN)
  async companyDeletion(
    @Param('id') id: string,
    @CurrentUser() currentUser: User,
  ): Promise<ResponseDto<any>> {
    return await this.service.companyDeletion(id, currentUser);
  }

  @Put(':id')
  @UsePipes(
    new ValidationPipe({
      skipMissingProperties: true,
    }),
  )
  @Roles(UserRoles.SUPER_ADMIN)
  async modifyCompanyById(
    @Param('id') id: string,
    @Body() modifyCompanyDto: ModifyCompanyDto,
    @CurrentUser() currentUser: User,
  ): Promise<ResponseDto<Company>> {
    return await this.service.modify(id, modifyCompanyDto, currentUser);
  }
}
