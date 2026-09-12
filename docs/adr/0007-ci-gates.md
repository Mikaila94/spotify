# ADR 0007: CI runs lint, types, tests, and build

* Status: Accepted
* Date: 2026-09-12

## Context

We push to `main`. Lint, `tsc`, Vitest, and `next build` only run if someone remembers. A broken push is easy to miss.

We do not have a hosting setup in this repo (no Vercel project, no deploy token).

## Problem

Catch broken `main` automatically. Do not pretend we deploy if we have nowhere to deploy.

## Options considered

### Only test

Fast. A type error or a broken `next build` can still land.

### Lint, typecheck, test, and build (no deploy)

Same checks we should run locally. Dummy `DATABASE_URL` / `JWT_SECRET` so Prisma generate and the Next compile can run. No live database in CI.

### CI plus auto-deploy

Needs a host and secrets. We do not have that yet. Git-connected Vercel (or similar) can be CD later without us inventing a deploy script.

## Decision

GitHub Actions on `main` and pull requests: install with the lockfile, then lint, `tsc --noEmit`, `vitest run`, `next build`.

`pnpm ci` runs the same four steps locally.

No deploy job until we pick a host.

## Consequences

### Positive

* A red check is visible on GitHub after push.
* The four steps stay one command on a laptop.

### Negative

* CI does not prove the app can talk to Postgres.
* Dummy env is not production config.

## Revisit when

Vercel git integration is the host (see ADR 0008). CI still does not deploy and still does not migrate. Add a CI database only if tests start hitting Prisma.
