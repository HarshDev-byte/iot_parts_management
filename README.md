<div align="center">

# 🔬 LabInventory — IoT Lab Management System

<img src="https://img.shields.io/badge/version-3.0.0-6366f1?style=for-the-badge" alt="Version"/>
<img src="https://img.shields.io/badge/Next.js-15-000000?style=for-the-badge&logo=next.js" alt="Next.js"/>
<img src="https://img.shields.io/badge/TypeScript-5.6-3178C6?style=for-the-badge&logo=typescript" alt="TypeScript"/>
<img src="https://img.shields.io/badge/PostgreSQL-Supabase-3ECF8E?style=for-the-badge&logo=supabase" alt="Supabase"/>
<img src="https://img.shields.io/badge/Deployed-Vercel-000000?style=for-the-badge&logo=vercel" alt="Vercel"/>

**A full-stack inventory management platform built for the IoT Lab at SIES Graduate School of Technology.**  
Manage components, track checkouts, handle student requests, and keep the lab organized — all in one place.

[Features](#-features) · [Tech Stack](#-tech-stack) · [Setup](#-getting-started) · [Roles](#-user-roles) · [API](#-api-overview) · [Deployment](#-deployment)

</div>

---

## 📋 Overview

LabInventory is a purpose-built system for managing IoT components in an educational lab environment. It replaces paper-based tracking with a digital workflow that connects students, lab assistants, and the Head of Department through a unified platform.

**Core workflow:**
```
Student requests component → HOD approves → Lab Assistant issues → Student returns → Lab confirms
```

Students authenticate via **Microsoft (Azure AD)** using their college email. Lab staff log in using credentials. Every action — from issuing a resistor to verifying a student's PRN — is tracked and auditable.

---

## ✨ Features

### 📦 Inventory Management
- Real-time stock tracking with `totalStock` / `availableStock` counters
- Component condition states: `NEW`, `GOOD`, `WORN`, `DAMAGED`, `LOST`
- QR code generation per component
- USB barcode scanner support (keyboard-mode) + camera QR scanning
- Custom categories, storage location tracking, manufacturer details

### 🔁 Request & Return Workflow
- Students submit requests with purpose, project link, and expected duration
- Multi-level approval: HOD approves → Lab Assistant issues
- Overdue tracking with background cron jobs
- Return scheduling, condition-on-return logging
- Full request history per student and per component

### 🎓 Student Onboarding (Trust-but-Verify)
- Students self-register with PRN, department, and year after Microsoft login
- `isPrnVerified: false` by default — lab staff verify on first scan
- Visual warning badge shown to staff for unverified students
- One-click verification from the scanner/issue page

### 📥 Bulk PRN Import
- Upload CSV: `email, prn, department, year`
- Client-side parsing with Papaparse, live validation, duplicate detection
- Sets `isPrnVerified: true` automatically — no individual verification needed
- Full audit log for every import batch

### 🔔 Real-time Notifications
- WebSocket-powered notification center
- Types: `INFO`, `WARNING`, `SUCCESS`, `RETURN_SCHEDULED`, `RETURN_OVERDUE`
- Role-targeted: notify only students, only staff, or broadcast

### 📊 Dashboards & Analytics
- Role-specific dashboards for Student, Lab Assistant, and HOD
- Usage analytics: most-borrowed components, overdue rates, student activity
- Recharts-powered visual reports and export functionality

### 🤖 AI Features
- Google Generative AI integration for component recommendations
- Smart global search across inventory and student records
- AI assistant chat interface

### 📋 Special Parts Requests
- Students request components not currently in inventory
- Includes part name, quantity, estimated price, and website URL
- Status flow: `PENDING → UNDER_REVIEW → APPROVED → ORDERED → RECEIVED`

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 15 (App Router) |
| **Language** | TypeScript 5.6 |
| **Styling** | Tailwind CSS 3.4 + shadcn/ui + Radix UI |
| **Animations** | Framer Motion |
| **State** | TanStack React Query + React Hook Form |
| **Validation** | Zod |
| **Charts** | Recharts |
| **Database** | PostgreSQL via Supabase + PgBouncer |
| **ORM** | Prisma 5.22 |
| **Auth** | NextAuth.js v5 (Microsoft Entra ID + Credentials) |
| **Real-time** | WebSocket (`ws` library) |
| **AI** | Google Generative AI (`@google/generative-ai`) |
| **QR / Barcode** | `html5-qrcode`, `qrcode` |
| **CSV** | Papaparse |
| **Payments** | Stripe (ready) |
| **Hosting** | Vercel |

---

## 👥 User Roles

| Role | Auth Method | Key Permissions |
|------|------------|----------------|
| **STUDENT** | Microsoft OAuth (college email) | Request components, view own requests, manage projects |
| **LAB_ASSISTANT** | Email + Password | Issue/return components, manage inventory, verify students |
| **HOD** | Microsoft OAuth | Approve/reject requests, manage users, view analytics |
| **ADMIN** | Email + Password | Full system access, user management |
| **OWNER** | Email + Password | Org settings, billing, plan management |

**Default lab assistant credentials** (created via `npm run demo:seed`):
```
Email:    lab.staff@sies.edu
Password: lab123
```

---

## 📁 Project Structure

```
LabInventory_SIESGST/
├── prisma/
│   └── schema.prisma          # 14 database models
├── scripts/
│   ├── seed-demo-data.js      # Populate demo content
│   ├── dev-start.js           # Start Next.js + WebSocket together
│   └── start-websocket.js     # Standalone WebSocket launcher
├── docs/                      # Detailed documentation (13 files)
├── src/
│   ├── middleware.ts           # Auth + role-based route protection
│   ├── app/
│   │   ├── (app)/             # Authenticated routes
│   │   │   ├── dashboard/     #   → student / hod / lab-assistant
│   │   │   ├── inventory/     #   → manage (staff only)
│   │   │   ├── requests/      #   → new, my-requests, approvals
│   │   │   ├── issue-components/  # Lab staff issue UI
│   │   │   ├── parts-issued/  #   Return tracking
│   │   │   ├── projects/      #   Student projects
│   │   │   ├── users/         #   User management + bulk import
│   │   │   └── activity/      #   Audit logs
│   │   ├── (marketing)/       # Public landing pages
│   │   ├── api/               # 21 API route groups
│   │   ├── auth/              # Sign-in / sign-up pages
│   │   └── onboarding/        # Student PRN onboarding
│   ├── components/
│   │   ├── features/          # 23 feature components
│   │   ├── layout/            # Header, Sidebar, UserProfileDropdown
│   │   └── ui/                # shadcn/ui primitives
│   └── lib/
│       ├── auth.ts            # NextAuth configuration
│       ├── prisma.ts          # Prisma singleton
│       ├── validation.ts      # Zod schemas
│       ├── recommendations.ts # AI recommendations
│       ├── websocket.ts       # WebSocket client
│       ├── rate-limit.ts      # API rate limiting
│       ├── stripe.ts          # Stripe billing
│       └── background-jobs.ts # Cron / overdue tracking
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js ≥ 18.17.0
- npm ≥ 9.0.0
- PostgreSQL (Supabase recommended) **or** use local SQLite for dev

### 1. Clone & Install

```bash
git clone https://github.com/HarshDev-byte/iot_parts_management.git
cd iot_parts_management
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` with your values:

```env
# Database (Supabase PostgreSQL)
DATABASE_URL="postgresql://postgres.xxx:password@xxx.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.xxx:password@xxx.pooler.supabase.com:5432/postgres"

# NextAuth
NEXTAUTH_SECRET="generate-a-random-secret-here"
NEXTAUTH_URL="http://localhost:3000"

# Microsoft Entra ID (Azure AD) — for student/HOD login
MICROSOFT_CLIENT_ID="your-azure-app-client-id"
MICROSOFT_CLIENT_SECRET="your-azure-app-secret"
MICROSOFT_TENANT_ID="your-azure-tenant-id"

# Google AI (optional — for recommendations)
GOOGLE_AI_API_KEY="your-gemini-api-key"

# Stripe (optional — for billing)
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
```

> **Tip**: For development without Azure AD, use Credentials auth only (lab assistant login works immediately).

### 3. Set Up Database

```bash
# Push schema to your database
npm run db:push

# Seed demo data including lab assistant account
npm run demo:seed
```

### 4. Start Development

```bash
# Next.js + WebSocket server together
npm run dev:full

# Or just Next.js
npm run dev
```

Open **http://localhost:3000** 🎉

---

## 🌐 API Overview

| Group | Endpoints |
|-------|-----------|
| `/api/auth` | Sign-in, sign-out, OAuth callbacks |
| `/api/components` | CRUD, QR code generation |
| `/api/requests` | Create, approve, reject, issue |
| `/api/returns` | Mark returned, condition logging |
| `/api/parts-issued` | Active checkouts by student PRN |
| `/api/scanner` | Student lookup by PRN (with verification flag) |
| `/api/users` | CRUD, search, bulk PRN import, onboard, verify |
| `/api/projects` | Student project management |
| `/api/notifications` | Get, mark read |
| `/api/dashboard` | Role-specific stats |
| `/api/analytics` | Usage analytics |
| `/api/export` | CSV exports |
| `/api/ai` | AI recommendations |
| `/api/search` | Global smart search |
| `/api/special-requests` | Special parts requests |
| `/api/cron` | Overdue tracking (scheduled) |
| `/api/health` | System health check |

---

## 🗄️ Database Schema

14 models managed by Prisma:

| Model | Purpose |
|-------|---------|
| `User` | Students, lab staff, HOD, admin |
| `Organization` | Multi-tenant workspace |
| `Project` | Student project (groups requests) |
| `Component` | Lab inventory item |
| `ComponentRequest` | Student checkout request |
| `IssuedComponent` | Active checkout record |
| `StockMovement` | Stock in/out audit trail |
| `AuditLog` | Full action audit trail |
| `Notification` | In-app notifications |
| `ComponentHistory` | Historical return archive |
| `SpecialPartRequest` | Requests for unlisted parts |
| `OrganizationInvitation` | Invite tokens |
| `Account` | NextAuth OAuth accounts |
| `Session` | NextAuth sessions |

---

## 🚢 Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Connect repo on [vercel.com](https://vercel.com)
3. Add all environment variables
4. Deploy 🚀

**Azure AD redirect URI** (register in your Azure App Registration):
```
https://<your-vercel-domain>/api/auth/callback/microsoft-entra-id
```

### Docker

```bash
docker-compose up -d
```

### Useful Scripts

```bash
npm run dev           # Development server
npm run dev:full      # Dev server + WebSocket
npm run build         # Production build
npm run db:push       # Push schema to DB
npm run db:studio     # Open Prisma Studio
npm run demo:seed     # Seed demo data
npm test              # Run Jest tests
npm run lint          # ESLint
npm run type-check    # TypeScript check
```

---

## 📚 Documentation

| File | Contents |
|------|----------|
| [PROJECT_CONTEXT.md](./PROJECT_CONTEXT.md) | Full architecture & implementation reference |
| [AUTHORIZATION_AND_ROLES_COMPLETE.md](./AUTHORIZATION_AND_ROLES_COMPLETE.md) | Role matrix & route protection |
| [BARCODE_SCANNING_GUIDE.md](./BARCODE_SCANNING_GUIDE.md) | Scanner setup & usage |
| [BULK_PRN_IMPORT_GUIDE.md](./BULK_PRN_IMPORT_GUIDE.md) | CSV import user guide |
| [TRUST_BUT_VERIFY_IMPLEMENTATION.md](./TRUST_BUT_VERIFY_IMPLEMENTATION.md) | Student onboarding system |
| [USER_ROLES_GUIDE.md](./USER_ROLES_GUIDE.md) | Permissions matrix |
| [LOGIN_GUIDE.md](./LOGIN_GUIDE.md) | Login instructions per role |
| [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md) | Production deployment guide |
| [CHANGELOG.md](./CHANGELOG.md) | Version history |

---

## 🙏 Built With

- [Next.js](https://nextjs.org/) — React framework
- [Prisma](https://www.prisma.io/) — Database ORM
- [NextAuth.js](https://next-auth.js.org/) — Authentication
- [shadcn/ui](https://ui.shadcn.com/) — UI component library
- [Supabase](https://supabase.com/) — PostgreSQL hosting
- [Tailwind CSS](https://tailwindcss.com/) — Styling
- [Framer Motion](https://www.framer.com/motion/) — Animations

---

<div align="center">

**Built for SIES Graduate School of Technology · IoT Lab**

[![GitHub](https://img.shields.io/badge/GitHub-HarshDev--byte-181717?style=flat-square&logo=github)](https://github.com/HarshDev-byte/iot_parts_management)

⭐ Star this repo if you find it useful!

</div>


<div align="center">

![LabInventory](https://img.shields.io/badge/LabInventory-v3.0.0-blue)
![Next.js](https://img.shields.io/badge/Next.js-15-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue)
![License](https://img.shields.io/badge/license-MIT-green)

**Production-Ready SaaS Platform for Modern Labs**

[Features](#-key-features) • [Quick Start](#-quick-start) • [Documentation](#-documentation) • [Demo](#-demo)

</div>

---

## 🎯 Overview

**LabInventory** is a market-ready SaaS platform for managing IoT components and lab equipment. Built with Next.js 15, it features multi-tenancy, subscription management, real-time notifications, and AI-powered recommendations.

### Perfect For
- 🎓 Educational institutions
- 🔬 Research laboratories  
- 🏢 Corporate R&D departments
- 🏭 Manufacturing facilities
- 🛠️ Maker spaces

## ✨ Key Features

### 🏢 Multi-Tenant SaaS
- Complete organization workspaces with data isolation
- Custom branded URLs for each organization
- Team management with role-based access
- Unlimited organizations support

### 💳 Subscription Management
- 3 pricing tiers: Starter (Free), Professional ($99/mo), Enterprise
- 14-day free trial, no credit card required
- Usage tracking and billing dashboard
- Stripe integration ready

### 🎨 Professional Marketing
- Landing page with hero, features, pricing, testimonials
- Legal pages (privacy, terms)
- Contact forms and support channels
- SEO optimized with meta tags and sitemaps

### 🔐 Enterprise Security
- SSO integration (Microsoft Azure AD, Google)
- Role-based access control (5 roles)
- Audit logs for compliance
- Data encryption at rest and in transit

### 📊 Advanced Features
- QR code tracking and scanning
- Real-time WebSocket notifications
- AI-powered component recommendations
- Analytics dashboard with insights
- Automated return management
- RESTful API for integrations

## 🚀 Quick Start

```bash
# Clone and install
git clone https://github.com/<your-username>/LabInventory_SIESGST.git
cd labinventory
npm install

# Configure environment
cp .env.example .env
# Edit .env with your settings

# Set up database
npm run db:push

# Seed demo data (optional)
npm run demo:seed

# Start development
npm run dev:full
```

Visit `http://localhost:3000` 🎉

## 📚 Documentation

- **[Market-Ready Guide](./docs/MARKET_READY_GUIDE.md)** - Complete feature overview
- **[Quick Start](./docs/QUICKSTART.md)** - Step-by-step setup
- **[Deployment Guide](./docs/DEPLOYMENT.md)** - Production deployment
- **[SaaS Documentation](./docs/README_SAAS.md)** - Detailed SaaS features
- **[Changelog](./CHANGELOG.md)** - Version history

## 💰 Pricing

| Plan | Price | Users | Components | Features |
|------|-------|-------|------------|----------|
| **Starter** | Free | 50 | 500 | Basic analytics, Email support |
| **Professional** | $99/mo | 500 | 5,000 | AI recommendations, API access |
| **Enterprise** | Custom | Unlimited | Unlimited | Custom integrations, SLA |

## 🏗️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript 5.6
- **Database**: Prisma ORM + PostgreSQL
- **Auth**: NextAuth.js v5
- **UI**: TailwindCSS + shadcn/ui
- **Real-time**: WebSocket Server
- **Payments**: Stripe (ready to integrate)

## 📁 Project Structure

```
labinventory/
├── src/
│   ├── app/
│   │   ├── (marketing)/      # Public pages
│   │   ├── (app)/             # Authenticated app
│   │   ├── auth/              # Auth pages
│   │   └── api/               # API routes
│   ├── components/            # React components
│   ├── lib/                   # Utilities
│   └── types/                 # TypeScript types
├── prisma/                    # Database schema
├── public/                    # Static assets
└── docs/                      # Documentation
```

## 🚢 Deployment

### Vercel (Recommended)
```bash
vercel --prod
```

### Docker
```bash
docker-compose up -d
```

### VPS
See [Deployment Guide](./docs/DEPLOYMENT.md) for detailed instructions.

## 🔧 Configuration

Key environment variables:

```env
DATABASE_URL="postgresql://..."
NEXTAUTH_URL="https://yourdomain.com"
NEXTAUTH_SECRET="your-secret"
STRIPE_SECRET_KEY="sk_live_..."
AZURE_AD_CLIENT_ID="your-client-id"
```

See [.env.example](./.env.example) for complete list.

## 🧪 Testing

```bash
npm test              # Run tests
npm run test:coverage # Coverage report
npm run test:watch    # Watch mode
```

## 📊 What's New in v3.0

- ✅ Multi-tenant architecture
- ✅ Professional marketing website
- ✅ Subscription management
- ✅ Organization workspaces
- ✅ Team collaboration
- ✅ Enhanced SEO
- ✅ Stripe integration ready
- ✅ Production deployment guides

See [CHANGELOG.md](./CHANGELOG.md) for details.

## 🤝 Contributing

We welcome contributions! Please feel free to submit a Pull Request.

## 📝 License

MIT License - see [LICENSE](./LICENSE) file.

## 🙏 Acknowledgments

Built with amazing open-source tools:
- [Next.js](https://nextjs.org/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Prisma](https://www.prisma.io/)
- [NextAuth.js](https://next-auth.js.org/)

## 📞 Support

- 🐛 Issues: [GitHub Issues](https://github.com/<your-username>/LabInventory_SIESGST/issues)

---

<div align="center">

**Built for SIES Graduate School of Technology**

⭐ Star us on GitHub if you find this useful!

</div>
