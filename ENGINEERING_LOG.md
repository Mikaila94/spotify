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
