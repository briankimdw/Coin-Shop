# Coin Shop Website Template - Setup Guide

## Quick Start (New Shop Setup)

### 1. Install & Initialize

```bash
npm install
npx prisma db push
npx prisma db seed
```

### 2. Configure Environment

Copy `.env.example` to `.env` and fill in:

```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="generate-a-random-secret-here"
NEXTAUTH_URL="http://localhost:3000"
SITE_URL="https://yourshop.com"
```

SMTP email is configured in the admin panel (Settings > Email Configuration), so no env vars needed for email.

### 3. Start the Server

```bash
npm run dev
```

### 4. Log In to Admin

Go to `http://localhost:3000/admin/login`

Default credentials (from seed):
- Email: `admin@coinshop.com`
- Password: `changeme123`

**Change the password immediately** after first login.

### 5. Configure the Shop

Everything is managed from the admin panel at `/admin/settings`:

| Setting | Location | What It Controls |
|---------|----------|-----------------|
| Shop Name & Tagline | Settings > Store Info | Header, footer, page titles, SEO |
| Address & Contact | Settings > Store Info | Footer, contact page, homepage, JSON-LD |
| Logo & Banner | Settings > Branding | Header logo (replaces initials circle) |
| Hero Text | Settings > Homepage | Homepage banner headline & subtitle |
| About & Owner Bio | Settings > About | About page content |
| Store Hours | Settings > Hours | Open/closed badge, contact page hours, appointment availability |
| Social Links | Settings > Social | Footer social media icons |
| Google Maps | Settings > Maps | Contact page & homepage map embed |
| Email (SMTP) | Settings > Email Configuration | All outgoing emails (replies, confirmations) |
| Google Reviews | Settings > Google Integration | Import reviews as testimonials |
| Open/Closed Status | Settings > Status | Manual override for store status |

### 6. Add Content

1. **Inventory** (`/admin/inventory`) - Add coin listings with photos, prices, grades
2. **Blog** (`/admin/blog`) - Write articles for SEO and engagement
3. **Testimonials** (`/admin/testimonials`) - Add customer reviews or import from Google
4. **FAQ** (`/admin/faq`) - Add frequently asked questions
5. **Want to Buy** (`/admin/want-to-buy`) - List coins you're actively seeking

---

## Deploying for a New Client

### Step-by-step for each new coin shop:

1. **Clone the template** to a new directory
2. **Delete the database**: `rm prisma/dev.db`
3. **Update the seed file** (`prisma/seed.ts`):
   - Change admin email and password
   - Update shop name, address, phone, etc.
   - Customize sample inventory (or remove it)
   - Update testimonials
4. **Run setup**:
   ```bash
   npm install
   npx prisma db push
   npx prisma db seed
   ```
5. **Start and configure** via admin panel
6. **Deploy** to your hosting platform

### What Automatically Adapts

Once you set the shop name in admin Settings, these all update automatically:
- Browser tab titles (all pages)
- Header (logo/initials + name)
- Footer (shop name, address, phone, email, social links, copyright)
- Homepage JSON-LD structured data
- Open/Closed badge (uses store hours from Settings)
- All email templates

### What You Might Customize in Code

| Item | File | Notes |
|------|------|-------|
| Color scheme | `tailwind.config.ts` | Gold (#C9A84C), Navy (#1B2A4A), Cream (#FAF7F0) |
| Nav links | `src/components/layout/Header.tsx` | Add/remove pages from navigation |
| Mobile nav | `src/components/layout/MobileNav.tsx` | Bottom 5-tab navigation |
| Categories | `src/config/shop.ts` | Inventory categories, metals, grades |
| Payout rates | `src/config/shop.ts` | We-buy payout estimator percentages |
| Appointment types | Admin panel | Settings at `/admin/appointments` |

---

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: SQLite via Prisma ORM
- **Auth**: NextAuth.js (credentials provider)
- **Email**: Nodemailer (SMTP configured in admin)
- **Fonts**: Playfair Display (headings) + Inter (body)

## Pages

### Public
- `/` - Homepage (hero, featured coins, spot prices, testimonials, map, newsletter)
- `/inventory` - Searchable/filterable inventory browser
- `/inventory/[slug]` - Individual coin detail page
- `/we-buy` - What we buy + payout estimator + want-to-buy list
- `/appraisal` - Free appraisal request form with image uploads
- `/about` - About, owner bio, memberships, why choose us
- `/blog` - Blog listing
- `/blog/[slug]` - Blog post
- `/contact` - Contact form + info + map
- `/faq` - FAQ accordion with JSON-LD
- `/appointments` - Appointment booking calendar
- `/testimonials` - Customer reviews
- `/privacy` - Privacy policy (dynamic shop name)
- `/terms` - Terms of service (dynamic shop name)

### Admin (`/admin`)
- Dashboard (stats, charts, low stock alerts, today's appointments)
- Inventory management (CRUD, photo upload, camera capture, quick-add)
- Want to Buy list management
- Appointment management (status, phone numbers, settings)
- Inquiry management (view + reply via email)
- Blog management (CRUD, publish/draft)
- Testimonials (CRUD + Google Reviews import)
- FAQ management (CRUD, sort order)
- Spot price management (auto-fetch or manual override)
- Store settings (all configuration)

## Database Models

User, CoinListing, Sale, BlogPost, Testimonial, FAQ, WantToBuyItem, Appointment, AppointmentSettings, AppraisalRequest, ContactSubmission, InquiryReply, Newsletter, StoreSettings
