import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { BASE_SCHEMA_OPTIONS } from '@/common/database/base-schema.options';

export type ContactMessageStatus = 'new' | 'read' | 'replied' | 'archived';

export type ContactMessageDocument = HydratedDocument<ContactMessage>;

@Schema({ ...BASE_SCHEMA_OPTIONS, collection: 'contact_messages' })
export class ContactMessage {
  @Prop({ required: true, trim: true })
  name!: string;

  @Prop({ required: true, trim: true, lowercase: true })
  email!: string;

  @Prop({ trim: true })
  subject?: string;

  @Prop({ trim: true })
  service?: string;

  @Prop({ required: true, trim: true })
  message!: string;

  @Prop({
    required: true,
    enum: ['new', 'read', 'replied', 'archived'],
    default: 'new',
    index: true,
  })
  status!: ContactMessageStatus;

  @Prop()
  ip?: string;

  @Prop()
  userAgent?: string;
}

export const ContactMessageSchema = SchemaFactory.createForClass(ContactMessage);
ContactMessageSchema.index({ status: 1, createdAt: -1 });
