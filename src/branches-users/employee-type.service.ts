import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
    EmployeeType,
    EmployeeTypeDocument
} from './schemas/employee-type.schema';

@Injectable()
export class EmployeeTypeService {
  constructor(
    @InjectModel(EmployeeType.name)
    private employeeTypeModel: Model<EmployeeTypeDocument>,
  ) {}
}
