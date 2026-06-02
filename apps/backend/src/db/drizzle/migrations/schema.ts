import { pgTable, index, uniqueIndex, foreignKey, check, uuid, varchar, text, timestamp, integer, boolean, unique, jsonb, primaryKey } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const users = pgTable("users", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	accountType: varchar("account_type", { length: 20 }).default('guest').notNull(),
	email: varchar({ length: 255 }),
	passwordHash: varchar("password_hash", { length: 255 }),
	phone: varchar({ length: 20 }),
	username: varchar({ length: 50 }),
	firstName: varchar("first_name", { length: 100 }),
	lastName: varchar("last_name", { length: 100 }),
	gender: varchar({ length: 20 }),
	avatarUrl: text("avatar_url"),
	primaryAuthMethod: varchar("primary_auth_method", { length: 20 }),
	countryCode: varchar("country_code", { length: 2 }),
	region: varchar({ length: 100 }),
	timezone: varchar({ length: 64 }),
	locationSource: varchar("location_source", { length: 10 }),
	locationUpdatedAt: timestamp("location_updated_at", { withTimezone: true, mode: 'string' }),
	walletAddress: varchar("wallet_address", { length: 64 }),
	tokenVersion: integer("token_version").default(0).notNull(),
	mergedIntoUserId: uuid("merged_into_user_id"),
	status: varchar({ length: 20 }).default('active').notNull(),
	suspendedUntil: timestamp("suspended_until", { withTimezone: true, mode: 'string' }),
	statusReason: varchar("status_reason", { length: 500 }),
	statusChangedBy: uuid("status_changed_by"),
	statusChangedAt: timestamp("status_changed_at", { withTimezone: true, mode: 'string' }),
	isEmailVerified: boolean("is_email_verified").default(false).notNull(),
	isPhoneVerified: boolean("is_phone_verified").default(false).notNull(),
	lastLoginAt: timestamp("last_login_at", { withTimezone: true, mode: 'string' }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	deletedAt: timestamp("deleted_at", { withTimezone: true, mode: 'string' }),
}, (table) => [
	index("idx_users_account_type").using("btree", table.accountType.asc().nullsLast().op("text_ops")).where(sql`(deleted_at IS NULL)`),
	index("idx_users_country_code").using("btree", table.countryCode.asc().nullsLast().op("text_ops")).where(sql`(deleted_at IS NULL)`),
	uniqueIndex("idx_users_email").using("btree", sql`lower((email)::text)`).where(sql`((email IS NOT NULL) AND (deleted_at IS NULL))`),
	uniqueIndex("idx_users_phone").using("btree", table.phone.asc().nullsLast().op("text_ops")).where(sql`((phone IS NOT NULL) AND (deleted_at IS NULL))`),
	index("idx_users_status").using("btree", table.status.asc().nullsLast().op("text_ops")).where(sql`(deleted_at IS NULL)`),
	uniqueIndex("idx_users_username").using("btree", sql`lower((username)::text)`).where(sql`((username IS NOT NULL) AND (deleted_at IS NULL))`),
	foreignKey({
			columns: [table.mergedIntoUserId],
			foreignColumns: [table.id],
			name: "users_merged_into_user_id_fkey"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.statusChangedBy],
			foreignColumns: [table.id],
			name: "users_status_changed_by_fkey"
		}).onDelete("set null"),
	check("users_account_type_check", sql`(account_type)::text = ANY ((ARRAY['guest'::character varying, 'customer'::character varying, 'admin'::character varying])::text[])`),
	check("users_gender_check", sql`(gender)::text = ANY ((ARRAY['male'::character varying, 'female'::character varying, 'other'::character varying, 'prefer_not_to_say'::character varying])::text[])`),
	check("users_primary_auth_method_check", sql`(primary_auth_method)::text = ANY ((ARRAY['phone'::character varying, 'google'::character varying, 'apple'::character varying, 'email'::character varying])::text[])`),
	check("users_location_source_check", sql`(location_source)::text = ANY ((ARRAY['ip'::character varying, 'device'::character varying, 'manual'::character varying])::text[])`),
	check("users_status_check", sql`(status)::text = ANY ((ARRAY['active'::character varying, 'suspended'::character varying, 'banned'::character varying, 'disabled'::character varying])::text[])`),
]);

export const userEnforcementActions = pgTable("user_enforcement_actions", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	action: varchar({ length: 20 }).notNull(),
	reason: varchar({ length: 500 }),
	expiresAt: timestamp("expires_at", { withTimezone: true, mode: 'string' }),
	performedBy: uuid("performed_by"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_user_enforcement_performed_by").using("btree", table.performedBy.asc().nullsLast().op("uuid_ops")),
	index("idx_user_enforcement_user").using("btree", table.userId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "user_enforcement_actions_user_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.performedBy],
			foreignColumns: [users.id],
			name: "user_enforcement_actions_performed_by_fkey"
		}).onDelete("set null"),
	check("user_enforcement_actions_action_check", sql`(action)::text = ANY ((ARRAY['suspend'::character varying, 'ban'::character varying, 'reinstate'::character varying, 'disable'::character varying, 'enable'::character varying])::text[])`),
]);

