import mongoose, { Schema, Document, model, models } from 'mongoose';

export interface IPost extends Document {
    creatorId: mongoose.Types.ObjectId | string;
    content: string;
    storachaCID: string;
    blurCID: string;
    priceUSDC: number;
    createdAt: Date;
    unlockedUsers: string[]; // Wallet addresses
    hashtags: string[];
    engagementScore: number;
    stats: {
        likes: number;
        reposts: number;
        comments: number;
    };
}

const PostSchema = new Schema<IPost>({
    creatorId: { type: Schema.Types.ObjectId, ref: 'Creator', required: true },
    content: String,
    storachaCID: String,
    blurCID: String,
    priceUSDC: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
    unlockedUsers: { type: [String], default: [] },
    hashtags: { type: [String], default: [] },
    engagementScore: { type: Number, default: 0 },
    stats: {
        likes: { type: Number, default: 0 },
        reposts: { type: Number, default: 0 },
        comments: { type: Number, default: 0 }
    }
});

export const PostModel = models.Post || model<IPost>('Post', PostSchema);

export interface IInteraction extends Document {
    postId: mongoose.Types.ObjectId | string;
    userId: mongoose.Types.ObjectId | string;
    type: 'like' | 'comment' | 'repost';
    content?: string; // For comments
    createdAt: Date;
}

const InteractionSchema = new Schema<IInteraction>({
    postId: { type: Schema.Types.ObjectId, ref: 'Post', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['like', 'comment', 'repost'], required: true },
    content: String,
    createdAt: { type: Date, default: Date.now }
});

export const InteractionModel = models.Interaction || model<IInteraction>('Interaction', InteractionSchema);
