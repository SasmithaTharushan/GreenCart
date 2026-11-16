import mongoose from 'mongoose';
import Order, { ORDER_STATUSES } from '../models/Order.js';
import Product from '../models/Product.js';
import Address from '../models/Address.js';
import User from '../models/User.js';

const TAX_RATE = 0.02;
const round2 = (n) => Math.round(n * 100) / 100;

function cleanSource(src) {
  if (!src || typeof src !== 'object') return {};
  const out = {};
  for (const k of ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'referrer', 'landing']) {
    if (src[k]) out[k] = String(src[k]).slice(0, 200);
  }
  return out;
}

// POST /api/order/cod  { items: [{ product, quantity }], addressId, source }
export async function placeOrderCOD(req, res) {
  const { items, addressId, source } = req.body || {};
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ success: false, message: 'Your cart is empty' });
  }
  if (!mongoose.isValidObjectId(addressId)) {
    return res.status(400).json({ success: false, message: 'Please choose a delivery address' });
  }
  const address = await Address.findOne({ _id: addressId, userId: req.userId }).lean();
  if (!address) return res.status(400).json({ success: false, message: 'Address not found' });

  const ids = items.map((i) => i.product).filter((id) => mongoose.isValidObjectId(id));
  const products = await Product.find({ _id: { $in: ids } }).lean();
  const byId = new Map(products.map((p) => [p._id.toString(), p]));

  // Prices always come from the database, never from the browser.
  const orderItems = [];
  for (const i of items) {
    const p = byId.get(String(i.product));
    const qty = Math.floor(Number(i.quantity));
    if (!p || !(qty > 0)) continue;
    if (!p.inStock) return res.status(400).json({ success: false, message: `${p.name} is out of stock` });
    orderItems.push({ product: p._id, name: p.name, image: p.image[0], category: p.category, price: p.offerPrice, quantity: Math.min(qty, 99) });
  }
  if (!orderItems.length) return res.status(400).json({ success: false, message: 'No valid products in cart' });

  const subtotal = round2(orderItems.reduce((s, i) => s + i.price * i.quantity, 0));
  const tax = round2(subtotal * TAX_RATE);
  const { _id, userId, createdAt, updatedAt, __v, ...addressSnapshot } = address;

  const order = await Order.create({
    userId: req.userId,
    items: orderItems,
    subtotal,
    tax,
    amount: round2(subtotal + tax),
    address: addressSnapshot,
    paymentType: 'COD',
    source: cleanSource(source),
  });
  await User.findByIdAndUpdate(req.userId, { cartItems: {} });

  res.status(201).json({ success: true, message: 'Order placed', orderId: order._id, amount: order.amount });
}

// GET /api/order/user
export async function userOrders(req, res) {
  const orders = await Order.find({ userId: req.userId }).sort({ createdAt: -1 }).lean();
  res.json({ success: true, orders });
}

// GET /api/order/seller
export async function sellerOrders(req, res) {
  const orders = await Order.find({}).sort({ createdAt: -1 }).limit(500).lean();
  res.json({ success: true, orders });
}

// POST /api/order/status  { orderId, status }
export async function updateOrderStatus(req, res) {
  const { orderId, status } = req.body || {};
  if (!mongoose.isValidObjectId(orderId) || !ORDER_STATUSES.includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid order or status' });
  }
  const update = { status };
  if (status === 'Delivered') update.isPaid = true; // COD is collected on delivery
  await Order.findByIdAndUpdate(orderId, update);
  res.json({ success: true, message: 'Order updated' });
}
