import { Schema, model, Document } from 'mongoose'

export interface INotification extends Document {
  recipient: string // wallet address of the recipient
  sender: string // wallet address of the sender
  type: 'like' | 'comment' | 'follow' | 'unlock' | 'subscription' | 'repost'
  postId?: string
  commentId?: string
  amount?: number
  message: string
  isRead: boolean
  createdAt: Date
}

const NotificationSchema = new Schema<INotification>({
  recipient: { type: String, required: true },
  sender: { type: String, required: true },
  type: {
    type: String,
    enum: ['like', 'comment', 'follow', 'unlock', 'subscription', 'repost'],
    required: true
  },
  postId: { type: String },
  commentId: { type: String },
  amount: { type: Number },
  message: { type: String, required: true },
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
})

// Indexes for efficient queries
NotificationSchema.index({ recipient: 1, isRead: 1 })
NotificationSchema.index({ recipient: 1, createdAt: -1 })

export default model<INotification>('Notification', NotificationSchema)