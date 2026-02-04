import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { User } from '../user.entity';

interface RequestWithUser extends Request {
  user: User;
}

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  @UseGuards(AuthGuard('jwt'))
  async getAllUsers(@Req() req: RequestWithUser) {
    if (req.user.role !== 'admin') {
      throw new UnauthorizedException('Admin access required');
    }
    return this.usersService.findAll();
  }

  @Patch(':id/status')
  @UseGuards(AuthGuard('jwt'))
  async updateUserStatus(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
    @Body() body: { status: string },
  ) {
    if (req.user.role !== 'admin') {
      throw new UnauthorizedException('Admin access required');
    }
    return this.usersService.updateStatus(id, body.status, req.user);
  }

  @Patch(':id/role')
  @UseGuards(AuthGuard('jwt'))
  async updateUserRole(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
    @Body() body: { role: string },
  ) {
    if (req.user.role !== 'admin') {
      throw new UnauthorizedException('Admin access required');
    }
    return this.usersService.updateRole(id, body.role, req.user);
  }

  @Patch(':id/max-requests')
  @UseGuards(AuthGuard('jwt'))
  async updateMaxRequests(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
    @Body() body: { maxRequests: number | null },
  ) {
    if (req.user.role !== 'admin') {
      throw new UnauthorizedException('Admin access required');
    }
    return this.usersService.updateMaxRequests(id, body.maxRequests);
  }

  @Delete('me')
  @UseGuards(AuthGuard('jwt'))
  async deleteSelf(@Req() req: RequestWithUser) {
    return this.usersService.deleteSelf(req.user);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  async deleteUser(@Req() req: RequestWithUser, @Param('id') id: string) {
    if (req.user.role !== 'admin') {
      throw new UnauthorizedException('Admin access required');
    }
    return this.usersService.remove(id, req.user);
  }
}
