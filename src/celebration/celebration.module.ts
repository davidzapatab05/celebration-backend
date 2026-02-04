import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CelebrationRequest } from '../celebration-request.entity';
import { Occasion } from '../occasion.entity';
import { CelebrationService } from './celebration.service';
import { CelebrationController } from './celebration.controller';

@Module({
  imports: [TypeOrmModule.forFeature([CelebrationRequest, Occasion])],
  providers: [CelebrationService],
  controllers: [CelebrationController],
  exports: [CelebrationService],
})
export class CelebrationModule {}
