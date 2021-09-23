import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Document } from 'mongoose';
import { Branch } from 'src/branches/schemas/branch.schema';
import { User } from 'src/users/schemas/user.schema';

export enum EmployeeType {
  MANAGER = 'MANAGER',
  CASHER = 'CASHER',
  WAITER = 'WAITER',
  COOK = 'COOK',
}

export type BranchesUsersDocument = BranchesUsers & Document;

@Schema({
  versionKey: false,
})
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
    type: String,
    enum: EmployeeType,
  })
  employeeType: string;
}

export const BranchesUsersSchema = SchemaFactory.createForClass(BranchesUsers);
