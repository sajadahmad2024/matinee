import { relations } from "drizzle-orm/relations";
import { mediaMetadata, mediaStatusEvents, users, userEnforcementActions, oauthAccounts, otpCodes, rewardRules, geoPolicies, referralCodes, referralRedemptions, deviceTokens, studios, people, contents, contentMedia, contentChangeHistory, contentReactions, comments, commentReports, contentShares, contentModerationLog, contentUnlocks, contentViews, rewardRuleVersions, wallets, ledgerTransactions, userStreaks, quests, predictions, predictionOptions, predictionEntries, auctions, bids, permissions, rolePermissions, roles, contentTags, tags, questContents, deviceTokenTopics, contentGenres, genres, contentWatchlist, userRoles, commentReactions, questContentProgress, leaderboardMonthly, contentCast, contentProgress, questParticipations, userDailyActivity, contentDailyStats } from "./schema";

export const mediaMetadataRelations = relations(mediaMetadata, ({one, many}) => ({
	mediaMetadatum: one(mediaMetadata, {
		fields: [mediaMetadata.posterMediaId],
		references: [mediaMetadata.id],
		relationName: "mediaMetadata_posterMediaId_mediaMetadata_id"
	}),
	mediaMetadata: many(mediaMetadata, {
		relationName: "mediaMetadata_posterMediaId_mediaMetadata_id"
	}),
	mediaStatusEvents: many(mediaStatusEvents),
	users: many(users),
	studios: many(studios),
	people: many(people),
	contents_thumbnailMediaId: many(contents, {
		relationName: "contents_thumbnailMediaId_mediaMetadata_id"
	}),
	contents_videoMediaId: many(contents, {
		relationName: "contents_videoMediaId_mediaMetadata_id"
	}),
	contentMedias: many(contentMedia),
	predictionOptions: many(predictionOptions),
}));

export const mediaStatusEventsRelations = relations(mediaStatusEvents, ({one}) => ({
	mediaMetadatum: one(mediaMetadata, {
		fields: [mediaStatusEvents.mediaId],
		references: [mediaMetadata.id]
	}),
}));

export const usersRelations = relations(users, ({one, many}) => ({
	mediaMetadatum: one(mediaMetadata, {
		fields: [users.avatarMediaId],
		references: [mediaMetadata.id]
	}),
	user_mergedIntoUserId: one(users, {
		fields: [users.mergedIntoUserId],
		references: [users.id],
		relationName: "users_mergedIntoUserId_users_id"
	}),
	users_mergedIntoUserId: many(users, {
		relationName: "users_mergedIntoUserId_users_id"
	}),
	user_statusChangedBy: one(users, {
		fields: [users.statusChangedBy],
		references: [users.id],
		relationName: "users_statusChangedBy_users_id"
	}),
	users_statusChangedBy: many(users, {
		relationName: "users_statusChangedBy_users_id"
	}),
	userEnforcementActions_performedBy: many(userEnforcementActions, {
		relationName: "userEnforcementActions_performedBy_users_id"
	}),
	userEnforcementActions_userId: many(userEnforcementActions, {
		relationName: "userEnforcementActions_userId_users_id"
	}),
	oauthAccounts: many(oauthAccounts),
	otpCodes: many(otpCodes),
	rewardRules: many(rewardRules),
	geoPolicies: many(geoPolicies),
	referralCodes: many(referralCodes),
	referralRedemptions_refereeId: many(referralRedemptions, {
		relationName: "referralRedemptions_refereeId_users_id"
	}),
	referralRedemptions_referrerId: many(referralRedemptions, {
		relationName: "referralRedemptions_referrerId_users_id"
	}),
	deviceTokens: many(deviceTokens),
	contents_approvedBy: many(contents, {
		relationName: "contents_approvedBy_users_id"
	}),
	contents_createdBy: many(contents, {
		relationName: "contents_createdBy_users_id"
	}),
	contents_requestedBy: many(contents, {
		relationName: "contents_requestedBy_users_id"
	}),
	contents_updatedBy: many(contents, {
		relationName: "contents_updatedBy_users_id"
	}),
	contentChangeHistories: many(contentChangeHistory),
	contentReactions: many(contentReactions),
	comments: many(comments),
	commentReports_reportedBy: many(commentReports, {
		relationName: "commentReports_reportedBy_users_id"
	}),
	commentReports_reviewedBy: many(commentReports, {
		relationName: "commentReports_reviewedBy_users_id"
	}),
	contentShares: many(contentShares),
	contentModerationLogs: many(contentModerationLog),
	contentUnlocks: many(contentUnlocks),
	contentViews: many(contentViews),
	rewardRuleVersions: many(rewardRuleVersions),
	wallets: many(wallets),
	ledgerTransactions: many(ledgerTransactions),
	userStreaks: many(userStreaks),
	quests: many(quests),
	predictions_createdBy: many(predictions, {
		relationName: "predictions_createdBy_users_id"
	}),
	predictions_resolvedBy: many(predictions, {
		relationName: "predictions_resolvedBy_users_id"
	}),
	predictionEntries: many(predictionEntries),
	auctions_createdBy: many(auctions, {
		relationName: "auctions_createdBy_users_id"
	}),
	auctions_winnerUserId: many(auctions, {
		relationName: "auctions_winnerUserId_users_id"
	}),
	bids: many(bids),
	contentWatchlists: many(contentWatchlist),
	userRoles_assignedBy: many(userRoles, {
		relationName: "userRoles_assignedBy_users_id"
	}),
	userRoles_userId: many(userRoles, {
		relationName: "userRoles_userId_users_id"
	}),
	commentReactions: many(commentReactions),
	questContentProgresses: many(questContentProgress),
	leaderboardMonthlies: many(leaderboardMonthly),
	contentProgresses: many(contentProgress),
	questParticipations: many(questParticipations),
	userDailyActivities: many(userDailyActivity),
}));

