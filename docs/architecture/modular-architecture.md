# Modular architecture

## Purpose

This application is one Next.js deployment and one database, organized as a
modular monolith. The boundaries exist to make ownership and change impact
clear, not to imitate independently deployed services.

The dependency direction is:

```text
app -> modules -> shared
  \--------------^
```

`app` may compose modules and shared infrastructure. Modules may use shared
code. Shared code may not know about the application or its business modules.

## Discovered modules

The modules below come from implemented workflows and rules in this repository.
They are not a predefined list of features expected in a music product.

### Authentication and registration

Location: `src/modules/auth`

Evidence:

- sign-in, sign-up, and sign-out workflows;
- password validation, hashing, and credential verification;
- creation, verification, and removal of the HTTP-only session cookie;
- authenticated and unauthenticated route gates.

Responsibilities:

- registration and sign-in input contracts;
- email normalization and password rules;
- user credential persistence and verification;
- session lifecycle;
- authentication-specific forms and sign-out UI.

Owned data:

- the current application use of Prisma's `User` model, including credentials
  and registration fields;
- the stateless session payload and cookie.

The module does not own redirects or HTTP status codes. Next.js layouts and
Route Handlers adapt module results to those application concerns.

### Catalog

Location: `src/modules/catalog`

Evidence:

- the `/songs` browsing workflow;
- the protected `GET /api/songs` and `GET /api/songs/:id/lyrics` endpoints;
- the ordered Prisma query joining songs, albums, and artists without lyric documents;
- the `SongDTO` list contract and the `SongLyricsDTO` on-demand lyrics contract;
- loading, error, retry, empty, and tabular catalog states.

Responsibilities:

- catalog queries and Prisma-to-contract mapping;
- the song list read model exposed to consumers;
- timed lyric documents stored on songs and loaded after selection;
- SWR hooks for the song list and per-song lyrics;
- Zod contracts for catalog HTTP responses and song ids;
- catalog-specific presentation and fetch state.

Owned data:

- `Song`, `Artist`, `Album`, `SongArtist`, and `AlbumArtist` read behavior;
- `Song.lyrics` JSON timed-line documents.

Catalog does not own playback. It reports a selected song through a callback,
allowing application composition to translate that song to a playback contract.

### Playback

Location: `src/modules/playback`

Evidence:

- selected-track and play/pause state;
- browser `Audio` element lifecycle;
- play, pause, seek, end, and playback-error behavior;
- persistent player controls;
- synchronized lyric display and lyric seeking from the selected track.

Responsibilities:

- the `PlayableTrack` contract;
- shared, low-frequency playback state and commands;
- local, high-frequency playback display state;
- player and lyrics UI.

Owned data:

- browser-only playback state.

Lyrics content belongs to catalog. Application composition loads lyrics through
catalog's SWR hook keyed by the selected song id and passes the lines into
playback UI. Playback owns highlighting, scrolling, and click-to-seek.
There is still no independent lyrics workflow, so there is no lyrics module.

### Data that is not yet a module

`Playlist` and `PlaylistSong` exist in the Prisma schema and seed, but no route,
UI, application service, mutation, or authorization rule uses them. A database
table alone does not establish a business module. They remain unclaimed until
an implemented playlist workflow reveals the appropriate boundary.

## Application composition

Location: `src/app`

The application layer owns Next.js routing and cross-capability composition:

- root, auth-only, and protected layouts;
- redirects and HTTP response mapping;
- authorization checks at route boundaries;
- the navigation sidebar and persistent player-shell geometry;
- the songs screen that connects catalog selection to playback and lyrics.

`page.tsx`, `layout.tsx`, and `route.ts` files should remain small. They select
module entry points, adapt contracts, and express application flow. Business
queries, credential rules, API clients, and business-specific UI belong to
their modules.

## Shared infrastructure

Location: `src/shared`

Current shared code is domain-neutral:

- `db/prisma.ts`: server-only Prisma client lifecycle;
- `hooks/useAnimationFrame.ts`: generic browser animation-frame hook;
- `http/apiError.ts`: `{ error: string }` response parsing and unknown-error messages;
- `ui/*`: Chakra UI and color-mode integration.

