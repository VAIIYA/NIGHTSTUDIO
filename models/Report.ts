import { Schema, model, Document } from 'mongoose'

export interface IReport extends Document {
  postId: string
  reporterId: string
  reason: string
  status: 'pending' | 'reviewed' | 'dismissed'
  createdAt: Date
}

const ReportSchema = new Schema<IReport>({
  postId: { type: String, required: true },
  reporterId: { type: String, required: true },
  reason: { type: String, required: true },
  status: { type: String, enum: ['pending', 'reviewed', 'dismissed'], default: 'pending' },
  createdAt: { type: Date, default: Date.now },
})

ReportSchema.index({ status: 1 })
ReportSchema.index({ createdAt: -1 })

export default model<IReport>('Report', ReportSchema)