import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Branch } from 'src/branches/schemas/branch.schema';
import { EmployeeType, OrdersStatuses } from 'src/common/types/enums';

export type EmployeePermissionDocument = EmployeePermission & mongoose.Document;

@Schema({
  versionKey: false,
})
export class EmployeePermission {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Branch',
  })
  branch: Branch;

  @Prop({
    type: String,
    enum: EmployeeType,
  })
  employeeType: string;

  @Prop({
    type: [String],
    enum: OrdersStatuses,
  })
  orderStatuses: OrdersStatuses[];
}

export const EmployeePermissionSchema =
  SchemaFactory.createForClass(EmployeePermission);
