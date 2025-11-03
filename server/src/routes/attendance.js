import { Router } from 'express'
import { requireAuth } from '../middleware/auth.js'
import { Attendance } from '../models/Attendance.js'

const router = Router()

function toDateKey(d = new Date()) {
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

router.use(requireAuth)

router.post('/checkin', async (req, res, next) => {
  try {
    const date = toDateKey()
    const existing = await Attendance.findOne({ userId: req.user.sub, date })
    if (existing?.checkInAt) return res.status(400).json({ message: 'Already checked in' })
    const checkInAt = new Date()
    const workStart = new Date(checkInAt)
    workStart.setHours(9, 0, 0, 0)
    const lateMinutes = Math.max(0, Math.round((checkInAt - workStart) / 60000))
    const doc = await Attendance.findOneAndUpdate(
      { userId: req.user.sub, date },
      { $setOnInsert: { userId: req.user.sub, date }, $set: { checkInAt, lateMinutes } },
      { new: true, upsert: true }
    )
    res.status(201).json(doc)
  } catch (err) { next(err) }
})

router.post('/checkout', async (req, res, next) => {
  try {
    const date = toDateKey()
    const existing = await Attendance.findOne({ userId: req.user.sub, date })
    if (!existing?.checkInAt) return res.status(400).json({ message: 'Check-in first' })
    if (existing.checkOutAt) return res.status(400).json({ message: 'Already checked out' })
    existing.checkOutAt = new Date()
    await existing.save()
    res.json(existing)
  } catch (err) { next(err) }
})

router.get('/today', async (req, res, next) => {
  try {
    const date = toDateKey()
    const doc = await Attendance.findOne({ userId: req.user.sub, date })
    res.json(doc || null)
  } catch (err) { next(err) }
})

router.get('/', async (req, res, next) => {
  try {
    const { month } = req.query // e.g. 2025-10
    if (!month) {
      const list = await Attendance.find({ userId: req.user.sub }).sort({ date: -1 })
      return res.json(list)
    }
    const list = await Attendance.find({ userId: req.user.sub, date: { $regex: `^${month}` } }).sort({ date: -1 })
    res.json(list)
  } catch (err) { next(err) }
})

export default router


