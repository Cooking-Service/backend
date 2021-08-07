import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  BranchesUsers,
  BranchesUsersDocument,
} from './schemas/branches-users.schema';

@Injectable()
export class BranchesUsersService {
  constructor(
    @InjectModel(BranchesUsers.name)
    private branchesUsersModel: Model<BranchesUsersDocument>,
  ) {}
}
