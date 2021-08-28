import { Injectable } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import * as mongoose from 'mongoose';
import { Model } from 'mongoose';
import { ResponseDto } from 'src/common/dto/response.dto';
import {
  HashType,
  UserHash,
  UserHashDocument,
} from './schemas/user-hash.schema';
import { User } from './schemas/user.schema';

@Injectable()
export class UsersHashesService {
  constructor(
    @InjectModel(UserHash.name) private userHashModel: Model<UserHashDocument>,
    @InjectConnection() private connection: mongoose.Connection,
  ) {}

  async generateHash(
    user: User,
    type: HashType,
    session?: mongoose.ClientSession,
  ): Promise<ResponseDto<UserHashDocument>> {
    const userhash = new this.userHashModel();

    userhash.hash = bcrypt.hashSync(user.email, 10);
    userhash.createdOn = new Date();
    userhash.user = user;
    userhash.type = type;

    return {
      success: true,
      response: await userhash.save({ session }),
    };
  }

  async verifyHash(
    hash: string,
    type: HashType,
    session?: mongoose.ClientSession,
  ): Promise<ResponseDto<UserHash>> {
    const userHash = await this.userHashModel
      .findOne({ hash })
      .populate({ path: 'user', select: { username: 1 } });

    if (!userHash || userHash.type !== type || userHash.usedOn) {
      return {
        success: false,
      };
    }

    userHash.usedOn = new Date();

    return {
      success: true,
      response: await userHash.save({ session }),
    };
  }
}
