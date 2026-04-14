import mongoose from 'mongoose'

const blogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    excerpt: { type: String, required: true },
    content: { type: String, required: true },
    imageUrl: { type: String, required: true },
    category: { type: String, required: true },
    readTime: { type: String, required: true },
    views: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
    themeColor: { type: String, default: '250 50% 30%' },
    publishedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
)

export default mongoose.model('Blog', blogSchema)