export const userEnforcementActionsRelations = relations(userEnforcementActions, ({one}) => ({
	user_performedBy: one(users, {
		fields: [userEnforcementActions.performedBy],
		references: [users.id],
		relationName: "userEnforcementActions_performedBy_users_id"
	}),
	user_userId: one(users, {
		fields: [userEnforcementActions.userId],
		references: [users.id],
		relationName: "userEnforcementActions_userId_users_id"
	}),
}));

export const oauthAccountsRelations = relations(oauthAccounts, ({one}) => ({
	user: one(users, {
		fields: [oauthAccounts.userId],
		references: [users.id]
	}),
}));

export const otpCodesRelations = relations(otpCodes, ({one}) => ({
	user: one(users, {
		fields: [otpCodes.userId],
		references: [users.id]
	}),
}));

export const rewardRulesRelations = relations(rewardRules, ({one, many}) => ({
	user: one(users, {
		fields: [rewardRules.updatedBy],
		references: [users.id]
	}),
	rewardRuleVersions: many(rewardRuleVersions),
}));

export const geoPoliciesRelations = relations(geoPolicies, ({one}) => ({
	user: one(users, {
		fields: [geoPolicies.updatedBy],
		references: [users.id]
	}),
}));

export const referralCodesRelations = relations(referralCodes, ({one}) => ({
	user: one(users, {
		fields: [referralCodes.userId],
		references: [users.id]
	}),
}));

export const referralRedemptionsRelations = relations(referralRedemptions, ({one}) => ({
	user_refereeId: one(users, {
		fields: [referralRedemptions.refereeId],
		references: [users.id],
		relationName: "referralRedemptions_refereeId_users_id"
	}),
	user_referrerId: one(users, {
		fields: [referralRedemptions.referrerId],
		references: [users.id],
		relationName: "referralRedemptions_referrerId_users_id"
	}),
}));

export const deviceTokensRelations = relations(deviceTokens, ({one, many}) => ({
	user: one(users, {
		fields: [deviceTokens.userId],
		references: [users.id]
	}),
	deviceTokenTopics: many(deviceTokenTopics),
}));

export const studiosRelations = relations(studios, ({one, many}) => ({
	mediaMetadatum: one(mediaMetadata, {
		fields: [studios.logoMediaId],
		references: [mediaMetadata.id]
	}),
	contents: many(contents),
}));

export const peopleRelations = relations(people, ({one, many}) => ({
	mediaMetadatum: one(mediaMetadata, {
		fields: [people.photoMediaId],
		references: [mediaMetadata.id]
	}),
	contentCasts: many(contentCast),
}));

