# Athliqbd — Badminton & Running Gear E-Commerce Store

A full-stack, self-hosted e-commerce site for selling badminton racquets, strings, shuttlecocks, and running shoes/apparel in Bangladesh. Built with Next.js, Prisma, SQLite, and Tailwind CSS.

```
🏸 Badminton: Rackets, Strings, Shuttlecocks, Bags, Grips, Court Shoes
🏃 Running: Running Shoes, Apparel, Accessories
💰 Payment: Manage your own methods from the admin panel — COD, bKash, Nagad, more
⭐ Reviews: Customers can review products; you approve before they go live
🔍 Search: Site-wide product search
📦 Database: SQLite (zero server needed)
🔒 Admin: Secure login, full product/order/payment/review management
```

---

## Getting Started

### 1. Prerequisites
- Node.js v20+ (check: `node --version`)
- npm 10+ (check: `npm --version`)

### 2. Quick Setup (5 minutes)

```bash
# Navigate to the project folder
cd victor-bd

# Install dependencies
npm install

# Initialize the database
npx prisma generate
npx prisma migrate dev --name init

# Populate with sample data
npm run seed

# Start the server
npm run dev
```

Visit **http://localhost:3000** in your browser.

**Test Login Credentials**:
- Email: `admin@athliqbd.com`
- Password: `ChangeMe123!` (change this immediately!)

---

## Documentation

Choose the guide that fits your needs:

| Document | Purpose | Time |
|----------|---------|------|
| **[QUICK_START.md](./QUICK_START.md)** | Step-by-step setup checklist | 5 min |
| **[SETUP_GUIDE.md](./SETUP_GUIDE.md)** | Detailed installation, customization, and deployment | 20 min |
| **[IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)** | Technical details of sport/category structure and later additions | Reference |

---

## Features

### Storefront (`/`)
- 🏠 Homepage with featured products and category browsing
- 🛍️ Shop by sport (Badminton / Running) → category
- 🔍 Site-wide search (header search bar, or `/search`)
- 📦 Product detail pages with specs (racquet weight, shoe cushioning, etc.)
- ⭐ Customer reviews — star ratings on every product, submit your own
- 🛒 Cart (stored in browser, no login needed)
- 💳 Checkout with your choice of enabled payment method (COD, bKash, Nagad, etc.)
- 📍 Order tracking by number + phone

### Admin Dashboard (`/admin`)
- 🔐 Secure login (email + password)
- 📸 Product management: create, edit, delete, upload images
- 🏷️ Category management, grouped by sport
- 🎯 Sport management (add Tennis, Cricket, etc. later)
- 💰 Payment methods: add/edit/disable how customers can pay, no code changes needed
- ⭐ Review moderation — approve or delete customer reviews before they go public
- 📋 Order tracking and status updates
- 📊 Analytics: revenue, best sellers, low stock alerts

---

## File Structure

```
victor-bd/
├── SETUP_GUIDE.md                  # Complete setup + deployment guide
├── QUICK_START.md                  # One-page checklist
├── IMPLEMENTATION_SUMMARY.md       # Technical implementation details
├── prisma/
│   ├── schema.prisma               # Database schema (Sport, Category, Product, Order)
│   ├── seed.ts                     # Sample data: 2 sports, 9 categories, 20 products
│   └── dev.db                      # SQLite database (after setup)
├── src/
│   ├── app/(storefront)/           # Public site: home, shop, product, cart, checkout
│   ├── app/admin/                  # Admin dashboard: products, categories, orders
│   ├── app/api/                    # REST API: orders, product management, uploads
│   ├── components/                 # Reusable React components
│   ├── lib/                        # Utilities: auth, database, formatting
│   └── app/globals.css             # Tailwind + design tokens (colors, fonts)
├── public/uploads/                 # User-uploaded product images
└── package.json
```

---

## Key Technologies

