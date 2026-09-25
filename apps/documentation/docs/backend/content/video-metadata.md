# Video Metadata Management (TTLE-232)

> Status: **implemented** (branch `feat/content-management`). Migration `0025_content_metadata_ads.sql`.
>
> Scope: duration / resolution capture and propagation, content still/poster management
> (`content_media`), feed/detail enrichment for the mobile card, and **entitlement-checked
> playback** for content videos.

All routes are URI-versioned (`/v1/...`) and return the standard envelope
`{ statusCode, status, message, data, error }`.

---

## 1. Duration and resolution

### Where the numbers come from

| Source | When | Writes |
|---|---|---|
| **Client probe** | `POST /v1/media/:id/complete` with `durationSeconds` / `width` / `height` | `media_metadata.duration_seconds/width/height` — only fills **empty** columns (never overwrites a transcoder value) |
| **Transcoder Lambda** | Finalize of a video | Dummy transcoder: keeps any client-probed value (`COALESCE`) and fills from its optional `probe()` hook; prod MediaConvert completion handler writes the real values |
| **Admin override** | `PATCH /v1/media/:id/metadata` (media) or `durationSeconds` on content create/update | Media columns / `contents.duration_seconds` (+ `duration_manual = true`) |

The browser admin panel and the mobile app can probe a file before upload
(`<video>.duration`, `videoWidth`, `videoHeight`) and send the values on `/complete`.

### `POST /v1/media/:id/complete` — new optional fields

```json
{ "sizeBytes": 52428800, "checksum": "…", "durationSeconds": 142.52, "width": 1080, "height": 1920 }
```

| Field | Rules |
|---|---|
| `durationSeconds` | number, `0 < x ≤ 86400`, up to 3 decimals |
| `width`, `height` | int, `1..16384` |

Values are applied even when the Lambda already finished (idempotent completion) — they only
fill columns that are still `NULL`.

### `PATCH /v1/media/:id/metadata` (admin)

```json
{ "durationSeconds": 142.5, "width": 1920, "height": 1080, "altText": "Poster art" }
```

Overwrites the given fields (`null` clears). Returns `MediaDto`.

### Propagation to `contents.duration_seconds`

Done **in the database** (triggers from migration 0025), because the Lambda writes
`media_metadata` directly with `pg` and bypasses the API:

- `trg_contents_duration_from_media` (BEFORE INSERT / UPDATE OF `video_media_id`, `duration_manual`
  on `contents`): when the video changes (or a manual override is cleared) and the content is
  not manually overridden, copies `round(media_metadata.duration_seconds)` (or `NULL` when the
  new video has none yet).
- `trg_media_duration_to_contents` (AFTER UPDATE OF `duration_seconds` on `media_metadata`):
  pushes the new rounded duration to every non-deleted content whose `video_media_id` is that
  media and `duration_manual = false`.

### Manual duration on content

`POST /v1/admin/content` / `PATCH /v1/admin/content/:id` accept `durationSeconds`:

| Value | Effect |
|---|---|
| integer `0..86400` | stored, `duration_manual = true` — media updates no longer overwrite it |
| `null` | clears the override (`duration_manual = false`) and re-derives from the video media |
| omitted | unchanged |

Admin rows expose `durationSeconds` and **`durationSource`** (`media` \| `manual`).

---

## 2. Content media (stills / posters / thumbnails / banners)

All under `/v1/admin/content/:id/media` (`@AdminOnly`).

| Method | Path | Permission | Body / notes |
|---|---|---|---|
| `GET` | `/` | `content:read` | Ordered list |
| `POST` | `/` | `content:write` | `{ mediaId, kind?, timecodeSeconds?, sortOrder? }` → 201 item |
| `PUT` | `/order` | `content:write` | `{ mediaIds: [...] }` — full or partial order; listed ids get `0..n-1`, unlisted items keep their relative order after them |
| `DELETE` | `/:mediaId` | `content:write` | Detach (the media row itself is not deleted) |

Item shape:

```json
{ "id": "…", "mediaId": "…", "kind": "still", "sortOrder": 0, "timecodeSeconds": 15,
  "url": "https://cdn/…/still.jpg", "status": "ready", "width": 1280, "height": 720, "createdAt": "…" }
```

Rules:

- `kind` ∈ `thumbnail` \| `poster` \| `still` \| `banner` (default `still`).
- The media must exist, not be deleted, and be an **image** → `400` otherwise.
- A media can be attached to a content once (`uq_content_media_content_media`) → `409` on repeat.
- `sortOrder` defaults to the end of the list.
- `timecodeSeconds` (optional, ≥ 0) records the frame position for auto-thumbnails
  (UI: "00:15 / 01:30 / 05:45").
