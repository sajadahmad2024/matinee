/*
 * UI demo build only: mocks of the generated `AdminBadgesApi`, `AdminGamesApi` (quests and
 * predictions) and `AdminTokenomicsApi` (reward rules) — same method names, request shapes and
 * `{ data }` envelopes, answered in memory with the backend's status rules and error messages.
 * No request is ever sent.
 */
import type {
  BadgeDto,
  BadgeSummaryDto,
  BadgeTriggerDto,
  CreateBadgeDto,
  CreatePredictionDto,
  CreateQuestDto,
  PredictionDetailDto,
  PredictionEntryDto,
  PredictionEntryStatsDto,
  PredictionOptionDto,
  QuestDetailDto,
  QuestParticipantDto,
  RewardRuleDto,
  UpdateBadgeDto,
  UpdatePredictionDto,
  UpdateQuestDto,
  UpdateRewardRuleDto,
} from "@/app/_libs/api/generated";

import {
  PLAYER_NAMES,
  badRequest,
  conflict,
  copy,
  daysFromNow,
  hoursAgo,
  newId,
  notFound,
  nowIso,
  ok,
  paginate,
  slugify,
} from "./_demo/core";
import { mediaUrl } from "./_demo/media-store";

const isPast = (iso?: string | null) => !!iso && new Date(iso).getTime() <= Date.now();
const player = (i: number) => {
  const name = PLAYER_NAMES[i % PLAYER_NAMES.length] ?? "player";
  return {
    userId: `user-${i + 1}`,
    username: i < PLAYER_NAMES.length ? name : `${name}_${i}`,
    firstName: null,
    lastName: null,
    avatarUrl: null,
  };
};

// ─── Badges ──────────────────────────────────────────────────────────────────

const BADGE_TRIGGERS: BadgeTriggerDto[] = [
  { key: "points_earned_lifetime", label: "Points Earned (lifetime)", unit: "pts", description: null },
  { key: "total_games_played", label: "Total Games Played", unit: null, description: null },
  { key: "total_watch_minutes", label: "Total Watch Time (mins)", unit: "mins", description: null },
  { key: "watch_streak_days", label: "Watch Streak (days)", unit: "days", description: null },
  { key: "quizzes_completed", label: "Quizzes Completed", unit: null, description: null },
  { key: "first_place_wins", label: "First Place Wins", unit: null, description: null },
  { key: "referrals_completed", label: "Referrals Completed", unit: null, description: null },
  { key: "prediction_accuracy_pct", label: "Prediction Accuracy (%)", unit: "%", description: null },
];

const badge = (
  id: string,
  name: string,
  description: string,
  triggerKey: string,
  operator: string,
  threshold: number,
  rewardPoints: number,
  earnedCount: number,
  isActive = true,
): BadgeDto => ({
  id,
  name,
  slug: slugify(name),
  description,
  family: "achievement" as BadgeDto["family"],
  gameType: null,
  sortOrder: Number(id),
  awardedBy: "trigger" as BadgeDto["awardedBy"],
  triggerKey,
  operator,
  threshold,
  rewardPoints,
  isActive,
  earnedCount,
  activeIconMediaId: null,
  inactiveIconMediaId: null,
  activeIconUrl: null,
  inactiveIconUrl: null,
});

const badges: BadgeDto[] = [
  badge("1", "Quiz Master", "Complete 50 quizzes with 80%+ accuracy", "quizzes_completed", "gt", 50, 500, 1234),
  badge("2", "Streak Champion", "Maintain a 30-day watch streak", "watch_streak_days", "gte", 30, 1000, 456),
  badge("3", "Binge Watcher", "Watch over 100 hours of content", "total_watch_minutes", "gt", 6000, 750, 2341),
  badge("4", "First Place", "Win first place in any leaderboard", "first_place_wins", "gte", 1, 200, 890),
  badge("5", "Oracle", "Keep prediction accuracy above 80%", "prediction_accuracy_pct", "gte", 80, 600, 0),
  badge("6", "Social Butterfly", "Refer 5 friends who complete their first game", "referrals_completed", "gte", 5, 400, 234, false),
];

