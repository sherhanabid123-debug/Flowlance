# Flowlance

A client and workspace management dashboard for freelancers and small agencies — track clients, follow-ups, and team members in one place.

## Features

- Email/password and Google OAuth login
- Workspaces with team members and role-based permissions
- Client tracking with health status, follow-up history, and reminders
- Automated follow-up reminders via a cron endpoint
- Dashboard with revenue and client insights
- Data export

## Tech stack

- [Next.js](https://nextjs.org/) 16 (App Router, API routes)
- React 19 + TypeScript
- MongoDB with Mongoose
- JWT-based auth (bcrypt for password hashing)
- Zustand for state management
- Stripe (billing)
- Nodemailer (email)
- Framer Motion, Recharts, Tailwind CSS

## Project structure

```
src/app/
  api/            API routes (auth, clients, workspaces, cron)
  dashboard/      Dashboard pages
  login/, onboarding/, invite/, reset-password/   Auth flow pages
src/components/
  auth/           Auth modal
  dashboard/      Dashboard widgets
  landing/        Marketing landing page sections
  layout/         Sidebar, top nav, notifications
  modals/         Feature modals (edit profile, invite, etc.)
  ui/             Reusable UI components
src/lib/          Auth, DB connection, email, permissions, insights logic
src/models/       Mongoose models (User, Client, Workspace)
src/store/        Zustand stores
src/hooks/        Custom hooks
```

## Getting started

1. Copy `.env.example` to `.env.local` and fill in the values (MongoDB URI, JWT secret, Google OAuth credentials, email server, etc.)
2. Install dependencies and run the dev server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view it locally.

## Build

```bash
npm run build
npm run start
```

## Linting

```bash
npm run lint
```
