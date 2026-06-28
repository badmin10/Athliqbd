# Athliqbd Store — Setup & Deployment Guide

Welcome! This is a full-stack **badminton & running gear e-commerce site** built with Next.js, Prisma, SQLite, and Tailwind CSS. Below are step-by-step instructions to get it running on your machine and deploy it live.

## What You're Getting

**Storefront** (`/`):
- Homepage with featured products and sport-grouped category navigation
- Shop by sport (Badminton / Running) → category (Rackets, Running Shoes, etc.)
- Site-wide search
- Product detail pages with specs (racquet weights, running shoe cushioning, etc.) and customer star ratings
- Cart (stored in browser localStorage, no user accounts needed)
- Checkout with whichever payment methods you've enabled (COD, bKash, Nagad, etc.)
- Order tracking by order number + phone
- All prices in Bangladesh Taka (৳)

**Admin Dashboard** (`/admin`):
- Secure login (email + password, protected with NextAuth)
- Products: Create, edit, delete with image uploads, specs, featured/published toggles
- Categories: Grouped by sport, manage under each sport
- Sports: Add new sports if you expand (Tennis, Cricket, etc.) later
- Payment Methods: Add, edit, or disable how customers pay — no code changes
- Reviews: Approve or delete customer-submitted reviews before they go public
- Orders: View incoming orders, update status, mark as paid
- Analytics: Monthly revenue, best sellers (last 30 days), low stock alerts

**Tech Stack**:
- **Frontend**: React 19 + Next.js 16 (App Router)
- **Backend**: Node.js API routes built into Next.js
- **Database**: SQLite (a single `.db` file—zero server setup needed)
- **ORM**: Prisma (type-safe database queries)
- **Auth**: NextAuth (admin login only, storefront is anonymous)
- **Styling**: Tailwind CSS 4 with custom design tokens (Victor brand colors)
- **File storage**: Local uploads to `/public/uploads/`

---

## Prerequisites

Ensure you have:
- **Node.js** v20+ (check with `node --version`)
- **npm** 10+ (check with `npm --version`)
- A text editor (VS Code recommended)
- **Git** (optional, for version control)

---

## Installation & Setup (On Your Machine)

### 1. Copy the project to your computer

If you have the code as a folder, open a terminal and navigate to it:

```bash
cd victor-bd
```

### 2. Install dependencies

```bash
npm install
```

This installs ~460 packages listed in `package.json`.

**Note for npm 11.16+ (most current installs)**: npm now skips install scripts for packages it hasn't explicitly approved, as a supply-chain security measure ahead of npm v12. You'll likely see a warning like:

```
npm warn allow-scripts 6 packages have install scripts not yet covered by allowScripts:
npm warn allow-scripts   @prisma/client@6.19.3 ...
```

This matters here — Prisma's install scripts download its database engine binaries, and `tsx` (used for seeding) depends on `esbuild`'s native binary. Approve them and re-run the install scripts:

```bash
npm approve-scripts --all
npm rebuild
```

This is safe for this project — it's approving exactly the dependencies already declared in `package.json` (Prisma, esbuild, sharp, etc.), not anything unexpected.

### 3. Generate the Prisma client and create the database

The database schema is defined in `/prisma/schema.prisma`. Now you need to generate the TypeScript client and apply the schema to SQLite.

```bash
npx prisma generate
npx prisma migrate dev --name init
```

This will:
- Download the Prisma engine binaries (first time only)
- Generate the `@prisma/client` types
- Create a `/prisma/dev.db` file (your database)
- Apply all migrations

If prompted for a migration name, you can just press Enter or type `init`.

### 4. Seed the database with sample data

Populate the database with 2 sports, 9 categories, 20 products (13 badminton + 7 running), and a test admin user:

```bash
npm run seed
```

**Important**: Note the credentials printed at the end:
- **Email**: `admin@athliqbd.com`
- **Password**: `ChangeMe123!`

**Change this password immediately after your first login.**

### 5. Set up environment variables

A `.env` file already exists with:
- `DATABASE_URL="file:./prisma/dev.db"` (points to SQLite)
- `AUTH_SECRET="replace-this-with-a-real-random-secret"`

Generate a real secret for production:

```bash
openssl rand -base64 32
```

Copy the output and replace the placeholder in `.env`:

```
AUTH_SECRET="your-generated-secret-here"
```

### 6. Run the development server

```bash
npm run dev
```

The server starts on **http://localhost:3000**. Open it in your browser.

---

## First-Time Testing

### Storefront

1. Visit **http://localhost:3000** — you'll see the homepage with featured badminton and running gear.
2. Click "Badminton" or "Running" in the nav to browse by sport.
3. Click any product to see details (racquet specs like "4U G5" weight for rackets, or shoe cushioning for running shoes).
4. Add items to cart, proceed to checkout, enter your name/phone/address, and place an order (COD).
5. After checkout, you'll see an order confirmation with an order number (e.g., `#ATL-ABC123`).
6. Visit `/track-order` and search by order number + phone to see order status.

### Admin Dashboard

1. Visit **http://localhost:3000/admin** — you'll be redirected to login.
2. Sign in with:
   - Email: `admin@athliqbd.com`
   - Password: `ChangeMe123!`
3. Explore:
   - **Dashboard**: See this month's revenue, pending orders, best-selling products.
   - **Products**: Click "Edit" on any product to modify price/description/stock. Click "+ Add Product" to add new ones. You can upload images (max 5MB, JPEG/PNG/WebP).
   - **Categories**: Add new categories under each sport, or even add a new sport (Tennis, Cricket, etc.) if you expand later.
   - **Orders**: Click any order to mark it as "confirmed", "shipped", or "delivered". When you collect cash, mark it "paid".

---

## Customization

### Change Your Store Name / Branding

- **Site title**: Edit `src/app/layout.tsx` line 24–26 (metadata title/description)
- **Header logo**: File is `src/components/SiteHeader.tsx` — change "VICTOR" and "BD" text
- **Footer**: File is `src/components/SiteFooter.tsx`

### Change Colors

Edit `/src/app/globals.css`:
- `--color-ink`: Main text (currently `#142019`, deep green-black)
- `--color-court-green`: Badminton accent (currently `#0b6e4f`)
- `--color-track-orange`: Running accent (currently `#e15226`)
- `--color-court-white`: Background (currently `#f7f5f1`, warm chalk-white)

### Add or Change Payment Methods

Go to **Admin → Payment Methods** — no code changes needed. Add a method
(name, instructions, whether it needs a transaction ID), toggle it on/off,
or edit the bKash/Nagad numbers seeded as placeholders.

### Moderate Reviews

Go to **Admin → Reviews** — every customer-submitted review starts hidden
until you approve it there.

### Change Delivery Fee

Open `/src/app/api/orders/route.ts` line 15:
```typescript
const DELIVERY_FEE = 80; // BDT
```

Change `80` to your flat delivery cost.

### Payment Methods Are Already Configurable

bKash, Nagad, and Cash on Delivery are built in — manage them from Admin →
Payment Methods (see "Add or Change Payment Methods" above). These all work
by manual verification: the customer sends money and enters a transaction
ID, and you confirm it yourself before marking the order paid.

**If you later want a real payment gateway** (SSLCommerz, a card processor)
that confirms payment automatically instead of manually:
- Add a new API route that calls the gateway's API and verifies its webhook/callback
- Add a row in Payment Methods for it, or extend the `type` field to recognize it
- Swap `paymentStatus` to `"paid"` automatically from that webhook instead of an admin click

The schema doesn't need to change for this — `paymentMethodId`, `paymentReference`, and `paymentStatus` already support it.

---

## Deployment

### Option 1: Railway (Recommended for beginners)