const findBadge = (id: string) => {
  const found = badges.find((b) => b.id === id);
  if (!found) throw notFound("Badge");
  return found;
};

const assertBadgeNameFree = (name: string, exceptId?: string) => {
  const clash = badges.find((b) => b.id !== exceptId && b.name.toLowerCase() === name.toLowerCase());
  if (clash) throw conflict(`A badge named "${clash.name}" already exists`);
};

/** Icon URLs follow their media ids (an icon uploaded in this tab plays from a local URL). */
const withIcons = (b: BadgeDto): BadgeDto => ({
  ...b,
  activeIconUrl: mediaUrl(b.activeIconMediaId) ?? b.activeIconUrl ?? null,
  inactiveIconUrl: mediaUrl(b.inactiveIconMediaId) ?? b.inactiveIconUrl ?? null,
});

export const adminBadgesApi = {
  async adminBadgesControllerListV1() {
    return ok(badges.map(withIcons));
  },

  async adminBadgesControllerSummaryV1() {
    const active = badges.filter((b) => b.isActive);
    const summary: BadgeSummaryDto = {
      total: badges.length,
      active: active.length,
      playersWithBadge: 8413,
      playersWithBadgePct: 62.4,
      neverEarned: active.filter((b) => !b.earnedCount).length,
    };
    return ok(summary);
  },

  async adminBadgesControllerTriggersV1() {
    return ok(BADGE_TRIGGERS);
  },

  async adminBadgesControllerCreateV1({ createBadgeDto: dto }: { createBadgeDto: CreateBadgeDto }) {
    assertBadgeNameFree(dto.name);
    const created: BadgeDto = {
      ...badge(newId("badge"), dto.name, dto.description ?? "", dto.triggerKey ?? "", dto.operator ?? "gte", dto.threshold ?? 0, dto.rewardPoints ?? 0, 0),
      sortOrder: badges.length + 1,
      activeIconMediaId: dto.activeIconMediaId ?? null,
      inactiveIconMediaId: dto.inactiveIconMediaId ?? null,
    };
    badges.push(created);
    return ok(withIcons(created));
  },

  async adminBadgesControllerUpdateV1({ id, updateBadgeDto: dto }: { id: string; updateBadgeDto: UpdateBadgeDto }) {
    const found = findBadge(id);
    if (dto.name) assertBadgeNameFree(dto.name, id);
    // like the backend: the slug is kept on rename
    Object.assign(found, Object.fromEntries(Object.entries(dto).filter(([, v]) => v !== undefined)));
    return ok(withIcons(found));
  },

  async adminBadgesControllerRemoveV1({ id }: { id: string }) {
    findBadge(id);
    badges.splice(badges.findIndex((b) => b.id === id), 1);
    return ok({ message: "Badge deleted" });
  },
};

// ─── Quests ──────────────────────────────────────────────────────────────────

interface DemoQuest extends QuestDetailDto {
  unlockThresholdPoints: number;
  /** How many demo players started it — the results table's rows. */
  players: number;
}

const quest = (
  id: string,
  name: string,
  status: string,
  start: number,
  weeks: number,
  rewardPoints: number,
  players: number,
  videos: string[],
): DemoQuest => ({
  id,
  name,
  description: `Watch the set before the week is out to earn ${rewardPoints} pts.`,
  rewardPoints,
  startAt: daysFromNow(start),
  endAt: daysFromNow(start + weeks * 7),
  status,
  featuredFlag: false,
  bannerMediaId: null,
  bannerUrl: null,
  geofenceCountries: null,
  claimGraceDays: 3,
  participantCount: 0,
  completedCount: 0,
  pointsPaid: 0,
  unlockThresholdPoints: 0,
  players,
  actions: [
    {
      key: "watch",
      type: "watch" as QuestDetailDto["actions"][number]["type"],
      title: "Watch the set",
      target: videos.length,
      curatedContentIds: videos,
    },
  ],
});

