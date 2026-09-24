**Type:** feat

# Notification center

The Notifications screen from Figma frame `1167:2170`, opened from the Profile bell and the Notifications menu row.

## Screens

| Frame | Screen | Route |
|---|---|---|
| `1167:2170` | Notifications — filter chips, day sections, notification cards | `/profile/notifications` |

Outside the shell, like edit profile: the frame draws no bottom nav, so it covers it.

## Decisions confirmed with the user

- The frame is not part of the extracted design system. Its values fold into existing entries; no new tokens (see `docs/design/design-system.md` decisions log).
- The active filter chip is the gold-tinted pill the frame draws (`tag.goldSubtle` roles), not the solid documented filter chip.
- No inbox API exists. A hand-written service stands in for it, as in earns, p2p and rewards. Filters, Read All and tap-to-read work locally.
- Bid Now opens the auction; Check In Now opens the daily streak.

## Assumptions

- Filters are All, Auctions, Quests & Streaks, System. Prediction results sit under Quests & Streaks, with the other P2P games.
- Sections group by day: Today, Yesterday, Earlier. The frame files a 3-day-old notice under Yesterday; the app files it under Earlier.
- Only the All chip carries the unread count, as drawn.
- Empty and error states are not designed; they use `ErrorView` and the section-free empty text.

## Feature tree

```
lib/features/notifications/
  data/
    models/app_notification.dart
    services/notifications_api_service.dart
    notifications_repository.dart
  presentation/
    cubit/notifications_cubit.dart
    cubit/notifications_state.dart
    notifications_screen.dart
    widgets/notification_card.dart
    widgets/notification_filter_chips.dart
  notifications_di.dart
```

## Progress

- [x] Plan and design-doc folds
- [x] Models, service, repository, DI
- [x] Cubit, state, cubit tests
- [x] Route, Profile entry points, strings
- [x] Screen and widgets
- [x] Run and compare against the frame
- [x] Widget tests, analyze, tests, code review
