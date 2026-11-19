import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { BASE_SCHEMA_OPTIONS } from '@/common/database/base-schema.options';

@Schema({ _id: false, versionKey: false })
export class ProfileTranslationFields {
  @Prop()
  name?: string;

  @Prop()
  professional_title?: string;

  @Prop()
  location?: string;

  @Prop()
  bio?: string;
}

export const ProfileTranslationFieldsSchema =
  SchemaFactory.createForClass(ProfileTranslationFields);

@Schema({ _id: false, versionKey: false })
export class ProfileTranslations {
  @Prop({ type: ProfileTranslationFieldsSchema })
  ar?: ProfileTranslationFields;

  @Prop({ type: ProfileTranslationFieldsSchema })
  tr?: ProfileTranslationFields;
}

export const ProfileTranslationsSchema =
  SchemaFactory.createForClass(ProfileTranslations);

@Schema({ _id: false, versionKey: false })
export class ProfileCvFile {
  @Prop({ required: true, trim: true })
  label!: string;

  @Prop({ required: true, trim: true })
  file!: string;
}

export const ProfileCvFileSchema = SchemaFactory.createForClass(ProfileCvFile);

export type ProfileDocument = HydratedDocument<Profile>;

@Schema({ ...BASE_SCHEMA_OPTIONS, collection: 'profiles' })
export class Profile {
  @Prop({ default: 'owner', unique: true, select: false })
  singletonKey!: string;

  @Prop({ required: true, trim: true })
  name!: string;

  @Prop({ required: true, trim: true })
  professional_title!: string;

  @Prop({ required: true, trim: true })
  location!: string;

  @Prop({ required: true, trim: true, lowercase: true })
  email!: string;

  @Prop({ trim: true })
  linkedin_url?: string;

  @Prop({ trim: true })
  github_url?: string;

  @Prop({ trim: true })
  phone?: string;

  @Prop({ required: true, trim: true })
  bio!: string;

  @Prop({ trim: true })
  photo_path?: string;

  @Prop({ trim: true })
  photo_alt?: string;

  @Prop({ type: [ProfileCvFileSchema], default: [] })
  cv_files!: ProfileCvFile[];

  @Prop({ type: ProfileTranslationsSchema })
  translations?: ProfileTranslations;
}

export const ProfileSchema = SchemaFactory.createForClass(Profile);
