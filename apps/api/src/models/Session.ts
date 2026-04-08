import mongoose, { Schema } from 'mongoose';
import type { ISessionDocument } from '@user-management-system/types';

const sessionSchema = new Schema<ISessionDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    creationTime: {
      type: Date,
      default: Date.now,
    },
    terminationTime: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: false,
  }
);

sessionSchema.index({ userId: 1, terminationTime: 1 });

export const Session = mongoose.model<ISessionDocument>('Session', sessionSchema);
