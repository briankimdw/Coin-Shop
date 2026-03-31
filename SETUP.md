# Coin Shop Template - Setup Guide

## Prerequisites

- Node.js 18+
- A Supabase project (free tier works)
- Vercel account (for deployment)

## Quick Start

1. Clone and install:

```bash
git clone <repo-url> my-coin-shop
cd my-coin-shop
cp .env.example .env
```

2. Configure `.env` with your Supabase credentials (find them in Supabase Dashboard > Settings > Database).

3. Generate a NextAuth secret:

```bash
openssl rand -base64 32
```

4. Run the full setup (pushes schema, generates client, seeds data):

```bash
npm install
npm run setup
```

5. Start the dev server:

```bash
npm run dev
```

6. Log in at `http://localhost:3000/admin/login` with:
   - Email: `admin@coinshop.com`
   - Password: `admin123`

## Change Admin Password

After first login, go to Admin > Settings and update the password. Alternatively, run a direct SQL update against Supabase with a new bcrypt hash.

## Customize for a Client

1. Log into `/admin` and update **Settings**: shop name, address, phone, hours, about text, logo, and social links.
2. Update inventory through the admin panel.
3. Add blog posts, FAQs, and testimonials from their respective admin pages.
4. Edit `src/config/shop.ts` only if you need to change dropdown options (categories, metals, grades).

## Deploy to Vercel

1. Push your repo to GitHub.
2. Import the project in Vercel.
3. Add environment variables in Vercel project settings:
   - `DATABASE_URL`
   - `DIRECT_URL`
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL` (set to your production domain, e.g. `https://clientcoinshop.com`)
   - `SITE_URL` (same as NEXTAUTH_URL)
4. Deploy. The `postinstall` script runs `prisma generate` automatically during build.
5. After the first deploy, run the seed against production:

```bash
DATABASE_URL="your-prod-url" DIRECT_URL="your-prod-direct-url" npx prisma db seed
```

## Client Handoff Checklist

- [ ] Admin password changed from default
- [ ] Shop name, address, phone, and hours updated in admin settings
- [ ] Logo and banner image uploaded
- [ ] Social media links configured
- [ ] At least 6 inventory items added with photos
- [ ] FAQ entries reviewed and customized
- [ ] About page text and owner bio updated
- [ ] Google Maps embed URL added (if applicable)
- [ ] NEXTAUTH_SECRET is a unique generated value (not the default)
- [ ] SITE_URL set to production domain
- [ ] Spot price premiums adjusted to client preference
