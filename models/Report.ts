import mongoose, { Schema, Document, model, models } from 'mongoose';

export interface IReport extends Document {
    postId: mongoose.Types.ObjectId | string;
    reporter: string; // Wallet address
    reason: string;
    details?: string;
    status: 'pending' | 'reviewed' | 'dismissed';
    createdAt: Date;
}

const ReportSchema = new Schema<IReport>({
    postId: { type: Schema.Types.ObjectId, ref: 'Post', required: true },
    reporter: { type: String, required: true },
    reason: { type: String, required: true },
    details: String,
    status: { type: String, enum: ['pending', 'reviewed', 'dismissed'], default: 'pending' },
    createdAt: { type: Date, default: Date.now }
});

export const ReportModel = models.Report || model<IReport>('Report', ReportSchema);
