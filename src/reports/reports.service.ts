import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Report, ReportDocument } from './schemas/report.schema';

@Injectable()
export class ReportsService {
  constructor(
    @InjectModel(Report.name) private reportModel: Model<ReportDocument>,
  ) {}
}
