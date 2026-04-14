import express from 'express'
import FooterSettings from '../models/FooterSettings.js'
import { protect } from '../middleware/authMiddleware.js'

const router = express.Router()

router.get('/', async (req, res) => {
  try {
    const settings = await FooterSettings.getSettings()
    res.json({ success: true, data: settings })
  } catch (err) {
    console.error('Footer fetch error:', err.message)
    res.status(503).json({ 
      success: false, 
      message: 'Database is temporarily unavailable.' 
    })
  }
})

// PUT update footer settings (admin only)
router.put('/', protect, async (req, res) => {
  try {
    let settings = await FooterSettings.findOne()
    
    if (!settings) {
      settings = await FooterSettings.create(req.body)
    } else {
      Object.assign(settings, req.body)
      await settings.save()
    }
    
    res.json({ success: true, data: settings })
  } catch (err) {
    res.status(400).json({ success: false, message: err.message })
  }
})

export default router
