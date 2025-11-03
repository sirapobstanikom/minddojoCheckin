import { Router } from 'express'
import { requireAuth } from '../middleware/auth.js'
import { Attendance } from '../models/Attendance.js'
import { LeaveRequest } from '../models/LeaveRequest.js'

const router = Router()

router.use(requireAuth)

router.get('/summary', async (req, res, next) => {
  try {
    const { month } = req.query // e.g. 2025-10
    const attendance = await Attendance.find({ userId: req.user.sub, ...(month ? { date: { $regex: `^${month}` } } : {}) })
    const leave = await LeaveRequest.find({ userId: req.user.sub })

    const todayKey = new Date().toISOString().slice(0, 10)
    const todayAttendance = attendance.filter(a => a.date === todayKey).length
    const lateCount = attendance.reduce((sum, a) => sum + (a.lateMinutes > 0 ? 1 : 0), 0)
    const leaveRequests = leave.length
    const absentCount = 0 // requires business rules / schedule to compute

    res.json({ todayAttendance, lateCount, leaveRequests, absentCount })
  } catch (err) { next(err) }
})

export default router


