import crypto from 'crypto';
import { cookieOptions, signToken } from '../utils/auth.js';

const safeEqual = (a = '', b = '') => {
  const x = Buffer.from(String(a));
  const y = Buffer.from(String(b));
  return x.length === y.length && crypto.timingSafeEqual(x, y);
};

// POST /api/seller/login  (credentials come from SELLER_EMAIL / SELLER_PASSWORD env vars)
export async function sellerLogin(req, res) {
  const { email, password } = req.body || {};
  if (!process.env.SELLER_EMAIL || !process.env.SELLER_PASSWORD) {
    return res.status(500).json({ success: false, message: 'Seller account is not configured on the server' });
  }
  if (!safeEqual(email?.trim().toLowerCase(), process.env.SELLER_EMAIL.toLowerCase()) || !safeEqual(password, process.env.SELLER_PASSWORD)) {
    return res.status(401).json({ success: false, message: 'Invalid seller credentials' });
  }
  res.cookie('sellerToken', signToken({ role: 'seller', email: process.env.SELLER_EMAIL }), cookieOptions());
  res.json({ success: true, message: 'Logged in' });
}

// GET /api/seller/is-auth
export async function sellerIsAuth(req, res) {
  res.json({ success: true });
}

// GET /api/seller/logout
export async function sellerLogout(req, res) {
  const { maxAge, ...opts } = cookieOptions();
  res.clearCookie('sellerToken', opts);
  res.json({ success: true, message: 'Logged out' });
}
