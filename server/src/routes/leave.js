import { Router } from 'express'
import { requireAuth } from '../middleware/auth.js'
import { LeaveRequest } from '../models/LeaveRequest.js'

const router = Router()

router.use(requireAuth)

router.post('/', async (req, res, next) => {
  try {
    const { type, startDate, endDate, reason, contact } = req.body
    if (!type || !startDate || !endDate) return res.status(400).json({ message: 'Missing fields' })
    const doc = await LeaveRequest.create({ userId: req.user.sub, type, startDate, endDate, reason, contact })
    res.status(201).json(doc)
  } catch (err) { next(err) }
})

router.get('/', async (req, res, next) => {
  try {
    const list = await LeaveRequest.find({ userId: req.user.sub }).sort({ createdAt: -1 })
    res.json(list)
  } catch (err) { next(err) }
})

// Admin-only approve/reject
router.patch('/:id/approve', async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' })
    const doc = await LeaveRequest.findOneAndUpdate(
      { _id: req.params.id },
      { $set: { status: 'approved' } },
      { new: true }
    )
    if (!doc) return res.status(404).json({ message: 'Not found' })
    res.json(doc)
  } catch (err) { next(err) }
})

router.patch('/:id/reject', async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' })
    const doc = await LeaveRequest.findOneAndUpdate(
      { _id: req.params.id },
      { $set: { status: 'rejected' } },
      { new: true }
    )
    if (!doc) return res.status(404).json({ message: 'Not found' })
    res.json(doc)
  } catch (err) { next(err) }
})

export default router


