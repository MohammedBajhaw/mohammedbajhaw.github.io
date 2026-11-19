import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { BASE_SCHEMA_OPTIONS } from '@/common/database/base-schema.options';

@Schema({ _id: false, versionKey: false })
export class ExperienceTranslationFields {
  @Prop()
  role?: string;

  @Prop()
  organization?: string;

  @Prop()
  location?: string;

  @Prop()
  start_date?: string;

  @Prop()
  end_date?: string;

  @Prop()
  summary?: string;

  @Prop({ type: [String] })
  highlights?: string[];
}

export const ExperienceTranslationFieldsSchema =
  SchemaFactory.createForClass(ExperienceTranslationFields);

@Schema({ _id: false, versionKey: false })
export class ExperienceTranslations {
  @Prop({ type: ExperienceTranslationFieldsSchema })
  ar?: ExperienceTranslationFields;

  @Prop({ type: ExperienceTranslationFieldsSchema })
  tr?: ExperienceTranslationFields;
}

export const ExperienceTranslationsSchema =
  SchemaFactory.createForClass(ExperienceTranslations);

export type ExperienceDocument = HydratedDocument<Experience>;

@Schema({ ...BASE_SCHEMA_OPTIONS, collection: 'experiences' })
export class Experience {
  @Prop({ required: true, trim: true })
  role!: string;

  @Prop({ required: true, trim: true })
  organization!: string;

  @Prop({ trim: true })
  location?: string;

  @Prop({ required: true, trim: true })
  start_date!: string;

  @Prop({ required: true, trim: true })
  end_date!: string;

  @Prop({ default: false })
  is_current!: boolean;

  @Prop({ trim: true })
  summary?: string;

  @Prop({ type: [String], default: [] })
  highlights!: string[];

  @Prop({ default: 0, index: true })
  sort_order!: number;

  @Prop({ type: ExperienceTranslationsSchema })
  translations?: ExperienceTranslations;
}

export const ExperienceSchema = SchemaFactory.createForClass(Experience);
ExperienceSchema.index({ sort_order: 1, createdAt: -1 });
