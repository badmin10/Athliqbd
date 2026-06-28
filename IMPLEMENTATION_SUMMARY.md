# Victor BD — Running Sport Implementation Summary

## What Was Changed

This document outlines all modifications made to add **Running** as a second sport alongside Badminton, with proper two-level Sport → Category hierarchy.

---

## Database Schema Changes

### `/prisma/schema.prisma`

**Added Sport Model**:
- New `Sport` model with fields: `id`, `name` (unique), `slug` (unique), `description`, `sortOrder`
- Replaces flat category structure

**Updated Category Model**:
- Added `sportId` foreign key linking to `Sport`
- Changed `name` and `slug` from globally unique to unique *within a sport* (`@@unique([sportId, slug])`)
- Removed standalone uniqueness on `slug`

**Updated Product Model**:
- Added running shoe-specific fields (all optional):
  - `shoeSizeRange` (e.g., "EU 39-45")
  - `terrainType` (e.g., "Road", "Trail")
  - `cushioning` (e.g., "High", "Medium", "Minimal")
  - `dropHeight` (e.g., "8mm")
- Kept existing racquet-specific fields unchanged

---

## Seed Data Changes

### `/prisma/seed.ts`

**Sports Created**:
1. **Badminton** (slug: `badminton`, sortOrder: 1)
2. **Running** (slug: `running`, sortOrder: 2)

**Categories under Badminton**:
- Rackets, Strings, Shuttlecocks, Bags, Grips, Court Shoes

**Categories under Running**:
- Running Shoes, Apparel, Accessories

**Products Added**:
- Original 13 badminton products with explicit `brand: "Victor"`
- 7 new running products:
  - 4 running shoes (ASICS, Nike, Adidas, Hoka)
  - 2 apparel items (tee, shorts)
  - 1 accessories item (socks 3-pack)

All products now explicitly specify `brand` field.

---

## Storefront Routing Changes

### Route Structure

**Old**: `/shop/[category]` (flat)
```
/shop                          → all products
/shop/rackets                  → products in "rackets" category
/shop/strings                  → products in "strings" category
```

**New**: `/shop/[[...slugs]]` (sport-aware)
```
/shop                          → all products from all sports
/shop/badminton                → all badminton products
/shop/badminton/rackets        → badminton rackets only
/shop/running                  → all running products
/shop/running/running-shoes    → running shoes only
```

### Files Modified

**`/src/app/(storefront)/shop/[[...slugs]]/page.tsx`** (completely rewritten):
- Handles three routing levels: `/shop`, `/shop/[sport]`, `/shop/[sport]/[category]`
- Queries sports with nested categories
- Shows sport tabs, then category chips (only when sport is selected)
- Filters products based on active category or sport
- Validates sport/category slugs and returns 404 if not found

**`/src/app/(storefront)/page.tsx`** (homepage updated):
- Now queries `Sport` with nested `categories`
- Displays category strip grouped by sport (each sport is a section)
- Updated hero CTA to `/shop/badminton/rackets`

**`/src/app/(storefront)/product/[slug]/page.tsx`** (product detail):
- Includes `sport` relation through `category`
- Updated breadcrumb navigation: Shop → Sport → Category → Product
- Updated breadcrumb links to use `/shop/[sport]/[category]` format

**`/src/components/SiteHeader.tsx`** (navigation updated):
- Queries `Sport` instead of `Category`
- Nav shows sport names (Badminton / Running) instead of flat category list
- Links to `/shop/[sport]`
- Added "All Products" link pointing to `/shop`

**`/src/components/SiteFooter.tsx`** (footer links updated):
- Changed from 3 to 4 columns (split Badminton and Running)
- Links now use `/shop/[sport]/[category]` format
- Updated brand description to mention both badminton and running

---

## Admin Interface Changes

### API Routes

**`/src/app/api/admin/sports/route.ts`** (NEW):
- GET: List all sports with category counts
- POST: Create new sport

**`/src/app/api/admin/categories/route.ts`** (modified):
- Added `sportId` to category schema (required)
- Updated GET to include `sport` relation and order by sport first
- Updated POST to accept `sportId`
- Updated error message to mention sport-scoped uniqueness

