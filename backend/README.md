# HorizonInvest Backend

Backend service for HorizonInvest using Node.js, Express, MySQL, JWT auth, and Socket.IO.

## Setup

1. Copy `.env.example` to `.env`.
2. Fill in your local MySQL/phpMyAdmin credentials.
3. Install dependencies:
   - `npm install`
4. Run migrations and seed data:
   - `npm run migrate`
   - `npm run seed`
5. Start server:
   - `npm run dev`

## Scripts

- `npm run dev` - start backend in watch mode
- `npm run start` - start backend once
- `npm run migrate` - run database migrations
- `npm run migrate:rollback` - rollback last migration batch
- `npm run seed` - run seeders
- `npm run test` - run tests

## Environment Variables

Use `.env.example` as source of truth for required placeholders.

## API and Socket

- Base URL: `http://localhost:5000/api`
- Health: `GET /api/health`
- Socket.IO auth: pass JWT in `auth.token` during connection handshake.

For complete endpoints and payloads, see `API_CONTRACT.md`.
