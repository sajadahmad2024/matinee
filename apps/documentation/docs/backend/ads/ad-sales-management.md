# Ad Sales management (platform-level) — design

> Status: **implemented, uncommitted** (backend only; approved: campaigns, auto-accrual + manual ledger, `ads:*` permissions). Builds on
> [ad-configuration.md](./ad-configuration.md) (per-video sponsorship, ad serving, ad events).
>
> Jira: TTLE-233 (Ad configuration APIs).

## 1. Why — what the admin panel asks for

| Admin panel signal | Where | Meaning |
|---|---|---|
| "Platform-level commercials (feed-inserted Ad-Sales spots) … belong to the platform-level **Ad Sales home**, not to a single video" | `content/new/_components/sponsorship-card.tsx:21-23` | Commercials are campaigns sold to advertisers, managed outside the video form |
| "Revenue tracking and billing are settled by the **Ad-Sales ledger**" | `sponsorship-card.tsx:141` | Sponsorship + commercial revenue is booked, invoiced and paid in a ledger |
| Per-video Format: Organic / Sponsored — sponsor, logo, pre-roll (seconds) or icon overlay (days) | `sponsorship-card.tsx` | Already built (`PUT /v1/admin/content/:id/sponsorship`) |
| Feature flag "Ad-Sales commercials — insert commercials in the feed" | `settings/_components/feature-flags-settings.tsx:17` | Already built (`feature.ad_commercials_enabled`) |
| Content analytics "Revenue — Ads: $32K \| Subs: $16.2K"; licensing "revenueSource: Ads / Ads + Sponsor" | `content/_components/content-analytics.tsx:64`, `content/constants.ts:433` | Ad revenue must be reportable per content and in total |
| "Sort — sponsor packages are sold against top 10 most-viewed" | `content/_components/content-filters.tsx:82` | Sales needs inventory (views) to price packages |
| Subscription plan perk "No advertisements" | `subscriptions/_components/plan-configuration.tsx:51` | Ad-free entitlement for subscribers (already honoured for roll ads) |

There is no Ad Sales screen yet ("future Dashboard/Monetization phase"), so this defines the
backend contract that screen will use.

## 2. Model

```
advertiser 1──* ad_campaign 1──* ad_campaign_content (sponsorship deals on videos)
     │               │
     │               └──* ad_events (impression / click / skip / complete)
     └──* ad_ledger_entries (booked · accrued · invoiced · paid · credit)
```

### Advertisers — `advertisers`

`name`, `logo_media_id`, `website`, `contact_name`, `contact_email`, `billing_email`,
`currency` (default USD), `status` (`active` | `paused` | `archived`), `notes`.

### Campaigns — `ad_campaigns`

| Field | Notes |
|---|---|
| `advertiser_id`, `name` | |
| `type` | `commercial` (feed-inserted spot) \| `sponsorship` (groups per-video sponsorship deals) |
| `status` | `draft` → `scheduled` → `active` ⇄ `paused` → `ended` (cron moves scheduled/active by dates; `ended` when budget or dates are exhausted) |
| `starts_at`, `ends_at` | required for `active` |
| `regions` | macro regions (NA/EU/APAC/LATAM/MEA); empty = everywhere |
| **Commercial creative** | `creative_media_id` (ready HLS/MP4 video), `click_url`, `cta_label`, `duration_seconds`, `skippable_after_seconds` |
| **Delivery** | `feed_frequency` (1 spot every N organic items, default 5), `weight` (rotation share), `frequency_cap_per_user_day` |
| **Pricing** | `pricing_model` `flat` \| `cpm` \| `cpc`; `flat_fee_cents`, `cpm_cents`, `cpc_cents` |
| **Budget** | `budget_cents` (stop serving when spent ≥ budget), `daily_budget_cents`, `impression_goal` |

Per-video sponsorships (`content_sponsorships`) gain `advertiser_id` + `campaign_id` so a sponsor
sold across several videos is one campaign. The existing per-video form keeps working: sending
only `sponsorName` auto-creates/links an advertiser of that name (case-insensitive).

### Ledger — `ad_ledger_entries`

Append-only money movements per advertiser (and optionally campaign):

| `kind` | When | Sign |
|---|---|---|
| `booked` | flat-fee deal / campaign confirmed | + receivable |
| `accrued` | nightly: delivered CPM/CPC value for the day (from `ad_events`) | + receivable |
| `invoiced` | admin issues an invoice (`invoice_number`, due date) | memo |
| `paid` | payment received | − receivable |
| `credit` | make-good / refund / write-off | − receivable |

Balance = booked + accrued − paid − credit. Revenue recognised = booked (flat, spread over the
flight) + accrued.

## 3. Serving changes

- **Feed commercials** come from **active `commercial` campaigns** (in flight, region match,
  budget and per-user frequency cap not exhausted), rotated by `weight`, inserted every
  `feed_frequency` organic items while `feature.ad_commercials_enabled` is on. Feed item:
  `{ isCommercial: true, campaignId, advertiser: {name, logoUrl}, creative: { playback },
  clickUrl, ctaLabel, durationSeconds, skippableAfterSeconds }`. Active subscribers with an
  ad-free plan get no commercials.