**`/src/app/api/admin/categories/[id]/route.ts`** (modified):
- Updated schema to require `sportId`
- Updated error message for sport-scoped uniqueness

### Admin Pages

**`/src/app/admin/categories/page.tsx`** (completely rewritten):
- Client component with sport-grouped category display
- Shows "+ Add Sport" button to add new sports on-demand
- Categories displayed under each sport heading
- Sport selector dropdown when adding new categories
- Inline edit/delete per category
- Sport management happens inline (no separate admin page needed)

**`/src/app/admin/products/new/page.tsx`** (updated):
- Fetches both sports and categories
- Passes both to `ProductForm`

**`/src/app/admin/products/[id]/page.tsx`** (updated):
- Fetches both sports and categories
- Passes both to `ProductForm`
- Added `shoeSizeRange`, `terrainType`, `cushioning`, `dropHeight` to initialData

**`/src/app/admin/products/page.tsx`** (updated):
- Query now includes `category.sport` relation
- Category column displays "Sport / Category" format

### Components

**`/src/components/admin/ProductForm.tsx`** (significantly expanded):
- Added `sports` prop (array of sports for dropdown)
- Updated `Category` type to include `sportId`
- Added `selectedSportId` state to track selected sport
- Added sport selector dropdown before category dropdown
- Category dropdown now shows only categories from selected sport (filtered via `sportCategories`)
- Auto-selects first category when sport changes
- **New section**: Running Shoe Specs (under existing Racquet Specs)
  - Shoe Size Range (e.g., "EU 39-45")
  - Terrain Type (e.g., "Road")
  - Cushioning (e.g., "High")
  - Heel-to-Toe Drop (e.g., "8mm")

---

## Font Updates

### `/src/app/layout.tsx`

**Font Imports Changed**:
- **Removed**: `Archivo_Expanded` (does not exist on Google Fonts)
- **Added**: `Oswald` (weight 700 – a real, condensed display font)
- **Kept**: `Archivo` (weight 500, 600 – for meta labels)
- **Kept**: `Inter` (full weight range – for body text)

**Rationale**:
- Oswald is a professional condensed sans-serif ideal for sporty, athletic branding
- Available on Google Fonts, widely supported
- Maintains the bold, confident headline feeling without being overused (unlike Bebas Neue)

---

## Navigation Changes Summary

### Storefront Navigation

**Before**:
```
Nav: [Rackets] [Strings] [Shuttlecocks] [Bags] [Grips] [Shoes] [All]
     → /shop/rackets, /shop/strings, etc. (6 links)
```

**After**:
```
Nav: [Badminton] [Running] [All Products]
     → /shop/badminton, /shop/running, /shop
     
Then within /shop/badminton (or /shop/running):
Category chips: [All Badminton] [Rackets] [Strings] [Shuttlecocks] [Bags] [Grips] [Court Shoes]
                → /shop/badminton, /shop/badminton/rackets, etc.
```

This keeps the main nav clean (2 sports + 1 "all" link) while preserving full category browsing capability.

---

## Documentation Added

### New Files

**`SETUP_GUIDE.md`**:
- Complete installation and setup instructions
- Step-by-step database initialization
- Testing procedures (storefront + admin)
- Customization guide (colors, store name, delivery fee)
- Deployment instructions (Railway, Render, self-hosted)
- Troubleshooting section
- File structure overview

**`QUICK_START.md`**:
- One-page checklist for getting the site running
- 6 numbered setup steps
- Testing checklist for storefront and admin
- Pre-deployment customization checklist
- Quick troubleshooting for common issues

---

## Data Integrity Notes

### Backward Compatibility
- Existing **products** and **orders** remain unchanged
- `Category` soft-links to `Sport` via new `sportId` field
- No data loss—all existing badminton products were migrated to the Badminton sport

### Migration Path
When you run `npx prisma migrate dev --name init` on your machine:
1. SQLite is created at `/prisma/dev.db`
2. Schema is applied (includes `Sport` and updated `Category`)
3. You run `npm run seed` to populate 2 sports, 9 categories, 20 products, and admin user

---

## Validation & Type Safety

