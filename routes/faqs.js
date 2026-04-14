import express from 'express'
import FAQ from '../models/FAQ.js'
import { protect } from '../middleware/authMiddleware.js'

const router = express.Router()

// GET all FAQs (public)
router.get('/', async (req, res) => {
  try {
    const faqs = await FAQ.find().sort({ order: 1, createdAt: 1 })
    res.json({ success: true, data: faqs })
  } catch (err) {
    res.status(503).json({ success: false, message: 'Database unavailable' })
  }
})

// PUT update all FAQs (admin only)
router.put('/', protect, async (req, res) => {
  try {
    const newFaqs = req.body
    if (!Array.isArray(newFaqs)) throw new Error('Expected an array of FAQs')

    await FAQ.deleteMany({})
    const created = await FAQ.insertMany(
      newFaqs.map((f, i) => ({ ...f, order: i }))
    )

    res.json({ success: true, data: created })
  } catch (err) {
    res.status(400).json({ success: false, message: err.message })
  }
})

export default router
