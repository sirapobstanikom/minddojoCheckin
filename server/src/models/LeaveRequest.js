import mongoose from 'mongoose'

const leaveRequestSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: {
      type: String,
      enum: ['sick', 'personal', 'vacation', 'maternity', 'other'],
      required: true
    },
    startDate: { type: String, required: true }, // YYYY-MM-DD
    endDate: { type: String, required: true },
    reason: { type: String, default: '' },
    contact: { type: String, default: '' },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' }
  },
  { timestamps: true }
)

export const LeaveRequest = mongoose.model('LeaveRequest', leaveRequestSchema)


