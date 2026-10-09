# Implementation Spec 10: Content Management, Component Cleanup and API Integration

**App:** `apps/web`, route `src/app/(public)/content/**`
**Builds on:** [Spec 01](./spec-01-content-management.md) (the UI on mock data), [API integration](./api-integration.md) and the backend doc `backend/content/admin-content-management-api.md`
**Branch:** `web/feat/content-management`

---

## 0. Where we start

- **Nothing in the content module calls the API.** Every screen reads mocks from `content/constants.ts` or inline arrays, and every action just fires a toast.
- The ads module is mock-only as well. **The one real SDK + TanStack Query pattern is admin management:**
  - `src/app/_libs/hooks/api/use-admin-admins.ts`
  - `src/app/(public)/settings/_components/admin-management.tsx`
  - `src/app/(public)/settings/_components/admin-management/admin-team-table.tsx`

  Copy that pattern.
- The UI has these problems:
  - `GlassCard` is imported from `games/_components`.
  - The `StatusBadge` and tone maps are duplicated: content `status-badge.tsx`, `RENEWAL_TONE` in `licensing-table.tsx`, and the ads one.
  - Search input + debounce is hand-rolled in 3 places.
  - The tables are raw `ui/table` instead of `DataTable`.
  - Dialogs are raw `ui/dialog` instead of `CustomModal`.
  - Raw `<img>` and `<button>` elements are used.
  - Charts use hardcoded `hsl()` colours.
  - Several dead files: `video-comments.tsx`, `game-association-card.tsx`, `video-actions-card.tsx`, the never-opened `BoostModal`, and the unused `LiveBadge` and `FeaturedBadge`.
- On the backend, every endpoint already exists and the SDK is generated: `AdminContentApi`, `AdminContentLibraryApi`, plus `MediaApi` for uploads.
- **Gotcha:** the backend does **not** validate workflow transitions (only `unschedule` does), so the UI decides which actions each status offers (§4).

## 1. Ground rules

1. **No visual change in Phase A.** Swapping in shared components must leave every screen pixel-identical. Where a shared component's default look differs, give it a style option rather than restyling the screen.
2. **Nothing is copied from other projects.** Only the coding conventions are adopted: shared `custom-*` components, hooks for URL state, typed props.
3. **Analytics stays mock and is not touched.** That covers `analytics/[id]`, `content-performance.tsx` and `content-analytics.tsx`.
4. **One API at a time.** Implement it, verify it (§5), commit it, and only then start the next. Each API gets its own commit, `feat(web/content): integrate <endpoint>`.
5. **UI first.** Phase A is reviewed by the team before any integration starts.
6. **Delete each mock in the same commit that replaces it.**
7. Follow the `apps/web/AGENTS.md` rules:
   - kebab-case names, `@/` imports
   - no `any`, no `as`
   - semantic colour tokens only
   - `next/image`
   - `aria-label` on icon buttons

## 2. Phase A: UI refactor (no visual change)

### 2.1 Shared components, new or extended (`src/components/custom/`)

| Component | Change | Replaces in content |
|---|---|---|
| `glass-card.tsx` | Moved from `games/_components`; every import across the app updated | the cross-module import in 13 files |
| `custom-select.tsx` | **New.** Options-driven `ui/select` with an optional trigger icon, using the same trigger and content classes as today | about 20 hand-written `Select` blocks |
| `custom-field.tsx` | **New.** `Label` + control wrapper (`space-y-2`), with optional `error` / `helperText` ready for form validation | about 35 `div.space-y-2 > Label + control` blocks |
| `custom-date-picker.tsx` | **New.** The Popover + outline Button + Calendar trigger used today | 5 copies (schedule, boost ×2, sponsorship ×2) |
| `custom-search.tsx` | Existing; used as-is | 3 hand-rolled search inputs (filters, licensing, taxonomy) |
| `custom-modal.tsx` | Extended: `title` takes a ReactNode, plus `titleClassName` and an `appearance="default"` option that keeps the base shadcn dialog look | 5 raw `Dialog`s (approval, preview, schedule, boost, taxonomy) |
| `data-table.tsx` | Extended with optional style options (`classNames.header/head/row/cell/empty`) | `licensing-table` and the `taxonomy-manager` table |
| `use-update-search-params.ts` (`src/hooks/`) | **New.** Merges URL query updates and resets `page` | 5 copies of the `URLSearchParams` + `router.push` code |

### 2.2 Content-module cleanup

- Rename content's `StatusBadge` to `ContentStatusBadge`, since its name clashes with the app-wide badge. Remove the unused `LiveBadge` and `FeaturedBadge`.
- Change `video-list.tsx` pagination to use the search-params hook instead of `window.location`.
- Replace `<img>` with `next/image` in `video-list-item`, `preview-as-user-modal` and `thumbnail-upload`.
- Delete the dead files: `details/[id]/_components/video-comments.tsx`, `new/_components/game-association-card.tsx` and `new/_components/video-actions-card.tsx`.
- `BoostModal` stays. It gets wired up at integration step 15.

### 2.3 Deferred to integration

