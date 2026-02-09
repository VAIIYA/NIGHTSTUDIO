import { Schema, model, Document, models } from 'mongoose'

export interface IMessage extends Document {
    sender: string // wallet address
    recipient: string // wallet address
    content?: string
    storachaCID?: string // for media messages
    priceUSDC: number // price to unlock if media
    isUnlocked: boolean
    createdAt: Date
}

const MessageSchema = new Schema<IMessage>({
    sender: { type: String, required: true },
    recipient: { type: String, required: true },
    content: { type: String },
    storachaCID: { type: String },
    priceUSDC: { type: Number, default: 0 },
    isUnlocked: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
})

MessageSchema.index({ sender: 1, recipient: 1 })
MessageSchema.index({ recipient: 1, sender: 1 })
MessageSchema.index({ createdAt: -1 })

export default models.Message || model<IMessage>('Message', MessageSchema)
