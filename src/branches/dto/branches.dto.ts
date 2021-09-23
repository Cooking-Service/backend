import {
  IsEnum,
  IsLatitude,
  IsLongitude,
  IsMongoId,
  IsOptional,
  IsString,
} from 'class-validator';
import { EmployeeType } from 'src/branches-users/schemas/branches-users.schema';
import { FilterDto } from 'src/common/dto/base-filter.dto';
import { Status } from 'src/common/schemas/base.schema';

export class CreateBranchDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsMongoId()
  company: string;

  @IsOptional()
  @IsLatitude()
  latitude: string;

  @IsOptional()
  @IsLongitude()
  longitude: string;
}

export class BranchFiltersDto extends FilterDto {
  company: string;
}

export class ModifyBranchDto {
  @IsString()
  name: string;

  @IsLatitude()
  latitude: string;

  @IsLongitude()
  longitude: string;

  @IsEnum([Status.ACTIVE, Status.INACTIVE])
  status: string;
}

export class AssignBranchUserDto {
  @IsMongoId()
  user: string;

  @IsEnum(EmployeeType)
  employeeType: string;
}