The wizard moves to **react-hook-form + zod** in step 8, when the schema can mirror `CreateContentDto`. Doing it now would mean writing the form twice. `CustomField` already accepts `error`, so that switch needs no visual change.

## 3. Phase B: data layer scaffolding

- **SDK instances:** `src/app/_libs/api/sdk/admin-content-api.ts`, `admin-content-library-api.ts` and `media-api.ts`.
- **Query keys** in `src/app/_libs/query/query-keys.ts`:
  - `CONTENT_QUERY_KEYS`: `all`, `list(params)`, `stats(region)`, `detail(id)`, `full(id)`, `history(id)`, `licenses(params)`, `licenseSummary`
  - `TAXONOMY_QUERY_KEYS`: `genres`, `tags`, `studios`, `people`
- **Hooks:**
  - `src/app/_libs/hooks/api/use-admin-content.ts`
  - `src/app/_libs/hooks/api/use-content-taxonomy.ts`
  - `src/app/_libs/hooks/api/use-media-upload.ts`

  Each one returns `{ xxxQuery, data }` or `{ xxxMutation }`, and mutations invalidate `CONTENT_QUERY_KEYS.all`.
- **Mapper:** `content/_libs/content-mapper.ts` turns a `ContentResponseDto` into the row/view model, so components never touch DTO quirks.
  - Examples: cents → currency, `viewsTrend`, `isBoostActive`.
  - The `VideoItem` mock type goes away.

## 4. Phase C: API integration order

Each step names the screen it feeds. Tick a step only after it passes §5.

| # | API | Screen / usage |
|---|---|---|
| 1 | `GET /admin/content/stats?region=` | Summary cards and inventory `StatTile`s, plus the pipeline and tab counts |
| 2 | `GET /admin/content` (status tab, `q`, sort, region, page/limit) | Video list. Covers pagination, search, sort and the empty/error states |
| 3 | `GET /admin/content` with `scheduledFrom/To` | Calendar view |
| 4 | `GET /admin/content/:id/full` | Details page, read-only prefill of the wizard plus the history sidebar |
| 5 | Taxonomy lists: `genres`, `tags`, `studios`, `people` | Select options in the wizard and the taxonomy page tables |
| 6 | Taxonomy create / update / delete, one entity at a time (genres → tags → studios → people) | Taxonomy page |
| 7 | `POST /media/uploads` → S3 PUT → `POST /media/:id/complete`, then `GET /media/:id` (processing status) | `FileUpload` for the thumbnail, then the video |
| 8 | `POST /admin/content` | Wizard "Save draft" (create) |
| 9 | `PATCH /admin/content/:id` (+ `PUT /:id/cast`) | Wizard save in edit mode |
| 10 | `POST /:id/submit` | "Submit for approval" |
| 11 | `POST /:id/publish` | Approval modal, "Publish now" |
| 12 | `POST /:id/schedule`, then `POST /:id/unschedule` | Approval modal, "Schedule" |
| 13 | `POST /:id/reject` | Reject with a reason |
| 14 | `POST /:id/archive`, then `DELETE /:id` | Row actions, with confirm |
| 15 | `POST /:id/boost` | Boost modal (finally wired up) |
| 16 | `GET/PUT/DELETE /:id/license` | Wizard Rights step |
| 17 | `GET /admin/content/licenses` + `/licenses/summary` | Licensing & Rights section |
| 18 | `GET/PUT /:id/regions` | Wizard Distribution step |
| 19 | `GET/PUT/DELETE /:id/sponsorship` | Wizard Ad Sales step |
| 20 | `/:id/media` list / add / reorder / remove, `/:id/thumbnail-candidates`, `/:id/thumbnail/from-poster` | Media step gallery and thumbnail picker |
| 21 | `GET /:id/games` | Linked games on the details page |

**Actions shown for each status.** The UI enforces this because the backend doesn't.

| Status | Actions |
|---|---|
| `draft` | Edit, Submit, Delete |
| `pending_approval` | Publish, Schedule, Reject, Edit |
| `scheduled` | Unschedule, Publish now |
| `published` | Boost, Archive, Edit |
| `rejected` | Edit, Resubmit |
| `archived` | Delete |

Actions are also gated on the user's permissions: `content:read`, `content:write` and `content:publish`.

## 5. How each API is verified

1. Backend running locally. Web on :3002, going through the `/backend` proxy.
2. Check the request and response in the browser network tab and confirm they match the DTO: params, envelope, pagination.
3. Check the UI states: loading (skeleton), empty, error (`CustomRetryState` + retry), and success.
4. For a mutation:
   - The list or detail refreshes through invalidation.
   - The toast shows the server message.
   - The confirm modal shows `isConfirming`.
   - A 403 shows a clear message.
5. `pnpm --filter web typecheck` and `lint` pass.
6. The user confirms in the UI, then the step is committed.

## 6. Known gaps

- **Analytics stays mock** (decided). That covers per-content analytics (`analytics/[id]`) and the Content Performance section, neither of which has a backend endpoint.
- **`video-comments.tsx`** is deleted. Comment moderation lives in a separate admin module.
