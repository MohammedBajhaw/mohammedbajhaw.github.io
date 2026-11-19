import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import type { HydratedDocument } from 'mongoose';
import { BASE_SCHEMA_OPTIONS } from '@/common/database/base-schema.options';

export type PlatformSettingsDocument = HydratedDocument<PlatformSettings>;

@Schema({ _id: false, versionKey: false })
export class PlatformSettingsTranslationFields {
  @Prop({ trim: true })
  siteName?: string;

  @Prop({ trim: true })
  siteTagline?: string;

  @Prop({ trim: true })
  seoTitle?: string;

  @Prop({ trim: true })
  seoDescription?: string;

  @Prop({ trim: true })
  maintenanceTitle?: string;

  @Prop({ trim: true })
  maintenanceMessage?: string;
}

export const PlatformSettingsTranslationFieldsSchema = SchemaFactory.createForClass(
  PlatformSettingsTranslationFields,
);

@Schema({ _id: false, versionKey: false })
export class PlatformSettingsTranslations {
  @Prop({ type: PlatformSettingsTranslationFieldsSchema })
  ar?: PlatformSettingsTranslationFields;

  @Prop({ type: PlatformSettingsTranslationFieldsSchema })
  tr?: PlatformSettingsTranslationFields;
}

export const PlatformSettingsTranslationsSchema = SchemaFactory.createForClass(
  PlatformSettingsTranslations,
);

@Schema({ _id: false, versionKey: false })
export class MaintenanceSettings {
  @Prop({ default: false })
  enabled!: boolean;

  @Prop({ trim: true, default: 'Scheduled Maintenance' })
  title!: string;

  @Prop({
    trim: true,
    default: 'The platform is currently undergoing scheduled maintenance. Please check back shortly.',
  })
  message!: string;

  @Prop({ trim: true })
  estimatedReturnAt?: string;

  @Prop({ default: true })
  allowAdminBypass!: boolean;
}

export const MaintenanceSettingsSchema = SchemaFactory.createForClass(MaintenanceSettings);

@Schema({ _id: false, versionKey: false })
export class FeatureFlagsSettings {
  @Prop({ default: true })
  contactFormEnabled!: boolean;

  @Prop({ default: true })
  projectsEnabled!: boolean;

  @Prop({ default: true })
  publicationsEnabled!: boolean;

  @Prop({ default: true })
  servicesEnabled!: boolean;
}

export const FeatureFlagsSettingsSchema = SchemaFactory.createForClass(FeatureFlagsSettings);

@Schema({ _id: false, versionKey: false })
export class SeoSettings {
  @Prop({ trim: true, default: 'Mohammed Bajhaw — Engineering Portfolio' })
  defaultTitle!: string;

  @Prop({
    trim: true,
    default: 'Robotics, AI, and Control Systems Engineering Portfolio.',
  })
  defaultDescription!: string;

  @Prop({ trim: true })
  ogImageUrl?: string;
}

export const SeoSettingsSchema = SchemaFactory.createForClass(SeoSettings);

@Schema({ ...BASE_SCHEMA_OPTIONS, collection: 'platform_settings' })
export class PlatformSettings {
  @Prop({ required: true, unique: true, default: 'default' })
  key!: string;

  @Prop({ required: true, trim: true, default: 'Mohammed Bajhaw' })
  siteName!: string;

  @Prop({
    trim: true,
    default: 'Robotics, AI & Control Engineering Portfolio',
  })
  siteTagline!: string;

  @Prop({ enum: ['en', 'ar', 'tr'], default: 'en' })
  defaultLanguage!: 'en' | 'ar' | 'tr';

  @Prop({ trim: true })
  logoUrl?: string;

  @Prop({ trim: true })
  faviconUrl?: string;

  @Prop({ type: SeoSettingsSchema, default: () => ({}) })
  seo!: SeoSettings;

  @Prop({ type: FeatureFlagsSettingsSchema, default: () => ({}) })
  features!: FeatureFlagsSettings;

  @Prop({ type: MaintenanceSettingsSchema, default: () => ({}) })
  maintenance!: MaintenanceSettings;

  @Prop({ type: PlatformSettingsTranslationsSchema })
  translations?: PlatformSettingsTranslations;
}

export const PlatformSettingsSchema = SchemaFactory.createForClass(PlatformSettings);
