# IPOFlow

A personal web application to manage IPO investments for multiple members — members, wallet & ledger, IPO applications, allotments, sales, settlement, and reporting.

See `docs/` for the full business rules, database design, API, and coding conventions.

## Stack

- **Frontend:** React, Vite, TypeScript, TailwindCSS
- **Backend:** Express, TypeScript, Prisma
- **Database:** MySQL

## Prerequisites

- Node.js 22+
- A running MySQL server (local install or Docker)

## Project layout

```
IpoFlow/
├── docs/       # business rules, schema, API, coding conventions
├── prisma/     # schema.prisma, migrations (shared by the backend)
├── backend/    # Express + TypeScript API
└── frontend/   # React + Vite + TypeScript client
```

## Setup

### 1. Database

Create a MySQL database for the app, e.g.:

```sql
CREATE DATABASE ipoflow;
```

### 2. Backend

```bash
cd backend
npm install
cp .env.example .env
# edit .env and set DATABASE_URL to your MySQL connection string
npm run prisma:generate
npm run prisma:migrate
npm run dev
```

The API starts on `http://localhost:4000` (health check at `GET /api/health`).

### 3. Frontend

```bash
cd frontend
npm install
cp .env.example .env
# edit .env if your API runs somewhere other than localhost:4000
npm run dev
```

The app starts on `http://localhost:5173`.

## Available scripts

Run these inside `backend/` or `frontend/` respectively:

| Script | Description |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Type-check and build for production |
| `npm run lint` | Run ESLint |
| `npm run format` | Format the codebase with Prettier |

Backend-only Prisma scripts:

| Script | Description |
| --- | --- |
| `npm run prisma:generate` | Regenerate the Prisma client after schema changes |
| `npm run prisma:migrate` | Create and apply a migration in development |
| `npm run prisma:studio` | Open Prisma Studio to browse the database |

## Architecture

The backend follows a strict layered architecture (see `docs/07-coding-rules.md`):

```
Controller → Service → Repository → Prisma
```

- Controllers are thin — they parse requests and call services.
- All business logic and financial calculations live in services.
- Repositories are the only layer that touches Prisma.
- The frontend never performs financial calculations — it only displays data returned by the API.
