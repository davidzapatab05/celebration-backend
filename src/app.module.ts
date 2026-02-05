import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CelebrationModule } from './celebration/celebration.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { OccasionsModule } from './occasions/occasions.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: configService.get<string>('NODE_ENV') !== 'production', // Disable in production
        ssl: configService.get<string>('DB_SSL') === 'true' ? {
          rejectUnauthorized: true,
        } : undefined,
        keepConnectionAlive: true,
        poolSize: 10,
        extra: {
          connectionLimit: 10,
          connectTimeout: 30000, // Reduced from 60s to 30s
          acquireTimeout: 30000,
          timeout: 30000,
          waitForConnections: true,
          queueLimit: 0,
          enableKeepAlive: true,
          keepAliveInitialDelay: 10000, // Send keepalive every 10s
        },
        maxQueryExecutionTime: 10000, // Increased from 5s to 10s
        logging: configService.get<string>('NODE_ENV') !== 'production' ? ['error', 'warn'] : false,
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    UsersModule,
    CelebrationModule,
    OccasionsModule,
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'),
      serveRoot: '/uploads',
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
