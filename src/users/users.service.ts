import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RegisterUserDto } from './dto/users.dto';
import { User, UserDocument } from './schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async find(): Promise<ResponseDto<User[]>> {
    const user = await this.userModel.find().exec();
    console.log(user);
    return {
      success: true,
      response: user,
    };
  }

  async findByEmail(email: string): Promise<User> {
    const user = await this.userModel.findOne({ email });

    return user;
  }

  async findByUsername(username: string): Promise<User> {
    const user = await this.userModel.findOne({ username });

    return user;
  }

  async getUserRoles(id: number): Promise<string[]> {
    const user = await this.userModel.findById(id);
    return user.roles;
  }

  async create(registerUserDto: RegisterUserDto): Promise<ResponseDto<User>> {
    const newUser = new this.userModel(registerUserDto);

    newUser.createdOn = new Date();

    const user = await newUser.save();

    return {
      success: true,
      response: user,
    };
  }
}
