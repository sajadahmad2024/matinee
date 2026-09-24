# Video Pipeline — HTTP API Reference

Owner: backend
Last updated: 2026-09-24

All endpoints live under `/v1/media/…`. Authenticated with the same JWT + guard stack as the
rest of the API. Full request/response schemas in Swagger at `http://localhost:3000/api/v1`.

**5 endpoints.** `POST /:id/complete` is optional for videos (Lambda handles the READY
transition via S3 event either way) but required for non-videos (Lambda skips them; images
and docs are finalized synchronously here).

---

## POST `/v1/media/uploads`

Client requests permission to upload a file. API creates a `media_metadata` row in
`PENDING` status and hands back a presigned S3 PUT URL. **After the client PUTs, no
follow-up call is needed** — S3 fires the ObjectCreated event, SQS routes it to the
transcoder Lambda, and the Lambda flips the row to `ready` directly.

### Auth

`@AdminOnly` — only admin accounts can request uploads.

### Request body

```json
{
  "mediaType": "video",
  "usageType": "content_video",
  "mimeType": "video/mp4",
  "filename": "my-video.mp4",
  "sizeBytes": 12345678,
  "accessLevel": "protected",
  "altText": "Optional description"
}
```

### Response (201)

```json
{
  "mediaId": "018f2d3c-4a5b-7c8d-9e0f-1a2b3c4d5e6f",
  "status": "pending",
  "upload": {
    "url": "http://localhost:4566/maintinee-media-source-development/…?X-Amz-Signature=…",
    "method": "PUT",
    "headers": { "Content-Type": "video/mp4" },
    "expiresInSeconds": 900
  }
}
```

### Client responsibility

1. PUT the file bytes to `upload.url` directly (do NOT proxy through the API)
2. Send the exact `Content-Type` returned in `upload.headers` (presigned URL pins it)
3. **For videos:** optional — the Lambda auto-flips to READY when S3 fires the ObjectCreated
   event. Optionally call `POST /:id/complete` to fail fast if the PUT never landed
4. **For non-videos (images/docs):** required — call `POST /:id/complete` to flip to READY.
   The transcoder Lambda skips non-videos (nothing to transcode)
5. Poll `GET /:id` to watch status progress: `pending → uploaded → processing → ready`

---

## POST `/v1/media/:mediaId/complete`

Confirm the client-side PUT landed. Two jobs:
1. **HEAD-check S3** — 400 if the object isn't there (fail-fast client-side error)
2. **For non-videos:** flip status straight to READY (no transcoding needed)

For videos: this endpoint marks the row `uploaded` and returns; the transcoder Lambda still
owns the `uploaded → processing → ready` transition asynchronously.

### Auth

`@AdminOnly`.

### Request body (both fields optional)

```json
{
  "sizeBytes": 2848208,
  "checksum": "md5-..."
}
```

If omitted, the API falls back to S3's HEAD `ContentLength` + `ETag`.

### Response (200) — video

```json
{
  "id": "018f2d3c-…",
  "status": "uploaded",
  "mediaType": "video",
  ...
}
```

Poll `GET /:id` — Lambda will flip to `ready` within ~2 s (dummy).

### Response (200) — non-video

```json
{
  "id": "018f2d3c-…",
  "status": "ready",
  "mediaType": "image",
  "url": "http://cdn.maintinee.com/media/avatar/…/original/photo.jpg",
  ...
}
```

### Idempotent

Safe to call twice. 400 if status has already moved past `uploaded` (`processing`/`ready`/`failed`).

---

## GET `/v1/media/:mediaId`

Fetch current state. Poll while the Lambda transcodes.

### Auth

Any authenticated account (guest / customer / admin).

### Response (200)

```json
{
  "id": "018f2d3c-…",
  "status": "processing",
  "mediaType": "video",
  "usageType": "content_video",
  "accessLevel": "protected",
  "isHls": false,
  "hlsMasterKey": null,
  "deliveryPrefix": null,
  "width": null,
  "height": null,
  "durationSeconds": null,
  "processingProvider": "dummy-lambda",
  "processingProgress": 0,
  "url": null,
  "createdAt": "2026-09-24T12:00:00Z"
}
```

Once the Lambda finishes:

```json
{
  "id": "018f2d3c-…",
  "status": "ready",
  "isHls": true,
  "hlsMasterKey": "media/content_video/<uuid>/hls/master.m3u8",
  "deliveryPrefix": "media/content_video/<uuid>/hls/",
  "processingProgress": 100,
  ...
}
```

