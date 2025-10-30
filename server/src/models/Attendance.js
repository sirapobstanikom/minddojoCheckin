import mongoose from 'mongoose'

const attendanceSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: String, required: true }, // YYYY-MM-DD
    checkInAt: { type: Date },
    checkOutAt: { type: Date },
    lateMinutes: { type: Number, default: 0 }
  },
  { timestamps: true }
)

attendanceSchema.index({ userId: 1, date: 1 }, { unique: true })

export const Attendance = mongoose.model('Attendance', attendanceSchema)


