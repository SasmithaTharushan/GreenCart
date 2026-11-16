// Vercel serverless entry: every /api/* request (plus /sitemap.xml and /robots.txt)
// is rewritten here by vercel.json and handled by the Express app.
import app from '../server/app.js';

export default app;
