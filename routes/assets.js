import express from 'express'
import path from 'path'
import { scanAssets } from '../utils/assetScanner.js'
import Product from '../models/Product.js'
import Catalog from '../models/Catalog.js'
import { protect } from '../middleware/authMiddleware.js'

const router = express.Router()

// GET scan - return all products from assets
router.get('/scan', (req, res) => {
  const assets = scanAssets()
  res.json({ success: true, data: assets })
})

// POST sync - sync assets to database
router.post('/sync', protect, async (req, res) => {
  try {
    const { products, catalogs } = scanAssets()
    
    // Upsert products
    for (const product of products) {
      await Product.findOneAndUpdate(
        { name: product.name, category: product.category },
        product,
        { upsert: true, new: true }
      )
    }
    
    // Upsert catalogs
    for (const catalog of catalogs) {
      await Catalog.findOneAndUpdate(
        { category: catalog.category },
        catalog,
        { upsert: true, new: true }
      )
    }
    
    res.json({ 
      success: true, 
      message: `Synced ${products.length} products and ${catalogs.length} catalogs` 
    })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// Serve images
router.get('/images/:category/:filename', (req, res) => {
  const filePath = path.join(process.cwd(), 'assets', 'images', req.params.category, req.params.filename)
  res.sendFile(filePath, (err) => {
    if (err) res.status(404).json({ success: false, message: 'Image not found' })
  })
})

// Serve PDFs
router.get('/catalogs/:filename', (req, res) => {
  const filePath = path.join(process.cwd(), 'assets', 'catalogs', req.params.filename)
  res.download(filePath, req.params.filename, (err) => {
    if (err) res.status(404).json({ success: false, message: 'PDF not found' })
  })
})

export default router
