import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import dotenv from 'dotenv'
import bcrypt from 'bcryptjs'
import path from 'path'

import productsRouter from './routes/products.js'
import catalogsRouter from './routes/catalogs.js'
import authRouter from './routes/auth.js'
import contactsRouter from './routes/contacts.js'
import quotesRouter from './routes/quotes.js'
import footerRouter from './routes/footer.js'
import whatsappRouter from './routes/whatsapp.js'
import categoriesRouter from './routes/categories.js'
import faqsRouter from './routes/faqs.js'
import assetsRouter from './routes/assets.js'
import blogsRouter from './routes/blogs.js'
import { scanAssets } from './utils/assetScanner.js'
import Admin from './models/Admin.js'
import Product from './models/Product.js'
import Catalog from './models/Catalog.js'
import Category from './models/Category.js'
import FAQ from './models/FAQ.js'
import FooterSettings from './models/FooterSettings.js'
import WhatsAppSettings from './models/WhatsAppSettings.js'

dotenv.config()

const app = express()

// Track DB connection state
let dbConnected = false

// Reduce mongoose buffer timeout to prevent long waits when DB is down
mongoose.set('bufferTimeoutMS', 3000)

app.use(cors({ origin: true, credentials: true }))
app.use(express.json({ limit: '20mb' }))

// Middleware to check DB availability
app.use('/api', (req, res, next) => {
  // Allow health check always
  if (req.path === '/health') return next()
  // For GET requests, allow even without DB (routes handle fallback)
  // For POST/PUT/DELETE, require DB
  if (!dbConnected && req.method !== 'GET') {
    return res.status(503).json({ 
      success: false, 
      message: 'Database is not connected. Please try again later.' 
    })
  }
  next()
})

// Serve static assets
app.use('/assets', express.static(path.join(process.cwd(), 'assets')))

// Routes
app.use('/api/products', productsRouter)
app.use('/api/catalogs', catalogsRouter)
app.use('/api/auth', authRouter)
app.use('/api/contacts', contactsRouter)
app.use('/api/quotes', quotesRouter)
app.use('/api/footer', footerRouter)
app.use('/api/whatsapp', whatsappRouter)
app.use('/api/assets', assetsRouter)
app.use('/api/categories', categoriesRouter)
app.use('/api/faqs', faqsRouter)
app.use('/api/blogs', blogsRouter)

// Health check
app.get('/api/health', (_, res) => res.json({ status: 'ok', dbConnected, time: new Date() }))

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.message)
  res.status(500).json({ success: false, message: 'Internal server error' })
})

