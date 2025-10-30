import { Router } from 'express'
import { User } from '../models/User.js'
import { signJwt } from '../middleware/auth.js'

const router = Router()

// Register (optional)
router.post('/register', async (req, res, next) => {
  try {
    const { email, password, name, role } = req.body
    if (!email || !password) return res.status(400).json({ message: 'Email and password are required' })
    const exists = await User.findOne({ email })
    if (exists) return res.status(400).json({ message: 'Email already registered' })
    const passwordHash = await User.hashPassword(password)
    const user = await User.create({ email, passwordHash, name: name || '', role: role || 'user' })
    return res.status(201).json({ id: user._id })
  } catch (err) { next(err) }
})

// Login
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body
    const user = await User.findOne({ email })
    if (!user) return res.status(401).json({ message: 'Invalid email or password' })
    const ok = await user.comparePassword(password)
    if (!ok) return res.status(401).json({ message: 'Invalid email or password' })
    const token = signJwt({ sub: user._id.toString(), email: user.email, role: user.role, name: user.name })
    res.json({ token, user: { id: user._id, email: user.email, name: user.name, role: user.role } })
  } catch (err) { next(err) }
})

export default router


