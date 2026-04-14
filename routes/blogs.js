import express from 'express'
import Blog from '../models/Blog.js'
import { protect } from '../middleware/authMiddleware.js'

const router = express.Router()

// Get all blogs
router.get('/', async (req, res) => {
  try {
    const blogs = await Blog.find().sort({ publishedAt: -1 })
    res.json({ success: true, data: blogs })
  } catch (error) {
    console.error('Error fetching blogs:', error.message)
    res.status(500).json({ success: false, error: 'Failed to fetch blogs' })
  }
})

// Create a new blog (Admin only)
router.post('/', protect, async (req, res) => {
  try {
    const newBlog = new Blog(req.body)
    await newBlog.save()
    res.status(201).json({ success: true, data: newBlog })
  } catch (error) {
    console.error('Error creating blog:', error.message)
    res.status(500).json({ success: false, error: 'Failed to create blog' })
  }
})

// Update a blog (Admin only)
router.put('/:id', protect, async (req, res) => {
  try {
    const updatedBlog = await Blog.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    )
    if (!updatedBlog) {
      return res.status(404).json({ success: false, error: 'Blog not found' })
    }
    res.json({ success: true, data: updatedBlog })
  } catch (error) {
    console.error('Error updating blog:', error.message)
    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, error: 'Invalid ID format' })
    }
    res.status(500).json({ success: false, error: 'Failed to update blog' })
  }
})

// Delete a blog (Admin only)
router.delete('/:id', protect, async (req, res) => {
  try {
    const deletedBlog = await Blog.findByIdAndDelete(req.params.id)
    if (!deletedBlog) {
      return res.status(404).json({ success: false, error: 'Blog not found' })
    }
    res.json({ success: true, data: deletedBlog })
  } catch (error) {
    console.error('Error deleting blog:', error.message)
    res.status(500).json({ success: false, error: 'Failed to delete blog' })
  }
})

// Increment views (Public)
router.put('/:id/view', async (req, res) => {
  try {
    const blog = await Blog.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    )
    res.json({ success: true, data: blog })
  } catch (error) {
    console.error('Error incrementing view:', error.message)
    res.status(500).json({ success: false, error: 'Failed to increment view' })
  }
})

// Toggle like (Public)
router.put('/:id/like', async (req, res) => {
  try {
    const { action } = req.body // Action could be 'like' or 'unlike'
    const incrementAmount = action === 'unlike' ? -1 : 1
    
    const blog = await Blog.findByIdAndUpdate(
      req.params.id,
      { $inc: { likes: incrementAmount } },
      { new: true }
    )
    res.json({ success: true, data: blog })
  } catch (error) {
    console.error('Error updating likes:', error.message)
    res.status(500).json({ success: false, error: 'Failed to update likes' })
  }
})

export default router
