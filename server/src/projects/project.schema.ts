import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { BASE_SCHEMA_OPTIONS } from '@/common/database/base-schema.options';

@Schema({ _id: false, versionKey: false })
export class ProjectMediaTranslationFields {
  @Prop()
  alt?: string;
}

export const ProjectMediaTranslationFieldsSchema =
  SchemaFactory.createForClass(ProjectMediaTranslationFields);

@Schema({ _id: false, versionKey: false })
export class ProjectMediaTranslations {
  @Prop({ type: ProjectMediaTranslationFieldsSchema })
  ar?: ProjectMediaTranslationFields;

  @Prop({ type: ProjectMediaTranslationFieldsSchema })
  tr?: ProjectMediaTranslationFields;
}

export const ProjectMediaTranslationsSchema =
  SchemaFactory.createForClass(ProjectMediaTranslations);

@Schema({ _id: false, versionKey: false })
export class ProjectMediaItem {
  @Prop({ required: true, trim: true })
  storage_path!: string;

  @Prop({ trim: true })
  alt?: string;

  @Prop({ default: 0 })
  sort_order!: number;

  @Prop({ type: ProjectMediaTranslationsSchema })
  translations?: ProjectMediaTranslations;
}

export const ProjectMediaItemSchema =
  SchemaFactory.createForClass(ProjectMediaItem);

@Schema({ _id: false, versionKey: false })
export class ProjectTranslationFields {
  @Prop()
  title?: string;

  @Prop()
  subtitle?: string;

  @Prop()
  summary?: string;

  @Prop()
  description?: string;

  @Prop()
  rich_content?: string;

  @Prop()
  status?: string;

  @Prop()
  start_date?: string;

  @Prop()
  end_date?: string;

  @Prop({ type: [String] })
  tags?: string[];

  @Prop({ type: [String] })
  tools?: string[];

  @Prop({ type: [String] })
  outcomes?: string[];
}

export const ProjectTranslationFieldsSchema =
  SchemaFactory.createForClass(ProjectTranslationFields);

@Schema({ _id: false, versionKey: false })
export class ProjectTranslations {
  @Prop({ type: ProjectTranslationFieldsSchema })
  ar?: ProjectTranslationFields;

  @Prop({ type: ProjectTranslationFieldsSchema })
  tr?: ProjectTranslationFields;
}

export const ProjectTranslationsSchema =
  SchemaFactory.createForClass(ProjectTranslations);

export type ProjectDocument = HydratedDocument<Project>;

@Schema({ ...BASE_SCHEMA_OPTIONS, collection: 'projects' })
export class Project {
  @Prop({ required: true, unique: true, trim: true, lowercase: true, index: true })
  slug!: string;

  @Prop({ required: true, trim: true })
  title!: string;

  @Prop({ trim: true })
  subtitle?: string;

  @Prop({ required: true, trim: true })
  summary!: string;

  @Prop({ required: true, trim: true })
  description!: string;

  @Prop({ trim: true })
  rich_content?: string;

  @Prop({ required: true, trim: true })
  status!: string;

  @Prop({ trim: true })
  start_date?: string;

  @Prop({ trim: true })
  end_date?: string;

  @Prop({ type: [String], default: [] })
  tags!: string[];

  @Prop({ type: [String], default: [] })
  tools!: string[];

  @Prop({ type: [String], default: [] })
  outcomes!: string[];

  @Prop({ trim: true })
  repository_url?: string;

  @Prop({ trim: true })
  publication_url?: string;

  @Prop({ default: false, index: true })
  featured!: boolean;

  @Prop({ default: 0, index: true })
  sort_order!: number;

  @Prop({ trim: true })
  imageUrl?: string;

  @Prop({ type: [ProjectMediaItemSchema], default: [] })
  project_media!: ProjectMediaItem[];

  @Prop({ type: ProjectTranslationsSchema })
  translations?: ProjectTranslations;
}

export const ProjectSchema = SchemaFactory.createForClass(Project);
ProjectSchema.index({ sort_order: 1, createdAt: -1 });
ProjectSchema.index({ featured: 1, sort_order: 1 });
