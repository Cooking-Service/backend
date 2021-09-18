import {
  IsLatitude,
  IsLongitude,
  IsMongoId,
  IsOptional,
  IsString,
} from 'class-validator';
import { FilterDto } from 'src/common/dto/base-filter.dto';

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