### Polling cadence

Recommended: exponential backoff starting 2 s (2, 4, 8, 16, 32, cap at 30 s). The dummy
Lambda finishes in <2 s so you'll usually see `ready` on the first poll.

---

## GET `/v1/media/:mediaId/events`

Full status-transition audit trail from `media_status_events`. Admin-only.

### Response (200)

```json
[
  { "status": "pending",    "detail": "upload requested",             "progress": null, "createdAt": "…" },
  { "status": "processing", "detail": "dummy transcode invoked",      "progress": 0,    "createdAt": "…" },
  { "status": "ready",      "detail": "dummy transcode complete",     "progress": 100,  "createdAt": "…" }
]
```

The dummy Lambda writes the `processing` and `ready` events; the API writes `pending` on row
creation.

---

## GET `/v1/media/:mediaId/playback`

Ready-to-play descriptor. Errors with `400` if `status !== READY`.

### Response (200) — HLS video

```json
{
  "kind": "hls",
  "url": "http://cdn.maintinee.com/media/content_video/<uuid>/hls/master.m3u8",
  "cookies": {
    "CloudFront-Policy": "…",
    "CloudFront-Signature": "…",
    "CloudFront-Key-Pair-Id": "…"
  },
  "expiresInSeconds": 900
}
```

For `accessLevel=protected`, the three CloudFront cookies must be attached to every request
for `.m3u8` playlists + `.ts` segments (`fetch(..., {credentials: 'include'})` in browsers).

**Note:** the dummy Lambda writes a placeholder `master.m3u8` that references a 4-byte
`seg_000.ts`. That's valid HLS syntax but not valid video — playback will 404 or produce a
black frame. Swap the dummy for real FFmpeg / MediaConvert when you need actual video.

### Response (200) — image/doc

```json
{
  "kind": "file",
  "url": "http://cdn.maintinee.com/media/avatar/…/original/photo.jpg",
  "cookies": {},
  "expiresInSeconds": 900
}
```

---

## DELETE `/v1/media/:mediaId`

Soft-deletes the media row (`deleted_at = now()`) and synchronously purges all storage
objects under its asset root (original + HLS outputs + poster). Admin-only.

### Response (200)

```json
{ "message": "Media deleted" }
```

The S3 cleanup happens inline in the request (uses `storage.deletePrefix`) — no async job.

---

## Client walkthrough (curl)

```bash
# 1. Login → JWT
TOKEN=$(curl -sS -X POST http://localhost:3000/v1/admin/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@example.com","password":"Admin@123456"}' \
  | jq -r '.data.accessToken // .accessToken')

# 2. Request upload
UPLOAD=$(curl -sS -X POST http://localhost:3000/v1/media/uploads \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"mediaType":"video","usageType":"content_video","mimeType":"video/mp4","filename":"test.mp4","sizeBytes":2848208}')
MEDIA_ID=$(echo "$UPLOAD" | jq -r '.data.mediaId // .mediaId')
PUT_URL=$(echo "$UPLOAD" | jq -r '.data.upload.url // .upload.url')

# 3. PUT the file → S3 event fires → Lambda auto-triggers → DB updates
curl -X PUT "$PUT_URL" -H 'Content-Type: video/mp4' --data-binary @/tmp/sample.mp4

# 4. (Optional but recommended) Confirm — fast HEAD-check, catches PUT failures
curl -sS -X POST "http://localhost:3000/v1/media/$MEDIA_ID/complete" \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"sizeBytes": 2848208}' | jq .

# 5. Poll status (Lambda usually completes in <2s for videos; non-videos are READY after step 4)
sleep 2 && curl -sS "http://localhost:3000/v1/media/$MEDIA_ID" \
  -H "Authorization: Bearer $TOKEN" | jq '.status'
# → "ready"

# 5. Playback URL
curl -sS "http://localhost:3000/v1/media/$MEDIA_ID/playback" \
  -H "Authorization: Bearer $TOKEN" | jq .

# 6. Verify in DB
PGPASSWORD=postgres psql -h localhost -U postgres -d postgres -c \
  "SELECT status, hls_master_key, processing_provider FROM media_metadata WHERE id='$MEDIA_ID';"
```

## Error responses

| Code | When |
|---|---|
| `400 Bad Request` | Invalid input, `playback` before READY |
| `403 Forbidden` | Non-admin trying to hit an `@AdminOnly` endpoint |
| `404 Not Found` | Media row doesn't exist / soft-deleted |
