import express from 'express'
import QuoteRequest from '../models/QuoteRequest.js'
import { protect } from '../middleware/authMiddleware.js'

const router = express.Router()

// POST submit quote request (public)
router.post('/', async (req, res) => {
  try {
    const { category, fileName, fileUrl, customerName, customerEmail, customerPhone, company, quantity, message } = req.body

    // Validate required catalog fields
    const missingFields = []
    if (!category) missingFields.push('category')
    if (!fileName) missingFields.push('fileName')
    if (!fileUrl) missingFields.push('fileUrl')

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'catalog fields required',
        missingFields
      })
    }

    // Validate fileUrl is a valid URL
    try {
      new URL(fileUrl)
    } catch {
      return res.status(400).json({
        success: false,
        error: 'invalid fileUrl format'
      })
    }

    // Validate customer fields
    if (!customerName || !customerEmail) {
      return res.status(400).json({
        success: false,
        error: 'customer name and email are required'
      })
    }

    const quoteRequest = await QuoteRequest.create({
      category,
      fileName,
      fileUrl,
      customerName,
      customerEmail,
      customerPhone,
      company,
      quantity,
      message
    })

    res.status(201).json({
      success: true,
      message: 'Quote Request Sent!',
      popup: true,
      data: {
        id: quoteRequest._id,
        category: quoteRequest.category,
        fileName: quoteRequest.fileName,
        fileUrl: quoteRequest.fileUrl,
        timestamp: quoteRequest.createdAt,
        status: quoteRequest.status
      }
    })
  } catch (err) {
    res.status(400).json({ success: false, message: err.message })
  }
})

// GET all quote requests (admin only)
router.get('/', protect, async (req, res) => {
  try {
    const { status, isRead } = req.query
    const filter = {}
    if (status) filter.status = status
    if (isRead !== undefined) filter.isRead = isRead === 'true'

    const quotes = await QuoteRequest.find(filter).sort({ createdAt: -1 })
    res.json({ success: true, data: quotes })
  } catch (err) {
    if (err.name === 'MongooseError' || err.name === 'MongoNotConnectedError' || err.message?.includes('buffering timed out')) {
      return res.json({ success: true, data: [] })
    }
    res.status(500).json({ success: false, message: err.message })
  }
})

// GET single quote request (admin only)
router.get('/:id', protect, async (req, res) => {
  try {
    const quote = await QuoteRequest.findById(req.params.id)
    if (!quote) return res.status(404).json({ success: false, message: 'Quote request not found' })
    res.json({ success: true, data: quote })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// PUT mark as read (admin only)
router.put('/:id/read', protect, async (req, res) => {
  try {
    const quote = await QuoteRequest.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true, runValidators: true }
    )
    if (!quote) return res.status(404).json({ success: false, message: 'Quote request not found' })
    res.json({ success: true, data: quote })
  } catch (err) {
    res.status(400).json({ success: false, message: err.message })
  }
})

// PUT update status (admin only)
router.put('/:id/status', protect, async (req, res) => {
  try {
    const { status } = req.body
    const quote = await QuoteRequest.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    )
    if (!quote) return res.status(404).json({ success: false, message: 'Quote request not found' })
    res.json({ success: true, data: quote })
  } catch (err) {
    res.status(400).json({ success: false, message: err.message })
  }
})

// PUT update quote details (admin only)
router.put('/:id', protect, async (req, res) => {
  try {
    const { status, adminNotes, quotedAmount } = req.body
    const updateData = {}
    if (status) updateData.status = status
    if (adminNotes !== undefined) updateData.adminNotes = adminNotes
    if (quotedAmount !== undefined) updateData.quotedAmount = quotedAmount

    const quote = await QuoteRequest.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    )
    if (!quote) return res.status(404).json({ success: false, message: 'Quote request not found' })
    res.json({ success: true, data: quote })
  } catch (err) {
    res.status(400).json({ success: false, message: err.message })
  }
})

// DELETE quote request (admin only)
router.delete('/:id', protect, async (req, res) => {
  try {
    const quote = await QuoteRequest.findByIdAndDelete(req.params.id)
    if (!quote) return res.status(404).json({ success: false, message: 'Quote request not found' })
    res.json({ success: true, message: 'Quote request deleted' })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

export default router
