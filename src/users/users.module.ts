import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas/user.schema';
import { CompaniesModule } from 'src/companies/companies.module';
import { UserHashSchema, UserHash } from './schemas/user-hash.schema';
import { UsersHashesService } from './users-hashes.service';

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
