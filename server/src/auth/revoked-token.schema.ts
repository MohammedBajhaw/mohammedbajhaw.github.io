import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { BASE_SCHEMA_OPTIONS } from '@/common/database/base-schema.options';

export type RevokedTokenDocument = HydratedDocument<RevokedToken>;

@Schema({ ...BASE_SCHEMA_OPTIONS, collection: 'revoked_tokens' })
export class RevokedToken {
  @Prop({ required: true, unique: true, index: true })
  jti!: string;

  @Prop({ required: true, index: { expires: 0 } })
  expiresAt!: Date;
}

export const RevokedTokenSchema = SchemaFactory.createForClass(RevokedToken);
