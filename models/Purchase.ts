import { Schema, model, Document } from 'mongoose'

export interface IPurchase extends Document {
  userId: string
  postId: string
  txSignature: string
  amount: number
  nonce: string
  createdAt: Date
}

const PurchaseSchema = new Schema<IPurchase>({
  userId: { type: String, required: true },
  postId: { type: String, required: true },
  txSignature: { type: String, required: true },
  amount: { type: Number, required: true },
  nonce: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now },
})

PurchaseSchema.index({ userId: 1 })
PurchaseSchema.index({ postId: 1 })
PurchaseSchema.index({ nonce: 1 })

export default model<IPurchase>('Purchase', PurchaseSchema)
