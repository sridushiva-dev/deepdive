# Deep Dive

An AI-powered learning app for curious learners who never stop diving deeper. Every learning journey becomes a visual **constellation** — a map of concepts explored at increasing depth.

## Features

- **BYOK (Bring Your Own Key)** — Connect OpenAI, Anthropic, Google AI, Groq, or Mistral
- **Demo dives** — Pre-seeded journeys with no API cost
- **Constellation maps** — Interactive 2D graph of your learning session
- **Share your depth** — Public or private links + shareable OG images
- **10 curated maps** — ~1 hour dives on science, history, finance, and more
- **Age-aware onboarding** — Safe mode and parental consent flows
- **i18n** — English and Hindi UI
- **RBAC** — Learner and Admin roles (admin: `sridushiva@gmail.com`)

## Stack

- Next.js 15 (App Router), React 19, Tailwind CSS 4
- PostgreSQL (production) / SQLite (local dev)
- Prisma, NextAuth.js, next-intl
- React Flow for constellation visualization
- Framer Motion for Apple-style animations

## Getting Started

```bash
npm install
npm run db:push
npm run db:seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Environment Variables

Copy `.env.example` to `.env` and configure:

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL URL (Neon) or `file:./dev.db` for SQLite |
| `NEXTAUTH_SECRET` | Random secret for session encryption |
| `NEXTAUTH_URL` | App URL (e.g. `http://localhost:3000`) |
| `ENCRYPTION_KEY` | 64-char hex string (32 bytes) for BYOK key encryption |
| `GOOGLE_CLIENT_ID` | Optional Google OAuth |
| `GOOGLE_CLIENT_SECRET` | Optional Google OAuth |
| `ADMIN_EMAILS` | Comma-separated admin email allowlist |

## Deployment

**Recommended:** Vercel + Neon PostgreSQL

1. Push to GitHub
2. Import to Vercel
3. Set env vars
4. Use Neon PostgreSQL `DATABASE_URL`
5. Change Prisma provider to `postgresql` in `schema.prisma` for production

**Domain:** Point your Hostinger domain to Vercel.

## Roadmap

- [ ] Razorpay subscription (platform AI tier)
- [ ] More regional languages (Tamil, Telugu, Kannada)
- [ ] 3D constellation view option

## License

Private — All rights reserved.
