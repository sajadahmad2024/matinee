import { pgTable, foreignKey, check, varchar, boolean, uuid, timestamp, index, integer, bigint, jsonb, unique, text, date, uniqueIndex, numeric, primaryKey } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const gameWidgetConfigs = pgTable("game_widget_configs", {
	gameKey: varchar("game_key", { length: 30 }).primaryKey().notNull(),
	isVisible: boolean("is_visible").default(true).notNull(),
	widgetStyle: varchar("widget_style", { length: 20 }).default('card').notNull(),
	ctaLabel: varchar("cta_label", { length: 80 }),
	accentColor: varchar("accent_color", { length: 9 }),
	bannerMediaId: uuid("banner_media_id"),
	updatedBy: uuid("updated_by"),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.bannerMediaId],
			foreignColumns: [mediaMetadata.id],
			name: "game_widget_configs_banner_media_id_fkey"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.updatedBy],
			foreignColumns: [users.id],
			name: "game_widget_configs_updated_by_fkey"
		}).onDelete("set null"),
	check("game_widget_configs_game_key_check", sql`(game_key)::text = ANY ((ARRAY['daily_streak'::character varying, 'quest'::character varying, 'shared_content'::character varying, 'prediction'::character varying, 'bidding'::character varying])::text[])`),
	check("game_widget_configs_widget_style_check", sql`(widget_style)::text = ANY ((ARRAY['card'::character varying, 'hero'::character varying, 'carousel'::character varying])::text[])`),
]);

export const contentSponsorships = pgTable("content_sponsorships", {
	id: uuid().default(sql`uuidv7()`).primaryKey().notNull(),
	contentId: uuid("content_id").notNull(),
	sponsorName: varchar("sponsor_name", { length: 200 }).notNull(),
	bannerMediaId: uuid("banner_media_id"),
	adDurationSeconds: integer("ad_duration_seconds").default(0).notNull(),
	placement: varchar({ length: 20 }).default('pre-roll').notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	revenueCents: bigint("revenue_cents", { mode: "number" }).default(0).notNull(),
	currency: varchar({ length: 3 }).default('USD').notNull(),
	startsAt: timestamp("starts_at", { withTimezone: true, mode: 'string' }),
	endsAt: timestamp("ends_at", { withTimezone: true, mode: 'string' }),
	isActive: boolean("is_active").default(true).notNull(),
	createdBy: uuid("created_by"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	adFormat: varchar("ad_format", { length: 20 }).default('sponsored').notNull(),
	feedFrequency: integer("feed_frequency"),
	skippableAfterSeconds: integer("skippable_after_seconds"),
}, (table) => [
	index("idx_content_sponsorships_commercial").using("btree", table.contentId.asc().nullsLast().op("uuid_ops")).where(sql`(is_active AND ((ad_format)::text = 'commercial'::text))`),
	index("idx_content_sponsorships_content").using("btree", table.contentId.asc().nullsLast().op("uuid_ops")).where(sql`is_active`),
	foreignKey({
			columns: [table.contentId],
			foreignColumns: [contents.id],
			name: "content_sponsorships_content_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.bannerMediaId],
			foreignColumns: [mediaMetadata.id],
			name: "content_sponsorships_banner_media_id_fkey"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.createdBy],
			foreignColumns: [users.id],
			name: "content_sponsorships_created_by_fkey"
		}).onDelete("set null"),
	check("content_sponsorships_placement_check", sql`(placement)::text = ANY ((ARRAY['pre-roll'::character varying, 'mid-roll'::character varying, 'post-roll'::character varying, 'overlay'::character varying])::text[])`),
	check("content_sponsorships_ad_format_check", sql`(ad_format)::text = ANY ((ARRAY['sponsored'::character varying, 'commercial'::character varying])::text[])`),
]);

export const contentLicenses = pgTable("content_licenses", {
	id: uuid().default(sql`uuidv7()`).primaryKey().notNull(),
	contentId: uuid("content_id").notNull(),
	licensorName: varchar("licensor_name", { length: 200 }).notNull(),
	licenseType: varchar("license_type", { length: 20 }).default('non_exclusive').notNull(),
	startsAt: timestamp("starts_at", { withTimezone: true, mode: 'string' }),
	expiresAt: timestamp("expires_at", { withTimezone: true, mode: 'string' }),
	renewalStatus: varchar("renewal_status", { length: 20 }).default('renewing').notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	licenseCostCents: bigint("license_cost_cents", { mode: "number" }).default(0).notNull(),
	currency: varchar({ length: 3 }).default('USD').notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	revenueGeneratedCents: bigint("revenue_generated_cents", { mode: "number" }).default(0).notNull(),
	revenueSource: varchar("revenue_source", { length: 100 }),
	terms: varchar({ length: 500 }),
	isActive: boolean("is_active").default(true).notNull(),
	createdBy: uuid("created_by"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_content_licenses_content").using("btree", table.contentId.asc().nullsLast().op("uuid_ops")).where(sql`is_active`),
	index("idx_content_licenses_expiry").using("btree", table.expiresAt.asc().nullsLast().op("timestamptz_ops")).where(sql`is_active`),
	foreignKey({
			columns: [table.contentId],
			foreignColumns: [contents.id],
			name: "content_licenses_content_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.createdBy],
			foreignColumns: [users.id],
			name: "content_licenses_created_by_fkey"
		}).onDelete("set null"),
	check("content_licenses_license_type_check", sql`(license_type)::text = ANY ((ARRAY['exclusive'::character varying, 'non_exclusive'::character varying])::text[])`),
	check("content_licenses_renewal_status_check", sql`(renewal_status)::text = ANY ((ARRAY['renewing'::character varying, 'in_negotiation'::character varying, 'expiring'::character varying, 'lapsed'::character varying, 'auto_renew'::character varying])::text[])`),
]);

export const subscriptionPlans = pgTable("subscription_plans", {
	id: uuid().default(sql`uuidv7()`).primaryKey().notNull(),
	name: varchar({ length: 150 }).notNull(),
	description: varchar({ length: 500 }),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	basePriceCents: bigint("base_price_cents", { mode: "number" }).default(0).notNull(),
	baseCurrency: varchar("base_currency", { length: 3 }).default('USD').notNull(),
	interval: varchar({ length: 10 }).default('monthly').notNull(),
	trialDays: integer("trial_days").default(0).notNull(),
	features: jsonb().default([]).notNull(),
	isActive: boolean("is_active").default(true).notNull(),
	isPopular: boolean("is_popular").default(false).notNull(),
	sortOrder: integer("sort_order").default(0).notNull(),
	provider: varchar({ length: 20 }).default('stripe').notNull(),
	providerProductId: varchar("provider_product_id", { length: 120 }),
	createdBy: uuid("created_by"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	deletedAt: timestamp("deleted_at", { withTimezone: true, mode: 'string' }),
}, (table) => [
	index("idx_subscription_plans_active").using("btree", table.isActive.asc().nullsLast().op("bool_ops")).where(sql`(deleted_at IS NULL)`),
	foreignKey({
			columns: [table.createdBy],
			foreignColumns: [users.id],
			name: "subscription_plans_created_by_fkey"
		}).onDelete("set null"),
	check("subscription_plans_interval_check", sql`("interval")::text = ANY ((ARRAY['monthly'::character varying, 'yearly'::character varying])::text[])`),
]);

export const planRegionPrices = pgTable("plan_region_prices", {
	id: uuid().default(sql`uuidv7()`).primaryKey().notNull(),
	planId: uuid("plan_id").notNull(),
	region: varchar({ length: 10 }).notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	priceCents: bigint("price_cents", { mode: "number" }).notNull(),
	currency: varchar({ length: 3 }).default('USD').notNull(),
	providerPriceId: varchar("provider_price_id", { length: 120 }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_plan_region_prices_plan").using("btree", table.planId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.planId],
			foreignColumns: [subscriptionPlans.id],
			name: "plan_region_prices_plan_id_fkey"
		}).onDelete("cascade"),
	unique("plan_region_prices_plan_id_region_key").on(table.planId, table.region),
	check("plan_region_prices_region_check", sql`(region)::text = ANY ((ARRAY['NA'::character varying, 'EU'::character varying, 'APAC'::character varying, 'LATAM'::character varying, 'MEA'::character varying])::text[])`),
]);

export const subscriptions = pgTable("subscriptions", {
	id: uuid().default(sql`uuidv7()`).primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	planId: uuid("plan_id"),
	status: varchar({ length: 20 }).default('active').notNull(),
	region: varchar({ length: 10 }),
	countryCode: varchar("country_code", { length: 2 }),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	amountCents: bigint("amount_cents", { mode: "number" }).default(0).notNull(),
	currency: varchar({ length: 3 }).default('USD').notNull(),
	startedAt: timestamp("started_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	currentPeriodStart: timestamp("current_period_start", { withTimezone: true, mode: 'string' }),
	currentPeriodEnd: timestamp("current_period_end", { withTimezone: true, mode: 'string' }),
	trialEndAt: timestamp("trial_end_at", { withTimezone: true, mode: 'string' }),
	canceledAt: timestamp("canceled_at", { withTimezone: true, mode: 'string' }),
	cancelReason: varchar("cancel_reason", { length: 200 }),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	ltvCents: bigint("ltv_cents", { mode: "number" }).default(0).notNull(),
	provider: varchar({ length: 20 }).default('stripe').notNull(),
	providerSubscriptionId: varchar("provider_subscription_id", { length: 120 }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_subscriptions_plan").using("btree", table.planId.asc().nullsLast().op("uuid_ops")),
	index("idx_subscriptions_region").using("btree", table.region.asc().nullsLast().op("text_ops")),
	index("idx_subscriptions_status").using("btree", table.status.asc().nullsLast().op("text_ops")),
	index("idx_subscriptions_user").using("btree", table.userId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "subscriptions_user_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.planId],
			foreignColumns: [subscriptionPlans.id],
			name: "subscriptions_plan_id_fkey"
		}).onDelete("set null"),
	check("subscriptions_status_check", sql`(status)::text = ANY ((ARRAY['trialing'::character varying, 'active'::character varying, 'past_due'::character varying, 'canceled'::character varying, 'unpaid'::character varying])::text[])`),
	check("subscriptions_region_check", sql`(region)::text = ANY ((ARRAY['NA'::character varying, 'EU'::character varying, 'APAC'::character varying, 'LATAM'::character varying, 'MEA'::character varying])::text[])`),
]);

export const subscriptionInvoices = pgTable("subscription_invoices", {
	id: uuid().default(sql`uuidv7()`).primaryKey().notNull(),
	subscriptionId: uuid("subscription_id"),
	userId: uuid("user_id").notNull(),
	invoiceNumber: varchar("invoice_number", { length: 60 }).notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	amountCents: bigint("amount_cents", { mode: "number" }).notNull(),
	currency: varchar({ length: 3 }).default('USD').notNull(),
	region: varchar({ length: 10 }),
	status: varchar({ length: 20 }).default('pending').notNull(),
	paymentMethod: varchar("payment_method", { length: 30 }),
	platform: varchar({ length: 20 }),
	billedAt: timestamp("billed_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	paidAt: timestamp("paid_at", { withTimezone: true, mode: 'string' }),
	refundedAt: timestamp("refunded_at", { withTimezone: true, mode: 'string' }),
	provider: varchar({ length: 20 }).default('stripe').notNull(),
	providerInvoiceId: varchar("provider_invoice_id", { length: 120 }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_sub_invoices_region").using("btree", table.region.asc().nullsLast().op("text_ops")),
	index("idx_sub_invoices_status").using("btree", table.status.asc().nullsLast().op("text_ops"), table.billedAt.desc().nullsFirst().op("text_ops")),
	index("idx_sub_invoices_subscription").using("btree", table.subscriptionId.asc().nullsLast().op("uuid_ops")),
	index("idx_sub_invoices_user").using("btree", table.userId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.subscriptionId],
			foreignColumns: [subscriptions.id],
			name: "subscription_invoices_subscription_id_fkey"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "subscription_invoices_user_id_fkey"
		}).onDelete("cascade"),
	unique("subscription_invoices_invoice_number_key").on(table.invoiceNumber),
	check("subscription_invoices_region_check", sql`(region)::text = ANY ((ARRAY['NA'::character varying, 'EU'::character varying, 'APAC'::character varying, 'LATAM'::character varying, 'MEA'::character varying])::text[])`),
	check("subscription_invoices_status_check", sql`(status)::text = ANY ((ARRAY['paid'::character varying, 'failed'::character varying, 'refunded'::character varying, 'pending'::character varying])::text[])`),
]);

export const moderationTickets = pgTable("moderation_tickets", {
	id: uuid().default(sql`uuidv7()`).primaryKey().notNull(),
	subjectType: varchar("subject_type", { length: 20 }).notNull(),
	subjectId: uuid("subject_id"),
	offenderUserId: uuid("offender_user_id"),
	severity: varchar({ length: 10 }).default('low').notNull(),
	category: varchar({ length: 20 }).default('other').notNull(),
	contentSnapshot: text("content_snapshot"),
	reportCount: integer("report_count").default(1).notNull(),
	isRepeatOffender: boolean("is_repeat_offender").default(false).notNull(),
	status: varchar({ length: 20 }).default('open').notNull(),
	assignedTo: uuid("assigned_to"),
	resolution: varchar({ length: 30 }),
	resolutionNote: varchar("resolution_note", { length: 500 }),
	resolvedBy: uuid("resolved_by"),
	resolvedAt: timestamp("resolved_at", { withTimezone: true, mode: 'string' }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_moderation_tickets_offender").using("btree", table.offenderUserId.asc().nullsLast().op("uuid_ops")),
	index("idx_moderation_tickets_queue").using("btree", table.status.asc().nullsLast().op("text_ops"), table.severity.asc().nullsLast().op("text_ops")).where(sql`((status)::text = ANY ((ARRAY['open'::character varying, 'in_review'::character varying, 'escalated'::character varying])::text[]))`),
	index("idx_moderation_tickets_subject").using("btree", table.subjectType.asc().nullsLast().op("uuid_ops"), table.subjectId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.offenderUserId],
			foreignColumns: [users.id],
			name: "moderation_tickets_offender_user_id_fkey"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.assignedTo],
			foreignColumns: [users.id],
			name: "moderation_tickets_assigned_to_fkey"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.resolvedBy],
			foreignColumns: [users.id],
			name: "moderation_tickets_resolved_by_fkey"
		}).onDelete("set null"),
	check("moderation_tickets_subject_type_check", sql`(subject_type)::text = ANY ((ARRAY['comment'::character varying, 'content'::character varying, 'user'::character varying])::text[])`),
	check("moderation_tickets_severity_check", sql`(severity)::text = ANY ((ARRAY['high'::character varying, 'medium'::character varying, 'low'::character varying])::text[])`),
	check("moderation_tickets_category_check", sql`(category)::text = ANY ((ARRAY['hate_speech'::character varying, 'spam'::character varying, 'nudity'::character varying, 'harassment'::character varying, 'other'::character varying])::text[])`),
	check("moderation_tickets_status_check", sql`(status)::text = ANY ((ARRAY['open'::character varying, 'in_review'::character varying, 'resolved'::character varying, 'dismissed'::character varying, 'escalated'::character varying])::text[])`),
	check("moderation_tickets_resolution_check", sql`(resolution)::text = ANY ((ARRAY['content_removed'::character varying, 'user_warned'::character varying, 'user_suspended'::character varying, 'user_banned'::character varying, 'no_action'::character varying])::text[])`),
]);

