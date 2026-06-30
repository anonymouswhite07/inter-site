# Simply Updify — Internship Management Platform (Full Stack)

A premium, production-ready enterprise SaaS platform for managing interns, mentors, tasks, submissions, analytics, and certifications.

## 🚀 Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS, shadcn/ui, Framer Motion
- **Backend**: Next.js Server Actions + Route Handlers, Prisma ORM, MongoDB
- **Authentication**: NextAuth.js v5 (Auth.js) with RBAC & Middleware Protection
- **Email**: Resend (API-ready)
- **Containerization**: Docker & Docker Compose

---

## 📦 Features (Phase 1)

1. **Role-Based Access Control (RBAC)**:
   - **Super Admin / Admin**: Full dashboard analytics, intern & mentor overview, task creation, announcements.
   - **Mentor**: Manage assigned interns, review queue, performance radar chart.
   - **Intern**: Personal progress radial tracker, current tasks list with progress bars, streak counters, leaderboard, announcements feed, and mentor feedback.
2. **Interactive Landing Page**: Modern enterprise design featuring Hero, Feature cards, Domain list, Journey Timeline, Testimonials, FAQ Accordion, Contact Form, and Dark/Light Mode.
3. **Multi-Step Application**: Beautiful register page with multi-step validation for personal info, education, and domain selection.
4. **Global Search & UI**: Integrated Command Menu (Ctrl+K ready), responsive navigation, and loading skeletons.
5. **Database Seeding**: Easily populate the MongoDB database with 25+ realistic mock users, tasks, and achievements.

---

## 🛠️ Setup Instructions

### Prerequisites
- Node.js 18+ and npm
- MongoDB (Local instance or Atlas URL) OR Docker

### 1. Environment Configuration
Create a `.env.local` file in the root directory (based on `.env.example`):
```env
MONGODB_URI=mongodb://username:password@host:port/database
MONGODB_DB=internship-platform
AUTH_SECRET=your-32-byte-base64-secret-key
AUTH_URL=http://localhost:3000
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Run Database Seed
To populate your MongoDB database with demo accounts, batches, tasks, and achievements:
```bash
# Ensure MongoDB is running first
npx tsx scripts/seed.ts
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔑 Demo Credentials
All seeded accounts use the password: `password123`

- **Admin**: `admin@simplyupdify.app`
- **Mentor**: `mentor@simplyupdify.app`
- **Intern**: `intern@simplyupdify.app`

---

## 🐳 Docker Deployment

To spin up the entire stack (Next.js app + MongoDB + Mongo Express UI) using Docker:

```bash
docker-compose up --build
```
- Web Application: [http://localhost:3000](http://localhost:3000)
- Mongo Express Dashboard: [http://localhost:8081](http://localhost:8081) (Login: `admin` / `password`)

---

## 📁 Architecture Overview
```
src/
├── app/
│   ├── (auth)/             # Login & Registration pages
│   ├── (marketing)/        # Landing website (page.tsx)
│   ├── dashboard/          # Admin, Mentor, and Intern portals
│   └── api/                # Route Handlers (Auth, Register)
├── components/
│   ├── ui/                 # shadcn/ui primitives
│   └── providers.tsx       # NextAuth & Theme Providers
├── lib/
│   ├── auth.ts             # NextAuth configuration
│   ├── mongodb.ts          # MongoDB client connection
│   ├── rbac.ts             # Role-Based Access Control logic
│   └── utils.ts            # Core utility helpers
├── scripts/
│   └── seed.ts             # Database seeder
└── types/
    └── index.ts            # TypeScript interfaces & enums
```
