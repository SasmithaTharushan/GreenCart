import { verifyToken } from '../utils/auth.js';

export default function authUser(req, res, next) {
  const { token } = req.cookies;
  if (!token) return res.status(401).json({ success: false, message: 'Please log in' });
  try {
    const decoded = verifyToken(token);
    if (!decoded.id) throw new Error('bad token');
    req.userId = decoded.id;
    next();
  } catch {
    return res.status(401).json({ success: false, message: 'Session expired, please log in again' });
  }
}
