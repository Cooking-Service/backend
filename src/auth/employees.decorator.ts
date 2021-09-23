import { SetMetadata } from '@nestjs/common';
import { EmployeeType } from 'src/branches-users/schemas/branches-users.schema';

export const EMPLOYEES_KEY = 'employees';
export const Employees = (...employees: EmployeeType[]) =>
  SetMetadata(EMPLOYEES_KEY, employees);
