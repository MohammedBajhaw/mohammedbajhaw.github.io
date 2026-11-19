import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { MongooseModule } from '@nestjs/mongoose';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import mongoose from 'mongoose';
import { AuditModule } from './audit/audit.module';
import { AuthModule } from './auth/auth.module';
import { BackupModule } from './backup/backup.module';
import { EnvConfig, validateEnv } from './common/config/env.validation';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { SecuritySanitizeMiddleware } from './common/middleware/security-sanitize.middleware';
import { HealthModule } from './health/health.module';
import { ProfileModule } from './profile/profile.module';
import { ProjectsModule } from './projects/projects.module';
import { PublicationsModule } from './publications/publications.module';
import { ServicesModule } from './services/services.module';
import { SettingsModule } from './settings/settings.module';
import { TranslationModule } from './translation/translation.module';
import { UploadsModule } from './uploads/uploads.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
      validate: validateEnv,
    }),
    ThrottlerModule.forRoot([
      {
        name: 'default',
        ttl: 60_000,
        limit: 120,
      },
    ]),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService<EnvConfig, true>) => {
        mongoose.set('sanitizeFilter', true);
        mongoose.set('strictQuery', true);
        return {
          uri: config.get('MONGODB_URI', { infer: true }),
          serverSelectionTimeoutMS: 5000,
        };
      },
    }),
    AuditModule,
    AuthModule,
    BackupModule,
    HealthModule,
    ProfileModule,
    ProjectsModule,
    PublicationsModule,
    ServicesModule,
    SettingsModule,
    TranslationModule,
    UploadsModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(SecuritySanitizeMiddleware).forRoutes('{*path}');
  }
}
