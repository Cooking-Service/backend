import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { Roles } from 'src/auth/roles.decorator';
import { CurrentUser } from 'src/auth/user.guard';
import { ResponseDto } from 'src/common/dto/response.dto';
import { User, UserRoles } from 'src/users/schemas/user.schema';
import { BranchesService } from './branches.service';
import { BranchFiltersDto, CreateBranchDto } from './dto/branches.dto';
import { Branch } from './schemas/branch.schema';

@Controller('branches')
export class BranchesController {
  constructor(private service: BranchesService) {}

  @Get()
  @Roles(UserRoles.SUPER_ADMIN, UserRoles.ADMIN, UserRoles.OBSERVER)
  async BranchList(
    @Query() filters: BranchFiltersDto,
    @CurrentUser() currentUser: User,
  ): Promise<ResponseDto<any>> {
    if (
      currentUser.roles.includes(UserRoles.ADMIN) ||
      currentUser.roles.includes(UserRoles.OBSERVER)
    ) {
      const company: any = currentUser.company;
      filters.company = company;
    }
    return await this.service.getBranchList(filters);
  }

  @Post()
  @UsePipes(
    new ValidationPipe({
      whitelist: true,
    }),
  )
  @Roles(UserRoles.SUPER_ADMIN, UserRoles.ADMIN)
  async create(
    @Body() createBranchDto: CreateBranchDto,
    @CurrentUser() currentUser: User,
  ): Promise<ResponseDto<Branch>> {
    if (currentUser.roles.includes(UserRoles.ADMIN)) {
      const company: any = currentUser.company;
      createBranchDto.company = company;
    }
    return await this.service.create(createBranchDto, currentUser);
  }
}
