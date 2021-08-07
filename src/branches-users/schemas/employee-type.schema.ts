import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { User } from 'src/users/schemas/user.schema';
import * as mongoose from 'mongoose';
import { Document } from 'mongoose';
import { Base } from 'src/common/schemas/base.schema';

export type EmployeeTypeDocument = EmployeeType & Document;

@Schema()
export class EmployeeType extends Base {
  @Prop({
    unique: true,
  })
  type: string;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  })
  createdBy: User;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  })
  updatedBy: User;
}

export const EmployeeTypeSchema = SchemaFactory.createForClass(EmployeeType);