const quests: DemoQuest[] = [
  quest("q1", "Marvel Marathon Week", "active", -3, 1, 100, 48, ["c1", "c2", "c3"]),
  quest("q2", "Bollywood Blockbusters", "active", -1, 2, 150, 31, ["c6", "c7", "c8"]),
  quest("q3", "K-Drama Binge", "scheduled", 4, 1, 120, 0, ["c4", "c5"]),
  quest("q4", "Hidden Gems", "scheduled", 11, 1, 80, 0, ["c8", "c3"]),
  quest("q5", "Oscar Week", "ended", -16, 1, 100, 57, ["c3", "c4"]),
  quest("q6", "Spring Premieres", "ended", -30, 1, 90, 39, ["c2", "c5", "c7"]),
];

/** The demo participations of a quest: everyone started it; some finished, some claimed. */
function questParticipants(q: DemoQuest): QuestParticipantDto[] {
  const total = q.actions?.[0]?.curatedContentIds?.length ?? 1;
  const ended = q.status !== "active";
  return Array.from({ length: q.players }, (_, i) => {
    // live: a third claimed, a third finished, a third still going; ended: nobody still going
    const bucket = i % 3;
    const status = bucket === 0 ? "claimed" : bucket === 1 || ended ? "completed" : "in_progress";
    const done = status === "in_progress" ? (i % total) : total;
    return {
      ...player(i),
      status: status as QuestParticipantDto["status"],
      startedAt: hoursAgo(6 + i * 3),
      completedAt: status === "in_progress" ? null : hoursAgo(2 + i * 2),
      claimedAt: status === "claimed" ? hoursAgo(1 + i * 2) : null,
      actionsDone: done,
      actionsTotal: total,
      completedInDays: status === "in_progress" ? null : 1 + (i % 6),
      badgeAwardedSlug: null,
      pointsPaid: status === "claimed" ? q.rewardPoints : 0,
    };
  });
}

/** A quest as the API returns it: stats from its participations, banner URL from its media id. */
function questOut(q: DemoQuest) {
  const rows = questParticipants(q);
  const { players: _players, ...rest } = q;
  return {
    ...rest,
    bannerUrl: mediaUrl(q.bannerMediaId) ?? q.bannerUrl ?? null,
    participantCount: rows.length,
    completedCount: rows.filter((p) => p.status !== "in_progress").length,
    pointsPaid: rows.reduce((sum, p) => sum + p.pointsPaid, 0),
  };
}

const findQuest = (id: string) => {
  const found = quests.find((q) => q.id === id);
  if (!found) throw notFound("Quest");
  return found;
};

const setQuestStatus = (id: string, status: string) => {
  const q = findQuest(id);
  q.status = status;
  return ok({ id, status });
};

// ─── Predictions ─────────────────────────────────────────────────────────────

interface DemoPrediction extends PredictionDetailDto {
  cadence: string | null;
  unlockThresholdPoints: number;
  resolveHoldMinutes: number;
  /** How many demo players entered — the results table's rows. */
  players: number;
}

const options = (predictionId: string, labels: string[]): PredictionOptionDto[] =>
  labels.map((label, i) => ({
    id: `${predictionId}-o${i + 1}`,
    label,
    optionMediaId: null,
    sortOrder: i,
    isCorrect: false,
  }));

