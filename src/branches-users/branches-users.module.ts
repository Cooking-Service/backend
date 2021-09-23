import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BranchesModule } from 'src/branches/branches.module';
import { UsersModule } from 'src/users/users.module';
import { BranchesUsersService } from './branches-users.service';
import {
  BranchesUsers,
  BranchesUsersSchema,
} from './schemas/branches-users.schema';

@Module({
  imports: [
    UsersModule,
    forwardRef(() => BranchesModule),
    MongooseModule.forFeature([
      {
        name: BranchesUsers.name,
        schema: BranchesUsersSchema,
      },
    ]),
  ],
  providers: [BranchesUsersService],
  exports: [BranchesUsersService],
})
export class BranchesUsersModule {}
