import Product from '../models/Product.js';
import { CATEGORIES } from './productController.js';

const siteUrl = (req) =>
  (process.env.SITE_URL || `${req.headers['x-forwarded-proto'] || 'https'}://${req.headers.host}`).replace(/\/$/, '');

// GET /sitemap.xml
export async function sitemap(req, res) {
  const base = siteUrl(req);
  const products = await Product.find({ inStock: true }, { category: 1, updatedAt: 1 }).lean();
  const urls = [
    { loc: '/', priority: '1.0' },
    { loc: '/products', priority: '0.9' },
    { loc: '/contact', priority: '0.5' },
    ...CATEGORIES.map((c) => ({ loc: `/products/${c.toLowerCase()}`, priority: '0.8' })),
    ...products.map((p) => ({
      loc: `/products/${p.category.toLowerCase()}/${p._id}`,
      lastmod: p.updatedAt?.toISOString().slice(0, 10),
      priority: '0.7',
    })),
  ];
  const xml =
    '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    urls
      .map((u) => `  <url><loc>${base}${u.loc}</loc>${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ''}<priority>${u.priority}</priority></url>`)
      .join('\n') +
    '\n</urlset>';
  res.set('Content-Type', 'application/xml');
  res.set('Cache-Control', 'public, s-maxage=3600');
  res.send(xml);
}

// GET /robots.txt
export function robots(req, res) {
  res.type('text/plain').send(`User-agent: *\nAllow: /\nDisallow: /seller\nDisallow: /cart\nDisallow: /my-orders\n\nSitemap: ${siteUrl(req)}/sitemap.xml\n`);
}
