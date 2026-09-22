# Push Notifications — Overview

Build plan for FCM-based push notifications on the maintinee backend. **This is the design doc; no code has been written yet.** Reviewed and approved before implementation per project workflow.

Primary reference: `trovey/apps/backend` push-notifications module. Adapted for maintinee's stack:

| Concern | Trovey | Maintinee (this doc) |
|---|---|---|
| Framework | NestJS | NestJS 11 |
| ORM | Drizzle | Drizzle |
| Queue | **BullMQ + Redis** | **AWS SQS (ElasticMQ local)** — via existing `QueueService` |
| Folder layout | `api/notifications` + `common/notifications` + `db/notifications` | **Flat**: `src/notifications/` + `src/db/repositories/notifications/` (matches existing maintinee convention) |
| Provider | Firebase Admin SDK | Firebase Admin SDK (single `FcmProvider`, no abstraction until a 2nd provider exists) |

---

## 1. Goals

1. **Register devices** — client sends FCM token + device_id + platform on login and on token refresh.
2. **Send to a user** — resolve all active devices for a user_id and push to each.
3. **Send to a topic** — push via FCM topic (e.g. `all`, `daily_streak`) without token enumeration.
4. **Manage topics** — client (or backend on event) subscribes/unsubscribes a device to/from a topic.
5. **Handle stale tokens** — on permanent FCM errors, mark the device inactive so we stop sending to it.
6. **Support 3 platforms** — iOS, Android, Web. All via FCM (FCM bridges to APNs for iOS and Web Push for browsers).
7. **Non-blocking sends** — pushes go through the SQS worker; API responses never wait on FCM.

## 2. Non-Goals (Out of Scope)

- **Provider abstraction** — no `NotificationProvider` interface until a second provider (e.g. direct APNs, OneSignal) is a real requirement.
- **Guest devices** — the guest flow was removed; only authenticated `customer`/`admin` users register devices.
- **Server-managed topic subscriptions** — the client calls `FirebaseMessaging.subscribeToTopic` / `unsubscribeFromTopic` directly. The backend does **not** track per-device topic membership, and does not expose topic subscribe/unsubscribe endpoints. Only `sendToTopic` (broadcast delivery to a topic) is server-side. `device_token_topics` table remains in the schema but is unused; a follow-up migration can drop it.
- **In-app inbox** — `user_notifications` inbox is already handled by the existing admin notifications module. Push and inbox are decoupled — a push *may* also drop an inbox row, but that is a separate concern.
- **Rich media rendering** — client-side icon/image handling is a client concern; the backend just forwards URLs.
- **Delivery receipts** — FCM doesn't give per-user delivery confirmation; we log FCM's `messageId` and error codes only.

## 3. What Already Exists

Do **not** rebuild these. The greenfield surface is smaller than trovey's.

| Item | Location | State |
|---|---|---|
| `device_tokens` table | migration `0002_create_users.sql` | ✅ Exists with `user_id, fcm_token, platform, device_id, app_version, is_active, last_seen_at` |
| `device_token_topics` table | migration `0002_create_users.sql` | ✅ Exists with `(device_token_id, topic)` PK |
| `notification_campaigns` + `notification_deliveries` | migration `0011_create_notifications.sql` | ✅ Exists — used by admin campaign flow |
| `user_notifications` (inbox) | migration `0015_create_user_notifications.sql` | ✅ Exists |
| Drizzle schema | `src/db/drizzle/schema.ts` | ✅ `deviceTokens` etc. already generated |
| `firebase-admin` package | `package.json` | ✅ v13.6.1 installed |
| SQS queue `NOTIFICATIONS` | `src/queue/queue.constant.ts` | ✅ `QueueName.NOTIFICATIONS = 'notifications'` |
| `NOTIFY_CAMPAIGN_FANOUT` job | `src/queue/queue.constant.ts` | ✅ Job name reserved for admin campaigns |
| `NotificationRepository` (inbox) | `src/db/repositories/notifications/notification.repository.ts` | ✅ Handles `user_notifications` CRUD |
| `NotificationCampaignRepository` | `src/db/repositories/notifications/` | ✅ Handles admin campaigns |
| Admin controller (campaign auth) | `src/notifications/admin-notification.controller.ts` | ✅ Kept as-is |

## 4. What We Build

