import express from 'express'
import Product from '../models/Product.js'
import { protect } from '../middleware/authMiddleware.js'

const router = express.Router()

// GET all products (public)
router.get('/', async (req, res) => {
  try {
    const { category, subcategory } = req.query
    const filter = {}
    if (category) filter.category = category
    if (subcategory) filter.subcategory = subcategory
    const products = await Product.find(filter).sort({ createdAt: -1 })
    res.json({ success: true, data: products })
  } catch (err) {
    res.status(503).json({ success: false, message: 'Database is temporarily unavailable' })
  }
})

// GET unique categories from database (public)
router.get('/categories', async (req, res) => {
  try {
    const categories = await Product.distinct('category')
    res.json({ success: true, data: categories })
  } catch (err) {
    res.status(503).json({ success: false, message: 'Database is temporarily unavailable' })
  }
})

// GET single product (public)
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' })
    res.json({ success: true, data: product })
  } catch (err) {
    if (err.name === 'MongooseError' || err.name === 'MongoNotConnectedError' || err.message?.includes('buffering timed out')) {
      return res.status(503).json({ success: false, message: 'Database unavailable' })
    }
    res.status(500).json({ success: false, message: err.message })
  }
})

// POST create product (admin only)
router.post('/', protect, async (req, res) => {
  try {
    const product = await Product.create(req.body)
    res.status(201).json({ success: true, data: product })
  } catch (err) {
    res.status(400).json({ success: false, message: err.message })
  }
})

// PUT update product (admin only)
router.put('/:id', protect, async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' })
    res.json({ success: true, data: product })
  } catch (err) {
    res.status(400).json({ success: false, message: err.message })
  }
})

// DELETE product (admin only)
router.delete('/:id', protect, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id)
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' })
    res.json({ success: true, message: 'Product deleted' })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

export default router
