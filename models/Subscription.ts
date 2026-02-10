import mongoose, { Schema, Document, model, models } from 'mongoose';

export interface ISubscriptionTier extends Document {
    creator: string; // Wallet address
    name: string;
    description: string;
    price: number;
    benefits: string[];
    isActive: boolean;
    createdAt: Date;
}

const SubscriptionTierSchema = new Schema<ISubscriptionTier>({
    creator: { type: String, required: true },
    name: { type: String, required: true },
    description: String,
    price: { type: Number, required: true },
    benefits: { type: [String], default: [] },
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now }
});

export const SubscriptionTierModel = models.SubscriptionTier || model<ISubscriptionTier>('SubscriptionTier', SubscriptionTierSchema);

export interface ISubscription extends Document {
    subscriber: string; // Wallet address
    creator: string; // Wallet address
    tierId: mongoose.Types.ObjectId | string;
    startDate: Date;
    endDate: Date;
    isActive: boolean;
    autoRenew: boolean;
    lastPaymentDate: Date;
    totalPaid: number;
}

const SubscriptionSchema = new Schema<ISubscription>({
    subscriber: { type: String, required: true },
    creator: { type: String, required: true },
    tierId: { type: Schema.Types.ObjectId, ref: 'SubscriptionTier', required: true },
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
    autoRenew: { type: Boolean, default: true },
    lastPaymentDate: { type: Date, default: Date.now },
    totalPaid: { type: Number, default: 0 }
});

export const SubscriptionModel = models.Subscription || model<ISubscription>('Subscription', SubscriptionSchema);

export interface INotification extends Document {
    recipient: string; // Wallet address
    sender: string; // Wallet address
    type: string;
    postId?: string;
    commentId?: string;
    amount?: number;
    message: string;
    isRead: boolean;
    createdAt: Date;
}

const NotificationSchema = new Schema<INotification>({
    recipient: { type: String, required: true },
    sender: { type: String, required: true },
    type: { type: String, required: true },
    postId: String,
    commentId: String,
    amount: Number,
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

export const NotificationModel = models.Notification || model<INotification>('Notification', NotificationSchema);
