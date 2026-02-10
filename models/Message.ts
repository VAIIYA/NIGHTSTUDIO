import mongoose, { Schema, Document, model, models } from 'mongoose';

export interface IMessage extends Document {
    sender: string; // Wallet address
    recipient: string; // Wallet address
    content?: string;
    storachaCID?: string;
    priceUSDC: number;
    isUnlocked: boolean;
    createdAt: Date;
}

const MessageSchema = new Schema<IMessage>({
    sender: { type: String, required: true },
    recipient: { type: String, required: true },
    content: String,
    storachaCID: String,
    priceUSDC: { type: Number, default: 0 },
    isUnlocked: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now }
});

export const MessageModel = models.Message || model<IMessage>('Message', MessageSchema);
