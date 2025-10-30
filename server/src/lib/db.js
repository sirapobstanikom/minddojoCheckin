import mongoose from 'mongoose'

export async function connectDb() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/attendance_db'
  const dbName = process.env.DB_NAME // e.g. Minddojo_profile
  mongoose.set('strictQuery', true)
  await mongoose.connect(uri, { autoIndex: true, ...(dbName ? { dbName } : {}) })
  console.log('MongoDB connected')
}


