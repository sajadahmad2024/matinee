/**
 * Engagement domain events — the seam to the future Events and Tokenomics modules.
 *
 * Engagement only *records* the action (and maintains denormalized counters via DB triggers).
 * It emits these in-process events so that, when those modules land, they subscribe without
 * any change here:
 *   - Events module   → persists/rolls-up the coarse event (analytics; later Firehose sink).
 *   - Tokenomics module → awards points where a rule applies (e.g. "shared_content"), with
 *                         its own daily caps + idempotency (NOT done inline here).
 *
 * No subscribers yet → these emits are currently no-ops by design.
 */
export const EngagementEvent = {
  ContentReacted: 'engagement.content.reacted',
  ContentReactionRemoved: 'engagement.content.reaction_removed',
  ContentShared: 'engagement.content.shared',
  ContentSaved: 'engagement.content.saved',
  ContentUnsaved: 'engagement.content.unsaved',
} as const;

export interface ContentReactedPayload {
  userId: string;
  contentId: string;
  reaction: 'like' | 'dislike';
}

export interface ContentSharedPayload {
  userId: string;
  contentId: string;
  shareId: string;
  channel?: string;
}

export interface ContentSavedPayload {
  userId: string;
  contentId: string;
}
