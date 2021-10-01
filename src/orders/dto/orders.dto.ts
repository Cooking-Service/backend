import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsMongoId,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class OrderItemDto {
  @IsMongoId()
  product: string;

  @IsOptional()
  @IsString()
  comments: string;
}

export class CreateOrderDto {
  @IsOptional()
  @IsString()
  customer: string;

  @IsOptional()
  @IsMongoId()
  table: string;

  @ArrayNotEmpty()
  @ValidateNested()
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @IsMongoId()
  branch: string;
}