export const roles = pgTable("roles", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: varchar({ length: 50 }).notNull(),
	description: varchar({ length: 255 }),
	isSystem: boolean("is_system").default(false).notNull(),
	isActive: boolean("is_active").default(true).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	unique("roles_name_key").on(table.name),
]);

export const permissions = pgTable("permissions", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: varchar({ length: 100 }).notNull(),
	description: varchar({ length: 255 }),
	resource: varchar({ length: 100 }).notNull(),
	action: varchar({ length: 50 }).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_permissions_resource_action").using("btree", table.resource.asc().nullsLast().op("text_ops"), table.action.asc().nullsLast().op("text_ops")),
	unique("permissions_name_key").on(table.name),
]);

export const oauthAccounts = pgTable("oauth_accounts", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	provider: varchar({ length: 20 }).notNull(),
	providerUserId: varchar("provider_user_id", { length: 255 }).notNull(),
	email: varchar({ length: 255 }),
	rawProfile: jsonb("raw_profile"),
	accessTokenEncrypted: text("access_token_encrypted"),
	refreshTokenEncrypted: text("refresh_token_encrypted"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	uniqueIndex("idx_oauth_accounts_provider_user").using("btree", table.provider.asc().nullsLast().op("text_ops"), table.providerUserId.asc().nullsLast().op("text_ops")),
	index("idx_oauth_accounts_user_id").using("btree", table.userId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "oauth_accounts_user_id_fkey"
		}).onDelete("cascade"),
	check("oauth_accounts_provider_check", sql`(provider)::text = ANY ((ARRAY['google'::character varying, 'apple'::character varying])::text[])`),
]);

export const otpCodes = pgTable("otp_codes", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id"),
	destination: varchar({ length: 255 }).notNull(),
	channel: varchar({ length: 10 }).notNull(),
	purpose: varchar({ length: 30 }).notNull(),
	codeHash: varchar("code_hash", { length: 255 }).notNull(),
	expiresAt: timestamp("expires_at", { withTimezone: true, mode: 'string' }).notNull(),
	consumedAt: timestamp("consumed_at", { withTimezone: true, mode: 'string' }),
	attempts: integer().default(0).notNull(),
	maxAttempts: integer("max_attempts").default(5).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_otp_codes_destination_purpose").using("btree", table.destination.asc().nullsLast().op("text_ops"), table.purpose.asc().nullsLast().op("text_ops")).where(sql`(consumed_at IS NULL)`),
	index("idx_otp_codes_expires_at").using("btree", table.expiresAt.asc().nullsLast().op("timestamptz_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "otp_codes_user_id_fkey"
		}).onDelete("cascade"),
	check("otp_codes_channel_check", sql`(channel)::text = ANY ((ARRAY['sms'::character varying, 'email'::character varying])::text[])`),
	check("otp_codes_purpose_check", sql`(purpose)::text = ANY ((ARRAY['login'::character varying, 'phone_verification'::character varying, 'email_verification'::character varying, 'password_reset'::character varying])::text[])`),
]);

export const rewardRules = pgTable("reward_rules", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	ruleKey: varchar("rule_key", { length: 50 }).notNull(),
	name: varchar({ length: 150 }).notNull(),
	description: varchar({ length: 500 }),
	isEnabled: boolean("is_enabled").default(true).notNull(),
	config: jsonb().default({}).notNull(),
	updatedBy: uuid("updated_by"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_reward_rules_enabled").using("btree", table.isEnabled.asc().nullsLast().op("bool_ops")),
	foreignKey({
			columns: [table.updatedBy],
			foreignColumns: [users.id],
			name: "reward_rules_updated_by_fkey"
		}).onDelete("set null"),
	unique("reward_rules_rule_key_key").on(table.ruleKey),
]);

export const geoPolicies = pgTable("geo_policies", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	countryCode: varchar("country_code", { length: 2 }),
	isDefault: boolean("is_default").default(false).notNull(),
	isSupported: boolean("is_supported").default(true).notNull(),
	tokenomicsEnabled: boolean("tokenomics_enabled").default(true).notNull(),
	onchainRewardsEnabled: boolean("onchain_rewards_enabled").default(false).notNull(),
	subscriptionRequired: boolean("subscription_required").default(true).notNull(),
	config: jsonb().default({}).notNull(),
	notes: varchar({ length: 500 }),
	updatedBy: uuid("updated_by"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	uniqueIndex("idx_geo_policies_country").using("btree", table.countryCode.asc().nullsLast().op("text_ops")).where(sql`(country_code IS NOT NULL)`),
	uniqueIndex("idx_geo_policies_default").using("btree", table.isDefault.asc().nullsLast().op("bool_ops")).where(sql`is_default`),
	foreignKey({
			columns: [table.updatedBy],
			foreignColumns: [users.id],
			name: "geo_policies_updated_by_fkey"
		}).onDelete("set null"),
]);