const prediction = (
  id: string,
  question: string,
  labels: string[],
  status: string,
  start: number,
  months: number,
  stakes: { entry: number; multiplier: number; reward: number },
  players: number,
  correctIndex?: number,
): DemoPrediction => {
  const opts = options(id, labels);
  const correct = correctIndex === undefined ? null : (opts[correctIndex] ?? null);
  if (correct) correct.isCorrect = true;
  return {
    id,
    title: null,
    question,
    description: null,
    contentId: null,
    startAt: daysFromNow(start),
    endAt: daysFromNow(start + months * 30),
    status,
    rewardPoints: stakes.reward,
    entryCostPoints: stakes.entry,
    payoutMultiplier: stakes.multiplier,
    resolutionNo: 1,
    correctOptionId: correct?.id ?? null,
    options: opts,
    cadence: months === 3 ? "quarterly" : "monthly",
    unlockThresholdPoints: 0,
    resolveHoldMinutes: 0,
    players,
  };
};

const predictions: DemoPrediction[] = [
  prediction("p1", "Who wins Best Picture at IIFA 2027?", ["Kalki 2898 AD", "Stree 2", "Laapataa Ladies", "Animal"], "open", -5, 1, { entry: 50, multiplier: 5, reward: 0 }, 44),
  prediction("p2", "Will Pushpa 3 cross 1000 Cr worldwide?", ["Yes", "No"], "locked", -32, 1, { entry: 100, multiplier: 3, reward: 0 }, 36),
  prediction("p3", "Which OTT drops the most originals in December?", ["Netflix", "Prime Video", "JioHotstar", "SonyLIV"], "scheduled", 6, 1, { entry: 0, multiplier: 5, reward: 250 }, 0),
  prediction("p4", "Who wins the season finale showdown?", ["Arjun", "Meera", "Kabir"], "resolved", -70, 1, { entry: 50, multiplier: 10, reward: 0 }, 52, 1),
  prediction("p5", "Box-office topper on Diwali weekend?", ["Singham Again", "Bhool Bhulaiyaa 3"], "cancelled", -20, 1, { entry: 25, multiplier: 5, reward: 0 }, 18),
];

/** The demo entries of a prediction: picks spread over its options, judged once resolved. */
function predictionEntries(p: DemoPrediction): PredictionEntryDto[] {
  const opts = p.options ?? [];
  const resolved = p.status === "resolved";
  return Array.from({ length: p.players }, (_, i) => {
    // weight the first options a little, like real picks
    const option = opts[(i * 7 + (i % 3)) % Math.max(1, opts.length)] ?? opts[0];
    const isCorrect = resolved ? option?.id === p.correctOptionId : null;
    const payout = p.entryCostPoints > 0 ? p.entryCostPoints * p.payoutMultiplier : p.rewardPoints;
    return {
      ...player(i),
      optionId: option?.id ?? "",
      optionLabel: option?.label ?? null,
      isCorrect,
      pointsStaked: p.entryCostPoints,
      pointsPaid: isCorrect ? payout : 0,
      enteredAt: hoursAgo(4 + i * 5),
      paidAt: isCorrect ? hoursAgo(1) : null,
    };
  });
}

function entryStats(p: DemoPrediction, rows: PredictionEntryDto[]): PredictionEntryStatsDto {
  return {
    participantCount: rows.length,
    correctCount: rows.filter((e) => e.isCorrect).length,
    pointsStaked: rows.reduce((sum, e) => sum + e.pointsStaked, 0),
    pointsPaid: rows.reduce((sum, e) => sum + e.pointsPaid, 0),
    options: (p.options ?? []).map((o) => {
      const entries = rows.filter((e) => e.optionId === o.id).length;
      return {
        optionId: o.id,
        label: o.label ?? null,
        entries,
        percent: rows.length ? Math.round((entries / rows.length) * 100) : 0,
      };
    }),
  };
}

const predictionRow = (p: DemoPrediction) => {
  const { players: _players, options: _options, ...row } = p;
  return row;
};
const predictionDetail = (p: DemoPrediction) => {
  const { players: _players, ...detail } = p;
  return detail;
};

