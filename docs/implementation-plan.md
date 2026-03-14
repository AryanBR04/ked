# LMS Implementation Plan

This file breaks the project into very small, execution-friendly tasks so we can build fast without losing structure.

## Phase 1: Workspace Setup

- [x] Create monorepo folders: `backend`, `frontend`, `docs`.
- [x] Add workspace `package.json`.
- [x] Add `.gitignore`.
- [x] Add project README.
- [x] Install dependencies for backend and frontend.
- [x] Add env templates.

## Phase 2: Database Foundation

- [x] Create initial SQL migration for `users`.
- [x] Create initial SQL migration for `subjects`.
- [x] Create initial SQL migration for `sections`.
- [x] Create initial SQL migration for `videos`.
- [x] Create initial SQL migration for `enrollments`.
- [x] Create initial SQL migration for `video_progress`.
- [x] Create initial SQL migration for `refresh_tokens`.
- [x] Add indexes for `slug`, composite ordering, and progress uniqueness.
- [x] Verify foreign key cascades.
- [ ] Prepare seed strategy for local demo content.

## Phase 3: Backend Bootstrapping

- [x] Create backend `package.json`.
- [x] Create TypeScript config.
- [x] Add environment loader and validation.
- [x] Add MySQL pool helper.
- [x] Add security config for JWT, cookies, and CORS.
- [x] Create Express app entry.
- [x] Create HTTP server entry.
- [x] Add request logger middleware.
- [x] Add auth middleware.
- [x] Add centralized error handler.
- [x] Add `/api/health`.

## Phase 4: Auth Module

- [x] Add auth validators for register/login.
- [x] Add password hashing helper.
- [x] Add JWT access token helper.
- [x] Add refresh token issuance helper.
- [x] Add `POST /api/auth/register`.
- [x] Add `POST /api/auth/login`.
- [x] Add `POST /api/auth/refresh`.
- [x] Add `POST /api/auth/logout`.
- [x] Add refresh-token revocation logic.
- [x] Add user lookup by email/id.

## Phase 5: Subject and Video Domain

- [x] Add subject repository queries for public listing.
- [x] Add subject detail query.
- [x] Add section + video tree query.
- [x] Add utility to flatten ordered videos.
- [x] Add utility to compute `previous_video_id` and `next_video_id`.
- [x] Add utility to compute `locked` status.
- [x] Add `GET /api/subjects`.
- [x] Add `GET /api/subjects/:subjectId`.
- [x] Add `GET /api/subjects/:subjectId/tree`.
- [x] Add `GET /api/subjects/:subjectId/first-video`.
- [x] Add `GET /api/videos/:videoId`.

## Phase 6: Progress Module

- [x] Add query for per-video progress.
- [x] Add upsert for per-video progress.
- [x] Add aggregate query for subject progress.
- [x] Cap saved position by known duration.
- [x] Reject progress writes to locked videos.
- [x] Add `GET /api/progress/videos/:videoId`.
- [x] Add `POST /api/progress/videos/:videoId`.
- [x] Add `GET /api/progress/subjects/:subjectId`.

## Phase 7: Frontend Bootstrapping

- [x] Create frontend `package.json`.
- [x] Add Next.js config.
- [x] Add Tailwind config.
- [x] Add app router layout.
- [x] Add global styles and design tokens.
- [x] Add API config helper.
- [x] Add auth store.
- [x] Add API client with refresh handling.
- [x] Add route-level loading and error states where needed.

## Phase 8: Frontend Public Pages

- [x] Build homepage subject listing.
- [x] Build login page.
- [x] Build register page.
- [x] Build subject overview page.
- [x] Add CTA states for logged-out and logged-in users.

## Phase 9: Frontend Learning Experience

- [x] Build persistent subject layout with sidebar.
- [x] Fetch subject tree into sidebar.
- [x] Show completed and locked states in sidebar.
- [x] Build video page shell.
- [x] Embed YouTube player.
- [x] Restore saved playback position.
- [x] Send debounced progress updates.
- [x] Mark lesson complete on video end.
- [x] Auto-advance to next unlocked lesson.
- [x] Show completion state after last video.

## Phase 10: Profile and Progress Views

- [x] Build profile page shell.
- [x] Show subject completion summaries.
- [x] Show resume information.

## Phase 11: Testing

- [x] Add unit tests for ordering utility.
- [x] Add unit tests for lock computation.
- [x] Add unit tests for progress capping.
- [x] Add route smoke tests for health and auth.

## Phase 12: Deployment Readiness

- [ ] Add production env examples.
- [ ] Document Render backend deployment steps.
- [ ] Document Vercel frontend deployment steps.
- [ ] Document Aiven MySQL connection setup.
- [ ] Add health-check notes and cookie-domain notes.

## Current Build Order

1. Add seed data and demo content for local development.
2. Add route tests for auth and health plus a progress-capping test.
3. Add enrollment flows and admin/instructor content management.
4. Wire real deployment env values for Render, Vercel, and Aiven.
