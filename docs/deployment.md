# Deployment Guide

This repo is now prepared around these default production assumptions:

- Frontend URL: `https://ked-lms.vercel.app`
- Backend URL: `https://ked-lms-api.onrender.com`

If you later pick different names, only the env values need to change.

## Why these settings

The frontend and backend are on different domains:

- `vercel.app`
- `onrender.com`

That makes the refresh cookie cross-site in production, so the backend should use:

- `COOKIE_SAME_SITE=none`
- `secure` cookies
- exact CORS origin matching the frontend URL
- blank `COOKIE_DOMAIN` so the cookie stays host-only on the backend domain

## Backend on Render

Deploy the `backend/` workspace as a Node web service.

Suggested settings:

- Root directory: repository root
- Build command: `npm install && npm run build --workspace backend`
- Start command: `npm run start --workspace backend`

Set these env vars in Render:

```env
PORT=4000
NODE_ENV=production
DATABASE_URL=mysql://avnadmin:<password>@mysql-xxxx.aivencloud.com:12345/defaultdb?ssl-mode=REQUIRED
DB_SSL_MODE=require
ACCESS_TOKEN_SECRET=<long-random-secret>
REFRESH_TOKEN_SECRET=<long-random-secret>
ACCESS_TOKEN_TTL=15m
REFRESH_TOKEN_TTL=30d
CORS_ORIGINS=https://ked-lms.vercel.app
COOKIE_DOMAIN=
COOKIE_SAME_SITE=none
REFRESH_COOKIE_NAME=ked_refresh_token
```

After the backend is live, run:

```bash
npm run migrate --workspace backend
npm run seed --workspace backend
```

## Frontend on Vercel

Deploy the `frontend/` app on Vercel.

Suggested settings:

- Root directory: `frontend`
- Framework preset: Next.js

Set this env var in Vercel:

```env
NEXT_PUBLIC_API_BASE_URL=https://ked-lms-api.onrender.com/api
```

## If you rename the services

Update only these two values:

- backend `CORS_ORIGINS`
- frontend `NEXT_PUBLIC_API_BASE_URL`

Everything else can stay the same unless you move both apps under the same custom domain.

