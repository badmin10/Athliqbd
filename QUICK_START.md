# Quick Start Checklist

Complete these steps in order. Each one should take 1-3 minutes.

## Already set this up before? Do this instead

If you have a working copy from an earlier version (before payment methods,
reviews, and search were added), extract the new files over your existing
`victor-bd` folder — it won't touch `node_modules`, `.env`, or your database
— then run:

```bash
npx prisma generate
npx prisma migrate dev --name add-payments-reviews-search
npm run seed
npm run dev
```

This adds the new tables without deleting any existing products or orders.
The seed step also adds a new admin login (`admin@athliqbd.com` /
`ChangeMe123!`) alongside your old one — both will work, but **note the
bKash and Nagad phone numbers in the seed data are placeholders**
(`01XXXXXXXXX`) — update them with your real numbers from **Admin → Payment
Methods** before going live. Then skip to "Test the Site" below.

## On Your Computer (One-Time Setup)

- [ ] **Step 1**: Open terminal, navigate to the `victor-bd` folder
  ```bash
  cd victor-bd
  ```

- [ ] **Step 2**: Install dependencies
  ```bash
  npm install
  ```
  *(Takes 1-2 minutes, watches a lot of packages download)*

- [ ] **Step 2b**: If you see a warning about `allow-scripts` (common on npm 11.16+), approve and rebuild:
  ```bash
  npm approve-scripts --all
  npm rebuild
  ```
  *(This is npm's newer security check — it skips install scripts by default until approved. Prisma and esbuild need their scripts to run, so this step matters.)*

- [ ] **Step 3**: Generate Prisma and create the database
  ```bash
  npx prisma generate
  npx prisma migrate dev --name init
  ```
  *(Downloads Prisma engine on first run, then creates `/prisma/dev.db`)*

- [ ] **Step 4**: Seed sample data (2 sports, 9 categories, 20 products, admin user)
  ```bash
  npm run seed
  ```
  **Save these credentials:**
  - Email: `admin@athliqbd.com`
  - Password: `ChangeMe123!`
  - ⚠️ Change this password immediately after first login

- [ ] **Step 5**: Generate a secure secret for NextAuth
  ```bash
  openssl rand -base64 32
  ```
  Copy the output, then open `.env` and replace the `AUTH_SECRET` placeholder with it.

- [ ] **Step 6**: Start the development server
  ```bash
  npm run dev
  ```
  *(Builds and starts on http://localhost:3000)*

## Test the Site (5 minutes)

### Storefront (Anonymous User)
- [ ] Visit http://localhost:3000 — see the homepage
- [ ] Click "Badminton" or "Running" in the nav
- [ ] Try the search bar in the header — search "racket" or "shoe"
- [ ] Click a product, see details with specs and a star rating (if reviews exist)
- [ ] Scroll to the bottom of a product page and submit a test review
- [ ] Add something to cart, go to checkout
- [ ] Pick a payment method (COD, bKash, Nagad) — notice the instructions change per method
- [ ] Enter fake name/phone/address, place an order
- [ ] See confirmation with order number and your chosen payment method
- [ ] Visit http://localhost:3000/track-order, search by order number + phone → verify order appears

### Admin Dashboard (Logged In)
- [ ] Visit http://localhost:3000/admin → redirects to login
- [ ] Sign in: `admin@athliqbd.com` / `ChangeMe123!`
- [ ] You're now on the Dashboard — see revenue, pending orders, best sellers, low stock alerts
- [ ] Click **Products**: See the list of 20 products (13 badminton + 7 running), grouped by sport/category
- [ ] Click **Edit** on any product: See the form with racquet specs (e.g., "Weight/Grip") or running specs (e.g., "Shoe Size Range")
- [ ] Click **Categories**: See the two sports (Badminton, Running) with their categories listed underneath
- [ ] Click **Payment Methods**: See COD/bKash/Nagad — edit the bKash/Nagad instructions to use your real numbers
- [ ] Click **Reviews**: See the test review you submitted, sitting under "Pending" — click **Approve**, then check it now shows on the product page
- [ ] Click **Orders**: See your test order, click it, mark status as "confirmed" → "shipped", etc.
- [ ] Click the **Sign Out** button at bottom left

## Before Going Live (When Ready to Deploy)

- [ ] Open `src/app/layout.tsx` and change the site title/description to your branding
- [ ] Open `src/components/SiteHeader.tsx` and customize the logo text (currently "VICTOR" + "BD")
- [ ] Open `/src/app/globals.css` and customize colors if desired:
  - `--color-track-orange` → Running accent color
  - `--color-court-green` → Badminton accent color
  - `--color-ink` → Your text color
- [ ] Open `/src/app/api/orders/route.ts` line 15 and set your delivery fee (currently `80` BDT)
- [ ] Click Admin → **Payment Methods** and replace the placeholder bKash/Nagad numbers (`01XXXXXXXXX`) with your real ones
- [ ] Add your actual products: Click Admin → Products → "+ Add Product", upload images, set real prices/stock
- [ ] Delete the test admin user and create your own (use `npx prisma studio` to edit database directly, or add an admin management page later)
- [ ] Read the **SETUP_GUIDE.md** file in this folder for deployment instructions (Railway, Render, or self-hosted)

## Troubleshooting

**"npm: command not found"**
→ Node.js not installed. Download from https://nodejs.org (v20+)

**"PORT 3000 already in use"**
→ Kill it: `lsof -ti:3000 | xargs kill -9` or run on a different port: `npm run dev -- -p 3001`

**"Error: Cannot find module @prisma/client"**
→ Run `npm install` again, then `npx prisma generate`

**Admin login not working**
→ Clear browser cookies, verify `.env` has `AUTH_SECRET`, check admin user exists via `npx prisma studio`

**Images not uploading**
→ Check `/public/uploads/` folder exists, file < 5MB, format is JPEG/PNG/WebP

---

**Done?** You're ready to start customizing and adding your own products! 🎉