export const referralCodes = pgTable("referral_codes", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	code: varchar({ length: 20 }).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "referral_codes_user_id_fkey"
		}).onDelete("cascade"),
	unique("referral_codes_user_id_key").on(table.userId),
	unique("referral_codes_code_key").on(table.code),
]);

export const referralRedemptions = pgTable("referral_redemptions", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	code: varchar({ length: 20 }).notNull(),
	referrerId: uuid("referrer_id").notNull(),
	refereeId: uuid("referee_id").notNull(),
	status: varchar({ length: 20 }).default('pending').notNull(),
	rewardedAt: timestamp("rewarded_at", { withTimezone: true, mode: 'string' }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_referral_redemptions_referrer").using("btree", table.referrerId.asc().nullsLast().op("uuid_ops")),
	index("idx_referral_redemptions_status").using("btree", table.status.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.referrerId],
			foreignColumns: [users.id],
			name: "referral_redemptions_referrer_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.refereeId],
			foreignColumns: [users.id],
			name: "referral_redemptions_referee_id_fkey"
		}).onDelete("cascade"),
	unique("referral_redemptions_referee_id_key").on(table.refereeId),
	check("referral_redemptions_status_check", sql`(status)::text = ANY ((ARRAY['pending'::character varying, 'qualified'::character varying, 'rewarded'::character varying, 'reverted'::character varying])::text[])`),
	check("referral_redemptions_check", sql`referrer_id <> referee_id`),
]);

export const deviceTokens = pgTable("device_tokens", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	fcmToken: text("fcm_token").notNull(),
	platform: varchar({ length: 10 }).notNull(),
	deviceId: varchar("device_id", { length: 255 }),
	appVersion: varchar("app_version", { length: 20 }),
	isActive: boolean("is_active").default(true).notNull(),
	lastSeenAt: timestamp("last_seen_at", { withTimezone: true, mode: 'string' }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	uniqueIndex("idx_device_tokens_fcm").using("btree", table.fcmToken.asc().nullsLast().op("text_ops")),
	index("idx_device_tokens_user").using("btree", table.userId.asc().nullsLast().op("uuid_ops")).where(sql`is_active`),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "device_tokens_user_id_fkey"
		}).onDelete("cascade"),
	check("device_tokens_platform_check", sql`(platform)::text = ANY ((ARRAY['ios'::character varying, 'android'::character varying, 'web'::character varying])::text[])`),
]);

export const rolePermissions = pgTable("role_permissions", {
	roleId: uuid("role_id").notNull(),
	permissionId: uuid("permission_id").notNull(),
}, (table) => [
	index("idx_role_permissions_role_id").using("btree", table.roleId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.roleId],
			foreignColumns: [roles.id],
			name: "role_permissions_role_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.permissionId],
			foreignColumns: [permissions.id],
			name: "role_permissions_permission_id_fkey"
		}).onDelete("cascade"),
	primaryKey({ columns: [table.roleId, table.permissionId], name: "role_permissions_pkey"}),
]);

export const deviceTokenTopics = pgTable("device_token_topics", {
	deviceTokenId: uuid("device_token_id").notNull(),
	topic: varchar({ length: 100 }).notNull(),
	subscribedAt: timestamp("subscribed_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_device_token_topics_topic").using("btree", table.topic.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.deviceTokenId],
			foreignColumns: [deviceTokens.id],
			name: "device_token_topics_device_token_id_fkey"
		}).onDelete("cascade"),
	primaryKey({ columns: [table.deviceTokenId, table.topic], name: "device_token_topics_pkey"}),
]);

export const userRoles = pgTable("user_roles", {
	userId: uuid("user_id").notNull(),
	roleId: uuid("role_id").notNull(),
	assignedBy: uuid("assigned_by"),
	assignedAt: timestamp("assigned_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_user_roles_role_id").using("btree", table.roleId.asc().nullsLast().op("uuid_ops")),
	index("idx_user_roles_user_id").using("btree", table.userId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "user_roles_user_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.roleId],
			foreignColumns: [roles.id],
			name: "user_roles_role_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.assignedBy],
			foreignColumns: [users.id],
			name: "user_roles_assigned_by_fkey"
		}).onDelete("set null"),
	primaryKey({ columns: [table.userId, table.roleId], name: "user_roles_pkey"}),
]);
