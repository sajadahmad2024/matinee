# Spec 06 — Admin Portal Notes (implementation log + open questions)

Source: client's "NOTES – ADMIN PORTAL" list. This file records how each note was
interpreted, and the assumptions that need confirming. Everything below is **already
implemented** in `apps/web` unless flagged.

---

## 1. Home Dashboard

| Note | What was built |
| --- | --- |
| `$$ associated with subscribed users (ADD)` | The **Total Subscribers** tile now carries a money line: `$1.66M lifetime · $186 avg LTV`. |
| `Regional button? Clarify (TAKE OUT)` | The **Master / Regional** toggle above the Global Activity Map is gone. The map is always the country-level (master) view; each cell still clicks through to that region's full analytics. |
| `Viewership vs. Gamification — should just be highlighting the %` | Rows are no longer links. The section leads with three tiles — **Total Users / Viewer % / Gamified %**. Viewer % and Gamified % are two **independent** shares of the same base (total users), so they do not add up to 100%. The per-region table shows both as tinted percentage chips; the split bar was removed because a single bar can only ever depict one ratio. |
| `MasterBoard (order: Total Downloads, Total Users, Total Subscribers)` | Stat row reordered and relabelled to exactly that, followed by the two live counters (Online Now, Playing Games). |

**Assumptions to confirm**
1. **"Total Downloads" = the old "Total Users" (312,000)**, i.e. installs including devices that never signed up; **"Total Users" = the old "Signed Up" (248,500)**. The previous "Signed Up" label is retired. If Downloads is meant to be a separate, larger install figure, give us the number.
2. ~~Confirm whether the client wants MRR, ARR, or lifetime revenue on that tile.~~ **Resolved — lifetime revenue.** The figure is derived from the Avg LTV the Subscriptions module already reports ($186 × 8,923 subscribers = $1.66M) so the two screens cannot disagree. Both inputs are still mock data.
3. ~~Confirm how Viewer % and Gamified % relate.~~ **Resolved — two independent percentages of total users.** Globally: 248,500 users, 25% watch, 16% play; a gamified user is also a viewer, so the two overlap and do not sum to 100%.
4. The per-region mock user counts are generated with jitter and sum to 312,338, which would contradict the MasterBoard's 248,500 on the same screen. Each region is normalised to its share of the signed-up base so the two agree. **Remove that normalisation once real per-region user counts are available.**

---

## 2. Content Management

| Note | What was built |
| --- | --- |
| `Move recommended actions to the bottom (floating point icon)` | Recommended Actions is out of the page flow. It is a floating pill docked bottom-right (count badge + severity ping) that expands into the same insight → action list. |
| `Calendar for Scheduled & Expiration of the Published` | The calendar view is **re-enabled** (list ↔ calendar toggle on the Master tab) and now plots the two dates that matter: **Scheduled** (go-live, blue) and **Expiring** (licence end date of published content, amber). |
| `drop down filter for expiration & schedule` | New dropdown inside the calendar: *Scheduled & expiring* / *Scheduled only* / *Expiring only*. The header shows live counts for the month. |

**Assumptions to confirm**
1. The calendar was previously **on hold pending Adi's Sept 2 call** (spec-05 §1.3, the "Coming & Going" variant). These notes read as the go-ahead, so it was turned back on in the Scheduled/Expiring shape. If the "Coming & Going" wording is still wanted, it is a label change only.
2. "Expiration of the Published" is implemented as the video's `liveUntil` (licence end). Confirm it is not meant to be a separate de-publish date.

---

## 3. Game Management

| Note | What was built |
| --- | --- |
| `View leaderboard button should be separate layout (above analytics)` | The Leaderboards button left the page header. There is now a dedicated bordered row above Master Analytics. |
| `View leaderboard → change to Top Games, Top Players` | That row holds two buttons, **Top Games** and **Top Players**, deep-linking to the matching tab. The tabs on `/games/leaderboards` were renamed to match (was *Game Instances* / *Hall of Fame*). |
| `REMOVE the rebalance button feature at all` | "Rebalance rewards" is deleted from the Leaderboard Stagnation alert. The alert keeps a single **Top Games** button. |

**Assumptions to confirm**
1. `update analytics (reword the button from rebalance rewards and place it lower to the analytics)` was **superseded** by the parenthetical "REMOVE THE rebalance button feature at all" — so no renamed/relocated button was created. If an "Update analytics" action is still wanted somewhere, say where it should point.

---

## 4. Rewards

| Note | What was built |
| --- | --- |
| `take out regional activity` | The Regional Activity heat grid is removed from `/rewards`. |
| `add % of purchase points vs. earn points` | New stat tile **Purchased vs Earned Points** — `25% / 75%`, with the underlying point totals as sub-stats. |
| `Bidding for Experience (calendar view also)` | The section has a list ↔ calendar toggle. The calendar plots **Bidding opens** (blue), **Bidding closes** (amber) and **Experience day** (green), with its own date-type dropdown. |

**Assumptions to confirm**
1. The **25% / 75%** split is placeholder data (653K purchased / 1.96M earned of the 2.61M points redeemed). Real figures needed.
2. Removing the regional grid also removed the only way to change region on this page. `?region=APAC` still scopes it for deep links, but the sections now always show global by default. Confirm that is intended — a compact region dropdown could be added back in the header if not.

---

## 5. Users

| Note | What was built |
| --- | --- |
| `move recommended actions to the bottom (floating icon)` | Same floating dock as Content Management. |
| `keep only two: subscribed, free user` | Basic/Premium tiers are gone from the data model and the UI. The directory column and the user profile now read **Subscribed** or **Free user**; the filter reads *All Users / Subscribed / Free users*. |
| `Top Spenders - Power Games - Churn Risk (first on layout)` | Extracted into its own `UserSegments` section, now directly under the health summary. |
| `Per Region User Data (2nd on layout — whole section)` | Moved up to second. |
| `Acquisition - Engagement - Retention Cohorts (move it down)` | Moved below the User Directory, under its own heading. |
| `Communication to Users (custom notification option)` | Opened from a **Message Users** button in the page header — a modal, not a page section, so it does not clutter the analytics. |

**Communication to Users** (free-hand design, as invited) — in a modal off the header:
- Channel picker: **Push / Email**.
- Audience picker with live reach count, reusing the segments admins already filter by (All, Subscribed, Free, Dormant 14+ days, Churn risk, Power gamers).
- Optional schedule (`datetime-local`) — empty means send immediately.
- One-click starting templates: Win-back, New content drop, Bidding closing.
- Title (60 char) + message (240 char) with counters, plus an optional deep link.
- "Recently sent" history with reach and open rate.
- Sending is currently a toast (and closes the modal) — no backend is wired.

**Assumptions to confirm**
1. Final page order is: Health Summary → Segments → Per-Region → **User Directory** → Cohorts. The notes did not place the Directory; it was left above the cohorts because it is the highest-frequency task.
2. The directory's row-level "Send notification" action still opens a separate, older modal, so the page now has two notification composers. Worth merging into the new one — confirm before we do it.
3. Audience reach numbers, the template copy and the sent-history rows are all placeholders.

---

## Not touched

- `apps/web` Subscriptions, Moderation, Reports and Settings modules — no notes covered them.
- The consumer app — these notes are admin-portal only.