export const contentsRelations = relations(contents, ({one, many}) => ({
	user_approvedBy: one(users, {
		fields: [contents.approvedBy],
		references: [users.id],
		relationName: "contents_approvedBy_users_id"
	}),
	user_createdBy: one(users, {
		fields: [contents.createdBy],
		references: [users.id],
		relationName: "contents_createdBy_users_id"
	}),
	user_requestedBy: one(users, {
		fields: [contents.requestedBy],
		references: [users.id],
		relationName: "contents_requestedBy_users_id"
	}),
	studio: one(studios, {
		fields: [contents.studioId],
		references: [studios.id]
	}),
	mediaMetadatum_thumbnailMediaId: one(mediaMetadata, {
		fields: [contents.thumbnailMediaId],
		references: [mediaMetadata.id],
		relationName: "contents_thumbnailMediaId_mediaMetadata_id"
	}),
	user_updatedBy: one(users, {
		fields: [contents.updatedBy],
		references: [users.id],
		relationName: "contents_updatedBy_users_id"
	}),
	mediaMetadatum_videoMediaId: one(mediaMetadata, {
		fields: [contents.videoMediaId],
		references: [mediaMetadata.id],
		relationName: "contents_videoMediaId_mediaMetadata_id"
	}),
	contentMedias: many(contentMedia),
	contentChangeHistories: many(contentChangeHistory),
	contentReactions: many(contentReactions),
	comments: many(comments),
	contentShares: many(contentShares),
	contentUnlocks: many(contentUnlocks),
	contentViews: many(contentViews),
	predictions: many(predictions),
	auctions: many(auctions),
	contentTags: many(contentTags),
	questContents: many(questContents),
	contentGenres: many(contentGenres),
	contentWatchlists: many(contentWatchlist),
	questContentProgresses: many(questContentProgress),
	contentCasts: many(contentCast),
	contentProgresses: many(contentProgress),
	contentDailyStats: many(contentDailyStats),
}));

export const contentMediaRelations = relations(contentMedia, ({one}) => ({
	content: one(contents, {
		fields: [contentMedia.contentId],
		references: [contents.id]
	}),
	mediaMetadatum: one(mediaMetadata, {
		fields: [contentMedia.mediaId],
		references: [mediaMetadata.id]
	}),
}));

export const contentChangeHistoryRelations = relations(contentChangeHistory, ({one}) => ({
	user: one(users, {
		fields: [contentChangeHistory.changedBy],
		references: [users.id]
	}),
	content: one(contents, {
		fields: [contentChangeHistory.contentId],
		references: [contents.id]
	}),
}));

export const contentReactionsRelations = relations(contentReactions, ({one}) => ({
	content: one(contents, {
		fields: [contentReactions.contentId],
		references: [contents.id]
	}),
	user: one(users, {
		fields: [contentReactions.userId],
		references: [users.id]
	}),
}));

export const commentsRelations = relations(comments, ({one, many}) => ({
	content: one(contents, {
		fields: [comments.contentId],
		references: [contents.id]
	}),
	comment: one(comments, {
		fields: [comments.parentCommentId],
		references: [comments.id],
		relationName: "comments_parentCommentId_comments_id"
	}),
	comments: many(comments, {
		relationName: "comments_parentCommentId_comments_id"
	}),
	user: one(users, {
		fields: [comments.userId],
		references: [users.id]
	}),
	commentReports: many(commentReports),
	contentModerationLogs: many(contentModerationLog),
	commentReactions: many(commentReactions),
}));

export const commentReportsRelations = relations(commentReports, ({one}) => ({
	comment: one(comments, {
		fields: [commentReports.commentId],
		references: [comments.id]
	}),
	user_reportedBy: one(users, {
		fields: [commentReports.reportedBy],
		references: [users.id],
		relationName: "commentReports_reportedBy_users_id"
	}),
	user_reviewedBy: one(users, {
		fields: [commentReports.reviewedBy],
		references: [users.id],
		relationName: "commentReports_reviewedBy_users_id"
	}),
}));

export const contentSharesRelations = relations(contentShares, ({one}) => ({
	content: one(contents, {
		fields: [contentShares.contentId],
		references: [contents.id]
	}),
	user: one(users, {
		fields: [contentShares.userId],
		references: [users.id]
	}),
}));

export const contentModerationLogRelations = relations(contentModerationLog, ({one}) => ({
	comment: one(comments, {
		fields: [contentModerationLog.commentId],
		references: [comments.id]
	}),
	user: one(users, {
		fields: [contentModerationLog.performedBy],
		references: [users.id]
	}),
}));

