# User Management System

A monorepo containing a Node/Express/MongoDB API and two Next.js frontend applications (User Portal and Admin Dashboard).

## Prerequisites

- **Node.js** v22+
- **Docker** - Required to run MongoDB

## Project Structure

```
user-management-system/
├── apps/
│   ├── api/          # Express + MongoDB API
│   ├── portal/       # Next.js user portal
│   └── admin/        # Next.js admin dashboard
├── packages/
│   ├── types/        # Shared TypeScript interfaces
│   ├── styles/       # Tailwind v4 + DaisyUI v5 CSS
│   └── utils/        # API client
└── docker-compose.yml
```

## Getting Started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start the development environment:

   ```bash
   npm run dev
   ```

   This will:
   - Start MongoDB container (port 27017)
   - Start API on http://localhost:3001
   - Start user portal on http://localhost:3000
   - Start admin dashboard on http://localhost:3002

## Environment Variables

- **API** (`apps/api/.env`):
  - `PORT` - API port (default: 3001)
  - `MONGODB_URI` - MongoDB connection string
  - `JWT_SECRET` - JWT signing secret

- **Frontend apps** (`apps/users/.env.local`, `apps/admin/.env.local`):
  - `NEXT_PUBLIC_API_URL` - API base URL

## Available Scripts

- `npm run dev` - Start all services in development mode
- `npm run build` - Build all packages/apps
- `npm run clean` - Clean build artifacts

## Features

- **Portal** (port 3000): Login/register for regular users
- **Admin Dashboard** (port 3002): User management (admin only)
- **API** (port 3001): RESTful endpoints for authentication and user CRUD
