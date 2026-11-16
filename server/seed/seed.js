// Load the demo catalogue into MongoDB: `npm run seed` (add --reset to wipe products first).
// Images point at /products/*.png, which Vercel serves from the public/ folder.
import { readFile } from 'fs/promises';
import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import Product from '../models/Product.js';

const products = JSON.parse(await readFile(new URL('./products.json', import.meta.url)));

await connectDB();
if (process.argv.includes('--reset')) {
  await Product.deleteMany({});
  console.log('Removed existing products');
}
const count = await Product.countDocuments();
if (count > 0 && !process.argv.includes('--reset')) {
  console.log(`Database already has ${count} products. Run "npm run seed -- --reset" to replace them.`);
} else {
  await Product.insertMany(products);
  console.log(`Inserted ${products.length} demo products`);
}
await mongoose.disconnect();