[Railway](https://railway.app) is a simple, affordable hosting platform perfect for a Next.js app.

**⚠️ Important — Railway's filesystem is ephemeral by default.** Your SQLite database (`prisma/dev.db`) and uploaded product photos (`/public/uploads/`) will be **wiped on every redeploy** unless you attach a persistent Volume. You have two options:

#### Option 1A: Keep SQLite, add a Volume (simplest, no code changes)

1. Create a Railway account at https://railway.app and connect your GitHub repo (or upload the code)
2. In your service, add a **Volume** mounted at `/data`
3. Update `.env` (and Railway's environment variables) so the database lives on that volume:
   ```
   DATABASE_URL="file:/data/dev.db"
   ```
4. Also point uploads at the volume — easiest way is to symlink or mount `/public/uploads` to `/data/uploads` in your start script, since Next.js's `public/` folder isn't writable at runtime otherwise on most platforms
5. **Critical**: run `npx prisma migrate deploy` as part of your **start command**, not the build step. Railway's build/pre-deploy stage doesn't have access to volumes, so migrations run there would target a throwaway database that disappears before your app even starts. Your `package.json` start script should look like:
   ```json
   "start": "npx prisma migrate deploy && next start"
   ```
6. Set `AUTH_SECRET` as an environment variable (from `openssl rand -base64 32`)
7. Deploy — Railway auto-deploys on every push to `main`

#### Option 1B: Switch to Postgres (more robust for production)

Since your e-commerce site will be handling real orders, a managed database avoids the volume/migration quirks above entirely. The switch is small:

1. In Railway, add a **Postgres** plugin to your project (one click) — it gives you a `DATABASE_URL` automatically
2. In `prisma/schema.prisma`, change the datasource:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
3. Run `npx prisma migrate dev --name init` locally against the new Postgres URL to regenerate migrations, then `npx prisma migrate deploy` on Railway (this one's safe to run at build/pre-deploy time since Postgres isn't a local file)
4. For uploaded images, since `/public/uploads` still won't persist without a volume, either attach a small Volume just for `/uploads`, or use Railway's S3-compatible storage bucket (one click add) and update the upload API route to write there instead

**Recommendation**: if you're just testing locally or running a small pilot, Option 1A (SQLite + Volume) is fine and keeps things simple. Once you're taking real orders and want peace of mind, Option 1B (Postgres) is the safer long-term choice — and it's what Railway's own official Next.js + Prisma guides default to.

**Cost**: Free tier for small projects; $5/month Hobby plan covers most early-stage stores.

### Option 2: Render

[Render](https://render.com) is similar to Railway, also beginner-friendly.

1. Sign up at https://render.com
2. Create a new "Web Service" → connect GitHub
3. Set Node environment, environment variables (AUTH_SECRET, NODE_ENV=production)
4. Deploy

### Option 3: Self-Host on a VPS (Advanced)

If you have a Linux server (DigitalOcean, Linode, etc.):

1. SSH into your server
2. Install Node.js (`curl -fsSL https://deb.nodesource.com/setup_20.x | sudo bash && sudo apt install nodejs`)
3. Clone the repo
4. Run `npm install && npm run build && npm start`
5. Use **PM2** to keep the server running: `npm install -g pm2 && pm2 start "npm start"`
6. Set up **Nginx** as a reverse proxy pointing to `localhost:3000`
7. Install **Let's Encrypt SSL** (free) with Certbot

---

## Backups & Data Persistence

Since everything is SQLite (a single file), you only need to back up `/prisma/dev.db`:

- **On production**: Download the database file daily to your computer
- **Or use a backup service**: Railway and Render both have volume backups
- **Uploaded images**: Keep a backup of `/public/uploads/` too

Never commit `dev.db` or uploaded images to Git—they're already in `.gitignore`.

---

## Common Issues & Fixes

### "PORT 3000 is already in use"

Another app is running on that port. Either:
- Kill it: `lsof -ti:3000 | xargs kill -9` (Mac/Linux)
- Run on a different port: `npm run dev -- -p 3001`

### "Database locked" error

SQLite locks during concurrent writes. This is rare locally but possible on production. If it happens:
- Upgrade to **Postgres** (on Railway, just add a Postgres service)
- Or ensure only one process writes (use PM2 with single worker)

### Images not uploading

Check:
- `/public/uploads/` folder exists (should be created on first upload)
- File size < 5MB
- Format: JPEG, PNG, or WebP only
- Permissions: `/public` is writable

### Admin login not working

- Clear browser cookies and try again
- Check `.env` file has `AUTH_SECRET` set
- Verify the admin user exists: In your terminal, run `npx prisma studio` to see the database

### Prisma TypeScript errors after schema changes

After editing `/prisma/schema.prisma`, always run:
```bash
npx prisma generate
npx prisma migrate dev --name description-of-change
```

---

## File Structure Overview

```
victor-bd/
├── prisma/
│   ├── schema.prisma          # Database schema
│   ├── seed.ts                # Sample data seeder
│   └── dev.db                 # SQLite database (after npm run seed)
├── src/
│   ├── app/
│   │   ├── (storefront)/      # Public site (/shop, /product, /cart, /checkout)
│   │   ├── admin/             # Admin dashboard (/admin, /admin/products, etc.)
│   │   ├── api/               # API routes (/api/orders, /api/admin/*)
│   │   ├── layout.tsx         # Root layout, fonts, global styles
│   │   └── globals.css        # Design tokens, court-line patterns
│   ├── components/
│   │   ├── SiteHeader.tsx     # Nav with sports
│   │   ├── SiteFooter.tsx
│   │   ├── CartContext.tsx    # Shopping cart (localStorage)
│   │   ├── ProductCard.tsx
│   │   ├── admin/             # Admin-specific components
│   │   └── ...
│   └── lib/
│       ├── prisma.ts          # Prisma client singleton
│       ├── auth.ts            # NextAuth config
│       ├── utils.ts           # Utility functions (formatBDT, generateOrderNumber)
│       └── requireAdmin.ts    # Admin auth middleware
├── public/
│   └── uploads/               # User-uploaded product images
├── .env                       # Environment variables
├── .gitignore                 # (Excludes dev.db, .env, /public/uploads/*)
├── package.json
├── prisma.config.js           # Seed config
└── next.config.js
```

---

## Key Features Explained

### Products & Specs

- **Badminton racquets**: Weight/Grip (4U G5), Balance Point (Head Heavy), Flexibility (Stiff), String Tension (20-28 lbs), Material
- **Running shoes**: Size Range (EU 39-45), Terrain (Road/Trail), Cushioning (High/Medium/Minimal), Drop Height (8mm)
- Both are optional per product, so you can add other items (strings, apparel) without required specs

### Orders & Payment

- **Configurable payment methods**: Manage what's offered from Admin → Payment Methods — Cash on Delivery, bKash, and Nagad come seeded by default, all collected manually (no merchant gateway needed to start)
- **Reference IDs**: Methods like bKash/Nagad can require a transaction ID at checkout, which you verify manually before confirming the order
- **Payment Status**: Starts as "pending", you mark as "paid" once you've collected/verified payment
- **Order Status**: Tracked as "placed" → "confirmed" → "shipped" → "delivered"
- **Stock management**: Stock decrements on order creation; if order is cancelled, stock is restored

### Reviews

- Anyone can submit a review on a product page — no login required
- Reviews start hidden (`isApproved: false`) until you approve them from Admin → Reviews
- Approved reviews show a star rating on the product page and on product cards storefront-wide

### Security

- **Admin routes** (`/admin*`) require login with NextAuth JWT
- **Product prices** and order totals are set server-side (not editable by client)
- **Stock validation** happens on the server (client-side cart is trusted but verified at checkout)

---

## Next Steps After Deployment

1. **Change admin password**: After first login, go to account settings (if you add that page) or reset via database directly
2. **Add your products**: Tedious but important—upload good photos, accurate specs, correct prices
3. **Set up a bank account**: You'll need to receive COD cash; some delivery partners offer digital collection
4. **Promote to customers**: Social media, local badminton clubs, running communities
5. **Track analytics**: The dashboard shows monthly revenue and top sellers
6. **Plan for growth**: Once you're comfortable, add Stripe/SSLCommerz for online payment, or expand to more sports

---

## Support & Troubleshooting

**If something breaks:**
1. Check the browser console (F12 → Console tab) for frontend errors
2. Check terminal output for server errors
3. Check the `.env` file for missing variables
4. Try `npm run dev` again and look for stack traces

**For Prisma issues:**
- Run `npx prisma studio` to open a GUI for your database and verify data
- Run `npx prisma migrate status` to see migration history

**For deployment issues:**
- Read the platform docs (Railway/Render have excellent error logs)
- Check that all environment variables are set

---

## License & Disclaimer

This code is yours to use, modify, and deploy. It's built with open-source tools (Next.js, Prisma, Tailwind).

**Important**: This is **not** an official store for Victor, ASICS, Nike, Adidas, or Hoka. You are an independent reseller. Display this clearly on your site (footer already includes a disclaimer).

---

Good luck! Feel free to customize, experiment, and grow. 🏸🏃‍♂️
