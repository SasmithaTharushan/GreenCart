import Subscriber from '../models/Subscriber.js';
import Message from '../models/Message.js';
import Order from '../models/Order.js';
import { isEmail } from '../utils/auth.js';

// Optional: push new subscribers into a free Brevo list (BREVO_API_KEY + BREVO_LIST_ID).
async function syncToBrevo(email) {
  const key = process.env.BREVO_API_KEY;
  const listId = Number(process.env.BREVO_LIST_ID);
  if (!key || !listId) return false;
  try {
    const r = await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: { 'api-key': key, 'content-type': 'application/json', accept: 'application/json' },
      body: JSON.stringify({ email, listIds: [listId], updateEnabled: true }),
    });
    return r.ok;
  } catch (err) {
    console.error('Brevo sync failed', err.message);
    return false;
  }
}

// POST /api/marketing/subscribe  { email, source, website(honeypot) }
export async function subscribe(req, res) {
  const { email, source, website } = req.body || {};
  if (website) return res.json({ success: true, message: 'Subscribed' }); // bot filled the hidden field
  if (!isEmail(email)) return res.status(400).json({ success: false, message: 'Enter a valid email' });

  const normalized = email.toLowerCase().trim();
  const existing = await Subscriber.findOne({ email: normalized });
  if (existing) return res.json({ success: true, message: "You're already subscribed" });

  const sub = await Subscriber.create({ email: normalized, source: source && typeof source === 'object' ? source : {} });
  if (await syncToBrevo(normalized)) await Subscriber.updateOne({ _id: sub._id }, { syncedToBrevo: true });
  res.status(201).json({ success: true, message: 'Subscribed! Watch your inbox for deals.' });
}

// POST /api/marketing/contact  { name, email, message, website(honeypot) }
export async function contact(req, res) {
  const { name, email, message, website } = req.body || {};
  if (website) return res.json({ success: true, message: 'Message sent' });
  if (!name?.trim() || !isEmail(email) || !message?.trim()) {
    return res.status(400).json({ success: false, message: 'Name, a valid email and a message are required' });
  }
  await Message.create({ name, email, message });
  res.status(201).json({ success: true, message: "Thanks! We'll get back to you soon." });
}

const hostOf = (url) => {
  try {
    return url ? new URL(url).hostname : '';
  } catch {
    return '';
  }
};

// GET /api/marketing/overview  (seller)
export async function overview(req, res) {
  const [subscribers, messages, orders] = await Promise.all([
    Subscriber.find({}).sort({ createdAt: -1 }).limit(500).lean(),
    Message.find({}).sort({ createdAt: -1 }).limit(200).lean(),
    Order.find({ status: { $ne: 'Cancelled' } }, { amount: 1, source: 1, createdAt: 1 }).lean(),
  ]);
  const bySource = {};
  for (const o of orders) {
    const key = o.source?.utm_source || hostOf(o.source?.referrer) || 'direct';
    bySource[key] ??= { orders: 0, revenue: 0 };
    bySource[key].orders += 1;
    bySource[key].revenue = Math.round((bySource[key].revenue + o.amount) * 100) / 100;
  }
  res.json({
    success: true,
    stats: {
      subscribers: subscribers.length,
      orders: orders.length,
      revenue: Math.round(orders.reduce((s, o) => s + o.amount, 0) * 100) / 100,
      bySource,
    },
    subscribers,
    messages,
  });
}

// GET /api/marketing/subscribers.csv  (seller)
export async function subscribersCsv(req, res) {
  const subs = await Subscriber.find({}).sort({ createdAt: -1 }).lean();
  const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const rows = [['email', 'subscribed_at', 'utm_source', 'utm_campaign']].concat(
    subs.map((s) => [s.email, s.createdAt?.toISOString(), s.source?.utm_source, s.source?.utm_campaign])
  );
  res.set('Content-Type', 'text/csv');
  res.set('Content-Disposition', 'attachment; filename="greencart-subscribers.csv"');
  res.send(rows.map((r) => r.map(esc).join(',')).join('\n'));
}
