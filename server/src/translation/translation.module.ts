import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '@/auth/auth.module';
import { TranslationController } from './translation.controller';
import { TranslationService } from './translation.service';
import {
  TranslationSettings,
  TranslationSettingsSchema,
} from './translation-settings.schema';

@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([
      { name: TranslationSettings.name, schema: TranslationSettingsSchema },
    ]),
  ],
  controllers: [TranslationController],
  providers: [TranslationService],
  exports: [TranslationService],
})
export class TranslationModule {}
