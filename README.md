# GiftAid OS

AI-first Gift Aid operations platform for UK charities.

This repository now includes the first implementation slice:

- Modern marketing and product shell pages.
- Upload preflight workflow and scoring API.
- Claim submission queue API stub.
- Initial Prisma schema for tenancy, ingestion, claims, AI events, and audit logs.

## Stack

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS v4
- Prisma (schema included)

## Quick Start

1. Install dependencies.

```bash
npm install
```

2. Copy environment variables.

```bash
cp .env.example .env.local
```

3. Start development server.

```bash
npm run dev
```

4. Open http://localhost:3000

## Implemented Routes

- /: Landing page for product direction.
- /dashboard: Operations cockpit preview.
- /upload: Preflight scoring playground connected to API.
- /claims: Claim queue and confidence view.
- /api/ingestion/preflight: Deterministic risk scoring endpoint.
- /api/claims/submit: Submission enqueue endpoint (stub).

## Next Build Steps

1. Wire authentication and charity tenancy.
2. Implement secure file uploads and ingestion worker.
3. Connect claim builder to HMRC submission adapter.
4. Persist preflight and submission events in database.
5. Add AI prompt orchestration with redaction and audit evidence.