export const moderationReports = pgTable("moderation_reports", {
	id: uuid().default(sql`uuidv7()`).primaryKey().notNull(),
	ticketId: uuid("ticket_id").notNull(),
	reporterUserId: uuid("reporter_user_id"),
	reason: varchar({ length: 20 }).default('other').notNull(),
	note: varchar({ length: 500 }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_moderation_reports_ticket").using("btree", table.ticketId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.ticketId],
			foreignColumns: [moderationTickets.id],
			name: "moderation_reports_ticket_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.reporterUserId],
			foreignColumns: [users.id],
			name: "moderation_reports_reporter_user_id_fkey"
		}).onDelete("set null"),
	check("moderation_reports_reason_check", sql`(reason)::text = ANY ((ARRAY['hate_speech'::character varying, 'spam'::character varying, 'nudity'::character varying, 'harassment'::character varying, 'other'::character varying])::text[])`),
]);

export const adminAuditLog = pgTable("admin_audit_log", {
	id: uuid().default(sql`uuidv7()`).primaryKey().notNull(),
	actorId: uuid("actor_id"),
	actorLabel: varchar("actor_label", { length: 150 }),
	action: varchar({ length: 80 }).notNull(),
	targetType: varchar("target_type", { length: 40 }),
	targetId: uuid("target_id"),
	targetLabel: varchar("target_label", { length: 200 }),
	metadata: jsonb().default({}).notNull(),
	ipAddress: varchar("ip_address", { length: 45 }),
	userAgent: varchar("user_agent", { length: 300 }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_admin_audit_log_actor").using("btree", table.actorId.asc().nullsLast().op("timestamptz_ops"), table.createdAt.desc().nullsFirst().op("timestamptz_ops")),
	index("idx_admin_audit_log_target").using("btree", table.targetType.asc().nullsLast().op("text_ops"), table.targetId.asc().nullsLast().op("text_ops")),
	index("idx_admin_audit_log_time").using("btree", table.createdAt.desc().nullsFirst().op("timestamptz_ops")),
	foreignKey({
			columns: [table.actorId],
			foreignColumns: [users.id],
			name: "admin_audit_log_actor_id_fkey"
		}).onDelete("set null"),
]);

export const appVersions = pgTable("app_versions", {
	id: uuid().default(sql`uuidv7()`).primaryKey().notNull(),
	platform: varchar({ length: 10 }).notNull(),
	version: varchar({ length: 20 }).notNull(),
	isSupported: boolean("is_supported").default(true).notNull(),
	forceUpdate: boolean("force_update").default(false).notNull(),
	isLatest: boolean("is_latest").default(false).notNull(),
	updateMessage: varchar("update_message", { length: 300 }),
	releasedAt: timestamp("released_at", { withTimezone: true, mode: 'string' }),
	createdBy: uuid("created_by"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_app_versions_platform").using("btree", table.platform.asc().nullsLast().op("text_ops"), table.forceUpdate.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.createdBy],
			foreignColumns: [users.id],
			name: "app_versions_created_by_fkey"
		}).onDelete("set null"),
	unique("app_versions_platform_version_key").on(table.platform, table.version),
	check("app_versions_platform_check", sql`(platform)::text = ANY ((ARRAY['ios'::character varying, 'android'::character varying])::text[])`),
]);

export const appSettings = pgTable("app_settings", {
	key: varchar({ length: 80 }).primaryKey().notNull(),
	value: jsonb().notNull(),
	category: varchar({ length: 40 }).default('general').notNull(),
	description: varchar({ length: 300 }),
	updatedBy: uuid("updated_by"),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_app_settings_category").using("btree", table.category.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.updatedBy],
			foreignColumns: [users.id],
			name: "app_settings_updated_by_fkey"
		}).onDelete("set null"),
	check("app_settings_category_check", sql`(category)::text = ANY ((ARRAY['general'::character varying, 'security'::character varying, 'feature_flag'::character varying, 'economy'::character varying, 'notifications'::character varying])::text[])`),
]);