Shared code must not contain terms such as song, playlist, playback, account,
or session merely because several consumers might use them. Reuse alone is not
enough to make code shared.

The Prisma schema remains in `prisma/schema.prisma` because Prisma requires a
central schema. Ownership of its models is logical and documented above.

## Module public interfaces

Each module can expose up to three explicit entry points:

- `public.ts`: runtime-neutral contracts and types;
- `server.ts`: privileged services and queries, protected by `server-only`;
- `client.ts`: client hooks and components, marked with `"use client"`.

Internal files live under `domain/`, `server/`, or `client/` and use relative
imports. Consumers must not import those files directly.

Do not combine server and client exports in one barrel. A public entry point
must never re-export database clients, secrets, cookie access, browser hooks,
or client components.

## Server and client boundaries

- Prisma, password hashes, JWT secrets, and cookie mutation stay server-only.
- Server-sensitive module entry points and adapters import `server-only`.
- Route Handlers validate HTTP input and delegate rules or persistence to
  module services.
- Authorization is checked on the server. A client redirect after a `401` is
  user experience, not the security boundary.
- Client components consume only `client.ts` and `public.ts`.
- Server Components should call `server.ts` directly when they need module
  data; they must not fetch this application's own Route Handlers.
- The current catalog screen is intentionally client-fetched with SWR to preserve
  loading, retry, cache-by-key, and unauthorized-session behavior.
- A module that performs a future mutation owns the associated revalidation or
  cache invalidation policy.

## Cross-module communication

Cross-module communication uses narrow contracts and public entry points.
Modules must not reach into another module's implementation.

The songs screen is an application-level composition example:

1. Catalog reports a selected `SongDTO`.
2. `app` maps it to playback's smaller `PlayableTrack` and starts audio.
3. `app` loads lyrics through catalog keyed by the current track id.
4. Playback receives lyric lines as UI input, not as session state.

Direct module-to-module imports are allowed only when a real business workflow
requires them and only through `public.ts`, `server.ts`, or `client.ts`.
Prefer composition in `app` when neither capability should own the workflow.

## Import examples

Allowed:

```ts
// app Route Handler using a privileged module service
import { listSongs } from "@/modules/catalog/server";

// app composition using separate client and safe contract entry points
import { SongCatalog } from "@/modules/catalog/client";
import type { SongDTO } from "@/modules/catalog/public";

// module implementation using domain-neutral infrastructure
import prisma from "@/shared/db/prisma";
```

Forbidden:

```ts
// deep module import
import { listSongs } from "@/modules/catalog/server/listSongs";

// module depending on Next.js application composition
import { SongsScreen } from "@/app/_components/SongsScreen";

// shared infrastructure depending on product behavior
import { usePlayback } from "@/modules/playback/client";

// client code importing privileged services
import { getSession } from "@/modules/auth/server";
```

## Adding a module

1. Start from an implemented business capability, not a page, component, or
   table name.
2. Identify its language, rules, mutations, state, owned data, permissions, and
   code that changes together.
3. Confirm that the responsibility does not already belong to an existing
   module or to application composition.
4. Create only the entry points the capability needs. Do not add empty layers.
5. Keep internal imports relative and expose the smallest useful contracts.
6. Compose cross-capability workflows in `app` unless one module clearly owns
   the workflow.
7. Add authorization at every server entry boundary and keep privileged code
   behind `server-only`.
8. Update this document when ownership or dependency rules change. Create an
   ADR only when the decision has meaningful alternatives and consequences.

## Automated enforcement

`eslint.config.mjs` uses the built-in `no-restricted-imports` rule, so no
dependency framework is required.

It enforces:

- `shared` cannot import `app` or `modules`;
- `modules` cannot import `app`;
- `app` and modules cannot deep-import module internals;
- module consumers must use `public.ts`, `server.ts`, or `client.ts`.

`server-only` provides a build-time failure if privileged Prisma or module
server code is pulled into a Client Component.

Run:

```sh
pnpm lint
pnpm exec tsc --noEmit
```

These checks enforce dependency direction and server/client safety. They do not
replace review of ownership decisions: ESLint cannot determine whether a new
folder represents a coherent business capability.
