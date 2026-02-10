import mongoose, { Schema, Document, model, models } from 'mongoose';

export interface INonce extends Document {
    nonce: string;
    postId: string;
    userId: string; // Wallet address
    used: boolean;
    createdAt: Date;
}

const NonceSchema = new Schema<INonce>({
    nonce: { type: String, required: true, unique: true },
    postId: { type: String, required: true },
    userId: { type: String, required: true },
    used: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now, expires: 3600 } // Expire nonce after 1 hour
});

export const NonceModel = models.Nonce || model<INonce>('Nonce', NonceSchema);

export interface IPurchase extends Document {
    userId: mongoose.Types.ObjectId | string;
    postId: mongoose.Types.ObjectId | string;
    txSignature: string;
    amount: number;
    nonce: string;
    createdAt: Date;
}

const PurchaseSchema = new Schema<IPurchase>({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    postId: { type: Schema.Types.ObjectId, ref: 'Post', required: true },
    txSignature: { type: String, required: true, unique: true },
    amount: { type: Number, required: true },
    nonce: String,
    createdAt: { type: Date, default: Date.now }
});

export const PurchaseModel = models.Purchase || model<IPurchase>('Purchase', PurchaseSchema);