const findPrediction = (id: string) => {
  const found = predictions.find((p) => p.id === id);
  if (!found) throw notFound("Prediction");
  return found;
};

const previews = new Map<string, { token: string; optionId: string }>();

// ─── Games API (quests + predictions) ────────────────────────────────────────

type ListParams = { page?: number; limit?: number; status?: string };

export const adminGamesApi = {
  // Quests ─────────────────────────────────────────────────────────────────

  async adminQuestControllerListV1(params: ListParams = {}) {
    const rows = quests.filter((q) => !params?.status || q.status === params.status);
    const { items, pagination } = paginate(rows, params?.page, params?.limit);
    return ok({ items: items.map((q) => {
      const { actions: _actions, ...row } = questOut(q);
      return row;
    }), pagination });
  },

  async adminQuestControllerGetV1({ id }: { id: string }) {
    return ok(questOut(findQuest(id)));
  },

  async adminQuestControllerParticipantsV1(params: { id: string } & ListParams) {
    const q = findQuest(params.id);
    const all = questParticipants(q);
    const rows = all.filter((p) => !params?.status || p.status === params.status);
    const { items, pagination } = paginate(rows, params?.page, params?.limit);
    const summary = {
      participantCount: all.length,
      completedCount: all.filter((p) => p.status !== "in_progress").length,
      pointsPaid: all.reduce((sum, p) => sum + p.pointsPaid, 0),
    };
    return ok({ items, pagination, summary });
  },

  async adminQuestControllerCreateV1({ createQuestDto: dto }: { createQuestDto: CreateQuestDto }) {
    const created: DemoQuest = {
      ...quest(newId("quest"), dto.name, "draft", 0, 1, dto.rewardPoints ?? 0, 0, []),
      description: dto.description ?? null,
      startAt: dto.startAt,
      endAt: dto.endAt,
      bannerMediaId: dto.bannerMediaId ?? null,
      unlockThresholdPoints: dto.unlockThresholdPoints ?? 0,
      actions: copy(dto.actions ?? []) as DemoQuest["actions"],
    };
    quests.unshift(created);
    return ok(questOut(created));
  },

  async adminQuestControllerUpdateV1({ id, updateQuestDto: dto }: { id: string; updateQuestDto: UpdateQuestDto }) {
    const q = findQuest(id);
    Object.assign(q, Object.fromEntries(Object.entries(dto).filter(([, v]) => v !== undefined)));
    return ok(questOut(q));
  },

  async adminQuestControllerPublishV1({ id }: { id: string }) {
    const q = findQuest(id);
    if (q.status !== "draft") throw conflict(`Cannot publish a ${q.status} quest`);
    if (isPast(q.endAt)) throw badRequest("Cannot publish a quest whose endAt has already passed");
    return setQuestStatus(id, isPast(q.startAt) ? "active" : "scheduled");
  },

  async adminQuestControllerActivateV1({ id }: { id: string }) {
    findQuest(id).startAt = nowIso();
    return setQuestStatus(id, "active");
  },

  async adminQuestControllerEndV1({ id }: { id: string }) {
    findQuest(id).endAt = nowIso();
    return setQuestStatus(id, "ended");
  },

  async adminQuestControllerCancelV1({ id }: { id: string }) {
    return setQuestStatus(id, "cancelled");
  },

  async adminQuestControllerArchiveV1({ id }: { id: string }) {
    return setQuestStatus(id, "archived");
  },

  async adminQuestControllerCloneV1({ id }: { id: string }) {
    const source = findQuest(id);
    const clone: DemoQuest = { ...copy(source), id: newId("quest"), name: `${source.name} (clone)`, status: "draft", players: 0 };
    quests.unshift(clone);
    return ok(questOut(clone));
  },

  async adminQuestControllerRemoveV1({ id }: { id: string }) {
    const q = findQuest(id);
    if (q.status === "active") throw badRequest("Cannot delete an active quest — end or cancel it first");
    quests.splice(quests.indexOf(q), 1);
    return ok({ deleted: true });
  },

  // Predictions ────────────────────────────────────────────────────────────

  async adminPredictionControllerListV1(params: ListParams = {}) {
    const rows = predictions.filter((p) => !params?.status || p.status === params.status);
    const { items, pagination } = paginate(rows, params?.page, params?.limit);
    return ok({ items: items.map(predictionRow), pagination });
  },

  async adminPredictionControllerGetV1({ id }: { id: string }) {
    return ok(predictionDetail(findPrediction(id)));
  },

  async adminPredictionControllerEntriesV1(params: { id: string; page?: number; limit?: number; result?: string }) {
    const p = findPrediction(params.id);
    const all = predictionEntries(p);
    const result = (e: PredictionEntryDto) =>
      e.isCorrect === true ? "correct" : e.isCorrect === false ? "incorrect" : "pending";
    const rows = all.filter((e) => !params?.result || result(e) === params.result);
    const { items, pagination } = paginate(rows, params?.page, params?.limit);
    return ok({ items, pagination, summary: entryStats(p, all) });
  },

  async adminPredictionControllerCreateV1({ createPredictionDto: dto }: { createPredictionDto: CreatePredictionDto }) {
    if ((dto.options?.length ?? 0) < 2) throw badRequest("A prediction needs at least 2 options");
    if (!dto.entryCostPoints && !dto.rewardPoints) {
      throw badRequest("A prediction must pay something — set entryCostPoints and/or rewardPoints");
    }
    const id = newId("prediction");
    const created: DemoPrediction = {
      ...prediction(id, dto.question, dto.options ?? [], "draft", 0, 1, {
        entry: dto.entryCostPoints ?? 0,
        multiplier: dto.payoutMultiplier ?? 1,
        reward: dto.rewardPoints ?? 0,
      }, 0),
      description: dto.description ?? null,
      startAt: dto.startAt,
      endAt: dto.endAt,
      cadence: dto.cadence ?? null,
      unlockThresholdPoints: dto.unlockThresholdPoints ?? 0,
    };
    predictions.unshift(created);
    return ok(predictionDetail(created));
  },

  async adminPredictionControllerUpdateV1({ id, updatePredictionDto: dto }: { id: string; updatePredictionDto: UpdatePredictionDto }) {
    const p = findPrediction(id);
    Object.assign(p, Object.fromEntries(Object.entries(dto).filter(([, v]) => v !== undefined)));
    // the backend's scheduler opens a scheduled prediction once its start has passed
    if (p.status === "scheduled" && isPast(p.startAt)) p.status = "open";
    return ok(predictionDetail(p));
  },

  async adminPredictionControllerPublishV1({ id }: { id: string }) {
    const p = findPrediction(id);
    if (p.status !== "draft") throw conflict(`Cannot publish a ${p.status} prediction`);
    if (isPast(p.endAt)) throw badRequest("Cannot publish a prediction whose endAt has already passed");
    p.status = isPast(p.startAt) ? "open" : "scheduled";
    return ok({ id, status: p.status });
  },

  async adminPredictionControllerVoidPredictionV1({ id }: { id: string }) {
    const p = findPrediction(id);
    if (!["open", "locked"].includes(p.status) || p.resolutionNo !== 1) {
      throw conflict("Can only void an open/locked prediction that has never been resolved");
    }
    p.status = "cancelled";
    return ok({ id, status: "cancelled", refunded: p.players });
  },

  async adminPredictionControllerReverseResolutionV1({ id }: { id: string }) {
    const p = findPrediction(id);
    if (p.status !== "resolved") throw conflict("Can only reverse a resolved prediction");
    p.status = "locked";
    p.correctOptionId = null;
    p.resolutionNo += 1;
    p.options?.forEach((o) => (o.isCorrect = false));
    return ok({ id, status: "locked", resolutionNo: p.resolutionNo, reversed: p.players });
  },

  async adminPredictionControllerRemoveV1({ id }: { id: string }) {
    const p = findPrediction(id);
    if (p.status !== "draft" && p.status !== "scheduled") {
      throw badRequest("Cannot delete a published prediction — cancel or void it instead");
    }
    predictions.splice(predictions.indexOf(p), 1);
    return ok({ deleted: true });
  },

  async adminPredictionControllerPreviewResolveV1({ id, resolvePredictionDto }: { id: string; resolvePredictionDto: { correctOptionId: string } }) {
    const p = findPrediction(id);
    if (p.status !== "locked") throw conflict(`Cannot resolve a ${p.status} prediction — it must be locked first`);
    const optionId = resolvePredictionDto.correctOptionId;
    if (!p.options?.some((o) => o.id === optionId)) {
      throw badRequest("correctOptionId is not an option of this prediction");
    }
    const entries = predictionEntries(p);
    const correctCount = entries.filter((e) => e.optionId === optionId).length;
    const payout = p.entryCostPoints > 0 ? p.entryCostPoints * p.payoutMultiplier : p.rewardPoints;
    const token = newId("preview");
    previews.set(id, { token, optionId });
    return ok({
      previewToken: token,
      entries: entries.length,
      correctCount,
      totalPayout: correctCount * payout,
      expiresAt: new Date(Date.now() + 10 * 60_000).toISOString(),
    });
  },

  async adminPredictionControllerConfirmResolveV1({ id, confirmResolveDto }: { id: string; confirmResolveDto: { previewToken: string } }) {
    const p = findPrediction(id);
    const preview = previews.get(id);
    if (!preview || preview.token !== confirmResolveDto.previewToken) {
      throw conflict("Preview is stale or expired — resolve again");
    }
    previews.delete(id);
    p.status = "resolved";
    p.correctOptionId = preview.optionId;
    p.options?.forEach((o) => (o.isCorrect = o.id === preview.optionId));
    const entries = predictionEntries(p);
    return ok({
      id,
      status: "resolved",
      correctOptionId: preview.optionId,
      totalEntries: entries.length,
      correctCount: entries.filter((e) => e.isCorrect).length,
    });
  },
};

