// Public site settings. Override any of these with VITE_* variables in Vercel.
const env = import.meta.env;
// Vercel trims trailing spaces, so add one after letter-based symbols ("Rs" -> "Rs 35").
const rawCurrency = (env.VITE_CURRENCY || '$').trim();

export const site = {
  name: 'GreenCart',
  tagline: 'Fresh groceries delivered to your door',
  description:
    'GreenCart delivers fresh vegetables, fruits, dairy, bakery and pantry essentials to your doorstep. Great prices, fast delivery, cash on delivery.',
  url: (env.VITE_SITE_URL || (typeof window !== 'undefined' ? window.location.origin : '')).replace(/\/$/, ''),
  currency: /[A-Za-z.]$/.test(rawCurrency) ? `${rawCurrency} ` : rawCurrency,
  currencyCode: env.VITE_CURRENCY_CODE || 'USD', // ISO code for analytics (e.g. LKR)
  whatsapp: (env.VITE_WHATSAPP_NUMBER || '').replace(/[^\d]/g, ''),
  email: env.VITE_CONTACT_EMAIL || '',
  social: [
    { text: 'Instagram', url: env.VITE_INSTAGRAM_URL },
    { text: 'Facebook', url: env.VITE_FACEBOOK_URL },
    { text: 'TikTok', url: env.VITE_TIKTOK_URL },
  ].filter((s) => s.url),
};

export const whatsappLink = (text = '') =>
  site.whatsapp ? `https://wa.me/${site.whatsapp}${text ? `?text=${encodeURIComponent(text)}` : ''}` : '';
