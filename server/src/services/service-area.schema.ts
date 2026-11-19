import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { BASE_SCHEMA_OPTIONS } from '@/common/database/base-schema.options';

@Schema({ _id: false, versionKey: false })
export class ServiceItemTranslationFields {
  @Prop()
  title?: string;

  @Prop()
  summary?: string;

  @Prop({ type: [String] })
  deliverables?: string[];
}

export const ServiceItemTranslationFieldsSchema = SchemaFactory.createForClass(
  ServiceItemTranslationFields,
);

@Schema({ _id: false, versionKey: false })
export class ServiceItemTranslations {
  @Prop({ type: ServiceItemTranslationFieldsSchema })
  ar?: ServiceItemTranslationFields;

  @Prop({ type: ServiceItemTranslationFieldsSchema })
  tr?: ServiceItemTranslationFields;
}

export const ServiceItemTranslationsSchema = SchemaFactory.createForClass(
  ServiceItemTranslations,
);

@Schema({ _id: false, versionKey: false })
export class ServiceItem {
  @Prop({ required: true, trim: true })
  title!: string;

  @Prop({ required: true, trim: true })
  summary!: string;

  @Prop({ type: [String], default: [] })
  deliverables!: string[];

  @Prop({ default: 0 })
  sort_order!: number;

  @Prop({ type: ServiceItemTranslationsSchema })
  translations?: ServiceItemTranslations;
}

export const ServiceItemSchema = SchemaFactory.createForClass(ServiceItem);

@Schema({ _id: false, versionKey: false })
export class ServiceAreaTranslationFields {
  @Prop()
  title?: string;

  @Prop()
  description?: string;
}

export const ServiceAreaTranslationFieldsSchema = SchemaFactory.createForClass(
  ServiceAreaTranslationFields,
);

@Schema({ _id: false, versionKey: false })
export class ServiceAreaTranslations {
  @Prop({ type: ServiceAreaTranslationFieldsSchema })
  ar?: ServiceAreaTranslationFields;

  @Prop({ type: ServiceAreaTranslationFieldsSchema })
  tr?: ServiceAreaTranslationFields;
}

export const ServiceAreaTranslationsSchema = SchemaFactory.createForClass(
  ServiceAreaTranslations,
);

export type ServiceAreaDocument = HydratedDocument<ServiceArea>;

@Schema({ ...BASE_SCHEMA_OPTIONS, collection: 'service_areas' })
export class ServiceArea {
  @Prop({ required: true, trim: true })
  title!: string;

  @Prop({ required: true, trim: true })
  description!: string;

  @Prop({ trim: true })
  accent?: string;

  @Prop({ trim: true })
  icon?: string;

  @Prop({ default: 0, index: true })
  sort_order!: number;

  @Prop({ type: [ServiceItemSchema], default: [] })
  services!: ServiceItem[];

  @Prop({ type: ServiceAreaTranslationsSchema })
  translations?: ServiceAreaTranslations;
}

export const ServiceAreaSchema = SchemaFactory.createForClass(ServiceArea);
ServiceAreaSchema.index({ sort_order: 1, createdAt: 1 });
