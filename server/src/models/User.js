import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    name: { type: String, default: '' },
    role: { type: String, enum: ['admin', 'user'], default: 'user' },
    passwordHash: { type: String, required: true }
  },
  { timestamps: true, collection: 'employee_name' }
)

userSchema.methods.comparePassword = function (password) {
  return bcrypt.compare(password, this.passwordHash)
}

userSchema.statics.hashPassword = async function (password) {
  const salt = await bcrypt.genSalt(10)
  return bcrypt.hash(password, salt)
}

export const User = mongoose.model('User', userSchema)