export const notificationCampaigns = pgTable("notification_campaigns", {
	id: uuid().default(sql`uuidv7()`).primaryKey().notNull(),
	title: varchar({ length: 150 }).notNull(),
	message: varchar({ length: 500 }).notNull(),
	deepLink: varchar("deep_link", { length: 300 }),
	targetType: varchar("target_type", { length: 20 }).default('all').notNull(),
	targetFilter: jsonb("target_filter").default({}).notNull(),
	status: varchar({ length: 20 }).default('draft').notNull(),
	scheduledAt: timestamp("scheduled_at", { withTimezone: true, mode: 'string' }),
	sentAt: timestamp("sent_at", { withTimezone: true, mode: 'string' }),
	recipientCount: integer("recipient_count").default(0).notNull(),
	deliveredCount: integer("delivered_count").default(0).notNull(),
	openedCount: integer("opened_count").default(0).notNull(),
	createdBy: uuid("created_by"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_notification_campaigns_status").using("btree", table.status.asc().nullsLast().op("text_ops"), table.scheduledAt.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.createdBy],
			foreignColumns: [users.id],
			name: "notification_campaigns_created_by_fkey"
		}).onDelete("set null"),
	check("notification_campaigns_target_type_check", sql`(target_type)::text = ANY ((ARRAY['all'::character varying, 'segment'::character varying, 'selected'::character varying])::text[])`),
	check("notification_campaigns_status_check", sql`(status)::text = ANY ((ARRAY['draft'::character varying, 'scheduled'::character varying, 'sending'::character varying, 'sent'::character varying, 'failed'::character varying, 'canceled'::character varying])::text[])`),
]);

export const notificationDeliveries = pgTable("notification_deliveries", {
	id: uuid().default(sql`uuidv7()`).primaryKey().notNull(),
	campaignId: uuid("campaign_id").notNull(),
	userId: uuid("user_id"),
	deviceTokenId: uuid("device_token_id"),
	status: varchar({ length: 20 }).default('queued').notNull(),
	error: varchar({ length: 300 }),
	sentAt: timestamp("sent_at", { withTimezone: true, mode: 'string' }),
	openedAt: timestamp("opened_at", { withTimezone: true, mode: 'string' }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_notification_deliveries_campaign").using("btree", table.campaignId.asc().nullsLast().op("uuid_ops")),
	index("idx_notification_deliveries_user").using("btree", table.userId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.campaignId],
			foreignColumns: [notificationCampaigns.id],
			name: "notification_deliveries_campaign_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "notification_deliveries_user_id_fkey"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.deviceTokenId],
			foreignColumns: [deviceTokens.id],
			name: "notification_deliveries_device_token_id_fkey"
		}).onDelete("set null"),
	check("notification_deliveries_status_check", sql`(status)::text = ANY ((ARRAY['queued'::character varying, 'sent'::character varying, 'delivered'::character varying, 'opened'::character varying, 'failed'::character varying])::text[])`),
]);

export const userSessions = pgTable("user_sessions", {
	id: uuid().default(sql`uuidv7()`).primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	startedAt: timestamp("started_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	endedAt: timestamp("ended_at", { withTimezone: true, mode: 'string' }),
	durationSeconds: integer("duration_seconds"),
	foregroundCount: integer("foreground_count").default(1).notNull(),
	videosViewed: integer("videos_viewed").default(0).notNull(),
	pointsEarned: integer("points_earned").default(0).notNull(),
	isGamified: boolean("is_gamified").default(false).notNull(),
	countryCode: varchar("country_code", { length: 2 }),
	region: varchar({ length: 10 }),
	platform: varchar({ length: 20 }),
	appVersion: varchar("app_version", { length: 20 }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_user_sessions_region").using("btree", table.region.asc().nullsLast().op("text_ops")),
	index("idx_user_sessions_time").using("btree", table.startedAt.asc().nullsLast().op("timestamptz_ops")),
	index("idx_user_sessions_user").using("btree", table.userId.asc().nullsLast().op("timestamptz_ops"), table.startedAt.desc().nullsFirst().op("timestamptz_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "user_sessions_user_id_fkey"
		}).onDelete("cascade"),
	check("user_sessions_region_check", sql`(region)::text = ANY ((ARRAY['NA'::character varying, 'EU'::character varying, 'APAC'::character varying, 'LATAM'::character varying, 'MEA'::character varying])::text[])`),
]);

export const marketingSpend = pgTable("marketing_spend", {
	id: uuid().default(sql`uuidv7()`).primaryKey().notNull(),
	channel: varchar({ length: 30 }).notNull(),
	periodMonth: date("period_month").notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	spendCents: bigint("spend_cents", { mode: "number" }).default(0).notNull(),
	currency: varchar({ length: 3 }).default('USD').notNull(),
	newUsers: integer("new_users").default(0).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	unique("marketing_spend_channel_period_month_key").on(table.channel, table.periodMonth),
	check("marketing_spend_channel_check", sql`(channel)::text = ANY ((ARRAY['organic'::character varying, 'paid_social'::character varying, 'referral'::character varying, 'influencer'::character varying, 'search'::character varying, 'other'::character varying])::text[])`),
]);

export const socialMentions = pgTable("social_mentions", {
	id: uuid().default(sql`uuidv7()`).primaryKey().notNull(),
	platform: varchar({ length: 20 }).notNull(),
	externalId: varchar("external_id", { length: 120 }),
	authorHandle: varchar("author_handle", { length: 120 }),
	url: varchar({ length: 500 }),
	content: text(),
	sentiment: varchar({ length: 10 }),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	impressions: bigint({ mode: "number" }).default(0).notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	engagement: bigint({ mode: "number" }).default(0).notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	emvCents: bigint("emv_cents", { mode: "number" }).default(0).notNull(),
	isViralMoment: boolean("is_viral_moment").default(false).notNull(),
	mentionedAt: timestamp("mentioned_at", { withTimezone: true, mode: 'string' }),
	ingestedAt: timestamp("ingested_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_social_mentions_platform").using("btree", table.platform.asc().nullsLast().op("timestamptz_ops"), table.mentionedAt.desc().nullsFirst().op("text_ops")),
	index("idx_social_mentions_sentiment").using("btree", table.sentiment.asc().nullsLast().op("text_ops")),
	index("idx_social_mentions_viral").using("btree", table.isViralMoment.asc().nullsLast().op("bool_ops")).where(sql`is_viral_moment`),
	check("social_mentions_platform_check", sql`(platform)::text = ANY ((ARRAY['x'::character varying, 'tiktok'::character varying, 'instagram'::character varying, 'reddit'::character varying, 'youtube'::character varying, 'other'::character varying])::text[])`),
	check("social_mentions_sentiment_check", sql`(sentiment)::text = ANY ((ARRAY['positive'::character varying, 'neutral'::character varying, 'negative'::character varying])::text[])`),
]);

export const adminInvites = pgTable("admin_invites", {
	id: uuid().default(sql`uuidv7()`).primaryKey().notNull(),
	email: varchar({ length: 255 }).notNull(),
	roleId: uuid("role_id"),
	tokenHash: varchar("token_hash", { length: 255 }).notNull(),
	status: varchar({ length: 20 }).default('pending').notNull(),
	invitedBy: uuid("invited_by"),
	acceptedUserId: uuid("accepted_user_id"),
	expiresAt: timestamp("expires_at", { withTimezone: true, mode: 'string' }),
	acceptedAt: timestamp("accepted_at", { withTimezone: true, mode: 'string' }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_admin_invites_email").using("btree", table.email.asc().nullsLast().op("text_ops")),
	index("idx_admin_invites_pending").using("btree", table.status.asc().nullsLast().op("text_ops")).where(sql`((status)::text = 'pending'::text)`),
	foreignKey({
			columns: [table.roleId],
			foreignColumns: [roles.id],
			name: "admin_invites_role_id_fkey"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.invitedBy],
			foreignColumns: [users.id],
			name: "admin_invites_invited_by_fkey"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.acceptedUserId],
			foreignColumns: [users.id],
			name: "admin_invites_accepted_user_id_fkey"
		}).onDelete("set null"),
	unique("admin_invites_token_hash_key").on(table.tokenHash),
	check("admin_invites_status_check", sql`(status)::text = ANY ((ARRAY['pending'::character varying, 'accepted'::character varying, 'revoked'::character varying, 'expired'::character varying])::text[])`),
]);

export const userMfa = pgTable("user_mfa", {
	userId: uuid("user_id").primaryKey().notNull(),
	method: varchar({ length: 20 }).default('totp').notNull(),
	secret: varchar({ length: 255 }),
	isEnabled: boolean("is_enabled").default(false).notNull(),
	backupCodes: jsonb("backup_codes").default([]).notNull(),
	verifiedAt: timestamp("verified_at", { withTimezone: true, mode: 'string' }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "user_mfa_user_id_fkey"
		}).onDelete("cascade"),
	check("user_mfa_method_check", sql`(method)::text = ANY ((ARRAY['totp'::character varying, 'sms'::character varying, 'email'::character varying])::text[])`),
]);

