import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CelebrationRequest } from '../celebration-request.entity';
import { User } from '../user.entity';
import { Occasion } from '../occasion.entity';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import { join } from 'path';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

@Injectable()
export class CelebrationService {
  private s3Client: S3Client;
  private useR2 = false;

  constructor(
    @InjectRepository(CelebrationRequest)
    private celebrationRepository: Repository<CelebrationRequest>,
    @InjectRepository(Occasion)
    private occasionRepository: Repository<Occasion>,
  ) {
    if (process.env.R2_ACCOUNT_ID && process.env.R2_ACCESS_KEY_ID) {
      this.useR2 = true;
      this.s3Client = new S3Client({
        region: 'auto',
        endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
        credentials: {
          accessKeyId: process.env.R2_ACCESS_KEY_ID,
          secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
        },
      });
    }
  }

  async uploadImage(buffer: Buffer, filename: string): Promise<string> {
    if (this.useR2) {
      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: process.env.R2_BUCKET_NAME,
          Key: filename,
          Body: buffer,
          ContentType: 'image/webp',
        }),
      );
      return `${process.env.R2_PUBLIC_URL}/${filename}`;
    } else {
      // Local Fallback
      const uploadDir = join(process.cwd(), 'uploads');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      const filepath = join(uploadDir, filename);
      fs.writeFileSync(filepath, buffer);
      return `/uploads/${filename}`;
    }
  }

  private async deleteFile(imagePath: string) {
    if (!imagePath) return;
    try {
      const filename = imagePath.split('/').pop();
      if (!filename) return;

      if (this.useR2 && imagePath.startsWith('http')) {
        await this.s3Client.send(
          new DeleteObjectCommand({
            Bucket: process.env.R2_BUCKET_NAME,
            Key: filename,
          }),
        );
      } else {
        const uploadDir = join(__dirname, '..', '..', 'uploads');
        const filepath = join(uploadDir, filename);
        if (fs.existsSync(filepath)) {
          fs.unlinkSync(filepath);
        }
      }
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  }

  async create(
    user: User,
    data: {
      partnerName: string;
      message?: string;
      affectionLevel?: string;
      imagePath?: string | null;
      occasionId?: string;
    },
  ): Promise<CelebrationRequest> {
    // Admins have no limits
    if (user.role !== 'admin' && user.maxRequests !== null) {
      const count = await this.celebrationRepository.count({
        where: { user: { id: user.id } },
      });

      if (count >= user.maxRequests) {
        throw new BadRequestException(
          'Has alcanzado el límite máximo de solicitudes permitidas.',
        );
      }
    }

    let occasion: Occasion | null = null;
    if (data.occasionId) {
      occasion = await this.occasionRepository.findOne({
        where: { id: data.occasionId },
      });
    }

    const slug = uuidv4();
    const request = this.celebrationRepository.create({
      user,
      partnerName: data.partnerName,
      message: data.message,
      affectionLevel: data.affectionLevel || 'te_amo',
      imagePath: data.imagePath || null,
      occasion: occasion || undefined,
      slug,
    });
    return this.celebrationRepository.save(request);
  }

  async findBySlug(slug: string): Promise<CelebrationRequest> {
    const request = await this.celebrationRepository.findOne({
      where: { slug },
      relations: ['user', 'occasion'],
    });
    if (!request) throw new NotFoundException('Celebration request not found');
    return request;
  }

  async updateResponse(
    slug: string,
    response: string,
  ): Promise<CelebrationRequest> {
    const request = await this.findBySlug(slug);
    request.response = response;
    return this.celebrationRepository.save(request);
  }

  async findAll(user: User): Promise<CelebrationRequest[]> {
    return this.celebrationRepository.find({
      where: { user: { id: user.id } },
      relations: ['occasion'],
      order: { createdAt: 'DESC' },
    });
  }

  async findAllAdmin(): Promise<CelebrationRequest[]> {
    return this.celebrationRepository.find({
      relations: ['user', 'occasion'],
      order: { createdAt: 'DESC' },
    });
  }

  async findAllByUserAdmin(userId: string): Promise<CelebrationRequest[]> {
    return this.celebrationRepository.find({
      where: { user: { id: userId } },
      relations: ['occasion'],
      order: { createdAt: 'DESC' },
    });
  }

  async deleteByUserId(userId: string): Promise<void> {
    const requests = await this.celebrationRepository.find({
      where: { user: { id: userId } },
    });

    if (requests.length > 0) {
      console.log(
        `🧹 Limpiando ${requests.length} solicitudes del usuario ${userId}...`,
      );
      for (const request of requests) {
        if (request.imagePath) {
          console.log(`📸 Eliminando imagen: ${request.imagePath}`);
          this.deleteFile(request.imagePath);
        }
      }
      await this.celebrationRepository.remove(requests);
      console.log(
        `✅ Registro de solicitudes del usuario ${userId} eliminado.`,
      );
    }
  }

  async deleteAdmin(id: string): Promise<void> {
    const request = await this.celebrationRepository.findOne({ where: { id } });
    if (!request) throw new NotFoundException('Request not found');
    if (request.imagePath) this.deleteFile(request.imagePath);
    await this.celebrationRepository.remove(request);
  }

  async delete(id: string, user: User): Promise<void> {
    const request = await this.celebrationRepository.findOne({
      where: { id, user: { id: user.id } },
    });
    if (!request)
      throw new NotFoundException('Request not found or not authorized');
    if (request.imagePath) this.deleteFile(request.imagePath);
    await this.celebrationRepository.remove(request);
  }

  async update(
    id: string,
    updates: {
      partnerName?: string;
      message?: string;
      affectionLevel?: string;
      imagePath?: string | null;
      occasionId?: string;
      deleteImage?: boolean;
      extraData?: any;
    },
    user: User,
  ): Promise<CelebrationRequest> {
    const where =
      user.role === 'admin' ? { id } : { id, user: { id: user.id } };
    const request = await this.celebrationRepository.findOne({ where });
    if (!request)
      throw new NotFoundException('Request not found or not authorized');

    if (updates.partnerName) request.partnerName = updates.partnerName;
    if (updates.message !== undefined) request.message = updates.message;
    if (updates.affectionLevel) request.affectionLevel = updates.affectionLevel;

    if (updates.occasionId) {
      const occasion = await this.occasionRepository.findOne({
        where: { id: updates.occasionId },
      });
      if (occasion) request.occasion = occasion;
    }

    if (updates.imagePath) {
      // If updating with a new image, delete the old one
      if (request.imagePath && request.imagePath !== updates.imagePath) {
        this.deleteFile(request.imagePath);
      }
      request.imagePath = updates.imagePath;
    } else if (updates.deleteImage) {
      if (request.imagePath) {
        this.deleteFile(request.imagePath);
      }
      request.imagePath = null;
    }

    if (updates.extraData) {
      request.extraData = { ...request.extraData, ...updates.extraData };
    }

    return this.celebrationRepository.save(request);
  }
}
