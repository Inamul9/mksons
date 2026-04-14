import express from 'express'
import Catalog from '../models/Catalog.js'
import { protect } from '../middleware/authMiddleware.js'

const router = express.Router()

// GET all catalogs (public)
router.get('/', async (req, res) => {
  try {
    const { category } = req.query
    const filter = category && category !== 'all' ? { category } : {}
    const catalogs = await Catalog.find(filter).sort({ uploadedAt: -1 })
    res.json({ success: true, data: catalogs })
  } catch (err) {
    // If DB is not connected, return empty array instead of error
    if (err.name === 'MongooseError' || err.name === 'MongoNotConnectedError' || err.message?.includes('buffering timed out')) {
      return res.json({ success: true, data: [] })
    }
    res.status(500).json({ success: false, message: err.message })
  }
})

// POST upload catalog (admin only)
router.post('/', protect, async (req, res) => {
  try {
    const { category, fileName, fileUrl, fileType } = req.body
    if (!category || !fileName || !fileUrl) {
      return res.status(400).json({ success: false, message: 'category, fileName, and fileUrl are required' })
    }
    const catalog = await Catalog.create({ category, fileName, fileUrl, fileType })
    res.status(201).json({ success: true, data: catalog })
  } catch (err) {
    res.status(400).json({ success: false, message: err.message })
  }
})

// DELETE catalog (admin only)
router.delete('/:id', protect, async (req, res) => {
  try {
    const catalog = await Catalog.findByIdAndDelete(req.params.id)
    if (!catalog) return res.status(404).json({ success: false, message: 'Catalog not found' })
    res.json({ success: true, message: 'Catalog deleted' })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

export default router
