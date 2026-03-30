# Coin Shop Website

A full-featured website for a local coin and precious metals shop, built with Next.js 14, TypeScript, Tailwind CSS, and Prisma. Includes a public-facing storefront and a password-protected admin dashboard for managing inventory, blog posts, customer inquiries, and store settings.

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Database:** SQLite (development) / PostgreSQL (production)
- **ORM:** Prisma
- **Authentication:** NextAuth.js
- **Icons:** React Icons

## Prerequisites

- Node.js 18+
- npm

## Quick Start

1. **Clone the repository**

   ```bash
   git clone <your-repo-url>
   cd coin-shop
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure environment variables**

   ```bash
   cp .env.example .env
   ```

   Open `.env` and set a strong value for `NEXTAUTH_SECRET`. You can generate one with:

   ```bash
   openssl rand -base64 32
   ```

4. **Set up the database**

   This single command pushes the Prisma schema to SQLite, generates the Prisma client, and seeds the database with sample data:

   ```bash
   npm run setup
   ```

5. **Start the development server**

   ```bash
   npm run dev
   ```

6. **Visit the site**

   - Public storefront: [http://localhost:3000](http://localhost:3000)
   - Admin dashboard: [http://localhost:3000/admin](http://localhost:3000/admin)

7. **Default admin credentials**

   - Email: `admin@coinshop.com`
   - Password: `changeme123`

   Change these immediately after first login.

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run prisma:generate` | Generate Prisma client |
| `npm run prisma:push` | Push schema to database |
| `npm run prisma:seed` | Seed database with sample data |
| `npm run prisma:studio` | Open Prisma Studio GUI |
| `npm run setup` | Full setup (push + generate + seed) |

## Deploying to Vercel

1. **Switch to PostgreSQL** - Update `prisma/schema.prisma`:

   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```

2. **Set up a PostgreSQL database** - Use a provider like Neon, Supabase, or Railway.

3. **Update environment variables** on Vercel:
   - `DATABASE_URL` - Your PostgreSQL connection string
   - `NEXTAUTH_SECRET` - A strong random secret
   - `NEXTAUTH_URL` - Your production URL (e.g., `https://yoursite.vercel.app`)
   - `SITE_URL` - Same as `NEXTAUTH_URL`

4. **Deploy:**

   ```bash
   npx vercel
   ```

5. **Run migrations** after the first deploy:

   ```bash
   npx prisma db push
   npx prisma db seed
   ```

## Customization

### Shop Name and Branding

All shop details (name, address, phone, hours, etc.) are managed through the admin dashboard under **Settings**. No code changes needed.

### Colors and Theme

Edit `tailwind.config.ts` to update the color palette. The site uses Tailwind's utility classes throughout, so color changes propagate automatically.

### Logo

Upload your logo through the admin dashboard settings page. It will appear in the header and footer automatically.

## Project Structure

```
coin-shop/
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── seed.ts                # Database seed script
├── public/                    # Static assets
├── src/
│   ├── app/
│   │   ├── admin/             # Admin dashboard pages
│   │   ├── api/               # API routes
│   │   ├── about/             # About page
│   │   ├── appraisal/         # Appraisal request page
│   │   ├── blog/              # Blog pages
│   │   ├── contact/           # Contact page
│   │   ├── inventory/         # Inventory/shop pages
│   │   ├── we-buy/            # We buy page
│   │   ├── layout.tsx         # Root layout
│   │   ├── page.tsx           # Home page
│   │   ├── robots.ts          # robots.txt generator
│   │   └── sitemap.ts         # Sitemap generator
│   └── ...
├── .env.example               # Environment variable template
├── next.config.mjs            # Next.js configuration
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

## License

MIT
