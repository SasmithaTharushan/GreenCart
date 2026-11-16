# GreenCart

A full-stack grocery store: React 19 + Vite + Tailwind CSS v4 on the front, an Express 5 + MongoDB API that runs as a Vercel serverless function, and a free marketing layer built in.

**What works**

- Customers can sign up and log in. Sessions use secure httpOnly cookies and passwords are hashed with bcrypt.
- Products are loaded from MongoDB, with search, category pages, product pages and related items.
- The cart is saved in the browser for guests, then synced to the account after login.
- Customers can save delivery addresses, check out with **cash on delivery**, and see their orders on **My Orders**.
- The **seller dashboard** is at `/seller`. From there you can add products (images go to Cloudinary), turn stock on and off, delete products, manage orders and their status, and see marketing stats.
- The contact form stores messages, and new messages appear in the seller dashboard.

**Free marketing layer**

| Feature | How to switch it on |
|---|---|
| SEO titles, descriptions, canonical links and Open Graph/Twitter previews on every page | Always on |
| `sitemap.xml` and `robots.txt`, generated from the live product list | Always on |
| Product structured data (JSON-LD) for Google rich results | Always on |
| Google Analytics 4 with e-commerce events (`view_item`, `add_to_cart`, `begin_checkout`, `purchase`, `sign_up`, `generate_lead`, `search`) | Set `VITE_GA_ID` |
| Meta Pixel, for Facebook and Instagram ads and retargeting | Set `VITE_META_PIXEL_ID` |
| Vercel Web Analytics | Enable it in the Vercel dashboard, then set `VITE_VERCEL_ANALYTICS=true` |
| Newsletter signups saved to MongoDB, with CSV export in the seller dashboard | Always on |
| Newsletter signups also synced to a free Brevo list | Set `BREVO_API_KEY` and `BREVO_LIST_ID` |
| WhatsApp chat button, plus "Ask on WhatsApp" on product pages | Set `VITE_WHATSAPP_NUMBER` |
| UTM and referrer tracking on orders and signups, shown as "Sales by traffic source" in the seller dashboard | Always on |
| Share button on product pages | Always on |

---

## Deploy to Vercel (free)

> Vercel's free Hobby plan is for **personal and non-commercial** projects, which covers this demo. If you start taking real orders, move to Vercel Pro or a host that allows commercial use.

### 1. Create a free MongoDB Atlas database
1. Go to <https://www.mongodb.com/cloud/atlas> and create a free **M0** cluster.
2. Under **Database Access**, add a user and password.
3. Under **Network Access**, add `0.0.0.0/0`. Vercel's IP addresses change, so the database has to accept connections from anywhere.
4. Click **Connect → Drivers** and copy the connection string. This is your `MONGODB_URI`.

### 2. Create a free Cloudinary account (for product images)
Go to <https://cloudinary.com>. In **Dashboard → API Keys**, copy your cloud name, API key and API secret.

### 3. Import the repo into Vercel
1. Go to <https://vercel.com/new> and import `GreenCart`. Vercel detects Vite automatically from `vercel.json`.
2. Before you deploy, add these **Environment Variables** (see `.env.example` for the full list):

| Name | Value |
|---|---|
| `MONGODB_URI` | Your Atlas connection string |
| `JWT_SECRET` | A long random string, e.g. the output of `openssl rand -hex 32` |
| `SELLER_EMAIL` / `SELLER_PASSWORD` | The login for `/seller` |
| `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | From Cloudinary |
| `VITE_CURRENCY` | `$` or `Rs ` (optional) |
| `VITE_CURRENCY_CODE` | `USD` or `LKR` (optional) |
| `SITE_URL` and `VITE_SITE_URL` | Your Vercel URL, e.g. `https://greencart.vercel.app` (optional) |
| `VITE_WHATSAPP_NUMBER`, `VITE_GA_ID`, `VITE_META_PIXEL_ID`, `BREVO_*` | Optional marketing settings |

3. Click **Deploy**. Variables that start with `VITE_` are built into the frontend, so **redeploy** whenever you change one of them.

### 4. Load the demo products (one time)
On your computer:

```bash
npm install
cp .env.example .env      # then paste in the same MONGODB_URI as on Vercel
npm run seed              # inserts the 35 demo products
```

The demo images are served from `public/images/products`. Products you add later from the seller dashboard upload their images to Cloudinary.

### 5. Check that it works
- `https://YOUR-SITE/api/health` should return `{"success":true}`.
- Go to `/products` and check that the products appear.
- Sign up, add something to the cart, add an address and place an order. It should then show up on **My Orders**.
- Go to `/seller`, log in, and check that the order appears under **Orders**.
- Visit `/sitemap.xml`. Then submit it in [Google Search Console](https://search.google.com/search-console).

---

## Run locally

```bash
npm install
cp .env.example .env   # fill in MONGODB_URI, JWT_SECRET, SELLER_* (and Cloudinary if you want uploads)
npm run seed           # first time only
npm run server         # API on http://localhost:4000
npm run dev            # site on http://localhost:5173 (proxies /api to :4000)
```

Run the server and the site in two separate terminals.

## Project structure

```
api/index.js            Vercel function entry, which loads the Express app
server/
  app.js                Express app (middleware, routes, error handler)
  routes/index.js       All /api routes
  controllers/          user, seller, product, cart, address, order, marketing, seo
  models/               User, Product, Address, Order, Subscriber, Message
  config/               MongoDB connection cache, Cloudinary
  seed/                 Demo catalogue and seed script
src/
  context/AppContext    Auth, products and cart state
  lib/                  api helper, analytics, image compression
  pages/                Storefront pages, plus seller/ for the dashboard
vercel.json             SPA and API rewrites, cache and security headers
```

## API reference

| Method | Path | Auth |
|---|---|---|
| POST | `/api/user/register`, `/api/user/login` | – |
| GET | `/api/user/is-auth`, `/api/user/logout` | user |
| POST | `/api/seller/login` · GET `/api/seller/is-auth`, `/api/seller/logout` | seller |
| GET | `/api/product/list`, `/api/product/:id` | – |
| POST | `/api/product/add` (multipart), `/api/product/stock`, `/api/product/delete` | seller |
| POST | `/api/cart/update` | user |
| POST | `/api/address/add` · GET `/api/address/get` | user |
| POST | `/api/order/cod` · GET `/api/order/user` | user |
| GET | `/api/order/seller` · POST `/api/order/status` | seller |
| POST | `/api/marketing/subscribe`, `/api/marketing/contact` | – |
| GET | `/api/marketing/overview`, `/api/marketing/subscribers.csv` | seller |

## Ideas for later
- Online payments, e.g. PayHere for Sri Lanka or Stripe.
- Real product reviews. The star ratings shown now are placeholders.
- Order confirmation emails through Brevo's transactional API.
- Discount or coupon codes.
