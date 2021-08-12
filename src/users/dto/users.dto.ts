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
  readonly name: string;

  @IsString()
  readonly lastName: string;

  @IsEmail()
  readonly email: string;

  @IsOptional()
  @IsEnum(UserRoles, { each: true })
  roles: UserRoles[];

  @IsOptional()
  @IsMongoId()
  company: mongoose.Schema.Types.ObjectId;
}