| Piece | Location | Purpose |
|---|---|---|
| `DeviceTokensRepository` | `src/db/repositories/notifications/device-tokens.repository.ts` | Upsert / find / deactivate device tokens; manage `device_token_topics` |
| `FcmProvider` | `src/notifications/providers/fcm.provider.ts` | Firebase Admin SDK wrapper — `sendToTokens`, `sendToTopic`, `subscribeToTopic`, `unsubscribeFromTopic` |
| `NotificationDeviceService` | `src/notifications/notification-device.service.ts` | Register / update / deactivate device; auto-subscribe to default topics |
| `NotificationTopicService` | `src/notifications/notification-topic.service.ts` | Subscribe/unsubscribe device(s) to topics; keep DB + FCM in sync |
| `NotificationSendService` | `src/notifications/notification-send.service.ts` | Business API: `sendToUser`, `sendToTopic`, `sendToDevices`. Enqueues jobs; not the direct FCM caller |
| `NotificationDeviceController` | `src/notifications/notification-device.controller.ts` | REST: register / unregister device, subscribe / unsubscribe topic |
| `PushPayloadFactory` | `src/notifications/push-payload.factory.ts` | Build FCM message payload with platform-specific `android`/`webpush`/`apns` blocks |
| SQS job handler `SEND_PUSH_TO_USER` | `src/background/notifications/push-to-user.handler.ts` | Worker consumer: resolve tokens → call `FcmProvider.sendToTokens` → log outcome |
| SQS job handler `SEND_PUSH_TO_TOPIC` | `src/background/notifications/push-to-topic.handler.ts` | Worker consumer: call `FcmProvider.sendToTopic` → log outcome |
| New job names | `src/queue/queue.constant.ts` | Add `SEND_PUSH_TO_USER`, `SEND_PUSH_TO_TOPIC` |
| SQL migration `0019_create_notification_logs.sql` | `src/db/drizzle/migrations/` | New `notification_logs` table for transactional (non-campaign) push audit — **see decision below** |
| Firebase env vars + `FirebaseAdmin` singleton | `src/config/` + `src/notifications/providers/firebase-admin.ts` | Init Firebase Admin from env credentials |

## 5. Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│  Business code (auth, subscription, engagement, …)                  │
│  → NotificationSendService.sendToUser(userId, template, data)       │
│  → NotificationSendService.sendToTopic('daily_streak', template)    │
└──────────────────────────────┬──────────────────────────────────────┘
                               ▼   (fire-and-forget; no await on FCM)
┌─────────────────────────────────────────────────────────────────────┐
│  QueueService.send(QueueName.NOTIFICATIONS, JobName.SEND_PUSH_…, …) │
│  → SQS message → ElasticMQ (local) / AWS SQS (prod)                 │
└──────────────────────────────┬──────────────────────────────────────┘
                               ▼   (consumed by Worker process)