// ─── Reward rules (Policy cards) ─────────────────────────────────────────────

const rule = (ruleKey: string, name: string, config: Record<string, unknown>): RewardRuleDto => ({
  id: `rule-${ruleKey}`,
  ruleKey,
  name,
  description: null,
  isEnabled: true,
  config,
  version: 1,
  updatedAt: daysFromNow(-14),
  pendingVersion: null,
  pendingEffectiveFrom: null,
});

const rules: RewardRuleDto[] = [
  rule("quest", "Weekly Quests", { default_points: 100, default_xp: 25, require_all_default: true, default_window_weeks: 1 }),
  rule("prediction", "Predictions", {
    default_points: 100,
    default_xp: 25,
    default_entry_cost: 50,
    default_multiplier: 5,
    default_cadence: "monthly",
    free_entries_per_month: 3,
  }),
];

const findRule = (ruleKey: string) => {
  const found = rules.find((r) => r.ruleKey === ruleKey);
  if (!found) throw notFound("Reward rule");
  return found;
};

export const adminTokenomicsApi = {
  async adminRewardRuleControllerGetV1({ ruleKey }: { ruleKey: string }) {
    return ok(findRule(ruleKey));
  },

  async adminRewardRuleControllerUpdateV1({ ruleKey, updateRewardRuleDto: dto }: { ruleKey: string; updateRewardRuleDto: UpdateRewardRuleDto }) {
    const r = findRule(ruleKey);
    if (dto.isEnabled !== undefined) r.isEnabled = dto.isEnabled;
    if (dto.config !== undefined) r.config = dto.config;
    r.version += 1;
    r.updatedAt = nowIso();
    return ok(r);
  },
};
