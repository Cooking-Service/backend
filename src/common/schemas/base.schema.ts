import { Prop, Schema } from '@nestjs/mongoose';

export enum Status {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  DELETED = 'DELETED',
}

@Schema()
export class Base {
  @Prop()
  createdOn: Date;

  @Prop()
  updatedOn: Date;

  @Prop({
    type: String,
    enum: Status,
  })
  status: string;
}
