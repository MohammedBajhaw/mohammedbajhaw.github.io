import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { BASE_SCHEMA_OPTIONS } from '@/common/database/base-schema.options';

@Schema({ _id: false, versionKey: false })
export class SkillTranslationFields {
  @Prop()
  label?: string;

  @Prop()
  category?: string;
}

export const SkillTranslationFieldsSchema =
  SchemaFactory.createForClass(SkillTranslationFields);

@Schema({ _id: false, versionKey: false })
export class SkillTranslations {
  @Prop({ type: SkillTranslationFieldsSchema })
  ar?: SkillTranslationFields;

  @Prop({ type: SkillTranslationFieldsSchema })
  tr?: SkillTranslationFields;
}

export const SkillTranslationsSchema =
  SchemaFactory.createForClass(SkillTranslations);

export type SkillDocument = HydratedDocument<Skill>;

@Schema({ ...BASE_SCHEMA_OPTIONS, collection: 'skills' })
export class Skill {
  @Prop({ required: true, trim: true })
  label!: string;

  @Prop({ required: true, trim: true, index: true })
  category!: string;

  @Prop({ trim: true })
  icon?: string;

  @Prop({ default: 0, index: true })
  sort_order!: number;

  @Prop({ type: SkillTranslationsSchema })
  translations?: SkillTranslations;
}

export const SkillSchema = SchemaFactory.createForClass(Skill);
SkillSchema.index({ sort_order: 1, createdAt: 1 });
