import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OccasionsController } from './occasions.controller';
import { OccasionsService } from './occasions.service';
import { Occasion } from '../occasion.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Occasion])],
  controllers: [OccasionsController],
  providers: [OccasionsService],
  exports: [OccasionsService],
})
export class OccasionsModule {}
