import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  UseGuards,
  Req,
  Delete,
  Patch,
  UseInterceptors,
  UploadedFile,
  UnauthorizedException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { join } from 'path';
import sharp from 'sharp';
import { CelebrationService } from './celebration.service';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { User } from '../user.entity';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import * as Multer from 'multer';

interface RequestWithUser extends Request {
  user: User;
}

import * as fs from 'fs';

@Controller('celebration')
export class CelebrationController {
  constructor(private celebrationService: CelebrationService) { }

  @Post()
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(
    FileInterceptor('image', {
      storage: memoryStorage(), // Store in memory first to process
    }),
  )
  async createRequest(
    @Req() req: RequestWithUser,
    @Body()
    body: {
      partnerName: string;
      message?: string;
      affectionLevel?: string;
      occasionId?: string;
    },
    @UploadedFile() file: Express.Multer.File,
  ) {
    let imagePath: string | undefined;

    if (file) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const filename = `celebration-${uniqueSuffix}.webp`;

      const buffer = await sharp(file.buffer)
        .resize(800, 800, { fit: 'inside', withoutEnlargement: true }) // Optimize size
        .webp({ quality: 80 }) // Convert to WebP
        .toBuffer();

      imagePath = await this.celebrationService.uploadImage(buffer, filename);
    }

    return this.celebrationService.create(req.user, { ...body, imagePath });
  }

  @Get('admin/all')
  @UseGuards(AuthGuard('jwt'))
  async getAllRequests(@Req() req: RequestWithUser) {
    if (req.user.role !== 'admin') {
      throw new UnauthorizedException('Admin access required');
    }
    return this.celebrationService.findAllAdmin();
  }

  @Get('admin/user/:userId')
  @UseGuards(AuthGuard('jwt'))
  async getRequestsByUser(
    @Req() req: RequestWithUser,
    @Param('userId') userId: string,
  ) {
    if (req.user.role !== 'admin') {
      throw new UnauthorizedException('Admin access required');
    }
    return this.celebrationService.findAllByUserAdmin(userId);
  }

  @Delete('admin/:id')
  @UseGuards(AuthGuard('jwt'))
  async deleteRequestAdmin(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
  ) {
    if (req.user.role !== 'admin') {
      throw new UnauthorizedException('Admin access required');
    }
    return this.celebrationService.deleteAdmin(id);
  }

  @Get('mine/custom-all')
  @UseGuards(AuthGuard('jwt'))
  async getMyRequests(@Req() req: RequestWithUser) {
    return this.celebrationService.findAll(req.user);
  }

  @Get('slug/:slug')
  async getRequest(@Param('slug') slug: string) {
    return this.celebrationService.findBySlug(slug);
  }

  @Patch('slug/:slug/response')
  async updateResponse(
    @Param('slug') slug: string,
    @Body() body: { response: string },
  ) {
    return this.celebrationService.updateResponse(slug, body.response);
  }

  @Delete(':id/delete') // Keeping the suffix as per frontend logic, but using Delete method. Wait, frontend uses POST. Let's align. Frontend uses POST request.
  @UseGuards(AuthGuard('jwt'))
  async deleteRequest(@Req() req: RequestWithUser, @Param('id') id: string) {
    return this.celebrationService.delete(id, req.user);
  }

  // Changing to POST for delete to match frontend unless I change frontend to DELETE.
  // Frontend code: await axios.post(`${backendUrl}/celebration/${id}/delete`...
  // So I should keep it as POST to be safe or change both. Let's stick to POST for delete for now to minimize frontend changes, OR better: DO IT RIGHT.
  // I will change frontend to DELETE :id and backend to @Delete(':id'). Standard is better.
  // But my frontend code at step 378 used POST.
  // I will upgrade backend to support what I want (RESTful) and then update frontend.
  // Actually, let's look at the backend replacement content.

  @Post(':id/delete')
  @UseGuards(AuthGuard('jwt'))
  async deleteRequestPost(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
  ) {
    return this.celebrationService.delete(id, req.user);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(
    FileInterceptor('image', {
      storage: memoryStorage(),
    }),
  )
  async updateRequest(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
    @Body()
    body: {
      partnerName?: string;
      message?: string;
      affectionLevel?: string;
      occasionId?: string;
      deleteImage?: string;
      extraData?: any;
    },
    @UploadedFile() file: Express.Multer.File,
  ) {
    let imagePath: string | undefined;

    if (file) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const filename = `celebration-edit-${uniqueSuffix}.webp`;

      const buffer = await sharp(file.buffer)
        .resize(800, 800, { fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 80 })
        .toBuffer();

      imagePath = await this.celebrationService.uploadImage(buffer, filename);
    }

    const deleteImg = body.deleteImage === 'true';

    return this.celebrationService.update(
      id,
      {
        partnerName: body.partnerName,
        message: body.message,
        affectionLevel: body.affectionLevel,
        imagePath,
        deleteImage: deleteImg,
        extraData: body.extraData ? JSON.parse(body.extraData) : undefined,
        occasionId: body.occasionId,
      },
      req.user,
    );
  }
}
