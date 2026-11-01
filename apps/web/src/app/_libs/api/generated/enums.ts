/* UI demo build: request-parameter enums and request types the screens import, copied from the
 * generated API classes (`pnpm api:sync` output in the real app). Types and constants only. */
import type {
  PersonKnownFor,
  TaxonomySort,
} from "./models/index";

/**
 * @export
 */
export const AdminPredictionControllerListV1StatusEnum = {
    Draft: 'draft',
    Scheduled: 'scheduled',
    Open: 'open',
    Locked: 'locked',
    Paying: 'paying',
    Resolved: 'resolved',
    Cancelled: 'cancelled',
    Archived: 'archived'
} as const;
export type AdminPredictionControllerListV1StatusEnum = typeof AdminPredictionControllerListV1StatusEnum[keyof typeof AdminPredictionControllerListV1StatusEnum];

/**
 * @export
 */
export const AdminQuestControllerListV1StatusEnum = {
    Draft: 'draft',
    Scheduled: 'scheduled',
    Active: 'active',
    Ended: 'ended',
    Cancelled: 'cancelled',
    Archived: 'archived'
} as const;
export type AdminQuestControllerListV1StatusEnum = typeof AdminQuestControllerListV1StatusEnum[keyof typeof AdminQuestControllerListV1StatusEnum];

/**
 * @export
 */
export const AdminContentControllerListV1SortEnum = {
    Newest: 'newest',
    Oldest: 'oldest',
    MostViewed: 'most_viewed',
    LeastViewed: 'least_viewed',
    RecentlyUpdated: 'recently_updated',
    ScheduledAsc: 'scheduled_asc',
    LicenseExpiryAsc: 'license_expiry_asc',
    TitleAsc: 'title_asc'
} as const;
export type AdminContentControllerListV1SortEnum = typeof AdminContentControllerListV1SortEnum[keyof typeof AdminContentControllerListV1SortEnum];

/**
 * @export
 */
export const AdminContentControllerListV1RegionEnum = {
    Na: 'NA',
    Eu: 'EU',
    Apac: 'APAC',
    Latam: 'LATAM',
    Mea: 'MEA'
} as const;
export type AdminContentControllerListV1RegionEnum = typeof AdminContentControllerListV1RegionEnum[keyof typeof AdminContentControllerListV1RegionEnum];

/**
 * @export
 */
export const AdminContentControllerListV1ContentTypeEnum = {
    Trailer: 'trailer',
    Bts: 'bts',
    Clip: 'clip'
} as const;
export type AdminContentControllerListV1ContentTypeEnum = typeof AdminContentControllerListV1ContentTypeEnum[keyof typeof AdminContentControllerListV1ContentTypeEnum];

export interface AdminContentControllerListV1Request {
    page?: number;
    limit?: number;
    status?: Array<string>;
    contentType?: AdminContentControllerListV1ContentTypeEnum;
    studioId?: string;
    parentContentId?: string;
    hasParent?: boolean;
    q?: string;
    region?: AdminContentControllerListV1RegionEnum;
    isBoosted?: boolean;
    isSponsored?: boolean;
    licenseStatus?: Array<string>;
    createdFrom?: string;
    createdTo?: string;
    scheduledFrom?: string;
    scheduledTo?: string;
    licenseExpiresFrom?: string;
    licenseExpiresTo?: string;
    sort?: AdminContentControllerListV1SortEnum;
}

/**
 * @export
 */
export const AdminQuestControllerParticipantsV1StatusEnum = {
    InProgress: 'in_progress',
    Completed: 'completed',
    Claimed: 'claimed'
} as const;
export type AdminQuestControllerParticipantsV1StatusEnum = typeof AdminQuestControllerParticipantsV1StatusEnum[keyof typeof AdminQuestControllerParticipantsV1StatusEnum];

/**
 * @export
 */
export const AdminPredictionControllerEntriesV1ResultEnum = {
    Correct: 'correct',
    Incorrect: 'incorrect',
    Pending: 'pending'
} as const;
export type AdminPredictionControllerEntriesV1ResultEnum = typeof AdminPredictionControllerEntriesV1ResultEnum[keyof typeof AdminPredictionControllerEntriesV1ResultEnum];

/**
 * @export
 */
export const AdminContentInsightsControllerStatsV1RegionEnum = {
    Na: 'NA',
    Eu: 'EU',
    Apac: 'APAC',
    Latam: 'LATAM',
    Mea: 'MEA'
} as const;
export type AdminContentInsightsControllerStatsV1RegionEnum = typeof AdminContentInsightsControllerStatsV1RegionEnum[keyof typeof AdminContentInsightsControllerStatsV1RegionEnum];

/**
 * @export
 */
export const AdminContentInsightsControllerRecommendedActionsV1RegionEnum = {
    Na: 'NA',
    Eu: 'EU',
    Apac: 'APAC',
    Latam: 'LATAM',
    Mea: 'MEA'
} as const;
export type AdminContentInsightsControllerRecommendedActionsV1RegionEnum = typeof AdminContentInsightsControllerRecommendedActionsV1RegionEnum[keyof typeof AdminContentInsightsControllerRecommendedActionsV1RegionEnum];

/**
 * @export
 */
export const AdminContentInsightsControllerLicensesV1SortEnum = {
    ExpiresAsc: 'expires_asc',
    RevenueDesc: 'revenue_desc',
    CostDesc: 'cost_desc',
    RoiDesc: 'roi_desc'
} as const;
export type AdminContentInsightsControllerLicensesV1SortEnum = typeof AdminContentInsightsControllerLicensesV1SortEnum[keyof typeof AdminContentInsightsControllerLicensesV1SortEnum];

/**
 * @export
 */
