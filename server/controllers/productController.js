import mongoose from 'mongoose';
import Product from '../models/Product.js';
import { uploadBuffer, isCloudinaryReady } from '../config/cloudinary.js';
import demoProducts from '../seed/products.js';

export const CATEGORIES = ['Vegetables', 'Fruits', 'Drinks', 'Instant', 'Dairy', 'Bakery', 'Grains'];

// GET /api/product/list
export async function productList(req, res) {
  const products = await Product.find({}).sort({ createdAt: -1 }).lean();
  res.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
  res.json({ success: true, products });
}

// GET /api/product/:id
export async function productById(req, res) {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ success: false, message: 'Product not found' });
  const product = await Product.findById(req.params.id).lean();
  if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
  res.json({ success: true, product });
}

// POST /api/product/add  (multipart: productData JSON + images[])
export async function addProduct(req, res) {
  let data;
  try {
    data = JSON.parse(req.body.productData || '{}');
  } catch {
    return res.status(400).json({ success: false, message: 'Invalid product data' });
  }
  const { name, category } = data;
  const price = Number(data.price);
  const offerPrice = Number(data.offerPrice);
  const description = Array.isArray(data.description)
    ? data.description
    : String(data.description || '').split('\n');

  if (!name?.trim() || !CATEGORIES.includes(category) || !(price > 0) || !(offerPrice > 0)) {
    return res.status(400).json({ success: false, message: 'Name, category and valid prices are required' });
  }
  if (offerPrice > price) {
    return res.status(400).json({ success: false, message: 'Offer price cannot be higher than the price' });
  }
  if (!req.files?.length) return res.status(400).json({ success: false, message: 'Add at least one image' });
  if (!isCloudinaryReady()) {
    return res.status(500).json({ success: false, message: 'Image storage (Cloudinary) is not configured on the server' });
  }

  const image = await Promise.all(req.files.map((f) => uploadBuffer(f.buffer)));
  const product = await Product.create({
    name: name.trim(),
    category,
    price,
    offerPrice,
    description: description.map((d) => d.trim()).filter(Boolean),
    image,
  });
  res.status(201).json({ success: true, message: 'Product added', product });
}

// POST /api/product/stock  { id, inStock }
export async function changeStock(req, res) {
  const { id, inStock } = req.body || {};
  if (!mongoose.isValidObjectId(id)) return res.status(400).json({ success: false, message: 'Invalid product' });
  await Product.findByIdAndUpdate(id, { inStock: Boolean(inStock) });
  res.json({ success: true, message: 'Stock updated' });
}

// POST /api/product/delete  { id }
export async function deleteProduct(req, res) {
  const { id } = req.body || {};
  if (!mongoose.isValidObjectId(id)) return res.status(400).json({ success: false, message: 'Invalid product' });
  await Product.findByIdAndDelete(id);
  res.json({ success: true, message: 'Product deleted' });
}

// POST /api/product/seed-demo  – loads the demo catalogue, only when the store has no products yet
export async function seedDemo(req, res) {
  const count = await Product.countDocuments();
  if (count > 0) return res.status(400).json({ success: false, message: `Store already has ${count} products` });
  await Product.insertMany(demoProducts);
  res.status(201).json({ success: true, message: `Loaded ${demoProducts.length} demo products` });
}