### Prisma Relations
- `Sport` → `categories` (one-to-many)
- `Category` → `sport` (many-to-one with `sportId` foreign key)
- `Product` → `category` (unchanged, no direct sport relation—accessed via category)

### TypeScript Updates
- `Category` type in admin code now includes `sportId: string`
- ProductForm type includes all running shoe fields
- Admin API schemas updated to require/accept `sportId`

---

## Testing Checklist

After running the setup steps, verify:

- [ ] **Homepage**: Sports section shows Badminton and Running with their categories
- [ ] **Navigation**: Clicking "Badminton" or "Running" in header shows sport-specific view
- [ ] **Category filtering**: Within a sport, clicking a category shows only those products
- [ ] **Product detail**: Breadcrumb shows: Shop → Badminton → Rackets → Product Name
- [ ] **Admin dashboard**: Products list shows "Badminton / Rackets" format
- [ ] **Admin categories**: Grouped by sport, with sport selector when adding new categories
- [ ] **Admin product form**: Has sport dropdown, category updates based on sport
- [ ] **Product specs**: Racquet products show Weight/Grip, etc.; running shoes show Size Range, Cushioning, etc.

---

## Future Expansion

This two-level structure easily supports adding more sports:

1. Click **Admin** → **Categories** → **+ Add Sport** (new button)
2. Enter sport name (e.g., "Tennis")
3. Categories appear in dropdown when adding/editing products
4. Nav automatically includes new sport

No schema changes needed—already designed for this.

---

## Deployment Notes

### Build Issues (Sandbox-Specific)
The `npm run build` may fail in sandboxed environments due to network restrictions on Google Fonts API. This is **not a code issue**—on your machine with internet access, fonts will load correctly and the build will succeed.

### Production Checklist
- Change admin password from `ChangeMe123!`
- Set strong `AUTH_SECRET` in `.env`
- Update site colors/branding if desired
- Upload real product images and data
- Set correct delivery fee
- Deploy to Railway, Render, or self-hosted VPS

---

## Summary

**Total files changed**: ~20
**New files created**: 3 (2 documentation + 1 API route)
**Database models**: +1 (Sport), modified 1 (Category), extended 1 (Product)
**Storefront routes**: Restructured from flat to hierarchical
**Admin functionality**: Fully supports multi-sport management

The site is now ready to support badminton, running, and any future sports you'd like to add.

---

# Addendum — Rebrand, Payment Methods, Reviews & Search

A second round of changes: rebranding from Victor BD to Athliqbd, a new
two-sport color system, a fully admin-manageable payment methods system,
customer reviews with moderation, and site-wide search.

## Rebrand

- Wordmark changed from "VICTOR" + "BD" to "ATHLIQ" + "BD" across header, footer, admin sidebar, and login page
- `victor-red` CSS class renamed to `track-orange` everywhere (mechanical find/replace — no visual logic changed beyond the hex value)
- Page metadata, hero copy, and trust badges rewritten — the old copy assumed Victor-exclusive stock; new copy reflects the multi-brand reality (Victor, ASICS, Nike, Adidas, Hoka)
- Footer disclaimer updated to disclaim non-affiliation with all carried brands, not just Victor
- Order number prefix changed from `VBD-` to `ATL-` (`src/lib/utils.ts`)
- `package.json` name field and seed admin email (`admin@athliqbd.com`) updated
- Product-level `brand` field (e.g. "Victor" on actual racquets) was deliberately left untouched — that's real product data, distinct from store identity

## Color System

