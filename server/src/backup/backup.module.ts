import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '@/auth/auth.module';
import { BackupController } from './backup.controller';
import { BackupService } from './backup.service';
import { BackupSettings, BackupSettingsSchema } from './backup-settings.schema';

@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([
      { name: BackupSettings.name, schema: BackupSettingsSchema },
    ]),
  ],
  controllers: [BackupController],
  providers: [BackupService],
  exports: [BackupService],
})
export class BackupModule {}
