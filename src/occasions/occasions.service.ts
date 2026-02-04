import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Occasion } from '../occasion.entity';

@Injectable()
export class OccasionsService {
  constructor(
    @InjectRepository(Occasion)
    private occasionsRepository: Repository<Occasion>,
  ) {}

  async findAll(): Promise<Occasion[]> {
    return this.occasionsRepository.find({
      where: { isActive: true },
      order: { sortOrder: 'ASC', name: 'ASC' },
    });
  }

  async findBySlug(slug: string): Promise<Occasion | null> {
    return this.occasionsRepository.findOne({
      where: { slug, isActive: true },
    });
  }

  async findById(id: string): Promise<Occasion | null> {
    return this.occasionsRepository.findOne({
      where: { id },
    });
  }
}
