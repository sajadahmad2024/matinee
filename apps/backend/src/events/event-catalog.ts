/**
 * THE canonical, backend-owned event catalog.
 *
 * Analytics rollups and several game/reward signals key off specific event names, so the event
 * vocabulary must be owned here — not an open string space the client can drift from. This enum
 * is the single source of truth:
 *   1. ingestion validates `eventName` against it (only catalog events are accepted), and
 *   2. it is emitted into the OpenAPI schema as an `enum`, so the generated web/Flutter SDKs bind
 *      it as a typed enum — the client physically cannot send an unknown event.
 *
 * Adding/renaming an event is a deliberate backend change (new enum member + catalog entry),
 * which then flows to every client on the next SDK regeneration.
 *
 * NOTE: authoritative state changes (watch-seconds, prediction entries, streak check-ins, unlocks,
 * subscriptions) are recorded by their dedicated typed endpoints — those drive the ledger/analytics
 * of record. The events here are behavioural/funnel telemetry; the game-relevant ones (e.g.
 * VideoComplete, GameEnter) are signals, never the source of truth for rewards.
 */

/** Coarse category every event rolls up to (derived from the name — never client-supplied). */
export enum AppEventType {
  Screen = 'screen',
  Lifecycle = 'lifecycle',
  Engagement = 'engagement',
  Game = 'game',
  Commerce = 'commerce',
  Social = 'social',
  Other = 'other',
}

/** Canonical event names. Snake_case wire values; codegen turns these into a bound SDK enum. */
export enum AppEventName {
  // ── screen ──────────────────────────────────────────────────────────────
  ScreenView = 'screen_view',

  // ── lifecycle / auth ────────────────────────────────────────────────────
  AppOpen = 'app_open',
  AppBackground = 'app_background',
  SignupStarted = 'signup_started',
  SignupCompleted = 'signup_completed',
  LoginCompleted = 'login_completed',
  Logout = 'logout',
  OnboardingCompleted = 'onboarding_completed',
  NotificationReceived = 'notification_received',
  NotificationOpened = 'notification_opened',
  PushPermissionGranted = 'push_permission_granted',
  PushPermissionDenied = 'push_permission_denied',

  // ── engagement (content) ────────────────────────────────────────────────
  FeedViewed = 'feed_viewed',
  VideoImpression = 'video_impression',
  VideoPlay = 'video_play',
  VideoPause = 'video_pause',
  VideoProgress = 'video_progress',
  VideoComplete = 'video_complete',
  VideoSeek = 'video_seek',
  VideoMuteToggled = 'video_mute_toggled',
  ContentDetailViewed = 'content_detail_viewed',
  ContentLiked = 'content_liked',
  ContentDisliked = 'content_disliked',
  ContentCommented = 'content_commented',
  WatchlistAdded = 'watchlist_added',
  WatchlistRemoved = 'watchlist_removed',

  // ── game ────────────────────────────────────────────────────────────────
  GameEnter = 'game_enter',
  QuestViewed = 'quest_viewed',
  QuestProgressed = 'quest_progressed',
  QuestClaimed = 'quest_claimed',
  PredictionViewed = 'prediction_viewed',
  PredictionEntered = 'prediction_entered',
  AuctionViewed = 'auction_viewed',
  BidPlaced = 'bid_placed',
  StreakViewed = 'streak_viewed',
  StreakCheckedIn = 'streak_checked_in',
  LeaderboardViewed = 'leaderboard_viewed',
  BadgeViewed = 'badge_viewed',

  // ── commerce ────────────────────────────────────────────────────────────
  PaywallViewed = 'paywall_viewed',
  PlansViewed = 'plans_viewed',
  SubscribeStarted = 'subscribe_started',
  SubscribeCompleted = 'subscribe_completed',
  SubscribeFailed = 'subscribe_failed',
  SubscriptionCancelled = 'subscription_cancelled',
  StoreViewed = 'store_viewed',
  RewardRedeemed = 'reward_redeemed',
  ContentUnlocked = 'content_unlocked',
  WalletViewed = 'wallet_viewed',

  // ── social ──────────────────────────────────────────────────────────────
  ContentShared = 'content_shared',
  ReferralShared = 'referral_shared',
  ReferralRedeemed = 'referral_redeemed',
  InviteSent = 'invite_sent',

  // ── other ───────────────────────────────────────────────────────────────
  Search = 'search',
  ProfileEdited = 'profile_edited',
  SettingsChanged = 'settings_changed',
}

/**
 * Name → category. Exhaustive over AppEventName (the `satisfies` makes a missing key a compile
 * error). The service uses this to stamp `event_type` server-side; the client never sends it.
 */
