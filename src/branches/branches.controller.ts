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
import { Employees } from 'src/auth/employees.decorator';
import { Roles } from 'src/auth/roles.decorator';
import { CurrentUser } from 'src/auth/user.guard';
import { BranchesUsersService } from 'src/branches-users/branches-users.service';
import { RegisterEmployeeDto } from 'src/branches-users/dto/branches-users.dto';
import { EmployeeType } from 'src/branches-users/schemas/branches-users.schema';
import { FilterDto } from 'src/common/dto/base-filter.dto';
import { ResponseDto } from 'src/common/dto/response.dto';
import { User, UserRoles } from 'src/users/schemas/user.schema';
import { BranchesService } from './branches.service';
import {
  AssignBranchUserDto,
  BranchFiltersDto,
  CreateBranchDto,
  ModifyBranchDto,
} from './dto/branches.dto';
import { Branch } from './schemas/branch.schema';

@Controller('branches')
export class BranchesController {
  constructor(
    private service: BranchesService,
    private branchesUsersService: BranchesUsersService,
  ) {}

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

  @Get(':id/users')
  @Employees(EmployeeType.MANAGER)
  async branchUsersList(@Param('id') id: string, @Query() filters: FilterDto) {
    return await this.branchesUsersService.getEmployeeList(id, filters);
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

  @Post(':id/users')
  @Roles(UserRoles.SUPER_ADMIN, UserRoles.ADMIN)
  async assignBranchUser(
    @Param('id') id: string,
    @Body() assignBranchUserDto: AssignBranchUserDto,
    @CurrentUser() currentUser: User,
  ): Promise<ResponseDto<any>> {
    return await this.branchesUsersService.assignBranchUser(
      assignBranchUserDto,
      id,
      currentUser,
    );
  }

  @Post(':id/users/registry')
  @UsePipes(
    new ValidationPipe({
      whitelist: true,
    }),
  )
  @Roles(UserRoles.SUPER_ADMIN, UserRoles.ADMIN, UserRoles.EMPLOYEE)
  @Employees(EmployeeType.MANAGER)
  async registerEmployee(
    @Param('id') id: string,
    @Body() registerEmployeeDto: RegisterEmployeeDto,
    @CurrentUser() currentUser: User,
  ): Promise<ResponseDto<any>> {
    console.log(registerEmployeeDto);
    return await this.branchesUsersService.registerEmployee(
      registerEmployeeDto,
      id,
      currentUser,
    );
  }

  @Put(':id')
  @UsePipes(
    new ValidationPipe({
      skipMissingProperties: true,
    }),
  )
  @Roles(UserRoles.SUPER_ADMIN, UserRoles.ADMIN)
  async modify(
    @Param('id') id: string,
    @Body() modifyBranchDto: ModifyBranchDto,
    @CurrentUser() currentUser: User,
  ): Promise<ResponseDto<Branch>> {
    return await this.service.modify(id, modifyBranchDto, currentUser);
  }
}
