import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import type { HydratedDocument } from 'mongoose';
import { BASE_SCHEMA_OPTIONS } from '@/common/database/base-schema.options';

@Schema({ _id: false, versionKey: false })
export class AchievementTranslationFields {
  @Prop({ trim: true })
  badge?: string;

  @Prop({ trim: true })
  title?: string;

  @Prop({ trim: true })
  summary?: string;

  @Prop({ trim: true })
  details?: string;

  @Prop({ trim: true })
  organization?: string;

  @Prop({ trim: true })
  location?: string;
}

export const AchievementTranslationFieldsSchema = SchemaFactory.createForClass(
  AchievementTranslationFields,
);

@Schema({ _id: false, versionKey: false })
export class AchievementTranslations {
  @Prop({ type: AchievementTranslationFieldsSchema })
  ar?: AchievementTranslationFields;

  @Prop({ type: AchievementTranslationFieldsSchema })
  tr?: AchievementTranslationFields;
}

export const AchievementTranslationsSchema = SchemaFactory.createForClass(
  AchievementTranslations,
);

export type AchievementDocument = HydratedDocument<Achievement>;

@Schema({ ...BASE_SCHEMA_OPTIONS, collection: 'achievements' })
export class Achievement {
  @Prop({ required: true, unique: true, trim: true, lowercase: true, index: true })
  slug!: string;

  @Prop({ trim: true, default: '' })
  badge!: string;

  @Prop({ required: true, trim: true })
  title!: string;

  @Prop({ required: true, trim: true })
  summary!: string;

  @Prop({ trim: true })
  details?: string;

  @Prop({ trim: true })
  date?: string;

  @Prop({ trim: true })
  organization?: string;

  @Prop({ trim: true })
  location?: string;

  @Prop({ trim: true })
  project_slug?: string;

  @Prop({ trim: true })
  image_url?: string;

  @Prop({ default: false, index: true })
  featured!: boolean;

  @Prop({ default: 0, index: true })
  sort_order!: number;

  @Prop({ type: AchievementTranslationsSchema })
  translations?: AchievementTranslations;
}

export const AchievementSchema = SchemaFactory.createForClass(Achievement);
AchievementSchema.index({ sort_order: 1, createdAt: -1 });
