import { IsEmail, IsEnum, IsString } from 'class-validator';
import { EmployeeType } from '../schemas/branches-users.schema';

export class RegisterEmployeeDto {
  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsEmail()
  email: string;

  @IsEnum(EmployeeType)
  employeeType: EmployeeType;
}