┌─────────────────────────────────────────────────────────────────────┐
│  @QueueHandler({ queue: NOTIFICATIONS, name: SEND_PUSH_TO_USER })   │
│  → DeviceTokensRepository.listActiveByUser(userId)                  │
│  → FcmProvider.sendToTokens(tokens, payload)                        │
│  → NotificationLogsRepository.logBatch(results)                     │
│  → On permanent errors → DeviceTokensRepository.deactivate(tokenId) │
└──────────────────────────────┬──────────────────────────────────────┘
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│  Firebase Cloud Messaging                                           │
│  → iOS (APNs via FCM)  → Android (native)  → Web (Web Push)         │
└─────────────────────────────────────────────────────────────────────┘
```

**Why through the queue, always:**
- API path returns fast (no FCM latency in the hot path).
- SQS gives us native retry (visibility timeout) and DLQ (`QUEUE_MAX_RECEIVE_COUNT`).
- Batching for large audiences is done in the worker, not the request handler.

## 6. Database

### 6.1 Reused tables (no changes)

- `device_tokens (id, user_id, fcm_token UNIQUE, platform, device_id, app_version, is_active, last_seen_at)`
- `device_token_topics (device_token_id, topic, subscribed_at)` — PK `(device_token_id, topic)`

`fcm_token` is globally unique. **This means re-registering the same token under a different user *moves* it** (upsert on the unique key updates `user_id`). This is intentional: same physical device → one user at a time. Client on logout should call `DELETE /notifications/devices/:id`.

### 6.2 New table — `notification_logs` (decision below)

**Purpose:** audit of transactional (non-campaign) pushes — one row per (user, device, template_key, attempt).

**Decision needed — pick one:**

- **Option A (recommended): New table `notification_logs`** — clean separation from admin `notification_deliveries` (which is scoped to campaigns). Cost: one new migration.
- **Option B: Reuse `notification_deliveries`** — make `campaign_id NULLABLE`, add `template_key` and `data` JSON columns. Cost: 1 migration + semantic overload (delivery-of-campaign vs delivery-of-event become one blob).

I recommend **Option A**. Schema:

```sql
CREATE TABLE IF NOT EXISTS notification_logs (
    id                UUID PRIMARY KEY DEFAULT uuidv7(),
    user_id           UUID REFERENCES users(id) ON DELETE SET NULL,
    device_token_id   UUID REFERENCES device_tokens(id) ON DELETE SET NULL,
    channel           VARCHAR(20) NOT NULL DEFAULT 'push',
    provider          VARCHAR(20) NOT NULL DEFAULT 'fcm',
    template_key      VARCHAR(80) NOT NULL,       -- e.g. 'subscription.payment_failed'
    title             VARCHAR(150),
    body              VARCHAR(500),
    data              JSONB NOT NULL DEFAULT '{}'::jsonb,
    topic             VARCHAR(100),               -- if sent via topic (device_token_id NULL then)
    status            VARCHAR(20) NOT NULL DEFAULT 'sent'
                        CHECK (status IN ('sent','failed')),
    fcm_message_id    VARCHAR(120),
    error_code        VARCHAR(60),
    error_message     VARCHAR(300),
    sent_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_notification_logs_user     ON notification_logs(user_id, sent_at DESC);
CREATE INDEX idx_notification_logs_template ON notification_logs(template_key, sent_at DESC);
CREATE INDEX idx_notification_logs_failed   ON notification_logs(status, sent_at DESC) WHERE status = 'failed';
```

Migration file: `src/db/drizzle/migrations/0019_create_notification_logs.sql` (next sequential number).

## 7. FCM Provider

Single class. No abstract base. If a second provider ever exists, we extract the interface then.

```ts
// src/notifications/providers/fcm.provider.ts
@Injectable()
export class FcmProvider {
  private readonly messaging: admin.messaging.Messaging;

  constructor(private readonly configService: ConfigService) {
    // Init Firebase Admin from env once. Reuses singleton if already initialized.
  }

  /** Send to up to 500 tokens in one call (FCM multicast limit). Caller batches beyond that. */
  async sendToTokens(tokens: string[], payload: FcmPayload): Promise<SendToTokensResult>;

  /** Send to a topic (or topic condition). One FCM call, no token enumeration. */
  async sendToTopic(topic: string, payload: FcmPayload): Promise<{ messageId: string }>;

  /** Server-managed topic subscription. Batches up to 1000 tokens per call. */
  async subscribeToTopic(tokens: string[], topic: string): Promise<SubscriptionResult>;
  async unsubscribeFromTopic(tokens: string[], topic: string): Promise<SubscriptionResult>;

  /** For dev/test — bypass FCM, log the payload. Enabled via `FCM_DRY_RUN=true`. */
  private readonly dryRun: boolean;
}
```

`SendToTokensResult` returns per-token success/error so the caller can:
- persist `fcm_message_id` in `notification_logs`
- classify errors: **permanent** (`messaging/registration-token-not-registered`, `messaging/invalid-registration-token`, `messaging/invalid-argument`) → deactivate device; **transient** → SQS will retry.

## 8. API — Endpoints (customer)

All device endpoints live under `/v1/devices` (owned by the auth module, already implemented).

| Method | Path | Purpose |
|---|---|---|
| `POST` | `/v1/devices` | Register or refresh a device. Upsert on `fcm_token`. Body: `{ fcmToken, platform, deviceId?, appVersion? }`. |
| `GET`  | `/v1/devices` | List my registered devices ("manage devices" screen). |
| `DELETE` | `/v1/devices/:fcmToken` | Unregister a device (hard-delete the row). Called on logout. |

**Topic subscription is NOT a backend API.** The client calls `FirebaseMessaging.subscribeToTopic(topic)` / `unsubscribeFromTopic(topic)` directly against Firebase. The backend only broadcasts to a topic via `NotificationSendService.sendToTopic(topic, payload)` — it doesn't manage who is subscribed.

**Ownership**: `remove` filters by `(userId, fcmToken)` — attempting to delete another user's token is a silent no-op (no row matches).

**Admin endpoints (later)**: no plans for admin device-management APIs. The admin campaign flow (already implemented) covers audience-based fanout.

## 9. Sending Flows

### 9.1 Send to a user (transactional)

Business call site example:
```ts
// In some service (e.g. bidding service)
await this.notificationSendService.sendToUser(userId, {
  templateKey: 'auction.outbid',
  title: 'You have been outbid',
  body: `Your bid of $${amount} was topped.`,
  deepLink: `/auctions/${auctionId}`,
  data: { auctionId },
});
```

Flow:
1. `sendToUser` enqueues an SQS message: `QueueName.NOTIFICATIONS`, `JobName.SEND_PUSH_TO_USER`, `{ userId, payload }`.
2. Worker picks it up → `DeviceTokensRepository.listActiveByUser(userId)`.
3. If ≤ 500 tokens: single `FcmProvider.sendToTokens` call. Else: batch of 500.
4. For each response, insert a row into `notification_logs` (success or fail).
5. For each permanent error, `DeviceTokensRepository.deactivate(deviceTokenId)`.

### 9.2 Send to a topic (broadcast)

```ts
await this.notificationSendService.sendToTopic('daily_streak', {
  templateKey: 'engagement.streak_reminder',
  title: 'Keep your streak alive',
  body: 'Check in today to keep going.',
});
```

Flow:
1. `sendToTopic` enqueues `JobName.SEND_PUSH_TO_TOPIC`, `{ topic, payload }`.
2. Worker → `FcmProvider.sendToTopic(topic, payload)`. **One FCM call — no DB fanout.**
3. Insert one row into `notification_logs` with `topic=<topic>`, `user_id=NULL`, `device_token_id=NULL`.

### 9.3 Send to specific devices (admin/internal)

Used by admin campaign fanout (existing `NOTIFY_CAMPAIGN_FANOUT` job hooks in here).

```ts
await this.notificationSendService.sendToDevices(deviceTokenIds, payload);
```

Same flow as 9.1 but pre-resolved tokens.

## 10. Client Flow (Flutter)

Documented here for backend context; Flutter app owns its side.

```
1. App launch → FirebaseMessaging.instance.requestPermission()  [iOS/web only]
2. token = await FirebaseMessaging.instance.getToken()
3. POST /v1/devices { fcmToken: token, platform: 'ios'|'android'|'web', deviceId?, appVersion? }
4. onTokenRefresh → POST again (upsert on fcm_token replaces old row)
5. Topic subscribe/unsubscribe → FirebaseMessaging.subscribeToTopic(topic) / unsubscribeFromTopic(topic)
   (client-side only; backend not involved)
6. onMessage / onBackgroundMessage → app handles delivery + deep link from `data`
7. On logout → DELETE /v1/devices/:fcmToken
```

## 11. Stale Token Cleanup

Two paths — both must exist:

1. **Inline on send** — When `FcmProvider.sendToTokens` returns a per-token `messaging/registration-token-not-registered` or `messaging/invalid-registration-token` error, the send worker immediately calls `deactivate(deviceTokenId)` and `unsubscribeAllTopics(deviceTokenId)`. This catches ~99% of stale tokens.
2. **Background sweep** (cron, nice-to-have — v1.1) — Weekly cron job deactivates devices where `last_seen_at < now() - 90d`. Prevents infinite growth of the table for uninstalled apps that never triggered a push.

Deactivation is **soft** (`is_active = false`) — we keep the row for audit and re-activation on re-register.

## 12. Queue Integration

**New job names** to add to `src/queue/queue.constant.ts`:
```ts
export enum JobName {
  // ...existing...
  SEND_PUSH_TO_USER = 'send-push-to-user',
  SEND_PUSH_TO_TOPIC = 'send-push-to-topic',
  SEND_PUSH_TO_DEVICES = 'send-push-to-devices',
}
```

**Consumer** — one handler per job under `src/background/notifications/`, registered in `WorkerModule`. Handlers are stateless; they get the payload, call FCM, log the result. Retries and DLQ are SQS-native (no code needed).

**Retry semantics:**
- Transient FCM errors (timeout, `unavailable`, `internal`) → let the handler throw → SQS retries via visibility timeout (up to `QUEUE_MAX_RECEIVE_COUNT`, then DLQ).
- Permanent errors → **swallow the error inside the handler** so the message doesn't retry pointlessly, but persist a `failed` row to `notification_logs` and deactivate the device.

## 13. Environment Variables

Add to `src/config/env-config.module.ts` Joi schema:

| Var | Required | Default | Description |
|---|---|---|---|
| `FIREBASE_PROJECT_ID` | Yes (prod) | — | Firebase project id |
| `FIREBASE_CLIENT_EMAIL` | Yes (prod) | — | Service account email |
| `FIREBASE_PRIVATE_KEY` | Yes (prod) | — | PEM, with `\n` literals (unescaped at boot) |
| `FCM_DRY_RUN` | No | `false` | If `true`, provider logs the payload and skips FCM call |
| `FCM_DEFAULT_ANDROID_CHANNEL_ID` | No | `default` | Android notification channel |
| `FCM_DEFAULT_WEB_ICON_URL` | No | — | Web push icon URL |

In dev, if `FIREBASE_PROJECT_ID` is unset, `FcmProvider` boots in dry-run mode (logs only, no throw). This lets local dev run without Firebase credentials.

## 14. Topics — Client Responsibility

The client is the source of truth for what topics a device is subscribed to. Suggested defaults for the Flutter app to subscribe to on startup (after login):

- `all` — every device
- `platform_ios` / `platform_android` / `platform_web` — platform-scoped broadcasts

Additional user-driven topics (e.g. `follow_<contentId>`, `bid_<auctionId>`) — subscribed by feature code in the client. The backend simply calls `sendToTopic('follow_abc')` when it wants to broadcast; whoever the client SDK has subscribed to that topic receives it.

## 15. Open Questions / Follow-ups

Not blocking v1 but worth flagging:

1. **iOS APNs `apns` payload** — trovey uses only the top-level `notification` block and lets FCM bridge. Do we need custom APNs sound / badge count? If yes, add `apns.payload.aps.badge` handling. Defer to v1.1.
2. **Notification categories → default topics** — should we auto-subscribe based on `user.roles` (customer/admin)? Simpler to start with a shared `all` topic; layer on later.
3. **Rate limiting** — same user notified twice within 5s for the same `template_key`? Debounce in `sendToUser`? Add if we see abuse; not v1.
4. **Web push VAPID keys** — Firebase's web SDK handles this transparently, but the client needs the FCM sender ID exposed. Confirm with Flutter/web team.
5. **Testing** — plan for a dev-tools `/notifications/test-send` route behind `@AdminOnly` for manual QA. Add in v1.

## 16. Delivery Order (implementation phases)

Once this doc is approved:

1. **Phase 1 — Provider + repo** (foundation, no external effect)
   - `FcmProvider` + `FirebaseAdmin` singleton
   - `DeviceTokensRepository` with all methods
   - Migration `0019_create_notification_logs.sql` + regenerate schema
   - `NotificationLogsRepository`

2. **Phase 2 — Device API** (client-visible, no send yet)
   - `NotificationDeviceService`, `NotificationTopicService`
   - `NotificationDeviceController` (register, delete, topics)
   - RouteNames + DTOs
   - Unit tests for service, controller e2e

3. **Phase 3 — Send flow** (business callable)
   - `NotificationSendService.sendToUser / sendToTopic / sendToDevices`
   - New `JobName` entries
   - Worker handlers under `src/background/notifications/`
   - Register in `WorkerModule`
   - Integration test: enqueue → worker → dry-run FCM → log row

4. **Phase 4 — Wire into features** (per-feature, out of this scope)
   - Hook `sendToUser` into auction outbid, subscription events, etc.
   - Admin campaign fanout uses `sendToDevices` (bridges existing `NOTIFY_CAMPAIGN_FANOUT`)

Each phase merges independently with tests. No half-implemented state.

---

## Approval Checklist

Before I write any code, confirm:

- [ ] Section 4 module layout (flat, `src/notifications/` + `src/db/repositories/notifications/`) is acceptable
- [ ] Section 6.2 — go with **Option A** (new `notification_logs` table)
- [ ] Section 7 — single `FcmProvider`, no abstract base
- [ ] Section 8 — the six API endpoints and route paths look right
- [ ] Section 11 — inline stale-token cleanup on send is the primary path; background cron is v1.1
- [ ] Section 14 — auto-subscribe to `all` + `platform:<...>` on register
- [ ] Section 16 — 4-phase delivery order
