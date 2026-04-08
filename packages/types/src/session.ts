import type { Document, Types } from 'mongoose';

export interface ISession {
  userId: Types.ObjectId;
  creationTime: Date;
  terminationTime: Date | null;
}

export interface ISessionDocument extends ISession, Document {}
