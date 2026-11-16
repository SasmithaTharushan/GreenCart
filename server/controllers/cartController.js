import mongoose from 'mongoose';
import User from '../models/User.js';

// POST /api/cart/update  { cartItems: { [productId]: qty } }
export async function updateCart(req, res) {
  const raw = req.body?.cartItems;
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return res.status(400).json({ success: false, message: 'Invalid cart' });
  }
  const cartItems = {};
  for (const [id, qty] of Object.entries(raw)) {
    const n = Math.floor(Number(qty));
    if (mongoose.isValidObjectId(id) && n > 0 && n <= 99) cartItems[id] = n;
  }
  await User.findByIdAndUpdate(req.userId, { cartItems });
  res.json({ success: true });
}