- Unknown ids in `PUT /order` → `400`.
- Every write records a `content_change_history` entry and busts the content cache.

`GET /v1/admin/content/:id/thumbnail-candidates` picks these rows up (unchanged). To make one
the thumbnail: `PATCH /v1/admin/content/:id { thumbnailMediaId }`.

---

## 3. Feed / detail enrichment (mobile card)

`GET /v1/content/feed` and `GET /v1/content/:id` now include, per item:

| Field | Type | Notes |
|---|---|---|
| `studioName` | string \| null | "Apex Films" |
| `genres` | `{ id, name, slug, isPrimary }[]` | primary first → pills "Thriller \| Neo-Noir" |
| `tags` | `{ id, name, slug }[]` | |
| `thumbnailUrl` | string \| null | ready + public thumbnail |
| `videoWidth`, `videoHeight` | number \| null | from the video media (aspect ratio for the vertical player) |
| `durationSeconds` | number \| null | now actually populated |
| `sponsored` | boolean | active sponsorship within its dates |
| `sponsorName` | string \| null | "Sponsored by …" |
| `isCommercial` | boolean | feed-inserted commercial (see ads doc) |
| `ad` | object \| null | commercial descriptor (only on `isCommercial` items) |

Detail additionally keeps `cast` and `watchLinks` ("Streaming on").

Enrichment is batched — one query each for studios, genres, tags, thumbnails + video media,
and sponsorships per page (no N+1). Feed stays cached 30 s, detail 120 s (tag `content`).

The feed now also hides content whose `license_status = 'expired'` (no streaming rights).

---

## 4. Entitlement-checked playback (security fix)

### Problem

`GET /v1/media/:id/playback` handed a signed descriptor for **any** media id to **any** logged-in
user — bypassing exclusive-content unlocks.

### `GET /v1/content/:id/playback` (new)

Any authenticated account (guest / customer / admin). Checks, for non-admins:

1. Content exists, not deleted, `status = published` → else `404`.
2. Inside its live window (`availableUntil` not passed) and licence not `expired` → else `404`.
3. Region: if the user's `users.region` is a macro-region code (`NA/EU/APAC/LATAM/MEA`,
   case-insensitive), the content must be available there (live publish region, or no publish
   regions + `rightsRegion = global`) → else `403`. Other/empty values skip the check.
4. Access tier: `exclusive` requires a `content_unlocks` row (`POST /v1/content/:id/unlock`) →
   else `403` `{ message: "Content is locked — unlock it first" }`. Guests can't unlock.
5. The content has a ready video → else `409`.

Admins skip 1–4 (preview of drafts/scheduled content).

Response:

```json
{
  "contentId": "…",
  "mediaId": "…",
  "accessTier": "exclusive",
  "durationSeconds": 143,
  "width": 1080,
  "height": 1920,
  "playback": { "kind": "hls", "url": "https://cdn/…/master.m3u8", "cookies": { … }, "expiresInSeconds": 900 }
}
```

### `GET /v1/media/:id/playback` (restricted)

- Admins: unchanged.
- Non-admins get `403` (`Use GET /v1/content/:id/playback`) when the media is a content video:
  `usage_type ∈ {content_video, content_trailer}` **or** it is referenced by any
  `contents.video_media_id`.
- Other media (avatars, public images, banners) are unaffected.

---

## 5. Dummy transcoder

`docker/dummy-transcoder/handler.js` finalize now writes
`width = COALESCE(width, probe.width)`, `height = …`, `duration_seconds = …` and uses the known
duration for the placeholder playlist's `#EXTINF`. `createHandler({ probe })` accepts an
optional `probe(upload)` returning `{ durationSeconds, width, height }` (default: none — no
FFmpeg in the image). The contents trigger then propagates the duration. Rebuild the image
(`pnpm media:lambda:build` + `pnpm infra:floci:apply`) to pick up the change.

---

## 6. Schema (migration 0025, metadata part)

| Table | Change |
|---|---|
| `contents` | `duration_manual boolean not null default false` |
| `content_media` | `timecode_seconds numeric(10,3)`, unique `(content_id, media_id)` |
| functions/triggers | `contents_duration_from_media()` + `trg_contents_duration_from_media`; `media_duration_to_contents()` + `trg_media_duration_to_contents`; one-off backfill of `contents.duration_seconds` |

## 7. Not covered

- Real frame extraction (multi-still auto-thumbnails) — belongs in the production transcoder;
  once it writes images, register them with `POST /:id/media`.
- Server-side ffprobe — no FFmpeg in the API or the dummy Lambda image.
- Subscription-based access to exclusive content — no rule exists yet; exclusive still requires a
  points unlock.
