import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { BASE_SCHEMA_OPTIONS } from '@/common/database/base-schema.options';

@Schema({ _id: false, versionKey: false })
export class EducationTranslationFields {
  @Prop()
  institution?: string;

  @Prop()
  degree?: string;

  @Prop()
  field?: string;

  @Prop()
  location?: string;

  @Prop()
  description?: string;
}

export const EducationTranslationFieldsSchema =
  SchemaFactory.createForClass(EducationTranslationFields);

@Schema({ _id: false, versionKey: false })
export class EducationTranslations {
  @Prop({ type: EducationTranslationFieldsSchema })
  ar?: EducationTranslationFields;

  @Prop({ type: EducationTranslationFieldsSchema })
  tr?: EducationTranslationFields;
}

export const EducationTranslationsSchema =
  SchemaFactory.createForClass(EducationTranslations);

export type EducationDocument = HydratedDocument<Education>;

@Schema({ ...BASE_SCHEMA_OPTIONS, collection: 'education' })
export class Education {
  @Prop({ required: true, trim: true })
  institution!: string;

  @Prop({ required: true, trim: true })
  degree!: string;

  @Prop({ trim: true })
  field?: string;

  @Prop({ trim: true })
  location?: string;

  @Prop({ required: true, trim: true })
  start_year!: string;

  @Prop({ required: true, trim: true })
  end_year!: string;

  @Prop({ trim: true })
  description?: string;

  @Prop({ default: 0, index: true })
  sort_order!: number;

  @Prop({ type: EducationTranslationsSchema })
  translations?: EducationTranslations;
}

export const EducationSchema = SchemaFactory.createForClass(Education);
EducationSchema.index({ sort_order: 1, createdAt: -1 });
