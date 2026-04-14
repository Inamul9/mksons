import mongoose from 'mongoose'

const footerSettingsSchema = new mongoose.Schema(
  {
    brandName: { type: String, default: 'Corporate Gifts' },
    brandDescription: { 
      type: String, 
      default: 'Premium corporate gifting solutions for businesses. Elevate your brand with our curated collection of luxury gifts.' 
    },
    contactEmail: { type: String, default: 'info@corporategiftsemporium.com' },
    contactPhone: { type: String, default: '+91 98765 43210' },
    address: { type: String, default: '123 Business District, Corporate City, India 400001' },
    socialLinks: {
      facebook: { type: String, default: '#' },
      twitter: { type: String, default: '#' },
      instagram: { type: String, default: '#' },
      linkedin: { type: String, default: '#' },
    },
    quickLinks: [
      {
        label: { type: String, required: true },
        url: { type: String, required: true },
      },
    ],
    footerText: { 
      type: String, 
      default: '© {year} Corporate Gifts Emporium. All rights reserved.' 
    },
    marqueeText: { type: String, default: '' },
    footerCreditText: { type: String, default: 'Website Designed by ankurdigital.in' },
    footerCreditUrl: { type: String, default: 'https://ankurdigital.in' },
    homeCategories: [
      {
        id: String,
        title: String,
        description: String,
        imageSrc: String,
        href: String,
        tag: String,
        ctaLabel: String
      }
    ],
    customerLinks: [
      {
        label: { type: String, required: true },
        url: { type: String, required: true },
      },
    ],
  },
  { timestamps: true }
)

// Ensure only one document exists (singleton pattern)
footerSettingsSchema.statics.getSettings = async function() {
  let settings = await this.findOne()
  if (!settings) {
    settings = await this.create({
      quickLinks: [
        { label: 'Home', url: '/' },
        { label: 'Products', url: '/products' },
        { label: 'Contact', url: '/contact' },
      ],
    })
  }
  return settings
}

export default mongoose.model('FooterSettings', footerSettingsSchema)
