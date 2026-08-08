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

## Deploy on Vercel

1. **Merge** the app branch into `main` (or set Vercel Production Branch to `cursor/deep-dive-foundation-ebdb`)
2. Create a free [Neon](https://neon.tech) PostgreSQL database
3. In Vercel → Settings → Environment Variables, add:
   - `DATABASE_URL` — Neon connection string
   - `NEXTAUTH_SECRET` — run `openssl rand -base64 32`
   - `NEXTAUTH_URL` — `https://your-app.vercel.app`
   - `ENCRYPTION_KEY` — 64 hex chars (`openssl rand -hex 32`)
   - `ADMIN_EMAILS` — `sridushiva@gmail.com`
4. After first deploy, run once locally or via Neon SQL:
   ```bash
   DATABASE_URL="your-neon-url" npx prisma db push
   DATABASE_URL="your-neon-url" npm run db:seed
   ```
5. Redeploy if needed

**Note:** Vercel deploys from `main` by default. If `main` only has a README, you will get a 404.

## Roadmap

- [ ] Razorpay subscription (platform AI tier)
- [ ] More regional languages (Tamil, Telugu, Kannada)
- [ ] 3D constellation view option

## License

Private — All rights reserved.
