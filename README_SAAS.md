# 🚀 LabInventory - Market-Ready SaaS Platform

<div align="center">

![LabInventory](https://img.shields.io/badge/LabInventory-v3.0.0-blue)
![Next.js](https://img.shields.io/badge/Next.js-15-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue)
![License](https://img.shields.io/badge/license-MIT-green)

**Smart Inventory Management for Modern Labs**

[Features](#features) • [Demo](#demo) • [Quick Start](#quick-start) • [Documentation](#documentation) • [Pricing](#pricing)

</div>

---

## 🎯 Overview

LabInventory is a **production-ready SaaS platform** for managing IoT components and lab equipment. Built with Next.js 14, it features multi-tenancy, subscription management, real-time notifications, and AI-powered recommendations.

### Perfect For
- 🎓 Educational institutions
- 🔬 Research laboratories
- 🏢 Corporate R&D departments
- 🏭 Manufacturing facilities
- 🛠️ Maker spaces

## ✨ Key Features

### 🏢 Multi-Tenant Architecture
- **Organization Workspaces** - Complete data isolation
- **Custom URLs** - Branded organization slugs
- **Team Management** - Role-based access control
- **Unlimited Organizations** - Scale infinitely

### 💳 Subscription Management
- **3 Pricing Tiers** - Starter (Free), Professional, Enterprise
- **14-Day Free Trial** - No credit card required
- **Usage Tracking** - Monitor users, components, API calls
- **Flexible Billing** - Monthly or annual plans

### 🎨 Professional Marketing Site
- **Landing Page** - Hero, features, pricing, testimonials
- **Legal Pages** - Privacy policy, terms of service
- **Contact Forms** - Multi-channel support
- **SEO Optimized** - Meta tags, OG images, sitemaps

### 🔐 Enterprise Security
- **SSO Integration** - Microsoft Azure AD, Google Workspace
- **Role-Based Access** - 5 user roles with granular permissions
- **Audit Logs** - Track all system activities
- **Data Encryption** - At rest and in transit

### 📊 Advanced Features
- **QR Code Tracking** - Generate and scan component codes
- **Real-Time Notifications** - WebSocket-based alerts
- **AI Recommendations** - Smart component suggestions
- **Analytics Dashboard** - Usage trends and insights
- **Return Management** - Automated reminders and tracking
- **API Access** - RESTful API for integrations

## 🏗️ Tech Stack

| Category | Technology |
|----------|-----------|
| **Framework** | Next.js 15 (App Router) |
| **Language** | TypeScript 5.6 |
| **Database** | Prisma ORM + PostgreSQL |
| **Auth** | NextAuth.js v5 |
| **UI** | TailwindCSS + shadcn/ui |
| **Real-time** | WebSocket Server |
| **Payments** | Stripe (ready to integrate) |
| **Deployment** | Vercel / Docker |

## 🚀 Quick Start

### Prerequisites
- Node.js 18.17+
- npm 9.0+
- PostgreSQL (or SQLite for development)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/labinventory.git
cd labinventory

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Initialize database
npm run db:push

# Seed demo data (optional)
npm run demo:seed

# Start development server
npm run dev:full
```

Visit `http://localhost:3000` to see the landing page!

## 📁 Project Structure

```
labinventory/
├── src/
│   ├── app/
│   │   ├── (marketing)/      # Public marketing pages
│   │   │   ├── page.tsx       # Landing page
│   │   │   ├── about/
│   │   │   ├── contact/
│   │   │   ├── privacy/
│   │   │   └── terms/
│   │   ├── (app)/             # Authenticated app
│   │   │   ├── dashboard/
│   │   │   ├── inventory/
│   │   │   ├── requests/
│   │   │   └── settings/
│   │   ├── auth/
│   │   │   ├── signin/
│   │   │   └── signup/        # New signup flow
│   │   └── api/
│   ├── components/
│   │   ├── ui/                # shadcn components
│   │   ├── features/          # Feature components
│   │   └── layout/            # Layout components
│   ├── lib/
│   │   ├── auth.ts
│   │   ├── websocket.ts
│   │   └── recommendations.ts
│   └── types/
├── prisma/
│   └── schema.prisma          # Multi-tenant schema
├── public/
└── docs/
```

## 💰 Pricing Tiers

### Starter (Free)
- ✅ Up to 500 components
- ✅ Up to 50 users
- ✅ Basic analytics
- ✅ Email support
- ✅ QR code generation

### Professional ($99/month)
- ✅ Up to 5,000 components
- ✅ Up to 500 users
- ✅ Advanced analytics
- ✅ Priority support
- ✅ AI recommendations
- ✅ Custom workflows
- ✅ API access

### Enterprise (Custom)
- ✅ Unlimited everything
- ✅ Custom integrations
- ✅ Dedicated support
- ✅ SLA guarantee
- ✅ On-premise deployment
- ✅ Custom training

## 🔧 Configuration

### Environment Variables

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/labinventory"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"

# Microsoft Azure AD (Optional)
AZURE_AD_CLIENT_ID="your-client-id"
AZURE_AD_CLIENT_SECRET="your-client-secret"
AZURE_AD_TENANT_ID="your-tenant-id"

# Stripe (Optional)
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Email (Optional)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="your-password"
```

## 📚 Documentation

- [Market-Ready Guide](./MARKET_READY_GUIDE.md) - Complete feature overview
- [Quick Start](./QUICKSTART.md) - Step-by-step setup
- [API Documentation](./docs/API.md) - REST API reference
- [Deployment Guide](./PRODUCTION_SETUP.md) - Production deployment
- [Return System](./RETURN_SYSTEM_GUIDE.md) - Return workflow

## 🎨 Customization

### Branding
1. Update logo in `src/app/(marketing)/layout.tsx`
2. Customize colors in `tailwind.config.js`
3. Add OG image to `public/og-image.png`

### Pricing
1. Edit tiers in `src/app/(marketing)/page.tsx`
2. Update limits in `src/app/api/auth/signup/route.ts`

### Content
1. Customize marketing copy in marketing pages
2. Update testimonials with real quotes
3. Add company info in footer

## 🚢 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Docker

```bash
# Build image
docker build -t labinventory .

# Run container
docker-compose up -d
```

### Environment Setup
1. Set up PostgreSQL database
2. Configure environment variables
3. Run database migrations
4. Deploy application

## 🔌 Payment Integration

### Stripe Setup

```bash
npm install stripe @stripe/stripe-js
```

1. Create Stripe account
2. Add webhook endpoints
3. Implement checkout flow
4. Handle subscription lifecycle

See [Stripe Integration Guide](./docs/STRIPE.md) for details.

## 📊 Analytics

### Recommended Tools
- **Vercel Analytics** - Page views and performance
- **PostHog** - Product analytics and feature flags
- **Sentry** - Error tracking and monitoring
- **LogRocket** - Session replay and debugging

## 🧪 Testing

```bash
# Run tests
npm test

# Run with coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for details.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see [LICENSE](./LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [shadcn/ui](https://ui.shadcn.com/) - UI components
- [Prisma](https://www.prisma.io/) - Database ORM
- [NextAuth.js](https://next-auth.js.org/) - Authentication

## 📞 Support

- 📧 Email: support@labinventory.com
- 💬 Discord: [Join our community](https://discord.gg/labinventory)
- 📖 Docs: [docs.labinventory.com](https://docs.labinventory.com)
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/labinventory/issues)

## 🗺️ Roadmap

### Q1 2026
- [ ] Stripe payment integration
- [ ] Email marketing automation
- [ ] Mobile app (React Native)
- [ ] Advanced reporting

### Q2 2026
- [ ] Marketplace for integrations
- [ ] White-label options
- [ ] Affiliate program
- [ ] Multi-language support

### Q3 2026
- [ ] AI-powered insights
- [ ] Predictive maintenance
- [ ] IoT device integration
- [ ] Advanced workflows

---

<div align="center">

**Built with ❤️ by the LabInventory Team**

[Website](https://labinventory.com) • [Twitter](https://twitter.com/labinventory) • [LinkedIn](https://linkedin.com/company/labinventory)

</div>
