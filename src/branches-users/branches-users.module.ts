import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BranchesUsersService } from './branches-users.service';
import { EmployeeTypeService } from './employee-type.service';
import {
  BranchesUsers,
  BranchesUsersSchema
} from './schemas/branches-users.schema';
import {
  EmployeeType,
  EmployeeTypeSchema
} from './schemas/employee-type.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: BranchesUsers.name,
        schema: BranchesUsersSchema,
      },
      {
        name: EmployeeType.name,
        schema: EmployeeTypeSchema,
      },
    ]),
  ],
  providers: [BranchesUsersService, EmployeeTypeService],
  exports: [BranchesUsersService],
})
export class BranchesUsersModule {}