// ── Seed default admin & products on first run ──────────────────────────
const seedData = async () => {
  // Default admin: raja / sinu
  const adminEmail = 'raja'
  const adminPassword = 'sinu'
  
  const adminCount = await Admin.countDocuments()
  if (adminCount === 0) {
    const hashed = await bcrypt.hash(adminPassword, 10)
    await Admin.create({ email: adminEmail, password: hashed })
    console.log(`✅ Default admin seeded → ID: ${adminEmail} / Password: ${adminPassword}`)
  } else {
    // Optional: Ensure the specific user 'raja' exists or update the legacy 'admin@corporategifts.com'
    const legacyAdmin = await Admin.findOne({ email: 'admin@corporategifts.com' })
    if (legacyAdmin) {
      legacyAdmin.email = adminEmail
      legacyAdmin.password = await bcrypt.hash(adminPassword, 10)
      await legacyAdmin.save()
      console.log('✅ Legacy admin updated to new credentials')
    }
  }

  // Seed default footer settings
  const footerCount = await FooterSettings.countDocuments()
  if (footerCount === 0) {
    await FooterSettings.create({
      quickLinks: [
        { label: 'Home', url: '/' },
        { label: 'Products', url: '/products' },
        { label: 'Contact', url: '/contact' },
      ],
    })
    console.log('✅ Default footer settings seeded')
  }

  // Seed default categories matching frontend hardcoded ones
  const categoryCount = await Category.countDocuments()
  if (categoryCount === 0) {
    const defaultCats = [
      {
        id: 'corporate-gifts', name: 'Corporate Gifts', 
        description: 'Premium gifts for corporate events, client appreciation, and employee recognition',
        subcategories: [
          { id: 'gift-combo', name: 'Gift Combos' },
          { id: 'hampers', name: 'Hampers' },
          { id: 'corporate-apparel', name: 'Corporate Apparel' },
          { id: 'personalized', name: 'Personalized Items' },
        ]
      },
      {
        id: 'eco-friendly', name: 'Eco-Friendly Gifts',
        description: 'Sustainable and environmentally conscious corporate gifts',
        subcategories: [
          { id: 'jute-bags', name: 'Jute Bags' },
          { id: 'bamboo-items', name: 'Bamboo Items' },
          { id: 'recycled', name: 'Recycled Products' },
          { id: 'plant-kits', name: 'Plant Kits' },
        ]
      },
      {
        id: 'tech-gifts', name: 'Tech Gifts',
        description: 'Modern technology gadgets and smart accessories for professionals',
        subcategories: [
          { id: 'wireless-chargers', name: 'Wireless Chargers' },
          { id: 'earbuds', name: 'Earbuds & Audio' },
          { id: 'power-banks', name: 'Power Banks' },
          { id: 'smart-gadgets', name: 'Smart Gadgets' },
        ]
      },
      {
        id: 'luxury', name: 'Luxury Gifts',
        description: 'High-end premium gifts for distinguished occasions and VIP clients',
        subcategories: [
          { id: 'leather-goods', name: 'Leather Goods' },
          { id: 'crystal-awards', name: 'Crystal Awards' },
          { id: 'premium-pens', name: 'Premium Pen Sets' },
          { id: 'wine-sets', name: 'Wine & Bar Sets' },
        ]
      }
    ]
    await Category.insertMany(defaultCats)
    console.log('✅ Default categories seeded')
  }

  // Seed default FAQs
  const faqCount = await FAQ.countDocuments()
  if (faqCount === 0) {
    const defaultFaqs = [
      {
        question: "What is your minimum order quantity (MOQ)?",
        answer: "Our minimum order quantity varies depending on the product category. For most premium items like tech accessories and leather goods, the MOQ is 50 units.",
        order: 0
      },
      {
        question: "Can you customize products with our company logo?",
        answer: "Yes, absolutely! We specialize in custom branding including laser engraving, screen printing, and embossing.",
        order: 1
      },
      {
        question: "How long does it take to fulfill an order?",
        answer: "Standard production time is 7-10 business days after digital mockup approval. For custom-manufactured orders, it may take 15-20 business days.",
        order: 2
      },
      {
        question: "Can you create custom gift kits or hampers?",
        answer: "Yes, we are experts in creating curated gift boxes elegantly packaged with personalized greeting cards.",
        order: 3
      }
    ]
    await FAQ.insertMany(defaultFaqs)
    console.log('✅ Default FAQs seeded')
  }

  // Ensure WhatsApp settings exist
  await WhatsAppSettings.getSettings()
  console.log('✅ WhatsApp settings initialized')

  // Seed 16 products
  const productCount = await Product.countDocuments()
  if (productCount === 0) {
    const products = [
      // Corporate Gifts
      { name: 'Executive Gift Combo Box', category: 'corporate-gifts', subcategory: 'gift-combo', price: 7499, description: 'Premium executive combo with leather notebook, pen set, and cufflinks.', imageUrl: 'https://images.unsplash.com/photo-1549298240-075b4c31a95c?w=500', stock: 50 },
      { name: 'Festive Hamper Deluxe', category: 'corporate-gifts', subcategory: 'hampers', price: 10999, description: 'Luxury festive hamper with gourmet chocolates, dry fruits, and premium tea.', imageUrl: 'https://images.unsplash.com/photo-1513885535751-8b9238bd345a?w=500', stock: 30 },
      { name: 'Custom Branded T-Shirt', category: 'corporate-gifts', subcategory: 'corporate-apparel', price: 2099, description: 'High-quality cotton T-shirt with custom company logo printing.', imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500', stock: 200 },
      { name: 'Premium Diary & Pen Set', category: 'corporate-gifts', subcategory: 'personalized', price: 3899, description: 'Italian leather diary with premium metal pen set. Custom embossing available.', imageUrl: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=500', stock: 75 },
      // Eco-Friendly
      { name: 'Eco Jute Gift Bag', category: 'eco-friendly', subcategory: 'jute-bags', price: 749, description: 'Eco-friendly jute bags with laminated branding.', imageUrl: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=500', stock: 300 },
      { name: 'Bamboo Wireless Charging Pad', category: 'eco-friendly', subcategory: 'bamboo-items', price: 2899, description: 'Eco-friendly bamboo wireless charger for all Qi-enabled devices.', imageUrl: 'https://images.unsplash.com/photo-1586816879360-004f5c8cb4b0?w=500', stock: 80 },
      { name: 'Recycled Cotton Tote Bag', category: 'eco-friendly', subcategory: 'recycled', price: 1699, description: '100% recycled cotton tote bag with custom company logo.', imageUrl: 'https://images.unsplash.com/photo-1591561954557-2694f69732b2?w=500', stock: 150 },
      { name: 'Desktop Plant Kit', category: 'eco-friendly', subcategory: 'plant-kits', price: 2099, description: 'Mini succulent desk planter with branded ceramic pot.', imageUrl: 'https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=500', stock: 60 },
      // Tech Gifts
      { name: 'Smart Bluetooth Speaker', category: 'tech-gifts', subcategory: 'smart-gadgets', price: 6699, description: 'Premium Bluetooth speaker with 360° sound and 12-hour battery.', imageUrl: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7fd?w=500', stock: 45 },
      { name: 'Wireless Earbuds Pro', category: 'tech-gifts', subcategory: 'earbuds', price: 10999, description: 'Premium wireless earbuds with active noise cancellation.', imageUrl: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=500', stock: 40 },
      { name: 'Smart Watch Elite', category: 'tech-gifts', subcategory: 'smart-gadgets', price: 20999, description: 'Premium smartwatch with health monitoring, GPS, and 7-day battery.', imageUrl: 'https://images.unsplash.com/photo-1546868871-7041f28a9a27?w=500', stock: 25 },
      { name: 'Fast Wireless Charger', category: 'tech-gifts', subcategory: 'wireless-chargers', price: 3399, description: '15W fast wireless charging pad with LED indicator.', imageUrl: 'https://images.unsplash.com/photo-1586816879360-004f5c8cb4b0?w=500', stock: 100 },
      // Luxury
      { name: 'Crystal Decanter Set', category: 'luxury', subcategory: 'wine-sets', price: 15999, description: 'Hand-blown crystal decanter with matching glasses.', imageUrl: 'https://images.unsplash.com/photo-1569529238715-0f628f5a5fa7?w=500', stock: 20 },
      { name: 'Italian Leather Travel Bag', category: 'luxury', subcategory: 'leather-goods', price: 24999, description: 'Handcrafted Italian leather travel bag with multiple compartments.', imageUrl: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=500', stock: 15 },
      { name: 'Crystal Award Trophy', category: 'luxury', subcategory: 'crystal-awards', price: 8399, description: 'Custom designed crystal award for recognition.', imageUrl: 'https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?w=500', stock: 35 },
      { name: 'Luxury Pen Set Collection', category: 'luxury', subcategory: 'premium-pens', price: 12499, description: 'Premium metal pen set in handcrafted wooden box with laser engraving.', imageUrl: 'https://images.unsplash.com/photo-1583485088034-697e5b071fca?w=500', stock: 50 },
    ]
    await Product.insertMany(products)
    console.log('✅ 16 sample products seeded')
  }

  // Auto-sync assets on startup
  try {
    const { products: assetProducts, catalogs: assetCatalogs } = scanAssets()
    
    if (assetProducts.length > 0) {
      for (const product of assetProducts) {
        await Product.findOneAndUpdate(
          { name: product.name, category: product.category },
          { $setOnInsert: product },
          { upsert: true, new: true }
        )
      }
      console.log(`✅ Auto-synced new products from assets (existing products preserved)`)
    }

    if (assetCatalogs.length > 0) {
      for (const catalog of assetCatalogs) {
        await Catalog.findOneAndUpdate(
          { category: catalog.category },
          { $setOnInsert: catalog },
          { upsert: true, new: true }
        )
      }
      console.log(`✅ Auto-synced new catalogs from assets (existing catalogs preserved)`)
    }
  } catch (err) {
    console.log('⚠️  Asset auto-sync skipped:', err.message)
  }
}

// Connect MongoDB & start server
const PORT = process.env.PORT || 3001

mongoose
  .connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 10000,
  })
  .then(async () => {
    dbConnected = true
    console.log('✅ MongoDB connected')
    await seedData()
    app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`))
  })
  .catch((err) => {
    console.error('❌ MongoDB connection failed:', err.message)
    console.error('👉 Please update MONGODB_URI in backend/.env')
    // Start server without DB for development
    app.listen(PORT, () => console.log(`⚠️  Server running WITHOUT DB on http://localhost:${PORT}`))
  })

// Handle MongoDB connection events
mongoose.connection.on('connected', () => { dbConnected = true })
mongoose.connection.on('disconnected', () => { dbConnected = false })
mongoose.connection.on('error', () => { dbConnected = false })
