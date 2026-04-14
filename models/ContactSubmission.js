import mongoose from 'mongoose'

const contactSubmissionSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, trim: true },
    message: { type: String, required: true },
    giftType: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    status: { type: String, enum: ['new', 'contacted', 'closed'], default: 'new' },
  },
  { timestamps: true }
)

export default mongoose.model('ContactSubmission', contactSubmissionSchema)
