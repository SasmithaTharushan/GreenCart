import Address from '../models/Address.js';
import { isEmail } from '../utils/auth.js';

const FIELDS = ['firstName', 'lastName', 'email', 'street', 'city', 'state', 'zipcode', 'country', 'phone'];

// POST /api/address/add  { address }
export async function addAddress(req, res) {
  const input = req.body?.address || {};
  const address = {};
  for (const f of FIELDS) {
    const v = String(input[f] ?? '').trim();
    if (!v) return res.status(400).json({ success: false, message: `Please fill in ${f}` });
    address[f] = v.slice(0, 200);
  }
  if (!isEmail(address.email)) return res.status(400).json({ success: false, message: 'Enter a valid email' });
  const saved = await Address.create({ ...address, userId: req.userId });
  res.status(201).json({ success: true, message: 'Address saved', address: saved });
}

// GET /api/address/get
export async function getAddresses(req, res) {
  const addresses = await Address.find({ userId: req.userId }).sort({ createdAt: -1 }).lean();
  res.json({ success: true, addresses });
}