export const users = pgTable("users", {
	id: uuid().default(sql`uuidv7()`).primaryKey().notNull(),
	accountType: varchar("account_type", { length: 20 }).default('guest').notNull(),
	email: varchar({ length: 255 }),
	passwordHash: varchar("password_hash", { length: 255 }),
	phone: varchar({ length: 20 }),
	username: varchar({ length: 50 }),
	firstName: varchar("first_name", { length: 100 }),
	lastName: varchar("last_name", { length: 100 }),
	gender: varchar({ length: 20 }),
	avatarUrl: text("avatar_url"),
	avatarMediaId: uuid("avatar_media_id"),
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
	acquisitionChannel: varchar("acquisition_channel", { length: 30 }),
}, (table) => [
	index("idx_users_account_type").using("btree", table.accountType.asc().nullsLast().op("text_ops")).where(sql`(deleted_at IS NULL)`),
	index("idx_users_avatar_media").using("btree", table.avatarMediaId.asc().nullsLast().op("uuid_ops")).where(sql`(avatar_media_id IS NOT NULL)`),
	index("idx_users_country_code").using("btree", table.countryCode.asc().nullsLast().op("text_ops")).where(sql`(deleted_at IS NULL)`),
	uniqueIndex("idx_users_email").using("btree", sql`lower((email)::text)`).where(sql`((email IS NOT NULL) AND (deleted_at IS NULL))`),
	uniqueIndex("idx_users_phone").using("btree", table.phone.asc().nullsLast().op("text_ops")).where(sql`((phone IS NOT NULL) AND (deleted_at IS NULL))`),
	index("idx_users_status").using("btree", table.status.asc().nullsLast().op("text_ops")).where(sql`(deleted_at IS NULL)`),
	uniqueIndex("idx_users_username").using("btree", sql`lower((username)::text)`).where(sql`((username IS NOT NULL) AND (deleted_at IS NULL))`),
	foreignKey({
			columns: [table.avatarMediaId],
			foreignColumns: [mediaMetadata.id],
			name: "users_avatar_media_id_fkey"
		}).onDelete("set null"),
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
	check("users_acquisition_channel_check", sql`(acquisition_channel)::text = ANY ((ARRAY['organic'::character varying, 'paid_social'::character varying, 'referral'::character varying, 'influencer'::character varying, 'search'::character varying, 'other'::character varying])::text[])`),
	check("users_account_type_check", sql`(account_type)::text = ANY ((ARRAY['guest'::character varying, 'customer'::character varying, 'admin'::character varying])::text[])`),
	check("users_gender_check", sql`(gender)::text = ANY ((ARRAY['male'::character varying, 'female'::character varying, 'other'::character varying, 'prefer_not_to_say'::character varying])::text[])`),
	check("users_primary_auth_method_check", sql`(primary_auth_method)::text = ANY ((ARRAY['phone'::character varying, 'google'::character varying, 'apple'::character varying, 'email'::character varying])::text[])`),
	check("users_location_source_check", sql`(location_source)::text = ANY ((ARRAY['ip'::character varying, 'device'::character varying, 'manual'::character varying])::text[])`),
	check("users_status_check", sql`(status)::text = ANY ((ARRAY['active'::character varying, 'suspended'::character varying, 'banned'::character varying, 'disabled'::character varying])::text[])`),
]);

export const mediaMetadata = pgTable("media_metadata", {
	id: uuid().default(sql`uuidv7()`).primaryKey().notNull(),
	mediaType: varchar("media_type", { length: 20 }).notNull(),
	usageType: varchar("usage_type", { length: 40 }).default('generic').notNull(),
	accessLevel: varchar("access_level", { length: 20 }).default('protected').notNull(),
	status: varchar({ length: 20 }).default('pending').notNull(),
	storageProvider: varchar("storage_provider", { length: 30 }).default('s3').notNull(),
	storageBucket: varchar("storage_bucket", { length: 255 }),
	storageKey: text("storage_key"),
	storageRegion: varchar("storage_region", { length: 30 }),
	cdnProvider: varchar("cdn_provider", { length: 30 }).default('cloudfront'),
	deliveryPrefix: text("delivery_prefix"),
	originalFilename: varchar("original_filename", { length: 500 }),
	mimeType: varchar("mime_type", { length: 150 }),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	fileSizeBytes: bigint("file_size_bytes", { mode: "number" }),
	checksum: varchar({ length: 128 }),
	width: integer(),
	height: integer(),
	durationSeconds: numeric("duration_seconds", { precision: 10, scale:  3 }),
	isHls: boolean("is_hls").default(false).notNull(),
	hlsMasterKey: text("hls_master_key"),
	posterMediaId: uuid("poster_media_id"),
	processingProvider: varchar("processing_provider", { length: 40 }),
	processingJobId: varchar("processing_job_id", { length: 255 }),
	processingProgress: integer("processing_progress"),
	processingError: text("processing_error"),
	processedAt: timestamp("processed_at", { withTimezone: true, mode: 'string' }),
	uploadedBy: uuid("uploaded_by"),
	uploadCompletedAt: timestamp("upload_completed_at", { withTimezone: true, mode: 'string' }),
	altText: varchar("alt_text", { length: 500 }),
	metadata: jsonb().default({}).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	deletedAt: timestamp("deleted_at", { withTimezone: true, mode: 'string' }),
}, (table) => [
	index("idx_media_access").using("btree", table.accessLevel.asc().nullsLast().op("text_ops")).where(sql`(deleted_at IS NULL)`),
	index("idx_media_checksum").using("btree", table.checksum.asc().nullsLast().op("text_ops")).where(sql`((checksum IS NOT NULL) AND (deleted_at IS NULL))`),
	index("idx_media_created_at").using("btree", table.createdAt.asc().nullsLast().op("timestamptz_ops")),
	index("idx_media_poster").using("btree", table.posterMediaId.asc().nullsLast().op("uuid_ops")).where(sql`(poster_media_id IS NOT NULL)`),
	index("idx_media_status").using("btree", table.status.asc().nullsLast().op("text_ops")).where(sql`(deleted_at IS NULL)`),
	index("idx_media_uploaded_by").using("btree", table.uploadedBy.asc().nullsLast().op("uuid_ops")).where(sql`(deleted_at IS NULL)`),
	index("idx_media_usage_type").using("btree", table.usageType.asc().nullsLast().op("text_ops")).where(sql`(deleted_at IS NULL)`),
	foreignKey({
			columns: [table.posterMediaId],
			foreignColumns: [table.id],
			name: "media_metadata_poster_media_id_fkey"
		}).onDelete("set null"),
	check("media_metadata_media_type_check", sql`(media_type)::text = ANY ((ARRAY['image'::character varying, 'video'::character varying, 'audio'::character varying, 'document'::character varying, 'other'::character varying])::text[])`),
	check("media_metadata_usage_type_check", sql`(usage_type)::text = ANY ((ARRAY['content_video'::character varying, 'content_trailer'::character varying, 'content_thumbnail'::character varying, 'avatar'::character varying, 'studio_logo'::character varying, 'banner'::character varying, 'document'::character varying, 'generic'::character varying])::text[])`),
	check("media_metadata_access_level_check", sql`(access_level)::text = ANY ((ARRAY['public'::character varying, 'protected'::character varying, 'private'::character varying])::text[])`),
	check("media_metadata_status_check", sql`(status)::text = ANY ((ARRAY['pending'::character varying, 'uploading'::character varying, 'uploaded'::character varying, 'processing'::character varying, 'ready'::character varying, 'failed'::character varying, 'archived'::character varying])::text[])`),
]);

export const mediaStatusEvents = pgTable("media_status_events", {
	id: uuid().default(sql`uuidv7()`).primaryKey().notNull(),
	mediaId: uuid("media_id").notNull(),
	status: varchar({ length: 20 }).notNull(),
	detail: varchar({ length: 500 }),
	progress: integer(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_media_status_events_media").using("btree", table.mediaId.asc().nullsLast().op("timestamptz_ops"), table.createdAt.asc().nullsLast().op("timestamptz_ops")),
	foreignKey({
			columns: [table.mediaId],
			foreignColumns: [mediaMetadata.id],
			name: "media_status_events_media_id_fkey"
		}).onDelete("cascade"),
]);

export const userEnforcementActions = pgTable("user_enforcement_actions", {
	id: uuid().default(sql`uuidv7()`).primaryKey().notNull(),
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
	id: uuid().default(sql`uuidv7()`).primaryKey().notNull(),
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
	id: uuid().default(sql`uuidv7()`).primaryKey().notNull(),
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
	id: uuid().default(sql`uuidv7()`).primaryKey().notNull(),
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
	id: uuid().default(sql`uuidv7()`).primaryKey().notNull(),
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
	id: uuid().default(sql`uuidv7()`).primaryKey().notNull(),
	ruleKey: varchar("rule_key", { length: 50 }).notNull(),
	name: varchar({ length: 150 }).notNull(),
	description: varchar({ length: 500 }),
	isEnabled: boolean("is_enabled").default(true).notNull(),
	config: jsonb().default({}).notNull(),
	version: integer().default(1).notNull(),
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
	id: uuid().default(sql`uuidv7()`).primaryKey().notNull(),
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
	id: uuid().default(sql`uuidv7()`).primaryKey().notNull(),
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
	id: uuid().default(sql`uuidv7()`).primaryKey().notNull(),
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
	id: uuid().default(sql`uuidv7()`).primaryKey().notNull(),
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

export const studios = pgTable("studios", {
	id: uuid().default(sql`uuidv7()`).primaryKey().notNull(),
	name: varchar({ length: 200 }).notNull(),
	slug: varchar({ length: 220 }).notNull(),
	logoMediaId: uuid("logo_media_id"),
	description: text(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	deletedAt: timestamp("deleted_at", { withTimezone: true, mode: 'string' }),
}, (table) => [
	foreignKey({
			columns: [table.logoMediaId],
			foreignColumns: [mediaMetadata.id],
			name: "studios_logo_media_id_fkey"
		}).onDelete("set null"),
	unique("studios_slug_key").on(table.slug),
]);

export const people = pgTable("people", {
	id: uuid().default(sql`uuidv7()`).primaryKey().notNull(),
	name: varchar({ length: 200 }).notNull(),
	slug: varchar({ length: 220 }).notNull(),
	photoMediaId: uuid("photo_media_id"),
	bio: text(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.photoMediaId],
			foreignColumns: [mediaMetadata.id],
			name: "people_photo_media_id_fkey"
		}).onDelete("set null"),
	unique("people_slug_key").on(table.slug),
]);

export const contentMedia = pgTable("content_media", {
	id: uuid().default(sql`uuidv7()`).primaryKey().notNull(),
	contentId: uuid("content_id").notNull(),
	mediaId: uuid("media_id").notNull(),
	kind: varchar({ length: 20 }).default('still').notNull(),
	sortOrder: integer("sort_order").default(0).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_content_media_content").using("btree", table.contentId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.contentId],
			foreignColumns: [contents.id],
			name: "content_media_content_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.mediaId],
			foreignColumns: [mediaMetadata.id],
			name: "content_media_media_id_fkey"
		}).onDelete("cascade"),
	check("content_media_kind_check", sql`(kind)::text = ANY ((ARRAY['thumbnail'::character varying, 'poster'::character varying, 'still'::character varying, 'banner'::character varying])::text[])`),
]);

