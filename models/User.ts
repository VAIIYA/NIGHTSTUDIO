import mongoose, { Schema, Document, model, models } from 'mongoose';

export interface IUser extends Document {
    id: string; // Internal UUID
    walletAddress: string;
    role: string;
    createdAt: Date;
}

const UserSchema = new Schema<IUser>({
    walletAddress: { type: String, required: true, unique: true },
    role: { type: String, default: 'user' },
    createdAt: { type: Date, default: Date.now }
});

export const UserModel = models.User || model<IUser>('User', UserSchema);

export interface ICreator extends Document {
    id: string; // Internal UUID
    userId: mongoose.Types.ObjectId | string;
    walletAddress: string;
    username: string;
    bio: string;
    avatar: string;
    socialLinks: any;
    location: string;
    hashtags: string[];
    referredBy: string;
    referralCode: string;
    createdAt: Date;
}

const CreatorSchema = new Schema<ICreator>({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    walletAddress: { type: String, required: true, unique: true },
    username: { type: String, unique: true, sparse: true },
    bio: String,
    avatar: String,
    socialLinks: { type: Schema.Types.Mixed, default: {} },
    location: String,
    hashtags: { type: [String], default: [] },
    referredBy: String,
    referralCode: { type: String, unique: true, sparse: true },
    createdAt: { type: Date, default: Date.now }
});

export const CreatorModel = models.Creator || model<ICreator>('Creator', CreatorSchema);
