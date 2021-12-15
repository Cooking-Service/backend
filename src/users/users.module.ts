import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CompaniesModule } from 'src/companies/companies.module';
import { UserHash, UserHashSchema } from './schemas/user-hash.schema';
import { User, UserSchema } from './schemas/user.schema';
import { UsersHashesService } from './users-hashes.service';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [
    CompaniesModule,
    MongooseModule.forFeature([
      {
        name: User.name,
        schema: UserSchema,
      },
      {
        name: UserHash.name,
        schema: UserHashSchema,
      },
    ]),
  ],
  providers: [UsersService, UsersHashesService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
