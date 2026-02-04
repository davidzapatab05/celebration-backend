import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Occasion } from './occasion.entity';

@Entity('celebration_request')
export class CelebrationRequest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  user: User;

  @Column()
  partnerName: string;

  @Column({ type: 'text', nullable: true })
  message: string;

  @Column({ unique: true })
  slug: string;

  @Column({ default: 'pending' }) // pending, accepted, rejected
  response: string;

  @Column({ default: 'te_amo' }) // 'te_amo' or 'te_quiero'
  affectionLevel: string;

  @Column({ type: 'varchar', nullable: true })
  imagePath: string | null;

  @ManyToOne(() => Occasion, (occasion) => occasion.celebrationRequests, {
    nullable: true,
  })
  occasion: Occasion;

  @Column({ type: 'json', nullable: true })
  extraData: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;
}
