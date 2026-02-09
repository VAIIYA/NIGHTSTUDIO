import { Schema, model, Document, models } from 'mongoose'

export interface IInteraction extends Document {
    userId: string
    postId: string
    type: 'like' | 'comment' | 'repost'
    content?: string // For comments
    createdAt: Date
}

const InteractionSchema = new Schema<IInteraction>({
    userId: { type: String, required: true },
    postId: { type: String, required: true, ref: 'Post' },
    type: { type: String, enum: ['like', 'comment', 'repost'], required: true },
    content: { type: String },
    createdAt: { type: Date, default: Date.now },
})

InteractionSchema.index({ postId: 1, type: 1 })
InteractionSchema.index({ userId: 1, postId: 1, type: 1 }, { unique: true, partialFilterExpression: { type: { $ne: 'comment' } } })

export default models.Interaction || model<IInteraction>('Interaction', InteractionSchema)
