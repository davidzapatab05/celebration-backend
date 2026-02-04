import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { CelebrationRequest } from './celebration-request.entity';

@Entity()
export class Occasion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 100, unique: true })
  slug: string;

  @Column({ length: 50 })
  icon: string;

  @Column({ length: 20 })
  primaryColor: string;

  @Column({ length: 20, nullable: true })
  secondaryColor: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: 0 })
  sortOrder: number;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => CelebrationRequest, (request) => request.occasion)
  celebrationRequests: CelebrationRequest[];
}