export const contentUnlocksRelations = relations(contentUnlocks, ({one}) => ({
	content: one(contents, {
		fields: [contentUnlocks.contentId],
		references: [contents.id]
	}),
	user: one(users, {
		fields: [contentUnlocks.userId],
		references: [users.id]
	}),
}));

export const contentViewsRelations = relations(contentViews, ({one}) => ({
	content: one(contents, {
		fields: [contentViews.contentId],
		references: [contents.id]
	}),
	user: one(users, {
		fields: [contentViews.userId],
		references: [users.id]
	}),
}));

export const rewardRuleVersionsRelations = relations(rewardRuleVersions, ({one, many}) => ({
	user: one(users, {
		fields: [rewardRuleVersions.changedBy],
		references: [users.id]
	}),
	rewardRule: one(rewardRules, {
		fields: [rewardRuleVersions.ruleId],
		references: [rewardRules.id]
	}),
	ledgerTransactions: many(ledgerTransactions),
}));

export const walletsRelations = relations(wallets, ({one}) => ({
	user: one(users, {
		fields: [wallets.userId],
		references: [users.id]
	}),
}));

export const ledgerTransactionsRelations = relations(ledgerTransactions, ({one}) => ({
	rewardRuleVersion: one(rewardRuleVersions, {
		fields: [ledgerTransactions.rewardRuleVersionId],
		references: [rewardRuleVersions.id]
	}),
	user: one(users, {
		fields: [ledgerTransactions.userId],
		references: [users.id]
	}),
}));

export const userStreaksRelations = relations(userStreaks, ({one}) => ({
	user: one(users, {
		fields: [userStreaks.userId],
		references: [users.id]
	}),
}));

export const questsRelations = relations(quests, ({one, many}) => ({
	user: one(users, {
		fields: [quests.createdBy],
		references: [users.id]
	}),
	questContents: many(questContents),
	questContentProgresses: many(questContentProgress),
	questParticipations: many(questParticipations),
}));

export const predictionsRelations = relations(predictions, ({one, many}) => ({
	content: one(contents, {
		fields: [predictions.contentId],
		references: [contents.id]
	}),
	user_createdBy: one(users, {
		fields: [predictions.createdBy],
		references: [users.id],
		relationName: "predictions_createdBy_users_id"
	}),
	user_resolvedBy: one(users, {
		fields: [predictions.resolvedBy],
		references: [users.id],
		relationName: "predictions_resolvedBy_users_id"
	}),
	predictionOptions: many(predictionOptions),
	predictionEntries: many(predictionEntries),
}));

export const predictionOptionsRelations = relations(predictionOptions, ({one, many}) => ({
	mediaMetadatum: one(mediaMetadata, {
		fields: [predictionOptions.optionMediaId],
		references: [mediaMetadata.id]
	}),
	prediction: one(predictions, {
		fields: [predictionOptions.predictionId],
		references: [predictions.id]
	}),
	predictionEntries: many(predictionEntries),
}));

export const predictionEntriesRelations = relations(predictionEntries, ({one}) => ({
	predictionOption: one(predictionOptions, {
		fields: [predictionEntries.optionId],
		references: [predictionOptions.id]
	}),
	prediction: one(predictions, {
		fields: [predictionEntries.predictionId],
		references: [predictions.id]
	}),
	user: one(users, {
		fields: [predictionEntries.userId],
		references: [users.id]
	}),
}));

export const auctionsRelations = relations(auctions, ({one, many}) => ({
	content: one(contents, {
		fields: [auctions.contentId],
		references: [contents.id]
	}),
	user_createdBy: one(users, {
		fields: [auctions.createdBy],
		references: [users.id],
		relationName: "auctions_createdBy_users_id"
	}),
	user_winnerUserId: one(users, {
		fields: [auctions.winnerUserId],
		references: [users.id],
		relationName: "auctions_winnerUserId_users_id"
	}),
	bids: many(bids),
}));

export const bidsRelations = relations(bids, ({one}) => ({
	auction: one(auctions, {
		fields: [bids.auctionId],
		references: [auctions.id]
	}),
	user: one(users, {
		fields: [bids.userId],
		references: [users.id]
	}),
}));

export const rolePermissionsRelations = relations(rolePermissions, ({one}) => ({
	permission: one(permissions, {
		fields: [rolePermissions.permissionId],
		references: [permissions.id]
	}),
	role: one(roles, {
		fields: [rolePermissions.roleId],
		references: [roles.id]
	}),
}));

