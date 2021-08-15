import {
  IsEmail,
  IsEnum,
  IsMongoId,
  IsOptional,
  IsString,
} from 'class-validator';
import * as mongoose from 'mongoose';
import { UserRoles } from '../schemas/user.schema';

export class RegisterUserDto {
  @IsString()
  readonly firstName: string;

  @IsString()
  readonly lastName: string;

  @IsEmail()
  readonly email: string;

  @IsEnum(UserRoles, { each: true })
  roles: UserRoles[];

  @IsOptional()
  @IsMongoId()
  company: mongoose.Schema.Types.ObjectId;
}

export class UserFiltersDto {
  search: string;

  sortBy: string;

  limit: number;

  skip: number;

  status: string;

  role: string;

  company: string;
}
