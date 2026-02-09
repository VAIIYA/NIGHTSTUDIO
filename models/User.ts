import mongoose, { Schema, model, Document } from 'mongoose'

export interface IUser extends Document {
  walletAddress: string
  role: 'user' | 'creator'
  createdAt: Date
}

const UserSchema = new Schema<IUser>({
  walletAddress: { type: String, required: true, unique: true },
  role: { type: String, enum: ['user', 'creator'], default: 'user' },
  createdAt: { type: Date, default: Date.now },
})

UserSchema.index({ walletAddress: 1 })
UserSchema.index({ role: 1 })

// Prevent OverwriteModelError in dev mode
const UserModel = mongoose.models.User || model<IUser>('User', UserSchema)
export default UserModel
