import { relations } from "drizzle-orm/relations";
import { users, userEnforcementActions, oauthAccounts, otpCodes, rewardRules, geoPolicies, referralCodes, referralRedemptions, deviceTokens, roles, rolePermissions, permissions, deviceTokenTopics, userRoles } from "./schema";

export const usersRelations = relations(users, ({one, many}) => ({
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
	userEnforcementActions_userId: many(userEnforcementActions, {
		relationName: "userEnforcementActions_userId_users_id"
	}),
	userEnforcementActions_performedBy: many(userEnforcementActions, {
		relationName: "userEnforcementActions_performedBy_users_id"
	}),
	oauthAccounts: many(oauthAccounts),
	otpCodes: many(otpCodes),
	rewardRules: many(rewardRules),
	geoPolicies: many(geoPolicies),
	referralCodes: many(referralCodes),
	referralRedemptions_referrerId: many(referralRedemptions, {
		relationName: "referralRedemptions_referrerId_users_id"
	}),
	referralRedemptions_refereeId: many(referralRedemptions, {
		relationName: "referralRedemptions_refereeId_users_id"
	}),
	deviceTokens: many(deviceTokens),
	userRoles_userId: many(userRoles, {
		relationName: "userRoles_userId_users_id"
	}),
	userRoles_assignedBy: many(userRoles, {
		relationName: "userRoles_assignedBy_users_id"
	}),
}));

export const userEnforcementActionsRelations = relations(userEnforcementActions, ({one}) => ({
	user_userId: one(users, {
		fields: [userEnforcementActions.userId],
		references: [users.id],
		relationName: "userEnforcementActions_userId_users_id"
	}),
	user_performedBy: one(users, {
		fields: [userEnforcementActions.performedBy],
		references: [users.id],
		relationName: "userEnforcementActions_performedBy_users_id"
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

export const rewardRulesRelations = relations(rewardRules, ({one}) => ({
	user: one(users, {
		fields: [rewardRules.updatedBy],
		references: [users.id]
	}),
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
	user_referrerId: one(users, {
		fields: [referralRedemptions.referrerId],
		references: [users.id],
		relationName: "referralRedemptions_referrerId_users_id"
	}),
	user_refereeId: one(users, {
		fields: [referralRedemptions.refereeId],
		references: [users.id],
		relationName: "referralRedemptions_refereeId_users_id"
	}),
}));

export const deviceTokensRelations = relations(deviceTokens, ({one, many}) => ({
	user: one(users, {
		fields: [deviceTokens.userId],
		references: [users.id]
	}),
	deviceTokenTopics: many(deviceTokenTopics),
}));

export const rolePermissionsRelations = relations(rolePermissions, ({one}) => ({
	role: one(roles, {
		fields: [rolePermissions.roleId],
		references: [roles.id]
	}),
	permission: one(permissions, {
		fields: [rolePermissions.permissionId],
		references: [permissions.id]
	}),
}));

export const rolesRelations = relations(roles, ({many}) => ({
	rolePermissions: many(rolePermissions),
	userRoles: many(userRoles),
}));

export const permissionsRelations = relations(permissions, ({many}) => ({
	rolePermissions: many(rolePermissions),
}));

export const deviceTokenTopicsRelations = relations(deviceTokenTopics, ({one}) => ({
	deviceToken: one(deviceTokens, {
		fields: [deviceTokenTopics.deviceTokenId],
		references: [deviceTokens.id]
	}),
}));

export const userRolesRelations = relations(userRoles, ({one}) => ({
	user_userId: one(users, {
		fields: [userRoles.userId],
		references: [users.id],
		relationName: "userRoles_userId_users_id"
	}),
	role: one(roles, {
		fields: [userRoles.roleId],
		references: [roles.id]
	}),
	user_assignedBy: one(users, {
		fields: [userRoles.assignedBy],
		references: [users.id],
		relationName: "userRoles_assignedBy_users_id"
	}),
}));