export const AdminContentInsightsControllerLicensesV1LicenseTypeEnum = {
    Exclusive: 'exclusive',
    NonExclusive: 'non_exclusive'
} as const;
export type AdminContentInsightsControllerLicensesV1LicenseTypeEnum = typeof AdminContentInsightsControllerLicensesV1LicenseTypeEnum[keyof typeof AdminContentInsightsControllerLicensesV1LicenseTypeEnum];

/**
 * @export
 */
export const AdminContentInsightsControllerLicensesV1RenewalStatusEnum = {
    Renewing: 'renewing',
    InNegotiation: 'in_negotiation',
    Expiring: 'expiring',
    Lapsed: 'lapsed',
    AutoRenew: 'auto_renew'
} as const;
export type AdminContentInsightsControllerLicensesV1RenewalStatusEnum = typeof AdminContentInsightsControllerLicensesV1RenewalStatusEnum[keyof typeof AdminContentInsightsControllerLicensesV1RenewalStatusEnum];

export interface AdminContentInsightsControllerLicensesV1Request {
    page?: number;
    limit?: number;
    q?: string;
    expiresWithinDays?: number;
    renewalStatus?: AdminContentInsightsControllerLicensesV1RenewalStatusEnum;
    licenseType?: AdminContentInsightsControllerLicensesV1LicenseTypeEnum;
    sort?: AdminContentInsightsControllerLicensesV1SortEnum;
}

/**
 * @export
 */
export const AdminAdSalesControllerListCampaignsV1RegionEnum = {
    Na: 'NA',
    Eu: 'EU',
    Apac: 'APAC',
    Latam: 'LATAM',
    Mea: 'MEA'
} as const;
export type AdminAdSalesControllerListCampaignsV1RegionEnum = typeof AdminAdSalesControllerListCampaignsV1RegionEnum[keyof typeof AdminAdSalesControllerListCampaignsV1RegionEnum];

/**
 * @export
 */
export const AdminAdSalesControllerListCampaignsV1TypeEnum = {
    Commercial: 'commercial',
    Sponsorship: 'sponsorship'
} as const;
export type AdminAdSalesControllerListCampaignsV1TypeEnum = typeof AdminAdSalesControllerListCampaignsV1TypeEnum[keyof typeof AdminAdSalesControllerListCampaignsV1TypeEnum];

export interface AdminAdSalesControllerListCampaignsV1Request {
    page?: number;
    limit?: number;
    advertiserId?: string;
    type?: AdminAdSalesControllerListCampaignsV1TypeEnum;
    status?: Array<string>;
    region?: AdminAdSalesControllerListCampaignsV1RegionEnum;
    q?: string;
    from?: string;
    to?: string;
}

/**
 * @export
 */
export const AdminAdSalesControllerSummaryV1RegionEnum = {
    Na: 'NA',
    Eu: 'EU',
    Apac: 'APAC',
    Latam: 'LATAM',
    Mea: 'MEA'
} as const;
export type AdminAdSalesControllerSummaryV1RegionEnum = typeof AdminAdSalesControllerSummaryV1RegionEnum[keyof typeof AdminAdSalesControllerSummaryV1RegionEnum];

export interface AdminAdSalesControllerSummaryV1Request {
    from?: string;
    to?: string;
    region?: AdminAdSalesControllerSummaryV1RegionEnum;
}

/**
 * @export
 */
export const AdminAdSalesControllerRankBoardV1RegionEnum = {
    Na: 'NA',
    Eu: 'EU',
    Apac: 'APAC',
    Latam: 'LATAM',
    Mea: 'MEA'
} as const;
export type AdminAdSalesControllerRankBoardV1RegionEnum = typeof AdminAdSalesControllerRankBoardV1RegionEnum[keyof typeof AdminAdSalesControllerRankBoardV1RegionEnum];

export interface AdminAdSalesControllerRankBoardV1Request {
    region: AdminAdSalesControllerRankBoardV1RegionEnum;
    from?: string;
    to?: string;
}

/**
 * @export
 */
export const AdminAdSalesControllerCampaignPerformanceV1RegionEnum = {
    Na: 'NA',
    Eu: 'EU',
    Apac: 'APAC',
    Latam: 'LATAM',
    Mea: 'MEA'
} as const;
export type AdminAdSalesControllerCampaignPerformanceV1RegionEnum = typeof AdminAdSalesControllerCampaignPerformanceV1RegionEnum[keyof typeof AdminAdSalesControllerCampaignPerformanceV1RegionEnum];

export interface AdminAdSalesControllerCampaignPerformanceV1Request {
    id: string;
    from?: string;
    to?: string;
    region?: AdminAdSalesControllerCampaignPerformanceV1RegionEnum;
}

export interface AdminAdminsControllerListV1Request {
    page?: number;
    pageSize?: number;
    search?: string;
    status?: string;
}

export interface AdminAnalyticsControllerContentLibraryV1Request {
    from?: string;
    to?: string;
    region?: string;
    hitThreshold?: number;
}

export interface AdminAnalyticsControllerContentV1Request {
    id: string;
    from?: string;
    to?: string;
}

export interface AdminTaxonomyControllerGenresV1Request {
    q?: string;
    sort?: TaxonomySort;
}

export interface AdminTaxonomyControllerPeopleV1Request {
    q?: string;
    sort?: TaxonomySort;
    page?: number;
    limit?: number;
    knownFor?: PersonKnownFor;
}

export interface AdminTaxonomyControllerStudiosV1Request {
    q?: string;
    sort?: TaxonomySort;
}

export interface AdminTaxonomyControllerTagsV1Request {
    q?: string;
    sort?: TaxonomySort;
    page?: number;
    limit?: number;
}
