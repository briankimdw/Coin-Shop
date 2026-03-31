# CoinShop Pro - Professional Coin Shop Website Template

**The complete, ready-to-deploy website solution for coin shops and precious metals dealers.**

Turn any coin shop into a modern online presence in under an hour. CoinShop Pro is a white-label website template built specifically for coin dealers, featuring inventory management, customer engagement tools, and a full admin dashboard -- all backed by a modern tech stack.

- Full-featured inventory browser with search, filters, and quick view
- Built-in payout estimator and spot price ticker
- Appointment booking system with configurable time slots
- Appraisal request forms with photo upload
- Blog, FAQ, and testimonials management
- Admin dashboard with sales tracking and charts
- Fully responsive design optimized for mobile
- SEO-ready with dynamic sitemaps, structured data, and meta tags
- One-click deploy to Vercel with Supabase backend

---

## Live Demo

| | URL | Credentials |
|---|---|---|
| **Customer Site** | [coin-shop-template.vercel.app](https://coin-shop-template.vercel.app) | -- |
| **Admin Dashboard** | [coin-shop-template.vercel.app/admin/login](https://coin-shop-template.vercel.app/admin/login) | `admin@coinshop.com` / `admin123` |

---

## Features

### Customer-Facing Pages

- **Homepage** -- Hero banner, featured coins carousel, services grid, testimonials, newsletter signup, and spot price ticker
- **Inventory Browser** -- Searchable catalog with filters by category, metal, grade, certification, and price range. Includes grid/list view toggle and quick-view modal
- **Coin Detail Pages** -- Individual listing pages with image gallery, specifications, and SEO-friendly slugs
- **We Buy Page** -- Interactive payout estimator that calculates offers based on live spot prices, buy premiums, and item type
- **Appraisal Requests** -- Multi-step form with photo upload (client-side compression), contact preferences, and item descriptions
- **Appointment Booking** -- Calendar-based scheduling with configurable time slots, appointment types, and advance booking limits
- **Blog** -- Full blog with rich text content, cover images, tags, and SEO meta fields
- **FAQ** -- Accordion-style FAQ page with admin-managed questions and answers
- **Testimonials** -- Customer review display with star ratings
- **Contact Page** -- Contact form with phone, email, address, business hours, and optional Google Maps embed
- **Newsletter Signup** -- Email collection integrated throughout the site
- **Spot Price Ticker** -- Live gold, silver, platinum, and palladium spot prices displayed in a top bar
- **SEO** -- Dynamic sitemap generation, robots.txt, JSON-LD structured data, and per-page meta tags
- **Legal Pages** -- Privacy policy and terms of service templates

### Admin Dashboard

- **Inventory Management** -- Full CRUD for coin listings with image upload, grading fields, cost basis tracking, and featured/sold status. Includes Quick Add modal for fast entry
- **Sales Tracking** -- Record sales against inventory items, view profit margins, and visualize revenue with interactive charts
- **Blog Management** -- Create, edit, publish/unpublish blog posts with rich content and SEO fields
- **Inquiry Management** -- View and respond to contact form submissions and appraisal requests directly from the dashboard, with email reply functionality
- **Appointment Management** -- View, confirm, and manage customer appointments. Confirm, reschedule, or cancel bookings. Configure time slots and appointment types
- **Testimonial Management** -- Add and manage customer testimonials with star ratings
- **FAQ Management** -- Create, edit, and reorder frequently asked questions
- **Want-to-Buy List** -- Maintain a public list of items the shop is actively seeking to purchase
- **Spot Price Configuration** -- Toggle automatic spot price fetching, set manual overrides, and configure buy/sell premiums per metal
- **Store Settings** -- Update shop name, address, hours, logo, banner image, tagline, about text, social media links, Google Maps embed, SMTP configuration, and Google Reviews integration
- **Google Reviews** -- Pull in reviews from Google Places using your Place ID and API key

### Technical Features

- **Framework** -- Next.js 14 with App Router and React Server Components
- **Styling** -- Tailwind CSS with custom gold/navy/cream color palette
- **Database** -- PostgreSQL via Supabase with Prisma ORM
- **Authentication** -- NextAuth.js with credential-based admin login
- **Image Handling** -- Client-side image compression before upload, stored as base64
- **Email** -- SMTP integration via Nodemailer for inquiry replies and notifications
- **Validation** -- Zod schema validation on all forms and API routes
- **Responsive** -- Mobile-first design that works on all screen sizes
- **Server Actions** -- Next.js server actions with 10MB body size limit for image uploads

---

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- A [Supabase](https://supabase.com) account (free tier works)
- A [Vercel](https://vercel.com) account (for deployment)

### 1. Clone the repository

```bash
git clone https://github.com/your-org/coin-shop-template.git
cd coin-shop-template
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up Supabase

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Once the project is ready, go to **Settings > Database**
3. Copy the **Connection string (URI)** -- this is your `DATABASE_URL` (use the connection pooler, port 6543)
4. Copy the **Direct connection** string -- this is your `DIRECT_URL` (port 5432)

### 4. Configure environment variables

Create a `.env.local` file in the project root:

```env
# Database (Supabase PostgreSQL)
DATABASE_URL="postgresql://postgres.[YOUR-PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[YOUR-PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres"

# NextAuth
NEXTAUTH_SECRET="generate-a-random-string-here"
NEXTAUTH_URL="http://localhost:3000"

# Site URL (for sitemap and SEO)
SITE_URL="http://localhost:3000"
```

Generate a secure `NEXTAUTH_SECRET`:

```bash
openssl rand -base64 32
```

### 5. Push the database schema

```bash
npx prisma db push
```

### 6. Seed default data

```bash
npm run prisma:seed
```

This creates the default admin user (`admin@coinshop.com` / `admin123`), sample store settings, and appointment configuration.

### 7. Run the development server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the customer site and [http://localhost:3000/admin](http://localhost:3000/admin) for the admin dashboard.

---

## Deployment to Vercel

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/your-org/your-repo.git
git push -u origin main
```

### 2. Import project in Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. Vercel will auto-detect the Next.js framework

### 3. Set environment variables

In the Vercel project settings, add the following environment variables:

| Variable | Value |
|---|---|
| `DATABASE_URL` | Your Supabase pooled connection string (port 6543) |
| `DIRECT_URL` | Your Supabase direct connection string (port 5432) |
| `NEXTAUTH_SECRET` | A secure random string |
| `NEXTAUTH_URL` | Your production URL (e.g., `https://yourshop.vercel.app`) |
| `SITE_URL` | Same as `NEXTAUTH_URL` |

### 4. Deploy

Click **Deploy**. Vercel will build and deploy the project automatically. The `postinstall` script runs `prisma generate` during the build process.

After the first deploy, run the database seed against your production database (or seed via the admin panel manually).

---

## Client Onboarding Checklist

Use this checklist when setting up CoinShop Pro for a new coin shop client:

### Infrastructure

- [ ] Create a new Supabase project for the client
- [ ] Create a new Vercel project linked to the repo (or fork)
- [ ] Set all required environment variables in Vercel
- [ ] Push the database schema (`npx prisma db push`)
- [ ] Seed default data (`npm run prisma:seed`)
- [ ] Verify the site loads and admin login works

### Security

- [ ] Change the default admin password immediately after first login
- [ ] Generate a unique `NEXTAUTH_SECRET` for this deployment
- [ ] Ensure `NEXTAUTH_URL` matches the production domain

### Store Configuration (via Admin > Settings)

- [ ] Set the shop name and tagline
- [ ] Enter the full business address
- [ ] Set phone number and email
- [ ] Upload the shop logo
- [ ] Upload a hero banner image
- [ ] Write the "About" text and owner bio
- [ ] Set business hours for each day of the week
- [ ] Add social media links (Facebook, Instagram, Twitter)
- [ ] Set years in business and memberships/certifications

### Features Setup

- [ ] Configure SMTP for email notifications (see instructions below)
- [ ] Add Google Maps embed URL for the contact page
- [ ] Set up Google Reviews integration (Place ID and API key) -- optional
- [ ] Configure spot price buy/sell premiums per metal
- [ ] Add initial inventory items
- [ ] Create FAQ entries
- [ ] Add customer testimonials
- [ ] Write at least one blog post
- [ ] Set up the want-to-buy list

### Domain (optional)

- [ ] Register or transfer a custom domain
- [ ] Add the domain to the Vercel project
- [ ] Update `NEXTAUTH_URL` and `SITE_URL` to the custom domain

### Gmail SMTP Setup (Recommended)

1. Enable 2-factor authentication on the shop's Gmail account
2. Go to [Google App Passwords](https://myaccount.google.com/apppasswords)
3. Generate an app password for "Mail"
4. In Admin > Settings, enter:
   - **SMTP Host**: `smtp.gmail.com`
   - **SMTP Port**: `587`
   - **SMTP User**: `shop@gmail.com`
   - **SMTP Password**: The generated app password
   - **SMTP From**: `"Shop Name" <shop@gmail.com>`

---

## Environment Variables Reference

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | Supabase PostgreSQL connection string (pooled, port 6543). Must include `?pgbouncer=true`. |
| `DIRECT_URL` | Yes | Supabase PostgreSQL direct connection string (port 5432). Used by Prisma for migrations. |
| `NEXTAUTH_SECRET` | Yes | Secret key for NextAuth.js session encryption. Generate with `openssl rand -base64 32`. |
| `NEXTAUTH_URL` | Yes | The canonical URL of the site (e.g., `https://yourshop.com`). |
| `SITE_URL` | No | Used for sitemap and SEO meta tags. Defaults to `NEXTAUTH_URL` if not set. |
| `SMTP_HOST` | No | SMTP server hostname (e.g., `smtp.gmail.com`). Can also be set in Admin > Settings. |
| `SMTP_PORT` | No | SMTP server port (typically `587` for TLS). Can also be set in Admin > Settings. |
| `SMTP_USER` | No | SMTP username/email. Can also be set in Admin > Settings. |
| `SMTP_PASS` | No | SMTP password or app password. Can also be set in Admin > Settings. |
| `SMTP_FROM` | No | Sender address for emails. Can also be set in Admin > Settings. |
| `GOOGLE_MAPS_EMBED_URL` | No | Google Maps embed URL for the contact page. Can also be set in Admin > Settings. |

> **Note:** SMTP settings can be configured either via environment variables or through the Admin Settings page. Admin Settings values take precedence when both are set.

---

## Admin Panel Guide

Access the admin panel at `/admin/login`. Default credentials after seeding: `admin@coinshop.com` / `admin123`.

| Section | Path | Description |
|---|---|---|
| **Dashboard** | `/admin` | Overview with inventory stats, recent sales, revenue chart, and quick-add modal |
| **Inventory** | `/admin/inventory` | Manage all coin listings. Add, edit, mark as sold, or delete items. Upload images and set grades, certifications, and pricing |
| **Blog** | `/admin/blog` | Write and manage blog posts. Supports rich text, cover images, tags, and SEO fields |
| **Inquiries** | `/admin/inquiries` | View contact form submissions and appraisal requests. Reply directly via email from the dashboard |
| **Appointments** | `/admin/appointments` | Manage customer appointments. Confirm, reschedule, or cancel bookings. Configure time slots and appointment types |
| **Testimonials** | `/admin/testimonials` | Add and manage customer testimonials with star ratings |
| **FAQ** | `/admin/faq` | Create, edit, and reorder frequently asked questions |
| **Want to Buy** | `/admin/want-to-buy` | Maintain a list of items the shop is actively seeking to purchase |
| **Spot Prices** | `/admin/spot-prices` | Configure live spot price fetching, set manual overrides, and adjust buy/sell premiums |
| **Settings** | `/admin/settings` | Store name, address, hours, logo, social links, SMTP, Google Maps, and Google Reviews configuration |

---

## Customization Guide

### Changing Colors and Branding

The color palette is defined in two places:

**`tailwind.config.ts`** -- Custom color tokens:

```ts
colors: {
  gold: {
    DEFAULT: "#C9A84C",  // Primary accent color
    dark: "#B8942E",
    light: "#e8d48b",
  },
  navy: {
    DEFAULT: "#1B2A4A",  // Primary dark color
    light: "#2a3f6a",
    dark: "#0c1220",
  },
  cream: {
    DEFAULT: "#FAF7F0",  // Background color
    dark: "#f3f0e8",
  },
}
```

**`src/app/globals.css`** -- CSS custom properties for surfaces, borders, and shadows. Modify the `:root` block to change the overall theme.

### Modifying Categories, Grades, and Services

Edit **`src/config/shop.ts`** to change:

- `categories` -- Inventory filter categories (e.g., "US Coins", "Bullion", "World Coins")
- `metals` -- Metal type options (e.g., "Gold", "Silver", "Platinum")
- `grades` -- Coin grading scale options (AG-3 through MS-70, PF-60 through PF-70)
- `certServices` -- Certification services (PCGS, NGC, ANACS, ICG, Raw)
- `services` -- Services listed on the homepage
- `payoutEstimates` -- Default payout percentages for the We Buy estimator

### Adding or Removing Pages

Each page is a directory under `src/app/`. To add a new page:

1. Create a new directory (e.g., `src/app/services/`)
2. Add a `page.tsx` file with your page component
3. Add a link in `src/components/layout/Header.tsx` and/or `src/components/layout/Footer.tsx`
4. Update `src/app/sitemap.ts` to include the new route

To remove a page, delete its directory and remove references from the Header, Footer, and sitemap.

### Fonts

The template uses **Playfair Display** (serif, for headings) and **Inter** (sans-serif, for body text). These are configured in `src/app/layout.tsx` using `next/font`. Replace them by importing different fonts from `next/font/google`.

---

## Tech Stack

| Technology | Purpose |
|---|---|
| [Next.js 14](https://nextjs.org/) | React framework with App Router and Server Components |
| [React 18](https://react.dev/) | UI component library |
| [Tailwind CSS 3](https://tailwindcss.com/) | Utility-first CSS framework |
| [Prisma 5](https://www.prisma.io/) | TypeScript ORM for database access |
| [PostgreSQL](https://www.postgresql.org/) | Relational database (via Supabase) |
| [Supabase](https://supabase.com/) | Hosted PostgreSQL with connection pooling |
| [NextAuth.js 4](https://next-auth.js.org/) | Authentication for the admin panel |
| [Nodemailer](https://nodemailer.com/) | Email sending for inquiry replies and notifications |
| [Zod](https://zod.dev/) | Runtime schema validation |
| [React Icons](https://react-icons.github.io/react-icons/) | Icon library |
| [date-fns](https://date-fns.org/) | Date utility library |
| [Vercel](https://vercel.com/) | Deployment and hosting platform |

---

## Project Structure

```
coin-shop/
├── prisma/
│   ├── schema.prisma          # Database schema (all models)
│   └── seed.ts                # Default data seeder
├── src/
│   ├── app/
│   │   ├── admin/             # Admin dashboard pages
│   │   │   ├── appointments/  # Appointment management
│   │   │   ├── blog/          # Blog post management
│   │   │   ├── faq/           # FAQ management
│   │   │   ├── inquiries/     # Contact & appraisal inbox
│   │   │   ├── inventory/     # Coin listing management
│   │   │   ├── login/         # Admin login page
│   │   │   ├── settings/      # Store settings
│   │   │   ├── spot-prices/   # Spot price configuration
│   │   │   ├── testimonials/  # Testimonial management
│   │   │   ├── want-to-buy/   # Want-to-buy list management
│   │   │   ├── layout.tsx     # Admin layout with sidebar
│   │   │   └── page.tsx       # Admin dashboard overview
│   │   ├── api/               # API routes
│   │   ├── about/             # About page
│   │   ├── appointments/      # Appointment booking page
│   │   ├── appraisal/         # Appraisal request page
│   │   ├── blog/              # Blog listing and detail pages
│   │   ├── contact/           # Contact page
│   │   ├── faq/               # FAQ page
│   │   ├── inventory/         # Inventory listing and detail pages
│   │   ├── privacy/           # Privacy policy
│   │   ├── terms/             # Terms of service
│   │   ├── testimonials/      # Testimonials page
│   │   ├── we-buy/            # We Buy page with payout estimator
│   │   ├── globals.css        # Global styles and CSS variables
│   │   ├── layout.tsx         # Root layout
│   │   ├── page.tsx           # Homepage
│   │   ├── robots.ts          # Robots.txt generation
│   │   └── sitemap.ts         # Dynamic sitemap generation
│   ├── components/
│   │   ├── admin/             # Admin-specific components
│   │   ├── layout/            # Header, Footer
│   │   ├── ui/                # Shared UI components (SpotPriceBar)
│   │   ├── AppointmentBooking.tsx
│   │   ├── AppraisalForm.tsx
│   │   ├── BlogCard.tsx
│   │   ├── CoinCard.tsx
│   │   ├── ContactForm.tsx
│   │   ├── FaqAccordion.tsx
│   │   ├── FeaturedCoins.tsx
│   │   ├── InventoryBrowser.tsx
│   │   ├── NewsletterForm.tsx
│   │   ├── PayoutEstimator.tsx
│   │   ├── QuickViewModal.tsx
│   │   └── TestimonialCard.tsx
│   ├── config/
│   │   └── shop.ts            # Shop configuration (categories, grades, services)
│   └── lib/
│       ├── auth.ts            # NextAuth configuration
│       ├── email.ts           # Email sending utilities
│       ├── image-utils.ts     # Image compression utilities
│       ├── prisma.ts          # Prisma client singleton
│       ├── spot-prices.ts     # Spot price fetching logic
│       └── utils.ts           # General utilities
├── .env.example               # Environment variable template
├── next.config.mjs            # Next.js configuration
├── tailwind.config.ts         # Tailwind CSS configuration
├── package.json               # Dependencies and scripts
└── tsconfig.json              # TypeScript configuration
```

---

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the development server on port 3000 |
| `npm run build` | Build the production application |
| `npm run start` | Start the production server |
| `npm run lint` | Run ESLint |
| `npm run prisma:push` | Push the Prisma schema to the database |
| `npm run prisma:seed` | Seed the database with default data |
| `npm run prisma:generate` | Regenerate the Prisma client |
| `npm run prisma:studio` | Open Prisma Studio (database GUI) |
| `npm run setup` | Run push + generate + seed in one command |

---

## License

This is a commercial template. Redistribution, resale, or sharing of the source code is prohibited without a valid license. Each deployment requires a separate license.

For licensing inquiries, contact the template author.