export const genres = pgTable("genres", {
	id: uuid().default(sql`uuidv7()`).primaryKey().notNull(),
	name: varchar({ length: 100 }).notNull(),
	slug: varchar({ length: 120 }).notNull(),
	isActive: boolean("is_active").default(true).notNull(),
	sortOrder: integer("sort_order").default(0).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	unique("genres_slug_key").on(table.slug),
]);

export const tags = pgTable("tags", {
	id: uuid().default(sql`uuidv7()`).primaryKey().notNull(),
	name: varchar({ length: 80 }).notNull(),
	slug: varchar({ length: 100 }).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	unique("tags_slug_key").on(table.slug),
]);

export const contents = pgTable("contents", {
	id: uuid().default(sql`uuidv7()`).primaryKey().notNull(),
	title: varchar({ length: 300 }).notNull(),
	slug: varchar({ length: 320 }).notNull(),
	description: text(),
	contentType: varchar("content_type", { length: 20 }).default('trailer').notNull(),
	accessTier: varchar("access_tier", { length: 20 }).default('free').notNull(),
	unlockPoints: integer("unlock_points"),
	studioId: uuid("studio_id"),
	videoMediaId: uuid("video_media_id"),
	thumbnailMediaId: uuid("thumbnail_media_id"),
	durationSeconds: integer("duration_seconds"),
	language: varchar({ length: 10 }),
	status: varchar({ length: 20 }).default('draft').notNull(),
	scheduledAt: timestamp("scheduled_at", { withTimezone: true, mode: 'string' }),
	publishedAt: timestamp("published_at", { withTimezone: true, mode: 'string' }),
	isBoosted: boolean("is_boosted").default(false).notNull(),
	boostPriority: integer("boost_priority").default(0).notNull(),
	boostedUntil: timestamp("boosted_until", { withTimezone: true, mode: 'string' }),
	createdBy: uuid("created_by"),
	updatedBy: uuid("updated_by"),
	requestedBy: uuid("requested_by"),
	approvedBy: uuid("approved_by"),
	approvedAt: timestamp("approved_at", { withTimezone: true, mode: 'string' }),
	rejectionReason: varchar("rejection_reason", { length: 500 }),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	viewCount: bigint("view_count", { mode: "number" }).default(0).notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	uniqueViewerCount: bigint("unique_viewer_count", { mode: "number" }).default(0).notNull(),
	likeCount: integer("like_count").default(0).notNull(),
	dislikeCount: integer("dislike_count").default(0).notNull(),
	commentCount: integer("comment_count").default(0).notNull(),
	shareCount: integer("share_count").default(0).notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	totalWatchSeconds: bigint("total_watch_seconds", { mode: "number" }).default(0).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	deletedAt: timestamp("deleted_at", { withTimezone: true, mode: 'string' }),
	licenseStatus: varchar("license_status", { length: 20 }).default('original').notNull(),
	licenseExpiresAt: timestamp("license_expires_at", { withTimezone: true, mode: 'string' }),
	licensorName: varchar("licensor_name", { length: 200 }),
	licenseTerms: varchar("license_terms", { length: 500 }),
	recommendation: varchar({ length: 20 }).default('normal').notNull(),
	isSponsored: boolean("is_sponsored").default(false).notNull(),
	parentContentId: uuid("parent_content_id"),
	isAdCommercial: boolean("is_ad_commercial").default(false).notNull(),
}, (table) => [
	index("idx_contents_boost").using("btree", table.boostPriority.desc().nullsFirst().op("int4_ops")).where(sql`(is_boosted AND (deleted_at IS NULL))`),
	index("idx_contents_license_expiry").using("btree", table.licenseExpiresAt.asc().nullsLast().op("timestamptz_ops")).where(sql`((license_status)::text = ANY ((ARRAY['licensed'::character varying, 'expiring'::character varying])::text[]))`),
	index("idx_contents_parent").using("btree", table.parentContentId.asc().nullsLast().op("uuid_ops")).where(sql`(parent_content_id IS NOT NULL)`),
	index("idx_contents_scheduled").using("btree", table.scheduledAt.asc().nullsLast().op("timestamptz_ops")).where(sql`((status)::text = 'scheduled'::text)`),
	index("idx_contents_sponsored").using("btree", table.id.asc().nullsLast().op("uuid_ops")).where(sql`(is_sponsored AND (deleted_at IS NULL))`),
	index("idx_contents_status_published").using("btree", table.status.asc().nullsLast().op("text_ops"), table.publishedAt.desc().nullsFirst().op("text_ops")).where(sql`(deleted_at IS NULL)`),
	index("idx_contents_studio").using("btree", table.studioId.asc().nullsLast().op("uuid_ops")).where(sql`(deleted_at IS NULL)`),
	index("idx_contents_type").using("btree", table.contentType.asc().nullsLast().op("text_ops")).where(sql`(deleted_at IS NULL)`),
	foreignKey({
			columns: [table.parentContentId],
			foreignColumns: [table.id],
			name: "contents_parent_content_id_fkey"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.studioId],
			foreignColumns: [studios.id],
			name: "contents_studio_id_fkey"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.videoMediaId],
			foreignColumns: [mediaMetadata.id],
			name: "contents_video_media_id_fkey"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.thumbnailMediaId],
			foreignColumns: [mediaMetadata.id],
			name: "contents_thumbnail_media_id_fkey"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.createdBy],
			foreignColumns: [users.id],
			name: "contents_created_by_fkey"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.updatedBy],
			foreignColumns: [users.id],
			name: "contents_updated_by_fkey"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.requestedBy],
			foreignColumns: [users.id],
			name: "contents_requested_by_fkey"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.approvedBy],
			foreignColumns: [users.id],
			name: "contents_approved_by_fkey"
		}).onDelete("set null"),
	unique("contents_slug_key").on(table.slug),
	check("contents_license_status_check", sql`(license_status)::text = ANY ((ARRAY['original'::character varying, 'licensed'::character varying, 'expiring'::character varying, 'expired'::character varying])::text[])`),
	check("contents_recommendation_check", sql`(recommendation)::text = ANY ((ARRAY['promoted'::character varying, 'normal'::character varying, 'deprioritized'::character varying])::text[])`),
	check("contents_parent_not_self_check", sql`(parent_content_id IS NULL) OR (parent_content_id <> id)`),
	check("contents_content_type_check", sql`(content_type)::text = ANY ((ARRAY['trailer'::character varying, 'bts'::character varying, 'clip'::character varying])::text[])`),
	check("contents_access_tier_check", sql`(access_tier)::text = ANY ((ARRAY['free'::character varying, 'exclusive'::character varying])::text[])`),
	check("contents_status_check", sql`(status)::text = ANY ((ARRAY['draft'::character varying, 'pending_approval'::character varying, 'scheduled'::character varying, 'published'::character varying, 'rejected'::character varying, 'archived'::character varying])::text[])`),
]);

export const contentChangeHistory = pgTable("content_change_history", {
	id: uuid().default(sql`uuidv7()`).primaryKey().notNull(),
	contentId: uuid("content_id").notNull(),
	changedBy: uuid("changed_by"),
	action: varchar({ length: 20 }).notNull(),
	changes: jsonb().default({}).notNull(),
	note: varchar({ length: 500 }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_content_change_history_content").using("btree", table.contentId.asc().nullsLast().op("timestamptz_ops"), table.createdAt.desc().nullsFirst().op("timestamptz_ops")),
	foreignKey({
			columns: [table.contentId],
			foreignColumns: [contents.id],
			name: "content_change_history_content_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.changedBy],
			foreignColumns: [users.id],
			name: "content_change_history_changed_by_fkey"
		}).onDelete("set null"),
	check("content_change_history_action_check", sql`(action)::text = ANY ((ARRAY['created'::character varying, 'updated'::character varying, 'submitted'::character varying, 'approved'::character varying, 'rejected'::character varying, 'scheduled'::character varying, 'published'::character varying, 'boosted'::character varying, 'archived'::character varying])::text[])`),
]);

export const contentReactions = pgTable("content_reactions", {
	id: uuid().default(sql`uuidv7()`).primaryKey().notNull(),
	contentId: uuid("content_id").notNull(),
	userId: uuid("user_id").notNull(),
	reaction: varchar({ length: 10 }).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_content_reactions_content").using("btree", table.contentId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.contentId],
			foreignColumns: [contents.id],
			name: "content_reactions_content_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "content_reactions_user_id_fkey"
		}).onDelete("cascade"),
	unique("content_reactions_content_id_user_id_key").on(table.contentId, table.userId),
	check("content_reactions_reaction_check", sql`(reaction)::text = ANY ((ARRAY['like'::character varying, 'dislike'::character varying])::text[])`),
]);

export const comments = pgTable("comments", {
	id: uuid().default(sql`uuidv7()`).primaryKey().notNull(),
	contentId: uuid("content_id").notNull(),
	userId: uuid("user_id").notNull(),
	parentCommentId: uuid("parent_comment_id"),
	body: text().notNull(),
	status: varchar({ length: 20 }).default('visible').notNull(),
	likeCount: integer("like_count").default(0).notNull(),
	dislikeCount: integer("dislike_count").default(0).notNull(),
	replyCount: integer("reply_count").default(0).notNull(),
	flagCount: integer("flag_count").default(0).notNull(),
	isFlagged: boolean("is_flagged").default(false).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	deletedAt: timestamp("deleted_at", { withTimezone: true, mode: 'string' }),
}, (table) => [
	index("idx_comments_content").using("btree", table.contentId.asc().nullsLast().op("timestamptz_ops"), table.createdAt.desc().nullsFirst().op("timestamptz_ops")).where(sql`((status)::text = 'visible'::text)`),
	index("idx_comments_flagged").using("btree", table.contentId.asc().nullsLast().op("uuid_ops")).where(sql`is_flagged`),
	index("idx_comments_parent").using("btree", table.parentCommentId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "comments_user_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.parentCommentId],
			foreignColumns: [table.id],
			name: "comments_parent_comment_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.contentId],
			foreignColumns: [contents.id],
			name: "comments_content_id_fkey"
		}).onDelete("cascade"),
	check("comments_status_check", sql`(status)::text = ANY ((ARRAY['visible'::character varying, 'hidden'::character varying, 'deleted'::character varying])::text[])`),
]);

