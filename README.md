# KED LMS

Monorepo for a YouTube-powered LMS with:

- `frontend/`: Next.js 14 + Tailwind student-facing app
- `backend/`: Express + TypeScript REST API
- `docs/implementation-plan.md`: detailed step-by-step execution plan
- `docs/deployment.md`: production deployment defaults for Vercel + Render

## Planned Flow

1. Users register or log in.
2. Students browse published subjects.
3. Subject pages show sections and videos in strict order.
4. The video page embeds YouTube, tracks progress, and unlocks the next lesson.
5. Backend stores progress, refresh tokens, and navigation state in MySQL.

## Quick Start

1. Install dependencies with `npm install`.
2. Copy env templates from `backend/.env.example` and `frontend/.env.example`.
3. Run the backend with `npm run dev:backend`.
4. Run the frontend with `npm run dev:frontend`.

## Database Setup

1. Run `npm run migrate --workspace backend`.
2. Run `npm run seed --workspace backend`.

This repo now supports hosted MySQL through `DATABASE_URL`, including Aiven-style `ssl-mode=REQUIRED`.

## Production Defaults

The repo now includes ready-to-use production examples for:

- `backend/.env.production.example`
- `frontend/.env.production.example`

Default deployment assumption:

- frontend: `https://ked-lms.vercel.app`
- backend: `https://ked-lms-api.onrender.com`

See `docs/deployment.md` for the exact values and why they were chosen.
