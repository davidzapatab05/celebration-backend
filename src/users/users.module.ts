import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user.entity';

import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { CelebrationModule } from '../celebration/celebration.module';

@Module({
  imports: [TypeOrmModule.forFeature([User]), CelebrationModule],
  providers: [UsersService],
  exports: [UsersService],
  controllers: [UsersController],
})
export class UsersModule {}
