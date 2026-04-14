import express from 'express'
import Category from '../models/Category.js'
import { protect } from '../middleware/authMiddleware.js'

const router = express.Router()

// GET all categories (public)
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 })
    res.json({ success: true, data: categories })
  } catch (err) {
    res.status(503).json({ success: false, message: 'Database unavailable' })
  }
})

// PUT update all categories (admin only) - replace all
router.put('/', protect, async (req, res) => {
  try {
    const newCategories = req.body // Expecting an array
    if (!Array.isArray(newCategories)) throw new Error('Expected an array of categories')

    // Simple approach: Clear and replace, or update individually
    // Here we'll clear and replace to match the admin panel's state management
    await Category.deleteMany({})
    const created = await Category.insertMany(newCategories)
    
    res.json({ success: true, data: created })
  } catch (err) {
    res.status(400).json({ success: false, message: err.message })
  }
})

export default router