- The current "commercial content" (`content_sponsorships.ad_format = 'commercial'`) is
  **migrated into campaigns** (one campaign per row, advertiser from `sponsor_name`), then the
  commercial path in the content feed reads campaigns only.
- `POST /v1/ads/events` accepts `campaignId` (commercials) as well as `sponsorshipId`; the
  feed cache is per region, so caps are enforced at event time and by a short-lived per-user
  cache when building the page.

## 4. Admin APIs (`/v1/admin/ads`, permission `ads:read` / `ads:write`)

| Endpoint | Purpose |
|---|---|
| `GET/POST /advertisers`, `GET/PATCH/DELETE /advertisers/:id` | Advertiser directory (search, status filter, totals: campaigns, spend, balance) |
| `GET/POST /campaigns`, `GET/PATCH/DELETE /campaigns/:id` | Campaign CRUD (filters: advertiser, type, status, date range, region) |
| `POST /campaigns/:id/{activate,pause,resume,end}` | Status transitions (validation: creative ready, dates, budget) |
| `PUT /campaigns/:id/contents` | Attach/detach per-video sponsorship deals to a sponsorship campaign |
| `GET /campaigns/:id/performance?from&to` | Daily impressions, clicks, CTR, skips, completion, spend, pacing vs budget |
| `GET /inventory?region&from&to` | Sellable inventory: feed impressions/day, top-N most-viewed titles, current fill rate — for pricing packages |
| `GET /ledger?advertiserId&kind&from&to`, `POST /ledger` | Ledger entries; manual `booked` / `invoiced` / `paid` / `credit` |
| `GET /advertisers/:id/statement?from&to` | Statement: opening balance, entries, closing balance |
| `GET /summary?from&to&region` | Ad Sales home: revenue (sponsorship vs commercial), impressions, CTR, eCPM, fill rate, top advertisers, outstanding receivables |
| existing `GET /performance`, `GET /sponsorships/:id/performance` | Unchanged; rows gain `advertiser` / `campaign` |

`ads:read` / `ads:write` are new permissions seeded onto the super-admin role (content admins
keep `content:*` for per-video sponsorship).

## 5. Background jobs

- **Campaign lifecycle (every minute, in the existing content-maintenance sweep):** scheduled →
  active at `starts_at`; active → ended at `ends_at` or when `budget_cents` is spent.
- **Nightly accrual:** write one `accrued` ledger entry per campaign per day from `ad_events`
  (CPM × impressions / 1000 + CPC × clicks), idempotent per (campaign, day).

## 6. Schema (migration `0026_ad_sales.sql`)

`advertisers`, `ad_campaigns`, `ad_ledger_entries`; `content_sponsorships.advertiser_id`,
`campaign_id`; `ad_events.campaign_id` (sponsorship_id nullable); permissions `ads:read`,
`ads:write`; data migration of commercial sponsorships into campaigns.

## 7. Implementation notes

- **Customer serving:** feed commercial items are content-shaped cards (`isCommercial: true`,
  `contentType: 'commercial'`, `id` = campaign id, `ad.campaignId`). The feed is cached per
  region, so the app calls **`GET /v1/ads/commercials/:campaignId`** for each slot it is about to
  show → `{ skip, skipReason: ad_free | frequency_cap | not_live, advertiser {name, logoUrl},
  creative (signed playback), clickUrl, ctaLabel, durationSeconds, skippableAfterSeconds }`.
- **Events:** `POST /v1/ads/events` items take `campaignId` (commercial) **or** `sponsorshipId`
  (per-video) — both → rejected. Sponsorship events also record the sponsorship's campaign.
- **Per-video sponsorship:** `PUT /v1/admin/content/:id/sponsorship` links an advertiser
  (`advertiserId`, or find-or-create by `sponsorName`) and optionally a `campaignId` (sponsorship
  campaign of the same advertiser). `adFormat: "commercial"` is **rejected** — commercials are
  campaigns.
- **Flat fees** are booked automatically once, the first time a campaign is activated.
- **Budget / goal / daily budget** exclude a campaign from serving immediately; the per-minute
  maintenance sweep then ends it (`endedReason: budget | impression_goal | ends_at | manual`).
- **Accrual** runs in the same sweep for completed UTC days (last 7), idempotent per campaign/day.
- **Fill rate** (summary) = commercial impressions ÷ (counted content views ÷ 5).
- Migration `0026_ad_sales` moved existing commercial sponsorships into campaigns and created
  advertisers for every existing sponsor name.

## 8. Not covered

- Payment gateway / automatic invoicing emails (ledger is manual + accrual).
- Programmatic ads (VAST/VMAP, ad networks), bidding, audience targeting beyond region.
- Advertiser self-serve portal.
