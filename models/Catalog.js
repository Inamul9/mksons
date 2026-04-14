import mongoose from 'mongoose'

const catalogSchema = new mongoose.Schema(
  {
    category: { type: String, required: true },
    fileName: { type: String, required: true },
    fileUrl: { type: String, required: true },  // base64 data URL or hosted URL
    fileType: { type: String, default: 'application/pdf' },
    uploadedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
)

export default mongoose.model('Catalog', catalogSchema)
