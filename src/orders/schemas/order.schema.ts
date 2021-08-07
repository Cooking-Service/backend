import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Branch } from 'src/branches/schemas/branch.schema';
import { Table } from 'src/tables/schemas/table.schema';
import { User } from 'src/users/schemas/user.schema';
import { OrderItem } from './order-item.schema';

export type OrderDocument = Order & mongoose.Document;

export enum OrdersStatuses {
  OPEN = 'OPEN',
  COOKING = 'COOKING',
  PENDING = 'PENDING',
  CLOSED = 'CLOSED',
  CANCELLED = ' CANCELLED',
}

@Schema()
export class Order {
  @Prop()
  customer: string;

  @Prop()
  total: number;

  @Prop({
    type: String,
    enum: OrdersStatuses,
    default: OrdersStatuses.OPEN,
  })
  status: string;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Table',
  })
  table: Table;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Branch',
  })
  branch: Branch;

  @Prop({
    type: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'OrderItem',
      },
    ],
  })
  items: OrderItem[];

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  })
  createdBy: User;

  @Prop()
  createdOn: Date;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  })
  cookedBy: User;

  @Prop()
  cookedOn: Date;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  })
  chargedBy: User;

  @Prop()
  chargedOn: Date;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
