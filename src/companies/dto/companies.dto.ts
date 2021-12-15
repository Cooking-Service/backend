import { IsString, Length } from 'class-validator';
import { FilterDto } from 'src/common/dto/base-filter.dto';

export class CreateCompanyDto {
  @IsString()
  name: string;

  @IsString()
  @Length(3, 5)
  code: string;
}

export class ComapnyFiltersDto extends FilterDto {}
