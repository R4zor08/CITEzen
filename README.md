# CITEzen

CITEzen was developed to bridge the gap between students and the administration. We understand that navigating university processes can sometimes be confusing and time-consuming.

UI scaffold generated with [Magic Patterns](https://magicpatterns.com) ([source design](https://www.magicpatterns.com/c/ucl9mh5qdnd6vqamlnl21s)).

## Getting started (frontend)

1. Run `npm install`
2. Copy `.env.example` to `.env` and set `VITE_GROQ_API_KEY` if you use GabAI chat.
3. Run `npm run dev`

## Backend (Node.js + Prisma + SQLite)

The API lives in `server/`. From the repo root:

```bash
cd server
npm install
npx prisma generate
npx prisma db push
npm run db:seed
npm run dev
```

Browse tables: `cd server && npx prisma studio`. See `server/README.md` for endpoints and env vars.

Convenience (from repo root): `npm run server:dev` after the one-time `server` setup above.