export const commentReports = pgTable("comment_reports", {
	id: uuid().default(sql`uuidv7()`).primaryKey().notNull(),
	commentId: uuid("comment_id").notNull(),
	reportedBy: uuid("reported_by").notNull(),
	reason: varchar({ length: 30 }).notNull(),
	description: varchar({ length: 500 }),
	status: varchar({ length: 20 }).default('pending').notNull(),
	reviewedBy: uuid("reviewed_by"),
	reviewedAt: timestamp("reviewed_at", { withTimezone: true, mode: 'string' }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_comment_reports_open").using("btree", table.commentId.asc().nullsLast().op("uuid_ops")).where(sql`((status)::text = 'pending'::text)`),
	foreignKey({
			columns: [table.commentId],
			foreignColumns: [comments.id],
			name: "comment_reports_comment_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.reportedBy],
			foreignColumns: [users.id],
			name: "comment_reports_reported_by_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.reviewedBy],
			foreignColumns: [users.id],
			name: "comment_reports_reviewed_by_fkey"
		}).onDelete("set null"),
	unique("comment_reports_comment_id_reported_by_key").on(table.commentId, table.reportedBy),
	check("comment_reports_reason_check", sql`(reason)::text = ANY ((ARRAY['nudity_sexual'::character varying, 'violence_gore'::character varying, 'hate_speech'::character varying, 'harassment_bullying'::character varying, 'other'::character varying])::text[])`),
	check("comment_reports_status_check", sql`(status)::text = ANY ((ARRAY['pending'::character varying, 'actioned'::character varying, 'dismissed'::character varying])::text[])`),
]);

export const contentShares = pgTable("content_shares", {
	id: uuid().default(sql`uuidv7()`).primaryKey().notNull(),
	contentId: uuid("content_id").notNull(),
	userId: uuid("user_id").notNull(),
	channel: varchar({ length: 30 }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_content_shares_content").using("btree", table.contentId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.contentId],
			foreignColumns: [contents.id],
			name: "content_shares_content_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "content_shares_user_id_fkey"
		}).onDelete("cascade"),
]);

export const contentModerationLog = pgTable("content_moderation_log", {
	id: uuid().default(sql`uuidv7()`).primaryKey().notNull(),
	commentId: uuid("comment_id").notNull(),
	action: varchar({ length: 20 }).notNull(),
	performedBy: uuid("performed_by"),
	reason: varchar({ length: 500 }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_content_moderation_log_comment").using("btree", table.commentId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.commentId],
			foreignColumns: [comments.id],
			name: "content_moderation_log_comment_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.performedBy],
			foreignColumns: [users.id],
			name: "content_moderation_log_performed_by_fkey"
		}).onDelete("set null"),
	check("content_moderation_log_action_check", sql`(action)::text = ANY ((ARRAY['hide'::character varying, 'unhide'::character varying, 'delete'::character varying, 'warn_user'::character varying])::text[])`),
]);

export const contentUnlocks = pgTable("content_unlocks", {
	id: uuid().default(sql`uuidv7()`).primaryKey().notNull(),
	contentId: uuid("content_id").notNull(),
	userId: uuid("user_id").notNull(),
	pointsSpent: integer("points_spent").default(0).notNull(),
	unlockedAt: timestamp("unlocked_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_content_unlocks_user").using("btree", table.userId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.contentId],
			foreignColumns: [contents.id],
			name: "content_unlocks_content_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "content_unlocks_user_id_fkey"
		}).onDelete("cascade"),
	unique("content_unlocks_content_id_user_id_key").on(table.contentId, table.userId),
]);

export const contentViews = pgTable("content_views", {
	id: uuid().default(sql`uuidv7()`).primaryKey().notNull(),
	contentId: uuid("content_id").notNull(),
	userId: uuid("user_id").notNull(),
	sessionId: varchar("session_id", { length: 64 }),
	device: varchar({ length: 20 }),
	startedAt: timestamp("started_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	lastHeartbeatAt: timestamp("last_heartbeat_at", { withTimezone: true, mode: 'string' }),
	watchedSeconds: integer("watched_seconds").default(0).notNull(),
	maxPositionSeconds: integer("max_position_seconds").default(0).notNull(),
	completionPercent: numeric("completion_percent", { precision: 5, scale:  2 }).default('0').notNull(),
	isCompleted: boolean("is_completed").default(false).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_content_views_content").using("btree", table.contentId.asc().nullsLast().op("uuid_ops")),
	index("idx_content_views_user").using("btree", table.userId.asc().nullsLast().op("uuid_ops"), table.contentId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.contentId],
			foreignColumns: [contents.id],
			name: "content_views_content_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "content_views_user_id_fkey"
		}).onDelete("cascade"),
]);

export const rewardRuleVersions = pgTable("reward_rule_versions", {
	id: uuid().default(sql`uuidv7()`).primaryKey().notNull(),
	ruleId: uuid("rule_id").notNull(),
	ruleKey: varchar("rule_key", { length: 50 }).notNull(),
	version: integer().notNull(),
	config: jsonb().notNull(),
	changedBy: uuid("changed_by"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_reward_rule_versions_key").using("btree", table.ruleKey.asc().nullsLast().op("int4_ops"), table.version.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.ruleId],
			foreignColumns: [rewardRules.id],
			name: "reward_rule_versions_rule_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.changedBy],
			foreignColumns: [users.id],
			name: "reward_rule_versions_changed_by_fkey"
		}).onDelete("set null"),
	unique("reward_rule_versions_rule_id_version_key").on(table.ruleId, table.version),
]);

export const wallets = pgTable("wallets", {
	userId: uuid("user_id").primaryKey().notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	pointsBalance: bigint("points_balance", { mode: "number" }).default(0).notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	pointsEarnedLifetime: bigint("points_earned_lifetime", { mode: "number" }).default(0).notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	pointsSpentLifetime: bigint("points_spent_lifetime", { mode: "number" }).default(0).notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	pointsPurchasedLifetime: bigint("points_purchased_lifetime", { mode: "number" }).default(0).notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	xpTotal: bigint("xp_total", { mode: "number" }).default(0).notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_wallets_xp").using("btree", table.xpTotal.desc().nullsFirst().op("int8_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "wallets_user_id_fkey"
		}).onDelete("cascade"),
	check("wallets_points_balance_check", sql`points_balance >= 0`),
]);

export const quests = pgTable("quests", {
	id: uuid().default(sql`uuidv7()`).primaryKey().notNull(),
	name: varchar({ length: 200 }).notNull(),
	description: text(),
	rewardPoints: integer("reward_points").default(0).notNull(),
	rewardXp: integer("reward_xp").default(0).notNull(),
	startAt: timestamp("start_at", { withTimezone: true, mode: 'string' }).notNull(),
	endAt: timestamp("end_at", { withTimezone: true, mode: 'string' }).notNull(),
	requireAll: boolean("require_all").default(true).notNull(),
	status: varchar({ length: 20 }).default('draft').notNull(),
	createdBy: uuid("created_by"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	unlockThresholdPoints: integer("unlock_threshold_points"),
	bannerMediaId: uuid("banner_media_id"),
}, (table) => [
	index("idx_quests_active").using("btree", table.status.asc().nullsLast().op("text_ops"), table.endAt.asc().nullsLast().op("text_ops")).where(sql`((status)::text = 'active'::text)`),
	foreignKey({
			columns: [table.bannerMediaId],
			foreignColumns: [mediaMetadata.id],
			name: "quests_banner_media_id_fkey"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.createdBy],
			foreignColumns: [users.id],
			name: "quests_created_by_fkey"
		}).onDelete("set null"),
	check("quests_check", sql`end_at > start_at`),
	check("quests_status_check", sql`(status)::text = ANY ((ARRAY['draft'::character varying, 'active'::character varying, 'ended'::character varying, 'cancelled'::character varying])::text[])`),
]);

export const userStreaks = pgTable("user_streaks", {
	userId: uuid("user_id").primaryKey().notNull(),
	currentStreak: integer("current_streak").default(0).notNull(),
	longestStreak: integer("longest_streak").default(0).notNull(),
	lastQualifiedDate: date("last_qualified_date"),
	totalQualifiedDays: integer("total_qualified_days").default(0).notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "user_streaks_user_id_fkey"
		}).onDelete("cascade"),
]);

export const ledgerTransactions = pgTable("ledger_transactions", {
	id: uuid().default(sql`uuidv7()`).primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	currency: varchar({ length: 10 }).notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	amount: bigint({ mode: "number" }).notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	balanceAfter: bigint("balance_after", { mode: "number" }).default(0).notNull(),
	direction: varchar({ length: 10 }).notNull(),
	sourceKind: varchar("source_kind", { length: 10 }).default('earned').notNull(),
	sourceType: varchar("source_type", { length: 30 }).notNull(),
	sourceId: uuid("source_id"),
	rewardRuleVersionId: uuid("reward_rule_version_id"),
	idempotencyKey: varchar("idempotency_key", { length: 120 }).notNull(),
	note: varchar({ length: 300 }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_ledger_source").using("btree", table.sourceType.asc().nullsLast().op("text_ops"), table.sourceId.asc().nullsLast().op("uuid_ops")),
	index("idx_ledger_user").using("btree", table.userId.asc().nullsLast().op("timestamptz_ops"), table.createdAt.desc().nullsFirst().op("uuid_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "ledger_transactions_user_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.rewardRuleVersionId],
			foreignColumns: [rewardRuleVersions.id],
			name: "ledger_transactions_reward_rule_version_id_fkey"
		}).onDelete("set null"),
	unique("ledger_transactions_idempotency_key_key").on(table.idempotencyKey),
	check("ledger_transactions_source_type_check", sql`(source_type)::text = ANY ((ARRAY['referral'::character varying, 'daily_streak'::character varying, 'quest'::character varying, 'prediction'::character varying, 'bid'::character varying, 'bid_refund'::character varying, 'content_unlock'::character varying, 'content_share'::character varying, 'badge'::character varying, 'admin'::character varying, 'subscription'::character varying])::text[])`),
	check("ledger_transactions_currency_check", sql`(currency)::text = ANY ((ARRAY['points'::character varying, 'xp'::character varying])::text[])`),
	check("ledger_transactions_direction_check", sql`(direction)::text = ANY ((ARRAY['earn'::character varying, 'spend'::character varying, 'refund'::character varying, 'purchase'::character varying, 'adjust'::character varying])::text[])`),
	check("ledger_transactions_source_kind_check", sql`(source_kind)::text = ANY ((ARRAY['earned'::character varying, 'purchased'::character varying])::text[])`),
]);

