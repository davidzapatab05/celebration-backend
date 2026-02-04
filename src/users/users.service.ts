import {
  Injectable,
  OnModuleInit,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../user.entity';
import { CelebrationService } from '../celebration/celebration.service';

@Injectable()
export class UsersService implements OnModuleInit {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private celebrationService: CelebrationService,
  ) {}

  async onModuleInit() {
    await this.seedAdmin();
  }

  private async seedAdmin() {
    const adminEmail = 'davidzapata.dz051099@gmail.com';
    let user = await this.usersRepository.findOne({
      where: { email: adminEmail },
    });

    if (!user) {
      user = this.usersRepository.create({
        email: adminEmail,
        name: 'Admin',
        role: 'admin',
        status: 'active',
        avatar: 'https://ui-avatars.com/api/?name=Admin',
      });
      await this.usersRepository.save(user);
      console.log('Admin user created');
    } else {
      let updated = false;
      if (user.role !== 'admin') {
        user.role = 'admin';
        updated = true;
      }
      if (user.status !== 'active') {
        user.status = 'active';
        updated = true;
      }
      if (updated) {
        await this.usersRepository.save(user);
        console.log('User promoted to admin/active');
      }
    }
  }

  async findByEmail(email: string): Promise<User | undefined> {
    const user = await this.usersRepository.findOne({ where: { email } });
    return user || undefined;
  }

  async findById(id: string): Promise<User | undefined> {
    const user = await this.usersRepository.findOne({ where: { id } });
    return user || undefined;
  }

  async create(userData: Partial<User>): Promise<User> {
    const user = this.usersRepository.create(userData);
    return this.usersRepository.save(user);
  }

  async update(id: string, userData: Partial<User>): Promise<User> {
    await this.usersRepository.update(id, userData);
    const user = await this.findById(id);
    if (!user) throw new Error('User not found after update');
    return user;
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository
      .createQueryBuilder('user')
      .loadRelationCountAndMap(
        'user.requestsCount',
        'user.celebration_requests',
        'requests',
      )
      .orderBy('user.createdAt', 'DESC')
      .getMany();
  }

  async updateStatus(
    id: string,
    status: string,
    requestingUser: User,
  ): Promise<User> {
    const userToUpdate = await this.usersRepository.findOne({ where: { id } });
    if (!userToUpdate) throw new NotFoundException('User not found');

    // Security: Prevent editing Super Admin
    if (userToUpdate.email === 'davidzapata.dz051099@gmail.com') {
      throw new UnauthorizedException('Cannot modify Super Admin status');
    }

    // Security: Prevent Admin from editing themselves
    if (userToUpdate.id === requestingUser.id) {
      throw new UnauthorizedException('You cannot change your own status');
    }

    userToUpdate.status = status;
    return this.usersRepository.save(userToUpdate);
  }

  async updateRole(
    id: string,
    role: string,
    requestingUser: User,
  ): Promise<User> {
    const userToUpdate = await this.usersRepository.findOne({ where: { id } });
    if (!userToUpdate) throw new NotFoundException('User not found');

    // Security: Prevent editing Super Admin
    if (userToUpdate.email === 'davidzapata.dz051099@gmail.com') {
      throw new UnauthorizedException('Cannot modify Super Admin role');
    }

    // Security: Prevent Admin from editing themselves
    if (userToUpdate.id === requestingUser.id) {
      throw new UnauthorizedException('You cannot change your own role');
    }

    userToUpdate.role = role;
    return this.usersRepository.save(userToUpdate);
  }

  async remove(id: string, requestingUser: User): Promise<void> {
    const userToDelete = await this.usersRepository.findOne({ where: { id } });
    if (!userToDelete) throw new NotFoundException('User not found');

    // Security: Prevent deleting Super Admin
    if (userToDelete.email === 'davidzapata.dz051099@gmail.com') {
      throw new UnauthorizedException('Cannot delete Super Admin');
    }

    // Security: Prevent Admin from deleting themselves
    if (userToDelete.id === requestingUser.id) {
      throw new UnauthorizedException('You cannot delete your own account');
    }

    // Clean up associated data (images and requests)
    await this.celebrationService.deleteByUserId(id);

    // Delete the user
    await this.usersRepository.remove(userToDelete);
  }

  async updateMaxRequests(
    id: string,
    maxRequests: number | null,
  ): Promise<User> {
    const userToUpdate = await this.usersRepository.findOne({ where: { id } });
    if (!userToUpdate) throw new NotFoundException('User not found');

    // Security checks can be added if needed, but only admin calls this.

    userToUpdate.maxRequests = maxRequests;
    return this.usersRepository.save(userToUpdate);
  }
  // Confirm valid admin user to prevent self-deletion if needed,
  // but here we primarily need to protect the Super Admin.
  async deleteSelf(user: User): Promise<void> {
    // Security: ABSOLUTE PROTECTION for Super Admin
    if (user.email === 'davidzapata.dz051099@gmail.com') {
      throw new UnauthorizedException('Super Admin cannot be deleted');
    }

    // Clean up associated data
    await this.celebrationService.deleteByUserId(user.id);

    // Delete the user
    await this.usersRepository.remove(user);
  }
}
