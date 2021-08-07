import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Document } from 'mongoose';
import { Branch } from 'src/branches/schemas/branch.schema';
import { User } from 'src/users/schemas/user.schema';
import { EmployeeType } from './employee-type.schema';

export type BranchesUsersDocument = BranchesUsers & Document;

@Schema()
export class BranchesUsers {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Branch',
  })
  branch: Branch;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  })
  user: User;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'EmployeeType',
  })
  employeeType: EmployeeType;
}

export const BranchesUsersSchema = SchemaFactory.createForClass(BranchesUsers);