export const predictions = pgTable("predictions", {
	id: uuid().default(sql`uuidv7()`).primaryKey().notNull(),
	question: varchar({ length: 500 }).notNull(),
	description: text(),
	contentId: uuid("content_id"),
	startAt: timestamp("start_at", { withTimezone: true, mode: 'string' }).notNull(),
	endAt: timestamp("end_at", { withTimezone: true, mode: 'string' }).notNull(),
	status: varchar({ length: 20 }).default('open').notNull(),
	rewardPoints: integer("reward_points").default(0).notNull(),
	rewardXp: integer("reward_xp").default(0).notNull(),
	correctOptionId: uuid("correct_option_id"),
	resolvedBy: uuid("resolved_by"),
	resolvedAt: timestamp("resolved_at", { withTimezone: true, mode: 'string' }),
	createdBy: uuid("created_by"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	unlockThresholdPoints: integer("unlock_threshold_points"),
	bannerMediaId: uuid("banner_media_id"),
}, (table) => [
	index("idx_predictions_open").using("btree", table.status.asc().nullsLast().op("text_ops"), table.endAt.asc().nullsLast().op("text_ops")).where(sql`((status)::text = ANY ((ARRAY['open'::character varying, 'locked'::character varying])::text[]))`),
	foreignKey({
			columns: [table.bannerMediaId],
			foreignColumns: [mediaMetadata.id],
			name: "predictions_banner_media_id_fkey"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.contentId],
			foreignColumns: [contents.id],
			name: "predictions_content_id_fkey"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.resolvedBy],
			foreignColumns: [users.id],
			name: "predictions_resolved_by_fkey"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.createdBy],
			foreignColumns: [users.id],
			name: "predictions_created_by_fkey"
		}).onDelete("set null"),
	check("predictions_status_check", sql`(status)::text = ANY ((ARRAY['open'::character varying, 'locked'::character varying, 'resolved'::character varying, 'cancelled'::character varying])::text[])`),
	check("predictions_check", sql`end_at > start_at`),
]);

export const predictionOptions = pgTable("prediction_options", {
	id: uuid().default(sql`uuidv7()`).primaryKey().notNull(),
	predictionId: uuid("prediction_id").notNull(),
	label: varchar({ length: 300 }),
	optionMediaId: uuid("option_media_id"),
	isCorrect: boolean("is_correct").default(false).notNull(),
	sortOrder: integer("sort_order").default(0).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_prediction_options_prediction").using("btree", table.predictionId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.predictionId],
			foreignColumns: [predictions.id],
			name: "prediction_options_prediction_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.optionMediaId],
			foreignColumns: [mediaMetadata.id],
			name: "prediction_options_option_media_id_fkey"
		}).onDelete("set null"),
]);

export const predictionEntries = pgTable("prediction_entries", {
	id: uuid().default(sql`uuidv7()`).primaryKey().notNull(),
	predictionId: uuid("prediction_id").notNull(),
	userId: uuid("user_id").notNull(),
	optionId: uuid("option_id").notNull(),
	isCorrect: boolean("is_correct"),
	pointsAwarded: integer("points_awarded").default(0).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_prediction_entries_prediction").using("btree", table.predictionId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.predictionId],
			foreignColumns: [predictions.id],
			name: "prediction_entries_prediction_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "prediction_entries_user_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.optionId],
			foreignColumns: [predictionOptions.id],
			name: "prediction_entries_option_id_fkey"
		}).onDelete("cascade"),
	unique("prediction_entries_prediction_id_user_id_key").on(table.predictionId, table.userId),
]);

export const auctions = pgTable("auctions", {
	id: uuid().default(sql`uuidv7()`).primaryKey().notNull(),
	title: varchar({ length: 300 }).notNull(),
	description: text(),
	prize: varchar({ length: 300 }),
	contentId: uuid("content_id"),
	startAt: timestamp("start_at", { withTimezone: true, mode: 'string' }).notNull(),
	endAt: timestamp("end_at", { withTimezone: true, mode: 'string' }).notNull(),
	status: varchar({ length: 20 }).default('scheduled').notNull(),
	minBidPoints: integer("min_bid_points").default(0).notNull(),
	winnerUserId: uuid("winner_user_id"),
	winningAmount: integer("winning_amount"),
	createdBy: uuid("created_by"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	unlockThresholdPoints: integer("unlock_threshold_points"),
	bannerMediaId: uuid("banner_media_id"),
}, (table) => [
	index("idx_auctions_open").using("btree", table.status.asc().nullsLast().op("text_ops"), table.endAt.asc().nullsLast().op("text_ops")).where(sql`((status)::text = 'open'::text)`),
	foreignKey({
			columns: [table.bannerMediaId],
			foreignColumns: [mediaMetadata.id],
			name: "auctions_banner_media_id_fkey"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.contentId],
			foreignColumns: [contents.id],
			name: "auctions_content_id_fkey"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.winnerUserId],
			foreignColumns: [users.id],
			name: "auctions_winner_user_id_fkey"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.createdBy],
			foreignColumns: [users.id],
			name: "auctions_created_by_fkey"
		}).onDelete("set null"),
	check("auctions_status_check", sql`(status)::text = ANY ((ARRAY['scheduled'::character varying, 'open'::character varying, 'closed'::character varying, 'settled'::character varying, 'cancelled'::character varying])::text[])`),
	check("auctions_check", sql`end_at > start_at`),
]);

export const bids = pgTable("bids", {
	id: uuid().default(sql`uuidv7()`).primaryKey().notNull(),
	auctionId: uuid("auction_id").notNull(),
	userId: uuid("user_id").notNull(),
	amountPoints: integer("amount_points").notNull(),
	status: varchar({ length: 20 }).default('active').notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_bids_auction").using("btree", table.auctionId.asc().nullsLast().op("int4_ops"), table.amountPoints.desc().nullsFirst().op("int4_ops")),
	index("idx_bids_user").using("btree", table.userId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.auctionId],
			foreignColumns: [auctions.id],
			name: "bids_auction_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "bids_user_id_fkey"
		}).onDelete("cascade"),
	check("bids_status_check", sql`(status)::text = ANY ((ARRAY['active'::character varying, 'outbid'::character varying, 'won'::character varying, 'refunded'::character varying])::text[])`),
]);

export const levelDefinitions = pgTable("level_definitions", {
	level: integer().primaryKey().notNull(),
	xpToAdvance: numeric("xp_to_advance").notNull(),
	cumulativeToReach: numeric("cumulative_to_reach").notNull(),
});

export const badges = pgTable("badges", {
	id: uuid().default(sql`uuidv7()`).primaryKey().notNull(),
	name: varchar({ length: 150 }).notNull(),
	slug: varchar({ length: 170 }).notNull(),
	description: text(),
	activeIconMediaId: uuid("active_icon_media_id"),
	inactiveIconMediaId: uuid("inactive_icon_media_id"),
	triggerKey: varchar("trigger_key", { length: 50 }).notNull(),
	operator: varchar({ length: 5 }).notNull(),
	threshold: numeric().notNull(),
	rewardPoints: integer("reward_points").default(0).notNull(),
	rewardXp: integer("reward_xp").default(0).notNull(),
	isActive: boolean("is_active").default(true).notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	earnedCount: bigint("earned_count", { mode: "number" }).default(0).notNull(),
	createdBy: uuid("created_by"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	deletedAt: timestamp("deleted_at", { withTimezone: true, mode: 'string' }),
}, (table) => [
	index("idx_badges_trigger").using("btree", table.triggerKey.asc().nullsLast().op("text_ops")).where(sql`(is_active AND (deleted_at IS NULL))`),
	foreignKey({
			columns: [table.activeIconMediaId],
			foreignColumns: [mediaMetadata.id],
			name: "badges_active_icon_media_id_fkey"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.inactiveIconMediaId],
			foreignColumns: [mediaMetadata.id],
			name: "badges_inactive_icon_media_id_fkey"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.triggerKey],
			foreignColumns: [badgeTriggers.key],
			name: "badges_trigger_key_fkey"
		}).onDelete("restrict"),
	foreignKey({
			columns: [table.createdBy],
			foreignColumns: [users.id],
			name: "badges_created_by_fkey"
		}).onDelete("set null"),
	unique("badges_slug_key").on(table.slug),
	check("badges_operator_check", sql`(operator)::text = ANY ((ARRAY['gt'::character varying, 'gte'::character varying, 'eq'::character varying, 'lt'::character varying, 'lte'::character varying])::text[])`),
]);

export const badgeTriggers = pgTable("badge_triggers", {
	key: varchar({ length: 50 }).primaryKey().notNull(),
	label: varchar({ length: 100 }).notNull(),
	unit: varchar({ length: 20 }),
	description: varchar({ length: 300 }),
	isActive: boolean("is_active").default(true).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
});

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

