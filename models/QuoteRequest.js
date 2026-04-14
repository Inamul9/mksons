import mongoose from 'mongoose'

const quoteRequestSchema = new mongoose.Schema(
  {
    category: { type: String, required: true, trim: true },
    fileName: { type: String, required: true, trim: true },
    fileUrl: { type: String, required: true, trim: true },
    customerName: { type: String, required: true, trim: true },
    customerEmail: { type: String, required: true, trim: true, lowercase: true },
    customerPhone: { type: String, trim: true },
    company: { type: String, trim: true },
    quantity: { type: Number, min: 1 },
    message: { type: String, trim: true },
    status: { type: String, enum: ['pending', 'contacted', 'quoted', 'accepted', 'rejected', 'closed'], default: 'pending' },
    isRead: { type: Boolean, default: false },
    adminNotes: { type: String, trim: true },
    quotedAmount: { type: Number, min: 0 },
  },
  { timestamps: true }
)

export default mongoose.model('QuoteRequest', quoteRequestSchema)
