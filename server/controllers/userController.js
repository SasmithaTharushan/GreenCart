import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { cookieOptions, signToken, isEmail, verifyToken } from '../utils/auth.js';

const publicUser = (u) => ({ _id: u._id, name: u.name, email: u.email, cartItems: u.cartItems || {} });

// POST /api/user/register
export async function register(req, res) {
  const { name, email, password } = req.body || {};
  if (!name?.trim() || !isEmail(email) || typeof password !== 'string') {
    return res.status(400).json({ success: false, message: 'Name, a valid email and a password are required' });
  }
  if (password.length < 8) {
    return res.status(400).json({ success: false, message: 'Password must be at least 8 characters' });
  }
  const exists = await User.findOne({ email: email.toLowerCase().trim() });
  if (exists) return res.status(409).json({ success: false, message: 'An account with this email already exists' });

  const user = await User.create({
    name: name.trim(),
    email,
    password: await bcrypt.hash(password, 10),
  });
  res.cookie('token', signToken({ id: user._id.toString() }), cookieOptions());
  res.status(201).json({ success: true, user: publicUser(user) });
}

// POST /api/user/login
export async function login(req, res) {
  const { email, password } = req.body || {};
  if (!isEmail(email) || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required' });
  }
  const user = await User.findOne({ email: email.toLowerCase().trim() });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ success: false, message: 'Invalid email or password' });
  }
  res.cookie('token', signToken({ id: user._id.toString() }), cookieOptions());
  res.json({ success: true, user: publicUser(user) });
}

// GET /api/user/is-auth  (guests get 200 + success:false, so browsers don't log an error on every visit)
export async function isAuth(req, res) {
  let id;
  try {
    id = req.cookies.token && verifyToken(req.cookies.token).id;
  } catch {
    id = null;
  }
  const user = id && (await User.findById(id));
  if (!user) return res.json({ success: false, user: null });
  res.json({ success: true, user: publicUser(user) });
}

// GET /api/user/logout
export async function logout(req, res) {
  const { maxAge, ...opts } = cookieOptions();
  res.clearCookie('token', opts);
  res.json({ success: true, message: 'Logged out' });
}
