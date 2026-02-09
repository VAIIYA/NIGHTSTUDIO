import { Schema, model, Document } from 'mongoose'

export interface INonce extends Document {
  postId: string
  userId: string
  nonce: string
  used: boolean
  createdAt: Date
}

const NonceSchema = new Schema<INonce>({
  postId: { type: String, required: true },
  userId: { type: String, required: true },
  nonce: { type: String, required: true, unique: true },
  used: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now, expires: 300 }, // Expire after 5 min
})

export default model<INonce>('Nonce', NonceSchema)