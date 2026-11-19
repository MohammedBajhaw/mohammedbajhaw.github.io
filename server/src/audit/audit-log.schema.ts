import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { BASE_SCHEMA_OPTIONS } from '@/common/database/base-schema.options';

export type AuditLogDocument = HydratedDocument<AuditLog>;

@Schema({ ...BASE_SCHEMA_OPTIONS, collection: 'audit_logs' })
export class AuditLog {
  @Prop({ required: true, index: true })
  requestId!: string;

  @Prop({ required: true, index: true })
  method!: string;

  @Prop({ required: true, index: true })
  path!: string;

  @Prop({ required: true })
  statusCode!: number;

  @Prop({ required: true, enum: ['success', 'error'], index: true })
  outcome!: 'success' | 'error';

  @Prop({ required: true })
  durationMs!: number;

  @Prop()
  action?: string;

  @Prop()
  actor?: string;

  @Prop()
  ip?: string;

  @Prop()
  userAgent?: string;

  @Prop()
  errorCode?: string;

  @Prop()
  errorMessage?: string;
}

export const AuditLogSchema = SchemaFactory.createForClass(AuditLog);
AuditLogSchema.index({ createdAt: -1 });
