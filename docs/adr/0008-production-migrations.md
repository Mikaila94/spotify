# ADR 0008: Apply Prisma migrations on the Vercel build

* Status: Accepted
* Date: 2026-09-13

## Context

Vercel deploys this app on git push. The production Postgres starts empty. `next build` compiles code. It does not create tables.

Sign-up hit `P2021` (`public.User` does not exist) because nobody ran `migrate deploy` against the cloud URL.

## Problem

New schema must reach production without a laptop command after every change. GitHub CI must not talk to a live database.

## Options considered

### Manual `migrate deploy`

Works once. Easy to forget. That is tonight’s 500.

### GitHub Action after CI

Needs a copy of `DATABASE_URL`. Vercel can finish deploying before the Action migrates, so new code can hit old (or empty) tables.

### Migrate inside the running app

A request is the wrong time to change schema. Failures and concurrent deploys get messy.

### `vercel-build`: migrate, then `next build`

Vercel already has `DATABASE_URL`. Tables update before the new functions go live. `pnpm build` in CI stays compile-only.

## Decision

Add a `vercel-build` script: `prisma migrate deploy && prisma db seed && next build --turbopack`.

Vercel runs that instead of `build`. GitHub Actions and local `pnpm build` do not migrate or seed.

`migrate deploy` always applies schema. Seed does **not** wipe production. It inserts the demo catalog only when there are no songs. A full wipe is local-only: `SEED_RESET=1`. The old seed deleted every user on every run; that must not run on Vercel.

## Consequences

### Positive

* A schema change in `prisma/migrations` applies on the next production deploy.
* A failed migration fails the deploy. We do not ship code that expects missing tables.
* An empty cloud catalog gets demo songs and the Mikail user on deploy. Existing sign-up users stay.

### Negative

* The Vercel build needs a reachable `DATABASE_URL` (`postgres://` or `postgresql://`).
* Preview and production share one Hobby database today, so a preview deploy also migrates that database.

## Revisit when

We split preview and production databases, or we need a migrate step that is not tied to `next build`.
