import { Types, type SchemaOptions } from 'mongoose';

export const BASE_SCHEMA_OPTIONS: SchemaOptions = {
  timestamps: true,
  versionKey: false,
  toJSON: {
    virtuals: true,
    transform: (_doc: unknown, ret: Record<string, unknown>) => {
      if (ret._id instanceof Types.ObjectId) {
        ret.id = ret._id.toHexString();
      } else if (typeof ret._id === 'string') {
        ret.id = ret._id;
      }
      delete ret._id;
      return ret;
    },
  },
};
