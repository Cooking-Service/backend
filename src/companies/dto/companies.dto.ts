import { IsString, Length } from 'class-validator';

export class CreateCompanyDto {
  @IsString()
  name: string;

  @IsString()
  @Length(3, 5)
  code: string;
}
