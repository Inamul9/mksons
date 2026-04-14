import mongoose from 'mongoose'

const subcategorySchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true }
})

const categorySchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    description: { type: String, default: '' },
    subcategories: [subcategorySchema]
  },
  { timestamps: true }
)

export default mongoose.model('Category', categorySchema)
