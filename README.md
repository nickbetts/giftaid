# GiftAid OS

AI-first Gift Aid operations platform for UK charities.

This repository now includes a working foundation:

- Charity-friendly marketing pages.
- Neon-backed donation upload persistence.
- CSV parsing, validation, and upload summaries.
- Claim creation from uploaded rows.
- HMRC submission stub with persisted claim status updates.
- Anthropic-backed upload guidance for plain-language next steps.
- Prisma schema for tenancy, ingestion, claims, AI events, and audit logs.

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

2. Link to the Vercel project and pull environment variables.

```bash
vercel link --scope i3medias-projects --project giftaid --yes
```

```bash
vercel env pull .env.local
cp .env.local .env
```

3. Start development server.

```bash
npm run dev
```

4. Open http://localhost:3000

## Implemented Routes

- /: Charity-friendly marketing home page.
- /charity: Core charity onboarding and benefits page.
- /charity/claim: Gift Aid claim submission flow page.
- /dashboard: Live Neon-backed operations cockpit.
- /upload: Live upload validation and persistence flow.
- /claims: Live claim creation and submission workspace.
- /api/uploads: Upload persistence and row ingestion.
- /api/claims: Claim listing.
- /api/claims/create: Claim creation from saved uploads.
- /api/ingestion/preflight: Deterministic risk scoring endpoint.
- /api/claims/submit: Persisted HMRC submission stub.
- /api/ai/upload-guidance: Plain-language upload guidance powered by Anthropic.

## Database Commands

```bash
npm run db:generate
npm run db:push
```

If Prisma cannot find DATABASE_URL, make sure .env exists and includes the values pulled from Vercel.

Blob storage is optional in the current code path. If BLOB_READ_WRITE_TOKEN is present, uploaded CSV content is stored in Vercel Blob. Without it, the app falls back to an inline storage marker while still persisting upload metadata and parsed rows in Neon.

Anthropic is used server-side only. Set ANTHROPIC_API_KEY and optionally ANTHROPIC_MODEL in Vercel and your local env files before using upload guidance.

## Next Build Steps

1. Replace the HMRC submission stub with the real API adapter and auth flow.
2. Add authentication and charity-level access control.
3. Move file upload from pasted CSV to direct file picker and signed Blob upload flow.
4. Add AI-assisted row repair and eligibility explanations.
5. Add audit views and operational exception handling.
