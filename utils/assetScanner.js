import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const ASSETS_PATH = path.join(__dirname, '../../assets')

export const scanAssets = () => {
  const imagesPath = path.join(ASSETS_PATH, 'images')
  const catalogsPath = path.join(ASSETS_PATH, 'catalogs')
  
  const products = []
  const catalogs = []
  
  // Scan images folder
  if (fs.existsSync(imagesPath)) {
    const categories = fs.readdirSync(imagesPath)
    categories.forEach(category => {
      const categoryPath = path.join(imagesPath, category)
      if (fs.statSync(categoryPath).isDirectory()) {
        const files = fs.readdirSync(categoryPath)
        files.forEach(file => {
          if (file.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
            const productName = path.parse(file).name
              .replace(/[-_]/g, ' ')
              .replace(/\b\w/g, l => l.toUpperCase())
            products.push({
              name: productName,
              category: category,
              image: `/assets/images/${category}/${file}`,
              price: 0,
              description: '',
            })
          }
        })
      }
    })
  }
  
  // Scan catalogs folder
  if (fs.existsSync(catalogsPath)) {
    const files = fs.readdirSync(catalogsPath)
    files.forEach(file => {
      if (file.endsWith('.pdf')) {
        const category = path.parse(file).name
        catalogs.push({
          category,
          fileName: file,
          fileUrl: `/assets/catalogs/${file}`,
        })
      }
    })
  }
  
  return { products, catalogs }
}
