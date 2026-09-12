# Engineering log

Short notes after meaningful work. Not a diary.

## Template

**Built:**
**Learned:**
**Still confused:**

## 2026-09-12

**Built:** Space / arrow hotkeys (ignore typing, buttons, volume slider). A bit more table cell padding. Mentor context + nudges.

**Learned:** `requestAnimationFrame` is “update before the next paint.” Time stays on `audio`; bar and lyrics read it locally so the song table does not redraw every frame. Interview: date + time + isLive is “three knobs, one clock.”

**Still confused:** `hotkeyTargetKind` — the extra translator vs putting the ifs in the key handler. Not fully convinced it was needed.

## 2026-09-12 (playlists)

**Built:** Sidebar shows the signed-in user's playlist names. `listPlaylistsForUser(userId)` + `GET /api/playlists` use `session.id` from the JWT.

**Learned:** Auth answers who. Playlist answers “lists for this id.” List `where` does not protect `GET /playlists/3` — that row needs `playlist.userId === session.id`.

**Still confused:** `isPublic` vs owner check — when a stranger may read, vs always checking the owner for private lists.

## 2026-09-13 (deploy)

**Built:** GitHub CI (lint/types/tests/build, dummy env, no DB). Vercel host + cloud Postgres. Prisma `SHADOW_DATABASE_URL` removed so `prisma generate` works on Vercel. Next 15.5.25. Demo audio in git. `vercel-build` = migrate then `next build` (ADR 0008). Sign-up 500 was `P2021` — empty cloud DB, no `User` table.

**Learned:** Laptop Docker, GitHub, and Vercel are three places. Push ships code, not tables. CI must not migrate. Vercel build should. Browser console ≠ server log. Wallet extension noise is not the app.

**Still confused:** (fill in after the next deploy) Did `vercel-build` actually create the tables? Is `JWT_SECRET` set? Did we seed songs?
