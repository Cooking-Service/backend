import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Branch } from 'src/branches/schemas/branch.schema';
import { Base } from 'src/common/schemas/base.schema';
import { User } from 'src/users/schemas/user.schema';

export type TableDocument = Table & mongoose.Document;

@Schema()
export class Table extends Base {
  @Prop()
  name: string;

  @Prop()
  size: number;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Branch',
  })
  branch: Branch;
}

export const TableSchema = SchemaFactory.createForClass(Table);
