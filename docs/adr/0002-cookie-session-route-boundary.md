# ADR 0002: Protect the player with a server-verified cookie session

* Status: Accepted
* Date: 2026-08-17

## Context

The player was previously rendered by the root layout, so sign-in and registration appeared inside the authenticated application shell. Authentication endpoints issued a JWT cookie, but pages and music APIs did not verify it.

Users should authenticate before the player, library navigation, or song data become available.

## Options considered

### Client-side authentication guard

A React context could fetch session state and redirect unauthenticated users. This would expose the player shell before hydration, duplicate server knowledge in the browser, and treat security as a UI concern.

### Middleware for all protected routes

Middleware can reject requests before route rendering. Verifying the existing JWT there introduces another runtime boundary and central matcher configuration. It is not required for the current number of routes.

### Protected server layout and API verification

A Next.js route group can keep authentication pages outside the player shell. Its server layout verifies the HTTP-only cookie before rendering protected pages. Protected APIs verify the same session independently.

## Decision

Use an HTTP-only, `SameSite=Lax` JWT cookie as the current session credential.

Keep `/sign-in` and `/sign-up` in the public root shell. Place player pages in a protected route group whose server layout redirects unauthenticated requests. Verify the session again in protected API routes rather than relying on the UI boundary.

Sign-out uses a POST endpoint that expires the cookie and redirects the browser to `/sign-in`.

## Consequences

### Positive

* Browser JavaScript cannot read the session token.
* Authentication pages do not render the player or navigation.
* Page and API authorization are enforced on the server.
* Route groups preserve public URLs while separating layout responsibilities.
* Session creation, verification, and removal share one module.

### Negative

* JWT sessions cannot be individually revoked without additional server-side state.
* Every protected API must explicitly verify the session.
* Cookie configuration and JWT verification are application security responsibilities.

## Revisit when

Consider middleware or a dedicated authentication library when protected route coverage grows, authorization roles are introduced, sessions need revocation or rotation, or third-party identity providers are added.
