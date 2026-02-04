import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { CelebrationRequest } from './celebration-request.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  googleId: string;

  @Column()
  name: string;

  @Column({ default: 'user' })
  role: string;

  @Column({ nullable: true })
  avatar: string;

  @Column({ default: 'inactive' })
  status: string;

  @Column({ type: 'int', nullable: true, default: 3 })
  maxRequests: number | null;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => CelebrationRequest, (celebration) => celebration.user)
  celebration_requests: CelebrationRequest[];
}
