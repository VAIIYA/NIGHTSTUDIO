import mongoose, { Schema, Document, model, models } from 'mongoose';

export interface IFollow extends Document {
    follower: string; // Wallet address
    following: string; // Wallet address
    createdAt: Date;
}

const FollowSchema = new Schema<IFollow>({
    follower: { type: String, required: true },
    following: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

FollowSchema.index({ follower: 1, following: 1 }, { unique: true });

export const FollowModel = models.Follow || model<IFollow>('Follow', FollowSchema);
