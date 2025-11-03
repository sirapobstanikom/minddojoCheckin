import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import { connectDb } from './lib/db.js'
import { User } from './models/User.js'
import authRoutes from './routes/auth.js'
import attendanceRoutes from './routes/attendance.js'
import leaveRoutes from './routes/leave.js'
import reportsRoutes from './routes/reports.js'

const app = express()

// Security and middleware
app.use(helmet())
app.use(cors({ origin: process.env.CORS_ORIGIN?.split(',') || '*', credentials: true }))
app.use(express.json())
app.use(morgan('dev'))

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' })
})

// API routes
app.use('/api/auth', authRoutes)
app.use('/api/attendance', attendanceRoutes)
app.use('/api/leave', leaveRoutes)
app.use('/api/reports', reportsRoutes)

// Global error handler
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  const status = err.status || 500
  res.status(status).json({ message: err.message || 'Internal Server Error' })
})

const PORT = process.env.PORT || 4000

async function start() {
  await connectDb()
  // Seed default users if missing (to match current frontend mock)
  const defaults = [
    { email: 'admin@example.com', name: 'Administrator', role: 'admin' },
    { email: 'user@example.com', name: 'Normal User', role: 'user' }
  ]
  for (const d of defaults) {
    const exists = await User.findOne({ email: d.email })
    if (!exists) {
      const passwordHash = await User.hashPassword('password')
      await User.create({ ...d, passwordHash })
      console.log(`Seeded user ${d.email} / password`)
    }
  }
  app.listen(PORT, () => {
    console.log(`API listening on http://localhost:${PORT}`)
  })
}

start().catch((err) => {
  console.error('Failed to start server:', err)
  process.exit(1)
})


