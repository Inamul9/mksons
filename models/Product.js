import mongoose from 'mongoose'

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    category: { type: String, required: true },
    subcategory: { type: String, default: '' },
    price: { type: Number, required: true, min: 0 },
    description: { type: String, required: true },
    imageUrl: { type: String, default: '' },
    stock: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
)

export default mongoose.model('Product', productSchema)