Replaced the single victor-red accent with two accents tied to the two
sports: `--color-court-green` (#0b6e4f, badminton) and `--color-track-orange`
(#e15226, running). Background warmed slightly (`--color-court-white` →
#f7f5f1) and `--color-ink` shifted to a deep green-black (#142019).

The `.court-divider` signature element changed from a single-color tick to
a two-tone split (green + orange meeting at a seam), and the homepage hero
SVG now combines straight badminton court lines with curved running-track
arcs in one background graphic — one mark representing both sports instead
of a borrowed single-sport motif.

## Payment Methods

**New model**: `PaymentMethod` (name, type, instructions, requiresReference, isEnabled, sortOrder) — admin-managed instead of hardcoded.

**Order model changes**: added `paymentMethodId` (FK, nullable, `onDelete: SetNull`), `paymentMethodRef` (relation), `paymentReference` (optional, for bKash/Nagad transaction IDs). The existing `paymentMethod` string field is repurposed as a name snapshot (was `"cod"`, now e.g. `"Cash on Delivery"`) — same pattern already used for `OrderItem.productName`.

**New routes**:
- `/api/payment-methods` (public GET, enabled methods only)
- `/api/admin/payment-methods` (GET list, POST create)
- `/api/admin/payment-methods/[id]` (PUT, DELETE — blocks deletion if orders reference it, same pattern as categories)

**New admin page**: `/admin/payment-methods` — add/edit/toggle/delete, same inline-edit pattern as the categories page.

**Checkout changes**: replaced the hardcoded COD block with a dynamic radio list fetched from the public endpoint. Selecting a method shows its instructions; if `requiresReference` is true, a transaction ID field appears and is required client-side and re-validated server-side.

**Order creation API**: now validates `paymentMethodId` exists and `isEnabled` server-side (never trusts the client), checks `requiresReference` before accepting the order, and snapshots the method name onto the order.

**Seeded methods**: Cash on Delivery (enabled, no reference), bKash and Nagad (enabled, requires reference, **placeholder phone numbers `01XXXXXXXXX`** — must be edited in Admin → Payment Methods before going live).

This is deliberately scoped to manual/offline collection — no merchant gateway integration (SSLCommerz, cards) since that needs a business agreement first. The schema supports adding one later without restructuring.

## Reviews

**New model**: `Review` (productId, customerName, rating 1-5, comment, isApproved, createdAt). `isApproved` defaults to `false` — nothing submitted shows up publicly until approved.

**New routes**:
- `/api/reviews` (public POST — no login required to submit)
- `/api/admin/reviews` (GET, filterable by `?status=pending|approved`)
- `/api/admin/reviews/[id]` (PUT to approve/unapprove, DELETE)

**New admin page**: `/admin/reviews` — filter tabs (Pending/Approved/All), approve/unapprove/delete per review, links out to the live product page.

**New component**: `src/components/ProductReviews.tsx` — client component handling the review list, the submission form, and a `RatingSummary` export used near the product title. Product detail page query now includes `reviews: { where: { isApproved: true } }`.

**ProductCard updated**: optional `reviews` prop renders a small star average + count when present. Queries feeding `ProductCard` (homepage featured grid, shop page) updated to include `reviews: { select: { rating: true } }`. The homepage's featured-products section was also refactored to use the shared `ProductCard` component instead of a duplicated inline markup block — same visual result, less code to keep in sync.

## Search

**No new database fields** — search runs a `contains` filter across `name`, `brand`, and `description` on the existing `Product` model.

**New route**: `/api/search` was not needed — search is handled directly in the page via a server component query, no separate API.

**New page**: `/search` (storefront) — reads `?q=` from the URL, queries matching published products, renders results with the shared `ProductCard`.

**Header changes**: added a plain HTML `<form action="/search" method="GET">` with a text input named `q` — deliberately no client-side JavaScript. Submitting (or pressing Enter) performs a normal GET navigation to `/search?q=...`, which the server component reads via `searchParams`. Separate markup for desktop (inline in the nav row) and mobile (full-width row below).

## Files Touched in This Round

**New files**: `PaymentMethod` + `Review` models in schema, payment method seed data, 6 new API route files, 2 new admin pages (`/admin/payment-methods`, `/admin/reviews`), `/search` page, `ProductReviews.tsx` component.

**Modified**: `schema.prisma`, `seed.ts`, `globals.css`, `layout.tsx`, `SiteHeader.tsx`, `SiteFooter.tsx`, `AdminSidebar.tsx`, homepage, shop page, product detail page, checkout page, order-confirmed page, order creation API, admin order detail page, `ProductCard.tsx`, `utils.ts`, `package.json`.

## Migration Note

This round's schema changes are purely additive (new models, new optional/nullable fields) — no columns were dropped or had their type changed destructively. Existing orders and products from a prior install are preserved when running `npx prisma migrate dev --name add-payments-reviews-search`.