| Layer | Tech | Purpose |
|-------|------|---------|
| Frontend | React 19 + Next.js 16 (App Router) | UI, routing, server components |
| Backend | Node.js + Next.js API routes | REST API, order processing |
| Database | SQLite + Prisma ORM | Data persistence, type-safe queries |
| Auth | NextAuth v5 | Admin login only (storefront is anonymous) |
| Styling | Tailwind CSS 4 | Responsive design, utility-first |
| Hosting | Railway / Render / Self-hosted VPS | Cloud deployment options |

---

## Deployment

### Option 1: Railway (Recommended)
1. Sign up at https://railway.app
2. Connect GitHub repo or upload code
3. Set `AUTH_SECRET` environment variable
4. Deploy (auto-deploys on push)

**Cost**: Free tier for ~100K API calls/month

### Option 2: Render
Similar to Railway, also beginner-friendly.
- https://render.com

### Option 3: Self-Hosted
VPS (DigitalOcean, Linode, AWS) + Node.js + PM2 + Nginx

See [SETUP_GUIDE.md](./SETUP_GUIDE.md) for detailed steps.

---

## Customization

### Change Store Name
Edit `src/app/layout.tsx` (title/description) and `src/components/SiteHeader.tsx` (logo text).

### Change Brand Colors
Edit `src/app/globals.css`:
```css
--color-court-green: #0b6e4f;   /* Badminton accent */
--color-track-orange: #e15226;  /* Running accent */
--color-ink: #142019;           /* Text color */
--color-court-white: #f7f5f1;   /* Background color */
```

### Manage Payment Methods
Admin → Payment Methods → add, edit, or disable how customers pay. No code changes needed.

### Moderate Reviews
Admin → Reviews → approve or delete customer-submitted reviews before they appear on the site.

### Change Delivery Fee
Edit `src/app/api/orders/route.ts` line 15:
```typescript
const DELIVERY_FEE = 80; // Change this number (in BDT)
```

### Add a New Sport
Admin → Categories → "+ Add Sport" → Enter name → Categories automatically appear in dropdown when adding products.

---

## Database Schema

### Models
- **Sport**: Badminton, Running (add more anytime)
- **Category**: Rackets, Strings, etc. (linked to Sport)
- **Product**: Individual items with prices, stock, images, specs
- **Order**: COD orders with status tracking
- **AdminUser**: Login credentials

### Product Specs
- **Racquet fields**: Weight/Grip, Balance Point, Flexibility, String Tension, Material
- **Running shoe fields**: Size Range, Terrain Type, Cushioning, Drop Height
- All optional per product

---

## First-Time Use

1. Run `npm run dev` and visit http://localhost:3000
2. Browse the storefront (no login required)
3. Add items to cart, test checkout with fake data
4. Visit `/track-order` to search by order number + phone
5. Go to `/admin`, sign in, explore dashboard
6. Add your own products: Admin → Products → "+ Add Product"
7. Customize colors/name as above
8. Deploy to Railway/Render when ready

---

## Support & Troubleshooting

**Port 3000 already in use?**
```bash
# Kill the process
lsof -ti:3000 | xargs kill -9
# Or run on a different port
npm run dev -- -p 3001
```

**Database errors after schema changes?**
```bash
# Regenerate Prisma client
npx prisma generate
# Create a migration
npx prisma migrate dev --name description-of-change
```

**Admin login not working?**
- Clear cookies, try again
- Check `.env` has `AUTH_SECRET` set
- Use `npx prisma studio` to verify admin user exists

See [SETUP_GUIDE.md](./SETUP_GUIDE.md) for more solutions.

---

## Disclaimer

This is an **independent e-commerce site**, not an official store for Victor, ASICS, Nike, Adidas, or Hoka.

**Important**: Clearly display on your site that you are an independent reseller. The footer already includes this notice.

---

## License

Open source. Use, modify, and deploy freely.

---

## Next Steps

1. ✅ Run `npm run dev` to start locally
2. 📖 Read [QUICK_START.md](./QUICK_START.md) for the setup checklist
3. 🎨 Customize colors and store name
4. 📦 Add your products (admin dashboard)
5. 🚀 Deploy to Railway/Render using [SETUP_GUIDE.md](./SETUP_GUIDE.md)

Good luck! 🏸🏃