export const contentTags = pgTable("content_tags", {
	contentId: uuid("content_id").notNull(),
	tagId: uuid("tag_id").notNull(),
}, (table) => [
	index("idx_content_tags_tag").using("btree", table.tagId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.contentId],
			foreignColumns: [contents.id],
			name: "content_tags_content_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.tagId],
			foreignColumns: [tags.id],
			name: "content_tags_tag_id_fkey"
		}).onDelete("cascade"),
	primaryKey({ columns: [table.contentId, table.tagId], name: "content_tags_pkey"}),
]);

export const questContents = pgTable("quest_contents", {
	questId: uuid("quest_id").notNull(),
	contentId: uuid("content_id").notNull(),
}, (table) => [
	foreignKey({
			columns: [table.questId],
			foreignColumns: [quests.id],
			name: "quest_contents_quest_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.contentId],
			foreignColumns: [contents.id],
			name: "quest_contents_content_id_fkey"
		}).onDelete("cascade"),
	primaryKey({ columns: [table.questId, table.contentId], name: "quest_contents_pkey"}),
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

export const contentGenres = pgTable("content_genres", {
	contentId: uuid("content_id").notNull(),
	genreId: uuid("genre_id").notNull(),
	isPrimary: boolean("is_primary").default(false).notNull(),
}, (table) => [
	index("idx_content_genres_genre").using("btree", table.genreId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.contentId],
			foreignColumns: [contents.id],
			name: "content_genres_content_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.genreId],
			foreignColumns: [genres.id],
			name: "content_genres_genre_id_fkey"
		}).onDelete("cascade"),
	primaryKey({ columns: [table.contentId, table.genreId], name: "content_genres_pkey"}),
]);

export const contentWatchlist = pgTable("content_watchlist", {
	userId: uuid("user_id").notNull(),
	contentId: uuid("content_id").notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_content_watchlist_content").using("btree", table.contentId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "content_watchlist_user_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.contentId],
			foreignColumns: [contents.id],
			name: "content_watchlist_content_id_fkey"
		}).onDelete("cascade"),
	primaryKey({ columns: [table.userId, table.contentId], name: "content_watchlist_pkey"}),
]);

export const userBadges = pgTable("user_badges", {
	userId: uuid("user_id").notNull(),
	badgeId: uuid("badge_id").notNull(),
	earnedAt: timestamp("earned_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_user_badges_badge").using("btree", table.badgeId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "user_badges_user_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.badgeId],
			foreignColumns: [badges.id],
			name: "user_badges_badge_id_fkey"
		}).onDelete("cascade"),
	primaryKey({ columns: [table.userId, table.badgeId], name: "user_badges_pkey"}),
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

export const commentReactions = pgTable("comment_reactions", {
	commentId: uuid("comment_id").notNull(),
	userId: uuid("user_id").notNull(),
	reaction: varchar({ length: 10 }).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "comment_reactions_user_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.commentId],
			foreignColumns: [comments.id],
			name: "comment_reactions_comment_id_fkey"
		}).onDelete("cascade"),
	primaryKey({ columns: [table.commentId, table.userId], name: "comment_reactions_pkey"}),
	check("comment_reactions_reaction_check", sql`(reaction)::text = ANY ((ARRAY['like'::character varying, 'dislike'::character varying])::text[])`),
]);

export const questContentProgress = pgTable("quest_content_progress", {
	questId: uuid("quest_id").notNull(),
	userId: uuid("user_id").notNull(),
	contentId: uuid("content_id").notNull(),
	completedAt: timestamp("completed_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.questId],
			foreignColumns: [quests.id],
			name: "quest_content_progress_quest_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "quest_content_progress_user_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.contentId],
			foreignColumns: [contents.id],
			name: "quest_content_progress_content_id_fkey"
		}).onDelete("cascade"),
	primaryKey({ columns: [table.questId, table.userId, table.contentId], name: "quest_content_progress_pkey"}),
]);

export const leaderboardMonthly = pgTable("leaderboard_monthly", {
	periodMonth: date("period_month").notNull(),
	userId: uuid("user_id").notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	xpEarned: bigint("xp_earned", { mode: "number" }).default(0).notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("idx_leaderboard_monthly_rank").using("btree", table.periodMonth.asc().nullsLast().op("date_ops"), table.xpEarned.desc().nullsFirst().op("int8_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "leaderboard_monthly_user_id_fkey"
		}).onDelete("cascade"),
	primaryKey({ columns: [table.periodMonth, table.userId], name: "leaderboard_monthly_pkey"}),
]);

export const userMetrics = pgTable("user_metrics", {
	userId: uuid("user_id").notNull(),
	metricKey: varchar("metric_key", { length: 50 }).notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	value: bigint({ mode: "number" }).default(0).notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "user_metrics_user_id_fkey"
		}).onDelete("cascade"),
	primaryKey({ columns: [table.userId, table.metricKey], name: "user_metrics_pkey"}),
]);

export const contentCast = pgTable("content_cast", {
	contentId: uuid("content_id").notNull(),
	personId: uuid("person_id").notNull(),
	role: varchar({ length: 20 }).default('actor').notNull(),
	characterName: varchar("character_name", { length: 200 }),
	billingOrder: integer("billing_order").default(0).notNull(),
}, (table) => [
	index("idx_content_cast_person").using("btree", table.personId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.contentId],
			foreignColumns: [contents.id],
			name: "content_cast_content_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.personId],
			foreignColumns: [people.id],
			name: "content_cast_person_id_fkey"
		}).onDelete("cascade"),
	primaryKey({ columns: [table.contentId, table.personId, table.role], name: "content_cast_pkey"}),
	check("content_cast_role_check", sql`(role)::text = ANY ((ARRAY['actor'::character varying, 'director'::character varying, 'writer'::character varying, 'producer'::character varying, 'other'::character varying])::text[])`),
]);

export const contentProgress = pgTable("content_progress", {
	userId: uuid("user_id").notNull(),
	contentId: uuid("content_id").notNull(),
	lastPositionSeconds: integer("last_position_seconds").default(0).notNull(),
	isCompleted: boolean("is_completed").default(false).notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "content_progress_user_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.contentId],
			foreignColumns: [contents.id],
			name: "content_progress_content_id_fkey"
		}).onDelete("cascade"),
	primaryKey({ columns: [table.userId, table.contentId], name: "content_progress_pkey"}),
]);

export const questParticipations = pgTable("quest_participations", {
	questId: uuid("quest_id").notNull(),
	userId: uuid("user_id").notNull(),
	completedCount: integer("completed_count").default(0).notNull(),
	isCompleted: boolean("is_completed").default(false).notNull(),
	completedAt: timestamp("completed_at", { withTimezone: true, mode: 'string' }),
	rewardedAt: timestamp("rewarded_at", { withTimezone: true, mode: 'string' }),
}, (table) => [
	foreignKey({
			columns: [table.questId],
			foreignColumns: [quests.id],
			name: "quest_participations_quest_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "quest_participations_user_id_fkey"
		}).onDelete("cascade"),
	primaryKey({ columns: [table.questId, table.userId], name: "quest_participations_pkey"}),
]);

export const contentWatchEventsDefault = pgTable("content_watch_events_default", {
	id: uuid().default(sql`uuidv7()`).notNull(),
	contentId: uuid("content_id").notNull(),
	userId: uuid("user_id").notNull(),
	viewId: uuid("view_id"),
	eventType: varchar("event_type", { length: 15 }).notNull(),
	positionSeconds: integer("position_seconds").default(0).notNull(),
	occurredAt: timestamp("occurred_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("content_watch_events_default_content_id_occurred_at_idx").using("btree", table.contentId.asc().nullsLast().op("timestamptz_ops"), table.occurredAt.asc().nullsLast().op("uuid_ops")),
	index("content_watch_events_default_user_id_occurred_at_idx").using("btree", table.userId.asc().nullsLast().op("timestamptz_ops"), table.occurredAt.asc().nullsLast().op("timestamptz_ops")),
	index("content_watch_events_default_view_id_idx").using("btree", table.viewId.asc().nullsLast().op("uuid_ops")),
	primaryKey({ columns: [table.id, table.occurredAt], name: "content_watch_events_default_pkey"}),
	check("content_watch_events_event_type_check", sql`(event_type)::text = ANY ((ARRAY['play'::character varying, 'pause'::character varying, 'seek'::character varying, 'heartbeat'::character varying, 'complete'::character varying])::text[])`),
]);

export const userDailyActivity = pgTable("user_daily_activity", {
	userId: uuid("user_id").notNull(),
	activityDate: date("activity_date").notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	watchSeconds: bigint("watch_seconds", { mode: "number" }).default(0).notNull(),
	videosStarted: integer("videos_started").default(0).notNull(),
	videosCompleted: integer("videos_completed").default(0).notNull(),
	contentsWatched: integer("contents_watched").default(0).notNull(),
	firstSeenAt: timestamp("first_seen_at", { withTimezone: true, mode: 'string' }),
	lastSeenAt: timestamp("last_seen_at", { withTimezone: true, mode: 'string' }),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "user_daily_activity_user_id_fkey"
		}).onDelete("cascade"),
	primaryKey({ columns: [table.userId, table.activityDate], name: "user_daily_activity_pkey"}),
]);

export const contentDailyStats = pgTable("content_daily_stats", {
	contentId: uuid("content_id").notNull(),
	statDate: date("stat_date").notNull(),
	views: integer().default(0).notNull(),
	uniqueViewers: integer("unique_viewers").default(0).notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	watchSeconds: bigint("watch_seconds", { mode: "number" }).default(0).notNull(),
	avgCompletion: numeric("avg_completion", { precision: 5, scale:  2 }).default('0').notNull(),
	likes: integer().default(0).notNull(),
	comments: integer().default(0).notNull(),
	shares: integer().default(0).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.contentId],
			foreignColumns: [contents.id],
			name: "content_daily_stats_content_id_fkey"
		}).onDelete("cascade"),
	primaryKey({ columns: [table.contentId, table.statDate], name: "content_daily_stats_pkey"}),
]);
