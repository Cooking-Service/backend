import { Module } from '@nestjs/common';
import { BranchesUsersService } from './branches-users.service';
import { EmployeeTypeService } from './employee-type.service';

@Module({
  providers: [BranchesUsersService, EmployeeTypeService],
  exports: [BranchesUsersService],
})
export class BranchesUsersModule {}
