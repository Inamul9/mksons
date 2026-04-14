import mongoose from 'mongoose'

const whatsappSettingsSchema = new mongoose.Schema(
  {
    phoneNumber: { type: String, required: true, default: '+919876543210' },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
)

// Singleton pattern - ensure only one document exists
whatsappSettingsSchema.statics.getSettings = async function() {
  let settings = await this.findOne()
  if (!settings) {
    settings = await this.create({ phoneNumber: '+919876543210' })
  }
  return settings
}

export default mongoose.model('WhatsAppSettings', whatsappSettingsSchema)