export const permissionsRelations = relations(permissions, ({many}) => ({
	rolePermissions: many(rolePermissions),
}));

export const rolesRelations = relations(roles, ({many}) => ({
	rolePermissions: many(rolePermissions),
	userRoles: many(userRoles),
}));

export const contentTagsRelations = relations(contentTags, ({one}) => ({
	content: one(contents, {
		fields: [contentTags.contentId],
		references: [contents.id]
	}),
	tag: one(tags, {
		fields: [contentTags.tagId],
		references: [tags.id]
	}),
}));

export const tagsRelations = relations(tags, ({many}) => ({
	contentTags: many(contentTags),
}));

export const questContentsRelations = relations(questContents, ({one}) => ({
	content: one(contents, {
		fields: [questContents.contentId],
		references: [contents.id]
	}),
	quest: one(quests, {
		fields: [questContents.questId],
		references: [quests.id]
	}),
}));

export const deviceTokenTopicsRelations = relations(deviceTokenTopics, ({one}) => ({
	deviceToken: one(deviceTokens, {
		fields: [deviceTokenTopics.deviceTokenId],
		references: [deviceTokens.id]
	}),
}));

export const contentGenresRelations = relations(contentGenres, ({one}) => ({
	content: one(contents, {
		fields: [contentGenres.contentId],
		references: [contents.id]
	}),
	genre: one(genres, {
		fields: [contentGenres.genreId],
		references: [genres.id]
	}),
}));

export const genresRelations = relations(genres, ({many}) => ({
	contentGenres: many(contentGenres),
}));

export const contentWatchlistRelations = relations(contentWatchlist, ({one}) => ({
	content: one(contents, {
		fields: [contentWatchlist.contentId],
		references: [contents.id]
	}),
	user: one(users, {
		fields: [contentWatchlist.userId],
		references: [users.id]
	}),
}));

export const userRolesRelations = relations(userRoles, ({one}) => ({
	user_assignedBy: one(users, {
		fields: [userRoles.assignedBy],
		references: [users.id],
		relationName: "userRoles_assignedBy_users_id"
	}),
	role: one(roles, {
		fields: [userRoles.roleId],
		references: [roles.id]
	}),
	user_userId: one(users, {
		fields: [userRoles.userId],
		references: [users.id],
		relationName: "userRoles_userId_users_id"
	}),
}));

export const commentReactionsRelations = relations(commentReactions, ({one}) => ({
	comment: one(comments, {
		fields: [commentReactions.commentId],
		references: [comments.id]
	}),
	user: one(users, {
		fields: [commentReactions.userId],
		references: [users.id]
	}),
}));

export const questContentProgressRelations = relations(questContentProgress, ({one}) => ({
	content: one(contents, {
		fields: [questContentProgress.contentId],
		references: [contents.id]
	}),
	quest: one(quests, {
		fields: [questContentProgress.questId],
		references: [quests.id]
	}),
	user: one(users, {
		fields: [questContentProgress.userId],
		references: [users.id]
	}),
}));

export const leaderboardMonthlyRelations = relations(leaderboardMonthly, ({one}) => ({
	user: one(users, {
		fields: [leaderboardMonthly.userId],
		references: [users.id]
	}),
}));

export const contentCastRelations = relations(contentCast, ({one}) => ({
	content: one(contents, {
		fields: [contentCast.contentId],
		references: [contents.id]
	}),
	person: one(people, {
		fields: [contentCast.personId],
		references: [people.id]
	}),
}));

export const contentProgressRelations = relations(contentProgress, ({one}) => ({
	content: one(contents, {
		fields: [contentProgress.contentId],
		references: [contents.id]
	}),
	user: one(users, {
		fields: [contentProgress.userId],
		references: [users.id]
	}),
}));

export const questParticipationsRelations = relations(questParticipations, ({one}) => ({
	quest: one(quests, {
		fields: [questParticipations.questId],
		references: [quests.id]
	}),
	user: one(users, {
		fields: [questParticipations.userId],
		references: [users.id]
	}),
}));

export const userDailyActivityRelations = relations(userDailyActivity, ({one}) => ({
	user: one(users, {
		fields: [userDailyActivity.userId],
		references: [users.id]
	}),
}));

export const contentDailyStatsRelations = relations(contentDailyStats, ({one}) => ({
	content: one(contents, {
		fields: [contentDailyStats.contentId],
		references: [contents.id]
	}),
}));