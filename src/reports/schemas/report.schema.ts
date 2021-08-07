import { Prop, Schema } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Branch } from 'src/branches/schemas/branch.schema';
import { User } from 'src/users/schemas/user.schema';

export type ReportDocument = Report & Document;

export enum ReportsStatuses {
  PENDING = 'PENDING',
  VIEWED = 'VIEWED',
}

@Schema()
export class Report {
  @Prop()
  report: string;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Branch',
  })
  branch: Branch;

  @Prop({
    type: String,
    enum: ReportsStatuses,
    default: ReportsStatuses.PENDING,
  })
  status: string;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  })
  createdBy: User;

  @Prop()
  createdOn: Date;
}
