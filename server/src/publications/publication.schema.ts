import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { BASE_SCHEMA_OPTIONS } from '@/common/database/base-schema.options';

@Schema({ _id: false, versionKey: false })
export class PublicationTranslationFields {
  @Prop()
  title?: string;

  @Prop()
  venue?: string;

  @Prop()
  publication_date?: string;

  @Prop()
  status?: string;

  @Prop()
  authors?: string;

  @Prop()
  summary?: string;

  @Prop()
  details?: string;

  @Prop({ type: [String] })
  keywords?: string[];
}

export const PublicationTranslationFieldsSchema = SchemaFactory.createForClass(
  PublicationTranslationFields,
);

@Schema({ _id: false, versionKey: false })
export class PublicationTranslations {
  @Prop({ type: PublicationTranslationFieldsSchema })
  ar?: PublicationTranslationFields;

  @Prop({ type: PublicationTranslationFieldsSchema })
  tr?: PublicationTranslationFields;
}

export const PublicationTranslationsSchema = SchemaFactory.createForClass(
  PublicationTranslations,
);

export type PublicationDocument = HydratedDocument<Publication>;

@Schema({ ...BASE_SCHEMA_OPTIONS, collection: 'publications' })
export class Publication {
  @Prop({ required: true, trim: true })
  title!: string;

  @Prop({ required: true, trim: true })
  venue!: string;

  @Prop({ trim: true })
  publication_date?: string;

  @Prop({ required: true, trim: true })
  status!: string;

  @Prop({ trim: true })
  authors?: string;

  @Prop({ required: true, trim: true })
  summary!: string;

  @Prop({ trim: true })
  details?: string;

  @Prop({ type: [String], default: [] })
  keywords!: string[];

  @Prop({ type: String, trim: true, default: null })
  url?: string | null;

  @Prop({ trim: true })
  doi?: string;

  @Prop({ default: 0, index: true })
  sort_order!: number;

  @Prop({ type: PublicationTranslationsSchema })
  translations?: PublicationTranslations;
}

export const PublicationSchema = SchemaFactory.createForClass(Publication);
PublicationSchema.index({ sort_order: 1, createdAt: -1 });
