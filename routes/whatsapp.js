import express from 'express'
import WhatsAppSettings from '../models/WhatsAppSettings.js'
import { protect } from '../middleware/authMiddleware.js'

const router = express.Router()

// GET WhatsApp number (public)
router.get('/', async (req, res) => {
  try {
    const settings = await WhatsAppSettings.getSettings()
    res.json({ success: true, data: settings })
  } catch (err) {
    if (err.name === 'MongooseError' || err.name === 'MongoNotConnectedError' || err.message?.includes('buffering timed out')) {
      return res.json({ success: true, data: { phoneNumber: '+919876543210' } })
    }
    res.status(500).json({ success: false, message: err.message })
  }
})

// PUT Update WhatsApp number (admin only)
router.put('/', protect, async (req, res) => {
  try {
    const { phoneNumber } = req.body
    if (!phoneNumber) {
      return res.status(400).json({ success: false, message: 'Phone number is required' })
    }

    let settings = await WhatsAppSettings.findOne()
    
    if (!settings) {
      settings = await WhatsAppSettings.create({ phoneNumber })
    } else {
      settings.phoneNumber = phoneNumber
      settings.updatedAt = Date.now()
      await settings.save()
    }

    res.json({ success: true, data: settings })
  } catch (err) {
    res.status(400).json({ success: false, message: err.message })
  }
})

export default router
