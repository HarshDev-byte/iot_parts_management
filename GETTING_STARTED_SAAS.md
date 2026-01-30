# 🚀 Getting Started with LabInventory SaaS

Welcome to LabInventory! This guide will help you get your market-ready SaaS platform up and running.

## 📋 What You Have Now

Your IoT inventory management system has been transformed into a **production-ready SaaS platform** with:

✅ **Multi-tenant architecture** - Multiple organizations with data isolation  
✅ **Professional landing page** - Marketing website with pricing  
✅ **Subscription management** - 3 pricing tiers with billing  
✅ **Team collaboration** - Invite and manage team members  
✅ **Enterprise features** - SSO, audit logs, analytics  
✅ **SEO optimization** - Meta tags, sitemaps, OG images  
✅ **Payment ready** - Stripe integration prepared  

## 🎯 Quick Start (5 Minutes)

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Environment
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```env
DATABASE_URL="file:./prisma/dev.db"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"
```

### 3. Initialize Database
```bash
npm run db:push
```

### 4. Start Development
```bash
npm run dev:full
```

### 5. Visit Landing Page
Open `http://localhost:3000` - You'll see the new marketing website!

## 🎨 What's Different?

### Before (v2.0)
- Single organization only
- Direct login required
- No public pages
- Internal tool only

### After (v3.0)
- **Multi-tenant** - Unlimited organizations
- **Public landing page** - Marketing website
- **Signup flow** - Self-service onboarding
- **Subscription tiers** - Monetization ready
- **Team management** - Collaboration features

## 🏗️ New Structure

### Route Groups

**`(marketing)/`** - Public pages (no auth required)
- Landing page (`/`)
- About (`/about`)
- Contact (`/contact`)
- Privacy (`/privacy`)
- Terms (`/terms`)

**`(app)/`** - Authenticated app (requires login)
- Dashboards (`/dashboard/*`)
- Inventory (`/inventory/*`)
- Requests (`/requests/*`)
- Settings (`/settings/*`)

**`auth/`** - Authentication pages
- Sign in (`/auth/signin`)
- Sign up (`/auth/signup`) - **NEW!**

## 💡 Key Features to Explore

### 1. Landing Page
Visit `http://localhost:3000` to see:
- Hero section with CTA
- Features showcase
- Pricing tiers
- Testimonials
- Footer with links

### 2. Signup Flow
Click "Get Started" to:
- Create organization
- Set organization URL
- Choose pricing plan
- Create owner account

### 3. Organization Settings
After signup, go to `/settings/organization`:
- Edit organization details
- Invite team members
- Manage roles
- Security settings

### 4. Billing Dashboard
Visit `/settings/billing`:
- View current plan
- Track usage
- Manage payment methods
- View invoices

## 🔧 Customization Guide

### 1. Branding

**Update Logo**
Edit `src/app/(marketing)/layout.tsx`:
```tsx
<div className="h-8 w-8 rounded-lg bg-blue-600" />
// Replace with your logo
```

**Change Colors**
Edit `tailwind.config.js`:
```js
colors: {
  primary: '#your-color',
}
```

### 2. Pricing

**Edit Pricing Tiers**
Edit `src/app/(marketing)/page.tsx`:
```tsx
<PricingCard
  name="Professional"
  price="$99"
  // Update features, price, etc.
/>
```

**Update Plan Limits**
Edit `src/app/api/auth/signup/route.ts`:
```typescript
const planLimits = {
  STARTER: { maxUsers: 50, maxComponents: 500 },
  PROFESSIONAL: { maxUsers: 500, maxComponents: 5000 },
}
```

### 3. Content

**Landing Page Copy**
Edit `src/app/(marketing)/page.tsx` - Update:
- Hero headline
- Feature descriptions
- Testimonials
- CTA text

**About Page**
Edit `src/app/(marketing)/about/page.tsx` - Add:
- Your company story
- Team information
- Mission and values

**Contact Info**
Edit `src/app/(marketing)/contact/page.tsx` - Update:
- Email addresses
- Phone numbers
- Office location

## 💳 Enable Payments (Next Step)

### 1. Install Stripe
```bash
npm install stripe @stripe/stripe-js
```

### 2. Create Stripe Account
1. Sign up at [stripe.com](https://stripe.com)
2. Get API keys from Dashboard
3. Create products and prices

### 3. Configure Environment
```env
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
STRIPE_PROFESSIONAL_PRICE_ID="price_..."
```

### 4. Test Checkout
The checkout flow is already implemented in:
- `src/app/api/checkout/route.ts`
- `src/app/api/webhooks/stripe/route.ts`
- `src/lib/stripe.ts`

Just add your Stripe keys and it works!

## 🚀 Deploy to Production

### Option 1: Vercel (Easiest)
```bash
npm i -g vercel
vercel --prod
```

### Option 2: Docker
```bash
docker-compose up -d
```

### Option 3: VPS
See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed guide.

## 📊 Database Migration

### From SQLite to PostgreSQL

1. **Set up PostgreSQL**
```bash
# Install PostgreSQL or use managed service
# (Vercel Postgres, Supabase, PlanetScale)
```

2. **Update DATABASE_URL**
```env
DATABASE_URL="postgresql://user:pass@host:5432/db"
```

3. **Run Migrations**
```bash
npx prisma migrate dev
```

4. **Migrate Data** (if needed)
```bash
# Export from SQLite
sqlite3 prisma/dev.db .dump > backup.sql

# Import to PostgreSQL
psql $DATABASE_URL < backup.sql
```

## 🎓 Learning Resources

### Documentation
- [Market-Ready Guide](./MARKET_READY_GUIDE.md) - Complete overview
- [Deployment Guide](./DEPLOYMENT.md) - Production setup
- [SaaS Documentation](./README_SAAS.md) - Detailed features
- [Changelog](./CHANGELOG.md) - What's new

### Code Examples
- Landing page: `src/app/(marketing)/page.tsx`
- Signup flow: `src/app/auth/signup/page.tsx`
- Billing: `src/app/(app)/settings/billing/page.tsx`
- Stripe: `src/lib/stripe.ts`

## 🐛 Troubleshooting

### Issue: Landing page not showing
**Solution**: Make sure you're visiting `/` not `/dashboard`

### Issue: Signup fails
**Solution**: Check database connection and run `npm run db:push`

### Issue: Organization not created
**Solution**: Check console for errors, verify database schema

### Issue: Stripe not working
**Solution**: Ensure Stripe keys are set in `.env`

## 📞 Get Help

- 📖 Read the docs in this repository
- 🐛 Check [GitHub Issues](https://github.com/yourusername/labinventory/issues)
- 💬 Join our [Discord](https://discord.gg/labinventory)
- 📧 Email: support@labinventory.com

## ✅ Next Steps Checklist

- [ ] Customize branding (logo, colors)
- [ ] Update marketing copy
- [ ] Add real testimonials
- [ ] Set up Stripe account
- [ ] Configure payment processing
- [ ] Add email service (SendGrid, Resend)
- [ ] Set up analytics (PostHog, Vercel)
- [ ] Configure error tracking (Sentry)
- [ ] Deploy to production
- [ ] Set up custom domain
- [ ] Enable SSL certificate
- [ ] Test signup flow end-to-end
- [ ] Create demo video
- [ ] Launch marketing campaign

## 🎉 You're Ready!

Your SaaS platform is ready to:
- Accept signups
- Manage organizations
- Track subscriptions
- Scale to thousands of users

**Start customizing and launch your product!** 🚀

---

**Questions?** Check the documentation or reach out for support.
