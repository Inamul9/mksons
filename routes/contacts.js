import express from 'express'
import ContactSubmission from '../models/ContactSubmission.js'
import { protect } from '../middleware/authMiddleware.js'

const router = express.Router()

// POST submit contact form (public)
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, message, giftType } = req.body
    if (!name || !email || !message || !giftType) {
      return res.status(400).json({ success: false, message: 'name, email, message, and giftType are required' })
    }
    const submission = await ContactSubmission.create({ name, email, phone, message, giftType })
    res.status(201).json({ success: true, data: submission })
  } catch (err) {
    res.status(400).json({ success: false, message: err.message })
  }
})

// GET all submissions (admin only)
router.get('/', protect, async (req, res) => {
  try {
    const { status, isRead } = req.query
    const filter = {}
    if (status) filter.status = status
    if (isRead !== undefined) filter.isRead = isRead === 'true'
    
    const submissions = await ContactSubmission.find(filter).sort({ createdAt: -1 })
    res.json({ success: true, data: submissions })
  } catch (err) {
    if (err.name === 'MongooseError' || err.name === 'MongoNotConnectedError' || err.message?.includes('buffering timed out')) {
      return res.json({ success: true, data: [] })
    }
    res.status(500).json({ success: false, message: err.message })
  }
})

// PUT mark as read (admin only)
router.put('/:id/read', protect, async (req, res) => {
  try {
    const submission = await ContactSubmission.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true, runValidators: true }
    )
    if (!submission) return res.status(404).json({ success: false, message: 'Submission not found' })
    res.json({ success: true, data: submission })
  } catch (err) {
    res.status(400).json({ success: false, message: err.message })
  }
})

// PUT update status (admin only)
router.put('/:id/status', protect, async (req, res) => {
  try {
    const { status } = req.body
    const submission = await ContactSubmission.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    )
    if (!submission) return res.status(404).json({ success: false, message: 'Submission not found' })
    res.json({ success: true, data: submission })
  } catch (err) {
    res.status(400).json({ success: false, message: err.message })
  }
})

// DELETE submission (admin only)
router.delete('/:id', protect, async (req, res) => {
  try {
    const submission = await ContactSubmission.findByIdAndDelete(req.params.id)
    if (!submission) return res.status(404).json({ success: false, message: 'Submission not found' })
    res.json({ success: true, message: 'Submission deleted' })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

export default router
