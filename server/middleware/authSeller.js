import { verifyToken } from '../utils/auth.js';

export default function authSeller(req, res, next) {
  const { sellerToken } = req.cookies;
  if (!sellerToken) return res.status(401).json({ success: false, message: 'Seller login required' });
  try {
    const decoded = verifyToken(sellerToken);
    if (decoded.role !== 'seller' || decoded.email !== process.env.SELLER_EMAIL) throw new Error('not seller');
    next();
  } catch {
    return res.status(401).json({ success: false, message: 'Seller session expired' });
  }
}