export const EVENT_CATALOG = {
  [AppEventName.ScreenView]: AppEventType.Screen,

  [AppEventName.AppOpen]: AppEventType.Lifecycle,
  [AppEventName.AppBackground]: AppEventType.Lifecycle,
  [AppEventName.SignupStarted]: AppEventType.Lifecycle,
  [AppEventName.SignupCompleted]: AppEventType.Lifecycle,
  [AppEventName.LoginCompleted]: AppEventType.Lifecycle,
  [AppEventName.Logout]: AppEventType.Lifecycle,
  [AppEventName.OnboardingCompleted]: AppEventType.Lifecycle,
  [AppEventName.NotificationReceived]: AppEventType.Lifecycle,
  [AppEventName.NotificationOpened]: AppEventType.Lifecycle,
  [AppEventName.PushPermissionGranted]: AppEventType.Lifecycle,
  [AppEventName.PushPermissionDenied]: AppEventType.Lifecycle,

  [AppEventName.FeedViewed]: AppEventType.Engagement,
  [AppEventName.VideoImpression]: AppEventType.Engagement,
  [AppEventName.VideoPlay]: AppEventType.Engagement,
  [AppEventName.VideoPause]: AppEventType.Engagement,
  [AppEventName.VideoProgress]: AppEventType.Engagement,
  [AppEventName.VideoComplete]: AppEventType.Engagement,
  [AppEventName.VideoSeek]: AppEventType.Engagement,
  [AppEventName.VideoMuteToggled]: AppEventType.Engagement,
  [AppEventName.ContentDetailViewed]: AppEventType.Engagement,
  [AppEventName.ContentLiked]: AppEventType.Engagement,
  [AppEventName.ContentDisliked]: AppEventType.Engagement,
  [AppEventName.ContentCommented]: AppEventType.Engagement,
  [AppEventName.WatchlistAdded]: AppEventType.Engagement,
  [AppEventName.WatchlistRemoved]: AppEventType.Engagement,

  [AppEventName.GameEnter]: AppEventType.Game,
  [AppEventName.QuestViewed]: AppEventType.Game,
  [AppEventName.QuestProgressed]: AppEventType.Game,
  [AppEventName.QuestClaimed]: AppEventType.Game,
  [AppEventName.PredictionViewed]: AppEventType.Game,
  [AppEventName.PredictionEntered]: AppEventType.Game,
  [AppEventName.AuctionViewed]: AppEventType.Game,
  [AppEventName.BidPlaced]: AppEventType.Game,
  [AppEventName.StreakViewed]: AppEventType.Game,
  [AppEventName.StreakCheckedIn]: AppEventType.Game,
  [AppEventName.LeaderboardViewed]: AppEventType.Game,
  [AppEventName.BadgeViewed]: AppEventType.Game,

  [AppEventName.PaywallViewed]: AppEventType.Commerce,
  [AppEventName.PlansViewed]: AppEventType.Commerce,
  [AppEventName.SubscribeStarted]: AppEventType.Commerce,
  [AppEventName.SubscribeCompleted]: AppEventType.Commerce,
  [AppEventName.SubscribeFailed]: AppEventType.Commerce,
  [AppEventName.SubscriptionCancelled]: AppEventType.Commerce,
  [AppEventName.StoreViewed]: AppEventType.Commerce,
  [AppEventName.RewardRedeemed]: AppEventType.Commerce,
  [AppEventName.ContentUnlocked]: AppEventType.Commerce,
  [AppEventName.WalletViewed]: AppEventType.Commerce,

  [AppEventName.ContentShared]: AppEventType.Social,
  [AppEventName.ReferralShared]: AppEventType.Social,
  [AppEventName.ReferralRedeemed]: AppEventType.Social,
  [AppEventName.InviteSent]: AppEventType.Social,

  [AppEventName.Search]: AppEventType.Other,
  [AppEventName.ProfileEdited]: AppEventType.Other,
  [AppEventName.SettingsChanged]: AppEventType.Other,
} satisfies Record<AppEventName, AppEventType>;

/** Resolve the (backend-owned) category for an event name. */
export function eventTypeOf(name: AppEventName): AppEventType {
  return EVENT_CATALOG[name];
}

/** Flat catalog for the discovery endpoint: every event with its category. */
export const EVENT_CATALOG_LIST: ReadonlyArray<{ name: AppEventName; type: AppEventType }> =
  (Object.keys(EVENT_CATALOG) as AppEventName[]).map((name) => ({ name, type: EVENT_CATALOG[name] }));
