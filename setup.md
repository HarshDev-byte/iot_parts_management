# IoT Parts Management System - Setup Guide

## Prerequisites
- Node.js 18+ and npm/yarn
- PostgreSQL database
- Microsoft Azure AD application

## Installation Steps

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Setup
```bash
cp .env.example .env
```

Configure the following variables in `.env`:
- `DATABASE_URL`: PostgreSQL connection string
- `NEXTAUTH_SECRET`: Random secret for NextAuth.js
- `AZURE_AD_CLIENT_ID`: Azure AD application client ID
- `AZURE_AD_CLIENT_SECRET`: Azure AD application secret
- `AZURE_AD_TENANT_ID`: Azure AD tenant ID
- `COLLEGE_DOMAIN`: Your institution's email domain

### 3. Database Setup
```bash
npx prisma generate
npx prisma db push
```

### 4. Development Server
```bash
npm run dev
```

## Key Features Fixed

### Authentication System
- ✅ Microsoft Azure AD integration with college domain restriction
- ✅ Role-based access control and secure session management
- ✅ Professional sign-in page with error handling

### Role-Based Dashboards
- ✅ Student Dashboard: Request tracking, return reminders, quick actions
- ✅ HOD Dashboard: Approval workflow, department analytics, user management
- ✅ Lab Assistant Dashboard: Inventory management, transaction tracking

### Inventory Management
- ✅ Browse Inventory: Student-friendly component catalog with search/filter
- ✅ Manage Inventory: Lab assistant interface for adding/editing components
- ✅ Real-time stock tracking and low-stock alerts

### Request Management System
- ✅ New Request: Intuitive component selection and request submission
- ✅ My Requests: Student request tracking with status updates
- ✅ Approvals: HOD approval workflow with bulk operations

### QR Scanner Interface
- ✅ Camera-based QR/barcode scanning interface
- ✅ Component and student ID verification
- ✅ Issue and return transaction processing

## Error Fixes Applied

### 1. Removed Radix UI Dependencies
- Replaced Radix UI components with custom implementations
- Fixed Dialog component to work without external dependencies
- Updated Button component to remove Slot dependency

### 2. Fixed Authentication Configuration
- Added proper error handling for missing environment variables
- Improved database connection error handling
- Added development mode bypass for domain restrictions

### 3. Fixed API Routes
- Added comprehensive error handling in all API endpoints
- Improved database query error handling
- Added proper validation and logging

### 4. Fixed React Hooks
- Created mutation factory to handle dynamic request IDs
- Fixed approval workflow mutations
- Added proper error handling in all hooks

### 5. Fixed Middleware
- Added proper type checking for user roles
- Improved route protection logic
- Added fallback handling for missing tokens

## Production Deployment

### Docker Deployment
```bash
docker build -t iot-parts-management .
docker run -p 3000:3000 --env-file .env iot-parts-management
```

### Docker Compose
```bash
docker-compose up -d
```

## System Architecture

The system now provides:
- **Scalable Architecture**: Modular design for multi-institution deployment
- **Performance Optimized**: Efficient queries, caching, and lazy loading
- **Type Safety**: Full TypeScript implementation with proper error handling
- **Security**: Role-based permissions, audit logging, and input validation
- **Professional UI**: Enterprise-grade design with responsive layout

## Next Steps

1. Configure Azure AD application for your institution
2. Set up PostgreSQL database
3. Configure environment variables
4. Run database migrations
5. Start development server
6. Test authentication and role-based access

The system is now ready for production deployment and can serve educational institutions with a professional-grade IoT parts management solution.