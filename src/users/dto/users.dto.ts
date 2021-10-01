import {
  IsEmail,
  IsEnum,
  IsMongoId,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import * as mongoose from 'mongoose';
import { UserRoles, UserStatus } from '../schemas/user.schema';

export enum GroupsValidation {
  PROFILE = 'PROFILE',
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  EMPLOYEE = 'EMPLOYEE',
  FROM_BRANCH = 'FROM_BRANCH',
}

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

export class ModifyUserDto {
  @IsString({ always: true })
  readonly firstName: string;

  @IsString({ always: true })
  readonly lastName: string;

  @IsEmail()
  email: string;

  @IsEnum([UserStatus.ACTIVE, UserStatus.INACTIVE], {
    groups: [GroupsValidation.SUPER_ADMIN, GroupsValidation.ADMIN],
  })
  status: string;

  @IsEnum(UserRoles, {
    each: true,
    groups: [GroupsValidation.SUPER_ADMIN, GroupsValidation.ADMIN],
  })
  roles: UserRoles[];

  @IsMongoId({ groups: [GroupsValidation.SUPER_ADMIN] })
  company: mongoose.Schema.Types.ObjectId;
}

export class ModifyPasswordDto {
  @IsString()
  readonly currentPassword: string;

  @MinLength(8)
  readonly newPassword: string;
}

// used to activate account and reset password.
export class ActivateAccountDto {
  @IsString()
  token: string;

  @MinLength(8)
  readonly password: string;
}
