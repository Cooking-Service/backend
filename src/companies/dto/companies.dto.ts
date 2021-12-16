import { IsEnum, IsString, Length } from 'class-validator';
import { FilterDto } from 'src/common/dto/base-filter.dto';
import { Status } from 'src/common/types/enums';

export class CreateCompanyDto {
  @IsString()
  name: string;

  @IsString()
  @Length(3, 5)
  code: string;
}

export class ComapnyFiltersDto extends FilterDto {}

export class ModifyCompanyDto {
  @IsString()
  name: string;

  @IsEnum([Status.ACTIVE, Status.INACTIVE])
  status: string;
}
