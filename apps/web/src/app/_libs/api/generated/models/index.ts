/* tslint:disable */
/* eslint-disable */
/**
 * 
 * @export
 * @interface AccessControllerEntitlementV1200Response
 */
export interface AccessControllerEntitlementV1200Response {
    /**
     * 
     * @type {number}
     * @memberof AccessControllerEntitlementV1200Response
     */
    statusCode: number;
    /**
     * 
     * @type {string}
     * @memberof AccessControllerEntitlementV1200Response
     */
    status: string;
    /**
     * 
     * @type {string}
     * @memberof AccessControllerEntitlementV1200Response
     */
    message: string;
    /**
     * Error details, or null on success
     * @type {object}
     * @memberof AccessControllerEntitlementV1200Response
     */
    error: object | null;
    /**
     * 
     * @type {EntitlementDto}
     * @memberof AccessControllerEntitlementV1200Response
     */
    data?: EntitlementDto;
}
/**
 * 
 * @export
 * @interface AccessControllerUnlockV1200Response
 */
export interface AccessControllerUnlockV1200Response {
    /**
     * 
     * @type {number}
     * @memberof AccessControllerUnlockV1200Response
     */
    statusCode: number;
    /**
     * 
     * @type {string}
     * @memberof AccessControllerUnlockV1200Response
     */
    status: string;
    /**
     * 
     * @type {string}
     * @memberof AccessControllerUnlockV1200Response
     */
    message: string;
    /**
     * Error details, or null on success
     * @type {object}
     * @memberof AccessControllerUnlockV1200Response
     */
    error: object | null;
    /**
     * 
     * @type {UnlockResultDto}
     * @memberof AccessControllerUnlockV1200Response
     */
    data?: UnlockResultDto;
}
/**
 * 
 * @export
 * @interface AccessDto
 */
export interface AccessDto {
    /**
     * Has an active subscription (gates premium app access)
     * @type {boolean}
     * @memberof AccessDto
     */
    isSubscribed: boolean;
    /**
     * 
     * @type {string}
     * @memberof AccessDto
     */
    tier: AccessDtoTierEnum;
    /**
     * 
     * @type {string}
     * @memberof AccessDto
     */
    planName?: string | null;
}


/**
 * @export
 */
export const AccessDtoTierEnum = {
    Free: 'free',
    Premium: 'premium'
} as const;
export type AccessDtoTierEnum = typeof AccessDtoTierEnum[keyof typeof AccessDtoTierEnum];

/**
 * 
 * @export
 * @interface ActorRefDto
 */
export interface ActorRefDto {
    /**
     * 
     * @type {string}
     * @memberof ActorRefDto
     */
    id: string;
    /**
     * 
     * @type {string}
     * @memberof ActorRefDto
     */
    name?: string | null;
}
/**
 * 
 * @export
 * @interface AdCampaignDetailDto
 */
export interface AdCampaignDetailDto {
    /**
     * 
     * @type {string}
     * @memberof AdCampaignDetailDto
     */
    id: string;
    /**
     * 
     * @type {string}
     * @memberof AdCampaignDetailDto
     */
    advertiserId: string;
    /**
     * 
     * @type {string}
     * @memberof AdCampaignDetailDto
     */
    advertiserName?: string;
    /**
     * 
     * @type {string}
     * @memberof AdCampaignDetailDto
     */
    name: string;
    /**
     * 
     * @type {string}
     * @memberof AdCampaignDetailDto
     */
    type: AdCampaignDetailDtoTypeEnum;
    /**
     * 
     * @type {string}
     * @memberof AdCampaignDetailDto
     */
    status: AdCampaignDetailDtoStatusEnum;
    /**
     * 
     * @type {string}
     * @memberof AdCampaignDetailDto
     */
    startsAt?: string | null;
    /**
     * 
     * @type {string}
     * @memberof AdCampaignDetailDto
     */
    endsAt?: string | null;
    /**
     * 
     * @type {Array<string>}
     * @memberof AdCampaignDetailDto
     */
    regions: Array<string>;
    /**
     * Feed rank per region (commercials only)
     * @type {RegionRanksDto}
     * @memberof AdCampaignDetailDto
     */
    ranks: RegionRanksDto;
    /**
     * Rank in the list's region filter
     * @type {number}
     * @memberof AdCampaignDetailDto
     */
    rank?: number | null;
    /**
     * 
     * @type {string}
     * @memberof AdCampaignDetailDto
     */
    caption?: string | null;
    /**
     * 
     * @type {string}
     * @memberof AdCampaignDetailDto
     */
    creativeMediaId?: string | null;
    /**
     * 
     * @type {string}
     * @memberof AdCampaignDetailDto
     */
    clickUrl?: string | null;
    /**
     * 
     * @type {string}
     * @memberof AdCampaignDetailDto
     */
    ctaLabel?: string | null;
    /**
     * 
     * @type {number}
     * @memberof AdCampaignDetailDto
     */
    durationSeconds?: number | null;
    /**
     * 
     * @type {number}
     * @memberof AdCampaignDetailDto
     */
    skippableAfterSeconds?: number | null;
    /**
     * 
     * @type {number}
     * @memberof AdCampaignDetailDto
     */
    frequencyCapPerUserDay?: number | null;
    /**
     * 
     * @type {string}
     * @memberof AdCampaignDetailDto
     */
    pricingModel: AdCampaignDetailDtoPricingModelEnum;
    /**
     * 
     * @type {number}
     * @memberof AdCampaignDetailDto
     */
    flatFeeCents: number;
    /**
     * 
     * @type {number}
     * @memberof AdCampaignDetailDto
     */
    cpmCents: number;
    /**
     * 
     * @type {number}
     * @memberof AdCampaignDetailDto
     */
    cpcCents: number;
    /**
     * 
     * @type {number}
     * @memberof AdCampaignDetailDto
     */
    budgetCents?: number | null;
    /**
     * 
     * @type {number}
     * @memberof AdCampaignDetailDto
     */
    dailyBudgetCents?: number | null;
    /**
     * 
     * @type {number}
     * @memberof AdCampaignDetailDto
     */
    impressionGoal?: number | null;
    /**
     * 
     * @type {string}
     * @memberof AdCampaignDetailDto
     */
    currency: string;
    /**
     * ends_at | budget | impression_goal | manual
     * @type {string}
     * @memberof AdCampaignDetailDto
     */
    endedReason?: string | null;
    /**
     * 
     * @type {string}
     * @memberof AdCampaignDetailDto
     */
    notes?: string | null;
    /**
     * 
     * @type {number}
     * @memberof AdCampaignDetailDto
     */
    linkedContents?: number;
    /**
     * 
     * @type {DeliveryDto}
     * @memberof AdCampaignDetailDto
     */
    delivery?: DeliveryDto;
    /**
     * Delivered ÷ budget (0..1), null without budget
     * @type {number}
     * @memberof AdCampaignDetailDto
     */
    budgetUsed?: number | null;
    /**
     * 
     * @type {string}
     * @memberof AdCampaignDetailDto
     */
    createdAt: string;
    /**
     * 
     * @type {string}
     * @memberof AdCampaignDetailDto
     */
    updatedAt: string;
    /**
     * 
     * @type {Array<AdLinkedContentDto>}
     * @memberof AdCampaignDetailDto
     */
    contents: Array<AdLinkedContentDto>;
    /**
     * 
     * @type {LedgerTotalsDto}
     * @memberof AdCampaignDetailDto
     */
    ledger: LedgerTotalsDto;
}


/**
 * @export
 */
export const AdCampaignDetailDtoTypeEnum = {
    Commercial: 'commercial',
    Sponsorship: 'sponsorship'
} as const;
export type AdCampaignDetailDtoTypeEnum = typeof AdCampaignDetailDtoTypeEnum[keyof typeof AdCampaignDetailDtoTypeEnum];

/**
 * @export
 */
export const AdCampaignDetailDtoStatusEnum = {
    Draft: 'draft',
    Scheduled: 'scheduled',
    Active: 'active',
    Paused: 'paused',
    Ended: 'ended'
} as const;
export type AdCampaignDetailDtoStatusEnum = typeof AdCampaignDetailDtoStatusEnum[keyof typeof AdCampaignDetailDtoStatusEnum];

/**
 * @export
 */
export const AdCampaignDetailDtoPricingModelEnum = {
    Flat: 'flat',
    Cpm: 'cpm',
    Cpc: 'cpc'
} as const;
export type AdCampaignDetailDtoPricingModelEnum = typeof AdCampaignDetailDtoPricingModelEnum[keyof typeof AdCampaignDetailDtoPricingModelEnum];

/**
 * 
 * @export
 * @interface AdCampaignDto
 */
export interface AdCampaignDto {
    /**
     * 
     * @type {string}
     * @memberof AdCampaignDto
     */
    id: string;
    /**
     * 
     * @type {string}
     * @memberof AdCampaignDto
     */
    advertiserId: string;
    /**
     * 
     * @type {string}
     * @memberof AdCampaignDto
     */
    advertiserName?: string;
    /**
     * 
     * @type {string}
     * @memberof AdCampaignDto
     */
    name: string;
    /**
     * 
     * @type {string}
     * @memberof AdCampaignDto
     */
    type: AdCampaignDtoTypeEnum;
    /**
     * 
     * @type {string}
     * @memberof AdCampaignDto
     */
    status: AdCampaignDtoStatusEnum;
    /**
     * 
     * @type {string}
     * @memberof AdCampaignDto
     */
    startsAt?: string | null;
    /**
     * 
     * @type {string}
     * @memberof AdCampaignDto
     */
    endsAt?: string | null;
    /**
     * 
     * @type {Array<string>}
     * @memberof AdCampaignDto
     */
    regions: Array<string>;
    /**
     * Feed rank per region (commercials only)
     * @type {RegionRanksDto}
     * @memberof AdCampaignDto
     */
    ranks: RegionRanksDto;
    /**
     * Rank in the list's region filter
     * @type {number}
     * @memberof AdCampaignDto
     */
    rank?: number | null;
    /**
     * 
     * @type {string}
     * @memberof AdCampaignDto
     */
    caption?: string | null;
    /**
     * 
     * @type {string}
     * @memberof AdCampaignDto
     */
    creativeMediaId?: string | null;
    /**
     * 
     * @type {string}
     * @memberof AdCampaignDto
     */
    clickUrl?: string | null;
    /**
     * 
     * @type {string}
     * @memberof AdCampaignDto
     */
    ctaLabel?: string | null;
    /**
     * 
     * @type {number}
     * @memberof AdCampaignDto
     */
    durationSeconds?: number | null;
    /**
     * 
     * @type {number}
     * @memberof AdCampaignDto
     */
    skippableAfterSeconds?: number | null;
    /**
     * 
     * @type {number}
     * @memberof AdCampaignDto
     */
    frequencyCapPerUserDay?: number | null;
    /**
     * 
     * @type {string}
     * @memberof AdCampaignDto
     */
    pricingModel: AdCampaignDtoPricingModelEnum;
    /**
     * 
     * @type {number}
     * @memberof AdCampaignDto
     */
    flatFeeCents: number;
    /**
     * 
     * @type {number}
     * @memberof AdCampaignDto
     */
    cpmCents: number;
    /**
     * 
     * @type {number}
     * @memberof AdCampaignDto
     */
    cpcCents: number;
    /**
     * 
     * @type {number}
     * @memberof AdCampaignDto
     */
    budgetCents?: number | null;
    /**
     * 
     * @type {number}
     * @memberof AdCampaignDto
     */
    dailyBudgetCents?: number | null;
    /**
     * 
     * @type {number}
     * @memberof AdCampaignDto
     */
    impressionGoal?: number | null;
    /**
     * 
     * @type {string}
     * @memberof AdCampaignDto
     */
    currency: string;
    /**
     * ends_at | budget | impression_goal | manual
     * @type {string}
     * @memberof AdCampaignDto
     */
    endedReason?: string | null;
    /**
     * 
     * @type {string}
     * @memberof AdCampaignDto
     */
    notes?: string | null;
    /**
     * 
     * @type {number}
     * @memberof AdCampaignDto
     */
    linkedContents?: number;
    /**
     * 
     * @type {DeliveryDto}
     * @memberof AdCampaignDto
     */
    delivery?: DeliveryDto;
    /**
     * Delivered ÷ budget (0..1), null without budget
     * @type {number}
     * @memberof AdCampaignDto
     */
    budgetUsed?: number | null;
    /**
     * 
     * @type {string}
     * @memberof AdCampaignDto
     */
    createdAt: string;
    /**
     * 
     * @type {string}
     * @memberof AdCampaignDto
     */
    updatedAt: string;
}


/**
 * @export
 */
export const AdCampaignDtoTypeEnum = {
    Commercial: 'commercial',
    Sponsorship: 'sponsorship'
} as const;
export type AdCampaignDtoTypeEnum = typeof AdCampaignDtoTypeEnum[keyof typeof AdCampaignDtoTypeEnum];

/**
 * @export
 */
export const AdCampaignDtoStatusEnum = {
    Draft: 'draft',
    Scheduled: 'scheduled',
    Active: 'active',
    Paused: 'paused',
    Ended: 'ended'
} as const;
export type AdCampaignDtoStatusEnum = typeof AdCampaignDtoStatusEnum[keyof typeof AdCampaignDtoStatusEnum];

/**
 * @export
 */
export const AdCampaignDtoPricingModelEnum = {
    Flat: 'flat',
    Cpm: 'cpm',
    Cpc: 'cpc'
} as const;
export type AdCampaignDtoPricingModelEnum = typeof AdCampaignDtoPricingModelEnum[keyof typeof AdCampaignDtoPricingModelEnum];

/**
 * 
 * @export
 * @interface AdCampaignPerformanceDto
 */
export interface AdCampaignPerformanceDto {
    /**
     * 
     * @type {string}
     * @memberof AdCampaignPerformanceDto
     */
    from: string;
    /**
     * 
     * @type {string}
     * @memberof AdCampaignPerformanceDto
     */
    to: string;
    /**
     * 
     * @type {string}
     * @memberof AdCampaignPerformanceDto
     */
    campaignId: string;
    /**
     * 
     * @type {string}
     * @memberof AdCampaignPerformanceDto
     */
    status: AdCampaignPerformanceDtoStatusEnum;
    /**
     * The window
     * @type {DeliveryDto}
     * @memberof AdCampaignPerformanceDto
     */
    totals: DeliveryDto;
    /**
     * Since the campaign started
     * @type {DeliveryDto}
     * @memberof AdCampaignPerformanceDto
     */
    lifetime: DeliveryDto;
    /**
     * 
     * @type {AdPacingDto}
     * @memberof AdCampaignPerformanceDto
     */
    pacing: AdPacingDto;
    /**
     * 
     * @type {Array<AdDailyDeliveryDto>}
     * @memberof AdCampaignPerformanceDto
     */
    daily: Array<AdDailyDeliveryDto>;
    /**
     * Always 1, 2, 3, 4+ (zero-filled)
     * @type {Array<AdFrequencyBucketDto>}
     * @memberof AdCampaignPerformanceDto
     */
    frequency: Array<AdFrequencyBucketDto>;
    /**
     * Most impressions first
     * @type {Array<AdRegionDeliveryDto>}
     * @memberof AdCampaignPerformanceDto
     */
    byRegion: Array<AdRegionDeliveryDto>;
}


/**
 * @export
 */
export const AdCampaignPerformanceDtoStatusEnum = {
    Draft: 'draft',
    Scheduled: 'scheduled',
    Active: 'active',
    Paused: 'paused',
    Ended: 'ended'
} as const;
export type AdCampaignPerformanceDtoStatusEnum = typeof AdCampaignPerformanceDtoStatusEnum[keyof typeof AdCampaignPerformanceDtoStatusEnum];

/**
 * 
 * @export
 * @interface AdDailyDeliveryDto
 */
export interface AdDailyDeliveryDto {
    /**
     * 
     * @type {number}
     * @memberof AdDailyDeliveryDto
     */
    impressions: number;
    /**
     * 
     * @type {number}
     * @memberof AdDailyDeliveryDto
     */
    uniqueViewers: number;
    /**
     * 
     * @type {number}
     * @memberof AdDailyDeliveryDto
     */
    clicks: number;
    /**
     * 
     * @type {number}
     * @memberof AdDailyDeliveryDto
     */
    skips: number;
    /**
     * 
     * @type {number}
     * @memberof AdDailyDeliveryDto
     */
    completes: number;
    /**
     * CPM/CPC value delivered (cents)
     * @type {number}
     * @memberof AdDailyDeliveryDto
     */
    deliveredCents: number;
    /**
     * 
     * @type {number}
     * @memberof AdDailyDeliveryDto
     */
    ctr: number;
    /**
     * 
     * @type {number}
     * @memberof AdDailyDeliveryDto
     */
    completionRate: number;
    /**
     * UTC day (YYYY-MM-DD)
     * @type {string}
     * @memberof AdDailyDeliveryDto
     */
    day: string;
}
/**
 * 
 * @export
 * @interface AdDescriptorDto
 */
export interface AdDescriptorDto {
    /**
     * 
     * @type {string}
     * @memberof AdDescriptorDto
     */
    sponsorshipId: string;
    /**
     * 
     * @type {string}
     * @memberof AdDescriptorDto
     */
    adFormat: AdDescriptorDtoAdFormatEnum;
    /**
     * 
     * @type {string}
     * @memberof AdDescriptorDto
     */
    placement: AdDescriptorDtoPlacementEnum;
    /**
     * 
     * @type {string}
     * @memberof AdDescriptorDto
     */
    sponsorName: string;
    /**
     * 
     * @type {string}
     * @memberof AdDescriptorDto
     */
    bannerUrl?: string | null;
    /**
     * 
     * @type {string}
     * @memberof AdDescriptorDto
     */
    clickUrl?: string | null;
    /**
     * 
     * @type {string}
     * @memberof AdDescriptorDto
     */
    ctaLabel?: string | null;
    /**
     * 
     * @type {number}
     * @memberof AdDescriptorDto
     */
    adDurationSeconds: number;
    /**
     * 
     * @type {number}
     * @memberof AdDescriptorDto
     */
    skippableAfterSeconds?: number | null;
    /**
     * 
     * @type {number}
     * @memberof AdDescriptorDto
     */
    midRollAtSeconds?: number | null;
    /**
     * 
     * @type {AdOverlayWindowDto}
     * @memberof AdDescriptorDto
     */
    overlay?: AdOverlayWindowDto | null;
    /**
     * Signed video creative (when configured + ready)
     * @type {PlaybackDto}
     * @memberof AdDescriptorDto
     */
    creative?: PlaybackDto | null;
    /**
     * 
     * @type {string}
     * @memberof AdDescriptorDto
     */
    startsAt?: string | null;
    /**
     * 
     * @type {string}
     * @memberof AdDescriptorDto
     */
    endsAt?: string | null;
}


/**
 * @export
 */
export const AdDescriptorDtoAdFormatEnum = {
    Sponsored: 'sponsored',
    Commercial: 'commercial'
} as const;
export type AdDescriptorDtoAdFormatEnum = typeof AdDescriptorDtoAdFormatEnum[keyof typeof AdDescriptorDtoAdFormatEnum];

/**
 * @export
 */
export const AdDescriptorDtoPlacementEnum = {
    PreRoll: 'pre-roll',
    MidRoll: 'mid-roll',
    PostRoll: 'post-roll',
    Overlay: 'overlay'
} as const;
export type AdDescriptorDtoPlacementEnum = typeof AdDescriptorDtoPlacementEnum[keyof typeof AdDescriptorDtoPlacementEnum];

/**
 * 
 * @export
 * @interface AdEventInputDto
 */
export interface AdEventInputDto {
    /**
     * Per-video sponsor ad (GET /v1/content/:id/ads). One of sponsorshipId / campaignId
     * @type {string}
     * @memberof AdEventInputDto
     */
    sponsorshipId?: string;
    /**
     * Feed commercial (GET /v1/ads/commercials/:campaignId)
     * @type {string}
     * @memberof AdEventInputDto
     */
    campaignId?: string;
    /**
     * 
     * @type {string}
     * @memberof AdEventInputDto
     */
    type: AdEventInputDtoTypeEnum;
    /**
     * View session id (POST /v1/content/:id/views → viewId) — dedupe key
     * @type {string}
     * @memberof AdEventInputDto
     */
    viewId: string;
    /**
     * 
     * @type {number}
     * @memberof AdEventInputDto
     */
    positionSeconds?: number;
    /**
     * Client time (ISO); default now; last 7 days … +5 min
     * @type {string}
     * @memberof AdEventInputDto
     */
    occurredAt?: string;
}


/**
 * @export
 */
export const AdEventInputDtoTypeEnum = {
    Impression: 'impression',
    Click: 'click',
    Skip: 'skip',
    Complete: 'complete'
} as const;
export type AdEventInputDtoTypeEnum = typeof AdEventInputDtoTypeEnum[keyof typeof AdEventInputDtoTypeEnum];

/**
 * 
 * @export
 * @interface AdFrequencyBucketDto
 */
export interface AdFrequencyBucketDto {
    /**
     * Times seen in the window
     * @type {string}
     * @memberof AdFrequencyBucketDto
     */
    seen: AdFrequencyBucketDtoSeenEnum;
    /**
     * Reached users who saw it that many times
     * @type {number}
     * @memberof AdFrequencyBucketDto
     */
    users: number;
    /**
     * users ÷ reached users (0..1)
     * @type {number}
     * @memberof AdFrequencyBucketDto
     */
    share: number;
}


/**
 * @export
 */
export const AdFrequencyBucketDtoSeenEnum = {
    _1: '1',
    _2: '2',
    _3: '3',
    _4: '4+'
} as const;
export type AdFrequencyBucketDtoSeenEnum = typeof AdFrequencyBucketDtoSeenEnum[keyof typeof AdFrequencyBucketDtoSeenEnum];

/**
 * 
 * @export
 * @interface AdKindDeliveryDto
 */
export interface AdKindDeliveryDto {
    /**
     * 
     * @type {string}
     * @memberof AdKindDeliveryDto
     */
    kind: AdKindDeliveryDtoKindEnum;
    /**
     * 
     * @type {number}
     * @memberof AdKindDeliveryDto
     */
    impressions: number;
    /**
     * Distinct users with an impression in the window
     * @type {number}
     * @memberof AdKindDeliveryDto
     */
    uniqueViewers: number;
    /**
     * 
     * @type {number}
     * @memberof AdKindDeliveryDto
     */
    clicks: number;
    /**
     * 
     * @type {number}
     * @memberof AdKindDeliveryDto
     */
    completes: number;
    /**
     * 
     * @type {number}
     * @memberof AdKindDeliveryDto
     */
    deliveredCents: number;
    /**
     * 
     * @type {number}
     * @memberof AdKindDeliveryDto
     */
    ctr: number;
}


/**
 * @export
 */
export const AdKindDeliveryDtoKindEnum = {
    Commercial: 'commercial',
    Sponsorship: 'sponsorship'
} as const;
export type AdKindDeliveryDtoKindEnum = typeof AdKindDeliveryDtoKindEnum[keyof typeof AdKindDeliveryDtoKindEnum];

/**
 * 
 * @export
 * @interface AdLinkedContentDto
 */
export interface AdLinkedContentDto {
    /**
     * 
     * @type {string}
     * @memberof AdLinkedContentDto
     */
    sponsorshipId: string;
    /**
     * 
     * @type {string}
     * @memberof AdLinkedContentDto
     */
    contentId: string;
    /**
     * 
     * @type {string}
     * @memberof AdLinkedContentDto
     */
    title: string;
    /**
     * 
     * @type {string}
     * @memberof AdLinkedContentDto
     */
    placement: string;
    /**
     * 
     * @type {boolean}
     * @memberof AdLinkedContentDto
     */
    isActive: boolean;
}
/**
 * 
 * @export
 * @interface AdMetricsDto
 */
export interface AdMetricsDto {
    /**
     * 
     * @type {number}
     * @memberof AdMetricsDto
     */
    impressions: number;
    /**
     * 
     * @type {number}
     * @memberof AdMetricsDto
     */
    uniqueViewers: number;
    /**
     * 
     * @type {number}
     * @memberof AdMetricsDto
     */
    clicks: number;
    /**
     * clicks / impressions (0..1)
     * @type {number}
     * @memberof AdMetricsDto
     */
    ctr: number;
    /**
     * 
     * @type {number}
     * @memberof AdMetricsDto
     */
    skips: number;
    /**
     * skips / impressions (0..1)
     * @type {number}
     * @memberof AdMetricsDto
     */
    skipRate: number;
    /**
     * 
     * @type {number}
     * @memberof AdMetricsDto
     */
    completes: number;
    /**
     * completes / impressions (0..1)
     * @type {number}
     * @memberof AdMetricsDto
     */
    completionRate: number;
    /**
     * flat + CPM/CPC revenue, cents
     * @type {number}
     * @memberof AdMetricsDto
     */
    revenueCents: number;
    /**
     * revenue per 1000 impressions, cents
     * @type {number}
     * @memberof AdMetricsDto
     */
    ecpmCents: number;
}
/**
 * 
 * @export
 * @interface AdOverlayWindowDto
 */
export interface AdOverlayWindowDto {
    /**
     * 
     * @type {number}
     * @memberof AdOverlayWindowDto
     */
    startSeconds: number;
    /**
     * null = until the end of the video
     * @type {number}
     * @memberof AdOverlayWindowDto
     */
    durationSeconds?: number | null;
}
/**
 * 
 * @export
 * @interface AdPacingDto
 */
export interface AdPacingDto {
    /**
     * 
     * @type {number}
     * @memberof AdPacingDto
     */
    budgetCents?: number | null;
    /**
     * Lifetime delivered ÷ budget (0..1)
     * @type {number}
     * @memberof AdPacingDto
     */
    budgetUsed?: number | null;
    /**
     * 
     * @type {number}
     * @memberof AdPacingDto
     */
    impressionGoal?: number | null;
    /**
     * Lifetime impressions ÷ goal (0..1)
     * @type {number}
     * @memberof AdPacingDto
     */
    goalUsed?: number | null;
    /**
     * Share of the flight already elapsed (0..1)
     * @type {number}
     * @memberof AdPacingDto
     */
    flightElapsed?: number | null;
}
/**
 * 
 * @export
 * @interface AdPerformanceItemDto
 */
export interface AdPerformanceItemDto {
    /**
     * 
     * @type {number}
     * @memberof AdPerformanceItemDto
     */
    impressions: number;
    /**
     * 
     * @type {number}
     * @memberof AdPerformanceItemDto
     */
    uniqueViewers: number;
    /**
     * 
     * @type {number}
     * @memberof AdPerformanceItemDto
     */
    clicks: number;
    /**
     * clicks / impressions (0..1)
     * @type {number}
     * @memberof AdPerformanceItemDto
     */
    ctr: number;
    /**
     * 
     * @type {number}
     * @memberof AdPerformanceItemDto
     */
    skips: number;
    /**
     * skips / impressions (0..1)
     * @type {number}
     * @memberof AdPerformanceItemDto
     */
    skipRate: number;
    /**
     * 
     * @type {number}
     * @memberof AdPerformanceItemDto
     */
    completes: number;
    /**
     * completes / impressions (0..1)
     * @type {number}
     * @memberof AdPerformanceItemDto
     */
    completionRate: number;
    /**
     * flat + CPM/CPC revenue, cents
     * @type {number}
     * @memberof AdPerformanceItemDto
     */
    revenueCents: number;
    /**
     * revenue per 1000 impressions, cents
     * @type {number}
     * @memberof AdPerformanceItemDto
     */
    ecpmCents: number;
    /**
     * 
     * @type {string}
     * @memberof AdPerformanceItemDto
     */
    sponsorshipId: string;
    /**
     * 
     * @type {string}
     * @memberof AdPerformanceItemDto
     */
    advertiserId?: string | null;
    /**
     * 
     * @type {string}
     * @memberof AdPerformanceItemDto
     */
    campaignId?: string | null;
    /**
     * 
     * @type {string}
     * @memberof AdPerformanceItemDto
     */
    contentId: string;
    /**
     * 
     * @type {string}
     * @memberof AdPerformanceItemDto
     */
    contentTitle: string;
    /**
     * 
     * @type {string}
     * @memberof AdPerformanceItemDto
     */
    sponsorName: string;
    /**
     * 
     * @type {string}
     * @memberof AdPerformanceItemDto
     */
    adFormat: AdPerformanceItemDtoAdFormatEnum;
    /**
     * 
     * @type {string}
     * @memberof AdPerformanceItemDto
     */
    placement: string;
    /**
     * 
     * @type {boolean}
     * @memberof AdPerformanceItemDto
     */
    isActive: boolean;
    /**
     * Active and inside its deal dates now
     * @type {boolean}
     * @memberof AdPerformanceItemDto
     */
    isLive: boolean;
    /**
     * 
     * @type {string}
     * @memberof AdPerformanceItemDto
     */
    startsAt?: string | null;
    /**
     * 
     * @type {string}
     * @memberof AdPerformanceItemDto
     */
    endsAt?: string | null;
    /**
     * 
     * @type {string}
     * @memberof AdPerformanceItemDto
     */
    currency: string;
}


/**
 * @export
 */
export const AdPerformanceItemDtoAdFormatEnum = {
    Sponsored: 'sponsored',
    Commercial: 'commercial'
} as const;
export type AdPerformanceItemDtoAdFormatEnum = typeof AdPerformanceItemDtoAdFormatEnum[keyof typeof AdPerformanceItemDtoAdFormatEnum];

/**
 * 
 * @export
 * @interface AdRegionDeliveryDto
 */
export interface AdRegionDeliveryDto {
    /**
     * Null when the event had no region
     * @type {string}
     * @memberof AdRegionDeliveryDto
     */
    region?: string | null;
    /**
     * 
     * @type {number}
     * @memberof AdRegionDeliveryDto
     */
    impressions: number;
    /**
     * 
     * @type {number}
     * @memberof AdRegionDeliveryDto
     */
    clicks: number;
    /**
     * clicks ÷ impressions (0..1)
     * @type {number}
     * @memberof AdRegionDeliveryDto
     */
    ctr: number;
    /**
     * This region's share of the window's impressions (0..1)
     * @type {number}
     * @memberof AdRegionDeliveryDto
     */
    share: number;
}
/**
 * 
 * @export
 * @interface AdSalesCommercialRowDto
 */
export interface AdSalesCommercialRowDto {
    /**
     * Campaign id
     * @type {string}
     * @memberof AdSalesCommercialRowDto
     */
    id: string;
    /**
     * 
     * @type {string}
     * @memberof AdSalesCommercialRowDto
     */
    name: string;
    /**
     * 
     * @type {string}
     * @memberof AdSalesCommercialRowDto
     */
    advertiserName: string;
    /**
     * 
     * @type {number}
     * @memberof AdSalesCommercialRowDto
     */
    impressions: number;
    /**
     * 
     * @type {number}
     * @memberof AdSalesCommercialRowDto
     */
    clicks: number;
    /**
     * clicks ÷ impressions (0..1)
     * @type {number}
     * @memberof AdSalesCommercialRowDto
     */
    ctr: number;
    /**
     * completes ÷ impressions (0..1)
     * @type {number}
     * @memberof AdSalesCommercialRowDto
     */
    completionRate: number;
}
/**
 * 
 * @export
 * @interface AdSalesCountsDto
 */
export interface AdSalesCountsDto {
    /**
     * 
     * @type {number}
     * @memberof AdSalesCountsDto
     */
    activeAdvertisers: number;
    /**
     * 
     * @type {number}
     * @memberof AdSalesCountsDto
     */
    activeCommercials: number;
    /**
     * 
     * @type {number}
     * @memberof AdSalesCountsDto
     */
    activeSponsorshipCampaigns: number;
    /**
     * 
     * @type {number}
     * @memberof AdSalesCountsDto
     */
    liveSponsoredVideos: number;
}
/**
 * 
 * @export
 * @interface AdSalesDailyImpressionsDto
 */
export interface AdSalesDailyImpressionsDto {
    /**
     * UTC day (YYYY-MM-DD)
     * @type {string}
     * @memberof AdSalesDailyImpressionsDto
     */
    day: string;
    /**
     * 
     * @type {number}
     * @memberof AdSalesDailyImpressionsDto
     */
    impressions: number;
}
/**
 * 
 * @export
 * @interface AdSalesDeliveryDto
 */
export interface AdSalesDeliveryDto {
    /**
     * 
     * @type {number}
     * @memberof AdSalesDeliveryDto
     */
    impressions: number;
    /**
     * 
     * @type {number}
     * @memberof AdSalesDeliveryDto
     */
    clicks: number;
    /**
     * 
     * @type {number}
     * @memberof AdSalesDeliveryDto
     */
    ctr: number;
    /**
     * 
     * @type {number}
     * @memberof AdSalesDeliveryDto
     */
    ecpmCents: number;
    /**
     * Commercial impressions ÷ feed ad slots (0..1)
     * @type {number}
     * @memberof AdSalesDeliveryDto
     */
    fillRate: number;
    /**
     * 
     * @type {AdKindDeliveryDto}
     * @memberof AdSalesDeliveryDto
     */
    commercial: AdKindDeliveryDto;
    /**
     * 
     * @type {AdKindDeliveryDto}
     * @memberof AdSalesDeliveryDto
     */
    sponsorship: AdKindDeliveryDto;
}
/**
 * 
 * @export
 * @interface AdSalesNeedsReviewRuleDto
 */
export interface AdSalesNeedsReviewRuleDto {
    /**
     * 
     * @type {number}
     * @memberof AdSalesNeedsReviewRuleDto
     */
    minImpressions: number;
    /**
     * Fraction — 0.01 = 1% CTR
     * @type {number}
     * @memberof AdSalesNeedsReviewRuleDto
     */
    maxCtr: number;
}
/**
 * 
 * @export
 * @interface AdSalesRegionDeliveryDto
 */
export interface AdSalesRegionDeliveryDto {
    /**
     * 
     * @type {string}
     * @memberof AdSalesRegionDeliveryDto
     */
    region: AdSalesRegionDeliveryDtoRegionEnum;
    /**
     * 
     * @type {number}
     * @memberof AdSalesRegionDeliveryDto
     */
    impressions: number;
    /**
     * 
     * @type {number}
     * @memberof AdSalesRegionDeliveryDto
     */
    clicks: number;
    /**
     * clicks ÷ impressions (0..1)
     * @type {number}
     * @memberof AdSalesRegionDeliveryDto
     */
    ctr: number;
}


/**
 * @export
 */
export const AdSalesRegionDeliveryDtoRegionEnum = {
    Na: 'NA',
    Eu: 'EU',
    Apac: 'APAC',
    Latam: 'LATAM',
    Mea: 'MEA'
} as const;
export type AdSalesRegionDeliveryDtoRegionEnum = typeof AdSalesRegionDeliveryDtoRegionEnum[keyof typeof AdSalesRegionDeliveryDtoRegionEnum];

/**
 * 
 * @export
 * @interface AdSalesRevenueDto
 */
export interface AdSalesRevenueDto {
    /**
     * Ledger booked + accrued − credit in the window
     * @type {number}
     * @memberof AdSalesRevenueDto
     */
    recognizedCents: number;
    /**
     * 
     * @type {number}
     * @memberof AdSalesRevenueDto
     */
    bookedCents: number;
    /**
     * 
     * @type {number}
     * @memberof AdSalesRevenueDto
     */
    accruedCents: number;
    /**
     * 
     * @type {number}
     * @memberof AdSalesRevenueDto
     */
    creditCents: number;
    /**
     * CPM/CPC value delivered in the window
     * @type {number}
     * @memberof AdSalesRevenueDto
     */
    deliveredCents: number;
    /**
     * All-time outstanding receivable
     * @type {number}
     * @memberof AdSalesRevenueDto
     */
    outstandingCents: number;
}
/**
 * 
 * @export
 * @interface AdSalesSummaryDto
 */
export interface AdSalesSummaryDto {
    /**
     * 
     * @type {string}
     * @memberof AdSalesSummaryDto
     */
    from: string;
    /**
     * 
     * @type {string}
     * @memberof AdSalesSummaryDto
     */
    to: string;
    /**
     * 
     * @type {string}
     * @memberof AdSalesSummaryDto
     */
    region?: AdSalesSummaryDtoRegionEnum | null;
    /**
     * 
     * @type {AdSalesRevenueDto}
     * @memberof AdSalesSummaryDto
     */
    revenue: AdSalesRevenueDto;
    /**
     * 
     * @type {AdSalesDeliveryDto}
     * @memberof AdSalesSummaryDto
     */
    delivery: AdSalesDeliveryDto;
    /**
     * 
     * @type {AdSalesCountsDto}
     * @memberof AdSalesSummaryDto
     */
    counts: AdSalesCountsDto;
    /**
     * 
     * @type {Array<AdSalesTopAdvertiserDto>}
     * @memberof AdSalesSummaryDto
     */
    topAdvertisers: Array<AdSalesTopAdvertiserDto>;
    /**
     * Commercial impressions per UTC day, zero-filled
     * @type {Array<AdSalesDailyImpressionsDto>}
     * @memberof AdSalesSummaryDto
     */
    daily: Array<AdSalesDailyImpressionsDto>;
    /**
     * Top 5 commercials by impressions in the window
     * @type {Array<AdSalesCommercialRowDto>}
     * @memberof AdSalesSummaryDto
     */
    topCommercials: Array<AdSalesCommercialRowDto>;
    /**
     * Commercials matching `needsReviewRule` (max 20)
     * @type {Array<AdSalesCommercialRowDto>}
     * @memberof AdSalesSummaryDto
     */
    needsReview: Array<AdSalesCommercialRowDto>;
    /**
     * 
     * @type {AdSalesNeedsReviewRuleDto}
     * @memberof AdSalesSummaryDto
     */
    needsReviewRule: AdSalesNeedsReviewRuleDto;
    /**
     * One entry per macro region, zero-filled
     * @type {Array<AdSalesRegionDeliveryDto>}
     * @memberof AdSalesSummaryDto
     */
    byRegion: Array<AdSalesRegionDeliveryDto>;
}


/**
 * @export
 */
export const AdSalesSummaryDtoRegionEnum = {
    Na: 'NA',
    Eu: 'EU',
    Apac: 'APAC',
    Latam: 'LATAM',
    Mea: 'MEA'
} as const;
export type AdSalesSummaryDtoRegionEnum = typeof AdSalesSummaryDtoRegionEnum[keyof typeof AdSalesSummaryDtoRegionEnum];

/**
 * 
 * @export
 * @interface AdSalesTopAdvertiserDto
 */
export interface AdSalesTopAdvertiserDto {
    /**
     * 
     * @type {string}
     * @memberof AdSalesTopAdvertiserDto
     */
    advertiserId: string;
    /**
     * 
     * @type {string}
     * @memberof AdSalesTopAdvertiserDto
     */
    name: string;
    /**
     * 
     * @type {number}
     * @memberof AdSalesTopAdvertiserDto
     */
    impressions: number;
    /**
     * 
     * @type {number}
     * @memberof AdSalesTopAdvertiserDto
     */
    clicks: number;
    /**
     * 
     * @type {number}
     * @memberof AdSalesTopAdvertiserDto
     */
    ctr: number;
}
/**
 * 
 * @export
 * @interface AdSlotDto
 */
export interface AdSlotDto {
    /**
     * 
     * @type {string}
     * @memberof AdSlotDto
     */
    campaignId: string;
    /**
     * true → client should skip this slot (see skipReason)
     * @type {boolean}
     * @memberof AdSlotDto
     */
    skip: boolean;
    /**
     * 
     * @type {string}
     * @memberof AdSlotDto
     */
    skipReason?: AdSlotDtoSkipReasonEnum | null;
    /**
     * 
     * @type {CommercialAdvertiserDto}
     * @memberof AdSlotDto
     */
    advertiser?: CommercialAdvertiserDto | null;
    /**
     * 
     * @type {PlaybackDto}
     * @memberof AdSlotDto
     */
    creative?: PlaybackDto | null;
    /**
     * 
     * @type {string}
     * @memberof AdSlotDto
     */
    clickUrl?: string | null;
    /**
     * 
     * @type {string}
     * @memberof AdSlotDto
     */
    ctaLabel?: string | null;
    /**
     * 
     * @type {number}
     * @memberof AdSlotDto
     */
    durationSeconds?: number | null;
    /**
     * 
     * @type {number}
     * @memberof AdSlotDto
     */
    skippableAfterSeconds?: number | null;
    /**
     * When this campaign stops being live (ISO). NOT the same as `expiresInSeconds`, which is only the signed-URL lifetime. Past this instant the ad must not be rendered, even from cache. null = no end date configured (runs until paused or out of budget).
     * @type {string}
     * @memberof AdSlotDto
     */
    campaignEndsAt?: string | null;
    /**
     * Position in the MERGED list (organic + ads), 0-based
     * @type {number}
     * @memberof AdSlotDto
     */
    index: number;
    /**
     * Id of the feed card this ad follows — position independent of array indices
     * @type {string}
     * @memberof AdSlotDto
     */
    afterContentId: string;
    /**
     * Stable id of the creative video. `creative.url` rotates every signing; this does not — key an offline cache on it.
     * @type {string}
     * @memberof AdSlotDto
     */
    creativeMediaId?: string | null;
}


/**
 * @export
 */
export const AdSlotDtoSkipReasonEnum = {
    AdFree: 'ad_free',
    FrequencyCap: 'frequency_cap',
    NotLive: 'not_live'
} as const;
export type AdSlotDtoSkipReasonEnum = typeof AdSlotDtoSkipReasonEnum[keyof typeof AdSlotDtoSkipReasonEnum];

/**
 * 
 * @export
 * @interface AdSlotsDto
 */
export interface AdSlotsDto {
    /**
     * 
     * @type {number}
     * @memberof AdSlotsDto
     */
    page: number;
    /**
     * 
     * @type {number}
     * @memberof AdSlotsDto
     */
    limit: number;
    /**
     * One ad after every N organic items
     * @type {number}
     * @memberof AdSlotsDto
     */
    frequency: number;
    /**
     * Changes only when the ad plan changes, never on a signature refresh. Cache the plan against this.
     * @type {string}
     * @memberof AdSlotsDto
     */
    planVersion: string;
    /**
     * Refetch after this. Normally the shortest creative signature lifetime, but clamped so it never outlives `planValidUntil` — a client that honours only this field can still never render an ad past its campaign end.
     * @type {number}
     * @memberof AdSlotsDto
     */
    expiresInSeconds: number;
    /**
     * Earliest `campaignEndsAt` among the live slots on this page (ISO), or null when no slot has an end date. The whole plan is stale past this instant — an offline client holding a cached plan should drop it (or at minimum drop the slots whose own campaignEndsAt has passed).
     * @type {string}
     * @memberof AdSlotsDto
     */
    planValidUntil?: string | null;
    /**
     * Skipped slots are still listed, with skip=true
     * @type {Array<AdSlotDto>}
     * @memberof AdSlotsDto
     */
    slots: Array<AdSlotDto>;
}
/**
 * 
 * @export
 * @interface AddContentMediaDto
 */
export interface AddContentMediaDto {
    /**
     * Image media id (must exist, not deleted)
     * @type {string}
     * @memberof AddContentMediaDto
     */
    mediaId: string;
    /**
     * 
     * @type {string}
     * @memberof AddContentMediaDto
     */
    kind?: AddContentMediaDtoKindEnum;
    /**
     * Frame position in the video (auto-thumbnail timecode)
     * @type {number}
     * @memberof AddContentMediaDto
     */
    timecodeSeconds?: number;
    /**
     * Default: end of the list
     * @type {number}
     * @memberof AddContentMediaDto
     */
    sortOrder?: number;
}


/**
 * @export
 */
export const AddContentMediaDtoKindEnum = {
    Thumbnail: 'thumbnail',
    Poster: 'poster',
    Still: 'still',
    Banner: 'banner'
} as const;
export type AddContentMediaDtoKindEnum = typeof AddContentMediaDtoKindEnum[keyof typeof AddContentMediaDtoKindEnum];

/**
 * 
 * @export
 * @interface AddTicketNoteDto
 */
export interface AddTicketNoteDto {
    /**
     * 
     * @type {string}
     * @memberof AddTicketNoteDto
     */
    body: string;
}
/**
 * 
 * @export
 * @interface AdjustPointsDto
 */
export interface AdjustPointsDto {
    /**
     * Signed delta (e.g. 500 to grant, -200 to deduct)
     * @type {number}
     * @memberof AdjustPointsDto
     */
    amount: number;
    /**
     * Audit reason (required)
     * @type {string}
     * @memberof AdjustPointsDto
     */
    reason: string;
}
/**
 * 
 * @export
 * @interface AdjustPreviewResultDto
 */
export interface AdjustPreviewResultDto {
    /**
     * 
     * @type {string}
     * @memberof AdjustPreviewResultDto
     */
    adjustmentId: string;
    /**
     * True when confirmAbove.adjustment is exceeded — a different admin must confirm
     * @type {boolean}
     * @memberof AdjustPreviewResultDto
     */
    requiresSecondAdmin: boolean;
}
/**
 * 
 * @export
 * @interface AdminAdSalesControllerCampaignPerformanceV1200Response
 */
export interface AdminAdSalesControllerCampaignPerformanceV1200Response {
    /**
     * 
     * @type {number}
     * @memberof AdminAdSalesControllerCampaignPerformanceV1200Response
     */
    statusCode: number;
    /**
     * 
     * @type {string}
     * @memberof AdminAdSalesControllerCampaignPerformanceV1200Response
     */
    status: string;
    /**
     * 
     * @type {string}
     * @memberof AdminAdSalesControllerCampaignPerformanceV1200Response
     */
    message: string;
    /**
     * Error details, or null on success
     * @type {object}
     * @memberof AdminAdSalesControllerCampaignPerformanceV1200Response
     */
    error: object | null;
    /**
     * 
     * @type {AdCampaignPerformanceDto}
     * @memberof AdminAdSalesControllerCampaignPerformanceV1200Response
     */
    data?: AdCampaignPerformanceDto;
}
/**
 * 
 * @export
 * @interface AdminAdSalesControllerCreateAdvertiserV1201Response
 */
export interface AdminAdSalesControllerCreateAdvertiserV1201Response {
    /**
     * 
     * @type {number}
     * @memberof AdminAdSalesControllerCreateAdvertiserV1201Response
     */
    statusCode: number;
    /**
     * 
     * @type {string}
     * @memberof AdminAdSalesControllerCreateAdvertiserV1201Response
     */
    status: string;
    /**
     * 
     * @type {string}
     * @memberof AdminAdSalesControllerCreateAdvertiserV1201Response
     */
    message: string;
    /**
     * Error details, or null on success
     * @type {object}
     * @memberof AdminAdSalesControllerCreateAdvertiserV1201Response
     */
    error: object | null;
    /**
     * 
     * @type {AdvertiserDto}
     * @memberof AdminAdSalesControllerCreateAdvertiserV1201Response
     */
    data?: AdvertiserDto;
}
/**
 * 
 * @export
 * @interface AdminAdSalesControllerCreateCampaignV1201Response
 */
export interface AdminAdSalesControllerCreateCampaignV1201Response {
    /**
     * 
     * @type {number}
     * @memberof AdminAdSalesControllerCreateCampaignV1201Response
     */
    statusCode: number;
    /**
     * 
     * @type {string}
     * @memberof AdminAdSalesControllerCreateCampaignV1201Response
     */
    status: string;
    /**
     * 
     * @type {string}
     * @memberof AdminAdSalesControllerCreateCampaignV1201Response
     */
    message: string;
    /**
     * Error details, or null on success
     * @type {object}
     * @memberof AdminAdSalesControllerCreateCampaignV1201Response
     */
    error: object | null;
    /**
     * 
     * @type {AdCampaignDto}
     * @memberof AdminAdSalesControllerCreateCampaignV1201Response
     */
    data?: AdCampaignDto;
}
/**
 * 
 * @export
 * @interface AdminAdSalesControllerCreateLedgerV1201Response
 */
export interface AdminAdSalesControllerCreateLedgerV1201Response {
    /**
     * 
     * @type {number}
     * @memberof AdminAdSalesControllerCreateLedgerV1201Response
     */
    statusCode: number;
    /**
     * 
     * @type {string}
     * @memberof AdminAdSalesControllerCreateLedgerV1201Response
     */
    status: string;
    /**
     * 
     * @type {string}
     * @memberof AdminAdSalesControllerCreateLedgerV1201Response
     */
    message: string;
    /**
     * Error details, or null on success
     * @type {object}
     * @memberof AdminAdSalesControllerCreateLedgerV1201Response
     */
    error: object | null;
    /**
     * 
     * @type {LedgerEntryDto}
     * @memberof AdminAdSalesControllerCreateLedgerV1201Response
     */
    data?: LedgerEntryDto;
}
/**
 * 
 * @export
 * @interface AdminAdSalesControllerGetCampaignV1200Response
 */
export interface AdminAdSalesControllerGetCampaignV1200Response {
    /**
     * 
     * @type {number}
     * @memberof AdminAdSalesControllerGetCampaignV1200Response
     */
    statusCode: number;
    /**
     * 
     * @type {string}
     * @memberof AdminAdSalesControllerGetCampaignV1200Response
     */
    status: string;
    /**
     * 
     * @type {string}
     * @memberof AdminAdSalesControllerGetCampaignV1200Response
     */
    message: string;
    /**
     * Error details, or null on success
     * @type {object}
     * @memberof AdminAdSalesControllerGetCampaignV1200Response
     */
    error: object | null;
    /**
     * 
     * @type {AdCampaignDetailDto}
     * @memberof AdminAdSalesControllerGetCampaignV1200Response
     */
    data?: AdCampaignDetailDto;
}
/**
 * 
 * @export
 * @interface AdminAdSalesControllerLedgerV1200Response
 */
export interface AdminAdSalesControllerLedgerV1200Response {
    /**
     * 
     * @type {number}
     * @memberof AdminAdSalesControllerLedgerV1200Response
     */
    statusCode: number;
    /**
     * 
     * @type {string}
     * @memberof AdminAdSalesControllerLedgerV1200Response
     */
    status: string;
    /**
     * 
     * @type {string}
     * @memberof AdminAdSalesControllerLedgerV1200Response
     */
    message: string;
    /**
     * Error details, or null on success
     * @type {object}
     * @memberof AdminAdSalesControllerLedgerV1200Response
     */
    error: object | null;
    /**
     * 
     * @type {AdminAdSalesControllerLedgerV1200ResponseAllOfData}
     * @memberof AdminAdSalesControllerLedgerV1200Response
     */
    data?: AdminAdSalesControllerLedgerV1200ResponseAllOfData;
}
/**
 * 
 * @export
 * @interface AdminAdSalesControllerLedgerV1200ResponseAllOfData
 */
export interface AdminAdSalesControllerLedgerV1200ResponseAllOfData {
    /**
     * 
     * @type {Array<LedgerEntryDto>}
     * @memberof AdminAdSalesControllerLedgerV1200ResponseAllOfData
     */
    items?: Array<LedgerEntryDto>;
    /**
     * 
     * @type {PaginationDetailsDto}
     * @memberof AdminAdSalesControllerLedgerV1200ResponseAllOfData
     */
    pagination?: PaginationDetailsDto;
}
/**
 * 
 * @export
 * @interface AdminAdSalesControllerListAdvertisersV1200Response
 */
export interface AdminAdSalesControllerListAdvertisersV1200Response {
    /**
     * 
     * @type {number}
     * @memberof AdminAdSalesControllerListAdvertisersV1200Response
     */
    statusCode: number;
    /**
     * 
     * @type {string}
     * @memberof AdminAdSalesControllerListAdvertisersV1200Response
     */
    status: string;
    /**
     * 
     * @type {string}
     * @memberof AdminAdSalesControllerListAdvertisersV1200Response
     */
    message: string;
    /**
     * Error details, or null on success
     * @type {object}
     * @memberof AdminAdSalesControllerListAdvertisersV1200Response
     */
    error: object | null;
    /**
     * 
     * @type {AdminAdSalesControllerListAdvertisersV1200ResponseAllOfData}
     * @memberof AdminAdSalesControllerListAdvertisersV1200Response
     */
    data?: AdminAdSalesControllerListAdvertisersV1200ResponseAllOfData;
}
/**
 * 
 * @export
 * @interface AdminAdSalesControllerListAdvertisersV1200ResponseAllOfData
 */
export interface AdminAdSalesControllerListAdvertisersV1200ResponseAllOfData {
    /**
     * 
     * @type {Array<AdvertiserDto>}
     * @memberof AdminAdSalesControllerListAdvertisersV1200ResponseAllOfData
     */
    items?: Array<AdvertiserDto>;
    /**
     * 
     * @type {PaginationDetailsDto}
     * @memberof AdminAdSalesControllerListAdvertisersV1200ResponseAllOfData
     */
    pagination?: PaginationDetailsDto;
}
/**
 * 
 * @export
 * @interface AdminAdSalesControllerListCampaignsV1200Response
 */
export interface AdminAdSalesControllerListCampaignsV1200Response {
    /**
     * 
     * @type {number}
     * @memberof AdminAdSalesControllerListCampaignsV1200Response
     */
    statusCode: number;
    /**
     * 
     * @type {string}
     * @memberof AdminAdSalesControllerListCampaignsV1200Response
     */
    status: string;
    /**
     * 
     * @type {string}
     * @memberof AdminAdSalesControllerListCampaignsV1200Response
     */
    message: string;
    /**
     * Error details, or null on success
     * @type {object}
     * @memberof AdminAdSalesControllerListCampaignsV1200Response
     */
    error: object | null;
    /**
     * 
     * @type {AdminAdSalesControllerListCampaignsV1200ResponseAllOfData}
     * @memberof AdminAdSalesControllerListCampaignsV1200Response
     */
    data?: AdminAdSalesControllerListCampaignsV1200ResponseAllOfData;
}
/**
 * 
 * @export
 * @interface AdminAdSalesControllerListCampaignsV1200ResponseAllOfData
 */
export interface AdminAdSalesControllerListCampaignsV1200ResponseAllOfData {
    /**
     * 
     * @type {Array<AdCampaignDto>}
     * @memberof AdminAdSalesControllerListCampaignsV1200ResponseAllOfData
     */
    items?: Array<AdCampaignDto>;
    /**
     * 
     * @type {PaginationDetailsDto}
     * @memberof AdminAdSalesControllerListCampaignsV1200ResponseAllOfData
     */
    pagination?: PaginationDetailsDto;
}
/**
 * 
 * @export
 * @interface AdminAdSalesControllerRankBoardV1200Response
 */
export interface AdminAdSalesControllerRankBoardV1200Response {
    /**
     * 
     * @type {number}
     * @memberof AdminAdSalesControllerRankBoardV1200Response
     */
    statusCode: number;
    /**
     * 
     * @type {string}
     * @memberof AdminAdSalesControllerRankBoardV1200Response
     */
    status: string;
    /**
     * 
     * @type {string}
     * @memberof AdminAdSalesControllerRankBoardV1200Response
     */
    message: string;
    /**
     * Error details, or null on success
     * @type {object}
     * @memberof AdminAdSalesControllerRankBoardV1200Response
     */
    error: object | null;
    /**
     * 
     * @type {RankBoardDto}
     * @memberof AdminAdSalesControllerRankBoardV1200Response
     */
    data?: RankBoardDto;
}
/**
 * 
 * @export
 * @interface AdminAdSalesControllerSummaryV1200Response
 */
export interface AdminAdSalesControllerSummaryV1200Response {
    /**
     * 
     * @type {number}
     * @memberof AdminAdSalesControllerSummaryV1200Response
     */
    statusCode: number;
    /**
     * 
     * @type {string}
     * @memberof AdminAdSalesControllerSummaryV1200Response
     */
    status: string;
    /**
     * 
     * @type {string}
     * @memberof AdminAdSalesControllerSummaryV1200Response
     */
    message: string;
    /**
     * Error details, or null on success
     * @type {object}
     * @memberof AdminAdSalesControllerSummaryV1200Response
     */
    error: object | null;
    /**
     * 
     * @type {AdSalesSummaryDto}
     * @memberof AdminAdSalesControllerSummaryV1200Response
     */
    data?: AdSalesSummaryDto;
}
/**
 * 
 * @export
 * @interface AdminAdSalesControllerSwapRanksV1200Response
 */
export interface AdminAdSalesControllerSwapRanksV1200Response {
    /**
     * 
     * @type {number}
     * @memberof AdminAdSalesControllerSwapRanksV1200Response
     */
    statusCode: number;
    /**
     * 
     * @type {string}
     * @memberof AdminAdSalesControllerSwapRanksV1200Response
     */
    status: string;
    /**
     * 
     * @type {string}
     * @memberof AdminAdSalesControllerSwapRanksV1200Response
     */
    message: string;
    /**
     * Error details, or null on success
     * @type {object}
     * @memberof AdminAdSalesControllerSwapRanksV1200Response
     */
    error: object | null;
    /**
     * 
     * @type {SwapRanksResultDto}
     * @memberof AdminAdSalesControllerSwapRanksV1200Response
     */
    data?: SwapRanksResultDto;
}
/**
 * 
 * @export
 * @interface AdminAdminsControllerCreateV1201Response
 */
export interface AdminAdminsControllerCreateV1201Response {
    /**
     * 
     * @type {number}
     * @memberof AdminAdminsControllerCreateV1201Response
     */
    statusCode: number;
    /**
     * 
     * @type {string}
     * @memberof AdminAdminsControllerCreateV1201Response
     */
    status: string;
    /**
     * 
     * @type {string}
     * @memberof AdminAdminsControllerCreateV1201Response
     */
    message: string;
    /**
     * Error details, or null on success
     * @type {object}
     * @memberof AdminAdminsControllerCreateV1201Response
     */
    error: object | null;
    /**
     * 
     * @type {AdminUserResponseDto}
     * @memberof AdminAdminsControllerCreateV1201Response
     */
    data?: AdminUserResponseDto;
}
/**
 * 
 * @export
 * @interface AdminAdminsControllerListV1200Response
 */
export interface AdminAdminsControllerListV1200Response {
    /**
     * 
     * @type {number}
     * @memberof AdminAdminsControllerListV1200Response
     */
    statusCode: number;
    /**
     * 
     * @type {string}
     * @memberof AdminAdminsControllerListV1200Response
     */
    status: string;
    /**
     * 
     * @type {string}
     * @memberof AdminAdminsControllerListV1200Response
     */
    message: string;
    /**
     * Error details, or null on success
     * @type {object}
     * @memberof AdminAdminsControllerListV1200Response
     */
    error: object | null;
    /**
     * 
     * @type {AdminAdminsControllerListV1200ResponseAllOfData}
     * @memberof AdminAdminsControllerListV1200Response
     */
    data?: AdminAdminsControllerListV1200ResponseAllOfData;
}
/**
 * 
 * @export
 * @interface AdminAdminsControllerListV1200ResponseAllOfData
 */
export interface AdminAdminsControllerListV1200ResponseAllOfData {
    /**
     * 
     * @type {Array<AdminUserResponseDto>}
     * @memberof AdminAdminsControllerListV1200ResponseAllOfData
     */
    items?: Array<AdminUserResponseDto>;
    /**
     * 
     * @type {PaginationDetailsDto}
     * @memberof AdminAdminsControllerListV1200ResponseAllOfData
     */
    pagination?: PaginationDetailsDto;
}
/**
 * 
 * @export
 * @interface AdminAdsControllerPerformanceV1200Response
 */
export interface AdminAdsControllerPerformanceV1200Response {
    /**
     * 
     * @type {number}
     * @memberof AdminAdsControllerPerformanceV1200Response
     */
    statusCode: number;
    /**
     * 
     * @type {string}
     * @memberof AdminAdsControllerPerformanceV1200Response
     */
    status: string;
    /**
     * 
     * @type {string}
     * @memberof AdminAdsControllerPerformanceV1200Response
     */
    message: string;
    /**
     * Error details, or null on success
     * @type {object}
     * @memberof AdminAdsControllerPerformanceV1200Response
     */
    error: object | null;
    /**
     * 
     * @type {Array<AdPerformanceItemDto>}
     * @memberof AdminAdsControllerPerformanceV1200Response
     */
    data?: Array<AdPerformanceItemDto>;
}
/**
 * 
 * @export
 * @interface AdminAdsControllerSponsorshipV1200Response
 */
export interface AdminAdsControllerSponsorshipV1200Response {
    /**
     * 
     * @type {number}
     * @memberof AdminAdsControllerSponsorshipV1200Response
     */
    statusCode: number;
    /**
     * 
     * @type {string}
     * @memberof AdminAdsControllerSponsorshipV1200Response
     */
    status: string;
    /**
     * 
     * @type {string}
     * @memberof AdminAdsControllerSponsorshipV1200Response
     */
    message: string;
    /**
     * Error details, or null on success
     * @type {object}
     * @memberof AdminAdsControllerSponsorshipV1200Response
     */
    error: object | null;
    /**
     * 
     * @type {AdPerformanceItemDto}
     * @memberof AdminAdsControllerSponsorshipV1200Response
     */
    data?: AdPerformanceItemDto;
}
/**
 * 
 * @export
 * @interface AdminAnalyticsControllerContentLibraryV1200Response
 */
export interface AdminAnalyticsControllerContentLibraryV1200Response {
    /**
     * 
     * @type {number}
     * @memberof AdminAnalyticsControllerContentLibraryV1200Response
     */
    statusCode: number;
    /**
     * 
     * @type {string}
     * @memberof AdminAnalyticsControllerContentLibraryV1200Response
     */
    status: string;
    /**
     * 
     * @type {string}
     * @memberof AdminAnalyticsControllerContentLibraryV1200Response
     */
    message: string;
    /**
     * Error details, or null on success
     * @type {object}
     * @memberof AdminAnalyticsControllerContentLibraryV1200Response
     */
    error: object | null;
    /**
     * 
     * @type {ContentLibraryAnalyticsDto}
     * @memberof AdminAnalyticsControllerContentLibraryV1200Response
     */
    data?: ContentLibraryAnalyticsDto;
}
/**
 * 
 * @export
 * @interface AdminAnalyticsControllerContentV1200Response
 */
export interface AdminAnalyticsControllerContentV1200Response {
    /**
     * 
     * @type {number}
     * @memberof AdminAnalyticsControllerContentV1200Response
     */
    statusCode: number;
    /**
     * 
     * @type {string}
     * @memberof AdminAnalyticsControllerContentV1200Response
     */
    status: string;
    /**
     * 
     * @type {string}
     * @memberof AdminAnalyticsControllerContentV1200Response
     */
    message: string;
    /**
     * Error details, or null on success
     * @type {object}
     * @memberof AdminAnalyticsControllerContentV1200Response
     */
    error: object | null;
    /**
     * 
     * @type {ContentAnalyticsDto}
     * @memberof AdminAnalyticsControllerContentV1200Response
     */
    data?: ContentAnalyticsDto;
}
/**
 * 
 * @export
 * @interface AdminAnalyticsControllerGamesV1200Response
 */
export interface AdminAnalyticsControllerGamesV1200Response {
    /**
     * 
     * @type {number}
     * @memberof AdminAnalyticsControllerGamesV1200Response
     */
    statusCode: number;
    /**
     * 
     * @type {string}
     * @memberof AdminAnalyticsControllerGamesV1200Response
     */
    status: string;
    /**
     * 
     * @type {string}
     * @memberof AdminAnalyticsControllerGamesV1200Response
     */
    message: string;
    /**
     * Error details, or null on success
     * @type {object}
     * @memberof AdminAnalyticsControllerGamesV1200Response
     */
    error: object | null;
    /**
     * 
     * @type {GameAnalyticsDto}
     * @memberof AdminAnalyticsControllerGamesV1200Response
     */
    data?: GameAnalyticsDto;
}
/**
 * 
 * @export
 * @interface AdminAnalyticsControllerLicensingV1200Response
 */
export interface AdminAnalyticsControllerLicensingV1200Response {
    /**
     * 
     * @type {number}
     * @memberof AdminAnalyticsControllerLicensingV1200Response
     */
    statusCode: number;
    /**
     * 
     * @type {string}
     * @memberof AdminAnalyticsControllerLicensingV1200Response
     */
    status: string;
    /**
     * 
     * @type {string}
     * @memberof AdminAnalyticsControllerLicensingV1200Response
     */
    message: string;
    /**
     * Error details, or null on success
     * @type {object}
     * @memberof AdminAnalyticsControllerLicensingV1200Response
     */
    error: object | null;
    /**
     * 
     * @type {LicensingAnalyticsDto}
     * @memberof AdminAnalyticsControllerLicensingV1200Response
     */
    data?: LicensingAnalyticsDto;
}
/**
 * 
 * @export
 * @interface AdminAnalyticsControllerOverviewV1200Response
 */
export interface AdminAnalyticsControllerOverviewV1200Response {
    /**
     * 
     * @type {number}
     * @memberof AdminAnalyticsControllerOverviewV1200Response
     */
    statusCode: number;
    /**
     * 
     * @type {string}
     * @memberof AdminAnalyticsControllerOverviewV1200Response
     */
    status: string;
    /**
     * 
     * @type {string}
     * @memberof AdminAnalyticsControllerOverviewV1200Response
     */
    message: string;
    /**
     * Error details, or null on success
     * @type {object}
     * @memberof AdminAnalyticsControllerOverviewV1200Response
     */
    error: object | null;
    /**
     * 
     * @type {DashboardOverviewDto}
     * @memberof AdminAnalyticsControllerOverviewV1200Response
     */
    data?: DashboardOverviewDto;
}
/**
 * 
 * @export
 * @interface AdminAnalyticsControllerRealtimeV1200Response
 */
export interface AdminAnalyticsControllerRealtimeV1200Response {
    /**
     * 
     * @type {number}
     * @memberof AdminAnalyticsControllerRealtimeV1200Response
     */
    statusCode: number;
    /**
     * 
     * @type {string}
     * @memberof AdminAnalyticsControllerRealtimeV1200Response
     */
    status: string;
    /**
     * 
     * @type {string}
     * @memberof AdminAnalyticsControllerRealtimeV1200Response
     */
    message: string;
    /**
     * Error details, or null on success
     * @type {object}
     * @memberof AdminAnalyticsControllerRealtimeV1200Response
     */
    error: object | null;
    /**
     * 
     * @type {RealtimeAnalyticsDto}
     * @memberof AdminAnalyticsControllerRealtimeV1200Response
     */
    data?: RealtimeAnalyticsDto;
}
/**
 * 
 * @export
 * @interface AdminAnalyticsControllerSubscriptionsV1200Response
 */
export interface AdminAnalyticsControllerSubscriptionsV1200Response {
    /**
     * 
     * @type {number}
     * @memberof AdminAnalyticsControllerSubscriptionsV1200Response
     */
    statusCode: number;
    /**
     * 
     * @type {string}
     * @memberof AdminAnalyticsControllerSubscriptionsV1200Response
     */
    status: string;
    /**
     * 
     * @type {string}
     * @memberof AdminAnalyticsControllerSubscriptionsV1200Response
     */
    message: string;
    /**
     * Error details, or null on success
     * @type {object}
     * @memberof AdminAnalyticsControllerSubscriptionsV1200Response
     */
    error: object | null;
    /**
     * 
     * @type {SubscriptionAnalyticsDto}
     * @memberof AdminAnalyticsControllerSubscriptionsV1200Response
     */
    data?: SubscriptionAnalyticsDto;
}
/**
 * 
 * @export
 * @interface AdminAnalyticsControllerTrendsV1200Response
 */
export interface AdminAnalyticsControllerTrendsV1200Response {
    /**
     * 
     * @type {number}
     * @memberof AdminAnalyticsControllerTrendsV1200Response
     */
    statusCode: number;
    /**
     * 
     * @type {string}
     * @memberof AdminAnalyticsControllerTrendsV1200Response
     */
    status: string;
    /**
     * 
     * @type {string}
     * @memberof AdminAnalyticsControllerTrendsV1200Response
     */
    message: string;
    /**
     * Error details, or null on success
     * @type {object}
     * @memberof AdminAnalyticsControllerTrendsV1200Response
     */
    error: object | null;
    /**
     * 
     * @type {TrendsDto}
     * @memberof AdminAnalyticsControllerTrendsV1200Response
     */
    data?: TrendsDto;
}
/**
 * 
 * @export
 * @interface AdminAnalyticsControllerUsersV1200Response
 */
export interface AdminAnalyticsControllerUsersV1200Response {
    /**
     * 
     * @type {number}
     * @memberof AdminAnalyticsControllerUsersV1200Response
     */
    statusCode: number;
    /**
     * 
     * @type {string}
     * @memberof AdminAnalyticsControllerUsersV1200Response
     */
    status: string;
    /**
     * 
     * @type {string}
     * @memberof AdminAnalyticsControllerUsersV1200Response
     */
    message: string;
    /**
     * Error details, or null on success
     * @type {object}
     * @memberof AdminAnalyticsControllerUsersV1200Response
     */
    error: object | null;
    /**
     * 
     * @type {UserAnalyticsDto}
     * @memberof AdminAnalyticsControllerUsersV1200Response
     */
    data?: UserAnalyticsDto;
}
/**
 * 
 * @export
 * @interface AdminAuthControllerLoginV1200Response
 */
export interface AdminAuthControllerLoginV1200Response {
    /**
     * 
     * @type {number}
     * @memberof AdminAuthControllerLoginV1200Response
     */
    statusCode: number;
    /**
     * 
     * @type {string}
     * @memberof AdminAuthControllerLoginV1200Response
     */
    status: string;
    /**
     * 
     * @type {string}
     * @memberof AdminAuthControllerLoginV1200Response
     */
    message: string;
    /**
     * Error details, or null on success
     * @type {object}
     * @memberof AdminAuthControllerLoginV1200Response
     */
    error: object | null;
    /**
     * 
     * @type {AdminSessionResponseDto}
     * @memberof AdminAuthControllerLoginV1200Response
     */
    data?: AdminSessionResponseDto;
}
/**
 * 
 * @export
 * @interface AdminBadgesControllerCreateV1201Response
 */
export interface AdminBadgesControllerCreateV1201Response {
    /**
     * 
     * @type {number}
     * @memberof AdminBadgesControllerCreateV1201Response
     */
    statusCode: number;
    /**
     * 
     * @type {string}
     * @memberof AdminBadgesControllerCreateV1201Response
     */
    status: string;
    /**
     * 
     * @type {string}
     * @memberof AdminBadgesControllerCreateV1201Response
     */
    message: string;
    /**
     * Error details, or null on success
     * @type {object}
     * @memberof AdminBadgesControllerCreateV1201Response
     */
    error: object | null;
    /**
     * 
     * @type {BadgeDto}
     * @memberof AdminBadgesControllerCreateV1201Response
     */
    data?: BadgeDto;
}
/**
 * 
 * @export
 * @interface AdminBadgesControllerListV1200Response
 */
export interface AdminBadgesControllerListV1200Response {
    /**
     * 
     * @type {number}
     * @memberof AdminBadgesControllerListV1200Response
     */
    statusCode: number;
    /**
     * 
     * @type {string}
     * @memberof AdminBadgesControllerListV1200Response
     */
    status: string;
    /**
     * 
     * @type {string}
     * @memberof AdminBadgesControllerListV1200Response
     */
    message: string;
    /**
     * Error details, or null on success
     * @type {object}
     * @memberof AdminBadgesControllerListV1200Response
     */
    error: object | null;
    /**
     * 
     * @type {Array<BadgeDto>}
     * @memberof AdminBadgesControllerListV1200Response
     */
    data?: Array<BadgeDto>;
}
/**
 * 
 * @export
 * @interface AdminBadgesControllerSummaryV1200Response
 */
export interface AdminBadgesControllerSummaryV1200Response {
    /**
     * 
     * @type {number}
     * @memberof AdminBadgesControllerSummaryV1200Response
     */
    statusCode: number;
    /**
     * 
     * @type {string}
     * @memberof AdminBadgesControllerSummaryV1200Response
     */
    status: string;
    /**
     * 
     * @type {string}
     * @memberof AdminBadgesControllerSummaryV1200Response
     */
    message: string;
    /**
     * Error details, or null on success
     * @type {object}
     * @memberof AdminBadgesControllerSummaryV1200Response
     */
    error: object | null;
    /**
     * 
     * @type {BadgeSummaryDto}
     * @memberof AdminBadgesControllerSummaryV1200Response
     */
    data?: BadgeSummaryDto;
}
/**
 * 
 * @export
 * @interface AdminBadgesControllerTriggersV1200Response
 */
export interface AdminBadgesControllerTriggersV1200Response {
    /**
     * 
     * @type {number}
     * @memberof AdminBadgesControllerTriggersV1200Response
     */
    statusCode: number;
    /**
     * 
     * @type {string}
     * @memberof AdminBadgesControllerTriggersV1200Response
     */
    status: string;
    /**
     * 
     * @type {string}
     * @memberof AdminBadgesControllerTriggersV1200Response
     */
    message: string;
    /**
     * Error details, or null on success
     * @type {object}
     * @memberof AdminBadgesControllerTriggersV1200Response
     */
    error: object | null;
    /**
     * 
     * @type {Array<BadgeTriggerDto>}
     * @memberof AdminBadgesControllerTriggersV1200Response
     */
    data?: Array<BadgeTriggerDto>;
}
/**
 * 
 * @export
 * @interface AdminCommentAuthorDto
 */
export interface AdminCommentAuthorDto {
    /**
     * 
     * @type {string}
     * @memberof AdminCommentAuthorDto
     */
    id: string;
    /**
     * "First Last", else username, else "Unknown user"
     * @type {string}
     * @memberof AdminCommentAuthorDto
     */
    name: string;
    /**
     * 
     * @type {string}
     * @memberof AdminCommentAuthorDto
     */
    username?: string | null;
    /**
     * 
     * @type {string}
     * @memberof AdminCommentAuthorDto
     */
    avatarUrl?: string | null;
}
/**
 * 
 * @export
 * @interface AdminCommentControllerEnforceV1200Response
 */
export interface AdminCommentControllerEnforceV1200Response {
    /**
     * 
     * @type {number}
     * @memberof AdminCommentControllerEnforceV1200Response
     */
    statusCode: number;
    /**
     * 
     * @type {string}
     * @memberof AdminCommentControllerEnforceV1200Response
     */
    status: string;
    /**
     * 
     * @type {string}
     * @memberof AdminCommentControllerEnforceV1200Response
     */
    message: string;
    /**
     * Error details, or null on success
     * @type {object}
     * @memberof AdminCommentControllerEnforceV1200Response
     */
    error: object | null;
    /**
     * 
     * @type {EnforceResultDto}
     * @memberof AdminCommentControllerEnforceV1200Response
     */
    data?: EnforceResultDto;
}
/**
 * 
 * @export
 * @interface AdminCommentControllerListV1200Response
 */
export interface AdminCommentControllerListV1200Response {
    /**
     * 
     * @type {number}
     * @memberof AdminCommentControllerListV1200Response
     */
    statusCode: number;
    /**
     * 
     * @type {string}
     * @memberof AdminCommentControllerListV1200Response
     */
    status: string;
    /**
     * 
     * @type {string}
     * @memberof AdminCommentControllerListV1200Response
     */
    message: string;
    /**
     * Error details, or null on success
     * @type {object}
     * @memberof AdminCommentControllerListV1200Response
     */
    error: object | null;
    /**
     * 
     * @type {AdminCommentControllerListV1200ResponseAllOfData}
     * @memberof AdminCommentControllerListV1200Response
     */
    data?: AdminCommentControllerListV1200ResponseAllOfData;
}
/**
 * 
 * @export
 * @interface AdminCommentControllerListV1200ResponseAllOfData
 */
export interface AdminCommentControllerListV1200ResponseAllOfData {
    /**
     * 
     * @type {Array<AdminCommentDto>}
     * @memberof AdminCommentControllerListV1200ResponseAllOfData
     */
    items?: Array<AdminCommentDto>;
    /**
     * 
     * @type {PaginationDetailsDto}
     * @memberof AdminCommentControllerListV1200ResponseAllOfData
     */
    pagination?: PaginationDetailsDto;
}
/**
 * 
 * @export
 * @interface AdminCommentControllerReportsV1200Response
 */
export interface AdminCommentControllerReportsV1200Response {
    /**
     * 
     * @type {number}
     * @memberof AdminCommentControllerReportsV1200Response
     */
    statusCode: number;
    /**
     * 
     * @type {string}
     * @memberof AdminCommentControllerReportsV1200Response
     */
    status: string;
    /**
     * 
     * @type {string}
     * @memberof AdminCommentControllerReportsV1200Response
     */
    message: string;
    /**
     * Error details, or null on success
     * @type {object}
     * @memberof AdminCommentControllerReportsV1200Response
     */
    error: object | null;
    /**
     * 
     * @type {AdminCommentControllerReportsV1200ResponseAllOfData}
     * @memberof AdminCommentControllerReportsV1200Response
     */
    data?: AdminCommentControllerReportsV1200ResponseAllOfData;
}
/**
 * 
 * @export
 * @interface AdminCommentControllerReportsV1200ResponseAllOfData
 */
export interface AdminCommentControllerReportsV1200ResponseAllOfData {
    /**
     * 
     * @type {Array<CommentReportDto>}
     * @memberof AdminCommentControllerReportsV1200ResponseAllOfData
     */
    items?: Array<CommentReportDto>;
    /**
     * 
     * @type {PaginationDetailsDto}
     * @memberof AdminCommentControllerReportsV1200ResponseAllOfData
     */
    pagination?: PaginationDetailsDto;
}
/**
 * 
 * @export
 * @interface AdminCommentControllerResolveV1200Response
 */
export interface AdminCommentControllerResolveV1200Response {
    /**
     * 
     * @type {number}
     * @memberof AdminCommentControllerResolveV1200Response
     */
    statusCode: number;
    /**
     * 
     * @type {string}
     * @memberof AdminCommentControllerResolveV1200Response
     */
    status: string;
    /**
     * 
     * @type {string}
     * @memberof AdminCommentControllerResolveV1200Response
     */
    message: string;
    /**
     * Error details, or null on success
     * @type {object}
     * @memberof AdminCommentControllerResolveV1200Response
     */
    error: object | null;
    /**
     * 
     * @type {ResolveReportResultDto}
     * @memberof AdminCommentControllerResolveV1200Response
     */
    data?: ResolveReportResultDto;
}
/**
 * 
 * @export
 * @interface AdminCommentControllerSetStatusV1200Response
 */
export interface AdminCommentControllerSetStatusV1200Response {
    /**
     * 
     * @type {number}
     * @memberof AdminCommentControllerSetStatusV1200Response
     */
    statusCode: number;
    /**
     * 
     * @type {string}
     * @memberof AdminCommentControllerSetStatusV1200Response
     */
    status: string;
    /**
     * 
     * @type {string}
     * @memberof AdminCommentControllerSetStatusV1200Response
     */
    message: string;
    /**
     * Error details, or null on success
     * @type {object}
     * @memberof AdminCommentControllerSetStatusV1200Response
     */
    error: object | null;
    /**
     * 
     * @type {CommentActionResultDto}
     * @memberof AdminCommentControllerSetStatusV1200Response
     */
    data?: CommentActionResultDto;
}
/**
 * 
 * @export
 * @interface AdminCommentControllerThreadV1200Response
 */
export interface AdminCommentControllerThreadV1200Response {
    /**
     * 
     * @type {number}
     * @memberof AdminCommentControllerThreadV1200Response
     */
    statusCode: number;
    /**
     * 
     * @type {string}
     * @memberof AdminCommentControllerThreadV1200Response
     */
    status: string;
    /**
     * 
     * @type {string}
     * @memberof AdminCommentControllerThreadV1200Response
     */
    message: string;
    /**
     * Error details, or null on success
     * @type {object}
     * @memberof AdminCommentControllerThreadV1200Response
     */
    error: object | null;
    /**
     * 
     * @type {AdminCommentThreadDto}
     * @memberof AdminCommentControllerThreadV1200Response
     */
    data?: AdminCommentThreadDto;
}
/**
 * 
 * @export
 * @interface AdminCommentDto
 */
export interface AdminCommentDto {
    /**
     * 
     * @type {string}
     * @memberof AdminCommentDto
     */
    id: string;
    /**
     * 
     * @type {string}
     * @memberof AdminCommentDto
     */
    contentId: string;
    /**
     * 
     * @type {string}
     * @memberof AdminCommentDto
     */
    contentTitle?: string | null;
    /**
     * 
     * @type {string}
     * @memberof AdminCommentDto
     */
    parentCommentId?: string | null;
    /**
     * 
     * @type {string}
     * @memberof AdminCommentDto
     */
    body: string;
    /**
     * 
     * @type {string}
     * @memberof AdminCommentDto
     */
    status: AdminCommentDtoStatusEnum;
    /**
     * 
     * @type {number}
     * @memberof AdminCommentDto
     */
    likeCount: number;
    /**
     * 
     * @type {number}
     * @memberof AdminCommentDto
     */
    dislikeCount: number;
    /**
     * 
     * @type {number}
     * @memberof AdminCommentDto
     */
    replyCount: number;
    /**
     * 
     * @type {number}
     * @memberof AdminCommentDto
     */
    flagCount: number;
    /**
     * 
     * @type {boolean}
     * @memberof AdminCommentDto
     */
    isFlagged: boolean;
    /**
     * Distinct reasons of pending reports
     * @type {Array<string>}
     * @memberof AdminCommentDto
     */
    flagReasons: Array<string>;
    /**
     * 
     * @type {number}
     * @memberof AdminCommentDto
     */
    pendingReports: number;
    /**
     * 
     * @type {AdminCommentAuthorDto}
     * @memberof AdminCommentDto
     */
    author: AdminCommentAuthorDto;
    /**
     * 
     * @type {string}
     * @memberof AdminCommentDto
     */
    createdAt: string;
}


/**
 * @export
 */
export const AdminCommentDtoStatusEnum = {
    Visible: 'visible',
    Hidden: 'hidden',
    Deleted: 'deleted'
} as const;
export type AdminCommentDtoStatusEnum = typeof AdminCommentDtoStatusEnum[keyof typeof AdminCommentDtoStatusEnum];

/**
 * 
 * @export
 * @interface AdminCommentThreadDto
 */
export interface AdminCommentThreadDto {
    /**
     * 
     * @type {AdminCommentDto}
     * @memberof AdminCommentThreadDto
     */
    comment: AdminCommentDto;
    /**
     * Set when the comment is a reply
     * @type {AdminCommentDto}
     * @memberof AdminCommentThreadDto
     */
    parent?: AdminCommentDto | null;
    /**
     * All replies of the thread (any status), oldest first
     * @type {Array<AdminCommentDto>}
     * @memberof AdminCommentThreadDto
     */
    replies: Array<AdminCommentDto>;
    /**
     * 
     * @type {Array<CommentReportDto>}
     * @memberof AdminCommentThreadDto
     */
    reports: Array<CommentReportDto>;
    /**
     * 
     * @type {OpenTicketRefDto}
     * @memberof AdminCommentThreadDto
     */
    openTicket?: OpenTicketRefDto | null;
}
/**
 * 
 * @export
 * @interface AdminContentControllerFullV1200Response
 */
export interface AdminContentControllerFullV1200Response {
    /**
     * 
     * @type {number}
     * @memberof AdminContentControllerFullV1200Response
     */
    statusCode: number;
    /**
     * 
     * @type {string}
     * @memberof AdminContentControllerFullV1200Response
     */
    status: string;
    /**
     * 
     * @type {string}
     * @memberof AdminContentControllerFullV1200Response
     */
    message: string;
    /**
     * Error details, or null on success
     * @type {object}
     * @memberof AdminContentControllerFullV1200Response
     */
    error: object | null;
    /**
     * 
     * @type {ContentFullDto}
     * @memberof AdminContentControllerFullV1200Response
     */
    data?: ContentFullDto;
}
/**
 * 
 * @export
 * @interface AdminContentControllerGamesV1200Response
 */
export interface AdminContentControllerGamesV1200Response {
    /**
     * 
     * @type {number}
     * @memberof AdminContentControllerGamesV1200Response
     */
    statusCode: number;
    /**
     * 
     * @type {string}
     * @memberof AdminContentControllerGamesV1200Response
     */
    status: string;
    /**
     * 
     * @type {string}
     * @memberof AdminContentControllerGamesV1200Response
     */
    message: string;
    /**
     * Error details, or null on success
     * @type {object}
     * @memberof AdminContentControllerGamesV1200Response
     */
    error: object | null;
    /**
     * 
     * @type {LinkedGamesDto}
     * @memberof AdminContentControllerGamesV1200Response
     */
    data?: LinkedGamesDto;
}
/**
 * 
 * @export
 * @interface AdminContentControllerThumbnailCandidatesV1200Response
 */
export interface AdminContentControllerThumbnailCandidatesV1200Response {
    /**
     * 
     * @type {number}
     * @memberof AdminContentControllerThumbnailCandidatesV1200Response
     */
    statusCode: number;
    /**
     * 
     * @type {string}
     * @memberof AdminContentControllerThumbnailCandidatesV1200Response
     */
    status: string;
    /**
     * 
     * @type {string}
     * @memberof AdminContentControllerThumbnailCandidatesV1200Response
     */
    message: string;
    /**
     * Error details, or null on success
     * @type {object}
     * @memberof AdminContentControllerThumbnailCandidatesV1200Response
     */
    error: object | null;
    /**
     * 
     * @type {Array<ThumbnailCandidateDto>}
     * @memberof AdminContentControllerThumbnailCandidatesV1200Response
     */
    data?: Array<ThumbnailCandidateDto>;
}
/**
 * 
 * @export
 * @interface AdminContentExtrasControllerGetLicenseV1200Response
 */
export interface AdminContentExtrasControllerGetLicenseV1200Response {
    /**
     * 
     * @type {number}
     * @memberof AdminContentExtrasControllerGetLicenseV1200Response
     */
    statusCode: number;
    /**
     * 
     * @type {string}
     * @memberof AdminContentExtrasControllerGetLicenseV1200Response
     */
    status: string;
    /**
     * 
     * @type {string}
     * @memberof AdminContentExtrasControllerGetLicenseV1200Response
     */
    message: string;
    /**
     * Error details, or null on success
     * @type {object}
     * @memberof AdminContentExtrasControllerGetLicenseV1200Response
     */
    error: object | null;
    /**
     * 
     * @type {LicenseResponseDto}
     * @memberof AdminContentExtrasControllerGetLicenseV1200Response
     */
    data?: LicenseResponseDto;
}
/**
 * 
 * @export
 * @interface AdminContentExtrasControllerGetRegionsV1200Response
 */
export interface AdminContentExtrasControllerGetRegionsV1200Response {
    /**
     * 
     * @type {number}
     * @memberof AdminContentExtrasControllerGetRegionsV1200Response
     */
    statusCode: number;
    /**
     * 
     * @type {string}
     * @memberof AdminContentExtrasControllerGetRegionsV1200Response
     */
    status: string;
    /**
     * 
     * @type {string}
     * @memberof AdminContentExtrasControllerGetRegionsV1200Response
     */
    message: string;
    /**
     * Error details, or null on success
     * @type {object}
     * @memberof AdminContentExtrasControllerGetRegionsV1200Response
     */
    error: object | null;
    /**
     * 
     * @type {RegionsResponseDto}
     * @memberof AdminContentExtrasControllerGetRegionsV1200Response
     */
    data?: RegionsResponseDto;
}
/**
 * 
 * @export
 * @interface AdminContentExtrasControllerGetSponsorshipV1200Response
 */
export interface AdminContentExtrasControllerGetSponsorshipV1200Response {
    /**
     * 
     * @type {number}
     * @memberof AdminContentExtrasControllerGetSponsorshipV1200Response
     */
    statusCode: number;
    /**
     * 
     * @type {string}
     * @memberof AdminContentExtrasControllerGetSponsorshipV1200Response
     */
    status: string;
    /**
     * 
     * @type {string}
     * @memberof AdminContentExtrasControllerGetSponsorshipV1200Response
     */
    message: string;
    /**
     * Error details, or null on success
     * @type {object}
     * @memberof AdminContentExtrasControllerGetSponsorshipV1200Response
     */
    error: object | null;
    /**
     * 
     * @type {SponsorshipResponseDto}
     * @memberof AdminContentExtrasControllerGetSponsorshipV1200Response
     */
    data?: SponsorshipResponseDto;
}
/**
 * 
 * @export
 * @interface AdminContentExtrasControllerHistoryV1200Response
 */
export interface AdminContentExtrasControllerHistoryV1200Response {
    /**
     * 
     * @type {number}
     * @memberof AdminContentExtrasControllerHistoryV1200Response
     */
    statusCode: number;
    /**
     * 
     * @type {string}
     * @memberof AdminContentExtrasControllerHistoryV1200Response
     */
    status: string;
    /**
     * 
     * @type {string}
     * @memberof AdminContentExtrasControllerHistoryV1200Response
     */
    message: string;
    /**
     * Error details, or null on success
     * @type {object}
     * @memberof AdminContentExtrasControllerHistoryV1200Response
     */
    error: object | null;
    /**
     * 
     * @type {Array<ContentHistoryEntryDto>}
     * @memberof AdminContentExtrasControllerHistoryV1200Response
     */
    data?: Array<ContentHistoryEntryDto>;
}
/**
 * 
 * @export
 * @interface AdminContentInsightsControllerLicenseSummaryV1200Response
 */
export interface AdminContentInsightsControllerLicenseSummaryV1200Response {
    /**
     * 
     * @type {number}
     * @memberof AdminContentInsightsControllerLicenseSummaryV1200Response
     */
    statusCode: number;
    /**
     * 
     * @type {string}
     * @memberof AdminContentInsightsControllerLicenseSummaryV1200Response
     */
    status: string;
    /**
     * 
     * @type {string}
     * @memberof AdminContentInsightsControllerLicenseSummaryV1200Response
     */
    message: string;
    /**
     * Error details, or null on success
     * @type {object}
     * @memberof AdminContentInsightsControllerLicenseSummaryV1200Response
     */
    error: object | null;
    /**
     * 
     * @type {LicenseSummaryDto}
     * @memberof AdminContentInsightsControllerLicenseSummaryV1200Response
     */
    data?: LicenseSummaryDto;
}
/**
 * 
 * @export
 * @interface AdminContentInsightsControllerLicensesV1200Response
 */
export interface AdminContentInsightsControllerLicensesV1200Response {
    /**
     * 
     * @type {number}
     * @memberof AdminContentInsightsControllerLicensesV1200Response
     */
    statusCode: number;
    /**
     * 
     * @type {string}
     * @memberof AdminContentInsightsControllerLicensesV1200Response
     */
    status: string;
    /**
     * 
     * @type {string}
     * @memberof AdminContentInsightsControllerLicensesV1200Response
     */
    message: string;
    /**
     * Error details, or null on success
     * @type {object}
     * @memberof AdminContentInsightsControllerLicensesV1200Response
     */
    error: object | null;
    /**
     * 
     * @type {AdminContentInsightsControllerLicensesV1200ResponseAllOfData}
     * @memberof AdminContentInsightsControllerLicensesV1200Response
     */
    data?: AdminContentInsightsControllerLicensesV1200ResponseAllOfData;
}
/**
 * 
 * @export
 * @interface AdminContentInsightsControllerLicensesV1200ResponseAllOfData
 */
export interface AdminContentInsightsControllerLicensesV1200ResponseAllOfData {
    /**
     * 
     * @type {Array<LicenseAgreementDto>}
     * @memberof AdminContentInsightsControllerLicensesV1200ResponseAllOfData
     */
    items?: Array<LicenseAgreementDto>;
    /**
     * 
     * @type {PaginationDetailsDto}
     * @memberof AdminContentInsightsControllerLicensesV1200ResponseAllOfData
     */
    pagination?: PaginationDetailsDto;
}
/**
 * 
 * @export
 * @interface AdminContentInsightsControllerRecommendedActionsV1200Response
 */
export interface AdminContentInsightsControllerRecommendedActionsV1200Response {
    /**
     * 
     * @type {number}
     * @memberof AdminContentInsightsControllerRecommendedActionsV1200Response
     */
    statusCode: number;
    /**
     * 
     * @type {string}
     * @memberof AdminContentInsightsControllerRecommendedActionsV1200Response
     */
    status: string;
    /**
     * 
     * @type {string}
     * @memberof AdminContentInsightsControllerRecommendedActionsV1200Response
     */
    message: string;
    /**
     * Error details, or null on success
     * @type {object}
     * @memberof AdminContentInsightsControllerRecommendedActionsV1200Response
     */
    error: object | null;
    /**
     * 
     * @type {Array<RecommendedActionDto>}
     * @memberof AdminContentInsightsControllerRecommendedActionsV1200Response
     */
    data?: Array<RecommendedActionDto>;
}
/**
 * 
 * @export
 * @interface AdminContentInsightsControllerStatsV1200Response
 */
export interface AdminContentInsightsControllerStatsV1200Response {
    /**
     * 
     * @type {number}
     * @memberof AdminContentInsightsControllerStatsV1200Response
     */
    statusCode: number;
    /**
     * 
     * @type {string}
     * @memberof AdminContentInsightsControllerStatsV1200Response
     */
    status: string;
    /**
     * 
     * @type {string}
     * @memberof AdminContentInsightsControllerStatsV1200Response
     */
    message: string;
    /**
     * Error details, or null on success
     * @type {object}
     * @memberof AdminContentInsightsControllerStatsV1200Response
     */
    error: object | null;
    /**
     * 
     * @type {ContentStatsDto}
     * @memberof AdminContentInsightsControllerStatsV1200Response
     */
    data?: ContentStatsDto;
}
/**
 * 
 * @export
 * @interface AdminContentMediaControllerAddV1201Response
 */
export interface AdminContentMediaControllerAddV1201Response {
    /**
     * 
     * @type {number}
     * @memberof AdminContentMediaControllerAddV1201Response
     */
    statusCode: number;
    /**
     * 
     * @type {string}
     * @memberof AdminContentMediaControllerAddV1201Response
     */
    status: string;
    /**
     * 
     * @type {string}
     * @memberof AdminContentMediaControllerAddV1201Response
     */
    message: string;
    /**
     * Error details, or null on success
     * @type {object}
     * @memberof AdminContentMediaControllerAddV1201Response
     */
    error: object | null;
    /**
     * 
     * @type {ContentMediaItemDto}
     * @memberof AdminContentMediaControllerAddV1201Response
     */
    data?: ContentMediaItemDto;
}
/**
 * 
 * @export
 * @interface AdminContentMediaControllerListV1200Response
 */
export interface AdminContentMediaControllerListV1200Response {
    /**
     * 
     * @type {number}
     * @memberof AdminContentMediaControllerListV1200Response
     */
    statusCode: number;
    /**
     * 
     * @type {string}
     * @memberof AdminContentMediaControllerListV1200Response
     */
    status: string;
    /**
     * 
     * @type {string}
     * @memberof AdminContentMediaControllerListV1200Response
     */
    message: string;
    /**
     * Error details, or null on success
     * @type {object}
     * @memberof AdminContentMediaControllerListV1200Response
     */
    error: object | null;
    /**
     * 
     * @type {Array<ContentMediaItemDto>}
     * @memberof AdminContentMediaControllerListV1200Response
     */
    data?: Array<ContentMediaItemDto>;
}
/**
 * 
 * @export
 * @interface AdminDashboardAnalyticsControllerCommunityV1200Response
 */
export interface AdminDashboardAnalyticsControllerCommunityV1200Response {
    /**
     * 
     * @type {number}
     * @memberof AdminDashboardAnalyticsControllerCommunityV1200Response
     */
    statusCode: number;
    /**
     * 
     * @type {string}
     * @memberof AdminDashboardAnalyticsControllerCommunityV1200Response
     */
    status: string;
    /**
     * 
     * @type {string}
     * @memberof AdminDashboardAnalyticsControllerCommunityV1200Response
     */
    message: string;
    /**
     * Error details, or null on success
     * @type {object}
     * @memberof AdminDashboardAnalyticsControllerCommunityV1200Response
     */
    error: object | null;
    /**
     * 
     * @type {CommunityDataDto}
     * @memberof AdminDashboardAnalyticsControllerCommunityV1200Response
     */
    data?: CommunityDataDto;
}
/**
 * 
 * @export
 * @interface AdminDashboardAnalyticsControllerGamificationV1200Response
 */
export interface AdminDashboardAnalyticsControllerGamificationV1200Response {
    /**
     * 
     * @type {number}
     * @memberof AdminDashboardAnalyticsControllerGamificationV1200Response
     */
    statusCode: number;
    /**
     * 
     * @type {string}
     * @memberof AdminDashboardAnalyticsControllerGamificationV1200Response
     */
    status: string;
    /**
     * 
     * @type {string}
     * @memberof AdminDashboardAnalyticsControllerGamificationV1200Response
     */
    message: string;
    /**
     * Error details, or null on success
     * @type {object}
     * @memberof AdminDashboardAnalyticsControllerGamificationV1200Response
     */
    error: object | null;
    /**
     * 
     * @type {GamificationDataDto}
     * @memberof AdminDashboardAnalyticsControllerGamificationV1200Response
     */
    data?: GamificationDataDto;
}
/**
 * 
 * @export
 * @interface AdminDashboardAnalyticsControllerGraphsV1200Response
 */
export interface AdminDashboardAnalyticsControllerGraphsV1200Response {
    /**
     * 
     * @type {number}
     * @memberof AdminDashboardAnalyticsControllerGraphsV1200Response
     */
    statusCode: number;
    /**
     * 
     * @type {string}
     * @memberof AdminDashboardAnalyticsControllerGraphsV1200Response
     */
    status: string;
    /**
     * 
     * @type {string}
     * @memberof AdminDashboardAnalyticsControllerGraphsV1200Response
     */
    message: string;
    /**
     * Error details, or null on success
     * @type {object}
     * @memberof AdminDashboardAnalyticsControllerGraphsV1200Response
     */
    error: object | null;
    /**
     * 
     * @type {GraphsDataDto}
     * @memberof AdminDashboardAnalyticsControllerGraphsV1200Response
     */
    data?: GraphsDataDto;
}
/**
 * 
 * @export
 * @interface AdminDashboardAnalyticsControllerMonetizationV1200Response
 */
export interface AdminDashboardAnalyticsControllerMonetizationV1200Response {
    /**
     * 
     * @type {number}
     * @memberof AdminDashboardAnalyticsControllerMonetizationV1200Response
     */
    statusCode: number;
    /**
     * 
     * @type {string}
     * @memberof AdminDashboardAnalyticsControllerMonetizationV1200Response
     */
    status: string;
    /**
     * 
     * @type {string}
     * @memberof AdminDashboardAnalyticsControllerMonetizationV1200Response
     */
    message: string;
    /**
     * Error details, or null on success
     * @type {object}
     * @memberof AdminDashboardAnalyticsControllerMonetizationV1200Response
     */
    error: object | null;
    /**
     * 
     * @type {MonetizationDataDto}
     * @memberof AdminDashboardAnalyticsControllerMonetizationV1200Response
     */
    data?: MonetizationDataDto;
}
/**
 * 
 * @export
 * @interface AdminDashboardAnalyticsControllerRegionV1200Response
 */
export interface AdminDashboardAnalyticsControllerRegionV1200Response {
    /**
     * 
     * @type {number}
     * @memberof AdminDashboardAnalyticsControllerRegionV1200Response
     */
    statusCode: number;
    /**
     * 
     * @type {string}
     * @memberof AdminDashboardAnalyticsControllerRegionV1200Response
     */
    status: string;
    /**
     * 
     * @type {string}
     * @memberof AdminDashboardAnalyticsControllerRegionV1200Response
     */
    message: string;
    /**
     * Error details, or null on success
     * @type {object}
     * @memberof AdminDashboardAnalyticsControllerRegionV1200Response
     */
    error: object | null;
    /**
     * 
     * @type {RegionAnalyticsDto}
     * @memberof AdminDashboardAnalyticsControllerRegionV1200Response
     */
    data?: RegionAnalyticsDto;
}
/**
 * 
 * @export
 * @interface AdminDashboardAnalyticsControllerRegionsV1200Response
 */
export interface AdminDashboardAnalyticsControllerRegionsV1200Response {
    /**
     * 
     * @type {number}
     * @memberof AdminDashboardAnalyticsControllerRegionsV1200Response
     */
    statusCode: number;
    /**
     * 
     * @type {string}
     * @memberof AdminDashboardAnalyticsControllerRegionsV1200Response
     */
    status: string;
    /**
     * 
     * @type {string}
     * @memberof AdminDashboardAnalyticsControllerRegionsV1200Response
     */
    message: string;
    /**
     * Error details, or null on success
     * @type {object}
     * @memberof AdminDashboardAnalyticsControllerRegionsV1200Response
     */
    error: object | null;
    /**
     * 
     * @type {RegionsSummaryDto}
     * @memberof AdminDashboardAnalyticsControllerRegionsV1200Response
     */
    data?: RegionsSummaryDto;
}
/**
 * 
 * @export
 * @interface AdminDashboardAnalyticsControllerRollupStatusV1200Response
 */
export interface AdminDashboardAnalyticsControllerRollupStatusV1200Response {
    /**
     * 
     * @type {number}
     * @memberof AdminDashboardAnalyticsControllerRollupStatusV1200Response
     */
    statusCode: number;
    /**
     * 
     * @type {string}
     * @memberof AdminDashboardAnalyticsControllerRollupStatusV1200Response
     */
    status: string;
    /**
     * 
     * @type {string}
     * @memberof AdminDashboardAnalyticsControllerRollupStatusV1200Response
     */
    message: string;
    /**
     * Error details, or null on success
     * @type {object}
     * @memberof AdminDashboardAnalyticsControllerRollupStatusV1200Response
     */
    error: object | null;
    /**
     * 
     * @type {RollupCoverageDto}
     * @memberof AdminDashboardAnalyticsControllerRollupStatusV1200Response
     */
    data?: RollupCoverageDto;
}
/**
 * 
 * @export
 * @interface AdminDashboardAnalyticsControllerRunRollupV1200Response
 */
export interface AdminDashboardAnalyticsControllerRunRollupV1200Response {
    /**
     * 
     * @type {number}
     * @memberof AdminDashboardAnalyticsControllerRunRollupV1200Response
     */
    statusCode: number;
    /**
     * 
     * @type {string}
     * @memberof AdminDashboardAnalyticsControllerRunRollupV1200Response
     */
    status: string;
    /**
     * 
     * @type {string}
     * @memberof AdminDashboardAnalyticsControllerRunRollupV1200Response
     */
    message: string;
    /**
     * Error details, or null on success
     * @type {object}
     * @memberof AdminDashboardAnalyticsControllerRunRollupV1200Response
     */
    error: object | null;
    /**
     * 
     * @type {RollupResultDto}
     * @memberof AdminDashboardAnalyticsControllerRunRollupV1200Response
     */
    data?: RollupResultDto;
}
/**
 * 
 * @export
 * @interface AdminDashboardAnalyticsControllerScreenTimeV1200Response
 */
export interface AdminDashboardAnalyticsControllerScreenTimeV1200Response {
    /**
     * 
     * @type {number}
     * @memberof AdminDashboardAnalyticsControllerScreenTimeV1200Response
     */
    statusCode: number;
    /**
     * 
     * @type {string}
     * @memberof AdminDashboardAnalyticsControllerScreenTimeV1200Response
     */
    status: string;
    /**
     * 
     * @type {string}
     * @memberof AdminDashboardAnalyticsControllerScreenTimeV1200Response
     */
    message: string;
    /**
     * Error details, or null on success
     * @type {object}
     * @memberof AdminDashboardAnalyticsControllerScreenTimeV1200Response
     */
    error: object | null;
    /**
     * 
     * @type {ScreenTimeDataDto}
     * @memberof AdminDashboardAnalyticsControllerScreenTimeV1200Response
     */
    data?: ScreenTimeDataDto;
}
/**
 * 
 * @export
 * @interface AdminDashboardAnalyticsControllerStripV1200Response
 */
export interface AdminDashboardAnalyticsControllerStripV1200Response {
    /**
     * 
     * @type {number}
     * @memberof AdminDashboardAnalyticsControllerStripV1200Response
     */
    statusCode: number;
    /**
     * 
     * @type {string}
     * @memberof AdminDashboardAnalyticsControllerStripV1200Response
     */
    status: string;
    /**
     * 
     * @type {string}
     * @memberof AdminDashboardAnalyticsControllerStripV1200Response
     */
    message: string;
    /**
     * Error details, or null on success
     * @type {object}
     * @memberof AdminDashboardAnalyticsControllerStripV1200Response
     */
    error: object | null;
    /**
     * 
     * @type {StripDto}
     * @memberof AdminDashboardAnalyticsControllerStripV1200Response
     */
    data?: StripDto;
}
/**
 * 
 * @export
 * @interface AdminDashboardAnalyticsControllerUserAnalyticsV1200Response
 */
export interface AdminDashboardAnalyticsControllerUserAnalyticsV1200Response {
    /**
     * 
     * @type {number}
     * @memberof AdminDashboardAnalyticsControllerUserAnalyticsV1200Response
     */
    statusCode: number;
    /**
     * 
     * @type {string}
     * @memberof AdminDashboardAnalyticsControllerUserAnalyticsV1200Response
     */
    status: string;
    /**
     * 
     * @type {string}
     * @memberof AdminDashboardAnalyticsControllerUserAnalyticsV1200Response
     */
    message: string;
    /**
     * Error details, or null on success
     * @type {object}
     * @memberof AdminDashboardAnalyticsControllerUserAnalyticsV1200Response
     */
    error: object | null;
    /**
     * 
     * @type {UserAnalyticsDataDto}
     * @memberof AdminDashboardAnalyticsControllerUserAnalyticsV1200Response
     */
    data?: UserAnalyticsDataDto;
}
/**
 * 
 * @export
 * @interface AdminEngineSettingsControllerGetFlagsV1200Response
 */
export interface AdminEngineSettingsControllerGetFlagsV1200Response {
    /**
     * 
     * @type {number}
     * @memberof AdminEngineSettingsControllerGetFlagsV1200Response
     */
    statusCode: number;
    /**
     * 
     * @type {string}
     * @memberof AdminEngineSettingsControllerGetFlagsV1200Response
     */
    status: string;
    /**
     * 
     * @type {string}
     * @memberof AdminEngineSettingsControllerGetFlagsV1200Response
     */
    message: string;
    /**
     * Error details, or null on success
     * @type {object}
     * @memberof AdminEngineSettingsControllerGetFlagsV1200Response
     */
    error: object | null;
    /**
     * 
     * @type {object}
     * @memberof AdminEngineSettingsControllerGetFlagsV1200Response
     */
    data?: object;
}
/**
 * 
 * @export
 * @interface AdminEngineSettingsControllerGetLimitsV1200Response
 */
export interface AdminEngineSettingsControllerGetLimitsV1200Response {
    /**
     * 
     * @type {number}
     * @memberof AdminEngineSettingsControllerGetLimitsV1200Response
     */
    statusCode: number;
    /**
     * 
     * @type {string}
     * @memberof AdminEngineSettingsControllerGetLimitsV1200Response
     */
    status: string;
    /**
     * 
     * @type {string}
     * @memberof AdminEngineSettingsControllerGetLimitsV1200Response
     */
    message: string;
    /**
     * Error details, or null on success
     * @type {object}
     * @memberof AdminEngineSettingsControllerGetLimitsV1200Response
     */
    error: object | null;
    /**
     * 
     * @type {object}
     * @memberof AdminEngineSettingsControllerGetLimitsV1200Response
     */
    data?: object;
}
/**
 * 
 * @export
 * @interface AdminEventsControllerRecentV1200Response
 */
export interface AdminEventsControllerRecentV1200Response {
    /**
     * 
     * @type {number}
     * @memberof AdminEventsControllerRecentV1200Response
     */
    statusCode: number;
    /**
     * 
     * @type {string}
     * @memberof AdminEventsControllerRecentV1200Response
     */
    status: string;
    /**
     * 
     * @type {string}
     * @memberof AdminEventsControllerRecentV1200Response
     */
    message: string;
    /**
     * Error details, or null on success
     * @type {object}
     * @memberof AdminEventsControllerRecentV1200Response
     */
    error: object | null;
    /**
     * 
     * @type {Array<EventRecordDto>}
     * @memberof AdminEventsControllerRecentV1200Response
     */
    data?: Array<EventRecordDto>;
}
/**
 * 
 * @export
 * @interface AdminEventsControllerTopV1200Response
 */
export interface AdminEventsControllerTopV1200Response {
    /**
     * 
     * @type {number}
     * @memberof AdminEventsControllerTopV1200Response
     */
    statusCode: number;
    /**
     * 
     * @type {string}
     * @memberof AdminEventsControllerTopV1200Response
     */
    status: string;
    /**
     * 
     * @type {string}
     * @memberof AdminEventsControllerTopV1200Response
     */
    message: string;
    /**
     * Error details, or null on success
     * @type {object}
     * @memberof AdminEventsControllerTopV1200Response
     */
    error: object | null;
    /**
     * 
     * @type {Array<EventVolumeDto>}
     * @memberof AdminEventsControllerTopV1200Response
     */
    data?: Array<EventVolumeDto>;
}
/**
 * 
 * @export
 * @interface AdminGamesControllerInstancesV1200Response
 */
export interface AdminGamesControllerInstancesV1200Response {
    /**
     * 
     * @type {number}
     * @memberof AdminGamesControllerInstancesV1200Response
     */
    statusCode: number;
    /**
     * 
     * @type {string}
     * @memberof AdminGamesControllerInstancesV1200Response
     */
    status: string;
    /**
     * 
     * @type {string}
     * @memberof AdminGamesControllerInstancesV1200Response
     */
    message: string;
    /**
     * Error details, or null on success
     * @type {object}
     * @memberof AdminGamesControllerInstancesV1200Response
     */
    error: object | null;
    /**
     * 
     * @type {GameInstancesListDto}
     * @memberof AdminGamesControllerInstancesV1200Response
     */
    data?: GameInstancesListDto;
}
/**
 * 
 * @export
 * @interface AdminGamesControllerTypesV1200Response
 */
export interface AdminGamesControllerTypesV1200Response {
    /**
     * 
     * @type {number}
     * @memberof AdminGamesControllerTypesV1200Response
     */
    statusCode: number;
    /**
     * 
     * @type {string}
     * @memberof AdminGamesControllerTypesV1200Response
     */
    status: string;
    /**
     * 
     * @type {string}
     * @memberof AdminGamesControllerTypesV1200Response
     */
    message: string;
    /**
     * Error details, or null on success
     * @type {object}
     * @memberof AdminGamesControllerTypesV1200Response
     */
    error: object | null;
    /**
     * 
     * @type {GameTypesSummaryDto}
     * @memberof AdminGamesControllerTypesV1200Response
     */
    data?: GameTypesSummaryDto;
}
/**
 * 
 * @export
 * @interface AdminGenreResponseDto
 */
export interface AdminGenreResponseDto {
    /**
     * 
     * @type {string}
     * @memberof AdminGenreResponseDto
     */
    id: string;
    /**
     * 
     * @type {string}
     * @memberof AdminGenreResponseDto
     */
    name: string;
    /**
     * 
     * @type {string}
     * @memberof AdminGenreResponseDto
     */
    slug: string;
    /**
     * 
     * @type {boolean}
     * @memberof AdminGenreResponseDto
     */
    isActive: boolean;
    /**
     * 
     * @type {number}
     * @memberof AdminGenreResponseDto
     */
    sortOrder: number;
    /**
     * Number of non-deleted contents using it (drives "used by" / "most used" / "unused")
     * @type {number}
     * @memberof AdminGenreResponseDto
     */
    contentCount: number;
}
/**
 * 
 * @export
 * @interface AdminLedgerControllerConfirmV1200Response
 */
export interface AdminLedgerControllerConfirmV1200Response {
    /**
     * 
     * @type {number}
     * @memberof AdminLedgerControllerConfirmV1200Response
     */
    statusCode: number;
    /**
     * 
     * @type {string}
     * @memberof AdminLedgerControllerConfirmV1200Response
     */
    status: string;
    /**
     * 
     * @type {string}
     * @memberof AdminLedgerControllerConfirmV1200Response
     */
    message: string;
    /**
     * Error details, or null on success
     * @type {object}
     * @memberof AdminLedgerControllerConfirmV1200Response
     */
    error: object | null;
    /**
     * 
     * @type {ConfirmAdjustmentResultDto}
     * @memberof AdminLedgerControllerConfirmV1200Response
     */
    data?: ConfirmAdjustmentResultDto;
}
/**
 * 
 * @export
 * @interface AdminLedgerControllerPreviewV1200Response
 */
export interface AdminLedgerControllerPreviewV1200Response {
    /**
     * 
     * @type {number}
     * @memberof AdminLedgerControllerPreviewV1200Response
     */
    statusCode: number;
    /**
     * 
     * @type {string}
     * @memberof AdminLedgerControllerPreviewV1200Response
     */
    status: string;
    /**
     * 
     * @type {string}
     * @memberof AdminLedgerControllerPreviewV1200Response
     */
    message: string;
    /**
     * Error details, or null on success
     * @type {object}
     * @memberof AdminLedgerControllerPreviewV1200Response
     */
    error: object | null;
    /**
     * 
     * @type {AdjustPreviewResultDto}
     * @memberof AdminLedgerControllerPreviewV1200Response
     */
    data?: AdjustPreviewResultDto;
}
/**
 * 
 * @export
 * @interface AdminLoginDto
 */
export interface AdminLoginDto {
    /**
     * 
     * @type {string}
     * @memberof AdminLoginDto
     */
    email: string;
    /**
     * 
     * @type {string}
     * @memberof AdminLoginDto
     */
    password: string;
    /**
     * Keep me signed in (longer refresh TTL)
     * @type {boolean}
     * @memberof AdminLoginDto
     */
    rememberMe?: boolean;
}
/**
 * 
 * @export
 * @interface AdminMarkAllReadDto
 */
export interface AdminMarkAllReadDto {
    /**
     * 
     * @type {number}
     * @memberof AdminMarkAllReadDto
     */
    updated: number;
}
/**
 * 
 * @export
 * @interface AdminMarkReadDto
 */
export interface AdminMarkReadDto {
    /**
     * 
     * @type {string}
     * @memberof AdminMarkReadDto
     */
    id: string;
    /**
     * 
     * @type {boolean}
     * @memberof AdminMarkReadDto
     */
    isRead: boolean;
}
/**
 * 
 * @export
 * @interface AdminMarketingControllerDeleteSpendV1200Response
 */
export interface AdminMarketingControllerDeleteSpendV1200Response {
    /**
     * 
     * @type {number}
     * @memberof AdminMarketingControllerDeleteSpendV1200Response
     */
    statusCode: number;
    /**
     * 
     * @type {string}
     * @memberof AdminMarketingControllerDeleteSpendV1200Response
     */
    status: string;
    /**
     * 
     * @type {string}
     * @memberof AdminMarketingControllerDeleteSpendV1200Response
     */
    message: string;
    /**
     * Error details, or null on success
     * @type {object}
     * @memberof AdminMarketingControllerDeleteSpendV1200Response
     */
    error: object | null;
    /**
     * 
     * @type {DeletedDto}
     * @memberof AdminMarketingControllerDeleteSpendV1200Response
     */
    data?: DeletedDto;
}
/**
 * 
 * @export
 * @interface AdminMarketingControllerIngestMentionsV1200Response
 */
export interface AdminMarketingControllerIngestMentionsV1200Response {
    /**
     * 
     * @type {number}
     * @memberof AdminMarketingControllerIngestMentionsV1200Response
     */
    statusCode: number;
    /**
     * 
     * @type {string}
     * @memberof AdminMarketingControllerIngestMentionsV1200Response
     */
    status: string;
    /**
     * 
     * @type {string}
     * @memberof AdminMarketingControllerIngestMentionsV1200Response
     */
    message: string;
    /**
     * Error details, or null on success
     * @type {object}
     * @memberof AdminMarketingControllerIngestMentionsV1200Response
     */
    error: object | null;
    /**
     * 
     * @type {SocialIngestResultDto}
     * @memberof AdminMarketingControllerIngestMentionsV1200Response
     */
    data?: SocialIngestResultDto;
}
/**
 * 
 * @export
 * @interface AdminMarketingControllerListMentionsV1200Response
 */
export interface AdminMarketingControllerListMentionsV1200Response {
    /**
     * 
     * @type {number}
     * @memberof AdminMarketingControllerListMentionsV1200Response
     */
    statusCode: number;
    /**
     * 
     * @type {string}
     * @memberof AdminMarketingControllerListMentionsV1200Response
     */
    status: string;
    /**
     * 
     * @type {string}
     * @memberof AdminMarketingControllerListMentionsV1200Response
     */
    message: string;
    /**
     * Error details, or null on success
     * @type {object}
     * @memberof AdminMarketingControllerListMentionsV1200Response
     */
    error: object | null;
    /**
     * 
     * @type {SocialMentionPageDto}
     * @memberof AdminMarketingControllerListMentionsV1200Response
     */
    data?: SocialMentionPageDto;
}
/**
 * 
 * @export
 * @interface AdminMarketingControllerListSpendV1200Response
 */
export interface AdminMarketingControllerListSpendV1200Response {
    /**
     * 
     * @type {number}
     * @memberof AdminMarketingControllerListSpendV1200Response
     */
    statusCode: number;
    /**
     * 
     * @type {string}
     * @memberof AdminMarketingControllerListSpendV1200Response
     */
    status: string;
    /**
     * 
     * @type {string}
     * @memberof AdminMarketingControllerListSpendV1200Response
     */
    message: string;
    /**
     * Error details, or null on success
     * @type {object}
     * @memberof AdminMarketingControllerListSpendV1200Response
     */
    error: object | null;
    /**
     * 
     * @type {Array<MarketingSpendDto>}
     * @memberof AdminMarketingControllerListSpendV1200Response
     */
    data?: Array<MarketingSpendDto>;
}
/**
 * 
 * @export
 * @interface AdminMarketingControllerSocialSummaryV1200Response
 */
export interface AdminMarketingControllerSocialSummaryV1200Response {
    /**
     * 
     * @type {number}
     * @memberof AdminMarketingControllerSocialSummaryV1200Response
     */
    statusCode: number;
    /**
     * 
     * @type {string}
     * @memberof AdminMarketingControllerSocialSummaryV1200Response
     */
    status: string;
    /**
     * 
     * @type {string}
     * @memberof AdminMarketingControllerSocialSummaryV1200Response
     */
    message: string;
    /**
     * Error details, or null on success
     * @type {object}
     * @memberof AdminMarketingControllerSocialSummaryV1200Response
     */
    error: object | null;
    /**
     * 
     * @type {SocialSummaryDto}
     * @memberof AdminMarketingControllerSocialSummaryV1200Response
     */
    data?: SocialSummaryDto;
}
/**
 * 
 * @export
 * @interface AdminMarketingControllerUpdateMentionV1200Response
 */
export interface AdminMarketingControllerUpdateMentionV1200Response {
    /**
     * 
     * @type {number}
     * @memberof AdminMarketingControllerUpdateMentionV1200Response
     */
    statusCode: number;
    /**
     * 
     * @type {string}
     * @memberof AdminMarketingControllerUpdateMentionV1200Response
     */
    status: string;
    /**
     * 
     * @type {string}
     * @memberof AdminMarketingControllerUpdateMentionV1200Response
     */
    message: string;
    /**
     * Error details, or null on success
     * @type {object}
     * @memberof AdminMarketingControllerUpdateMentionV1200Response
     */
    error: object | null;
    /**
     * 
     * @type {SocialMentionDto}
     * @memberof AdminMarketingControllerUpdateMentionV1200Response
     */
    data?: SocialMentionDto;
}
/**
 * 
 * @export
 * @interface AdminMarketingControllerUpsertSpendV1200Response
 */
export interface AdminMarketingControllerUpsertSpendV1200Response {
    /**
     * 
     * @type {number}
     * @memberof AdminMarketingControllerUpsertSpendV1200Response
     */
    statusCode: number;
    /**
     * 
     * @type {string}
     * @memberof AdminMarketingControllerUpsertSpendV1200Response
     */
    status: string;
    /**
     * 
     * @type {string}
     * @memberof AdminMarketingControllerUpsertSpendV1200Response
     */
    message: string;
    /**
     * Error details, or null on success
     * @type {object}
     * @memberof AdminMarketingControllerUpsertSpendV1200Response
     */
    error: object | null;
    /**
     * 
     * @type {MarketingSpendDto}
     * @memberof AdminMarketingControllerUpsertSpendV1200Response
     */
    data?: MarketingSpendDto;
}
/**
 * 
 * @export
 * @interface AdminModerationControllerAddNoteV1201Response
 */
export interface AdminModerationControllerAddNoteV1201Response {
    /**
     * 
     * @type {number}
     * @memberof AdminModerationControllerAddNoteV1201Response
     */
    statusCode: number;
    /**
     * 
     * @type {string}
     * @memberof AdminModerationControllerAddNoteV1201Response
     */
    status: string;
    /**
     * 
     * @type {string}
     * @memberof AdminModerationControllerAddNoteV1201Response
     */
    message: string;
    /**
     * Error details, or null on success
     * @type {object}
     * @memberof AdminModerationControllerAddNoteV1201Response
     */
    error: object | null;
    /**
     * 
     * @type {TicketNoteDto}
     * @memberof AdminModerationControllerAddNoteV1201Response
     */
    data?: TicketNoteDto;
}
/**
 * 
 * @export
 * @interface AdminModerationControllerAssignV1200Response
 */
export interface AdminModerationControllerAssignV1200Response {
    /**
     * 
     * @type {number}
     * @memberof AdminModerationControllerAssignV1200Response
     */
    statusCode: number;
    /**
     * 
     * @type {string}
     * @memberof AdminModerationControllerAssignV1200Response
     */
    status: string;
    /**
     * 
     * @type {string}
     * @memberof AdminModerationControllerAssignV1200Response
     */
    message: string;
    /**
     * Error details, or null on success
     * @type {object}
     * @memberof AdminModerationControllerAssignV1200Response
     */
    error: object | null;
    /**
     * 
     * @type {TicketAssignedDto}
     * @memberof AdminModerationControllerAssignV1200Response
     */
    data?: TicketAssignedDto;
}
/**
 * 
 * @export
 * @interface AdminModerationControllerAuditV1200Response
 */
export interface AdminModerationControllerAuditV1200Response {
    /**
     * 
     * @type {number}
     * @memberof AdminModerationControllerAuditV1200Response
     */
    statusCode: number;
    /**
     * 
     * @type {string}
     * @memberof AdminModerationControllerAuditV1200Response
     */
    status: string;
    /**
     * 
     * @type {string}
     * @memberof AdminModerationControllerAuditV1200Response
     */
    message: string;
    /**
     * Error details, or null on success
     * @type {object}
     * @memberof AdminModerationControllerAuditV1200Response
     */
    error: object | null;
    /**
     * 
     * @type {AdminModerationControllerAuditV1200ResponseAllOfData}
     * @memberof AdminModerationControllerAuditV1200Response
     */
    data?: AdminModerationControllerAuditV1200ResponseAllOfData;
}
/**
 * 
 * @export
 * @interface AdminModerationControllerAuditV1200ResponseAllOfData
 */
export interface AdminModerationControllerAuditV1200ResponseAllOfData {
    /**
     * 
     * @type {Array<AuditEntryDto>}
     * @memberof AdminModerationControllerAuditV1200ResponseAllOfData
     */
    items?: Array<AuditEntryDto>;
    /**
     * 
     * @type {PaginationDetailsDto}
     * @memberof AdminModerationControllerAuditV1200ResponseAllOfData
     */
    pagination?: PaginationDetailsDto;
}
/**
 * 
 * @export
 * @interface AdminModerationControllerBulkV1200Response
 */
export interface AdminModerationControllerBulkV1200Response {
    /**
     * 
     * @type {number}
     * @memberof AdminModerationControllerBulkV1200Response
     */
    statusCode: number;
    /**
     * 
     * @type {string}
     * @memberof AdminModerationControllerBulkV1200Response
     */
    status: string;
    /**
     * 
     * @type {string}
     * @memberof AdminModerationControllerBulkV1200Response
     */
    message: string;
    /**
     * Error details, or null on success
     * @type {object}
     * @memberof AdminModerationControllerBulkV1200Response
     */
    error: object | null;
    /**
     * 
     * @type {BulkResultDto}
     * @memberof AdminModerationControllerBulkV1200Response
     */
    data?: BulkResultDto;
}
/**
 * 
 * @export
 * @interface AdminModerationControllerDetailV1200Response
 */
export interface AdminModerationControllerDetailV1200Response {
    /**
     * 
     * @type {number}
     * @memberof AdminModerationControllerDetailV1200Response
     */
    statusCode: number;
    /**
     * 
     * @type {string}
     * @memberof AdminModerationControllerDetailV1200Response
     */
    status: string;
    /**
     * 
     * @type {string}
     * @memberof AdminModerationControllerDetailV1200Response
     */
    message: string;
    /**
     * Error details, or null on success
     * @type {object}
     * @memberof AdminModerationControllerDetailV1200Response
     */
    error: object | null;
    /**
     * 
     * @type {TicketDetailDto}
     * @memberof AdminModerationControllerDetailV1200Response
     */
    data?: TicketDetailDto;
}
/**
 * 
 * @export
 * @interface AdminModerationControllerResolveV1200Response
 */
export interface AdminModerationControllerResolveV1200Response {
    /**
     * 
     * @type {number}
     * @memberof AdminModerationControllerResolveV1200Response
     */
    statusCode: number;
    /**
     * 
     * @type {string}
     * @memberof AdminModerationControllerResolveV1200Response
     */
    status: string;
    /**
     * 
     * @type {string}
     * @memberof AdminModerationControllerResolveV1200Response
     */
    message: string;
    /**
     * Error details, or null on success
     * @type {object}
     * @memberof AdminModerationControllerResolveV1200Response
     */
    error: object | null;
    /**
     * 
     * @type {TicketResolvedDto}
     * @memberof AdminModerationControllerResolveV1200Response
     */
    data?: TicketResolvedDto;
}
/**
 * 
 * @export
 * @interface AdminModerationControllerStatsV1200Response
 */
export interface AdminModerationControllerStatsV1200Response {
    /**
     * 
     * @type {number}
     * @memberof AdminModerationControllerStatsV1200Response
     */
    statusCode: number;
    /**
     * 
     * @type {string}
     * @memberof AdminModerationControllerStatsV1200Response
     */
    status: string;
    /**
     * 
     * @type {string}
     * @memberof AdminModerationControllerStatsV1200Response
     */
    message: string;
    /**
     * Error details, or null on success
     * @type {object}
     * @memberof AdminModerationControllerStatsV1200Response
     */
    error: object | null;
    /**
     * 
     * @type {ModerationStatsDto}
     * @memberof AdminModerationControllerStatsV1200Response
     */
    data?: ModerationStatsDto;
}
/**
 * 
 * @export
 * @interface AdminModerationControllerStatusV1200Response
 */
export interface AdminModerationControllerStatusV1200Response {
    /**
     * 
     * @type {number}
     * @memberof AdminModerationControllerStatusV1200Response
     */
    statusCode: number;
    /**
     * 
     * @type {string}
     * @memberof AdminModerationControllerStatusV1200Response
     */
    status: string;
    /**
     * 
     * @type {string}
     * @memberof AdminModerationControllerStatusV1200Response
     */
    message: string;
    /**
     * Error details, or null on success
     * @type {object}
     * @memberof AdminModerationControllerStatusV1200Response
     */
    error: object | null;
    /**
     * 
     * @type {TicketStatusDto}
     * @memberof AdminModerationControllerStatusV1200Response
     */
    data?: TicketStatusDto;
}
/**
 * 
 * @export
 * @interface AdminModerationControllerTicketsV1200Response
 */
export interface AdminModerationControllerTicketsV1200Response {
    /**
     * 
     * @type {number}
     * @memberof AdminModerationControllerTicketsV1200Response
     */
    statusCode: number;
    /**
     * 
     * @type {string}
     * @memberof AdminModerationControllerTicketsV1200Response
     */
    status: string;
    /**
     * 
     * @type {string}
     * @memberof AdminModerationControllerTicketsV1200Response
     */
    message: string;
    /**
     * Error details, or null on success
     * @type {object}
     * @memberof AdminModerationControllerTicketsV1200Response
     */
    error: object | null;
    /**
     * 
     * @type {AdminModerationControllerTicketsV1200ResponseAllOfData}
     * @memberof AdminModerationControllerTicketsV1200Response
     */
    data?: AdminModerationControllerTicketsV1200ResponseAllOfData;
}
/**
 * 
 * @export
 * @interface AdminModerationControllerTicketsV1200ResponseAllOfData
 */
export interface AdminModerationControllerTicketsV1200ResponseAllOfData {
    /**
     * 
     * @type {Array<TicketDto>}
     * @memberof AdminModerationControllerTicketsV1200ResponseAllOfData
     */
    items?: Array<TicketDto>;
    /**
     * 
     * @type {PaginationDetailsDto}
     * @memberof AdminModerationControllerTicketsV1200ResponseAllOfData
     */
    pagination?: PaginationDetailsDto;
}
/**
 * 
 * @export
 * @interface AdminNotificationControllerBroadcastV1200Response
 */
export interface AdminNotificationControllerBroadcastV1200Response {
    /**
     * 
     * @type {number}
     * @memberof AdminNotificationControllerBroadcastV1200Response
     */
    statusCode: number;
    /**
     * 
     * @type {string}
     * @memberof AdminNotificationControllerBroadcastV1200Response
     */
    status: string;
    /**
     * 
     * @type {string}
     * @memberof AdminNotificationControllerBroadcastV1200Response
     */
    message: string;
    /**
     * Error details, or null on success
     * @type {object}
     * @memberof AdminNotificationControllerBroadcastV1200Response
     */
    error: object | null;
    /**
     * 
     * @type {CampaignActionResultDto}
     * @memberof AdminNotificationControllerBroadcastV1200Response
     */
    data?: CampaignActionResultDto;
}
/**
 * 
 * @export
 * @interface AdminNotificationControllerCreateV1201Response
 */
export interface AdminNotificationControllerCreateV1201Response {
    /**
     * 
     * @type {number}
     * @memberof AdminNotificationControllerCreateV1201Response
     */
    statusCode: number;
    /**
     * 
     * @type {string}
     * @memberof AdminNotificationControllerCreateV1201Response
     */
    status: string;
    /**
     * 
     * @type {string}
     * @memberof AdminNotificationControllerCreateV1201Response
     */
    message: string;
    /**
     * Error details, or null on success
     * @type {object}
     * @memberof AdminNotificationControllerCreateV1201Response
     */
    error: object | null;
    /**
     * 
     * @type {CampaignDto}
     * @memberof AdminNotificationControllerCreateV1201Response
     */
    data?: CampaignDto;
}
/**
 * 
 * @export
 * @interface AdminNotificationControllerInboxListV1200Response
 */
export interface AdminNotificationControllerInboxListV1200Response {
    /**
     * 
     * @type {number}
     * @memberof AdminNotificationControllerInboxListV1200Response
     */
    statusCode: number;
    /**
     * 
     * @type {string}
     * @memberof AdminNotificationControllerInboxListV1200Response
     */
    status: string;
    /**
     * 
     * @type {string}
     * @memberof AdminNotificationControllerInboxListV1200Response
     */
    message: string;
    /**
     * Error details, or null on success
     * @type {object}
     * @memberof AdminNotificationControllerInboxListV1200Response
     */
    error: object | null;
    /**
     * 
     * @type {AdminNotificationControllerInboxListV1200ResponseAllOfData}
     * @memberof AdminNotificationControllerInboxListV1200Response
     */
    data?: AdminNotificationControllerInboxListV1200ResponseAllOfData;
}
/**
 * 
 * @export
 * @interface AdminNotificationControllerInboxListV1200ResponseAllOfData
 */
export interface AdminNotificationControllerInboxListV1200ResponseAllOfData {
    /**
     * 
     * @type {Array<AdminNotificationDto>}
     * @memberof AdminNotificationControllerInboxListV1200ResponseAllOfData
     */
    items?: Array<AdminNotificationDto>;
    /**
     * 
     * @type {PaginationDetailsDto}
     * @memberof AdminNotificationControllerInboxListV1200ResponseAllOfData
     */
    pagination?: PaginationDetailsDto;
}
/**
 * 
 * @export
 * @interface AdminNotificationControllerInboxMarkAllReadV1200Response
 */
export interface AdminNotificationControllerInboxMarkAllReadV1200Response {
    /**
     * 
     * @type {number}
     * @memberof AdminNotificationControllerInboxMarkAllReadV1200Response
     */
    statusCode: number;
    /**
     * 
     * @type {string}
     * @memberof AdminNotificationControllerInboxMarkAllReadV1200Response
     */
    status: string;
    /**
     * 
     * @type {string}
     * @memberof AdminNotificationControllerInboxMarkAllReadV1200Response
     */
    message: string;
    /**
     * Error details, or null on success
     * @type {object}
     * @memberof AdminNotificationControllerInboxMarkAllReadV1200Response
     */
    error: object | null;
    /**
     * 
     * @type {AdminMarkAllReadDto}
     * @memberof AdminNotificationControllerInboxMarkAllReadV1200Response
     */
    data?: AdminMarkAllReadDto;
}
/**
 * 
 * @export
 * @interface AdminNotificationControllerInboxMarkReadV1200Response
 */
export interface AdminNotificationControllerInboxMarkReadV1200Response {
    /**
     * 
     * @type {number}
     * @memberof AdminNotificationControllerInboxMarkReadV1200Response
     */
    statusCode: number;
    /**
     * 
     * @type {string}
     * @memberof AdminNotificationControllerInboxMarkReadV1200Response
     */
    status: string;
    /**
     * 
     * @type {string}
     * @memberof AdminNotificationControllerInboxMarkReadV1200Response
     */
    message: string;
    /**
     * Error details, or null on success
     * @type {object}
     * @memberof AdminNotificationControllerInboxMarkReadV1200Response
     */
    error: object | null;
    /**
     * 
     * @type {AdminMarkReadDto}
     * @memberof AdminNotificationControllerInboxMarkReadV1200Response
     */
    data?: AdminMarkReadDto;
}
/**
 * 
 * @export
 * @interface AdminNotificationControllerInboxUnreadCountV1200Response
 */
export interface AdminNotificationControllerInboxUnreadCountV1200Response {
    /**
     * 
     * @type {number}
     * @memberof AdminNotificationControllerInboxUnreadCountV1200Response
     */
    statusCode: number;
    /**
     * 
     * @type {string}
     * @memberof AdminNotificationControllerInboxUnreadCountV1200Response
     */
    status: string;
    /**
     * 
     * @type {string}
     * @memberof AdminNotificationControllerInboxUnreadCountV1200Response
     */
    message: string;
    /**
     * Error details, or null on success
     * @type {object}
     * @memberof AdminNotificationControllerInboxUnreadCountV1200Response
     */
    error: object | null;
    /**
     * 
     * @type {AdminUnreadCountDto}
     * @memberof AdminNotificationControllerInboxUnreadCountV1200Response
     */
    data?: AdminUnreadCountDto;
}
/**
 * 
 * @export
 * @interface AdminNotificationControllerListV1200Response
 */
export interface AdminNotificationControllerListV1200Response {
    /**
     * 
     * @type {number}
     * @memberof AdminNotificationControllerListV1200Response
     */
    statusCode: number;
    /**
     * 
     * @type {string}
     * @memberof AdminNotificationControllerListV1200Response
     */
    status: string;
    /**
     * 
     * @type {string}
     * @memberof AdminNotificationControllerListV1200Response
     */
    message: string;
    /**
     * Error details, or null on success
     * @type {object}
     * @memberof AdminNotificationControllerListV1200Response
     */
    error: object | null;
    /**
     * 
     * @type {AdminNotificationControllerListV1200ResponseAllOfData}
     * @memberof AdminNotificationControllerListV1200Response
     */
    data?: AdminNotificationControllerListV1200ResponseAllOfData;
}
/**
 * 
 * @export
 * @interface AdminNotificationControllerListV1200ResponseAllOfData
 */
export interface AdminNotificationControllerListV1200ResponseAllOfData {
    /**
     * 
     * @type {Array<CampaignDto>}
     * @memberof AdminNotificationControllerListV1200ResponseAllOfData
     */
    items?: Array<CampaignDto>;
    /**
     * 
     * @type {PaginationDetailsDto}
     * @memberof AdminNotificationControllerListV1200ResponseAllOfData
     */
    pagination?: PaginationDetailsDto;
}
/**
 * 
 * @export
 * @interface AdminNotificationDto
 */
export interface AdminNotificationDto {
    /**
     * 
     * @type {string}
     * @memberof AdminNotificationDto
     */
    id: string;
    /**
     * 
     * @type {string}
     * @memberof AdminNotificationDto
     */
    category: AdminNotificationDtoCategoryEnum;
    /**
     * 
     * @type {string}
     * @memberof AdminNotificationDto
     */
    title: string;
    /**
     * 
     * @type {object}
     * @memberof AdminNotificationDto
     */
    body: object | null;
    /**
     * Admin-panel path, e.g. /content/requests?id=…
     * @type {object}
     * @memberof AdminNotificationDto
     */
    deepLink: object | null;
    /**
     * Originating event key
     * @type {object}
     * @memberof AdminNotificationDto
     */
    sourceType: object | null;
    /**
     * 
     * @type {boolean}
     * @memberof AdminNotificationDto
     */
    isRead: boolean;
    /**
     * 
     * @type {object}
     * @memberof AdminNotificationDto
     */
    readAt: object | null;
    /**
     * 
     * @type {string}
     * @memberof AdminNotificationDto
     */
    createdAt: string;
}


/**
 * @export
 */
export const AdminNotificationDtoCategoryEnum = {
    ContentOps: 'content_ops',
    GameOps: 'game_ops',
    Moderation: 'moderation',
    Billing: 'billing',
    Security: 'security',
    AdminSystem: 'admin_system'
} as const;
export type AdminNotificationDtoCategoryEnum = typeof AdminNotificationDtoCategoryEnum[keyof typeof AdminNotificationDtoCategoryEnum];

/**
 * 
 * @export
 * @interface AdminPermissionsControllerListV1200Response
 */
export interface AdminPermissionsControllerListV1200Response {
    /**
     * 
     * @type {number}
     * @memberof AdminPermissionsControllerListV1200Response
     */
    statusCode: number;
    /**
     * 
     * @type {string}
     * @memberof AdminPermissionsControllerListV1200Response
     */
    status: string;
    /**
     * 
     * @type {string}
     * @memberof AdminPermissionsControllerListV1200Response
     */
    message: string;
    /**
     * Error details, or null on success
     * @type {object}
     * @memberof AdminPermissionsControllerListV1200Response
     */
    error: object | null;
    /**
     * 
     * @type {Array<PermissionResponseDto>}
     * @memberof AdminPermissionsControllerListV1200Response
     */
    data?: Array<PermissionResponseDto>;
}
/**
 * 
 * @export
 * @interface AdminPlanControllerCreateV1201Response
 */
export interface AdminPlanControllerCreateV1201Response {
    /**
     * 
     * @type {number}
     * @memberof AdminPlanControllerCreateV1201Response
     */
    statusCode: number;
    /**
     * 
     * @type {string}
     * @memberof AdminPlanControllerCreateV1201Response
     */
    status: string;
    /**
     * 
     * @type {string}
     * @memberof AdminPlanControllerCreateV1201Response
     */
    message: string;
    /**
     * Error details, or null on success
     * @type {object}
     * @memberof AdminPlanControllerCreateV1201Response
     */
    error: object | null;
    /**
     * 
     * @type {PlanDto}
     * @memberof AdminPlanControllerCreateV1201Response
     */
    data?: PlanDto;
}
/**
 * 
 * @export
 * @interface AdminPlanControllerListV1200Response
 */
export interface AdminPlanControllerListV1200Response {
    /**
     * 
     * @type {number}
     * @memberof AdminPlanControllerListV1200Response
     */
    statusCode: number;
    /**
     * 
     * @type {string}
     * @memberof AdminPlanControllerListV1200Response
     */
    status: string;
    /**
     * 
     * @type {string}
     * @memberof AdminPlanControllerListV1200Response
     */
    message: string;
    /**
     * Error details, or null on success
     * @type {object}
     * @memberof AdminPlanControllerListV1200Response
     */
    error: object | null;
    /**
     * 
     * @type {Array<AdminPlanDto>}
     * @memberof AdminPlanControllerListV1200Response
     */
    data?: Array<AdminPlanDto>;
}
/**
 * 
 * @export
 * @interface AdminPlanControllerSetRegionPriceV1200Response
 */
export interface AdminPlanControllerSetRegionPriceV1200Response {
    /**
     * 
     * @type {number}
     * @memberof AdminPlanControllerSetRegionPriceV1200Response
     */
    statusCode: number;
    /**
     * 
     * @type {string}
     * @memberof AdminPlanControllerSetRegionPriceV1200Response
     */
    status: string;
    /**
     * 
     * @type {string}
     * @memberof AdminPlanControllerSetRegionPriceV1200Response
     */
    message: string;
    /**
     * Error details, or null on success
     * @type {object}
     * @memberof AdminPlanControllerSetRegionPriceV1200Response
     */
    error: object | null;
    /**
     * 
     * @type {RegionPriceResultDto}
     * @memberof AdminPlanControllerSetRegionPriceV1200Response
     */
    data?: RegionPriceResultDto;
}
/**
 * 
 * @export
 * @interface AdminPlanDto
 */
export interface AdminPlanDto {
    /**
     * 
     * @type {string}
     * @memberof AdminPlanDto
     */
    id: string;
    /**
     * 
     * @type {string}
     * @memberof AdminPlanDto
     */
    name: string;
    /**
     * 
     * @type {string}
     * @memberof AdminPlanDto
     */
    description?: string | null;
    /**
     * 
     * @type {number}
     * @memberof AdminPlanDto
     */
    basePriceCents: number;
    /**
     * 
     * @type {string}
     * @memberof AdminPlanDto
     */
    baseCurrency: string;
    /**
     * 
     * @type {string}
     * @memberof AdminPlanDto
     */
    interval: AdminPlanDtoIntervalEnum;
    /**
     * 
     * @type {number}
     * @memberof AdminPlanDto
     */
    trialDays: number;
    /**
     * 
     * @type {Array<string>}
     * @memberof AdminPlanDto
     */
    features: Array<string>;
    /**
     * 
     * @type {boolean}
     * @memberof AdminPlanDto
     */
    isActive: boolean;
    /**
     * 
     * @type {boolean}
     * @memberof AdminPlanDto
     */
    isPopular: boolean;
    /**
     * 
     * @type {number}
     * @memberof AdminPlanDto
     */
    sortOrder: number;
    /**
     * 
     * @type {Array<RegionPriceDto>}
     * @memberof AdminPlanDto
     */
    regionPrices: Array<RegionPriceDto>;
}


/**
 * @export
 */
export const AdminPlanDtoIntervalEnum = {
    Monthly: 'monthly',
    Yearly: 'yearly'
} as const;
export type AdminPlanDtoIntervalEnum = typeof AdminPlanDtoIntervalEnum[keyof typeof AdminPlanDtoIntervalEnum];

/**
 * 
 * @export
 * @interface AdminPredictionControllerCancelV1200Response
 */
export interface AdminPredictionControllerCancelV1200Response {
    /**
     * 
     * @type {number}
     * @memberof AdminPredictionControllerCancelV1200Response
     */
    statusCode: number;
    /**
     * 
     * @type {string}
     * @memberof AdminPredictionControllerCancelV1200Response
     */
    status: string;
    /**
     * 
     * @type {string}
     * @memberof AdminPredictionControllerCancelV1200Response
     */
    message: string;
    /**
     * Error details, or null on success
     * @type {object}
     * @memberof AdminPredictionControllerCancelV1200Response
     */
    error: object | null;
    /**
     * 
     * @type {PredictionCancelResultDto}
     * @memberof AdminPredictionControllerCancelV1200Response
     */
    data?: PredictionCancelResultDto;
}
/**
 * 
 * @export
 * @interface AdminPredictionControllerConfirmResolveV1200Response
 */
export interface AdminPredictionControllerConfirmResolveV1200Response {
    /**
     * 
     * @type {number}
     * @memberof AdminPredictionControllerConfirmResolveV1200Response
     */
    statusCode: number;
    /**
     * 
     * @type {string}
     * @memberof AdminPredictionControllerConfirmResolveV1200Response
     */
    status: string;
    /**
     * 
     * @type {string}
     * @memberof AdminPredictionControllerConfirmResolveV1200Response
     */
    message: string;
    /**
     * Error details, or null on success
     * @type {object}
     * @memberof AdminPredictionControllerConfirmResolveV1200Response
     */
    error: object | null;
    /**
     * 
     * @type {PredictionResolveResultDto}
     * @memberof AdminPredictionControllerConfirmResolveV1200Response
     */
    data?: PredictionResolveResultDto;
}
/**
 * 
 * @export
 * @interface AdminPredictionControllerCreateV1201Response
 */
export interface AdminPredictionControllerCreateV1201Response {
    /**
     * 
     * @type {number}
     * @memberof AdminPredictionControllerCreateV1201Response
     */
    statusCode: number;
    /**
     * 
     * @type {string}
     * @memberof AdminPredictionControllerCreateV1201Response
     */
    status: string;
    /**
     * 
     * @type {string}
     * @memberof AdminPredictionControllerCreateV1201Response
     */
    message: string;
    /**
     * Error details, or null on success
     * @type {object}
     * @memberof AdminPredictionControllerCreateV1201Response
     */
    error: object | null;
    /**
     * 
     * @type {PredictionDetailDto}
     * @memberof AdminPredictionControllerCreateV1201Response
     */
    data?: PredictionDetailDto;
}
/**
 * 
 * @export
 * @interface AdminPredictionControllerEntriesV1200Response
 */
export interface AdminPredictionControllerEntriesV1200Response {
    /**
     * 
     * @type {number}
     * @memberof AdminPredictionControllerEntriesV1200Response
     */
    statusCode: number;
    /**
     * 
     * @type {string}
     * @memberof AdminPredictionControllerEntriesV1200Response
     */
    status: string;
    /**
     * 
     * @type {string}
     * @memberof AdminPredictionControllerEntriesV1200Response
     */
    message: string;
    /**
     * Error details, or null on success
     * @type {object}
     * @memberof AdminPredictionControllerEntriesV1200Response
     */
    error: object | null;
    /**
     * 
     * @type {PredictionEntriesListDto}
     * @memberof AdminPredictionControllerEntriesV1200Response
     */
    data?: PredictionEntriesListDto;
}
/**
 * 
 * @export
 * @interface AdminPredictionControllerListV1200Response
 */
export interface AdminPredictionControllerListV1200Response {
    /**
     * 
     * @type {number}
     * @memberof AdminPredictionControllerListV1200Response
     */
    statusCode: number;
    /**
     * 
     * @type {string}
     * @memberof AdminPredictionControllerListV1200Response
     */
    status: string;
    /**
     * 
     * @type {string}
     * @memberof AdminPredictionControllerListV1200Response
     */
    message: string;
    /**
     * Error details, or null on success
     * @type {object}
     * @memberof AdminPredictionControllerListV1200Response
     */
    error: object | null;
    /**
     * 
     * @type {PredictionListDto}
     * @memberof AdminPredictionControllerListV1200Response
     */
    data?: PredictionListDto;
}
/**
 * 
 * @export
 * @interface AdminPredictionControllerPreviewResolveV1200Response
 */
export interface AdminPredictionControllerPreviewResolveV1200Response {
    /**
     * 
     * @type {number}
     * @memberof AdminPredictionControllerPreviewResolveV1200Response
     */
    statusCode: number;
    /**
     * 
     * @type {string}
     * @memberof AdminPredictionControllerPreviewResolveV1200Response
     */
    status: string;
    /**
     * 
     * @type {string}
     * @memberof AdminPredictionControllerPreviewResolveV1200Response
     */
    message: string;
    /**
     * Error details, or null on success
     * @type {object}
     * @memberof AdminPredictionControllerPreviewResolveV1200Response
     */
    error: object | null;
    /**
     * 
     * @type {PredictionResolvePreviewResultDto}
     * @memberof AdminPredictionControllerPreviewResolveV1200Response
     */
    data?: PredictionResolvePreviewResultDto;
}
/**
 * 
 * @export
 * @interface AdminPredictionControllerRemoveV1200Response
 */
export interface AdminPredictionControllerRemoveV1200Response {
    /**
     * 
     * @type {number}
     * @memberof AdminPredictionControllerRemoveV1200Response
     */
    statusCode: number;
    /**
     * 
     * @type {string}
     * @memberof AdminPredictionControllerRemoveV1200Response
     */
    status: string;
    /**
     * 
     * @type {string}
     * @memberof AdminPredictionControllerRemoveV1200Response
     */
    message: string;
    /**
     * Error details, or null on success
     * @type {object}
     * @memberof AdminPredictionControllerRemoveV1200Response
     */
    error: object | null;
    /**
     * 
     * @type {PredictionDeletedResultDto}
     * @memberof AdminPredictionControllerRemoveV1200Response
     */
    data?: PredictionDeletedResultDto;
}
/**
 * 
 * @export
 * @interface AdminPredictionControllerReverseResolutionV1200Response
 */
export interface AdminPredictionControllerReverseResolutionV1200Response {
    /**
     * 
     * @type {number}
     * @memberof AdminPredictionControllerReverseResolutionV1200Response
     */
    statusCode: number;
    /**
     * 
     * @type {string}
     * @memberof AdminPredictionControllerReverseResolutionV1200Response
     */
    status: string;
    /**
     * 
     * @type {string}
     * @memberof AdminPredictionControllerReverseResolutionV1200Response
     */
    message: string;
    /**
     * Error details, or null on success
     * @type {object}
     * @memberof AdminPredictionControllerReverseResolutionV1200Response
     */
    error: object | null;
    /**
     * 
     * @type {PredictionReverseResultDto}
     * @memberof AdminPredictionControllerReverseResolutionV1200Response
     */
    data?: PredictionReverseResultDto;
}
/**
 * 
 * @export
 * @interface AdminPredictionControllerVoidPredictionV1200Response
 */
export interface AdminPredictionControllerVoidPredictionV1200Response {
    /**
     * 
     * @type {number}
     * @memberof AdminPredictionControllerVoidPredictionV1200Response
     */
    statusCode: number;
    /**
     * 
     * @type {string}
     * @memberof AdminPredictionControllerVoidPredictionV1200Response
     */
    status: string;
    /**
     * 
     * @type {string}
     * @memberof AdminPredictionControllerVoidPredictionV1200Response
     */
    message: string;
    /**
     * Error details, or null on success
     * @type {object}
     * @memberof AdminPredictionControllerVoidPredictionV1200Response
     */
    error: object | null;
    /**
     * 
     * @type {PredictionVoidResultDto}
     * @memberof AdminPredictionControllerVoidPredictionV1200Response
     */
    data?: PredictionVoidResultDto;
}
/**
 * 
 * @export
 * @interface AdminQuestControllerCancelV1200Response
 */
export interface AdminQuestControllerCancelV1200Response {
    /**
     * 
     * @type {number}
     * @memberof AdminQuestControllerCancelV1200Response
     */
    statusCode: number;
    /**
     * 
     * @type {string}
     * @memberof AdminQuestControllerCancelV1200Response
     */
    status: string;
    /**
     * 
     * @type {string}
     * @memberof AdminQuestControllerCancelV1200Response
     */
    message: string;
    /**
     * Error details, or null on success
     * @type {object}
     * @memberof AdminQuestControllerCancelV1200Response
     */
    error: object | null;
    /**
     * 
     * @type {QuestCancelResultDto}
     * @memberof AdminQuestControllerCancelV1200Response
     */
    data?: QuestCancelResultDto;
}
/**
 * 
 * @export
 * @interface AdminQuestControllerCreateV1201Response
 */
export interface AdminQuestControllerCreateV1201Response {
    /**
     * 
     * @type {number}
     * @memberof AdminQuestControllerCreateV1201Response
     */
    statusCode: number;
    /**
     * 
     * @type {string}
     * @memberof AdminQuestControllerCreateV1201Response
     */
    status: string;
    /**
     * 
     * @type {string}
     * @memberof AdminQuestControllerCreateV1201Response
     */
    message: string;
    /**
     * Error details, or null on success
     * @type {object}
     * @memberof AdminQuestControllerCreateV1201Response
     */
    error: object | null;
    /**
     * 
     * @type {QuestDetailDto}
     * @memberof AdminQuestControllerCreateV1201Response
     */
    data?: QuestDetailDto;
}
/**
 * 
 * @export
 * @interface AdminQuestControllerListV1200Response
 */
export interface AdminQuestControllerListV1200Response {
    /**
     * 
     * @type {number}
     * @memberof AdminQuestControllerListV1200Response
     */
    statusCode: number;
    /**
     * 
     * @type {string}
     * @memberof AdminQuestControllerListV1200Response
     */
    status: string;
    /**
     * 
     * @type {string}
     * @memberof AdminQuestControllerListV1200Response
     */
    message: string;
    /**
     * Error details, or null on success
     * @type {object}
     * @memberof AdminQuestControllerListV1200Response
     */
    error: object | null;
    /**
     * 
     * @type {QuestListDto}
     * @memberof AdminQuestControllerListV1200Response
     */
    data?: QuestListDto;
}
/**
 * 
 * @export
 * @interface AdminQuestControllerParticipantsV1200Response
 */
export interface AdminQuestControllerParticipantsV1200Response {
    /**
     * 
     * @type {number}
     * @memberof AdminQuestControllerParticipantsV1200Response
     */
    statusCode: number;
    /**
     * 
     * @type {string}
     * @memberof AdminQuestControllerParticipantsV1200Response
     */
    status: string;
    /**
     * 
     * @type {string}
     * @memberof AdminQuestControllerParticipantsV1200Response
     */
    message: string;
    /**
     * Error details, or null on success
     * @type {object}
     * @memberof AdminQuestControllerParticipantsV1200Response
     */
    error: object | null;
    /**
     * 
     * @type {QuestParticipantsListDto}
     * @memberof AdminQuestControllerParticipantsV1200Response
     */
    data?: QuestParticipantsListDto;
}
/**
 * 
 * @export
 * @interface AdminQuestControllerPublishV1200Response
 */
export interface AdminQuestControllerPublishV1200Response {
    /**
     * 
     * @type {number}
     * @memberof AdminQuestControllerPublishV1200Response
     */
    statusCode: number;
    /**
     * 
     * @type {string}
     * @memberof AdminQuestControllerPublishV1200Response
     */
    status: string;
    /**
     * 
     * @type {string}
     * @memberof AdminQuestControllerPublishV1200Response
     */
    message: string;
    /**
     * Error details, or null on success
     * @type {object}
     * @memberof AdminQuestControllerPublishV1200Response
     */
    error: object | null;
    /**
     * 
     * @type {QuestStatusResultDto}
     * @memberof AdminQuestControllerPublishV1200Response
     */
    data?: QuestStatusResultDto;
}
/**
 * 
 * @export
 * @interface AdminQuestControllerRemoveV1200Response
 */
export interface AdminQuestControllerRemoveV1200Response {
    /**
     * 
     * @type {number}
     * @memberof AdminQuestControllerRemoveV1200Response
     */
    statusCode: number;
    /**
     * 
     * @type {string}
     * @memberof AdminQuestControllerRemoveV1200Response
     */
    status: string;
    /**
     * 
     * @type {string}
     * @memberof AdminQuestControllerRemoveV1200Response
     */
    message: string;
    /**
     * Error details, or null on success
     * @type {object}
     * @memberof AdminQuestControllerRemoveV1200Response
     */
    error: object | null;
    /**
     * 
     * @type {QuestDeletedResultDto}
     * @memberof AdminQuestControllerRemoveV1200Response
     */
    data?: QuestDeletedResultDto;
}
/**
 * 
 * @export
 * @interface AdminRegionsControllerCatalogV1200Response
 */
export interface AdminRegionsControllerCatalogV1200Response {
    /**
     * 
     * @type {number}
     * @memberof AdminRegionsControllerCatalogV1200Response
     */
    statusCode: number;
    /**
     * 
     * @type {string}
     * @memberof AdminRegionsControllerCatalogV1200Response
     */
    status: string;
    /**
     * 
     * @type {string}
     * @memberof AdminRegionsControllerCatalogV1200Response
     */
    message: string;
    /**
     * Error details, or null on success
     * @type {object}
     * @memberof AdminRegionsControllerCatalogV1200Response
     */
    error: object | null;
    /**
     * 
     * @type {RegionCatalogDto}
     * @memberof AdminRegionsControllerCatalogV1200Response
     */
    data?: RegionCatalogDto;
}
/**
 * 
 * @export
 * @interface AdminRegionsControllerCountriesV1200Response
 */
export interface AdminRegionsControllerCountriesV1200Response {
    /**
     * 
     * @type {number}
     * @memberof AdminRegionsControllerCountriesV1200Response
     */
    statusCode: number;
    /**
     * 
     * @type {string}
     * @memberof AdminRegionsControllerCountriesV1200Response
     */
    status: string;
    /**
     * 
     * @type {string}
     * @memberof AdminRegionsControllerCountriesV1200Response
     */
    message: string;
    /**
     * Error details, or null on success
     * @type {object}
     * @memberof AdminRegionsControllerCountriesV1200Response
     */
    error: object | null;
    /**
     * 
     * @type {Array<CountryListItemDto>}
     * @memberof AdminRegionsControllerCountriesV1200Response
     */
    data?: Array<CountryListItemDto>;
}
/**
 * 
 * @export
 * @interface AdminReportsControllerCatalogV1200Response
 */
export interface AdminReportsControllerCatalogV1200Response {
    /**
     * 
     * @type {number}
     * @memberof AdminReportsControllerCatalogV1200Response
     */
    statusCode: number;
    /**
     * 
     * @type {string}
     * @memberof AdminReportsControllerCatalogV1200Response
     */
    status: string;
    /**
     * 
     * @type {string}
     * @memberof AdminReportsControllerCatalogV1200Response
     */
    message: string;
    /**
     * Error details, or null on success
     * @type {object}
     * @memberof AdminReportsControllerCatalogV1200Response
     */
    error: object | null;
    /**
     * 
     * @type {ReportCatalogDto}
     * @memberof AdminReportsControllerCatalogV1200Response
     */
    data?: ReportCatalogDto;
}
/**
 * 
 * @export
 * @interface AdminReportsControllerExportV1200Response
 */
export interface AdminReportsControllerExportV1200Response {
    /**
     * 
     * @type {number}
     * @memberof AdminReportsControllerExportV1200Response
     */
    statusCode: number;
    /**
     * 
     * @type {string}
     * @memberof AdminReportsControllerExportV1200Response
     */
    status: string;
    /**
     * 
     * @type {string}
     * @memberof AdminReportsControllerExportV1200Response
     */
    message: string;
    /**
     * Error details, or null on success
     * @type {object}
     * @memberof AdminReportsControllerExportV1200Response
     */
    error: object | null;
    /**
     * 
     * @type {ReportDto}
     * @memberof AdminReportsControllerExportV1200Response
     */
    data?: ReportDto;
}
/**
 * 
 * @export
 * @interface AdminRewardRuleControllerGetV1200Response
 */
export interface AdminRewardRuleControllerGetV1200Response {
    /**
     * 
     * @type {number}
     * @memberof AdminRewardRuleControllerGetV1200Response
     */
    statusCode: number;
    /**
     * 
     * @type {string}
     * @memberof AdminRewardRuleControllerGetV1200Response
     */
    status: string;
    /**
     * 
     * @type {string}
     * @memberof AdminRewardRuleControllerGetV1200Response
     */
    message: string;
    /**
     * Error details, or null on success
     * @type {object}
     * @memberof AdminRewardRuleControllerGetV1200Response
     */
    error: object | null;
    /**
     * 
     * @type {RewardRuleDto}
     * @memberof AdminRewardRuleControllerGetV1200Response
     */
    data?: RewardRuleDto;
}
/**
 * 
 * @export
 * @interface AdminRewardRuleControllerListV1200Response
 */
export interface AdminRewardRuleControllerListV1200Response {
    /**
     * 
     * @type {number}
     * @memberof AdminRewardRuleControllerListV1200Response
     */
    statusCode: number;
    /**
     * 
     * @type {string}
     * @memberof AdminRewardRuleControllerListV1200Response
     */
    status: string;
    /**
     * 
     * @type {string}
     * @memberof AdminRewardRuleControllerListV1200Response
     */
    message: string;
    /**
     * Error details, or null on success
     * @type {object}
     * @memberof AdminRewardRuleControllerListV1200Response
     */
    error: object | null;
    /**
     * 
     * @type {Array<RewardRuleDto>}
     * @memberof AdminRewardRuleControllerListV1200Response
     */
    data?: Array<RewardRuleDto>;
}
/**
 * 
 * @export
 * @interface AdminRewardRuleControllerVersionsV1200Response
 */
export interface AdminRewardRuleControllerVersionsV1200Response {
    /**
     * 
     * @type {number}
     * @memberof AdminRewardRuleControllerVersionsV1200Response
     */
    statusCode: number;
    /**
     * 
     * @type {string}
     * @memberof AdminRewardRuleControllerVersionsV1200Response
     */
    status: string;
    /**
     * 
     * @type {string}
     * @memberof AdminRewardRuleControllerVersionsV1200Response
     */
    message: string;
    /**
     * Error details, or null on success
     * @type {object}
     * @memberof AdminRewardRuleControllerVersionsV1200Response
     */
    error: object | null;
    /**
     * 
     * @type {Array<RewardRuleVersionDto>}
     * @memberof AdminRewardRuleControllerVersionsV1200Response
     */
    data?: Array<RewardRuleVersionDto>;
}
/**
 * 
 * @export
 * @interface AdminRolesControllerCreateV1201Response
 */
export interface AdminRolesControllerCreateV1201Response {
    /**
     * 
     * @type {number}
     * @memberof AdminRolesControllerCreateV1201Response
     */
    statusCode: number;
    /**
     * 
     * @type {string}
     * @memberof AdminRolesControllerCreateV1201Response
     */
    status: string;
    /**
     * 
     * @type {string}
     * @memberof AdminRolesControllerCreateV1201Response
     */
    message: string;
    /**
     * Error details, or null on success
     * @type {object}
     * @memberof AdminRolesControllerCreateV1201Response
     */
    error: object | null;
    /**
     * 
     * @type {RoleResponseDto}
     * @memberof AdminRolesControllerCreateV1201Response
     */
    data?: RoleResponseDto;
}
/**
 * 
 * @export
 * @interface AdminRolesControllerListV1200Response
 */
export interface AdminRolesControllerListV1200Response {
    /**
     * 
     * @type {number}
     * @memberof AdminRolesControllerListV1200Response
     */
    statusCode: number;
    /**
     * 
     * @type {string}
     * @memberof AdminRolesControllerListV1200Response
     */
    status: string;
    /**
     * 
     * @type {string}
     * @memberof AdminRolesControllerListV1200Response
     */
    message: string;
    /**
     * Error details, or null on success
     * @type {object}
     * @memberof AdminRolesControllerListV1200Response
     */
    error: object | null;
    /**
     * 
     * @type {Array<RoleResponseDto>}
     * @memberof AdminRolesControllerListV1200Response
     */
    data?: Array<RoleResponseDto>;
}
/**
 * 
 * @export
 * @interface AdminSessionResponseDto
 */
export interface AdminSessionResponseDto {
    /**
     * 
     * @type {UserResponseDto}
     * @memberof AdminSessionResponseDto
     */
    user: UserResponseDto;
    /**
     * Access token (mobile only; web uses cookies)
     * @type {string}
     * @memberof AdminSessionResponseDto
     */
    accessToken?: string;
    /**
     * Refresh token (mobile only; web uses cookies)
     * @type {string}
     * @memberof AdminSessionResponseDto
     */
    refreshToken?: string;
    /**
     * Double-submit CSRF token (web only). Also set as the `csrf` cookie; cross-site frontends must keep it in memory and send it as `x-csrf-token` on mutations.
     * @type {string}
     * @memberof AdminSessionResponseDto
     */
    csrfToken?: string;
}
/**
 * 
 * @export
 * @interface AdminSettingsControllerAppVersionV1200Response
 */
export interface AdminSettingsControllerAppVersionV1200Response {
    /**
     * 
     * @type {number}
     * @memberof AdminSettingsControllerAppVersionV1200Response
     */
    statusCode: number;
    /**
     * 
     * @type {string}
     * @memberof AdminSettingsControllerAppVersionV1200Response
     */
    status: string;
    /**
     * 
     * @type {string}
     * @memberof AdminSettingsControllerAppVersionV1200Response
     */
    message: string;
    /**
     * Error details, or null on success
     * @type {object}
     * @memberof AdminSettingsControllerAppVersionV1200Response
     */
    error: object | null;
    /**
     * 
     * @type {object}
     * @memberof AdminSettingsControllerAppVersionV1200Response
     */
    data?: object;
}
/**
 * 
 * @export
 * @interface AdminSettingsControllerFlagsV1200Response
 */
export interface AdminSettingsControllerFlagsV1200Response {
    /**
     * 
     * @type {number}
     * @memberof AdminSettingsControllerFlagsV1200Response
     */
    statusCode: number;
    /**
     * 
     * @type {string}
     * @memberof AdminSettingsControllerFlagsV1200Response
     */
    status: string;
    /**
     * 
     * @type {string}
     * @memberof AdminSettingsControllerFlagsV1200Response
     */
    message: string;
    /**
     * Error details, or null on success
     * @type {object}
     * @memberof AdminSettingsControllerFlagsV1200Response
     */
    error: object | null;
    /**
     * 
     * @type {object}
     * @memberof AdminSettingsControllerFlagsV1200Response
     */
    data?: object;
}
/**
 * 
 * @export
 * @interface AdminSubscriptionControllerGetV1200Response
 */
export interface AdminSubscriptionControllerGetV1200Response {
    /**
     * 
     * @type {number}
     * @memberof AdminSubscriptionControllerGetV1200Response
     */
    statusCode: number;
    /**
     * 
     * @type {string}
     * @memberof AdminSubscriptionControllerGetV1200Response
     */
    status: string;
    /**
     * 
     * @type {string}
     * @memberof AdminSubscriptionControllerGetV1200Response
     */
    message: string;
    /**
     * Error details, or null on success
     * @type {object}
     * @memberof AdminSubscriptionControllerGetV1200Response
     */
    error: object | null;
    /**
     * 
     * @type {SubscriptionDetailDto}
     * @memberof AdminSubscriptionControllerGetV1200Response
     */
    data?: SubscriptionDetailDto;
}
/**
 * 
 * @export
 * @interface AdminSubscriptionControllerListV1200Response
 */
export interface AdminSubscriptionControllerListV1200Response {
    /**
     * 
     * @type {number}
     * @memberof AdminSubscriptionControllerListV1200Response
     */
    statusCode: number;
    /**
     * 
     * @type {string}
     * @memberof AdminSubscriptionControllerListV1200Response
     */
    status: string;
    /**
     * 
     * @type {string}
     * @memberof AdminSubscriptionControllerListV1200Response
     */
    message: string;
    /**
     * Error details, or null on success
     * @type {object}
     * @memberof AdminSubscriptionControllerListV1200Response
     */
    error: object | null;
    /**
     * 
     * @type {AdminSubscriptionControllerListV1200ResponseAllOfData}
     * @memberof AdminSubscriptionControllerListV1200Response
     */
    data?: AdminSubscriptionControllerListV1200ResponseAllOfData;
}
/**
 * 
 * @export
 * @interface AdminSubscriptionControllerListV1200ResponseAllOfData
 */
export interface AdminSubscriptionControllerListV1200ResponseAllOfData {
    /**
     * 
     * @type {Array<SubscriptionDto>}
     * @memberof AdminSubscriptionControllerListV1200ResponseAllOfData
     */
    items?: Array<SubscriptionDto>;
    /**
     * 
     * @type {PaginationDetailsDto}
     * @memberof AdminSubscriptionControllerListV1200ResponseAllOfData
     */
    pagination?: PaginationDetailsDto;
}
/**
 * 
 * @export
 * @interface AdminTagResponseDto
 */
export interface AdminTagResponseDto {
    /**
     * 
     * @type {string}
     * @memberof AdminTagResponseDto
     */
    id: string;
    /**
     * 
     * @type {string}
     * @memberof AdminTagResponseDto
     */
    name: string;
    /**
     * 
     * @type {string}
     * @memberof AdminTagResponseDto
     */
    slug: string;
    /**
     * Number of non-deleted contents using it (drives "used by" / "most used" / "unused")
     * @type {number}
     * @memberof AdminTagResponseDto
     */
    contentCount: number;
}
/**
 * 
 * @export
 * @interface AdminTaxonomyControllerCreateGenreV1201Response
 */
export interface AdminTaxonomyControllerCreateGenreV1201Response {
    /**
     * 
     * @type {number}
     * @memberof AdminTaxonomyControllerCreateGenreV1201Response
     */
    statusCode: number;
    /**
     * 
     * @type {string}
     * @memberof AdminTaxonomyControllerCreateGenreV1201Response
     */
    status: string;
    /**
     * 
     * @type {string}
     * @memberof AdminTaxonomyControllerCreateGenreV1201Response
     */
    message: string;
    /**
     * Error details, or null on success
     * @type {object}
     * @memberof AdminTaxonomyControllerCreateGenreV1201Response
     */
    error: object | null;
    /**
     * 
     * @type {AdminGenreResponseDto}
     * @memberof AdminTaxonomyControllerCreateGenreV1201Response
     */
    data?: AdminGenreResponseDto;
}
/**
 * 
 * @export
 * @interface AdminTaxonomyControllerCreatePersonV1201Response
 */
export interface AdminTaxonomyControllerCreatePersonV1201Response {
    /**
     * 
     * @type {number}
     * @memberof AdminTaxonomyControllerCreatePersonV1201Response
     */
    statusCode: number;
    /**
     * 
     * @type {string}
     * @memberof AdminTaxonomyControllerCreatePersonV1201Response
     */
    status: string;
    /**
     * 
     * @type {string}
     * @memberof AdminTaxonomyControllerCreatePersonV1201Response
     */
    message: string;
    /**
     * Error details, or null on success
     * @type {object}
     * @memberof AdminTaxonomyControllerCreatePersonV1201Response
     */
    error: object | null;
    /**
     * 
     * @type {PersonResponseDto}
     * @memberof AdminTaxonomyControllerCreatePersonV1201Response
     */
    data?: PersonResponseDto;
}
/**
 * 
 * @export
 * @interface AdminTaxonomyControllerCreateStudioV1201Response
 */
export interface AdminTaxonomyControllerCreateStudioV1201Response {
    /**
     * 
     * @type {number}
     * @memberof AdminTaxonomyControllerCreateStudioV1201Response
     */
    statusCode: number;
    /**
     * 
     * @type {string}
     * @memberof AdminTaxonomyControllerCreateStudioV1201Response
     */
    status: string;
    /**
     * 
     * @type {string}
     * @memberof AdminTaxonomyControllerCreateStudioV1201Response
     */
    message: string;
    /**
     * Error details, or null on success
     * @type {object}
     * @memberof AdminTaxonomyControllerCreateStudioV1201Response
     */
    error: object | null;
    /**
     * 
     * @type {StudioResponseDto}
     * @memberof AdminTaxonomyControllerCreateStudioV1201Response
     */
    data?: StudioResponseDto;
}
/**
 * 
 * @export
 * @interface AdminTaxonomyControllerCreateTagV1201Response
 */
export interface AdminTaxonomyControllerCreateTagV1201Response {
    /**
     * 
     * @type {number}
     * @memberof AdminTaxonomyControllerCreateTagV1201Response
     */
    statusCode: number;
    /**
     * 
     * @type {string}
     * @memberof AdminTaxonomyControllerCreateTagV1201Response
     */
    status: string;
    /**
     * 
     * @type {string}
     * @memberof AdminTaxonomyControllerCreateTagV1201Response
     */
    message: string;
    /**
     * Error details, or null on success
     * @type {object}
     * @memberof AdminTaxonomyControllerCreateTagV1201Response
     */
    error: object | null;
    /**
     * 
     * @type {AdminTagResponseDto}
     * @memberof AdminTaxonomyControllerCreateTagV1201Response
     */
    data?: AdminTagResponseDto;
}
/**
 * 
 * @export
 * @interface AdminTaxonomyControllerGenresV1200Response
 */
export interface AdminTaxonomyControllerGenresV1200Response {
    /**
     * 
     * @type {number}
     * @memberof AdminTaxonomyControllerGenresV1200Response
     */
    statusCode: number;
    /**
     * 
     * @type {string}
     * @memberof AdminTaxonomyControllerGenresV1200Response
     */
    status: string;
    /**
     * 
     * @type {string}
     * @memberof AdminTaxonomyControllerGenresV1200Response
     */
    message: string;
    /**
     * Error details, or null on success
     * @type {object}
     * @memberof AdminTaxonomyControllerGenresV1200Response
     */
    error: object | null;
    /**
     * 
     * @type {GenreListResponseDto}
     * @memberof AdminTaxonomyControllerGenresV1200Response
     */
    data?: GenreListResponseDto;
}
/**
 * 
 * @export
 * @interface AdminTaxonomyControllerPeopleV1200Response
 */
export interface AdminTaxonomyControllerPeopleV1200Response {
    /**
     * 
     * @type {number}
     * @memberof AdminTaxonomyControllerPeopleV1200Response
     */
    statusCode: number;
    /**
     * 
     * @type {string}
     * @memberof AdminTaxonomyControllerPeopleV1200Response
     */
    status: string;
    /**
     * 
     * @type {string}
     * @memberof AdminTaxonomyControllerPeopleV1200Response
     */
    message: string;
    /**
     * Error details, or null on success
     * @type {object}
     * @memberof AdminTaxonomyControllerPeopleV1200Response
     */
    error: object | null;
    /**
     * 
     * @type {PersonListResponseDto}
     * @memberof AdminTaxonomyControllerPeopleV1200Response
     */
    data?: PersonListResponseDto;
}
/**
 * 
 * @export
 * @interface AdminTaxonomyControllerStudiosV1200Response
 */
export interface AdminTaxonomyControllerStudiosV1200Response {
    /**
     * 
     * @type {number}
     * @memberof AdminTaxonomyControllerStudiosV1200Response
     */
    statusCode: number;
    /**
     * 
     * @type {string}
     * @memberof AdminTaxonomyControllerStudiosV1200Response
     */
    status: string;
    /**
     * 
     * @type {string}
     * @memberof AdminTaxonomyControllerStudiosV1200Response
     */
    message: string;
    /**
     * Error details, or null on success
     * @type {object}
     * @memberof AdminTaxonomyControllerStudiosV1200Response
     */
    error: object | null;
    /**
     * 
     * @type {StudioListResponseDto}
     * @memberof AdminTaxonomyControllerStudiosV1200Response
     */
    data?: StudioListResponseDto;
}
/**
 * 
 * @export
 * @interface AdminTaxonomyControllerTagsV1200Response
 */
export interface AdminTaxonomyControllerTagsV1200Response {
    /**
     * 
     * @type {number}
     * @memberof AdminTaxonomyControllerTagsV1200Response
     */
    statusCode: number;
    /**
     * 
     * @type {string}
     * @memberof AdminTaxonomyControllerTagsV1200Response
     */
    status: string;
    /**
     * 
     * @type {string}
     * @memberof AdminTaxonomyControllerTagsV1200Response
     */
    message: string;
    /**
     * Error details, or null on success
     * @type {object}
     * @memberof AdminTaxonomyControllerTagsV1200Response
     */
    error: object | null;
    /**
     * 
     * @type {TagListResponseDto}
     * @memberof AdminTaxonomyControllerTagsV1200Response
     */
    data?: TagListResponseDto;
}
/**
 * 
 * @export
 * @interface AdminUnreadCountDto
 */
export interface AdminUnreadCountDto {
    /**
     * 
     * @type {number}
     * @memberof AdminUnreadCountDto
     */
    count: number;
}
/**
 * 
 * @export
 * @interface AdminUpdateUserDto
 */
export interface AdminUpdateUserDto {
    /**
     * 
     * @type {string}
     * @memberof AdminUpdateUserDto
     */
    firstName?: string;
    /**
     * 
     * @type {string}
     * @memberof AdminUpdateUserDto
     */
    lastName?: string;
}
/**
 * 
 * @export
 * @interface AdminUserProfileControllerGamesV1200Response
 */
export interface AdminUserProfileControllerGamesV1200Response {
    /**
     * 
     * @type {number}
     * @memberof AdminUserProfileControllerGamesV1200Response
     */
    statusCode: number;
    /**
     * 
     * @type {string}
     * @memberof AdminUserProfileControllerGamesV1200Response
     */
    status: string;
    /**
     * 
     * @type {string}
     * @memberof AdminUserProfileControllerGamesV1200Response
     */
    message: string;
    /**
     * Error details, or null on success
     * @type {object}
     * @memberof AdminUserProfileControllerGamesV1200Response
     */
    error: object | null;
    /**
     * 
     * @type {UserGamesActivityDto}
     * @memberof AdminUserProfileControllerGamesV1200Response
     */
    data?: UserGamesActivityDto;
}
/**
 * 
 * @export
 * @interface AdminUserProfileControllerReferralsV1200Response
 */
export interface AdminUserProfileControllerReferralsV1200Response {
    /**
     * 
     * @type {number}
     * @memberof AdminUserProfileControllerReferralsV1200Response
     */
    statusCode: number;
    /**
     * 
     * @type {string}
     * @memberof AdminUserProfileControllerReferralsV1200Response
     */
    status: string;
    /**
     * 
     * @type {string}
     * @memberof AdminUserProfileControllerReferralsV1200Response
     */
    message: string;
    /**
     * Error details, or null on success
     * @type {object}
     * @memberof AdminUserProfileControllerReferralsV1200Response
     */
    error: object | null;
    /**
     * 
     * @type {ReferralsDto}
     * @memberof AdminUserProfileControllerReferralsV1200Response
     */
    data?: ReferralsDto;
}
/**
 * 
 * @export
 * @interface AdminUserProfileControllerReportsV1200Response
 */
export interface AdminUserProfileControllerReportsV1200Response {
    /**
     * 
     * @type {number}
     * @memberof AdminUserProfileControllerReportsV1200Response
     */
    statusCode: number;
    /**
     * 
     * @type {string}
     * @memberof AdminUserProfileControllerReportsV1200Response
     */
    status: string;
    /**
     * 
     * @type {string}
     * @memberof AdminUserProfileControllerReportsV1200Response
     */
    message: string;
    /**
     * Error details, or null on success
     * @type {object}
     * @memberof AdminUserProfileControllerReportsV1200Response
     */
    error: object | null;
    /**
     * 
     * @type {UserReportsActivityDto}
     * @memberof AdminUserProfileControllerReportsV1200Response
     */
    data?: UserReportsActivityDto;
}
/**
 * 
 * @export
 * @interface AdminUserProfileControllerSetRolesV1200Response
 */
export interface AdminUserProfileControllerSetRolesV1200Response {
    /**
     * 
     * @type {number}
     * @memberof AdminUserProfileControllerSetRolesV1200Response
     */
    statusCode: number;
    /**
     * 
     * @type {string}
     * @memberof AdminUserProfileControllerSetRolesV1200Response
     */
    status: string;
    /**
     * 
     * @type {string}
     * @memberof AdminUserProfileControllerSetRolesV1200Response
     */
    message: string;
    /**
     * Error details, or null on success
     * @type {object}
     * @memberof AdminUserProfileControllerSetRolesV1200Response
     */
    error: object | null;
    /**
     * 
     * @type {UserRolesDto}
     * @memberof AdminUserProfileControllerSetRolesV1200Response
     */
    data?: UserRolesDto;
}
/**
 * 
 * @export
 * @interface AdminUserProfileControllerWarnV1200Response
 */
export interface AdminUserProfileControllerWarnV1200Response {
    /**
     * 
     * @type {number}
     * @memberof AdminUserProfileControllerWarnV1200Response
     */
    statusCode: number;
    /**
     * 
     * @type {string}
     * @memberof AdminUserProfileControllerWarnV1200Response
     */
    status: string;
    /**
     * 
     * @type {string}
     * @memberof AdminUserProfileControllerWarnV1200Response
     */
    message: string;
    /**
     * Error details, or null on success
     * @type {object}
     * @memberof AdminUserProfileControllerWarnV1200Response
     */
    error: object | null;
    /**
     * 
     * @type {UserWarnedDto}
     * @memberof AdminUserProfileControllerWarnV1200Response
     */
    data?: UserWarnedDto;
}
/**
 * 
 * @export
 * @interface AdminUserProfileControllerWatchHistoryV1200Response
 */
export interface AdminUserProfileControllerWatchHistoryV1200Response {
    /**
     * 
     * @type {number}
     * @memberof AdminUserProfileControllerWatchHistoryV1200Response
     */
    statusCode: number;
    /**
     * 
     * @type {string}
     * @memberof AdminUserProfileControllerWatchHistoryV1200Response
     */
    status: string;
    /**
     * 
     * @type {string}
     * @memberof AdminUserProfileControllerWatchHistoryV1200Response
     */
    message: string;
    /**
     * Error details, or null on success
     * @type {object}
     * @memberof AdminUserProfileControllerWatchHistoryV1200Response
     */
    error: object | null;
    /**
     * 
     * @type {WatchHistoryDto}
     * @memberof AdminUserProfileControllerWatchHistoryV1200Response
     */
    data?: WatchHistoryDto;
}
/**
 * 
 * @export
 * @interface AdminUserProfileControllerWatchStatsV1200Response
 */
export interface AdminUserProfileControllerWatchStatsV1200Response {
    /**
     * 
     * @type {number}
     * @memberof AdminUserProfileControllerWatchStatsV1200Response
     */
    statusCode: number;
    /**
     * 
     * @type {string}
     * @memberof AdminUserProfileControllerWatchStatsV1200Response
     */
    status: string;
    /**
     * 
     * @type {string}
     * @memberof AdminUserProfileControllerWatchStatsV1200Response
     */
    message: string;
    /**
     * Error details, or null on success
     * @type {object}
     * @memberof AdminUserProfileControllerWatchStatsV1200Response
     */
    error: object | null;
    /**
     * 
     * @type {WatchStatsDto}
     * @memberof AdminUserProfileControllerWatchStatsV1200Response
     */
    data?: WatchStatsDto;
}
/**
 * 
 * @export
 * @interface AdminUserResponseDto
 */
export interface AdminUserResponseDto {
    /**
     * 
     * @type {string}
     * @memberof AdminUserResponseDto
     */
    id: string;
    /**
     * 
     * @type {string}
     * @memberof AdminUserResponseDto
     */
    accountType: AdminUserResponseDtoAccountTypeEnum;
    /**
     * 
     * @type {string}
     * @memberof AdminUserResponseDto
     */
    email: string | null;
    /**
     * 
     * @type {string}
     * @memberof AdminUserResponseDto
     */
    phone: string | null;
    /**
     * 
     * @type {string}
     * @memberof AdminUserResponseDto
     */
    username: string | null;
    /**
     * 
     * @type {string}
     * @memberof AdminUserResponseDto
     */
    firstName: string | null;
    /**
     * 
     * @type {string}
     * @memberof AdminUserResponseDto
     */
    lastName: string | null;
    /**
     * 
     * @type {string}
     * @memberof AdminUserResponseDto
     */
    gender: string | null;
    /**
     * 
     * @type {string}
     * @memberof AdminUserResponseDto
     */
    avatarUrl: string | null;
    /**
     * 
     * @type {string}
     * @memberof AdminUserResponseDto
     */
    status: AdminUserResponseDtoStatusEnum;
    /**
     * 
     * @type {boolean}
     * @memberof AdminUserResponseDto
     */
    isPhoneVerified: boolean;
    /**
     * 
     * @type {boolean}
     * @memberof AdminUserResponseDto
     */
    isEmailVerified: boolean;
    /**
     * 
     * @type {string}
     * @memberof AdminUserResponseDto
     */
    countryCode: string | null;
    /**
     * 
     * @type {Array<string>}
     * @memberof AdminUserResponseDto
     */
    roles: Array<string>;
    /**
     * 
     * @type {Array<string>}
     * @memberof AdminUserResponseDto
     */
    permissions: Array<string>;
    /**
     * 
     * @type {string}
     * @memberof AdminUserResponseDto
     */
    createdAt: string;
    /**
     * True until the invited admin sets a password (redeems the invite code)
     * @type {boolean}
     * @memberof AdminUserResponseDto
     */
    invitePending: boolean;
}


/**
 * @export
 */
export const AdminUserResponseDtoAccountTypeEnum = {
    Guest: 'guest',
    Customer: 'customer',
    Admin: 'admin'
} as const;
export type AdminUserResponseDtoAccountTypeEnum = typeof AdminUserResponseDtoAccountTypeEnum[keyof typeof AdminUserResponseDtoAccountTypeEnum];

/**
 * @export
 */
export const AdminUserResponseDtoStatusEnum = {
    Active: 'active',
    Suspended: 'suspended',
    Banned: 'banned',
    Disabled: 'disabled'
} as const;
export type AdminUserResponseDtoStatusEnum = typeof AdminUserResponseDtoStatusEnum[keyof typeof AdminUserResponseDtoStatusEnum];

/**
 * 
 * @export
 * @interface AdminUsersControllerGetV1200Response
 */
export interface AdminUsersControllerGetV1200Response {
    /**
     * 
     * @type {number}
     * @memberof AdminUsersControllerGetV1200Response
     */
    statusCode: number;
    /**
     * 
     * @type {string}
     * @memberof AdminUsersControllerGetV1200Response
     */
    status: string;
    /**
     * 
     * @type {string}
     * @memberof AdminUsersControllerGetV1200Response
     */
    message: string;
    /**
     * Error details, or null on success
     * @type {object}
     * @memberof AdminUsersControllerGetV1200Response
     */
    error: object | null;
    /**
     * 
     * @type {UserDetailResponseDto}
     * @memberof AdminUsersControllerGetV1200Response
     */
    data?: UserDetailResponseDto;
}
/**
 * 
 * @export
 * @interface AdminUsersControllerListV1200Response
 */
export interface AdminUsersControllerListV1200Response {
    /**
     * 
     * @type {number}
     * @memberof AdminUsersControllerListV1200Response
     */
    statusCode: number;
    /**
     * 
     * @type {string}
     * @memberof AdminUsersControllerListV1200Response
     */
    status: string;
    /**
     * 
     * @type {string}
     * @memberof AdminUsersControllerListV1200Response
     */
    message: string;
    /**
     * Error details, or null on success
     * @type {object}
     * @memberof AdminUsersControllerListV1200Response
     */
    error: object | null;
    /**
     * 
     * @type {UserListResponseDto}
     * @memberof AdminUsersControllerListV1200Response
     */
    data?: UserListResponseDto;
}
/**
 * 
 * @export
 * @interface AdsControllerCommercialV1200Response
 */
export interface AdsControllerCommercialV1200Response {
    /**
     * 
     * @type {number}
     * @memberof AdsControllerCommercialV1200Response
     */
    statusCode: number;
    /**
     * 
     * @type {string}
     * @memberof AdsControllerCommercialV1200Response
     */
    status: string;
    /**
     * 
     * @type {string}
     * @memberof AdsControllerCommercialV1200Response
     */
    message: string;
    /**
     * Error details, or null on success
     * @type {object}
     * @memberof AdsControllerCommercialV1200Response
     */
    error: object | null;
    /**
     * 
     * @type {CommercialServeDto}
     * @memberof AdsControllerCommercialV1200Response
     */
    data?: CommercialServeDto;
}
/**
 * 
 * @export
 * @interface AdsControllerSlotsV1200Response
 */
export interface AdsControllerSlotsV1200Response {
    /**
     * 
     * @type {number}
     * @memberof AdsControllerSlotsV1200Response
     */
    statusCode: number;
    /**
     * 
     * @type {string}
     * @memberof AdsControllerSlotsV1200Response
     */
    status: string;
    /**
     * 
     * @type {string}
     * @memberof AdsControllerSlotsV1200Response
     */
    message: string;
    /**
     * Error details, or null on success
     * @type {object}
     * @memberof AdsControllerSlotsV1200Response
     */
    error: object | null;
    /**
     * 
     * @type {AdSlotsDto}
     * @memberof AdsControllerSlotsV1200Response
     */
    data?: AdSlotsDto;
}
/**
 * 
 * @export
 * @interface AdsControllerTrackV1200Response
 */
export interface AdsControllerTrackV1200Response {
    /**
     * 
     * @type {number}
     * @memberof AdsControllerTrackV1200Response
     */
    statusCode: number;
    /**
     * 
     * @type {string}
     * @memberof AdsControllerTrackV1200Response
     */
    status: string;
    /**
     * 
     * @type {string}
     * @memberof AdsControllerTrackV1200Response
     */
    message: string;
    /**
     * Error details, or null on success
     * @type {object}
     * @memberof AdsControllerTrackV1200Response
     */
    error: object | null;
    /**
     * 
     * @type {TrackAdEventsResultDto}
     * @memberof AdsControllerTrackV1200Response
     */
    data?: TrackAdEventsResultDto;
}
/**
 * 
 * @export
 * @interface AdvertiserDto
 */
export interface AdvertiserDto {
    /**
     * 
     * @type {string}
     * @memberof AdvertiserDto
     */
    id: string;
    /**
     * 
     * @type {string}
     * @memberof AdvertiserDto
     */
    name: string;
    /**
     * 
     * @type {string}
     * @memberof AdvertiserDto
     */
    logoMediaId?: string | null;
    /**
     * 
     * @type {string}
     * @memberof AdvertiserDto
     */
    logoUrl?: string | null;
    /**
     * 
     * @type {string}
     * @memberof AdvertiserDto
     */
    website?: string | null;
    /**
     * 
     * @type {string}
     * @memberof AdvertiserDto
     */
    contactName?: string | null;
    /**
     * 
     * @type {string}
     * @memberof AdvertiserDto
     */
    contactEmail?: string | null;
    /**
     * 
     * @type {string}
     * @memberof AdvertiserDto
     */
    billingEmail?: string | null;
    /**
     * 
     * @type {string}
     * @memberof AdvertiserDto
     */
    currency: string;
    /**
     * 
     * @type {string}
     * @memberof AdvertiserDto
     */
    status: AdvertiserDtoStatusEnum;
    /**
     * 
     * @type {string}
     * @memberof AdvertiserDto
     */
    notes?: string | null;
    /**
     * 
     * @type {number}
     * @memberof AdvertiserDto
     */
    campaigns?: number;
    /**
     * 
     * @type {number}
     * @memberof AdvertiserDto
     */
    activeCampaigns?: number;
    /**
     * 
     * @type {LedgerTotalsDto}
     * @memberof AdvertiserDto
     */
    totals?: LedgerTotalsDto;
    /**
     * 
     * @type {string}
     * @memberof AdvertiserDto
     */
    createdAt: string;
    /**
     * 
     * @type {string}
     * @memberof AdvertiserDto
     */
    updatedAt: string;
}


/**
 * @export
 */
export const AdvertiserDtoStatusEnum = {
    Active: 'active',
    Paused: 'paused',
    Archived: 'archived'
} as const;
export type AdvertiserDtoStatusEnum = typeof AdvertiserDtoStatusEnum[keyof typeof AdvertiserDtoStatusEnum];

/**
 * 
 * @export
 * @interface ApiEnvelopeDto
 */
export interface ApiEnvelopeDto {
    /**
     * 
     * @type {number}
     * @memberof ApiEnvelopeDto
     */
    statusCode: number;
    /**
     * 
     * @type {string}
     * @memberof ApiEnvelopeDto
     */
    status: string;
    /**
     * 
     * @type {string}
     * @memberof ApiEnvelopeDto
     */
    message: string;
    /**
     * Error details, or null on success
     * @type {object}
     * @memberof ApiEnvelopeDto
     */
    error: object | null;
}
/**
 * 
 * @export
 * @interface AppBootstrapDto
 */
export interface AppBootstrapDto {
    /**
     * 
     * @type {ProfileDto}
     * @memberof AppBootstrapDto
     */
    profile: ProfileDto;
    /**
     * 
     * @type {WalletDto}
     * @memberof AppBootstrapDto
     */
    wallet: WalletDto;
    /**
     * 
     * @type {StreakDto}
     * @memberof AppBootstrapDto
     */
    streak: StreakDto;
    /**
     * 
     * @type {SubscriptionSummaryDto}
     * @memberof AppBootstrapDto
     */
    subscription?: SubscriptionSummaryDto | null;
    /**
     * Unread notification badge count
     * @type {number}
     * @memberof AppBootstrapDto
     */
    unreadNotifications: number;
    /**
     * My global leaderboard rank (null if unranked — zero balance)
     * @type {LeaderboardRankDto}
     * @memberof AppBootstrapDto
     */
    leaderboard?: LeaderboardRankDto | null;
    /**
     * Subscription-based access summary
     * @type {AccessDto}
     * @memberof AppBootstrapDto
     */
    access: AccessDto;
}

/**
 * 
 * @export
 */
export const AppEventName = {
    ScreenView: 'screen_view',
    AppOpen: 'app_open',
    AppBackground: 'app_background',
    AppForeground: 'app_foreground',
    SignupStarted: 'signup_started',
    SignupCompleted: 'signup_completed',
    LoginCompleted: 'login_completed',
    Logout: 'logout',
    OnboardingCompleted: 'onboarding_completed',
    NotificationReceived: 'notification_received',
    NotificationOpened: 'notification_opened',
    PushPermissionGranted: 'push_permission_granted',
    PushPermissionDenied: 'push_permission_denied',
    FeedViewed: 'feed_viewed',
    VideoImpression: 'video_impression',
    VideoPlay: 'video_play',
    VideoPause: 'video_pause',
    VideoProgress: 'video_progress',
    VideoComplete: 'video_complete',
    VideoSeek: 'video_seek',
    VideoMuteToggled: 'video_mute_toggled',
    ContentDetailViewed: 'content_detail_viewed',
    ContentLiked: 'content_liked',
    ContentDisliked: 'content_disliked',
    ContentCommented: 'content_commented',
    WatchlistAdded: 'watchlist_added',
    WatchlistRemoved: 'watchlist_removed',
    GameEnter: 'game_enter',
    QuestViewed: 'quest_viewed',
    QuestProgressed: 'quest_progressed',
    QuestClaimed: 'quest_claimed',
    PredictionViewed: 'prediction_viewed',
    PredictionEntered: 'prediction_entered',
    AuctionViewed: 'auction_viewed',
    BidPlaced: 'bid_placed',
    StreakViewed: 'streak_viewed',
    StreakCheckedIn: 'streak_checked_in',
    LeaderboardViewed: 'leaderboard_viewed',
    BadgeViewed: 'badge_viewed',
    PaywallViewed: 'paywall_viewed',
    PlansViewed: 'plans_viewed',
    SubscribeStarted: 'subscribe_started',
    SubscribeCompleted: 'subscribe_completed',
    SubscribeFailed: 'subscribe_failed',
    SubscriptionCancelled: 'subscription_cancelled',
    StoreViewed: 'store_viewed',
    RewardRedeemed: 'reward_redeemed',
    ContentUnlocked: 'content_unlocked',
    WalletViewed: 'wallet_viewed',
    ContentShared: 'content_shared',
    ReferralShared: 'referral_shared',
    ReferralRedeemed: 'referral_redeemed',
    InviteSent: 'invite_sent',
    Search: 'search',
    ProfileEdited: 'profile_edited',
    SettingsChanged: 'settings_changed'
} as const;
export type AppEventName = typeof AppEventName[keyof typeof AppEventName];


/**
 * 
 * @export
 */
export const AppEventType = {
    Screen: 'screen',
    Lifecycle: 'lifecycle',
    Engagement: 'engagement',
    Game: 'game',
    Commerce: 'commerce',
    Social: 'social',
    Other: 'other'
} as const;
export type AppEventType = typeof AppEventType[keyof typeof AppEventType];

/**
 * 
 * @export
 * @interface AppVersionDto
 */
export interface AppVersionDto {
    /**
     * 
     * @type {string}
     * @memberof AppVersionDto
     */
    iosMinVersion?: string;
    /**
     * 
     * @type {string}
     * @memberof AppVersionDto
     */
    androidMinVersion?: string;
    /**
     * Force update below the min version
     * @type {boolean}
     * @memberof AppVersionDto
     */
    forceUpdate?: boolean;
    /**
     * Critical maintenance mode
     * @type {boolean}
     * @memberof AppVersionDto
     */
    criticalMode?: boolean;
}
/**
 * 
 * @export
 * @interface ArchiveContentDto
 */
export interface ArchiveContentDto {
    /**
     * true archives (unpublishes). false restores: back to `published` when the content was live before, else `draft`.
     * @type {boolean}
     * @memberof ArchiveContentDto
     */
    archived?: boolean;
}
/**
 * 
 * @export
 * @interface AssignTicketDto
 */
export interface AssignTicketDto {
    /**
     * Admin to assign to (default: me)
     * @type {string}
     * @memberof AssignTicketDto
     */
    assigneeId?: string;
}
/**
 * 
 * @export
 * @interface AttachContentsDto
 */
export interface AttachContentsDto {
    /**
     * Full set — videos whose active sponsorship joins this campaign
     * @type {Array<string>}
     * @memberof AttachContentsDto
     */
    contentIds: Array<string>;
}
/**
 * 
 * @export
 * @interface AuditEntryDto
 */
export interface AuditEntryDto {
    /**
     * 
     * @type {string}
     * @memberof AuditEntryDto
     */
    id: string;
    /**
     * 
     * @type {string}
     * @memberof AuditEntryDto
     */
    action: string;
    /**
     * 
     * @type {string}
     * @memberof AuditEntryDto
     */
    actorId?: string | null;
    /**
     * 
     * @type {string}
     * @memberof AuditEntryDto
     */
    actorLabel?: string | null;
    /**
     * 
     * @type {string}
     * @memberof AuditEntryDto
     */
    targetType?: string | null;
    /**
     * 
     * @type {string}
     * @memberof AuditEntryDto
     */
    targetId?: string | null;
    /**
     * 
     * @type {object}
     * @memberof AuditEntryDto
     */
    metadata: object;
    /**
     * 
     * @type {string}
     * @memberof AuditEntryDto
     */
    createdAt: string;
}
/**
 * 
 * @export
 * @interface AuthResponseDto
 */
export interface AuthResponseDto {
    /**
     * 
     * @type {string}
     * @memberof AuthResponseDto
     */
    accessToken: string;
    /**
     * 
     * @type {string}
     * @memberof AuthResponseDto
     */
    refreshToken: string;
    /**
     * 
     * @type {UserResponseDto}
     * @memberof AuthResponseDto
     */
    user: UserResponseDto;
    /**
     * 
     * @type {boolean}
     * @memberof AuthResponseDto
     */
    isNewUser: boolean;
    /**
     * true when username is not yet set (show create-account screen)
     * @type {boolean}
     * @memberof AuthResponseDto
     */
    needsProfile: boolean;
}
/**
 * 
 * @export
 * @interface AvgResolutionDto
 */
export interface AvgResolutionDto {
    /**
     * Minutes, tickets closed in the last 7 days
     * @type {number}
     * @memberof AvgResolutionDto
     */
    current?: number | null;
    /**
     * Minutes, the 7 days before
     * @type {number}
     * @memberof AvgResolutionDto
     */
    previous?: number | null;
    /**
     * Negative = faster
     * @type {number}
     * @memberof AvgResolutionDto
     */
    changePct?: number | null;
}
/**
 * 
 * @export
 * @interface BacklogDto
 */
export interface BacklogDto {
    /**
     * 
     * @type {number}
     * @memberof BacklogDto
     */
    total: number;
    /**
     * 
     * @type {string}
     * @memberof BacklogDto
     */
    health: BacklogDtoHealthEnum;
    /**
     * 
     * @type {object}
     * @memberof BacklogDto
     */
    byStatus: object;
    /**
     * 
     * @type {object}
     * @memberof BacklogDto
     */
    bySeverity: object;
    /**
     * 
     * @type {object}
     * @memberof BacklogDto
     */
    byType: object;
}


/**
 * @export
 */
export const BacklogDtoHealthEnum = {
    Healthy: 'healthy',
    Elevated: 'elevated',
    Critical: 'critical'
} as const;
export type BacklogDtoHealthEnum = typeof BacklogDtoHealthEnum[keyof typeof BacklogDtoHealthEnum];

/**
 * 
 * @export
 * @interface BadgeCategoryCountDto
 */
export interface BadgeCategoryCountDto {
    /**
     * 
     * @type {string}
     * @memberof BadgeCategoryCountDto
     */
    gameType: BadgeCategoryCountDtoGameTypeEnum | null;
    /**
     * 
     * @type {number}
     * @memberof BadgeCategoryCountDto
     */
    total: number;
    /**
     * 
     * @type {number}
     * @memberof BadgeCategoryCountDto
     */
    earned: number;
}


/**
 * @export
 */
export const BadgeCategoryCountDtoGameTypeEnum = {
    DailyStreak: 'daily_streak',
    Quest: 'quest',
    Prediction: 'prediction',
    Bidding: 'bidding',
    SharedContent: 'shared_content'
} as const;
export type BadgeCategoryCountDtoGameTypeEnum = typeof BadgeCategoryCountDtoGameTypeEnum[keyof typeof BadgeCategoryCountDtoGameTypeEnum];

/**
 * 
 * @export
 * @interface BadgeCollectionDto
 */
export interface BadgeCollectionDto {
    /**
     * Badges matching the filter, earned first then closest-to-earning
     * @type {Array<BadgeCollectionItemDto>}
     * @memberof BadgeCollectionDto
     */
    badges: Array<BadgeCollectionItemDto>;
    /**
     * 
     * @type {number}
     * @memberof BadgeCollectionDto
     */
    total: number;
    /**
     * 
     * @type {number}
     * @memberof BadgeCollectionDto
     */
    earned: number;
    /**
     * 
     * @type {number}
     * @memberof BadgeCollectionDto
     */
    locked: number;
    /**
     * Per-game totals. Only populated on the unfiltered (My Earns) call.
     * @type {Array<BadgeCategoryCountDto>}
     * @memberof BadgeCollectionDto
     */
    categories: Array<BadgeCategoryCountDto>;
}
/**
 * 
 * @export
 * @interface BadgeCollectionItemDto
 */
export interface BadgeCollectionItemDto {
    /**
     * 
     * @type {string}
     * @memberof BadgeCollectionItemDto
     */
    slug: string;
    /**
     * 
     * @type {string}
     * @memberof BadgeCollectionItemDto
     */
    name: string;
    /**
     * 
     * @type {string}
     * @memberof BadgeCollectionItemDto
     */
    description?: string | null;
    /**
     * 
     * @type {string}
     * @memberof BadgeCollectionItemDto
     */
    gameType?: BadgeCollectionItemDtoGameTypeEnum | null;
    /**
     * 
     * @type {string}
     * @memberof BadgeCollectionItemDto
     */
    family: BadgeCollectionItemDtoFamilyEnum;
    /**
     * 
     * @type {string}
     * @memberof BadgeCollectionItemDto
     */
    status: BadgeCollectionItemDtoStatusEnum;
    /**
     * 
     * @type {string}
     * @memberof BadgeCollectionItemDto
     */
    earnedAt?: string | null;
    /**
     * Points paid when the badge is earned
     * @type {number}
     * @memberof BadgeCollectionItemDto
     */
    rewardPoints: number;
    /**
     * 
     * @type {number}
     * @memberof BadgeCollectionItemDto
     */
    earnedCount: number;
    /**
     * Icon to render once earned
     * @type {string}
     * @memberof BadgeCollectionItemDto
     */
    activeIconUrl?: string | null;
    /**
     * Icon to render while locked
     * @type {string}
     * @memberof BadgeCollectionItemDto
     */
    inactiveIconUrl?: string | null;
    /**
     * How far the user is toward a locked badge. Null once earned, and for badges awarded directly (no metric to measure).
     * @type {BadgeProgressDto}
     * @memberof BadgeCollectionItemDto
     */
    progress?: BadgeProgressDto | null;
}


/**
 * @export
 */
export const BadgeCollectionItemDtoGameTypeEnum = {
    DailyStreak: 'daily_streak',
    Quest: 'quest',
    Prediction: 'prediction',
    Bidding: 'bidding',
    SharedContent: 'shared_content'
} as const;
export type BadgeCollectionItemDtoGameTypeEnum = typeof BadgeCollectionItemDtoGameTypeEnum[keyof typeof BadgeCollectionItemDtoGameTypeEnum];

/**
 * @export
 */
export const BadgeCollectionItemDtoFamilyEnum = {
    Tier: 'tier',
    Achievement: 'achievement'
} as const;
export type BadgeCollectionItemDtoFamilyEnum = typeof BadgeCollectionItemDtoFamilyEnum[keyof typeof BadgeCollectionItemDtoFamilyEnum];

/**
 * @export
 */
export const BadgeCollectionItemDtoStatusEnum = {
    Earned: 'earned',
    Locked: 'locked'
} as const;
export type BadgeCollectionItemDtoStatusEnum = typeof BadgeCollectionItemDtoStatusEnum[keyof typeof BadgeCollectionItemDtoStatusEnum];

/**
 * 
 * @export
 * @interface BadgeDto
 */
export interface BadgeDto {
    /**
     * 
     * @type {string}
     * @memberof BadgeDto
     */
    id: string;
    /**
     * 
     * @type {string}
     * @memberof BadgeDto
     */
    name: string;
    /**
     * 
     * @type {string}
     * @memberof BadgeDto
     */
    slug: string;
    /**
     * 
     * @type {string}
     * @memberof BadgeDto
     */
    description?: string | null;
    /**
     * 
     * @type {string}
     * @memberof BadgeDto
     */
    family: BadgeDtoFamilyEnum;
    /**
     * 
     * @type {string}
     * @memberof BadgeDto
     */
    gameType?: string | null;
    /**
     * 
     * @type {number}
     * @memberof BadgeDto
     */
    sortOrder: number;
    /**
     * 
     * @type {string}
     * @memberof BadgeDto
     */
    awardedBy: BadgeDtoAwardedByEnum;
    /**
     * 
     * @type {string}
     * @memberof BadgeDto
     */
    triggerKey?: string | null;
    /**
     * 
     * @type {string}
     * @memberof BadgeDto
     */
    operator?: string | null;
    /**
     * 
     * @type {number}
     * @memberof BadgeDto
     */
    threshold?: number | null;
    /**
     * 
     * @type {number}
     * @memberof BadgeDto
     */
    rewardPoints: number;
    /**
     * 
     * @type {boolean}
     * @memberof BadgeDto
     */
    isActive: boolean;
    /**
     * 
     * @type {number}
     * @memberof BadgeDto
     */
    earnedCount: number;
    /**
     * 
     * @type {string}
     * @memberof BadgeDto
     */
    activeIconMediaId?: string | null;
    /**
     * 
     * @type {string}
     * @memberof BadgeDto
     */
    inactiveIconMediaId?: string | null;
    /**
     * CDN URL of the earned-state icon (null until the asset is ready)
     * @type {string}
     * @memberof BadgeDto
     */
    activeIconUrl?: string | null;
    /**
     * CDN URL of the locked-state icon
     * @type {string}
     * @memberof BadgeDto
     */
    inactiveIconUrl?: string | null;
}


/**
 * @export
 */
export const BadgeDtoFamilyEnum = {
    Tier: 'tier',
    Achievement: 'achievement'
} as const;
export type BadgeDtoFamilyEnum = typeof BadgeDtoFamilyEnum[keyof typeof BadgeDtoFamilyEnum];

/**
 * @export
 */
export const BadgeDtoAwardedByEnum = {
    Trigger: 'trigger',
    Direct: 'direct',
    Both: 'both'
} as const;
export type BadgeDtoAwardedByEnum = typeof BadgeDtoAwardedByEnum[keyof typeof BadgeDtoAwardedByEnum];


/**
 * 
 * @export
 */
export const BadgeGameType = {
    DailyStreak: 'daily_streak',
    Quest: 'quest',
    Prediction: 'prediction',
    Bidding: 'bidding',
    SharedContent: 'shared_content'
} as const;
export type BadgeGameType = typeof BadgeGameType[keyof typeof BadgeGameType];

/**
 * 
 * @export
 * @interface BadgeProgressDto
 */
export interface BadgeProgressDto {
    /**
     * The user's current value for the badge's trigger metric
     * @type {number}
     * @memberof BadgeProgressDto
     */
    current: number;
    /**
     * Value the metric must reach
     * @type {number}
     * @memberof BadgeProgressDto
     */
    required: number;
    /**
     * 0-100, clamped
     * @type {number}
     * @memberof BadgeProgressDto
     */
    percent: number;
}
/**
 * 
 * @export
 * @interface BadgeStandingDto
 */
export interface BadgeStandingDto {
    /**
     * 
     * @type {BadgeTierStandingDto}
     * @memberof BadgeStandingDto
     */
    tier: BadgeTierStandingDto;
    /**
     * 
     * @type {Array<BadgeStandingItemDto>}
     * @memberof BadgeStandingDto
     */
    badges: Array<BadgeStandingItemDto>;
}
/**
 * 
 * @export
 * @interface BadgeStandingItemDto
 */
export interface BadgeStandingItemDto {
    /**
     * 
     * @type {string}
     * @memberof BadgeStandingItemDto
     */
    slug: string;
    /**
     * 
     * @type {string}
     * @memberof BadgeStandingItemDto
     */
    name: string;
    /**
     * 
     * @type {string}
     * @memberof BadgeStandingItemDto
     */
    description?: string | null;
    /**
     * 
     * @type {string}
     * @memberof BadgeStandingItemDto
     */
    family: BadgeStandingItemDtoFamilyEnum;
    /**
     * 
     * @type {string}
     * @memberof BadgeStandingItemDto
     */
    status: BadgeStandingItemDtoStatusEnum;
    /**
     * 
     * @type {string}
     * @memberof BadgeStandingItemDto
     */
    earnedAt?: string | null;
    /**
     * 
     * @type {string}
     * @memberof BadgeStandingItemDto
     */
    activeIconUrl?: string | null;
    /**
     * 
     * @type {string}
     * @memberof BadgeStandingItemDto
     */
    inactiveIconUrl?: string | null;
}


/**
 * @export
 */
export const BadgeStandingItemDtoFamilyEnum = {
    Tier: 'tier',
    Achievement: 'achievement'
} as const;
export type BadgeStandingItemDtoFamilyEnum = typeof BadgeStandingItemDtoFamilyEnum[keyof typeof BadgeStandingItemDtoFamilyEnum];

/**
 * @export
 */
export const BadgeStandingItemDtoStatusEnum = {
    Earned: 'earned',
    Current: 'current',
    Locked: 'locked'
} as const;
export type BadgeStandingItemDtoStatusEnum = typeof BadgeStandingItemDtoStatusEnum[keyof typeof BadgeStandingItemDtoStatusEnum];

/**
 * 
 * @export
 * @interface BadgeSummaryDto
 */
export interface BadgeSummaryDto {
    /**
     * Badges that are not deleted
     * @type {number}
     * @memberof BadgeSummaryDto
     */
    total: number;
    /**
     * Of those, currently active
     * @type {number}
     * @memberof BadgeSummaryDto
     */
    active: number;
    /**
     * Distinct players holding at least one live badge
     * @type {number}
     * @memberof BadgeSummaryDto
     */
    playersWithBadge: number;
    /**
     * playersWithBadge as a share of all customers, 0-100 (one decimal)
     * @type {number}
     * @memberof BadgeSummaryDto
     */
    playersWithBadgePct: number;
    /**
     * Active badges nobody has earned yet
     * @type {number}
     * @memberof BadgeSummaryDto
     */
    neverEarned: number;
}
/**
 * 
 * @export
 * @interface BadgeTierStandingDto
 */
export interface BadgeTierStandingDto {
    /**
     * 
     * @type {TierRefDto}
     * @memberof BadgeTierStandingDto
     */
    current?: TierRefDto | null;
    /**
     * 
     * @type {TierRefDto}
     * @memberof BadgeTierStandingDto
     */
    next?: TierRefDto | null;
    /**
     * 
     * @type {number}
     * @memberof BadgeTierStandingDto
     */
    lifetimePoints: number;
}
/**
 * 
 * @export
 * @interface BadgeTriggerDto
 */
export interface BadgeTriggerDto {
    /**
     * 
     * @type {string}
     * @memberof BadgeTriggerDto
     */
    key: string;
    /**
     * 
     * @type {string}
     * @memberof BadgeTriggerDto
     */
    label: string;
    /**
     * 
     * @type {string}
     * @memberof BadgeTriggerDto
     */
    unit?: string | null;
    /**
     * 
     * @type {string}
     * @memberof BadgeTriggerDto
     */
    description?: string | null;
}
/**
 * 
 * @export
 * @interface BadgesControllerCatalogV1200Response
 */
export interface BadgesControllerCatalogV1200Response {
    /**
     * 
     * @type {number}
     * @memberof BadgesControllerCatalogV1200Response
     */
    statusCode: number;
    /**
     * 
     * @type {string}
     * @memberof BadgesControllerCatalogV1200Response
     */
    status: string;
    /**
     * 
     * @type {string}
     * @memberof BadgesControllerCatalogV1200Response
     */
    message: string;
    /**
     * Error details, or null on success
     * @type {object}
     * @memberof BadgesControllerCatalogV1200Response
     */
    error: object | null;
    /**
     * 
     * @type {Array<CustomerBadgeDto>}
     * @memberof BadgesControllerCatalogV1200Response
     */
    data?: Array<CustomerBadgeDto>;
}
/**
 * 
 * @export
 * @interface BadgesControllerCollectionV1200Response
 */
export interface BadgesControllerCollectionV1200Response {
    /**
     * 
     * @type {number}
     * @memberof BadgesControllerCollectionV1200Response
     */
    statusCode: number;
    /**
     * 
     * @type {string}
     * @memberof BadgesControllerCollectionV1200Response
     */
    status: string;
    /**
     * 
     * @type {string}
     * @memberof BadgesControllerCollectionV1200Response
     */
    message: string;
    /**
     * Error details, or null on success
     * @type {object}
     * @memberof BadgesControllerCollectionV1200Response
     */
    error: object | null;
    /**
     * 
     * @type {BadgeCollectionDto}
     * @memberof BadgesControllerCollectionV1200Response
     */
    data?: BadgeCollectionDto;
}
/**
 * 
 * @export
 * @interface BadgesControllerMineV1200Response
 */
export interface BadgesControllerMineV1200Response {
    /**
     * 
     * @type {number}
     * @memberof BadgesControllerMineV1200Response
     */
    statusCode: number;
    /**
     * 
     * @type {string}
     * @memberof BadgesControllerMineV1200Response
     */
    status: string;
    /**
     * 
     * @type {string}
     * @memberof BadgesControllerMineV1200Response
     */
    message: string;
    /**
     * Error details, or null on success
     * @type {object}
     * @memberof BadgesControllerMineV1200Response
     */
    error: object | null;
    /**
     * 
     * @type {Array<EarnedBadgeDto>}
     * @memberof BadgesControllerMineV1200Response
     */
    data?: Array<EarnedBadgeDto>;
}
/**
 * 
 * @export
 * @interface BadgesControllerStandingV1200Response
 */
export interface BadgesControllerStandingV1200Response {
    /**
     * 
     * @type {number}
     * @memberof BadgesControllerStandingV1200Response
     */
    statusCode: number;
    /**
     * 
     * @type {string}
     * @memberof BadgesControllerStandingV1200Response
     */
    status: string;
    /**
     * 
     * @type {string}
     * @memberof BadgesControllerStandingV1200Response
     */
    message: string;
    /**
     * Error details, or null on success
     * @type {object}
     * @memberof BadgesControllerStandingV1200Response
     */
    error: object | null;
    /**
     * 
     * @type {BadgeStandingDto}
     * @memberof BadgesControllerStandingV1200Response
     */
    data?: BadgeStandingDto;
}
/**
 * 
 * @export
 * @interface BanUserDto
 */
export interface BanUserDto {
    /**
     * 
     * @type {string}
     * @memberof BanUserDto
     */
    reason: string;
}
/**
 * 
 * @export
 * @interface BatchReactionsDto
 */
export interface BatchReactionsDto {
    /**
     * contentId → the caller's reaction (null when none). Every requested id is present.
     * @type {{ [key: string]: string | null; }}
     * @memberof BatchReactionsDto
     */
    reactions: { [key: string]: string | null; };
}


/**
 * @export
 */
export const BatchReactionsDtoReactionsEnum = {
    Like: 'like',
    Dislike: 'dislike'
} as const;
export type BatchReactionsDtoReactionsEnum = typeof BatchReactionsDtoReactionsEnum[keyof typeof BatchReactionsDtoReactionsEnum];

/**
 * 
 * @export
 * @interface BoostContentDto
 */
export interface BoostContentDto {
    /**
     * true to boost, false to clear every boost field
     * @type {boolean}
     * @memberof BoostContentDto
     */
    boosted?: boolean;
    /**
     * Higher = ranked first in the feed
     * @type {number}
     * @memberof BoostContentDto
     */
    priority?: number;
    /**
     * Boost starts at (ISO); default now
     * @type {string}
     * @memberof BoostContentDto
     */
    startsAt?: string;
    /**
     * Auto-expire boost at (ISO); must be after startsAt
     * @type {string}
     * @memberof BoostContentDto
     */
    until?: string;
    /**
     * Empty = everywhere in the feed
     * @type {Array<string>}
     * @memberof BoostContentDto
     */
    channels?: Array<BoostContentDtoChannelsEnum>;
}


/**
 * @export
 */
export const BoostContentDtoChannelsEnum = {
    Homepage: 'homepage',
    Notifications: 'notifications',
    Regional: 'regional',
    Subscribers: 'subscribers'
} as const;
export type BoostContentDtoChannelsEnum = typeof BoostContentDtoChannelsEnum[keyof typeof BoostContentDtoChannelsEnum];

/**
 * 
 * @export
 * @interface BucketPctDto
 */
export interface BucketPctDto {
    /**
     * 
     * @type {string}
     * @memberof BucketPctDto
     */
    bucket: string;
    /**
     * 
     * @type {number}
     * @memberof BucketPctDto
     */
    pct: number;
}
/**
 * 
 * @export
 * @interface BulkItemResultDto
 */
export interface BulkItemResultDto {
    /**
     * 
     * @type {string}
     * @memberof BulkItemResultDto
     */
    id: string;
    /**
     * 
     * @type {boolean}
     * @memberof BulkItemResultDto
     */
    ok: boolean;
    /**
     * 
     * @type {string}
     * @memberof BulkItemResultDto
     */
    status?: string;
    /**
     * 
     * @type {string}
     * @memberof BulkItemResultDto
     */
    resolution?: string;
    /**
     * 
     * @type {string}
     * @memberof BulkItemResultDto
     */
    error?: string;
}
/**
 * 
 * @export
 * @interface BulkResultDto
 */
export interface BulkResultDto {
    /**
     * 
     * @type {number}
     * @memberof BulkResultDto
     */
    processed: number;
    /**
     * 
     * @type {number}
     * @memberof BulkResultDto
     */
    succeeded: number;
    /**
     * 
     * @type {number}
     * @memberof BulkResultDto
     */
    failed: number;
    /**
     * 
     * @type {Array<BulkItemResultDto>}
     * @memberof BulkResultDto
     */
    results: Array<BulkItemResultDto>;
}
/**
 * 
 * @export
 * @interface BulkTicketsDto
 */
export interface BulkTicketsDto {
    /**
     * 
     * @type {Array<string>}
     * @memberof BulkTicketsDto
     */
    ticketIds: Array<string>;
    /**
     * Ignore All → dismiss; Delete Content → resolve+content_removed; Ban Users → resolve+user_banned
     * @type {string}
     * @memberof BulkTicketsDto
     */
    action: BulkTicketsDtoActionEnum;
    /**
     * Required for action 'resolve'
     * @type {string}
     * @memberof BulkTicketsDto
     */
    resolution?: BulkTicketsDtoResolutionEnum;
    /**
     * Resolution note (resolve/dismiss) or internal note (escalate)
     * @type {string}
     * @memberof BulkTicketsDto
     */
    note?: string;
    /**
     * 
     * @type {string}
     * @memberof BulkTicketsDto
     */
    suspendDuration?: BulkTicketsDtoSuspendDurationEnum;
    /**
     * 
     * @type {string}
     * @memberof BulkTicketsDto
     */
    suspendUntil?: string;
    /**
     * action 'assign' — default: me
     * @type {string}
     * @memberof BulkTicketsDto
     */
    assigneeId?: string;
}


/**
 * @export
 */
export const BulkTicketsDtoActionEnum = {
    Dismiss: 'dismiss',
    Resolve: 'resolve',
    Assign: 'assign',
    Escalate: 'escalate'
} as const;
export type BulkTicketsDtoActionEnum = typeof BulkTicketsDtoActionEnum[keyof typeof BulkTicketsDtoActionEnum];

/**
 * @export
 */
export const BulkTicketsDtoResolutionEnum = {
    ContentRemoved: 'content_removed',
    UserWarned: 'user_warned',
    UserSuspended: 'user_suspended',
    UserBanned: 'user_banned',
    NoAction: 'no_action'
} as const;
export type BulkTicketsDtoResolutionEnum = typeof BulkTicketsDtoResolutionEnum[keyof typeof BulkTicketsDtoResolutionEnum];

/**
 * @export
 */
export const BulkTicketsDtoSuspendDurationEnum = {
    _24h: '24h',
    _7d: '7d',
    _30d: '30d'
} as const;
export type BulkTicketsDtoSuspendDurationEnum = typeof BulkTicketsDtoSuspendDurationEnum[keyof typeof BulkTicketsDtoSuspendDurationEnum];

/**
 * 
 * @export
 * @interface CampaignActionResultDto
 */
export interface CampaignActionResultDto {
    /**
     * 
     * @type {string}
     * @memberof CampaignActionResultDto
     */
    id: string;
    /**
     * 
     * @type {string}
     * @memberof CampaignActionResultDto
     */
    status: CampaignActionResultDtoStatusEnum;
}


/**
 * @export
 */
export const CampaignActionResultDtoStatusEnum = {
    Sending: 'sending',
    Canceled: 'canceled'
} as const;
export type CampaignActionResultDtoStatusEnum = typeof CampaignActionResultDtoStatusEnum[keyof typeof CampaignActionResultDtoStatusEnum];

/**
 * 
 * @export
 * @interface CampaignDto
 */
export interface CampaignDto {
    /**
     * 
     * @type {string}
     * @memberof CampaignDto
     */
    id: string;
    /**
     * 
     * @type {string}
     * @memberof CampaignDto
     */
    title: string;
    /**
     * 
     * @type {string}
     * @memberof CampaignDto
     */
    message: string;
    /**
     * In-app deep link
     * @type {string}
     * @memberof CampaignDto
     */
    deepLink?: string | null;
    /**
     * 
     * @type {string}
     * @memberof CampaignDto
     */
    targetType: CampaignDtoTargetTypeEnum;
    /**
     * Audience filter (segment/selected)
     * @type {{ [key: string]: any; }}
     * @memberof CampaignDto
     */
    targetFilter?: { [key: string]: any; } | null;
    /**
     * 
     * @type {string}
     * @memberof CampaignDto
     */
    status: CampaignDtoStatusEnum;
    /**
     * When the campaign is scheduled to send (ISO)
     * @type {string}
     * @memberof CampaignDto
     */
    scheduledAt?: string | null;
    /**
     * When the campaign was sent (ISO)
     * @type {string}
     * @memberof CampaignDto
     */
    sentAt?: string | null;
    /**
     * Resolved audience size
     * @type {number}
     * @memberof CampaignDto
     */
    recipientCount: number;
    /**
     * 
     * @type {string}
     * @memberof CampaignDto
     */
    createdAt: string;
}


/**
 * @export
 */
export const CampaignDtoTargetTypeEnum = {
    All: 'all',
    Segment: 'segment',
    Selected: 'selected'
} as const;
export type CampaignDtoTargetTypeEnum = typeof CampaignDtoTargetTypeEnum[keyof typeof CampaignDtoTargetTypeEnum];

/**
 * @export
 */
export const CampaignDtoStatusEnum = {
    Draft: 'draft',
    Scheduled: 'scheduled',
    Sending: 'sending',
    Sent: 'sent',
    Failed: 'failed',
    Canceled: 'canceled'
} as const;
export type CampaignDtoStatusEnum = typeof CampaignDtoStatusEnum[keyof typeof CampaignDtoStatusEnum];

/**
 * 
 * @export
 * @interface CampaignEndDto
 */
export interface CampaignEndDto {
    /**
     * 
     * @type {string}
     * @memberof CampaignEndDto
     */
    reason?: string;
}
/**
 * 
 * @export
 * @interface CancelSubscriptionDto
 */
export interface CancelSubscriptionDto {
    /**
     * 
     * @type {string}
     * @memberof CancelSubscriptionDto
     */
    reason?: string;
}
/**
 * 
 * @export
 * @interface CastMemberDto
 */
export interface CastMemberDto {
    /**
     * 
     * @type {string}
     * @memberof CastMemberDto
     */
    personId: string;
    /**
     * 
     * @type {string}
     * @memberof CastMemberDto
     */
    name: string;
    /**
     * 
     * @type {string}
     * @memberof CastMemberDto
     */
    slug: string;
    /**
     * 
     * @type {string}
     * @memberof CastMemberDto
     */
    photoMediaId?: string | null;
    /**
     * 
     * @type {string}
     * @memberof CastMemberDto
     */
    role: CastMemberDtoRoleEnum;
    /**
     * 
     * @type {string}
     * @memberof CastMemberDto
     */
    characterName?: string | null;
    /**
     * 
     * @type {number}
     * @memberof CastMemberDto
     */
    billingOrder: number;
}


/**
 * @export
 */
export const CastMemberDtoRoleEnum = {
    Actor: 'actor',
    Director: 'director',
    Writer: 'writer',
    Producer: 'producer',
    Other: 'other'
} as const;
export type CastMemberDtoRoleEnum = typeof CastMemberDtoRoleEnum[keyof typeof CastMemberDtoRoleEnum];

/**
 * 
 * @export
 * @interface CastMemberInputDto
 */
export interface CastMemberInputDto {
    /**
     * people.id
     * @type {string}
     * @memberof CastMemberInputDto
     */
    personId: string;
    /**
     * 
     * @type {string}
     * @memberof CastMemberInputDto
     */
    role?: CastMemberInputDtoRoleEnum;
    /**
     * 
     * @type {string}
     * @memberof CastMemberInputDto
     */
    characterName?: string;
    /**
     * Lower sorts first; defaults to array order
     * @type {number}
     * @memberof CastMemberInputDto
     */
    billingOrder?: number;
}


/**
 * @export
 */
export const CastMemberInputDtoRoleEnum = {
    Actor: 'actor',
    Director: 'director',
    Writer: 'writer',
    Producer: 'producer',
    Other: 'other'
} as const;
export type CastMemberInputDtoRoleEnum = typeof CastMemberInputDtoRoleEnum[keyof typeof CastMemberInputDtoRoleEnum];

/**
 * 
 * @export
 * @interface ChangePasswordDto
 */
export interface ChangePasswordDto {
    /**
     * 
     * @type {string}
     * @memberof ChangePasswordDto
     */
    currentPassword: string;
    /**
     * 
     * @type {string}
     * @memberof ChangePasswordDto
     */
    newPassword: string;
}
/**
 * 
 * @export
 * @interface ChannelEconomicsDto
 */
export interface ChannelEconomicsDto {
    /**
     * 
     * @type {string}
     * @memberof ChannelEconomicsDto
     */
    channel: string;
    /**
     * 
     * @type {string}
     * @memberof ChannelEconomicsDto
     */
    key: string;
    /**
     * Lifetime paid revenue per user ($)
     * @type {number}
     * @memberof ChannelEconomicsDto
     */
    ltv: number;
    /**
     * Spend ÷ new users ($)
     * @type {number}
     * @memberof ChannelEconomicsDto
     */
    cac: number;
    /**
     * 
     * @type {number}
     * @memberof ChannelEconomicsDto
     */
    spend: number;
    /**
     * 
     * @type {number}
     * @memberof ChannelEconomicsDto
     */
    newUsers: number;
}
/**
 * 
 * @export
 * @interface CommentActionResultDto
 */
export interface CommentActionResultDto {
    /**
     * 
     * @type {string}
     * @memberof CommentActionResultDto
     */
    id: string;
    /**
     * Resulting status
     * @type {string}
     * @memberof CommentActionResultDto
     */
    status: string;
}
/**
 * 
 * @export
 * @interface CommentAuthorDto
 */
export interface CommentAuthorDto {
    /**
     * 
     * @type {string}
     * @memberof CommentAuthorDto
     */
    id: string;
    /**
     * 
     * @type {string}
     * @memberof CommentAuthorDto
     */
    username?: string | null;
    /**
     * 
     * @type {string}
     * @memberof CommentAuthorDto
     */
    firstName?: string | null;
    /**
     * 
     * @type {string}
     * @memberof CommentAuthorDto
     */
    avatarUrl?: string | null;
}
/**
 * 
 * @export
 * @interface CommentControllerCreateV1201Response
 */
export interface CommentControllerCreateV1201Response {
    /**
     * 
     * @type {number}
     * @memberof CommentControllerCreateV1201Response
     */
    statusCode: number;
    /**
     * 
     * @type {string}
     * @memberof CommentControllerCreateV1201Response
     */
    status: string;
    /**
     * 
     * @type {string}
     * @memberof CommentControllerCreateV1201Response
     */
    message: string;
    /**
     * Error details, or null on success
     * @type {object}
     * @memberof CommentControllerCreateV1201Response
     */
    error: object | null;
    /**
     * 
     * @type {CommentDto}
     * @memberof CommentControllerCreateV1201Response
     */
    data?: CommentDto;
}
/**
 * 
 * @export
 * @interface CommentControllerListV1200Response
 */
export interface CommentControllerListV1200Response {
    /**
     * 
     * @type {number}
     * @memberof CommentControllerListV1200Response
     */
    statusCode: number;
    /**
     * 
     * @type {string}
     * @memberof CommentControllerListV1200Response
     */
    status: string;
    /**
     * 
     * @type {string}
     * @memberof CommentControllerListV1200Response
     */
    message: string;
    /**
     * Error details, or null on success
     * @type {object}
     * @memberof CommentControllerListV1200Response
     */
    error: object | null;
    /**
     * 
     * @type {CommentControllerListV1200ResponseAllOfData}
     * @memberof CommentControllerListV1200Response
     */
    data?: CommentControllerListV1200ResponseAllOfData;
}
/**
 * 
 * @export
 * @interface CommentControllerListV1200ResponseAllOfData
 */
export interface CommentControllerListV1200ResponseAllOfData {
    /**
     * 
     * @type {Array<CommentDto>}
     * @memberof CommentControllerListV1200ResponseAllOfData
     */
    items?: Array<CommentDto>;
    /**
     * 
     * @type {PaginationDetailsDto}
     * @memberof CommentControllerListV1200ResponseAllOfData
     */
    pagination?: PaginationDetailsDto;
}
/**
 * 
 * @export
 * @interface CommentDto
 */
export interface CommentDto {
    /**
     * 
     * @type {string}
     * @memberof CommentDto
     */
    id: string;
    /**
     * 
     * @type {string}
     * @memberof CommentDto
     */
    contentId: string;
    /**
     * 
     * @type {string}
     * @memberof CommentDto
     */
    parentCommentId?: string | null;
    /**
     * 
     * @type {string}
     * @memberof CommentDto
     */
    body: string;
    /**
     * 
     * @type {number}
     * @memberof CommentDto
     */
    likeCount: number;
    /**
     * 
     * @type {number}
     * @memberof CommentDto
     */
    dislikeCount: number;
    /**
     * 
     * @type {number}
     * @memberof CommentDto
     */
    replyCount: number;
    /**
     * 
     * @type {string}
     * @memberof CommentDto
     */
    myReaction?: CommentDtoMyReactionEnum | null;
    /**
     * 
     * @type {CommentAuthorDto}
     * @memberof CommentDto
     */
    author: CommentAuthorDto;
    /**
     * 
     * @type {string}
     * @memberof CommentDto
     */
    createdAt: string;
}


/**
 * @export
 */
export const CommentDtoMyReactionEnum = {
    Like: 'like',
    Dislike: 'dislike'
} as const;
export type CommentDtoMyReactionEnum = typeof CommentDtoMyReactionEnum[keyof typeof CommentDtoMyReactionEnum];

/**
 * 
 * @export
 * @interface CommentReportDto
 */
export interface CommentReportDto {
    /**
     * 
     * @type {string}
     * @memberof CommentReportDto
     */
    id: string;
    /**
     * 
     * @type {string}
     * @memberof CommentReportDto
     */
    commentId: string;
    /**
     * 
     * @type {string}
     * @memberof CommentReportDto
     */
    commentBody: string;
    /**
     * 
     * @type {string}
     * @memberof CommentReportDto
     */
    reason: string;
    /**
     * 
     * @type {string}
     * @memberof CommentReportDto
     */
    description?: string | null;
    /**
     * 
     * @type {string}
     * @memberof CommentReportDto
     */
    status: string;
    /**
     * 
     * @type {string}
     * @memberof CommentReportDto
     */
    reportedBy: string;
    /**
     * 
     * @type {string}
     * @memberof CommentReportDto
     */
    reporterUsername?: string | null;
    /**
     * 
     * @type {string}
     * @memberof CommentReportDto
     */
    createdAt: string;
}
/**
 * 
 * @export
 * @interface CommentThreadControllerReportV1200Response
 */
export interface CommentThreadControllerReportV1200Response {
    /**
     * 
     * @type {number}
     * @memberof CommentThreadControllerReportV1200Response
     */
    statusCode: number;
    /**
     * 
     * @type {string}
     * @memberof CommentThreadControllerReportV1200Response
     */
    status: string;
    /**
     * 
     * @type {string}
     * @memberof CommentThreadControllerReportV1200Response
     */
    message: string;
    /**
     * Error details, or null on success
     * @type {object}
     * @memberof CommentThreadControllerReportV1200Response
     */
    error: object | null;
    /**
     * 
     * @type {ReportResultDto}
     * @memberof CommentThreadControllerReportV1200Response
     */
    data?: ReportResultDto;
}
/**
 * 
 * @export
 * @interface CommercialAdvertiserDto
 */
export interface CommercialAdvertiserDto {
    /**
     * 
     * @type {string}
     * @memberof CommercialAdvertiserDto
     */
    name: string;
    /**
     * 
     * @type {string}
     * @memberof CommercialAdvertiserDto
     */
    logoUrl?: string | null;
}
/**
 * 
 * @export
 * @interface CommercialServeDto
 */
export interface CommercialServeDto {
    /**
     * 
     * @type {string}
     * @memberof CommercialServeDto
     */
    campaignId: string;
    /**
     * true → client should skip this slot (see skipReason)
     * @type {boolean}
     * @memberof CommercialServeDto
     */
    skip: boolean;
    /**
     * 
     * @type {string}
     * @memberof CommercialServeDto
     */
    skipReason?: CommercialServeDtoSkipReasonEnum | null;
    /**
     * 
     * @type {CommercialAdvertiserDto}
     * @memberof CommercialServeDto
     */
    advertiser?: CommercialAdvertiserDto | null;
    /**
     * 
     * @type {PlaybackDto}
     * @memberof CommercialServeDto
     */
    creative?: PlaybackDto | null;
    /**
     * 
     * @type {string}
     * @memberof CommercialServeDto
     */
    clickUrl?: string | null;
    /**
     * 
     * @type {string}
     * @memberof CommercialServeDto
     */
    ctaLabel?: string | null;
    /**
     * 
     * @type {number}
     * @memberof CommercialServeDto
     */
    durationSeconds?: number | null;
    /**
     * 
     * @type {number}
     * @memberof CommercialServeDto
     */
    skippableAfterSeconds?: number | null;
    /**
     * When this campaign stops being live (ISO). NOT the same as `expiresInSeconds`, which is only the signed-URL lifetime. Past this instant the ad must not be rendered, even from cache. null = no end date configured (runs until paused or out of budget).
     * @type {string}
     * @memberof CommercialServeDto
     */
    campaignEndsAt?: string | null;
}


/**
 * @export
 */
export const CommercialServeDtoSkipReasonEnum = {
    AdFree: 'ad_free',
    FrequencyCap: 'frequency_cap',
    NotLive: 'not_live'
} as const;
export type CommercialServeDtoSkipReasonEnum = typeof CommercialServeDtoSkipReasonEnum[keyof typeof CommercialServeDtoSkipReasonEnum];

/**
 * 
 * @export
 * @interface CommunityDataDto
 */
export interface CommunityDataDto {
    /**
     * 
     * @type {CommunityInAppDto}
     * @memberof CommunityDataDto
     */
    inApp: CommunityInAppDto;
    /**
     * 
     * @type {CommunityExternalDto}
     * @memberof CommunityDataDto
     */
    external: CommunityExternalDto;
}
/**
 * 
 * @export
 * @interface CommunityExternalDto
 */
export interface CommunityExternalDto {
    /**
     * 
     * @type {number}
     * @memberof CommunityExternalDto
     */
    mentionsPerWeek: number;
    /**
     * % positive, neutral, negative
     * @type {Array<number>}
     * @memberof CommunityExternalDto
     */
    sentiment: Array<number>;
    /**
     * 
     * @type {number}
     * @memberof CommunityExternalDto
     */
    viralMoments: number;
    /**
     * 
     * @type {number}
     * @memberof CommunityExternalDto
     */
    organicImpressions: number;
    /**
     * $
     * @type {number}
     * @memberof CommunityExternalDto
     */
    earnedMediaValue: number;
    /**
     * 
     * @type {number}
     * @memberof CommunityExternalDto
     */
    topAdvocates: number;
    /**
     * 
     * @type {number}
     * @memberof CommunityExternalDto
     */
    mentions: number;
}
/**
 * 
 * @export
 * @interface CommunityInAppDto
 */
export interface CommunityInAppDto {
    /**
     * 
     * @type {number}
     * @memberof CommunityInAppDto
     */
    commentsPerUserWeek: number;
    /**
     * 
     * @type {number}
     * @memberof CommunityInAppDto
     */
    replyRatePct: number;
    /**
     * 
     * @type {number}
     * @memberof CommunityInAppDto
     */
    reactionToViewPct: number;
    /**
     * 
     * @type {number}
     * @memberof CommunityInAppDto
     */
    sharesPerVideo: number;
}
/**
 * 
 * @export
 * @interface CompleteProfileDto
 */
export interface CompleteProfileDto {
    /**
     * Unique display username (3–50 chars)
     * @type {string}
     * @memberof CompleteProfileDto
     */
    username: string;
    /**
     * Another user's referral code
     * @type {string}
     * @memberof CompleteProfileDto
     */
    referralCode?: string;
    /**
     * 
     * @type {string}
     * @memberof CompleteProfileDto
     */
    gender?: CompleteProfileDtoGenderEnum;
    /**
     * 
     * @type {string}
     * @memberof CompleteProfileDto
     */
    firstName?: string;
    /**
     * 
     * @type {string}
     * @memberof CompleteProfileDto
     */
    lastName?: string;
}


/**
 * @export
 */
export const CompleteProfileDtoGenderEnum = {
    Male: 'male',
    Female: 'female',
    Other: 'other',
    PreferNotToSay: 'prefer_not_to_say'
} as const;
export type CompleteProfileDtoGenderEnum = typeof CompleteProfileDtoGenderEnum[keyof typeof CompleteProfileDtoGenderEnum];

/**
 * 
 * @export
 * @interface CompleteUploadDto
 */
export interface CompleteUploadDto {
    /**
     * Client-computed checksum (etag/sha256) for integrity/dedupe
     * @type {string}
     * @memberof CompleteUploadDto
     */
    checksum?: string;
    /**
     * Actual uploaded size in bytes
     * @type {number}
     * @memberof CompleteUploadDto
     */
    sizeBytes?: number;
    /**
     * Client-probed duration (videos/audio). Fills only empty columns.
     * @type {number}
     * @memberof CompleteUploadDto
     */
    durationSeconds?: number;
    /**
     * Client-probed width in px
     * @type {number}
     * @memberof CompleteUploadDto
     */
    width?: number;
    /**
     * Client-probed height in px
     * @type {number}
     * @memberof CompleteUploadDto
     */
    height?: number;
}
/**
 * 
 * @export
 * @interface ConfirmAboveDto
 */
export interface ConfirmAboveDto {
    /**
     * 
     * @type {number}
     * @memberof ConfirmAboveDto
     */
    multiplier?: number;
    /**
     * 
     * @type {number}
     * @memberof ConfirmAboveDto
     */
    reward?: number;
    /**
     * 
     * @type {number}
     * @memberof ConfirmAboveDto
     */
    adjustment?: number;
}
/**
 * 
 * @export
 * @interface ConfirmAdjustmentResultDto
 */
export interface ConfirmAdjustmentResultDto {
    /**
     * 
     * @type {string}
     * @memberof ConfirmAdjustmentResultDto
     */
    id: string;
    /**
     * 
     * @type {number}
     * @memberof ConfirmAdjustmentResultDto
     */
    balanceAfter: number;
    /**
     * 
     * @type {boolean}
     * @memberof ConfirmAdjustmentResultDto
     */
    applied: boolean;
}
/**
 * 
 * @export
 * @interface ConfirmResolveDto
 */
export interface ConfirmResolveDto {
    /**
     * 
     * @type {string}
     * @memberof ConfirmResolveDto
     */
    previewToken: string;
}
/**
 * 
 * @export
 * @interface ContentAdsControllerForContentV1200Response
 */
export interface ContentAdsControllerForContentV1200Response {
    /**
     * 
     * @type {number}
     * @memberof ContentAdsControllerForContentV1200Response
     */
    statusCode: number;
    /**
     * 
     * @type {string}
     * @memberof ContentAdsControllerForContentV1200Response
     */
    status: string;
    /**
     * 
     * @type {string}
     * @memberof ContentAdsControllerForContentV1200Response
     */
    message: string;
    /**
     * Error details, or null on success
     * @type {object}
     * @memberof ContentAdsControllerForContentV1200Response
     */
    error: object | null;
    /**
     * 
     * @type {ContentAdsDto}
     * @memberof ContentAdsControllerForContentV1200Response
     */
    data?: ContentAdsDto;
}
/**
 * 
 * @export
 * @interface ContentAdsDto
 */
export interface ContentAdsDto {
    /**
     * 
     * @type {string}
     * @memberof ContentAdsDto
     */
    contentId: string;
    /**
     * Active subscriber — roll ads suppressed (overlay kept)
     * @type {boolean}
     * @memberof ContentAdsDto
     */
    adFree: boolean;
    /**
     * 
     * @type {Array<AdDescriptorDto>}
     * @memberof ContentAdsDto
     */
    ads: Array<AdDescriptorDto>;
}
/**
 * 
 * @export
 * @interface ContentAgeBucketDto
 */
export interface ContentAgeBucketDto {
    /**
     * 
     * @type {string}
     * @memberof ContentAgeBucketDto
     */
    range: ContentAgeBucketDtoRangeEnum;
    /**
     * Share of viewers with a known date of birth; the 5 buckets sum to 100
     * @type {number}
     * @memberof ContentAgeBucketDto
     */
    pct: number;
}


/**
 * @export
 */
export const ContentAgeBucketDtoRangeEnum = {
    _1317: '13-17',
    _1824: '18-24',
    _2534: '25-34',
    _3544: '35-44',
    _45: '45+'
} as const;
export type ContentAgeBucketDtoRangeEnum = typeof ContentAgeBucketDtoRangeEnum[keyof typeof ContentAgeBucketDtoRangeEnum];

/**
 * 
 * @export
 * @interface ContentAnalyticsDto
 */
export interface ContentAnalyticsDto {
    /**
     * 
     * @type {number}
     * @memberof ContentAnalyticsDto
     */
    viewCount: number;
    /**
     * 
     * @type {number}
     * @memberof ContentAnalyticsDto
     */
    uniqueViewerCount: number;
    /**
     * 
     * @type {number}
     * @memberof ContentAnalyticsDto
     */
    likeCount: number;
    /**
     * 
     * @type {number}
     * @memberof ContentAnalyticsDto
     */
    dislikeCount: number;
    /**
     * 
     * @type {number}
     * @memberof ContentAnalyticsDto
     */
    commentCount: number;
    /**
     * 
     * @type {number}
     * @memberof ContentAnalyticsDto
     */
    shareCount: number;
    /**
     * View sessions recorded (lifetime)
     * @type {number}
     * @memberof ContentAnalyticsDto
     */
    sessions: number;
    /**
     * Lifetime distinct viewers
     * @type {number}
     * @memberof ContentAnalyticsDto
     */
    distinctViewers: number;
    /**
     * Average completion % (lifetime)
     * @type {number}
     * @memberof ContentAnalyticsDto
     */
    avgCompletion: number;
    /**
     * Lifetime watch seconds
     * @type {number}
     * @memberof ContentAnalyticsDto
     */
    totalWatchSeconds: number;
    /**
     * Daily rollups within the window (newest first)
     * @type {Array<ContentDailyStatDto>}
     * @memberof ContentAnalyticsDto
     */
    daily: Array<ContentDailyStatDto>;
    /**
     * Which days of `daily` came from the rollup
     * @type {ContentDailySourceDto}
     * @memberof ContentAnalyticsDto
     */
    dailySource: ContentDailySourceDto;
    /**
     * Window start (ISO)
     * @type {string}
     * @memberof ContentAnalyticsDto
     */
    from: string;
    /**
     * Window end, exclusive (ISO)
     * @type {string}
     * @memberof ContentAnalyticsDto
     */
    to: string;
    /**
     * 
     * @type {ContentPeriodChangeDto}
     * @memberof ContentAnalyticsDto
     */
    periodChange: ContentPeriodChangeDto;
    /**
     * WINDOWED — (likes + comments + shares + saves) / views × 100
     * @type {number}
     * @memberof ContentAnalyticsDto
     */
    engagementRate: number;
    /**
     * Same over the previous window of equal length
     * @type {number}
     * @memberof ContentAnalyticsDto
     */
    prevEngagementRate: number;
    /**
     * 
     * @type {Array<ContentRetentionPointDto>}
     * @memberof ContentAnalyticsDto
     */
    retention: Array<ContentRetentionPointDto>;
    /**
     * 
     * @type {Array<ContentTrafficSourceDto>}
     * @memberof ContentAnalyticsDto
     */
    trafficSources: Array<ContentTrafficSourceDto>;
    /**
     * 
     * @type {ContentDemographicsDto}
     * @memberof ContentAnalyticsDto
     */
    demographics: ContentDemographicsDto;
    /**
     * Top 100 countries by views
     * @type {Array<ContentGeoDto>}
     * @memberof ContentAnalyticsDto
     */
    geo: Array<ContentGeoDto>;
    /**
     * Mixed: the 7 original counters are lifetime, the 4 new fields are windowed — each field says which
     * @type {ContentGamesStatsDto}
     * @memberof ContentAnalyticsDto
     */
    games: ContentGamesStatsDto;
    /**
     * 
     * @type {ContentBtsDto}
     * @memberof ContentAnalyticsDto
     */
    bts: ContentBtsDto;
}
/**
 * 
 * @export
 * @interface ContentBtsChildDto
 */
export interface ContentBtsChildDto {
    /**
     * 
     * @type {string}
     * @memberof ContentBtsChildDto
     */
    id: string;
    /**
     * 
     * @type {string}
     * @memberof ContentBtsChildDto
     */
    title: string;
    /**
     * 
     * @type {string}
     * @memberof ContentBtsChildDto
     */
    contentType: string;
    /**
     * Views in the window
     * @type {number}
     * @memberof ContentBtsChildDto
     */
    views: number;
}
/**
 * 
 * @export
 * @interface ContentBtsDto
 */
export interface ContentBtsDto {
    /**
     * 
     * @type {Array<ContentBtsChildDto>}
     * @memberof ContentBtsDto
     */
    children: Array<ContentBtsChildDto>;
    /**
     * Distinct viewers of this content in the window
     * @type {number}
     * @memberof ContentBtsDto
     */
    parentViewers: number;
    /**
     * Parent viewers who also viewed any child in the window
     * @type {number}
     * @memberof ContentBtsDto
     */
    childViewers: number;
    /**
     * childViewers / parentViewers (0..1)
     * @type {number}
     * @memberof ContentBtsDto
     */
    ctr: number;
    /**
     * Same ratio over the previous window of equal length
     * @type {number}
     * @memberof ContentBtsDto
     */
    prevCtr: number;
}
/**
 * 
 * @export
 * @interface ContentControllerDetailV1200Response
 */
export interface ContentControllerDetailV1200Response {
    /**
     * 
     * @type {number}
     * @memberof ContentControllerDetailV1200Response
     */
    statusCode: number;
    /**
     * 
     * @type {string}
     * @memberof ContentControllerDetailV1200Response
     */
    status: string;
    /**
     * 
     * @type {string}
     * @memberof ContentControllerDetailV1200Response
     */
    message: string;
    /**
     * Error details, or null on success
     * @type {object}
     * @memberof ContentControllerDetailV1200Response
     */
    error: object | null;
    /**
     * 
     * @type {ContentResponseDto}
     * @memberof ContentControllerDetailV1200Response
     */
    data?: ContentResponseDto;
}
/**
 * 
 * @export
 * @interface ContentControllerFeedV1200Response
 */
export interface ContentControllerFeedV1200Response {
    /**
     * 
     * @type {number}
     * @memberof ContentControllerFeedV1200Response
     */
    statusCode: number;
    /**
     * 
     * @type {string}
     * @memberof ContentControllerFeedV1200Response
     */
    status: string;
    /**
     * 
     * @type {string}
     * @memberof ContentControllerFeedV1200Response
     */
    message: string;
    /**
     * Error details, or null on success
     * @type {object}
     * @memberof ContentControllerFeedV1200Response
     */
    error: object | null;
    /**
     * 
     * @type {ContentControllerFeedV1200ResponseAllOfData}
     * @memberof ContentControllerFeedV1200Response
     */
    data?: ContentControllerFeedV1200ResponseAllOfData;
}
/**
 * 
 * @export
 * @interface ContentControllerFeedV1200ResponseAllOfData
 */
export interface ContentControllerFeedV1200ResponseAllOfData {
    /**
     * 
     * @type {Array<ContentResponseDto>}
     * @memberof ContentControllerFeedV1200ResponseAllOfData
     */
    items?: Array<ContentResponseDto>;
    /**
     * 
     * @type {PaginationDetailsDto}
     * @memberof ContentControllerFeedV1200ResponseAllOfData
     */
    pagination?: PaginationDetailsDto;
}
/**
 * 
 * @export
 * @interface ContentDailySourceDto
 */
export interface ContentDailySourceDto {
    /**
     * First day served from content_daily_stats (YYYY-MM-DD)
     * @type {string}
     * @memberof ContentDailySourceDto
     */
    rollupFrom: string | null;
    /**
     * Last day served from content_daily_stats; other days are live
     * @type {string}
     * @memberof ContentDailySourceDto
     */
    rollupThrough: string | null;
}
/**
 * 
 * @export
 * @interface ContentDailyStatDto
 */
export interface ContentDailyStatDto {
    /**
     * 
     * @type {string}
     * @memberof ContentDailyStatDto
     */
    date: string;
    /**
     * 
     * @type {number}
     * @memberof ContentDailyStatDto
     */
    views: number;
    /**
     * 
     * @type {number}
     * @memberof ContentDailyStatDto
     */
    uniqueViewers: number;
    /**
     * 
     * @type {number}
     * @memberof ContentDailyStatDto
     */
    watchSeconds: number;
    /**
     * 
     * @type {number}
     * @memberof ContentDailyStatDto
     */
    avgCompletion: number;
}
/**
 * 
 * @export
 * @interface ContentDemographicsDto
 */
export interface ContentDemographicsDto {
    /**
     * 
     * @type {Array<ContentGenderBreakdownDto>}
     * @memberof ContentDemographicsDto
     */
    gender: Array<ContentGenderBreakdownDto>;
    /**
     * 
     * @type {Array<ContentDeviceBreakdownDto>}
     * @memberof ContentDemographicsDto
     */
    device: Array<ContentDeviceBreakdownDto>;
    /**
     * Always all 5 buckets in fixed order. Derived from users.date_of_birth; viewers without one are excluded from the base, so all-zero means no viewer has a recorded DOB yet.
     * @type {Array<ContentAgeBucketDto>}
     * @memberof ContentDemographicsDto
     */
    age: Array<ContentAgeBucketDto>;
}
/**
 * 
 * @export
 * @interface ContentDeviceBreakdownDto
 */
export interface ContentDeviceBreakdownDto {
    /**
     * ios | android | web | 'unknown'
     * @type {string}
     * @memberof ContentDeviceBreakdownDto
     */
    device: string;
    /**
     * 
     * @type {number}
     * @memberof ContentDeviceBreakdownDto
     */
    views: number;
    /**
     * 
     * @type {number}
     * @memberof ContentDeviceBreakdownDto
     */
    viewers: number;
}
/**
 * 
 * @export
 * @interface ContentFullDto
 */
export interface ContentFullDto {
    /**
     * 
     * @type {ContentResponseDto}
     * @memberof ContentFullDto
     */
    content: ContentResponseDto;
    /**
     * 
     * @type {LicenseResponseDto}
     * @memberof ContentFullDto
     */
    license?: LicenseResponseDto | null;
    /**
     * 
     * @type {SponsorshipResponseDto}
     * @memberof ContentFullDto
     */
    sponsorship?: SponsorshipResponseDto | null;
    /**
     * Lifetime ad metrics of the active sponsorship
     * @type {AdMetricsDto}
     * @memberof ContentFullDto
     */
    adPerformance?: AdMetricsDto | null;
    /**
     * 
     * @type {RegionsResponseDto}
     * @memberof ContentFullDto
     */
    regions: RegionsResponseDto;
    /**
     * 
     * @type {Array<ContentHistoryEntryDto>}
     * @memberof ContentFullDto
     */
    history: Array<ContentHistoryEntryDto>;
    /**
     * 
     * @type {LinkedGamesDto}
     * @memberof ContentFullDto
     */
    linkedGames: LinkedGamesDto;
}
/**
 * 
 * @export
 * @interface ContentGamesStatsDto
 */
export interface ContentGamesStatsDto {
    /**
     * 
     * @type {number}
     * @memberof ContentGamesStatsDto
     */
    predictions: number;
    /**
     * 
     * @type {number}
     * @memberof ContentGamesStatsDto
     */
    predictionEntries: number;
    /**
     * 
     * @type {number}
     * @memberof ContentGamesStatsDto
     */
    auctions: number;
    /**
     * 
     * @type {number}
     * @memberof ContentGamesStatsDto
     */
    bids: number;
    /**
     * 
     * @type {number}
     * @memberof ContentGamesStatsDto
     */
    quests: number;
    /**
     * Distinct users participating in linked quests
     * @type {number}
     * @memberof ContentGamesStatsDto
     */
    questParticipants: number;
    /**
     * Distinct users who completed a linked quest
     * @type {number}
     * @memberof ContentGamesStatsDto
     */
    questCompletions: number;
    /**
     * WINDOWED — distinct users across every linked game, deduplicated across game types
     * @type {number}
     * @memberof ContentGamesStatsDto
     */
    participants: number;
    /**
     * WINDOWED — participants / distinct viewers in the window × 100
     * @type {number}
     * @memberof ContentGamesStatsDto
     */
    participationPct: number;
    /**
     * Same over the previous window of equal length
     * @type {number}
     * @memberof ContentGamesStatsDto
     */
    prevParticipationPct: number;
    /**
     * WINDOWED — points earned from quests / predictions / auctions linked to this content
     * @type {number}
     * @memberof ContentGamesStatsDto
     */
    pointsDistributed: number;
}
/**
 * 
 * @export
 * @interface ContentGenderBreakdownDto
 */
export interface ContentGenderBreakdownDto {
    /**
     * users.gender ('unknown' when unset)
     * @type {string}
     * @memberof ContentGenderBreakdownDto
     */
    gender: string;
    /**
     * 
     * @type {number}
     * @memberof ContentGenderBreakdownDto
     */
    views: number;
    /**
     * 
     * @type {number}
     * @memberof ContentGenderBreakdownDto
     */
    viewers: number;
}
/**
 * 
 * @export
 * @interface ContentGenreRefDto
 */
export interface ContentGenreRefDto {
    /**
     * 
     * @type {string}
     * @memberof ContentGenreRefDto
     */
    id: string;
    /**
     * 
     * @type {string}
     * @memberof ContentGenreRefDto
     */
    name: string;
    /**
     * 
     * @type {string}
     * @memberof ContentGenreRefDto
     */
    slug: string;
    /**
     * 
     * @type {boolean}
     * @memberof ContentGenreRefDto
     */
    isPrimary: boolean;
}
/**
 * 
 * @export
 * @interface ContentGeoDto
 */
export interface ContentGeoDto {
    /**
     * Viewer users.country_code ('unknown' when unset)
     * @type {string}
     * @memberof ContentGeoDto
     */
    countryCode: string;
    /**
     * 
     * @type {number}
     * @memberof ContentGeoDto
     */
    views: number;
    /**
     * 
     * @type {number}
     * @memberof ContentGeoDto
     */
    watchSeconds: number;
    /**
     * Ads revenue (CPM impressions + CPC clicks) for this content from viewers in this country, in the window. Anonymous ad events have no country, so the sum across countries is a lower bound.
     * @type {number}
     * @memberof ContentGeoDto
     */
    revenueCents: number;
}
/**
 * 
 * @export
 * @interface ContentHistoryChangesDto
 */
export interface ContentHistoryChangesDto {
    /**
     * `updated`: the fields that changed
     * @type {Array<string>}
     * @memberof ContentHistoryChangesDto
     */
    fields?: Array<string>;
    /**
     * `updated` (media): the attached / detached media
     * @type {string}
     * @memberof ContentHistoryChangesDto
     */
    mediaId?: string;
    /**
     * `updated` (media): the media kind attached
     * @type {string}
     * @memberof ContentHistoryChangesDto
     */
    kind?: string;
    /**
     * `scheduled`: the go-live (ISO)
     * @type {string}
     * @memberof ContentHistoryChangesDto
     */
    scheduledAt?: string;
    /**
     * `unscheduled`: the go-live it had (ISO)
     * @type {string}
     * @memberof ContentHistoryChangesDto
     */
    previousScheduledAt?: string | null;
    /**
     * `boosted`: feed priority
     * @type {number}
     * @memberof ContentHistoryChangesDto
     */
    priority?: number;
    /**
     * `boosted`: window start (ISO)
     * @type {string}
     * @memberof ContentHistoryChangesDto
     */
    startsAt?: string | null;
    /**
     * `boosted`: window end (ISO)
     * @type {string}
     * @memberof ContentHistoryChangesDto
     */
    until?: string | null;
    /**
     * `boosted`: channels
     * @type {Array<string>}
     * @memberof ContentHistoryChangesDto
     */
    channels?: Array<string>;
}
/**
 * 
 * @export
 * @interface ContentHistoryEntryDto
 */
export interface ContentHistoryEntryDto {
    /**
     * 
     * @type {string}
     * @memberof ContentHistoryEntryDto
     */
    id: string;
    /**
     * 
     * @type {string}
     * @memberof ContentHistoryEntryDto
     */
    contentId: string;
    /**
     * 
     * @type {string}
     * @memberof ContentHistoryEntryDto
     */
    changedBy?: string | null;
    /**
     * Actor display name
     * @type {string}
     * @memberof ContentHistoryEntryDto
     */
    changedByName?: string | null;
    /**
     * Actor role name(s), comma-joined
     * @type {string}
     * @memberof ContentHistoryEntryDto
     */
    changedByRole?: string | null;
    /**
     * 
     * @type {string}
     * @memberof ContentHistoryEntryDto
     */
    action: ContentHistoryEntryDtoActionEnum;
    /**
     * 
     * @type {ContentHistoryChangesDto}
     * @memberof ContentHistoryEntryDto
     */
    changes: ContentHistoryChangesDto;
    /**
     * 
     * @type {string}
     * @memberof ContentHistoryEntryDto
     */
    note?: string | null;
    /**
     * 
     * @type {string}
     * @memberof ContentHistoryEntryDto
     */
    createdAt: string;
}


/**
 * @export
 */
export const ContentHistoryEntryDtoActionEnum = {
    Created: 'created',
    Updated: 'updated',
    Submitted: 'submitted',
    Approved: 'approved',
    Rejected: 'rejected',
    Scheduled: 'scheduled',
    Published: 'published',
    Boosted: 'boosted',
    Archived: 'archived',
    Unscheduled: 'unscheduled',
    Unarchived: 'unarchived',
    Deleted: 'deleted'
} as const;
export type ContentHistoryEntryDtoActionEnum = typeof ContentHistoryEntryDtoActionEnum[keyof typeof ContentHistoryEntryDtoActionEnum];

/**
 * 
 * @export
 * @interface ContentLibraryAnalyticsDto
 */
export interface ContentLibraryAnalyticsDto {
    /**
     * 
     * @type {string}
     * @memberof ContentLibraryAnalyticsDto
     */
    from: string;
    /**
     * 
     * @type {string}
     * @memberof ContentLibraryAnalyticsDto
     */
    to: string;
    /**
     * 
     * @type {string}
     * @memberof ContentLibraryAnalyticsDto
     */
    region?: string | null;
    /**
     * 
     * @type {LibraryTotalsDto}
     * @memberof ContentLibraryAnalyticsDto
     */
    totals: LibraryTotalsDto;
    /**
     * The same five metrics over `[from − len, from)`, for "vs last month" arrows
     * @type {LibraryPreviousDto}
     * @memberof ContentLibraryAnalyticsDto
     */
    previous: LibraryPreviousDto;
    /**
     * One entry per UTC day, zero-filled, OLDEST FIRST (sparkline order)
     * @type {Array<LibraryDailyPointDto>}
     * @memberof ContentLibraryAnalyticsDto
     */
    daily: Array<LibraryDailyPointDto>;
    /**
     * `hitThreshold` pro-rated over the window length — what `daily[].hitRatePct` tests against
     * @type {number}
     * @memberof ContentLibraryAnalyticsDto
     */
    dailyHitThreshold: number;
    /**
     * 
     * @type {Array<LibraryRegionDto>}
     * @memberof ContentLibraryAnalyticsDto
     */
    byRegion: Array<LibraryRegionDto>;
    /**
     * 
     * @type {LibraryHitRateDto}
     * @memberof ContentLibraryAnalyticsDto
     */
    hitRate: LibraryHitRateDto;
    /**
     * 
     * @type {LibraryGameConversionDto}
     * @memberof ContentLibraryAnalyticsDto
     */
    gameConversion: LibraryGameConversionDto;
    /**
     * 
     * @type {LibraryFunnelDto}
     * @memberof ContentLibraryAnalyticsDto
     */
    funnel: LibraryFunnelDto;
    /**
     * 
     * @type {LibraryRevenueAttributionDto}
     * @memberof ContentLibraryAnalyticsDto
     */
    revenueAttribution: LibraryRevenueAttributionDto;
    /**
     * 
     * @type {LibraryBtsUpsellDto}
     * @memberof ContentLibraryAnalyticsDto
     */
    btsUpsell: LibraryBtsUpsellDto;
    /**
     * 
     * @type {LibrarySentimentDto}
     * @memberof ContentLibraryAnalyticsDto
     */
    sentiment: LibrarySentimentDto;
    /**
     * 
     * @type {LibraryShareVelocityDto}
     * @memberof ContentLibraryAnalyticsDto
     */
    shareVelocity: LibraryShareVelocityDto;
    /**
     * Top 10 by views in the window
     * @type {Array<LibraryTopContentDto>}
     * @memberof ContentLibraryAnalyticsDto
     */
    topContent: Array<LibraryTopContentDto>;
}
/**
 * 
 * @export
 * @interface ContentMediaItemDto
 */
export interface ContentMediaItemDto {
    /**
     * 
     * @type {string}
     * @memberof ContentMediaItemDto
     */
    id: string;
    /**
     * 
     * @type {string}
     * @memberof ContentMediaItemDto
     */
    mediaId: string;
    /**
     * 
     * @type {string}
     * @memberof ContentMediaItemDto
     */
    kind: ContentMediaItemDtoKindEnum;
    /**
     * 
     * @type {number}
     * @memberof ContentMediaItemDto
     */
    sortOrder: number;
    /**
     * 
     * @type {number}
     * @memberof ContentMediaItemDto
     */
    timecodeSeconds?: number | null;
    /**
     * Public URL when the media is ready + public
     * @type {string}
     * @memberof ContentMediaItemDto
     */
    url?: string | null;
    /**
     * 
     * @type {string}
     * @memberof ContentMediaItemDto
     */
    status: string;
    /**
     * 
     * @type {number}
     * @memberof ContentMediaItemDto
     */
    width?: number | null;
    /**
     * 
     * @type {number}
     * @memberof ContentMediaItemDto
     */
    height?: number | null;
    /**
     * 
     * @type {string}
     * @memberof ContentMediaItemDto
     */
    createdAt: string;
}


/**
 * @export
 */
export const ContentMediaItemDtoKindEnum = {
    Thumbnail: 'thumbnail',
    Poster: 'poster',
    Still: 'still',
    Banner: 'banner'
} as const;
export type ContentMediaItemDtoKindEnum = typeof ContentMediaItemDtoKindEnum[keyof typeof ContentMediaItemDtoKindEnum];

/**
 * 
 * @export
 * @interface ContentPeriodChangeDto
 */
export interface ContentPeriodChangeDto {
    /**
     * Views in the window
     * @type {number}
     * @memberof ContentPeriodChangeDto
     */
    views: number;
    /**
     * Views in the previous window of equal length
     * @type {number}
     * @memberof ContentPeriodChangeDto
     */
    prevViews: number;
    /**
     * % change (1 dp); 100 when previous = 0 and current > 0
     * @type {number}
     * @memberof ContentPeriodChangeDto
     */
    viewsPct: number;
    /**
     * 
     * @type {number}
     * @memberof ContentPeriodChangeDto
     */
    watchSeconds: number;
    /**
     * 
     * @type {number}
     * @memberof ContentPeriodChangeDto
     */
    prevWatchSeconds: number;
    /**
     * 
     * @type {number}
     * @memberof ContentPeriodChangeDto
     */
    watchSecondsPct: number;
}
/**
 * 
 * @export
 * @interface ContentPipelineDto
 */
export interface ContentPipelineDto {
    /**
     * 
     * @type {number}
     * @memberof ContentPipelineDto
     */
    draft: number;
    /**
     * 
     * @type {number}
     * @memberof ContentPipelineDto
     */
    inReview: number;
    /**
     * 
     * @type {number}
     * @memberof ContentPipelineDto
     */
    scheduled: number;
}
/**
 * 
 * @export
 * @interface ContentPlaybackControllerPlaybackV1200Response
 */
export interface ContentPlaybackControllerPlaybackV1200Response {
    /**
     * 
     * @type {number}
     * @memberof ContentPlaybackControllerPlaybackV1200Response
     */
    statusCode: number;
    /**
     * 
     * @type {string}
     * @memberof ContentPlaybackControllerPlaybackV1200Response
     */
    status: string;
    /**
     * 
     * @type {string}
     * @memberof ContentPlaybackControllerPlaybackV1200Response
     */
    message: string;
    /**
     * Error details, or null on success
     * @type {object}
     * @memberof ContentPlaybackControllerPlaybackV1200Response
     */
    error: object | null;
    /**
     * 
     * @type {ContentPlaybackDto}
     * @memberof ContentPlaybackControllerPlaybackV1200Response
     */
    data?: ContentPlaybackDto;
}
/**
 * 
 * @export
 * @interface ContentPlaybackDto
 */
export interface ContentPlaybackDto {
    /**
     * 
     * @type {string}
     * @memberof ContentPlaybackDto
     */
    contentId: string;
    /**
     * 
     * @type {string}
     * @memberof ContentPlaybackDto
     */
    mediaId: string;
    /**
     * 
     * @type {string}
     * @memberof ContentPlaybackDto
     */
    accessTier: ContentPlaybackDtoAccessTierEnum;
    /**
     * 
     * @type {number}
     * @memberof ContentPlaybackDto
     */
    durationSeconds?: number | null;
    /**
     * 
     * @type {number}
     * @memberof ContentPlaybackDto
     */
    width?: number | null;
    /**
     * 
     * @type {number}
     * @memberof ContentPlaybackDto
     */
    height?: number | null;
    /**
     * 
     * @type {PlaybackDto}
     * @memberof ContentPlaybackDto
     */
    playback: PlaybackDto;
}


/**
 * @export
 */
export const ContentPlaybackDtoAccessTierEnum = {
    Free: 'free',
    Exclusive: 'exclusive'
} as const;
export type ContentPlaybackDtoAccessTierEnum = typeof ContentPlaybackDtoAccessTierEnum[keyof typeof ContentPlaybackDtoAccessTierEnum];

/**
 * 
 * @export
 * @interface ContentRegionStatDto
 */
export interface ContentRegionStatDto {
    /**
     * 
     * @type {string}
     * @memberof ContentRegionStatDto
     */
    region: ContentRegionStatDtoRegionEnum;
    /**
     * Titles available in the region (explicit publish row, or global rights with no rows)
     * @type {number}
     * @memberof ContentRegionStatDto
     */
    total: number;
    /**
     * 
     * @type {number}
     * @memberof ContentRegionStatDto
     */
    published: number;
    /**
     * Titles with an explicit live publish row; global-rights titles have no live flag
     * @type {number}
     * @memberof ContentRegionStatDto
     */
    live: number;
    /**
     * Views in the last 30 days by viewers whose users.region matches
     * @type {number}
     * @memberof ContentRegionStatDto
     */
    views30d: number;
    /**
     * 
     * @type {number}
     * @memberof ContentRegionStatDto
     */
    watchSeconds30d: number;
}


/**
 * @export
 */
export const ContentRegionStatDtoRegionEnum = {
    Na: 'NA',
    Eu: 'EU',
    Apac: 'APAC',
    Latam: 'LATAM',
    Mea: 'MEA'
} as const;
export type ContentRegionStatDtoRegionEnum = typeof ContentRegionStatDtoRegionEnum[keyof typeof ContentRegionStatDtoRegionEnum];

/**
 * 
 * @export
 * @interface ContentReportControllerReportV1201Response
 */
export interface ContentReportControllerReportV1201Response {
    /**
     * 
     * @type {number}
     * @memberof ContentReportControllerReportV1201Response
     */
    statusCode: number;
    /**
     * 
     * @type {string}
     * @memberof ContentReportControllerReportV1201Response
     */
    status: string;
    /**
     * 
     * @type {string}
     * @memberof ContentReportControllerReportV1201Response
     */
    message: string;
    /**
     * Error details, or null on success
     * @type {object}
     * @memberof ContentReportControllerReportV1201Response
     */
    error: object | null;
    /**
     * 
     * @type {ReportReceivedDto}
     * @memberof ContentReportControllerReportV1201Response
     */
    data?: ReportReceivedDto;
}
/**
 * 
 * @export
 * @interface ContentResponseDto
 */
export interface ContentResponseDto {
    /**
     * 
     * @type {string}
     * @memberof ContentResponseDto
     */
    id: string;
    /**
     * 
     * @type {string}
     * @memberof ContentResponseDto
     */
    title: string;
    /**
     * 
     * @type {string}
     * @memberof ContentResponseDto
     */
    slug: string;
    /**
     * 
     * @type {string}
     * @memberof ContentResponseDto
     */
    description?: string | null;
    /**
     * 
     * @type {string}
     * @memberof ContentResponseDto
     */
    contentType: ContentResponseDtoContentTypeEnum;
    /**
     * 
     * @type {string}
     * @memberof ContentResponseDto
     */
    accessTier: ContentResponseDtoAccessTierEnum;
    /**
     * 
     * @type {number}
     * @memberof ContentResponseDto
     */
    unlockPoints?: number | null;
    /**
     * 
     * @type {string}
     * @memberof ContentResponseDto
     */
    studioId?: string | null;
    /**
     * 
     * @type {string}
     * @memberof ContentResponseDto
     */
    videoMediaId?: string | null;
    /**
     * 
     * @type {string}
     * @memberof ContentResponseDto
     */
    thumbnailMediaId?: string | null;
    /**
     * 
     * @type {number}
     * @memberof ContentResponseDto
     */
    durationSeconds?: number | null;
    /**
     * 
     * @type {string}
     * @memberof ContentResponseDto
     */
    language?: string | null;
    /**
     * 
     * @type {string}
     * @memberof ContentResponseDto
     */
    status: string;
    /**
     * 
     * @type {boolean}
     * @memberof ContentResponseDto
     */
    isBoosted: boolean;
    /**
     * 
     * @type {string}
     * @memberof ContentResponseDto
     */
    rightsRegion: string;
    /**
     * 
     * @type {string}
     * @memberof ContentResponseDto
     */
    parentContentId?: string | null;
    /**
     * End of the live window (hidden from the feed after)
     * @type {string}
     * @memberof ContentResponseDto
     */
    availableUntil?: string | null;
    /**
     * 
     * @type {Array<WatchLinkDto>}
     * @memberof ContentResponseDto
     */
    watchLinks: Array<WatchLinkDto>;
    /**
     * 
     * @type {number}
     * @memberof ContentResponseDto
     */
    viewCount: number;
    /**
     * 
     * @type {number}
     * @memberof ContentResponseDto
     */
    likeCount: number;
    /**
     * 
     * @type {number}
     * @memberof ContentResponseDto
     */
    dislikeCount: number;
    /**
     * 
     * @type {number}
     * @memberof ContentResponseDto
     */
    commentCount: number;
    /**
     * 
     * @type {number}
     * @memberof ContentResponseDto
     */
    shareCount: number;
    /**
     * Video media width (px)
     * @type {number}
     * @memberof ContentResponseDto
     */
    videoWidth?: number | null;
    /**
     * Video media height (px)
     * @type {number}
     * @memberof ContentResponseDto
     */
    videoHeight?: number | null;
    /**
     * Signed playback for this viewer. Null when the item is locked, has no video, or its video is still processing. Credentials are short-lived — see expiresInSeconds.
     * @type {PlaybackDto}
     * @memberof ContentResponseDto
     */
    playback?: PlaybackDto | null;
    /**
     * Exclusive content this viewer has not unlocked. Metadata is still returned; playback is not.
     * @type {boolean}
     * @memberof ContentResponseDto
     */
    isLocked?: boolean;
    /**
     * Geo-blocked for this viewer. Metadata is still returned so a share link resolves, but playback is not. Distinct from isLocked — there is nothing the viewer can do about it.
     * @type {boolean}
     * @memberof ContentResponseDto
     */
    isRegionBlocked?: boolean;
    /**
     * Has a live sponsorship ("Sponsored by")
     * @type {boolean}
     * @memberof ContentResponseDto
     */
    sponsored?: boolean;
    /**
     * Feed-inserted commercial (ad slot), not organic content
     * @type {boolean}
     * @memberof ContentResponseDto
     */
    isCommercial?: boolean;
    /**
     * Commercial descriptor (isCommercial items only)
     * @type {FeedAdDto}
     * @memberof ContentResponseDto
     */
    ad?: FeedAdDto | null;
    /**
     * 
     * @type {string}
     * @memberof ContentResponseDto
     */
    durationSource?: ContentResponseDtoDurationSourceEnum;
    /**
     * When the boost notifications campaign was claimed
     * @type {string}
     * @memberof ContentResponseDto
     */
    boostNotifiedAt?: string | null;
    /**
     * Lifetime ad impressions (active sponsorship)
     * @type {number}
     * @memberof ContentResponseDto
     */
    adImpressions?: number;
    /**
     * Lifetime ad clicks (active sponsorship)
     * @type {number}
     * @memberof ContentResponseDto
     */
    adClicks?: number;
    /**
     * clicks / impressions (0..1)
     * @type {number}
     * @memberof ContentResponseDto
     */
    adCtr?: number;
    /**
     * Sponsorship revenue per 1K ad impressions, in cents
     * @type {number}
     * @memberof ContentResponseDto
     */
    adRevenuePer1kImpressionsCents?: number;
    /**
     * 
     * @type {string}
     * @memberof ContentResponseDto
     */
    recommendation?: string;
    /**
     * 
     * @type {boolean}
     * @memberof ContentResponseDto
     */
    isSponsored?: boolean;
    /**
     * 
     * @type {boolean}
     * @memberof ContentResponseDto
     */
    isAdCommercial?: boolean;
    /**
     * 
     * @type {string}
     * @memberof ContentResponseDto
     */
    licenseStatus?: string;
    /**
     * 
     * @type {string}
     * @memberof ContentResponseDto
     */
    licenseExpiresAt?: string | null;
    /**
     * 
     * @type {string}
     * @memberof ContentResponseDto
     */
    scheduledAt?: string | null;
    /**
     * 
     * @type {string}
     * @memberof ContentResponseDto
     */
    publishedAt?: string | null;
    /**
     * 
     * @type {string}
     * @memberof ContentResponseDto
     */
    rejectionReason?: string | null;
    /**
     * 
     * @type {string}
     * @memberof ContentResponseDto
     */
    licensorName?: string | null;
    /**
     * 
     * @type {string}
     * @memberof ContentResponseDto
     */
    licenseTerms?: string | null;
    /**
     * 
     * @type {number}
     * @memberof ContentResponseDto
     */
    boostPriority?: number;
    /**
     * 
     * @type {string}
     * @memberof ContentResponseDto
     */
    boostStartsAt?: string | null;
    /**
     * 
     * @type {string}
     * @memberof ContentResponseDto
     */
    boostedUntil?: string | null;
    /**
     * 
     * @type {Array<string>}
     * @memberof ContentResponseDto
     */
    boostChannels?: Array<ContentResponseDtoBoostChannelsEnum>;
    /**
     * Boosted and now within the boost window
     * @type {boolean}
     * @memberof ContentResponseDto
     */
    isBoostActive?: boolean;
    /**
     * 
     * @type {string}
     * @memberof ContentResponseDto
     */
    studioName?: string | null;
    /**
     * Public URL of the ready thumbnail
     * @type {string}
     * @memberof ContentResponseDto
     */
    thumbnailUrl?: string | null;
    /**
     * 
     * @type {Array<ContentGenreRefDto>}
     * @memberof ContentResponseDto
     */
    genres?: Array<ContentGenreRefDto>;
    /**
     * 
     * @type {Array<ContentTagRefDto>}
     * @memberof ContentResponseDto
     */
    tags?: Array<ContentTagRefDto>;
    /**
     * 
     * @type {Array<PublishRegionDto>}
     * @memberof ContentResponseDto
     */
    publishRegions?: Array<PublishRegionDto>;
    /**
     * Predictions + auctions + quests referencing this content
     * @type {number}
     * @memberof ContentResponseDto
     */
    linkedGamesCount?: number;
    /**
     * 
     * @type {string}
     * @memberof ContentResponseDto
     */
    sponsorName?: string | null;
    /**
     * Sponsor logo/banner for the card badge. The sponsorship's banner on a sponsored video, the advertiser logo on a commercial. Null when the sponsor has no banner or it is not ready. Roll creatives and the click-through still come from GET /v1/content/:id/ads.
     * @type {string}
     * @memberof ContentResponseDto
     */
    sponsorLogoUrl?: string | null;
    /**
     * Where tapping the sponsor logo should go. **Null means the logo is not tappable** — render it as a plain badge, do not fall back to a search or the advertiser site. Null whenever the sponsorship (or commercial) has no clickUrl configured.
     * @type {string}
     * @memberof ContentResponseDto
     */
    sponsorClickUrl?: string | null;
    /**
     * 
     * @type {string}
     * @memberof ContentResponseDto
     */
    adPlacement?: ContentResponseDtoAdPlacementEnum | null;
    /**
     * Average completion % across view sessions
     * @type {number}
     * @memberof ContentResponseDto
     */
    completionRate?: number;
    /**
     * Views last 7d vs previous 7d (±10% = flat)
     * @type {string}
     * @memberof ContentResponseDto
     */
    viewsTrend?: ContentResponseDtoViewsTrendEnum;
    /**
     * (license + sponsorship revenue) / views × 1000, in cents
     * @type {number}
     * @memberof ContentResponseDto
     */
    revenuePer1kCents?: number;
    /**
     * Open moderation tickets on this content
     * @type {number}
     * @memberof ContentResponseDto
     */
    unresolvedFlags?: number;
    /**
     * 
     * @type {ActorRefDto}
     * @memberof ContentResponseDto
     */
    createdBy?: ActorRefDto | null;
    /**
     * 
     * @type {ActorRefDto}
     * @memberof ContentResponseDto
     */
    updatedBy?: ActorRefDto | null;
    /**
     * Cast & crew (detail only)
     * @type {Array<CastMemberDto>}
     * @memberof ContentResponseDto
     */
    cast?: Array<CastMemberDto>;
    /**
     * 
     * @type {string}
     * @memberof ContentResponseDto
     */
    createdAt: string;
    /**
     * 
     * @type {string}
     * @memberof ContentResponseDto
     */
    updatedAt: string;
}


/**
 * @export
 */
export const ContentResponseDtoContentTypeEnum = {
    Trailer: 'trailer',
    Bts: 'bts',
    Clip: 'clip'
} as const;
export type ContentResponseDtoContentTypeEnum = typeof ContentResponseDtoContentTypeEnum[keyof typeof ContentResponseDtoContentTypeEnum];

/**
 * @export
 */
export const ContentResponseDtoAccessTierEnum = {
    Free: 'free',
    Exclusive: 'exclusive'
} as const;
export type ContentResponseDtoAccessTierEnum = typeof ContentResponseDtoAccessTierEnum[keyof typeof ContentResponseDtoAccessTierEnum];

/**
 * @export
 */
export const ContentResponseDtoDurationSourceEnum = {
    Media: 'media',
    Manual: 'manual'
} as const;
export type ContentResponseDtoDurationSourceEnum = typeof ContentResponseDtoDurationSourceEnum[keyof typeof ContentResponseDtoDurationSourceEnum];

/**
 * @export
 */
export const ContentResponseDtoBoostChannelsEnum = {
    Homepage: 'homepage',
    Notifications: 'notifications',
    Regional: 'regional',
    Subscribers: 'subscribers'
} as const;
export type ContentResponseDtoBoostChannelsEnum = typeof ContentResponseDtoBoostChannelsEnum[keyof typeof ContentResponseDtoBoostChannelsEnum];

/**
 * @export
 */
export const ContentResponseDtoAdPlacementEnum = {
    PreRoll: 'pre-roll',
    MidRoll: 'mid-roll',
    PostRoll: 'post-roll',
    Overlay: 'overlay'
} as const;
export type ContentResponseDtoAdPlacementEnum = typeof ContentResponseDtoAdPlacementEnum[keyof typeof ContentResponseDtoAdPlacementEnum];

/**
 * @export
 */
export const ContentResponseDtoViewsTrendEnum = {
    Up: 'up',
    Flat: 'flat',
    Down: 'down'
} as const;
export type ContentResponseDtoViewsTrendEnum = typeof ContentResponseDtoViewsTrendEnum[keyof typeof ContentResponseDtoViewsTrendEnum];

/**
 * 
 * @export
 * @interface ContentRetentionPointDto
 */
export interface ContentRetentionPointDto {
    /**
     * Playhead bucket 0..100 step 10
     * @type {number}
     * @memberof ContentRetentionPointDto
     */
    percent: number;
    /**
     * Distinct viewers whose furthest position reached the bucket
     * @type {number}
     * @memberof ContentRetentionPointDto
     */
    viewers: number;
    /**
     * viewers / viewers at 0 % (0..1)
     * @type {number}
     * @memberof ContentRetentionPointDto
     */
    ratio: number;
}
/**
 * 
 * @export
 * @interface ContentStatsDto
 */
export interface ContentStatsDto {
    /**
     * 
     * @type {number}
     * @memberof ContentStatsDto
     */
    total: number;
    /**
     * 
     * @type {ContentStatusCountsDto}
     * @memberof ContentStatsDto
     */
    byStatus: ContentStatusCountsDto;
    /**
     * 
     * @type {number}
     * @memberof ContentStatsDto
     */
    boosted: number;
    /**
     * 
     * @type {number}
     * @memberof ContentStatsDto
     */
    sponsored: number;
    /**
     * Published titles
     * @type {number}
     * @memberof ContentStatsDto
     */
    activeLibrary: number;
    /**
     * 
     * @type {number}
     * @memberof ContentStatsDto
     */
    addedThisMonth: number;
    /**
     * 
     * @type {number}
     * @memberof ContentStatsDto
     */
    addedLast30d: number;
    /**
     * 
     * @type {number}
     * @memberof ContentStatsDto
     */
    addedPrev30d: number;
    /**
     * Last 30d vs previous 30d, % (null when no baseline)
     * @type {number}
     * @memberof ContentStatsDto
     */
    addedLast30dChangePct?: number | null;
    /**
     * 
     * @type {ContentPipelineDto}
     * @memberof ContentStatsDto
     */
    pipeline: ContentPipelineDto;
    /**
     * Created → published, titles published in the last 90 days
     * @type {number}
     * @memberof ContentStatsDto
     */
    avgTimeToPublishHours?: number | null;
    /**
     * 
     * @type {number}
     * @memberof ContentStatsDto
     */
    expiringThisMonth: number;
    /**
     * 
     * @type {number}
     * @memberof ContentStatsDto
     */
    expiringNextMonth: number;
    /**
     * Licences expiring in the next rolling 30 days
     * @type {number}
     * @memberof ContentStatsDto
     */
    expiringWithin30d: number;
    /**
     * 
     * @type {number}
     * @memberof ContentStatsDto
     */
    licensed: number;
    /**
     * 
     * @type {number}
     * @memberof ContentStatsDto
     */
    original: number;
    /**
     * Regional Activity map. Always all 5 macro-regions in fixed order, zero-filled, and NOT narrowed by `?region=` — the map always shows every region.
     * @type {Array<ContentRegionStatDto>}
     * @memberof ContentStatsDto
     */
    byRegion: Array<ContentRegionStatDto>;
}
/**
 * 
 * @export
 * @interface ContentStatusCountsDto
 */
export interface ContentStatusCountsDto {
    /**
     * 
     * @type {number}
     * @memberof ContentStatusCountsDto
     */
    draft: number;
    /**
     * 
     * @type {number}
     * @memberof ContentStatusCountsDto
     */
    pending_approval: number;
    /**
     * 
     * @type {number}
     * @memberof ContentStatusCountsDto
     */
    scheduled: number;
    /**
     * 
     * @type {number}
     * @memberof ContentStatusCountsDto
     */
    published: number;
    /**
     * 
     * @type {number}
     * @memberof ContentStatusCountsDto
     */
    rejected: number;
    /**
     * 
     * @type {number}
     * @memberof ContentStatusCountsDto
     */
    archived: number;
}
/**
 * 
 * @export
 * @interface ContentTagRefDto
 */
export interface ContentTagRefDto {
    /**
     * 
     * @type {string}
     * @memberof ContentTagRefDto
     */
    id: string;
    /**
     * 
     * @type {string}
     * @memberof ContentTagRefDto
     */
    name: string;
    /**
     * 
     * @type {string}
     * @memberof ContentTagRefDto
     */
    slug: string;
}
/**
 * 
 * @export
 * @interface ContentTrafficSourceDto
 */
export interface ContentTrafficSourceDto {
    /**
     * 
     * @type {string}
     * @memberof ContentTrafficSourceDto
     */
    source: ContentTrafficSourceDtoSourceEnum;
    /**
     * 
     * @type {number}
     * @memberof ContentTrafficSourceDto
     */
    views: number;
}


/**
 * @export
 */
export const ContentTrafficSourceDtoSourceEnum = {
    Feed: 'feed',
    Search: 'search',
    Share: 'share',
    Notification: 'notification',
    Profile: 'profile',
    Deeplink: 'deeplink',
    Other: 'other',
    Unknown: 'unknown'
} as const;
export type ContentTrafficSourceDtoSourceEnum = typeof ContentTrafficSourceDtoSourceEnum[keyof typeof ContentTrafficSourceDtoSourceEnum];

/**
 * 
 * @export
 * @interface CountryDto
 */
export interface CountryDto {
    /**
     * ISO-3166 alpha-2
     * @type {string}
     * @memberof CountryDto
     */
    code: string;
    /**
     * 
     * @type {string}
     * @memberof CountryDto
     */
    name: string;
    /**
     * 
     * @type {string}
     * @memberof CountryDto
     */
    region: string;
    /**
     * 
     * @type {CurrencyDto}
     * @memberof CountryDto
     */
    currency: CurrencyDto;
    /**
     * From geo_policies — false when the country is switched off
     * @type {boolean}
     * @memberof CountryDto
     */
    supported: boolean;
    /**
     * From geo_policies — whether points/rewards accrue there
     * @type {boolean}
     * @memberof CountryDto
     */
    tokenomicsEnabled: boolean;
    /**
     * From geo_policies — whether a subscription is required
     * @type {boolean}
     * @memberof CountryDto
     */
    subscriptionRequired: boolean;
}
/**
 * 
 * @export
 * @interface CountryListItemDto
 */
export interface CountryListItemDto {
    /**
     * ISO-3166 alpha-2
     * @type {string}
     * @memberof CountryListItemDto
     */
    code: string;
    /**
     * 
     * @type {string}
     * @memberof CountryListItemDto
     */
    name: string;
    /**
     * 
     * @type {string}
     * @memberof CountryListItemDto
     */
    region: string;
    /**
     * 
     * @type {CurrencyDto}
     * @memberof CountryListItemDto
     */
    currency: CurrencyDto;
    /**
     * 
     * @type {boolean}
     * @memberof CountryListItemDto
     */
    supported: boolean;
}
/**
 * 
 * @export
 * @interface CountrySummaryDto
 */
export interface CountrySummaryDto {
    /**
     * 
     * @type {string}
     * @memberof CountrySummaryDto
     */
    code: string;
    /**
     * 
     * @type {string}
     * @memberof CountrySummaryDto
     */
    name: string;
    /**
     * 
     * @type {string}
     * @memberof CountrySummaryDto
     */
    macro?: string | null;
    /**
     * 
     * @type {number}
     * @memberof CountrySummaryDto
     */
    users: number;
    /**
     * 
     * @type {number}
     * @memberof CountrySummaryDto
     */
    revenue: number;
    /**
     * 
     * @type {number}
     * @memberof CountrySummaryDto
     */
    points: number;
    /**
     * users ÷ max users, 0..1
     * @type {number}
     * @memberof CountrySummaryDto
     */
    intensity: number;
}
/**
 * 
 * @export
 * @interface CreateAdCampaignDto
 */
export interface CreateAdCampaignDto {
    /**
     * 
     * @type {string}
     * @memberof CreateAdCampaignDto
     */
    startsAt?: string | null;
    /**
     * 
     * @type {string}
     * @memberof CreateAdCampaignDto
     */
    endsAt?: string | null;
    /**
     * Empty = everywhere
     * @type {Array<string>}
     * @memberof CreateAdCampaignDto
     */
    regions?: Array<CreateAdCampaignDtoRegionsEnum>;
    /**
     * Commercial: feed rank 1–5 per targeted region
     * @type {RegionRanksDto}
     * @memberof CreateAdCampaignDto
     */
    ranks?: RegionRanksDto;
    /**
     * Shown under the ad in the feed, like a video description
     * @type {string}
     * @memberof CreateAdCampaignDto
     */
    caption?: string | null;
    /**
     * Commercial creative video (ready media)
     * @type {string}
     * @memberof CreateAdCampaignDto
     */
    creativeMediaId?: string | null;
    /**
     * 
     * @type {string}
     * @memberof CreateAdCampaignDto
     */
    clickUrl?: string | null;
    /**
     * 
     * @type {string}
     * @memberof CreateAdCampaignDto
     */
    ctaLabel?: string | null;
    /**
     * 
     * @type {number}
     * @memberof CreateAdCampaignDto
     */
    durationSeconds?: number | null;
    /**
     * 
     * @type {number}
     * @memberof CreateAdCampaignDto
     */
    skippableAfterSeconds?: number | null;
    /**
     * 
     * @type {number}
     * @memberof CreateAdCampaignDto
     */
    frequencyCapPerUserDay?: number | null;
    /**
     * 
     * @type {string}
     * @memberof CreateAdCampaignDto
     */
    pricingModel?: CreateAdCampaignDtoPricingModelEnum;
    /**
     * Flat fee (cents) — booked to the ledger on activation
     * @type {number}
     * @memberof CreateAdCampaignDto
     */
    flatFeeCents?: number;
    /**
     * Price per 1000 impressions (cents)
     * @type {number}
     * @memberof CreateAdCampaignDto
     */
    cpmCents?: number;
    /**
     * Price per click (cents)
     * @type {number}
     * @memberof CreateAdCampaignDto
     */
    cpcCents?: number;
    /**
     * Stop serving when delivered value reaches this (cents)
     * @type {number}
     * @memberof CreateAdCampaignDto
     */
    budgetCents?: number | null;
    /**
     * 
     * @type {number}
     * @memberof CreateAdCampaignDto
     */
    dailyBudgetCents?: number | null;
    /**
     * 
     * @type {number}
     * @memberof CreateAdCampaignDto
     */
    impressionGoal?: number | null;
    /**
     * 
     * @type {string}
     * @memberof CreateAdCampaignDto
     */
    currency?: string;
    /**
     * 
     * @type {string}
     * @memberof CreateAdCampaignDto
     */
    notes?: string | null;
    /**
     * Existing advertiser (or send advertiserName)
     * @type {string}
     * @memberof CreateAdCampaignDto
     */
    advertiserId?: string;
    /**
     * Find-or-create advertiser by name
     * @type {string}
     * @memberof CreateAdCampaignDto
     */
    advertiserName?: string;
    /**
     * 
     * @type {string}
     * @memberof CreateAdCampaignDto
     */
    name: string;
    /**
     * 
     * @type {string}
     * @memberof CreateAdCampaignDto
     */
    type: CreateAdCampaignDtoTypeEnum;
}


/**
 * @export
 */
export const CreateAdCampaignDtoRegionsEnum = {
    Na: 'NA',
    Eu: 'EU',
    Apac: 'APAC',
    Latam: 'LATAM',
    Mea: 'MEA'
} as const;
export type CreateAdCampaignDtoRegionsEnum = typeof CreateAdCampaignDtoRegionsEnum[keyof typeof CreateAdCampaignDtoRegionsEnum];

/**
 * @export
 */
export const CreateAdCampaignDtoPricingModelEnum = {
    Flat: 'flat',
    Cpm: 'cpm',
    Cpc: 'cpc'
} as const;
export type CreateAdCampaignDtoPricingModelEnum = typeof CreateAdCampaignDtoPricingModelEnum[keyof typeof CreateAdCampaignDtoPricingModelEnum];

/**
 * @export
 */
export const CreateAdCampaignDtoTypeEnum = {
    Commercial: 'commercial',
    Sponsorship: 'sponsorship'
} as const;
export type CreateAdCampaignDtoTypeEnum = typeof CreateAdCampaignDtoTypeEnum[keyof typeof CreateAdCampaignDtoTypeEnum];

/**
 * 
 * @export
 * @interface CreateAdminDto
 */
export interface CreateAdminDto {
    /**
     * 
     * @type {string}
     * @memberof CreateAdminDto
     */
    email: string;
    /**
     * 
     * @type {string}
     * @memberof CreateAdminDto
     */
    firstName: string;
    /**
     * 
     * @type {string}
     * @memberof CreateAdminDto
     */
    lastName: string;
    /**
     * Role IDs to assign
     * @type {Array<string>}
     * @memberof CreateAdminDto
     */
    roleIds: Array<string>;
}
/**
 * 
 * @export
 * @interface CreateAdvertiserDto
 */
export interface CreateAdvertiserDto {
    /**
     * 
     * @type {string}
     * @memberof CreateAdvertiserDto
     */
    name: string;
    /**
     * 
     * @type {string}
     * @memberof CreateAdvertiserDto
     */
    logoMediaId?: string | null;
    /**
     * 
     * @type {string}
     * @memberof CreateAdvertiserDto
     */
    website?: string | null;
    /**
     * 
     * @type {string}
     * @memberof CreateAdvertiserDto
     */
    contactName?: string | null;
    /**
     * 
     * @type {string}
     * @memberof CreateAdvertiserDto
     */
    contactEmail?: string | null;
    /**
     * 
     * @type {string}
     * @memberof CreateAdvertiserDto
     */
    billingEmail?: string | null;
    /**
     * 
     * @type {string}
     * @memberof CreateAdvertiserDto
     */
    currency?: string;
    /**
     * 
     * @type {string}
     * @memberof CreateAdvertiserDto
     */
    status?: CreateAdvertiserDtoStatusEnum;
    /**
     * 
     * @type {string}
     * @memberof CreateAdvertiserDto
     */
    notes?: string | null;
}


/**
 * @export
 */
export const CreateAdvertiserDtoStatusEnum = {
    Active: 'active',
    Paused: 'paused',
    Archived: 'archived'
} as const;
export type CreateAdvertiserDtoStatusEnum = typeof CreateAdvertiserDtoStatusEnum[keyof typeof CreateAdvertiserDtoStatusEnum];

/**
 * 
 * @export
 * @interface CreateBadgeDto
 */
export interface CreateBadgeDto {
    /**
     * 
     * @type {string}
     * @memberof CreateBadgeDto
     */
    name: string;
    /**
     * 
     * @type {string}
     * @memberof CreateBadgeDto
     */
    description?: string;
    /**
     * 
     * @type {string}
     * @memberof CreateBadgeDto
     */
    family?: CreateBadgeDtoFamilyEnum;
    /**
     * Game type this badge belongs to, if any
     * @type {string}
     * @memberof CreateBadgeDto
     */
    gameType?: string;
    /**
     * 
     * @type {number}
     * @memberof CreateBadgeDto
     */
    sortOrder?: number;
    /**
     * "direct" for level/quest-named badges with no metric trigger
     * @type {string}
     * @memberof CreateBadgeDto
     */
    awardedBy?: CreateBadgeDtoAwardedByEnum;
    /**
     * badge_trigger key (e.g. watch_streak_days) — required unless awardedBy is "direct"
     * @type {string}
     * @memberof CreateBadgeDto
     */
    triggerKey?: string;
    /**
     * 
     * @type {string}
     * @memberof CreateBadgeDto
     */
    operator?: CreateBadgeDtoOperatorEnum;
    /**
     * Threshold the metric is compared against
     * @type {number}
     * @memberof CreateBadgeDto
     */
    threshold?: number;
    /**
     * 
     * @type {number}
     * @memberof CreateBadgeDto
     */
    rewardPoints?: number;
    /**
     * Media id of the earned-state icon (upload via POST /v1/media/uploads, usageType "badge_icon")
     * @type {string}
     * @memberof CreateBadgeDto
     */
    activeIconMediaId?: string;
    /**
     * Media id of the locked-state icon
     * @type {string}
     * @memberof CreateBadgeDto
     */
    inactiveIconMediaId?: string;
}


/**
 * @export
 */
export const CreateBadgeDtoFamilyEnum = {
    Tier: 'tier',
    Achievement: 'achievement'
} as const;
export type CreateBadgeDtoFamilyEnum = typeof CreateBadgeDtoFamilyEnum[keyof typeof CreateBadgeDtoFamilyEnum];

/**
 * @export
 */
export const CreateBadgeDtoAwardedByEnum = {
    Trigger: 'trigger',
    Direct: 'direct',
    Both: 'both'
} as const;
export type CreateBadgeDtoAwardedByEnum = typeof CreateBadgeDtoAwardedByEnum[keyof typeof CreateBadgeDtoAwardedByEnum];

/**
 * @export
 */
export const CreateBadgeDtoOperatorEnum = {
    Gt: 'gt',
    Gte: 'gte',
    Eq: 'eq',
    Lt: 'lt',
    Lte: 'lte'
} as const;
export type CreateBadgeDtoOperatorEnum = typeof CreateBadgeDtoOperatorEnum[keyof typeof CreateBadgeDtoOperatorEnum];

/**
 * 
 * @export
 * @interface CreateCampaignDto
 */
export interface CreateCampaignDto {
    /**
     * 
     * @type {string}
     * @memberof CreateCampaignDto
     */
    title: string;
    /**
     * 
     * @type {string}
     * @memberof CreateCampaignDto
     */
    message: string;
    /**
     * In-app deep link
     * @type {string}
     * @memberof CreateCampaignDto
     */
    deepLink?: string;
    /**
     * 
     * @type {string}
     * @memberof CreateCampaignDto
     */
    category?: CreateCampaignDtoCategoryEnum;
    /**
     * all customers / a segment / selected users
     * @type {string}
     * @memberof CreateCampaignDto
     */
    targetType: CreateCampaignDtoTargetTypeEnum;
    /**
     * segment: {region}; selected: {userIds:[]}
     * @type {{ [key: string]: any; }}
     * @memberof CreateCampaignDto
     */
    targetFilter?: { [key: string]: any; };
    /**
     * Schedule for later (ISO); omit to keep as draft / send now
     * @type {string}
     * @memberof CreateCampaignDto
     */
    scheduledAt?: string;
}


/**
 * @export
 */
export const CreateCampaignDtoCategoryEnum = {
    NewContent: 'new_content',
    GameUpdate: 'game_update',
    Reward: 'reward',
    Social: 'social',
    Subscription: 'subscription',
    System: 'system',
    General: 'general'
} as const;
export type CreateCampaignDtoCategoryEnum = typeof CreateCampaignDtoCategoryEnum[keyof typeof CreateCampaignDtoCategoryEnum];

/**
 * @export
 */
export const CreateCampaignDtoTargetTypeEnum = {
    All: 'all',
    Segment: 'segment',
    Selected: 'selected'
} as const;
export type CreateCampaignDtoTargetTypeEnum = typeof CreateCampaignDtoTargetTypeEnum[keyof typeof CreateCampaignDtoTargetTypeEnum];

/**
 * 
 * @export
 * @interface CreateCommentDto
 */
export interface CreateCommentDto {
    /**
     * Trimmed; whitespace-only is rejected
     * @type {string}
     * @memberof CreateCommentDto
     */
    body: string;
}
/**
 * 
 * @export
 * @interface CreateContentDto
 */
export interface CreateContentDto {
    /**
     * 
     * @type {string}
     * @memberof CreateContentDto
     */
    title: string;
    /**
     * 
     * @type {string}
     * @memberof CreateContentDto
     */
    description?: string;
    /**
     * 
     * @type {string}
     * @memberof CreateContentDto
     */
    contentType?: CreateContentDtoContentTypeEnum;
    /**
     * 
     * @type {string}
     * @memberof CreateContentDto
     */
    accessTier?: CreateContentDtoAccessTierEnum;
    /**
     * Unlock cost when accessTier=exclusive
     * @type {number}
     * @memberof CreateContentDto
     */
    unlockPoints?: number;
    /**
     * Studio id; null clears (update). Use studioName for free text.
     * @type {string}
     * @memberof CreateContentDto
     */
    studioId?: string | null;
    /**
     * Free-text studio — find-or-create (case-insensitive). Not with studioId.
     * @type {string}
     * @memberof CreateContentDto
     */
    studioName?: string;
    /**
     * Manual duration override; null returns to the video media duration
     * @type {number}
     * @memberof CreateContentDto
     */
    durationSeconds?: number | null;
    /**
     * HLS video media id
     * @type {string}
     * @memberof CreateContentDto
     */
    videoMediaId?: string;
    /**
     * Primary thumbnail media id
     * @type {string}
     * @memberof CreateContentDto
     */
    thumbnailMediaId?: string;
    /**
     * 
     * @type {string}
     * @memberof CreateContentDto
     */
    language?: string;
    /**
     * 
     * @type {string}
     * @memberof CreateContentDto
     */
    rightsRegion?: CreateContentDtoRightsRegionEnum;
    /**
     * Primary title (for a BTS/clip)
     * @type {string}
     * @memberof CreateContentDto
     */
    parentContentId?: string;
    /**
     * 
     * @type {string}
     * @memberof CreateContentDto
     */
    recommendation?: CreateContentDtoRecommendationEnum;
    /**
     * Full genre set (≤10); replaces when present
     * @type {Array<string>}
     * @memberof CreateContentDto
     */
    genreIds?: Array<string>;
    /**
     * Must be one of genreIds
     * @type {string}
     * @memberof CreateContentDto
     */
    primaryGenreId?: string;
    /**
     * Full tag set (≤30); replaces when present
     * @type {Array<string>}
     * @memberof CreateContentDto
     */
    tagIds?: Array<string>;
    /**
     * Free-text tags (≤30) — find-or-create, merged with tagIds
     * @type {Array<string>}
     * @memberof CreateContentDto
     */
    tagNames?: Array<string>;
    /**
     * Full cast list (≤100); replaces when present
     * @type {Array<CastMemberInputDto>}
     * @memberof CreateContentDto
     */
    cast?: Array<CastMemberInputDto>;
    /**
     * "Where to watch" CTAs (≤3)
     * @type {Array<WatchLinkInputDto>}
     * @memberof CreateContentDto
     */
    watchLinks?: Array<WatchLinkInputDto>;
    /**
     * End of the live window; null clears
     * @type {string}
     * @memberof CreateContentDto
     */
    availableUntil?: string | null;
}


/**
 * @export
 */
export const CreateContentDtoContentTypeEnum = {
    Trailer: 'trailer',
    Bts: 'bts',
    Clip: 'clip'
} as const;
export type CreateContentDtoContentTypeEnum = typeof CreateContentDtoContentTypeEnum[keyof typeof CreateContentDtoContentTypeEnum];

/**
 * @export
 */
export const CreateContentDtoAccessTierEnum = {
    Free: 'free',
    Exclusive: 'exclusive'
} as const;
export type CreateContentDtoAccessTierEnum = typeof CreateContentDtoAccessTierEnum[keyof typeof CreateContentDtoAccessTierEnum];

/**
 * @export
 */
export const CreateContentDtoRightsRegionEnum = {
    Global: 'global',
    Na: 'NA',
    Eu: 'EU',
    Apac: 'APAC',
    Latam: 'LATAM',
    Mea: 'MEA'
} as const;
export type CreateContentDtoRightsRegionEnum = typeof CreateContentDtoRightsRegionEnum[keyof typeof CreateContentDtoRightsRegionEnum];

/**
 * @export
 */
export const CreateContentDtoRecommendationEnum = {
    Promoted: 'promoted',
    Normal: 'normal',
    Deprioritized: 'deprioritized'
} as const;
export type CreateContentDtoRecommendationEnum = typeof CreateContentDtoRecommendationEnum[keyof typeof CreateContentDtoRecommendationEnum];

/**
 * 
 * @export
 * @interface CreateGenreDto
 */
export interface CreateGenreDto {
    /**
     * 
     * @type {string}
     * @memberof CreateGenreDto
     */
    name: string;
    /**
     * 
     * @type {number}
     * @memberof CreateGenreDto
     */
    sortOrder?: number;
}
/**
 * 
 * @export
 * @interface CreateLedgerEntryDto
 */
export interface CreateLedgerEntryDto {
    /**
     * 
     * @type {string}
     * @memberof CreateLedgerEntryDto
     */
    advertiserId: string;
    /**
     * 
     * @type {string}
     * @memberof CreateLedgerEntryDto
     */
    campaignId?: string;
    /**
     * `accrued` is written by the nightly job only
     * @type {string}
     * @memberof CreateLedgerEntryDto
     */
    kind: CreateLedgerEntryDtoKindEnum;
    /**
     * 
     * @type {number}
     * @memberof CreateLedgerEntryDto
     */
    amountCents: number;
    /**
     * Defaults to the advertiser's currency
     * @type {string}
     * @memberof CreateLedgerEntryDto
     */
    currency?: string;
    /**
     * 
     * @type {string}
     * @memberof CreateLedgerEntryDto
     */
    entryDate?: string;
    /**
     * Required for invoiced
     * @type {string}
     * @memberof CreateLedgerEntryDto
     */
    invoiceNumber?: string;
    /**
     * 
     * @type {string}
     * @memberof CreateLedgerEntryDto
     */
    dueDate?: string;
    /**
     * Payment reference / PO
     * @type {string}
     * @memberof CreateLedgerEntryDto
     */
    reference?: string;
    /**
     * 
     * @type {string}
     * @memberof CreateLedgerEntryDto
     */
    note?: string;
}


/**
 * @export
 */
export const CreateLedgerEntryDtoKindEnum = {
    Booked: 'booked',
    Invoiced: 'invoiced',
    Paid: 'paid',
    Credit: 'credit'
} as const;
export type CreateLedgerEntryDtoKindEnum = typeof CreateLedgerEntryDtoKindEnum[keyof typeof CreateLedgerEntryDtoKindEnum];

/**
 * 
 * @export
 * @interface CreatePersonDto
 */
export interface CreatePersonDto {
    /**
     * 
     * @type {string}
     * @memberof CreatePersonDto
     */
    name: string;
    /**
     * 
     * @type {string}
     * @memberof CreatePersonDto
     */
    bio?: string;
    /**
     * Headshot media id
     * @type {string}
     * @memberof CreatePersonDto
     */
    photoMediaId?: string;
    /**
     * Person-level primary role (credit roles stay on content_cast)
     * @type {string}
     * @memberof CreatePersonDto
     */
    knownFor?: CreatePersonDtoKnownForEnum;
}


/**
 * @export
 */
export const CreatePersonDtoKnownForEnum = {
    Actor: 'actor',
    Director: 'director',
    Writer: 'writer',
    Producer: 'producer',
    Other: 'other'
} as const;
export type CreatePersonDtoKnownForEnum = typeof CreatePersonDtoKnownForEnum[keyof typeof CreatePersonDtoKnownForEnum];

/**
 * 
 * @export
 * @interface CreatePlanDto
 */
export interface CreatePlanDto {
    /**
     * 
     * @type {string}
     * @memberof CreatePlanDto
     */
    name: string;
    /**
     * 
     * @type {string}
     * @memberof CreatePlanDto
     */
    description?: string;
    /**
     * Base price in cents
     * @type {number}
     * @memberof CreatePlanDto
     */
    basePriceCents: number;
    /**
     * 
     * @type {string}
     * @memberof CreatePlanDto
     */
    baseCurrency?: string;
    /**
     * 
     * @type {string}
     * @memberof CreatePlanDto
     */
    interval: CreatePlanDtoIntervalEnum;
    /**
     * 
     * @type {number}
     * @memberof CreatePlanDto
     */
    trialDays?: number;
    /**
     * Feature bullet list
     * @type {Array<string>}
     * @memberof CreatePlanDto
     */
    features?: Array<string>;
    /**
     * 
     * @type {boolean}
     * @memberof CreatePlanDto
     */
    isPopular?: boolean;
    /**
     * 
     * @type {number}
     * @memberof CreatePlanDto
     */
    sortOrder?: number;
}


/**
 * @export
 */
export const CreatePlanDtoIntervalEnum = {
    Monthly: 'monthly',
    Yearly: 'yearly'
} as const;
export type CreatePlanDtoIntervalEnum = typeof CreatePlanDtoIntervalEnum[keyof typeof CreatePlanDtoIntervalEnum];

/**
 * 
 * @export
 * @interface CreatePredictionDto
 */
export interface CreatePredictionDto {
    /**
     * 
     * @type {string}
     * @memberof CreatePredictionDto
     */
    title?: string;
    /**
     * 
     * @type {string}
     * @memberof CreatePredictionDto
     */
    question: string;
    /**
     * 
     * @type {string}
     * @memberof CreatePredictionDto
     */
    description?: string;
    /**
     * Attach to a content
     * @type {string}
     * @memberof CreatePredictionDto
     */
    contentId?: string;
    /**
     * 
     * @type {string}
     * @memberof CreatePredictionDto
     */
    startAt: string;
    /**
     * 
     * @type {string}
     * @memberof CreatePredictionDto
     */
    endAt: string;
    /**
     * Flat reward if free prediction
     * @type {number}
     * @memberof CreatePredictionDto
     */
    rewardPoints?: number;
    /**
     * Points staked to enter (0 = free)
     * @type {number}
     * @memberof CreatePredictionDto
     */
    entryCostPoints?: number;
    /**
     * Correct payout = stake × multiplier
     * @type {number}
     * @memberof CreatePredictionDto
     */
    payoutMultiplier?: number;
    /**
     * 
     * @type {number}
     * @memberof CreatePredictionDto
     */
    unlockThresholdPoints?: number;
    /**
     * 
     * @type {Array<string>}
     * @memberof CreatePredictionDto
     */
    geofenceCountries?: Array<string>;
    /**
     * 
     * @type {string}
     * @memberof CreatePredictionDto
     */
    cadence?: CreatePredictionDtoCadenceEnum;
    /**
     * Cooling-off minutes between resolve preview and confirm
     * @type {number}
     * @memberof CreatePredictionDto
     */
    resolveHoldMinutes?: number;
    /**
     * Option labels
     * @type {Array<string>}
     * @memberof CreatePredictionDto
     */
    options: Array<string>;
}


/**
 * @export
 */
export const CreatePredictionDtoCadenceEnum = {
    Monthly: 'monthly',
    Quarterly: 'quarterly'
} as const;
export type CreatePredictionDtoCadenceEnum = typeof CreatePredictionDtoCadenceEnum[keyof typeof CreatePredictionDtoCadenceEnum];

/**
 * 
 * @export
 * @interface CreateQuestDto
 */
export interface CreateQuestDto {
    /**
     * 
     * @type {string}
     * @memberof CreateQuestDto
     */
    name: string;
    /**
     * 
     * @type {string}
     * @memberof CreateQuestDto
     */
    description?: string;
    /**
     * 
     * @type {number}
     * @memberof CreateQuestDto
     */
    rewardPoints?: number;
    /**
     * 
     * @type {string}
     * @memberof CreateQuestDto
     */
    startAt: string;
    /**
     * 
     * @type {string}
     * @memberof CreateQuestDto
     */
    endAt: string;
    /**
     * 
     * @type {number}
     * @memberof CreateQuestDto
     */
    unlockThresholdPoints?: number;
    /**
     * 
     * @type {string}
     * @memberof CreateQuestDto
     */
    bannerMediaId?: string;
    /**
     * 
     * @type {Array<string>}
     * @memberof CreateQuestDto
     */
    geofenceCountries?: Array<string>;
    /**
     * null/omitted = never auto-claims
     * @type {number}
     * @memberof CreateQuestDto
     */
    claimGraceDays?: number;
    /**
     * 
     * @type {Array<QuestActionDto>}
     * @memberof CreateQuestDto
     */
    actions?: Array<QuestActionDto>;
}
/**
 * 
 * @export
 * @interface CreateRoleDto
 */
export interface CreateRoleDto {
    /**
     * lowercase identifier
     * @type {string}
     * @memberof CreateRoleDto
     */
    name: string;
    /**
     * 
     * @type {string}
     * @memberof CreateRoleDto
     */
    description?: string;
    /**
     * 
     * @type {Array<string>}
     * @memberof CreateRoleDto
     */
    permissionNames: Array<string>;
}
/**
 * 
 * @export
 * @interface CreateStudioDto
 */
export interface CreateStudioDto {
    /**
     * 
     * @type {string}
     * @memberof CreateStudioDto
     */
    name: string;
    /**
     * 
     * @type {string}
     * @memberof CreateStudioDto
     */
    description?: string;
    /**
     * Logo media id
     * @type {string}
     * @memberof CreateStudioDto
     */
    logoMediaId?: string;
    /**
     * ISO-3166-1 alpha-2 country code (uppercased)
     * @type {string}
     * @memberof CreateStudioDto
     */
    countryCode?: string;
}
/**
 * 
 * @export
 * @interface CreateTagDto
 */
export interface CreateTagDto {
    /**
     * 
     * @type {string}
     * @memberof CreateTagDto
     */
    name: string;
}
/**
 * 
 * @export
 * @interface CurrencyDto
 */
export interface CurrencyDto {
    /**
     * ISO-4217 code
     * @type {string}
     * @memberof CurrencyDto
     */
    code: string;
    /**
     * 
     * @type {string}
     * @memberof CurrencyDto
     */
    name: string;
    /**
     * 
     * @type {string}
     * @memberof CurrencyDto
     */
    symbol: string;
    /**
     * Decimal places — 0 for JPY/KRW/VND/CLP
     * @type {number}
     * @memberof CurrencyDto
     */
    minorUnits: number;
}
/**
 * 
 * @export
 * @interface CustomerAuthControllerCheckUsernameV1200Response
 */
export interface CustomerAuthControllerCheckUsernameV1200Response {
    /**
     * 
     * @type {number}
     * @memberof CustomerAuthControllerCheckUsernameV1200Response
     */
    statusCode: number;
    /**
     * 
     * @type {string}
     * @memberof CustomerAuthControllerCheckUsernameV1200Response
     */
    status: string;
    /**
     * 
     * @type {string}
     * @memberof CustomerAuthControllerCheckUsernameV1200Response
     */
    message: string;
    /**
     * Error details, or null on success
     * @type {object}
     * @memberof CustomerAuthControllerCheckUsernameV1200Response
     */
    error: object | null;
    /**
     * 
     * @type {UsernameAvailableResponseDto}
     * @memberof CustomerAuthControllerCheckUsernameV1200Response
     */
    data?: UsernameAvailableResponseDto;
}
/**
 * 
 * @export
 * @interface CustomerAuthControllerCompleteProfileV1200Response
 */
export interface CustomerAuthControllerCompleteProfileV1200Response {
    /**
     * 
     * @type {number}
     * @memberof CustomerAuthControllerCompleteProfileV1200Response
     */
    statusCode: number;
    /**
     * 
     * @type {string}
     * @memberof CustomerAuthControllerCompleteProfileV1200Response
     */
    status: string;
    /**
     * 
     * @type {string}
     * @memberof CustomerAuthControllerCompleteProfileV1200Response
     */
    message: string;
    /**
     * Error details, or null on success
     * @type {object}
     * @memberof CustomerAuthControllerCompleteProfileV1200Response
     */
    error: object | null;
    /**
     * 
     * @type {UserResponseDto}
     * @memberof CustomerAuthControllerCompleteProfileV1200Response
     */
    data?: UserResponseDto;
}
/**
 * 
 * @export
 * @interface CustomerAuthControllerLogoutV1200Response
 */
export interface CustomerAuthControllerLogoutV1200Response {
    /**
     * 
     * @type {number}
     * @memberof CustomerAuthControllerLogoutV1200Response
     */
    statusCode: number;
    /**
     * 
     * @type {string}
     * @memberof CustomerAuthControllerLogoutV1200Response
     */
    status: string;
    /**
     * 
     * @type {string}
     * @memberof CustomerAuthControllerLogoutV1200Response
     */
    message: string;
    /**
     * Error details, or null on success
     * @type {object}
     * @memberof CustomerAuthControllerLogoutV1200Response
     */
    error: object | null;
    /**
     * 
     * @type {MessageResponseDto}
     * @memberof CustomerAuthControllerLogoutV1200Response
     */
    data?: MessageResponseDto;
}
/**
 * 
 * @export
 * @interface CustomerAuthControllerRefreshV1200Response
 */
export interface CustomerAuthControllerRefreshV1200Response {
    /**
     * 
     * @type {number}
     * @memberof CustomerAuthControllerRefreshV1200Response
     */
    statusCode: number;
    /**
     * 
     * @type {string}
     * @memberof CustomerAuthControllerRefreshV1200Response
     */
    status: string;
    /**
     * 
     * @type {string}
     * @memberof CustomerAuthControllerRefreshV1200Response
     */
    message: string;
    /**
     * Error details, or null on success
     * @type {object}
     * @memberof CustomerAuthControllerRefreshV1200Response
     */
    error: object | null;
    /**
     * 
     * @type {RefreshResponseDto}
     * @memberof CustomerAuthControllerRefreshV1200Response
     */
    data?: RefreshResponseDto;
}
/**
 * 
 * @export
 * @interface CustomerAuthControllerRequestPhoneOtpV1200Response
 */
export interface CustomerAuthControllerRequestPhoneOtpV1200Response {
    /**
     * 
     * @type {number}
     * @memberof CustomerAuthControllerRequestPhoneOtpV1200Response
     */
    statusCode: number;
    /**
     * 
     * @type {string}
     * @memberof CustomerAuthControllerRequestPhoneOtpV1200Response
     */
    status: string;
    /**
     * 
     * @type {string}
     * @memberof CustomerAuthControllerRequestPhoneOtpV1200Response
     */
    message: string;
    /**
     * Error details, or null on success
     * @type {object}
     * @memberof CustomerAuthControllerRequestPhoneOtpV1200Response
     */
    error: object | null;
    /**
     * 
     * @type {OtpDeliveryResponseDto}
     * @memberof CustomerAuthControllerRequestPhoneOtpV1200Response
     */
    data?: OtpDeliveryResponseDto;
}
/**
 * 
 * @export
 * @interface CustomerAuthControllerVerifyPhoneV1200Response
 */
export interface CustomerAuthControllerVerifyPhoneV1200Response {
    /**
     * 
     * @type {number}
     * @memberof CustomerAuthControllerVerifyPhoneV1200Response
     */
    statusCode: number;
    /**
     * 
     * @type {string}
     * @memberof CustomerAuthControllerVerifyPhoneV1200Response
     */
    status: string;
    /**
     * 
     * @type {string}
     * @memberof CustomerAuthControllerVerifyPhoneV1200Response
     */
    message: string;
    /**
     * Error details, or null on success
     * @type {object}
     * @memberof CustomerAuthControllerVerifyPhoneV1200Response
     */
    error: object | null;
    /**
     * 
     * @type {AuthResponseDto}
     * @memberof CustomerAuthControllerVerifyPhoneV1200Response
     */
    data?: AuthResponseDto;
}
/**
 * 
 * @export
 * @interface CustomerBadgeDto
 */
export interface CustomerBadgeDto {
    /**
     * 
     * @type {string}
     * @memberof CustomerBadgeDto
     */
    id: string;
    /**
     * 
     * @type {string}
     * @memberof CustomerBadgeDto
     */
    name: string;
    /**
     * 
     * @type {string}
     * @memberof CustomerBadgeDto
     */
    slug: string;
    /**
     * 
     * @type {string}
     * @memberof CustomerBadgeDto
     */
    description?: string | null;
    /**
     * 
     * @type {string}
     * @memberof CustomerBadgeDto
     */
    family: CustomerBadgeDtoFamilyEnum;
    /**
     * 
     * @type {string}
     * @memberof CustomerBadgeDto
     */
    gameType?: string | null;
    /**
     * 
     * @type {number}
     * @memberof CustomerBadgeDto
     */
    sortOrder: number;
    /**
     * 
     * @type {string}
     * @memberof CustomerBadgeDto
     */
    awardedBy: CustomerBadgeDtoAwardedByEnum;
    /**
     * 
     * @type {string}
     * @memberof CustomerBadgeDto
     */
    triggerKey?: string | null;
    /**
     * 
     * @type {string}
     * @memberof CustomerBadgeDto
     */
    operator?: string | null;
    /**
     * 
     * @type {number}
     * @memberof CustomerBadgeDto
     */
    threshold?: number | null;
    /**
     * 
     * @type {number}
     * @memberof CustomerBadgeDto
     */
    rewardPoints: number;
    /**
     * 
     * @type {boolean}
     * @memberof CustomerBadgeDto
     */
    isActive: boolean;
    /**
     * 
     * @type {number}
     * @memberof CustomerBadgeDto
     */
    earnedCount: number;
    /**
     * 
     * @type {string}
     * @memberof CustomerBadgeDto
     */
    activeIconMediaId?: string | null;
    /**
     * 
     * @type {string}
     * @memberof CustomerBadgeDto
     */
    inactiveIconMediaId?: string | null;
    /**
     * CDN URL of the earned-state icon (null until the asset is ready)
     * @type {string}
     * @memberof CustomerBadgeDto
     */
    activeIconUrl?: string | null;
    /**
     * CDN URL of the locked-state icon
     * @type {string}
     * @memberof CustomerBadgeDto
     */
    inactiveIconUrl?: string | null;
    /**
     * Whether the caller has earned this badge
     * @type {boolean}
     * @memberof CustomerBadgeDto
     */
    earned: boolean;
}


/**
 * @export
 */
export const CustomerBadgeDtoFamilyEnum = {
    Tier: 'tier',
    Achievement: 'achievement'
} as const;
export type CustomerBadgeDtoFamilyEnum = typeof CustomerBadgeDtoFamilyEnum[keyof typeof CustomerBadgeDtoFamilyEnum];

/**
 * @export
 */
export const CustomerBadgeDtoAwardedByEnum = {
    Trigger: 'trigger',
    Direct: 'direct',
    Both: 'both'
} as const;
export type CustomerBadgeDtoAwardedByEnum = typeof CustomerBadgeDtoAwardedByEnum[keyof typeof CustomerBadgeDtoAwardedByEnum];

/**
 * 
 * @export
 * @interface CustomerPlanDto
 */
export interface CustomerPlanDto {
    /**
     * 
     * @type {string}
     * @memberof CustomerPlanDto
     */
    id: string;
    /**
     * 
     * @type {string}
     * @memberof CustomerPlanDto
     */
    name: string;
    /**
     * 
     * @type {string}
     * @memberof CustomerPlanDto
     */
    description?: string | null;
    /**
     * 
     * @type {number}
     * @memberof CustomerPlanDto
     */
    basePriceCents: number;
    /**
     * 
     * @type {string}
     * @memberof CustomerPlanDto
     */
    baseCurrency: string;
    /**
     * 
     * @type {string}
     * @memberof CustomerPlanDto
     */
    interval: CustomerPlanDtoIntervalEnum;
    /**
     * 
     * @type {number}
     * @memberof CustomerPlanDto
     */
    trialDays: number;
    /**
     * 
     * @type {Array<string>}
     * @memberof CustomerPlanDto
     */
    features: Array<string>;
    /**
     * 
     * @type {boolean}
     * @memberof CustomerPlanDto
     */
    isActive: boolean;
    /**
     * 
     * @type {boolean}
     * @memberof CustomerPlanDto
     */
    isPopular: boolean;
    /**
     * 
     * @type {number}
     * @memberof CustomerPlanDto
     */
    sortOrder: number;
    /**
     * Price resolved for the caller's region
     * @type {object}
     * @memberof CustomerPlanDto
     */
    price: object;
}


/**
 * @export
 */
export const CustomerPlanDtoIntervalEnum = {
    Monthly: 'monthly',
    Yearly: 'yearly'
} as const;
export type CustomerPlanDtoIntervalEnum = typeof CustomerPlanDtoIntervalEnum[keyof typeof CustomerPlanDtoIntervalEnum];

/**
 * 
 * @export
 * @interface CustomerReportDto
 */
export interface CustomerReportDto {
    /**
     * 
     * @type {string}
     * @memberof CustomerReportDto
     */
    reason: CustomerReportDtoReasonEnum;
    /**
     * 
     * @type {string}
     * @memberof CustomerReportDto
     */
    note?: string;
}


/**
 * @export
 */
export const CustomerReportDtoReasonEnum = {
    HateSpeech: 'hate_speech',
    Spam: 'spam',
    Nudity: 'nudity',
    Violence: 'violence',
    Harassment: 'harassment',
    Other: 'other',
    NuditySexual: 'nudity_sexual',
    ViolenceGore: 'violence_gore',
    HarassmentBullying: 'harassment_bullying'
} as const;
export type CustomerReportDtoReasonEnum = typeof CustomerReportDtoReasonEnum[keyof typeof CustomerReportDtoReasonEnum];

/**
 * 
 * @export
 * @interface DailyLoginResultDto
 */
export interface DailyLoginResultDto {
    /**
     * Points credited (0 if already claimed today)
     * @type {number}
     * @memberof DailyLoginResultDto
     */
    points: number;
    /**
     * XP credited (0 if already claimed today)
     * @type {number}
     * @memberof DailyLoginResultDto
     */
    xp: number;
    /**
     * True if the bonus was already claimed today
     * @type {boolean}
     * @memberof DailyLoginResultDto
     */
    alreadyClaimed: boolean;
}
/**
 * 
 * @export
 * @interface DashboardOverviewDto
 */
export interface DashboardOverviewDto {
    /**
     * 
     * @type {number}
     * @memberof DashboardOverviewDto
     */
    totalCustomers: number;
    /**
     * Logged in within 30 days
     * @type {number}
     * @memberof DashboardOverviewDto
     */
    activeCustomers: number;
    /**
     * 
     * @type {number}
     * @memberof DashboardOverviewDto
     */
    activeSubscriptions: number;
    /**
     * Sum of active subscription amounts (cents)
     * @type {number}
     * @memberof DashboardOverviewDto
     */
    mrrCents: number;
    /**
     * Sum of paid invoices (cents)
     * @type {number}
     * @memberof DashboardOverviewDto
     */
    grossRevenueCents: number;
    /**
     * Lifetime points earned
     * @type {number}
     * @memberof DashboardOverviewDto
     */
    pointsIssued: number;
    /**
     * Lifetime points spent
     * @type {number}
     * @memberof DashboardOverviewDto
     */
    pointsSpent: number;
    /**
     * Points currently held in wallets
     * @type {number}
     * @memberof DashboardOverviewDto
     */
    pointsOutstanding: number;
    /**
     * 
     * @type {number}
     * @memberof DashboardOverviewDto
     */
    publishedContent: number;
    /**
     * 
     * @type {number}
     * @memberof DashboardOverviewDto
     */
    totalRedemptions: number;
    /**
     * 
     * @type {number}
     * @memberof DashboardOverviewDto
     */
    activeQuests: number;
    /**
     * 
     * @type {number}
     * @memberof DashboardOverviewDto
     */
    openPredictions: number;
    /**
     * 
     * @type {number}
     * @memberof DashboardOverviewDto
     */
    openAuctions: number;
    /**
     * 
     * @type {number}
     * @memberof DashboardOverviewDto
     */
    openModerationTickets: number;
}
/**
 * 
 * @export
 * @interface DeletedDto
 */
export interface DeletedDto {
    /**
     * 
     * @type {boolean}
     * @memberof DeletedDto
     */
    deleted: boolean;
}
/**
 * 
 * @export
 * @interface DeliveryDto
 */
export interface DeliveryDto {
    /**
     * 
     * @type {number}
     * @memberof DeliveryDto
     */
    impressions: number;
    /**
     * 
     * @type {number}
     * @memberof DeliveryDto
     */
    uniqueViewers: number;
    /**
     * 
     * @type {number}
     * @memberof DeliveryDto
     */
    clicks: number;
    /**
     * 
     * @type {number}
     * @memberof DeliveryDto
     */
    skips: number;
    /**
     * 
     * @type {number}
     * @memberof DeliveryDto
     */
    completes: number;
    /**
     * CPM/CPC value delivered (cents)
     * @type {number}
     * @memberof DeliveryDto
     */
    deliveredCents: number;
    /**
     * 
     * @type {number}
     * @memberof DeliveryDto
     */
    ctr: number;
    /**
     * 
     * @type {number}
     * @memberof DeliveryDto
     */
    completionRate: number;
}
/**
 * 
 * @export
 * @interface DeviceControllerListV1200Response
 */
export interface DeviceControllerListV1200Response {
    /**
     * 
     * @type {number}
     * @memberof DeviceControllerListV1200Response
     */
    statusCode: number;
    /**
     * 
     * @type {string}
     * @memberof DeviceControllerListV1200Response
     */
    status: string;
    /**
     * 
     * @type {string}
     * @memberof DeviceControllerListV1200Response
     */
    message: string;
    /**
     * Error details, or null on success
     * @type {object}
     * @memberof DeviceControllerListV1200Response
     */
    error: object | null;
    /**
     * 
     * @type {Array<DeviceListItemDto>}
     * @memberof DeviceControllerListV1200Response
     */
    data?: Array<DeviceListItemDto>;
}
/**
 * 
 * @export
 * @interface DeviceControllerRegisterV1200Response
 */
export interface DeviceControllerRegisterV1200Response {
    /**
     * 
     * @type {number}
     * @memberof DeviceControllerRegisterV1200Response
     */
    statusCode: number;
    /**
     * 
     * @type {string}
     * @memberof DeviceControllerRegisterV1200Response
     */
    status: string;
    /**
     * 
     * @type {string}
     * @memberof DeviceControllerRegisterV1200Response
     */
    message: string;
    /**
     * Error details, or null on success
     * @type {object}
     * @memberof DeviceControllerRegisterV1200Response
     */
    error: object | null;
    /**
     * 
     * @type {DeviceResponseDto}
     * @memberof DeviceControllerRegisterV1200Response
     */
    data?: DeviceResponseDto;
}
/**
 * 
 * @export
 * @interface DeviceListItemDto
 */
export interface DeviceListItemDto {
    /**
     * 
     * @type {string}
     * @memberof DeviceListItemDto
     */
    id: string;
    /**
     * 
     * @type {string}
     * @memberof DeviceListItemDto
     */
    platform: DeviceListItemDtoPlatformEnum;
    /**
     * 
     * @type {string}
     * @memberof DeviceListItemDto
     */
    deviceId?: string | null;
    /**
     * 
     * @type {string}
     * @memberof DeviceListItemDto
     */
    appVersion?: string | null;
    /**
     * 
     * @type {boolean}
     * @memberof DeviceListItemDto
     */
    isActive: boolean;
    /**
     * 
     * @type {string}
     * @memberof DeviceListItemDto
     */
    lastSeenAt?: string | null;
    /**
     * 
     * @type {string}
     * @memberof DeviceListItemDto
     */
    createdAt: string;
}


/**
 * @export
 */
export const DeviceListItemDtoPlatformEnum = {
    Ios: 'ios',
    Android: 'android',
    Web: 'web'
} as const;
export type DeviceListItemDtoPlatformEnum = typeof DeviceListItemDtoPlatformEnum[keyof typeof DeviceListItemDtoPlatformEnum];

/**
 * 
 * @export
 * @interface DeviceResponseDto
 */
export interface DeviceResponseDto {
    /**
     * 
     * @type {string}
     * @memberof DeviceResponseDto
     */
    id: string;
    /**
     * 
     * @type {string}
     * @memberof DeviceResponseDto
     */
    platform: DeviceResponseDtoPlatformEnum;
}


/**
 * @export
 */
export const DeviceResponseDtoPlatformEnum = {
    Ios: 'ios',
    Android: 'android',
    Web: 'web'
} as const;
export type DeviceResponseDtoPlatformEnum = typeof DeviceResponseDtoPlatformEnum[keyof typeof DeviceResponseDtoPlatformEnum];

/**
 * 
 * @export
 * @interface EarnRuleDto
 */
export interface EarnRuleDto {
    /**
     * 
     * @type {string}
     * @memberof EarnRuleDto
     */
    ruleKey: string;
    /**
     * 
     * @type {string}
     * @memberof EarnRuleDto
     */
    name: string;
    /**
     * 
     * @type {string}
     * @memberof EarnRuleDto
     */
    description?: string | null;
    /**
     * 
     * @type {{ [key: string]: any; }}
     * @memberof EarnRuleDto
     */
    config: { [key: string]: any; };
}
/**
 * 
 * @export
 * @interface EarnSourceDto
 */
export interface EarnSourceDto {
    /**
     * 
     * @type {string}
     * @memberof EarnSourceDto
     */
    kind: EarnSourceDtoKindEnum;
    /**
     * 
     * @type {number}
     * @memberof EarnSourceDto
     */
    points: number;
}


/**
 * @export
 */
export const EarnSourceDtoKindEnum = {
    DailyStreak: 'daily_streak',
    Quest: 'quest',
    Prediction: 'prediction',
    Bidding: 'bidding'
} as const;
export type EarnSourceDtoKindEnum = typeof EarnSourceDtoKindEnum[keyof typeof EarnSourceDtoKindEnum];

/**
 * 
 * @export
 * @interface EarnedBadgeDto
 */
export interface EarnedBadgeDto {
    /**
     * 
     * @type {string}
     * @memberof EarnedBadgeDto
     */
    id: string;
    /**
     * 
     * @type {string}
     * @memberof EarnedBadgeDto
     */
    name: string;
    /**
     * 
     * @type {string}
     * @memberof EarnedBadgeDto
     */
    slug: string;
    /**
     * 
     * @type {string}
     * @memberof EarnedBadgeDto
     */
    description?: string | null;
    /**
     * 
     * @type {string}
     * @memberof EarnedBadgeDto
     */
    family: EarnedBadgeDtoFamilyEnum;
    /**
     * 
     * @type {string}
     * @memberof EarnedBadgeDto
     */
    gameType?: string | null;
    /**
     * 
     * @type {number}
     * @memberof EarnedBadgeDto
     */
    sortOrder: number;
    /**
     * 
     * @type {string}
     * @memberof EarnedBadgeDto
     */
    awardedBy: EarnedBadgeDtoAwardedByEnum;
    /**
     * 
     * @type {string}
     * @memberof EarnedBadgeDto
     */
    triggerKey?: string | null;
    /**
     * 
     * @type {string}
     * @memberof EarnedBadgeDto
     */
    operator?: string | null;
    /**
     * 
     * @type {number}
     * @memberof EarnedBadgeDto
     */
    threshold?: number | null;
    /**
     * 
     * @type {number}
     * @memberof EarnedBadgeDto
     */
    rewardPoints: number;
    /**
     * 
     * @type {boolean}
     * @memberof EarnedBadgeDto
     */
    isActive: boolean;
    /**
     * 
     * @type {number}
     * @memberof EarnedBadgeDto
     */
    earnedCount: number;
    /**
     * 
     * @type {string}
     * @memberof EarnedBadgeDto
     */
    activeIconMediaId?: string | null;
    /**
     * 
     * @type {string}
     * @memberof EarnedBadgeDto
     */
    inactiveIconMediaId?: string | null;
    /**
     * CDN URL of the earned-state icon (null until the asset is ready)
     * @type {string}
     * @memberof EarnedBadgeDto
     */
    activeIconUrl?: string | null;
    /**
     * CDN URL of the locked-state icon
     * @type {string}
     * @memberof EarnedBadgeDto
     */
    inactiveIconUrl?: string | null;
    /**
     * 
     * @type {string}
     * @memberof EarnedBadgeDto
     */
    earnedAt: string;
}


/**
 * @export
 */
export const EarnedBadgeDtoFamilyEnum = {
    Tier: 'tier',
    Achievement: 'achievement'
} as const;
export type EarnedBadgeDtoFamilyEnum = typeof EarnedBadgeDtoFamilyEnum[keyof typeof EarnedBadgeDtoFamilyEnum];

/**
 * @export
 */
export const EarnedBadgeDtoAwardedByEnum = {
    Trigger: 'trigger',
    Direct: 'direct',
    Both: 'both'
} as const;
export type EarnedBadgeDtoAwardedByEnum = typeof EarnedBadgeDtoAwardedByEnum[keyof typeof EarnedBadgeDtoAwardedByEnum];

/**
 * 
 * @export
 * @interface EarningControllerDailyLoginV1200Response
 */
export interface EarningControllerDailyLoginV1200Response {
    /**
     * 
     * @type {number}
     * @memberof EarningControllerDailyLoginV1200Response
     */
    statusCode: number;
    /**
     * 
     * @type {string}
     * @memberof EarningControllerDailyLoginV1200Response
     */
    status: string;
    /**
     * 
     * @type {string}
     * @memberof EarningControllerDailyLoginV1200Response
     */
    message: string;
    /**
     * Error details, or null on success
     * @type {object}
     * @memberof EarningControllerDailyLoginV1200Response
     */
    error: object | null;
    /**
     * 
     * @type {DailyLoginResultDto}
     * @memberof EarningControllerDailyLoginV1200Response
     */
    data?: DailyLoginResultDto;
}
/**
 * 
 * @export
 * @interface EarnsControllerOverviewV1200Response
 */
export interface EarnsControllerOverviewV1200Response {
    /**
     * 
     * @type {number}
     * @memberof EarnsControllerOverviewV1200Response
     */
    statusCode: number;
    /**
     * 
     * @type {string}
     * @memberof EarnsControllerOverviewV1200Response
     */
    status: string;
    /**
     * 
     * @type {string}
     * @memberof EarnsControllerOverviewV1200Response
     */
    message: string;
    /**
     * Error details, or null on success
     * @type {object}
     * @memberof EarnsControllerOverviewV1200Response
     */
    error: object | null;
    /**
     * 
     * @type {EarnsOverviewResponseDto}
     * @memberof EarnsControllerOverviewV1200Response
     */
    data?: EarnsOverviewResponseDto;
}
/**
 * 
 * @export
 * @interface EarnsOverviewResponseDto
 */
export interface EarnsOverviewResponseDto {
    /**
     * 
     * @type {WalletResponseDto}
     * @memberof EarnsOverviewResponseDto
     */
    standing: WalletResponseDto;
    /**
     * 
     * @type {Array<EarnSourceDto>}
     * @memberof EarnsOverviewResponseDto
     */
    sources: Array<EarnSourceDto>;
}
/**
 * 
 * @export
 * @interface EconomyWeekDto
 */
export interface EconomyWeekDto {
    /**
     * 
     * @type {string}
     * @memberof EconomyWeekDto
     */
    period: string;
    /**
     * 
     * @type {string}
     * @memberof EconomyWeekDto
     */
    weekStart: string;
    /**
     * 
     * @type {number}
     * @memberof EconomyWeekDto
     */
    distributed: number;
    /**
     * 
     * @type {number}
     * @memberof EconomyWeekDto
     */
    redeemed: number;
}
/**
 * 
 * @export
 * @interface EnforceCommentAuthorDto
 */
export interface EnforceCommentAuthorDto {
    /**
     * 
     * @type {string}
     * @memberof EnforceCommentAuthorDto
     */
    action: EnforceCommentAuthorDtoActionEnum;
    /**
     * Shown to the user for warn; stored on the enforcement record
     * @type {string}
     * @memberof EnforceCommentAuthorDto
     */
    reason: string;
    /**
     * suspend only — ISO end time (default now + 7 days)
     * @type {string}
     * @memberof EnforceCommentAuthorDto
     */
    suspendUntil?: string;
    /**
     * Hide the comment too (default: true for suspend/ban, false for warn)
     * @type {boolean}
     * @memberof EnforceCommentAuthorDto
     */
    hideComment?: boolean;
}


/**
 * @export
 */
export const EnforceCommentAuthorDtoActionEnum = {
    Warn: 'warn',
    Suspend: 'suspend',
    Ban: 'ban'
} as const;
export type EnforceCommentAuthorDtoActionEnum = typeof EnforceCommentAuthorDtoActionEnum[keyof typeof EnforceCommentAuthorDtoActionEnum];

/**
 * 
 * @export
 * @interface EnforceResultDto
 */
export interface EnforceResultDto {
    /**
     * 
     * @type {string}
     * @memberof EnforceResultDto
     */
    commentId: string;
    /**
     * 
     * @type {string}
     * @memberof EnforceResultDto
     */
    userId: string;
    /**
     * 
     * @type {string}
     * @memberof EnforceResultDto
     */
    action: EnforceResultDtoActionEnum;
    /**
     * 
     * @type {string}
     * @memberof EnforceResultDto
     */
    expiresAt?: string | null;
    /**
     * 
     * @type {string}
     * @memberof EnforceResultDto
     */
    commentStatus: EnforceResultDtoCommentStatusEnum;
    /**
     * Pending reports marked actioned
     * @type {number}
     * @memberof EnforceResultDto
     */
    reportsActioned: number;
    /**
     * Moderation ticket resolved
     * @type {string}
     * @memberof EnforceResultDto
     */
    ticketId?: string | null;
}


/**
 * @export
 */
export const EnforceResultDtoActionEnum = {
    Warn: 'warn',
    Suspend: 'suspend',
    Ban: 'ban'
} as const;
export type EnforceResultDtoActionEnum = typeof EnforceResultDtoActionEnum[keyof typeof EnforceResultDtoActionEnum];

/**
 * @export
 */
export const EnforceResultDtoCommentStatusEnum = {
    Visible: 'visible',
    Hidden: 'hidden',
    Deleted: 'deleted'
} as const;
export type EnforceResultDtoCommentStatusEnum = typeof EnforceResultDtoCommentStatusEnum[keyof typeof EnforceResultDtoCommentStatusEnum];

/**
 * 
 * @export
 * @interface EnforcementDto
 */
export interface EnforcementDto {
    /**
     * 
     * @type {string}
     * @memberof EnforcementDto
     */
    id: string;
    /**
     * 
     * @type {string}
     * @memberof EnforcementDto
     */
    action: string;
    /**
     * 
     * @type {string}
     * @memberof EnforcementDto
     */
    reason?: string | null;
    /**
     * 
     * @type {string}
     * @memberof EnforcementDto
     */
    expiresAt?: string | null;
    /**
     * 
     * @type {string}
     * @memberof EnforcementDto
     */
    performedBy?: string | null;
    /**
     * 
     * @type {string}
     * @memberof EnforcementDto
     */
    createdAt: string;
}
/**
 * 
 * @export
 * @interface EnforcementResponseDto
 */
export interface EnforcementResponseDto {
    /**
     * 
     * @type {string}
     * @memberof EnforcementResponseDto
     */
    id: string;
    /**
     * 
     * @type {string}
     * @memberof EnforcementResponseDto
     */
    action: EnforcementResponseDtoActionEnum;
    /**
     * 
     * @type {string}
     * @memberof EnforcementResponseDto
     */
    reason: string | null;
    /**
     * 
     * @type {string}
     * @memberof EnforcementResponseDto
     */
    expiresAt: string | null;
    /**
     * 
     * @type {string}
     * @memberof EnforcementResponseDto
     */
    performedBy: string | null;
    /**
     * 
     * @type {string}
     * @memberof EnforcementResponseDto
     */
    createdAt: string;
}


/**
 * @export
 */
export const EnforcementResponseDtoActionEnum = {
    Suspend: 'suspend',
    Ban: 'ban',
    Reinstate: 'reinstate',
    Disable: 'disable',
    Enable: 'enable'
} as const;
export type EnforcementResponseDtoActionEnum = typeof EnforcementResponseDtoActionEnum[keyof typeof EnforcementResponseDtoActionEnum];

/**
 * 
 * @export
 * @interface EnforcementResultDto
 */
export interface EnforcementResultDto {
    /**
     * 
     * @type {string}
     * @memberof EnforcementResultDto
     */
    action: EnforcementResultDtoActionEnum;
    /**
     * 
     * @type {string}
     * @memberof EnforcementResultDto
     */
    expiresAt?: string | null;
}


/**
 * @export
 */
export const EnforcementResultDtoActionEnum = {
    Warn: 'warn',
    Suspend: 'suspend',
    Ban: 'ban'
} as const;
export type EnforcementResultDtoActionEnum = typeof EnforcementResultDtoActionEnum[keyof typeof EnforcementResultDtoActionEnum];

/**
 * 
 * @export
 * @interface EnterPredictionDto
 */
export interface EnterPredictionDto {
    /**
     * The option you predict
     * @type {string}
     * @memberof EnterPredictionDto
     */
    optionId: string;
}
/**
 * 
 * @export
 * @interface EntitlementDto
 */
export interface EntitlementDto {
    /**
     * 
     * @type {string}
     * @memberof EntitlementDto
     */
    contentId: string;
    /**
     * 
     * @type {string}
     * @memberof EntitlementDto
     */
    accessTier: EntitlementDtoAccessTierEnum;
    /**
     * Points required to unlock (0 for free)
     * @type {number}
     * @memberof EntitlementDto
     */
    unlockPoints: number;
    /**
     * True if exclusive and not yet unlocked by the caller
     * @type {boolean}
     * @memberof EntitlementDto
     */
    isLocked: boolean;
    /**
     * 
     * @type {boolean}
     * @memberof EntitlementDto
     */
    isUnlocked: boolean;
}


/**
 * @export
 */
export const EntitlementDtoAccessTierEnum = {
    Free: 'free',
    Exclusive: 'exclusive'
} as const;
export type EntitlementDtoAccessTierEnum = typeof EntitlementDtoAccessTierEnum[keyof typeof EntitlementDtoAccessTierEnum];

/**
 * 
 * @export
 * @interface EventCatalogItemDto
 */
export interface EventCatalogItemDto {
    /**
     * 
     * @type {AppEventName}
     * @memberof EventCatalogItemDto
     */
    name: AppEventName;
    /**
     * 
     * @type {AppEventType}
     * @memberof EventCatalogItemDto
     */
    type: AppEventType;
}


/**
 * 
 * @export
 * @interface EventItemDto
 */
export interface EventItemDto {
    /**
     * Canonical event (backend-owned catalog)
     * @type {AppEventName}
     * @memberof EventItemDto
     */
    eventName: AppEventName;
    /**
     * Content context, if any
     * @type {string}
     * @memberof EventItemDto
     */
    contentId?: string;
    /**
     * 
     * @type {string}
     * @memberof EventItemDto
     */
    sessionId?: string;
    /**
     * Arbitrary event payload
     * @type {{ [key: string]: any; }}
     * @memberof EventItemDto
     */
    properties?: { [key: string]: any; };
    /**
     * 
     * @type {string}
     * @memberof EventItemDto
     */
    occurredAt: string;
}


/**
 * 
 * @export
 * @interface EventRecordDto
 */
export interface EventRecordDto {
    /**
     * 
     * @type {string}
     * @memberof EventRecordDto
     */
    id: string;
    /**
     * Actor user id; null for anonymous
     * @type {string}
     * @memberof EventRecordDto
     */
    userId: string | null;
    /**
     * Category, derived from the event name
     * @type {string}
     * @memberof EventRecordDto
     */
    eventType: string;
    /**
     * Canonical event name
     * @type {string}
     * @memberof EventRecordDto
     */
    eventName: string;
    /**
     * Content context, if any
     * @type {string}
     * @memberof EventRecordDto
     */
    contentId: string | null;
    /**
     * Arbitrary event payload
     * @type {{ [key: string]: any; }}
     * @memberof EventRecordDto
     */
    properties: { [key: string]: any; };
    /**
     * Originating platform (ios/android/web)
     * @type {string}
     * @memberof EventRecordDto
     */
    platform: string | null;
    /**
     * When the event occurred (ISO)
     * @type {string}
     * @memberof EventRecordDto
     */
    occurredAt: string;
}
/**
 * 
 * @export
 * @interface EventVolumeDto
 */
export interface EventVolumeDto {
    /**
     * Category of the event
     * @type {string}
     * @memberof EventVolumeDto
     */
    eventType: string;
    /**
     * Canonical event name
     * @type {string}
     * @memberof EventVolumeDto
     */
    eventName: string;
    /**
     * Number of occurrences in the window
     * @type {number}
     * @memberof EventVolumeDto
     */
    count: number;
}
/**
 * 
 * @export
 * @interface EventsControllerIngestV1200Response
 */
export interface EventsControllerIngestV1200Response {
    /**
     * 
     * @type {number}
     * @memberof EventsControllerIngestV1200Response
     */
    accepted?: number;
}
/**
 * 
 * @export
 * @interface FavoriteGenreDto
 */
export interface FavoriteGenreDto {
    /**
     * 
     * @type {string}
     * @memberof FavoriteGenreDto
     */
    genreId: string;
    /**
     * 
     * @type {string}
     * @memberof FavoriteGenreDto
     */
    name: string;
    /**
     * User's watch seconds attributed to the genre
     * @type {number}
     * @memberof FavoriteGenreDto
     */
    watchSeconds: number;
    /**
     * % of genre-attributed watch time
     * @type {number}
     * @memberof FavoriteGenreDto
     */
    percent: number;
}
/**
 * 
 * @export
 * @interface FeedAdDto
 */
export interface FeedAdDto {
    /**
     * Legacy commercial sponsorship
     * @type {string}
     * @memberof FeedAdDto
     */
    sponsorshipId?: string | null;
    /**
     * Commercial campaign → GET /v1/ads/commercials/:campaignId for the creative
     * @type {string}
     * @memberof FeedAdDto
     */
    campaignId?: string | null;
    /**
     * 
     * @type {string}
     * @memberof FeedAdDto
     */
    sponsorName: string;
    /**
     * 
     * @type {string}
     * @memberof FeedAdDto
     */
    bannerUrl?: string | null;
    /**
     * 
     * @type {string}
     * @memberof FeedAdDto
     */
    clickUrl?: string | null;
    /**
     * 
     * @type {string}
     * @memberof FeedAdDto
     */
    ctaLabel?: string | null;
    /**
     * 
     * @type {number}
     * @memberof FeedAdDto
     */
    adDurationSeconds: number;
    /**
     * 
     * @type {number}
     * @memberof FeedAdDto
     */
    skippableAfterSeconds?: number | null;
}
/**
 * 
 * @export
 * @interface ForgotPasswordDto
 */
export interface ForgotPasswordDto {
    /**
     * 
     * @type {string}
     * @memberof ForgotPasswordDto
     */
    email: string;
}
/**
 * 
 * @export
 * @interface FunnelDto
 */
export interface FunnelDto {
    /**
     * 
     * @type {number}
     * @memberof FunnelDto
     */
    signups: number;
    /**
     * 
     * @type {number}
     * @memberof FunnelDto
     */
    firstSession: number;
    /**
     * 
     * @type {number}
     * @memberof FunnelDto
     */
    engaged: number;
    /**
     * 
     * @type {number}
     * @memberof FunnelDto
     */
    subscribed: number;
    /**
     * 
     * @type {number}
     * @memberof FunnelDto
     */
    referred: number;
}
/**
 * 
 * @export
 * @interface GameAnalyticsDto
 */
export interface GameAnalyticsDto {
    /**
     * 
     * @type {number}
     * @memberof GameAnalyticsDto
     */
    questsTotal: number;
    /**
     * 
     * @type {number}
     * @memberof GameAnalyticsDto
     */
    questsActive: number;
    /**
     * 
     * @type {number}
     * @memberof GameAnalyticsDto
     */
    questParticipants: number;
    /**
     * 
     * @type {number}
     * @memberof GameAnalyticsDto
     */
    predictionsTotal: number;
    /**
     * 
     * @type {number}
     * @memberof GameAnalyticsDto
     */
    predictionsOpen: number;
    /**
     * 
     * @type {number}
     * @memberof GameAnalyticsDto
     */
    predictionEntries: number;
    /**
     * 
     * @type {number}
     * @memberof GameAnalyticsDto
     */
    auctionsTotal: number;
    /**
     * 
     * @type {number}
     * @memberof GameAnalyticsDto
     */
    auctionsOpen: number;
    /**
     * 
     * @type {number}
     * @memberof GameAnalyticsDto
     */
    bidsTotal: number;
    /**
     * 
     * @type {number}
     * @memberof GameAnalyticsDto
     */
    activeStreakers: number;
}
/**
 * 
 * @export
 * @interface GameInstanceDto
 */
export interface GameInstanceDto {
    /**
     * 
     * @type {string}
     * @memberof GameInstanceDto
     */
    type: GameInstanceDtoTypeEnum;
    /**
     * 
     * @type {string}
     * @memberof GameInstanceDto
     */
    id: string;
    /**
     * 
     * @type {string}
     * @memberof GameInstanceDto
     */
    title?: string | null;
    /**
     * 
     * @type {string}
     * @memberof GameInstanceDto
     */
    status?: string | null;
    /**
     * Creation timestamp
     * @type {string}
     * @memberof GameInstanceDto
     */
    createdAt?: string | null;
}


/**
 * @export
 */
export const GameInstanceDtoTypeEnum = {
    Quest: 'quest',
    Prediction: 'prediction',
    Auction: 'auction'
} as const;
export type GameInstanceDtoTypeEnum = typeof GameInstanceDtoTypeEnum[keyof typeof GameInstanceDtoTypeEnum];

/**
 * 
 * @export
 * @interface GameInstancesListDto
 */
export interface GameInstancesListDto {
    /**
     * 
     * @type {Array<GameInstanceDto>}
     * @memberof GameInstancesListDto
     */
    items: Array<GameInstanceDto>;
    /**
     * 
     * @type {PaginationDetailsDto}
     * @memberof GameInstancesListDto
     */
    pagination: PaginationDetailsDto;
}
/**
 * 
 * @export
 * @interface GameTypesSummaryDto
 */
export interface GameTypesSummaryDto {
    /**
     * 
     * @type {number}
     * @memberof GameTypesSummaryDto
     */
    quest_total: number;
    /**
     * 
     * @type {number}
     * @memberof GameTypesSummaryDto
     */
    quest_active: number;
    /**
     * 
     * @type {number}
     * @memberof GameTypesSummaryDto
     */
    prediction_total: number;
    /**
     * 
     * @type {number}
     * @memberof GameTypesSummaryDto
     */
    prediction_active: number;
    /**
     * 
     * @type {number}
     * @memberof GameTypesSummaryDto
     */
    auction_total: number;
    /**
     * 
     * @type {number}
     * @memberof GameTypesSummaryDto
     */
    auction_active: number;
    /**
     * Fixed autonomous type
     * @type {number}
     * @memberof GameTypesSummaryDto
     */
    daily_streak_total: number;
    /**
     * Fixed autonomous type
     * @type {number}
     * @memberof GameTypesSummaryDto
     */
    shared_content_total: number;
}
/**
 * 
 * @export
 * @interface GamificationDataDto
 */
export interface GamificationDataDto {
    /**
     * 
     * @type {number}
     * @memberof GamificationDataDto
     */
    earnedPerUserDay: number;
    /**
     * 
     * @type {number}
     * @memberof GamificationDataDto
     */
    redemptionPct: number;
    /**
     * 
     * @type {number}
     * @memberof GamificationDataDto
     */
    pointsOutstanding: number;
    /**
     * 
     * @type {number}
     * @memberof GamificationDataDto
     */
    streakAvgDays: number;
    /**
     * 
     * @type {number}
     * @memberof GamificationDataDto
     */
    streakLongestDays: number;
    /**
     * 
     * @type {number}
     * @memberof GamificationDataDto
     */
    leaderboardChecksPerWeek: number;
    /**
     * 
     * @type {number}
     * @memberof GamificationDataDto
     */
    rankChangeAvgWeek: number;
    /**
     * 
     * @type {number}
     * @memberof GamificationDataDto
     */
    challengeParticipationPct: number;
    /**
     * 
     * @type {number}
     * @memberof GamificationDataDto
     */
    challengeCompletionPct: number;
    /**
     * 
     * @type {Array<SourceSliceDto>}
     * @memberof GamificationDataDto
     */
    earnedBySource: Array<SourceSliceDto>;
    /**
     * 
     * @type {Array<BucketPctDto>}
     * @memberof GamificationDataDto
     */
    balanceBuckets: Array<BucketPctDto>;
    /**
     * 
     * @type {Array<EconomyWeekDto>}
     * @memberof GamificationDataDto
     */
    economyTrend: Array<EconomyWeekDto>;
    /**
     * 
     * @type {Array<RedemptionWeekDto>}
     * @memberof GamificationDataDto
     */
    redemptionTrend: Array<RedemptionWeekDto>;
}
/**
 * 
 * @export
 * @interface GenreListResponseDto
 */
export interface GenreListResponseDto {
    /**
     * 
     * @type {Array<AdminGenreResponseDto>}
     * @memberof GenreListResponseDto
     */
    items: Array<AdminGenreResponseDto>;
    /**
     * 
     * @type {TaxonomySummaryDto}
     * @memberof GenreListResponseDto
     */
    summary: TaxonomySummaryDto;
}
/**
 * 
 * @export
 * @interface GenreResponseDto
 */
export interface GenreResponseDto {
    /**
     * 
     * @type {string}
     * @memberof GenreResponseDto
     */
    id: string;
    /**
     * 
     * @type {string}
     * @memberof GenreResponseDto
     */
    name: string;
    /**
     * 
     * @type {string}
     * @memberof GenreResponseDto
     */
    slug: string;
    /**
     * 
     * @type {boolean}
     * @memberof GenreResponseDto
     */
    isActive: boolean;
    /**
     * 
     * @type {number}
     * @memberof GenreResponseDto
     */
    sortOrder: number;
}
/**
 * 
 * @export
 * @interface GraphsDataDto
 */
export interface GraphsDataDto {
    /**
     * 
     * @type {RetentionDto}
     * @memberof GraphsDataDto
     */
    retention: RetentionDto;
    /**
     * 
     * @type {Array<KFactorPointDto>}
     * @memberof GraphsDataDto
     */
    kFactor: Array<KFactorPointDto>;
    /**
     * 
     * @type {Array<VelocityPointDto>}
     * @memberof GraphsDataDto
     */
    velocity: Array<VelocityPointDto>;
}
/**
 * 
 * @export
 * @interface HeartbeatDto
 */
export interface HeartbeatDto {
    /**
     * Seconds actually watched this session
     * @type {number}
     * @memberof HeartbeatDto
     */
    watchedSeconds: number;
    /**
     * Current playhead position (seconds)
     * @type {number}
     * @memberof HeartbeatDto
     */
    positionSeconds: number;
    /**
     * 
     * @type {number}
     * @memberof HeartbeatDto
     */
    completionPercent?: number;
    /**
     * 
     * @type {boolean}
     * @memberof HeartbeatDto
     */
    completed?: boolean;
}
/**
 * 
 * @export
 * @interface IngestEventsDto
 */
export interface IngestEventsDto {
    /**
     * 
     * @type {string}
     * @memberof IngestEventsDto
     */
    platform?: IngestEventsDtoPlatformEnum;
    /**
     * Batch of events (≤200)
     * @type {Array<EventItemDto>}
     * @memberof IngestEventsDto
     */
    events: Array<EventItemDto>;
}


/**
 * @export
 */
export const IngestEventsDtoPlatformEnum = {
    Ios: 'ios',
    Android: 'android',
    Web: 'web'
} as const;
export type IngestEventsDtoPlatformEnum = typeof IngestEventsDtoPlatformEnum[keyof typeof IngestEventsDtoPlatformEnum];

/**
 * 
 * @export
 * @interface IngestResultDto
 */
export interface IngestResultDto {
    /**
     * Number of events accepted
     * @type {number}
     * @memberof IngestResultDto
     */
    accepted: number;
}
/**
 * 
 * @export
 * @interface IngestSocialMentionsDto
 */
export interface IngestSocialMentionsDto {
    /**
     * Batch (≤ 500)
     * @type {Array<SocialMentionInputDto>}
     * @memberof IngestSocialMentionsDto
     */
    mentions: Array<SocialMentionInputDto>;
}
/**
 * 
 * @export
 * @interface IngestWatchEventsDto
 */
export interface IngestWatchEventsDto {
    /**
     * The view/session these events belong to
     * @type {string}
     * @memberof IngestWatchEventsDto
     */
    viewId?: string;
    /**
     * Batch of events (≤100)
     * @type {Array<WatchEventItemDto>}
     * @memberof IngestWatchEventsDto
     */
    events: Array<WatchEventItemDto>;
}
/**
 * 
 * @export
 * @interface InvoiceDto
 */
export interface InvoiceDto {
    /**
     * 
     * @type {string}
     * @memberof InvoiceDto
     */
    id: string;
    /**
     * 
     * @type {string}
     * @memberof InvoiceDto
     */
    subscriptionId?: string | null;
    /**
     * 
     * @type {string}
     * @memberof InvoiceDto
     */
    invoiceNumber: string;
    /**
     * 
     * @type {number}
     * @memberof InvoiceDto
     */
    amountCents: number;
    /**
     * 
     * @type {string}
     * @memberof InvoiceDto
     */
    currency: string;
    /**
     * 
     * @type {string}
     * @memberof InvoiceDto
     */
    status: string;
    /**
     * 
     * @type {string}
     * @memberof InvoiceDto
     */
    paymentMethod?: string | null;
    /**
     * 
     * @type {string}
     * @memberof InvoiceDto
     */
    billedAt: string;
    /**
     * 
     * @type {string}
     * @memberof InvoiceDto
     */
    paidAt?: string | null;
    /**
     * 
     * @type {string}
     * @memberof InvoiceDto
     */
    refundedAt?: string | null;
}
/**
 * 
 * @export
 * @interface KFactorPointDto
 */
export interface KFactorPointDto {
    /**
     * 
     * @type {string}
     * @memberof KFactorPointDto
     */
    month: string;
    /**
     * 
     * @type {number}
     * @memberof KFactorPointDto
     */
    k: number;
    /**
     * 
     * @type {number}
     * @memberof KFactorPointDto
     */
    referred: number;
    /**
     * 
     * @type {number}
     * @memberof KFactorPointDto
     */
    organic: number;
}
/**
 * 
 * @export
 * @interface LeaderboardControllerGetV1200Response
 */
export interface LeaderboardControllerGetV1200Response {
    /**
     * 
     * @type {number}
     * @memberof LeaderboardControllerGetV1200Response
     */
    statusCode: number;
    /**
     * 
     * @type {string}
     * @memberof LeaderboardControllerGetV1200Response
     */
    status: string;
    /**
     * 
     * @type {string}
     * @memberof LeaderboardControllerGetV1200Response
     */
    message: string;
    /**
     * Error details, or null on success
     * @type {object}
     * @memberof LeaderboardControllerGetV1200Response
     */
    error: object | null;
    /**
     * 
     * @type {LeaderboardResponseDto}
     * @memberof LeaderboardControllerGetV1200Response
     */
    data?: LeaderboardResponseDto;
}
/**
 * 
 * @export
 * @interface LeaderboardControllerMeV1200Response
 */
export interface LeaderboardControllerMeV1200Response {
    /**
     * 
     * @type {number}
     * @memberof LeaderboardControllerMeV1200Response
     */
    statusCode: number;
    /**
     * 
     * @type {string}
     * @memberof LeaderboardControllerMeV1200Response
     */
    status: string;
    /**
     * 
     * @type {string}
     * @memberof LeaderboardControllerMeV1200Response
     */
    message: string;
    /**
     * Error details, or null on success
     * @type {object}
     * @memberof LeaderboardControllerMeV1200Response
     */
    error: object | null;
    /**
     * 
     * @type {MyRankDto}
     * @memberof LeaderboardControllerMeV1200Response
     */
    data?: MyRankDto;
}
/**
 * 
 * @export
 * @interface LeaderboardRankDto
 */
export interface LeaderboardRankDto {
    /**
     * My global rank (1-based)
     * @type {number}
     * @memberof LeaderboardRankDto
     */
    rank: number;
    /**
     * Spendable points balance (the ranking basis)
     * @type {number}
     * @memberof LeaderboardRankDto
     */
    pointsBalance: number;
}
/**
 * 
 * @export
 * @interface LeaderboardResponseDto
 */
export interface LeaderboardResponseDto {
    /**
     * 
     * @type {Array<LeaderboardRowDto>}
     * @memberof LeaderboardResponseDto
     */
    items: Array<LeaderboardRowDto>;
    /**
     * 
     * @type {PaginationDetailsDto}
     * @memberof LeaderboardResponseDto
     */
    pagination: PaginationDetailsDto;
    /**
     * Caller’s rank (null if unranked — zero balance)
     * @type {MyRankDto}
     * @memberof LeaderboardResponseDto
     */
    myRank?: MyRankDto | null;
}
/**
 * 
 * @export
 * @interface LeaderboardRowDto
 */
export interface LeaderboardRowDto {
    /**
     * 
     * @type {number}
     * @memberof LeaderboardRowDto
     */
    rank: number;
    /**
     * 
     * @type {string}
     * @memberof LeaderboardRowDto
     */
    userId: string;
    /**
     * 
     * @type {string}
     * @memberof LeaderboardRowDto
     */
    username?: string | null;
    /**
     * 
     * @type {string}
     * @memberof LeaderboardRowDto
     */
    firstName?: string | null;
    /**
     * 
     * @type {string}
     * @memberof LeaderboardRowDto
     */
    avatarUrl?: string | null;
    /**
     * 
     * @type {number}
     * @memberof LeaderboardRowDto
     */
    pointsBalance: number;
    /**
     * Rank change since the last Monday snapshot
     * @type {number}
     * @memberof LeaderboardRowDto
     */
    rankDelta?: number | null;
}
/**
 * 
 * @export
 * @interface LedgerEntryDto
 */
export interface LedgerEntryDto {
    /**
     * 
     * @type {string}
     * @memberof LedgerEntryDto
     */
    id: string;
    /**
     * 
     * @type {string}
     * @memberof LedgerEntryDto
     */
    currency: string;
    /**
     * Signed amount
     * @type {number}
     * @memberof LedgerEntryDto
     */
    amount: number;
    /**
     * 
     * @type {number}
     * @memberof LedgerEntryDto
     */
    balanceAfter: number;
    /**
     * 
     * @type {string}
     * @memberof LedgerEntryDto
     */
    direction: string;
    /**
     * 
     * @type {string}
     * @memberof LedgerEntryDto
     */
    sourceType: string;
    /**
     * 
     * @type {string}
     * @memberof LedgerEntryDto
     */
    sourceId?: string | null;
    /**
     * 
     * @type {string}
     * @memberof LedgerEntryDto
     */
    note?: string | null;
    /**
     * 
     * @type {string}
     * @memberof LedgerEntryDto
     */
    createdAt: string;
}
/**
 * 
 * @export
 * @interface LedgerTotalsDto
 */
export interface LedgerTotalsDto {
    /**
     * 
     * @type {number}
     * @memberof LedgerTotalsDto
     */
    bookedCents: number;
    /**
     * 
     * @type {number}
     * @memberof LedgerTotalsDto
     */
    accruedCents: number;
    /**
     * 
     * @type {number}
     * @memberof LedgerTotalsDto
     */
    invoicedCents: number;
    /**
     * 
     * @type {number}
     * @memberof LedgerTotalsDto
     */
    paidCents: number;
    /**
     * 
     * @type {number}
     * @memberof LedgerTotalsDto
     */
    creditCents: number;
    /**
     * booked + accrued − credit
     * @type {number}
     * @memberof LedgerTotalsDto
     */
    revenueCents: number;
    /**
     * Outstanding receivable: booked + accrued − paid − credit
     * @type {number}
     * @memberof LedgerTotalsDto
     */
    balanceCents: number;
}
/**
 * 
 * @export
 * @interface LibraryBtsUpsellDto
 */
export interface LibraryBtsUpsellDto {
    /**
     * 
     * @type {number}
     * @memberof LibraryBtsUpsellDto
     */
    parentViewers: number;
    /**
     * 
     * @type {number}
     * @memberof LibraryBtsUpsellDto
     */
    btsViewers: number;
    /**
     * 0..1
     * @type {number}
     * @memberof LibraryBtsUpsellDto
     */
    ctr: number;
}
/**
 * 
 * @export
 * @interface LibraryDailyPointDto
 */
export interface LibraryDailyPointDto {
    /**
     * UTC day
     * @type {string}
     * @memberof LibraryDailyPointDto
     */
    date: string;
    /**
     * 
     * @type {number}
     * @memberof LibraryDailyPointDto
     */
    gameConversionPct: number;
    /**
     * Uses the pro-rated `dailyHitThreshold`, not the window `hitThreshold`
     * @type {number}
     * @memberof LibraryDailyPointDto
     */
    hitRatePct: number;
    /**
     * 
     * @type {number}
     * @memberof LibraryDailyPointDto
     */
    engagementRate: number;
}
/**
 * 
 * @export
 * @interface LibraryFunnelDto
 */
export interface LibraryFunnelDto {
    /**
     * 
     * @type {number}
     * @memberof LibraryFunnelDto
     */
    viewers: number;
    /**
     * Viewers who reacted, commented or shared in the window (saves excluded, unlike engagementRate)
     * @type {number}
     * @memberof LibraryFunnelDto
     */
    engaged: number;
    /**
     * 
     * @type {number}
     * @memberof LibraryFunnelDto
     */
    gamePlayers: number;
    /**
     * Viewers who unlocked content in the window
     * @type {number}
     * @memberof LibraryFunnelDto
     */
    unlockers: number;
    /**
     * Unique users with any view started in the window — the only stage that counts uncounted views
     * @type {number}
     * @memberof LibraryFunnelDto
     */
    impressions: number;
    /**
     * Unique users with ≥ 3 watched seconds
     * @type {number}
     * @memberof LibraryFunnelDto
     */
    watched3s: number;
    /**
     * Unique users with ≥ 50 % completion
     * @type {number}
     * @memberof LibraryFunnelDto
     */
    watched50pct: number;
    /**
     * Unique users who joined a game linked to a content they viewed
     * @type {number}
     * @memberof LibraryFunnelDto
     */
    gameStarted: number;
    /**
     * Of those: completed a quest, won an auction, or got a prediction right
     * @type {number}
     * @memberof LibraryFunnelDto
     */
    gameCompleted: number;
    /**
     * Unique users who shared
     * @type {number}
     * @memberof LibraryFunnelDto
     */
    shared: number;
}
/**
 * 
 * @export
 * @interface LibraryGameConversionDto
 */
export interface LibraryGameConversionDto {
    /**
     * 
     * @type {number}
     * @memberof LibraryGameConversionDto
     */
    viewers: number;
    /**
     * Viewers who joined a game linked to content they watched
     * @type {number}
     * @memberof LibraryGameConversionDto
     */
    players: number;
    /**
     * 0..100
     * @type {number}
     * @memberof LibraryGameConversionDto
     */
    percent: number;
}
/**
 * 
 * @export
 * @interface LibraryHitRateDto
 */
export interface LibraryHitRateDto {
    /**
     * 
     * @type {number}
     * @memberof LibraryHitRateDto
     */
    threshold: number;
    /**
     * 
     * @type {number}
     * @memberof LibraryHitRateDto
     */
    publishedTitles: number;
    /**
     * Published titles with ≥ threshold views in the window
     * @type {number}
     * @memberof LibraryHitRateDto
     */
    hits: number;
    /**
     * 0..100
     * @type {number}
     * @memberof LibraryHitRateDto
     */
    percent: number;
}
/**
 * 
 * @export
 * @interface LibraryPreviousDto
 */
export interface LibraryPreviousDto {
    /**
     * 
     * @type {number}
     * @memberof LibraryPreviousDto
     */
    avgWatchSeconds: number;
    /**
     * Includes saves, same as totals.engagementRate
     * @type {number}
     * @memberof LibraryPreviousDto
     */
    engagementRate: number;
    /**
     * 
     * @type {number}
     * @memberof LibraryPreviousDto
     */
    gameConversionPct: number;
    /**
     * 
     * @type {number}
     * @memberof LibraryPreviousDto
     */
    hitRatePct: number;
    /**
     * 0..1 ratio, not a percent
     * @type {number}
     * @memberof LibraryPreviousDto
     */
    btsCtr: number;
}
/**
 * 
 * @export
 * @interface LibraryRegionDto
 */
export interface LibraryRegionDto {
    /**
     * users.region ('unknown' when unset)
     * @type {string}
     * @memberof LibraryRegionDto
     */
    region: string;
    /**
     * 
     * @type {number}
     * @memberof LibraryRegionDto
     */
    views: number;
    /**
     * 
     * @type {number}
     * @memberof LibraryRegionDto
     */
    watchSeconds: number;
    /**
     * 
     * @type {number}
     * @memberof LibraryRegionDto
     */
    avgWatchSeconds: number;
}
/**
 * 
 * @export
 * @interface LibraryRevenueAttributionDto
 */
export interface LibraryRevenueAttributionDto {
    /**
     * Active licence revenue pro-rated to the window by term overlap. Carries no region, so `?region=` does not apply.
     * @type {number}
     * @memberof LibraryRevenueAttributionDto
     */
    licenseRevenueCents: number;
    /**
     * Active sponsorship revenue, pro-rated the same way; also region-agnostic
     * @type {number}
     * @memberof LibraryRevenueAttributionDto
     */
    sponsorshipRevenueCents: number;
    /**
     * CPM impressions + CPC clicks on ad_events in the window; region filter uses ad_events.region
     * @type {number}
     * @memberof LibraryRevenueAttributionDto
     */
    adsRevenueCents: number;
    /**
     * Subscription invoices paid in the window
     * @type {number}
     * @memberof LibraryRevenueAttributionDto
     */
    subsRevenueCents: number;
    /**
     * Points spent on unlocks in the window
     * @type {number}
     * @memberof LibraryRevenueAttributionDto
     */
    unlockPointsSpent: number;
}
/**
 * 
 * @export
 * @interface LibrarySentimentDto
 */
export interface LibrarySentimentDto {
    /**
     * 
     * @type {number}
     * @memberof LibrarySentimentDto
     */
    likes: number;
    /**
     * 
     * @type {number}
     * @memberof LibrarySentimentDto
     */
    dislikes: number;
    /**
     * likes / (likes + dislikes), 0..1
     * @type {number}
     * @memberof LibrarySentimentDto
     */
    positiveRatio: number;
    /**
     * likes / (likes + dislikes + comments) × 100
     * @type {number}
     * @memberof LibrarySentimentDto
     */
    positivePct: number;
    /**
     * comments / base × 100 — engagement with no stated valence. Not NLP sentiment.
     * @type {number}
     * @memberof LibrarySentimentDto
     */
    neutralPct: number;
    /**
     * dislikes / base × 100. The three sum to exactly 100 (or all 0 when there is no signal).
     * @type {number}
     * @memberof LibrarySentimentDto
     */
    negativePct: number;
}
/**
 * 
 * @export
 * @interface LibraryShareHourDto
 */
export interface LibraryShareHourDto {
    /**
     * ISO-8601 UTC bucket start
     * @type {string}
     * @memberof LibraryShareHourDto
     */
    hour: string;
    /**
     * 
     * @type {number}
     * @memberof LibraryShareHourDto
     */
    shares: number;
}
/**
 * 
 * @export
 * @interface LibraryShareVelocityDto
 */
export interface LibraryShareVelocityDto {
    /**
     * Shares in the 24h before `to`
     * @type {number}
     * @memberof LibraryShareVelocityDto
     */
    last24h: number;
    /**
     * 
     * @type {number}
     * @memberof LibraryShareVelocityDto
     */
    prev24h: number;
    /**
     * 
     * @type {number}
     * @memberof LibraryShareVelocityDto
     */
    changePct: number;
    /**
     * Exactly 24 zero-filled buckets, oldest first, anchored on `to` (not now)
     * @type {Array<LibraryShareHourDto>}
     * @memberof LibraryShareVelocityDto
     */
    hourly: Array<LibraryShareHourDto>;
}
/**
 * 
 * @export
 * @interface LibraryTopContentDto
 */
export interface LibraryTopContentDto {
    /**
     * 
     * @type {string}
     * @memberof LibraryTopContentDto
     */
    id: string;
    /**
     * 
     * @type {string}
     * @memberof LibraryTopContentDto
     */
    title: string;
    /**
     * 
     * @type {string}
     * @memberof LibraryTopContentDto
     */
    contentType: string;
    /**
     * 
     * @type {number}
     * @memberof LibraryTopContentDto
     */
    views: number;
    /**
     * 
     * @type {number}
     * @memberof LibraryTopContentDto
     */
    uniqueViewers: number;
    /**
     * 
     * @type {number}
     * @memberof LibraryTopContentDto
     */
    watchSeconds: number;
    /**
     * 
     * @type {number}
     * @memberof LibraryTopContentDto
     */
    avgCompletion: number;
}
/**
 * 
 * @export
 * @interface LibraryTotalsDto
 */
export interface LibraryTotalsDto {
    /**
     * 
     * @type {number}
     * @memberof LibraryTotalsDto
     */
    views: number;
    /**
     * 
     * @type {number}
     * @memberof LibraryTotalsDto
     */
    uniqueViewers: number;
    /**
     * 
     * @type {number}
     * @memberof LibraryTotalsDto
     */
    watchSeconds: number;
    /**
     * 
     * @type {number}
     * @memberof LibraryTotalsDto
     */
    avgWatchSeconds: number;
    /**
     * Average completion % across sessions
     * @type {number}
     * @memberof LibraryTotalsDto
     */
    avgCompletion: number;
    /**
     * 
     * @type {number}
     * @memberof LibraryTotalsDto
     */
    likes: number;
    /**
     * 
     * @type {number}
     * @memberof LibraryTotalsDto
     */
    comments: number;
    /**
     * 
     * @type {number}
     * @memberof LibraryTotalsDto
     */
    shares: number;
    /**
     * Titles added to a watchlist in the window
     * @type {number}
     * @memberof LibraryTotalsDto
     */
    saves: number;
    /**
     * (likes + comments + shares + saves) / views × 100
     * @type {number}
     * @memberof LibraryTotalsDto
     */
    engagementRate: number;
    /**
     * Mean duration of published titles with a known duration. Catalog property — neither windowed nor region-scoped.
     * @type {number}
     * @memberof LibraryTotalsDto
     */
    avgDurationSeconds: number;
}
/**
 * 
 * @export
 * @interface LicenseAgreementDto
 */
export interface LicenseAgreementDto {
    /**
     * 
     * @type {string}
     * @memberof LicenseAgreementDto
     */
    licenseId: string;
    /**
     * 
     * @type {string}
     * @memberof LicenseAgreementDto
     */
    contentId: string;
    /**
     * 
     * @type {string}
     * @memberof LicenseAgreementDto
     */
    title: string;
    /**
     * 
     * @type {string}
     * @memberof LicenseAgreementDto
     */
    thumbnailUrl?: string | null;
    /**
     * 
     * @type {string}
     * @memberof LicenseAgreementDto
     */
    licensorName: string;
    /**
     * 
     * @type {string}
     * @memberof LicenseAgreementDto
     */
    licenseType: LicenseAgreementDtoLicenseTypeEnum;
    /**
     * 
     * @type {string}
     * @memberof LicenseAgreementDto
     */
    startsAt?: string | null;
    /**
     * 
     * @type {string}
     * @memberof LicenseAgreementDto
     */
    expiresAt?: string | null;
    /**
     * Negative when already expired
     * @type {number}
     * @memberof LicenseAgreementDto
     */
    daysLeft?: number | null;
    /**
     * 
     * @type {string}
     * @memberof LicenseAgreementDto
     */
    renewalStatus: string;
    /**
     * 
     * @type {number}
     * @memberof LicenseAgreementDto
     */
    licenseCostCents: number;
    /**
     * 
     * @type {number}
     * @memberof LicenseAgreementDto
     */
    revenueGeneratedCents: number;
    /**
     * 
     * @type {string}
     * @memberof LicenseAgreementDto
     */
    revenueSource?: string | null;
    /**
     * 
     * @type {string}
     * @memberof LicenseAgreementDto
     */
    currency: string;
    /**
     * revenue / cost
     * @type {number}
     * @memberof LicenseAgreementDto
     */
    roi?: number | null;
    /**
     * 
     * @type {number}
     * @memberof LicenseAgreementDto
     */
    views: number;
    /**
     * 
     * @type {string}
     * @memberof LicenseAgreementDto
     */
    terms?: string | null;
}


/**
 * @export
 */
export const LicenseAgreementDtoLicenseTypeEnum = {
    Exclusive: 'exclusive',
    NonExclusive: 'non_exclusive'
} as const;
export type LicenseAgreementDtoLicenseTypeEnum = typeof LicenseAgreementDtoLicenseTypeEnum[keyof typeof LicenseAgreementDtoLicenseTypeEnum];

/**
 * 
 * @export
 * @interface LicenseDto
 */
export interface LicenseDto {
    /**
     * 
     * @type {string}
     * @memberof LicenseDto
     */
    licensorName: string;
    /**
     * 
     * @type {string}
     * @memberof LicenseDto
     */
    licenseType?: LicenseDtoLicenseTypeEnum;
    /**
     * 
     * @type {string}
     * @memberof LicenseDto
     */
    startsAt?: string;
    /**
     * 
     * @type {string}
     * @memberof LicenseDto
     */
    expiresAt?: string;
    /**
     * 
     * @type {string}
     * @memberof LicenseDto
     */
    renewalStatus?: LicenseDtoRenewalStatusEnum;
    /**
     * License cost in cents
     * @type {number}
     * @memberof LicenseDto
     */
    licenseCostCents?: number;
    /**
     * 
     * @type {string}
     * @memberof LicenseDto
     */
    currency?: string;
    /**
     * Attributed revenue in cents
     * @type {number}
     * @memberof LicenseDto
     */
    revenueGeneratedCents?: number;
    /**
     * 
     * @type {string}
     * @memberof LicenseDto
     */
    revenueSource?: string;
    /**
     * 
     * @type {string}
     * @memberof LicenseDto
     */
    terms?: string;
}


/**
 * @export
 */
export const LicenseDtoLicenseTypeEnum = {
    Exclusive: 'exclusive',
    NonExclusive: 'non_exclusive'
} as const;
export type LicenseDtoLicenseTypeEnum = typeof LicenseDtoLicenseTypeEnum[keyof typeof LicenseDtoLicenseTypeEnum];

/**
 * @export
 */
export const LicenseDtoRenewalStatusEnum = {
    Renewing: 'renewing',
    InNegotiation: 'in_negotiation',
    Expiring: 'expiring',
    Lapsed: 'lapsed',
    AutoRenew: 'auto_renew'
} as const;
export type LicenseDtoRenewalStatusEnum = typeof LicenseDtoRenewalStatusEnum[keyof typeof LicenseDtoRenewalStatusEnum];

/**
 * 
 * @export
 * @interface LicenseResponseDto
 */
export interface LicenseResponseDto {
    /**
     * 
     * @type {string}
     * @memberof LicenseResponseDto
     */
    id: string;
    /**
     * 
     * @type {string}
     * @memberof LicenseResponseDto
     */
    contentId: string;
    /**
     * 
     * @type {string}
     * @memberof LicenseResponseDto
     */
    licensorName: string;
    /**
     * 
     * @type {string}
     * @memberof LicenseResponseDto
     */
    licenseType: LicenseResponseDtoLicenseTypeEnum;
    /**
     * 
     * @type {string}
     * @memberof LicenseResponseDto
     */
    startsAt?: string | null;
    /**
     * 
     * @type {string}
     * @memberof LicenseResponseDto
     */
    expiresAt?: string | null;
    /**
     * 
     * @type {string}
     * @memberof LicenseResponseDto
     */
    renewalStatus: LicenseResponseDtoRenewalStatusEnum;
    /**
     * License cost in cents
     * @type {number}
     * @memberof LicenseResponseDto
     */
    licenseCostCents: number;
    /**
     * 
     * @type {string}
     * @memberof LicenseResponseDto
     */
    currency: string;
    /**
     * Attributed revenue in cents
     * @type {number}
     * @memberof LicenseResponseDto
     */
    revenueGeneratedCents: number;
    /**
     * 
     * @type {string}
     * @memberof LicenseResponseDto
     */
    revenueSource?: string | null;
    /**
     * 
     * @type {string}
     * @memberof LicenseResponseDto
     */
    terms?: string | null;
    /**
     * 
     * @type {boolean}
     * @memberof LicenseResponseDto
     */
    isActive: boolean;
    /**
     * 
     * @type {string}
     * @memberof LicenseResponseDto
     */
    createdBy?: string | null;
    /**
     * 
     * @type {string}
     * @memberof LicenseResponseDto
     */
    createdAt: string;
    /**
     * 
     * @type {string}
     * @memberof LicenseResponseDto
     */
    updatedAt: string;
}


/**
 * @export
 */
export const LicenseResponseDtoLicenseTypeEnum = {
    Exclusive: 'exclusive',
    NonExclusive: 'non_exclusive'
} as const;
export type LicenseResponseDtoLicenseTypeEnum = typeof LicenseResponseDtoLicenseTypeEnum[keyof typeof LicenseResponseDtoLicenseTypeEnum];

/**
 * @export
 */
export const LicenseResponseDtoRenewalStatusEnum = {
    Renewing: 'renewing',
    InNegotiation: 'in_negotiation',
    Expiring: 'expiring',
    Lapsed: 'lapsed',
    AutoRenew: 'auto_renew'
} as const;
export type LicenseResponseDtoRenewalStatusEnum = typeof LicenseResponseDtoRenewalStatusEnum[keyof typeof LicenseResponseDtoRenewalStatusEnum];

/**
 * 
 * @export
 * @interface LicenseSummaryDto
 */
export interface LicenseSummaryDto {
    /**
     * 
     * @type {number}
     * @memberof LicenseSummaryDto
     */
    licensedCount: number;
    /**
     * 
     * @type {number}
     * @memberof LicenseSummaryDto
     */
    originalCount: number;
    /**
     * 
     * @type {number}
     * @memberof LicenseSummaryDto
     */
    activeAgreements: number;
    /**
     * 
     * @type {number}
     * @memberof LicenseSummaryDto
     */
    totalCostCents: number;
    /**
     * 
     * @type {number}
     * @memberof LicenseSummaryDto
     */
    totalRevenueCents: number;
    /**
     * Active agreement cost spread over each term (open-ended = 12 months)
     * @type {number}
     * @memberof LicenseSummaryDto
     */
    monthlyCostCents: number;
    /**
     * Total active licence cost / views of licensed content
     * @type {number}
     * @memberof LicenseSummaryDto
     */
    costPerStreamCents: number;
    /**
     * The same ratio as of one month ago — cost of licences in force at the cutoff over views of those titles before it. 0 when there were no views. Falling is the healthy direction.
     * @type {number}
     * @memberof LicenseSummaryDto
     */
    prevCostPerStreamCents: number;
    /**
     * 
     * @type {number}
     * @memberof LicenseSummaryDto
     */
    expiringIn30: number;
    /**
     * 
     * @type {number}
     * @memberof LicenseSummaryDto
     */
    expiringIn60: number;
    /**
     * 
     * @type {number}
     * @memberof LicenseSummaryDto
     */
    expiringIn90: number;
    /**
     * Last 6 months
     * @type {Array<MonthlyCostPointDto>}
     * @memberof LicenseSummaryDto
     */
    monthlyCostTrend: Array<MonthlyCostPointDto>;
}
/**
 * 
 * @export
 * @interface LicensingAnalyticsDto
 */
export interface LicensingAnalyticsDto {
    /**
     * 
     * @type {Array<LicensingStatusDto>}
     * @memberof LicensingAnalyticsDto
     */
    byStatus: Array<LicensingStatusDto>;
    /**
     * Titles expiring within 30 days (max 50)
     * @type {Array<LicensingExpiringDto>}
     * @memberof LicensingAnalyticsDto
     */
    expiringSoon: Array<LicensingExpiringDto>;
}
/**
 * 
 * @export
 * @interface LicensingExpiringDto
 */
export interface LicensingExpiringDto {
    /**
     * 
     * @type {string}
     * @memberof LicensingExpiringDto
     */
    id: string;
    /**
     * 
     * @type {string}
     * @memberof LicensingExpiringDto
     */
    title: string;
    /**
     * 
     * @type {string}
     * @memberof LicensingExpiringDto
     */
    licensorName?: string | null;
    /**
     * 
     * @type {string}
     * @memberof LicensingExpiringDto
     */
    expiresAt?: string | null;
    /**
     * 
     * @type {string}
     * @memberof LicensingExpiringDto
     */
    licenseStatus?: string | null;
}
/**
 * 
 * @export
 * @interface LicensingStatusDto
 */
export interface LicensingStatusDto {
    /**
     * 
     * @type {string}
     * @memberof LicensingStatusDto
     */
    status: string;
    /**
     * 
     * @type {number}
     * @memberof LicensingStatusDto
     */
    count: number;
}
/**
 * 
 * @export
 * @interface LinkedGameDto
 */
export interface LinkedGameDto {
    /**
     * 
     * @type {string}
     * @memberof LinkedGameDto
     */
    id: string;
    /**
     * Question (prediction), title (auction) or name (quest)
     * @type {string}
     * @memberof LinkedGameDto
     */
    title: string;
    /**
     * 
     * @type {string}
     * @memberof LinkedGameDto
     */
    status: string;
}
/**
 * 
 * @export
 * @interface LinkedGamesDto
 */
export interface LinkedGamesDto {
    /**
     * 
     * @type {number}
     * @memberof LinkedGamesDto
     */
    total: number;
    /**
     * 
     * @type {Array<LinkedGameDto>}
     * @memberof LinkedGamesDto
     */
    predictions: Array<LinkedGameDto>;
    /**
     * 
     * @type {Array<LinkedGameDto>}
     * @memberof LinkedGamesDto
     */
    auctions: Array<LinkedGameDto>;
    /**
     * 
     * @type {Array<LinkedGameDto>}
     * @memberof LinkedGamesDto
     */
    quests: Array<LinkedGameDto>;
}
/**
 * 
 * @export
 * @interface MacroRegionSummaryDto
 */
export interface MacroRegionSummaryDto {
    /**
     * 
     * @type {string}
     * @memberof MacroRegionSummaryDto
     */
    code: string;
    /**
     * 
     * @type {string}
     * @memberof MacroRegionSummaryDto
     */
    name: string;
    /**
     * 
     * @type {number}
     * @memberof MacroRegionSummaryDto
     */
    users: number;
    /**
     * 
     * @type {number}
     * @memberof MacroRegionSummaryDto
     */
    subscribers: number;
    /**
     * Paid revenue in window ($)
     * @type {number}
     * @memberof MacroRegionSummaryDto
     */
    revenue: number;
    /**
     * Points earned in window
     * @type {number}
     * @memberof MacroRegionSummaryDto
     */
    points: number;
    /**
     * 
     * @type {number}
     * @memberof MacroRegionSummaryDto
     */
    viewers: number;
    /**
     * 
     * @type {number}
     * @memberof MacroRegionSummaryDto
     */
    gamified: number;
}
/**
 * 
 * @export
 * @interface MarkAllReadResultDto
 */
export interface MarkAllReadResultDto {
    /**
     * Number of notifications marked read
     * @type {number}
     * @memberof MarkAllReadResultDto
     */
    updated: number;
}
/**
 * 
 * @export
 * @interface MarketingSpendDto
 */
export interface MarketingSpendDto {
    /**
     * 
     * @type {string}
     * @memberof MarketingSpendDto
     */
    id: string;
    /**
     * 
     * @type {string}
     * @memberof MarketingSpendDto
     */
    channel: MarketingSpendDtoChannelEnum;
    /**
     * 
     * @type {string}
     * @memberof MarketingSpendDto
     */
    periodMonth: string;
    /**
     * 
     * @type {number}
     * @memberof MarketingSpendDto
     */
    spendCents: number;
    /**
     * 
     * @type {string}
     * @memberof MarketingSpendDto
     */
    currency: string;
    /**
     * 
     * @type {number}
     * @memberof MarketingSpendDto
     */
    newUsers: number;
    /**
     * 
     * @type {string}
     * @memberof MarketingSpendDto
     */
    createdAt: string;
    /**
     * 
     * @type {string}
     * @memberof MarketingSpendDto
     */
    updatedAt: string;
}


/**
 * @export
 */
export const MarketingSpendDtoChannelEnum = {
    Organic: 'organic',
    PaidSocial: 'paid_social',
    Referral: 'referral',
    Influencer: 'influencer',
    Search: 'search',
    Other: 'other'
} as const;
export type MarketingSpendDtoChannelEnum = typeof MarketingSpendDtoChannelEnum[keyof typeof MarketingSpendDtoChannelEnum];

/**
 * 
 * @export
 * @interface MeControllerMeV1200Response
 */
export interface MeControllerMeV1200Response {
    /**
     * 
     * @type {number}
     * @memberof MeControllerMeV1200Response
     */
    statusCode: number;
    /**
     * 
     * @type {string}
     * @memberof MeControllerMeV1200Response
     */
    status: string;
    /**
     * 
     * @type {string}
     * @memberof MeControllerMeV1200Response
     */
    message: string;
    /**
     * Error details, or null on success
     * @type {object}
     * @memberof MeControllerMeV1200Response
     */
    error: object | null;
    /**
     * 
     * @type {AppBootstrapDto}
     * @memberof MeControllerMeV1200Response
     */
    data?: AppBootstrapDto;
}
/**
 * 
 * @export
 * @interface MediaControllerCompleteUploadV1200Response
 */
export interface MediaControllerCompleteUploadV1200Response {
    /**
     * 
     * @type {number}
     * @memberof MediaControllerCompleteUploadV1200Response
     */
    statusCode: number;
    /**
     * 
     * @type {string}
     * @memberof MediaControllerCompleteUploadV1200Response
     */
    status: string;
    /**
     * 
     * @type {string}
     * @memberof MediaControllerCompleteUploadV1200Response
     */
    message: string;
    /**
     * Error details, or null on success
     * @type {object}
     * @memberof MediaControllerCompleteUploadV1200Response
     */
    error: object | null;
    /**
     * 
     * @type {MediaDto}
     * @memberof MediaControllerCompleteUploadV1200Response
     */
    data?: MediaDto;
}
/**
 * 
 * @export
 * @interface MediaControllerGetEventsV1200Response
 */
export interface MediaControllerGetEventsV1200Response {
    /**
     * 
     * @type {number}
     * @memberof MediaControllerGetEventsV1200Response
     */
    statusCode: number;
    /**
     * 
     * @type {string}
     * @memberof MediaControllerGetEventsV1200Response
     */
    status: string;
    /**
     * 
     * @type {string}
     * @memberof MediaControllerGetEventsV1200Response
     */
    message: string;
    /**
     * Error details, or null on success
     * @type {object}
     * @memberof MediaControllerGetEventsV1200Response
     */
    error: object | null;
    /**
     * 
     * @type {Array<MediaStatusEventDto>}
     * @memberof MediaControllerGetEventsV1200Response
     */
    data?: Array<MediaStatusEventDto>;
}
/**
 * 
 * @export
 * @interface MediaControllerGetPlaybackV1200Response
 */
export interface MediaControllerGetPlaybackV1200Response {
    /**
     * 
     * @type {number}
     * @memberof MediaControllerGetPlaybackV1200Response
     */
    statusCode: number;
    /**
     * 
     * @type {string}
     * @memberof MediaControllerGetPlaybackV1200Response
     */
    status: string;
    /**
     * 
     * @type {string}
     * @memberof MediaControllerGetPlaybackV1200Response
     */
    message: string;
    /**
     * Error details, or null on success
     * @type {object}
     * @memberof MediaControllerGetPlaybackV1200Response
     */
    error: object | null;
    /**
     * 
     * @type {PlaybackDto}
     * @memberof MediaControllerGetPlaybackV1200Response
     */
    data?: PlaybackDto;
}
/**
 * 
 * @export
 * @interface MediaControllerRequestUploadV1201Response
 */
export interface MediaControllerRequestUploadV1201Response {
    /**
     * 
     * @type {number}
     * @memberof MediaControllerRequestUploadV1201Response
     */
    statusCode: number;
    /**
     * 
     * @type {string}
     * @memberof MediaControllerRequestUploadV1201Response
     */
    status: string;
    /**
     * 
     * @type {string}
     * @memberof MediaControllerRequestUploadV1201Response
     */
    message: string;
    /**
     * Error details, or null on success
     * @type {object}
     * @memberof MediaControllerRequestUploadV1201Response
     */
    error: object | null;
    /**
     * 
     * @type {UploadTicketDto}
     * @memberof MediaControllerRequestUploadV1201Response
     */
    data?: UploadTicketDto;
}
/**
 * 
 * @export
 * @interface MediaDto
 */
export interface MediaDto {
    /**
     * 
     * @type {string}
     * @memberof MediaDto
     */
    id: string;
    /**
     * 
     * @type {string}
     * @memberof MediaDto
     */
    mediaType: MediaDtoMediaTypeEnum;
    /**
     * 
     * @type {string}
     * @memberof MediaDto
     */
    usageType: MediaDtoUsageTypeEnum;
    /**
     * 
     * @type {string}
     * @memberof MediaDto
     */
    accessLevel: MediaDtoAccessLevelEnum;
    /**
     * 
     * @type {string}
     * @memberof MediaDto
     */
    status: MediaDtoStatusEnum;
    /**
     * 
     * @type {string}
     * @memberof MediaDto
     */
    mimeType?: string | null;
    /**
     * 
     * @type {string}
     * @memberof MediaDto
     */
    originalFilename?: string | null;
    /**
     * 
     * @type {number}
     * @memberof MediaDto
     */
    fileSizeBytes?: number | null;
    /**
     * 
     * @type {number}
     * @memberof MediaDto
     */
    width?: number | null;
    /**
     * 
     * @type {number}
     * @memberof MediaDto
     */
    height?: number | null;
    /**
     * 
     * @type {string}
     * @memberof MediaDto
     */
    durationSeconds?: string | null;
    /**
     * 
     * @type {boolean}
     * @memberof MediaDto
     */
    isHls: boolean;
    /**
     * Live transcode progress 0–100; null when not transcoding
     * @type {number}
     * @memberof MediaDto
     */
    processingProgress?: number | null;
    /**
     * 
     * @type {string}
     * @memberof MediaDto
     */
    posterMediaId?: string | null;
    /**
     * 
     * @type {string}
     * @memberof MediaDto
     */
    altText?: string | null;
    /**
     * 
     * @type {string}
     * @memberof MediaDto
     */
    createdAt: string;
    /**
     * Ready-to-use URL for PUBLIC assets; null for protected (use /playback)
     * @type {string}
     * @memberof MediaDto
     */
    url?: string | null;
}


/**
 * @export
 */
export const MediaDtoMediaTypeEnum = {
    Image: 'image',
    Video: 'video',
    Audio: 'audio',
    Document: 'document',
    Other: 'other'
} as const;
export type MediaDtoMediaTypeEnum = typeof MediaDtoMediaTypeEnum[keyof typeof MediaDtoMediaTypeEnum];

/**
 * @export
 */
export const MediaDtoUsageTypeEnum = {
    ContentVideo: 'content_video',
    ContentTrailer: 'content_trailer',
    ContentThumbnail: 'content_thumbnail',
    Avatar: 'avatar',
    PersonPhoto: 'person_photo',
    StudioLogo: 'studio_logo',
    Banner: 'banner',
    BadgeIcon: 'badge_icon',
    Document: 'document',
    Generic: 'generic'
} as const;
export type MediaDtoUsageTypeEnum = typeof MediaDtoUsageTypeEnum[keyof typeof MediaDtoUsageTypeEnum];

/**
 * @export
 */
export const MediaDtoAccessLevelEnum = {
    Public: 'public',
    Protected: 'protected',
    Private: 'private'
} as const;
export type MediaDtoAccessLevelEnum = typeof MediaDtoAccessLevelEnum[keyof typeof MediaDtoAccessLevelEnum];

/**
 * @export
 */
export const MediaDtoStatusEnum = {
    Pending: 'pending',
    Uploading: 'uploading',
    Uploaded: 'uploaded',
    Processing: 'processing',
    Ready: 'ready',
    Failed: 'failed',
    Archived: 'archived'
} as const;
export type MediaDtoStatusEnum = typeof MediaDtoStatusEnum[keyof typeof MediaDtoStatusEnum];

/**
 * 
 * @export
 * @interface MediaStatusEventDto
 */
export interface MediaStatusEventDto {
    /**
     * 
     * @type {string}
     * @memberof MediaStatusEventDto
     */
    id: string;
    /**
     * 
     * @type {string}
     * @memberof MediaStatusEventDto
     */
    status: MediaStatusEventDtoStatusEnum;
    /**
     * 
     * @type {string}
     * @memberof MediaStatusEventDto
     */
    detail?: string | null;
    /**
     * Transcode progress 0–100 for this event
     * @type {number}
     * @memberof MediaStatusEventDto
     */
    progress?: number | null;
    /**
     * 
     * @type {string}
     * @memberof MediaStatusEventDto
     */
    createdAt: string;
}


/**
 * @export
 */
export const MediaStatusEventDtoStatusEnum = {
    Pending: 'pending',
    Uploading: 'uploading',
    Uploaded: 'uploaded',
    Processing: 'processing',
    Ready: 'ready',
    Failed: 'failed',
    Archived: 'archived'
} as const;
export type MediaStatusEventDtoStatusEnum = typeof MediaStatusEventDtoStatusEnum[keyof typeof MediaStatusEventDtoStatusEnum];

/**
 * 
 * @export
 * @interface MessageResponseDto
 */
export interface MessageResponseDto {
    /**
     * 
     * @type {string}
     * @memberof MessageResponseDto
     */
    message: string;
}
/**
 * 
 * @export
 * @interface ModerateCommentDto
 */
export interface ModerateCommentDto {
    /**
     * hide / restore / delete a comment
     * @type {string}
     * @memberof ModerateCommentDto
     */
    status: ModerateCommentDtoStatusEnum;
}


/**
 * @export
 */
export const ModerateCommentDtoStatusEnum = {
    Visible: 'visible',
    Hidden: 'hidden',
    Deleted: 'deleted'
} as const;
export type ModerateCommentDtoStatusEnum = typeof ModerateCommentDtoStatusEnum[keyof typeof ModerateCommentDtoStatusEnum];

/**
 * 
 * @export
 * @interface ModerationReportDto
 */
export interface ModerationReportDto {
    /**
     * 
     * @type {string}
     * @memberof ModerationReportDto
     */
    id: string;
    /**
     * 
     * @type {string}
     * @memberof ModerationReportDto
     */
    reporterUserId?: string | null;
    /**
     * 
     * @type {string}
     * @memberof ModerationReportDto
     */
    reporterUsername?: string | null;
    /**
     * 
     * @type {string}
     * @memberof ModerationReportDto
     */
    reason: string;
    /**
     * 
     * @type {string}
     * @memberof ModerationReportDto
     */
    note?: string | null;
    /**
     * 
     * @type {string}
     * @memberof ModerationReportDto
     */
    createdAt: string;
}
/**
 * 
 * @export
 * @interface ModerationStatsDto
 */
export interface ModerationStatsDto {
    /**
     * 
     * @type {BacklogDto}
     * @memberof ModerationStatsDto
     */
    backlog: BacklogDto;
    /**
     * All-time ticket counts by status
     * @type {object}
     * @memberof ModerationStatsDto
     */
    byStatus: object;
    /**
     * 
     * @type {AvgResolutionDto}
     * @memberof ModerationStatsDto
     */
    avgResolutionMinutes: AvgResolutionDto;
    /**
     * 
     * @type {ResolvedTodayDto}
     * @memberof ModerationStatsDto
     */
    resolvedToday: ResolvedTodayDto;
    /**
     * 
     * @type {SafetyScoreDto}
     * @memberof ModerationStatsDto
     */
    safetyScore: SafetyScoreDto;
    /**
     * 
     * @type {ReportVolumeDto}
     * @memberof ModerationStatsDto
     */
    reportVolume24h: ReportVolumeDto;
    /**
     * 
     * @type {Array<ViolationDto>}
     * @memberof ModerationStatsDto
     */
    violationBreakdown: Array<ViolationDto>;
}
/**
 * 
 * @export
 * @interface MonetizationDataDto
 */
export interface MonetizationDataDto {
    /**
     * 
     * @type {number}
     * @memberof MonetizationDataDto
     */
    arpu: number;
    /**
     * 
     * @type {number}
     * @memberof MonetizationDataDto
     */
    arpdau: number;
    /**
     * 
     * @type {number}
     * @memberof MonetizationDataDto
     */
    trialToPaidPct: number;
    /**
     * 
     * @type {number}
     * @memberof MonetizationDataDto
     */
    ltvCacRatio: number;
    /**
     * Current MRR ($)
     * @type {number}
     * @memberof MonetizationDataDto
     */
    mrr: number;
    /**
     * Paid revenue in window ($)
     * @type {number}
     * @memberof MonetizationDataDto
     */
    revenue: number;
    /**
     * Lifetime paid revenue ÷ paying users ($)
     * @type {number}
     * @memberof MonetizationDataDto
     */
    ltv: number;
    /**
     * 
     * @type {FunnelDto}
     * @memberof MonetizationDataDto
     */
    funnel: FunnelDto;
    /**
     * 
     * @type {Array<ChannelEconomicsDto>}
     * @memberof MonetizationDataDto
     */
    channels: Array<ChannelEconomicsDto>;
    /**
     * 
     * @type {Array<SubsWeekDto>}
     * @memberof MonetizationDataDto
     */
    subsTrend: Array<SubsWeekDto>;
    /**
     * 
     * @type {Array<RevenueMonthDto>}
     * @memberof MonetizationDataDto
     */
    revenueTrend: Array<RevenueMonthDto>;
}
/**
 * 
 * @export
 * @interface MonthlyCostPointDto
 */
export interface MonthlyCostPointDto {
    /**
     * 
     * @type {string}
     * @memberof MonthlyCostPointDto
     */
    month: string;
    /**
     * 
     * @type {number}
     * @memberof MonthlyCostPointDto
     */
    costCents: number;
}
/**
 * 
 * @export
 * @interface MyPredictionEntryDto
 */
export interface MyPredictionEntryDto {
    /**
     * 
     * @type {string}
     * @memberof MyPredictionEntryDto
     */
    optionId: string;
    /**
     * 
     * @type {number}
     * @memberof MyPredictionEntryDto
     */
    pointsStaked: number;
    /**
     * 
     * @type {boolean}
     * @memberof MyPredictionEntryDto
     */
    isCorrect?: boolean | null;
    /**
     * 
     * @type {number}
     * @memberof MyPredictionEntryDto
     */
    pointsPaid: number;
    /**
     * 
     * @type {string}
     * @memberof MyPredictionEntryDto
     */
    paidAt?: string | null;
}
/**
 * 
 * @export
 * @interface MyRankDto
 */
export interface MyRankDto {
    /**
     * 
     * @type {number}
     * @memberof MyRankDto
     */
    rank: number;
    /**
     * 
     * @type {number}
     * @memberof MyRankDto
     */
    pointsBalance: number;
    /**
     * 
     * @type {number}
     * @memberof MyRankDto
     */
    rankDelta?: number | null;
}
/**
 * 
 * @export
 * @interface NotificationControllerListV1200Response
 */
export interface NotificationControllerListV1200Response {
    /**
     * 
     * @type {number}
     * @memberof NotificationControllerListV1200Response
     */
    statusCode: number;
    /**
     * 
     * @type {string}
     * @memberof NotificationControllerListV1200Response
     */
    status: string;
    /**
     * 
     * @type {string}
     * @memberof NotificationControllerListV1200Response
     */
    message: string;
    /**
     * Error details, or null on success
     * @type {object}
     * @memberof NotificationControllerListV1200Response
     */
    error: object | null;
    /**
     * 
     * @type {NotificationControllerListV1200ResponseAllOfData}
     * @memberof NotificationControllerListV1200Response
     */
    data?: NotificationControllerListV1200ResponseAllOfData;
}
/**
 * 
 * @export
 * @interface NotificationControllerListV1200ResponseAllOfData
 */
export interface NotificationControllerListV1200ResponseAllOfData {
    /**
     * 
     * @type {Array<NotificationDto>}
     * @memberof NotificationControllerListV1200ResponseAllOfData
     */
    items?: Array<NotificationDto>;
    /**
     * 
     * @type {PaginationDetailsDto}
     * @memberof NotificationControllerListV1200ResponseAllOfData
     */
    pagination?: PaginationDetailsDto;
}
/**
 * 
 * @export
 * @interface NotificationControllerMarkAllReadV1200Response
 */
export interface NotificationControllerMarkAllReadV1200Response {
    /**
     * 
     * @type {number}
     * @memberof NotificationControllerMarkAllReadV1200Response
     */
    statusCode: number;
    /**
     * 
     * @type {string}
     * @memberof NotificationControllerMarkAllReadV1200Response
     */
    status: string;
    /**
     * 
     * @type {string}
     * @memberof NotificationControllerMarkAllReadV1200Response
     */
    message: string;
    /**
     * Error details, or null on success
     * @type {object}
     * @memberof NotificationControllerMarkAllReadV1200Response
     */
    error: object | null;
    /**
     * 
     * @type {MarkAllReadResultDto}
     * @memberof NotificationControllerMarkAllReadV1200Response
     */
    data?: MarkAllReadResultDto;
}
/**
 * 
 * @export
 * @interface NotificationControllerUnreadCountV1200Response
 */
export interface NotificationControllerUnreadCountV1200Response {
    /**
     * 
     * @type {number}
     * @memberof NotificationControllerUnreadCountV1200Response
     */
    statusCode: number;
    /**
     * 
     * @type {string}
     * @memberof NotificationControllerUnreadCountV1200Response
     */
    status: string;
    /**
     * 
     * @type {string}
     * @memberof NotificationControllerUnreadCountV1200Response
     */
    message: string;
    /**
     * Error details, or null on success
     * @type {object}
     * @memberof NotificationControllerUnreadCountV1200Response
     */
    error: object | null;
    /**
     * 
     * @type {UnreadCountDto}
     * @memberof NotificationControllerUnreadCountV1200Response
     */
    data?: UnreadCountDto;
}
/**
 * 
 * @export
 * @interface NotificationDto
 */
export interface NotificationDto {
    /**
     * 
     * @type {string}
     * @memberof NotificationDto
     */
    id: string;
    /**
     * 
     * @type {string}
     * @memberof NotificationDto
     */
    category: string;
    /**
     * 
     * @type {string}
     * @memberof NotificationDto
     */
    title: string;
    /**
     * 
     * @type {string}
     * @memberof NotificationDto
     */
    body?: string | null;
    /**
     * 
     * @type {string}
     * @memberof NotificationDto
     */
    deepLink?: string | null;
    /**
     * 
     * @type {string}
     * @memberof NotificationDto
     */
    imageMediaId?: string | null;
    /**
     * 
     * @type {boolean}
     * @memberof NotificationDto
     */
    isRead: boolean;
    /**
     * 
     * @type {string}
     * @memberof NotificationDto
     */
    readAt?: string | null;
    /**
     * 
     * @type {string}
     * @memberof NotificationDto
     */
    createdAt: string;
}
/**
 * 
 * @export
 * @interface OffenderDto
 */
export interface OffenderDto {
    /**
     * 
     * @type {string}
     * @memberof OffenderDto
     */
    id: string;
    /**
     * 
     * @type {string}
     * @memberof OffenderDto
     */
    username?: string | null;
    /**
     * 
     * @type {string}
     * @memberof OffenderDto
     */
    name?: string | null;
    /**
     * 
     * @type {string}
     * @memberof OffenderDto
     */
    avatarUrl?: string | null;
    /**
     * 
     * @type {string}
     * @memberof OffenderDto
     */
    status: string;
    /**
     * 
     * @type {string}
     * @memberof OffenderDto
     */
    suspendedUntil?: string | null;
    /**
     * 
     * @type {string}
     * @memberof OffenderDto
     */
    joinedAt: string;
}
/**
 * 
 * @export
 * @interface OffenderHistoryDto
 */
export interface OffenderHistoryDto {
    /**
     * 
     * @type {OffenderTotalsDto}
     * @memberof OffenderHistoryDto
     */
    totals: OffenderTotalsDto;
    /**
     * 
     * @type {Array<PriorTicketDto>}
     * @memberof OffenderHistoryDto
     */
    priorTickets: Array<PriorTicketDto>;
    /**
     * 
     * @type {Array<EnforcementDto>}
     * @memberof OffenderHistoryDto
     */
    enforcements: Array<EnforcementDto>;
}
/**
 * 
 * @export
 * @interface OffenderTotalsDto
 */
export interface OffenderTotalsDto {
    /**
     * 
     * @type {number}
     * @memberof OffenderTotalsDto
     */
    tickets: number;
    /**
     * 
     * @type {number}
     * @memberof OffenderTotalsDto
     */
    actioned: number;
    /**
     * 
     * @type {number}
     * @memberof OffenderTotalsDto
     */
    dismissed: number;
    /**
     * 
     * @type {number}
     * @memberof OffenderTotalsDto
     */
    open: number;
}
/**
 * 
 * @export
 * @interface OpenPredictionsResponseDto
 */
export interface OpenPredictionsResponseDto {
    /**
     * 
     * @type {PredictionEntitlementDto}
     * @memberof OpenPredictionsResponseDto
     */
    entitlement: PredictionEntitlementDto;
    /**
     * 
     * @type {Array<PredictionCustomerDetailDto>}
     * @memberof OpenPredictionsResponseDto
     */
    items: Array<PredictionCustomerDetailDto>;
}
/**
 * 
 * @export
 * @interface OpenTicketRefDto
 */
export interface OpenTicketRefDto {
    /**
     * 
     * @type {string}
     * @memberof OpenTicketRefDto
     */
    id: string;
    /**
     * 
     * @type {string}
     * @memberof OpenTicketRefDto
     */
    status: string;
}
/**
 * 
 * @export
 * @interface OptionShareDto
 */
export interface OptionShareDto {
    /**
     * 
     * @type {string}
     * @memberof OptionShareDto
     */
    optionId: string;
    /**
     * 
     * @type {number}
     * @memberof OptionShareDto
     */
    percent: number;
}
/**
 * 
 * @export
 * @interface OtpDeliveryResponseDto
 */
export interface OtpDeliveryResponseDto {
    /**
     * 
     * @type {string}
     * @memberof OtpDeliveryResponseDto
     */
    delivery: OtpDeliveryResponseDtoDeliveryEnum;
    /**
     * Short-lived challenge token (Twilio code-verify path only — not used by /auth/phone/verify, which is Firebase-only)
     * @type {string}
     * @memberof OtpDeliveryResponseDto
     */
    otpToken: string;
}


/**
 * @export
 */
export const OtpDeliveryResponseDtoDeliveryEnum = {
    Sent: 'sent',
    ClientManaged: 'client_managed'
} as const;
export type OtpDeliveryResponseDtoDeliveryEnum = typeof OtpDeliveryResponseDtoDeliveryEnum[keyof typeof OtpDeliveryResponseDtoDeliveryEnum];

/**
 * 
 * @export
 * @interface PaginationDetailsDto
 */
export interface PaginationDetailsDto {
    /**
     * Current page number
     * @type {number}
     * @memberof PaginationDetailsDto
     */
    pageNo: number;
    /**
     * Number of items per page
     * @type {number}
     * @memberof PaginationDetailsDto
     */
    pageSize: number;
    /**
     * Total number of items available
     * @type {number}
     * @memberof PaginationDetailsDto
     */
    totalCount: number;
    /**
     * Total number of pages available
     * @type {number}
     * @memberof PaginationDetailsDto
     */
    totalPages: number;
}
/**
 * 
 * @export
 * @interface PermissionResponseDto
 */
export interface PermissionResponseDto {
    /**
     * 
     * @type {string}
     * @memberof PermissionResponseDto
     */
    id: string;
    /**
     * 
     * @type {string}
     * @memberof PermissionResponseDto
     */
    name: string;
    /**
     * 
     * @type {string}
     * @memberof PermissionResponseDto
     */
    description: string | null;
    /**
     * 
     * @type {string}
     * @memberof PermissionResponseDto
     */
    resource: string;
    /**
     * 
     * @type {string}
     * @memberof PermissionResponseDto
     */
    action: string;
}

/**
 * 
 * @export
 */
export const PersonKnownFor = {
    Actor: 'actor',
    Director: 'director',
    Writer: 'writer',
    Producer: 'producer',
    Other: 'other'
} as const;
export type PersonKnownFor = typeof PersonKnownFor[keyof typeof PersonKnownFor];

/**
 * 
 * @export
 * @interface PersonListResponseDto
 */
export interface PersonListResponseDto {
    /**
     * 
     * @type {Array<PersonResponseDto>}
     * @memberof PersonListResponseDto
     */
    items: Array<PersonResponseDto>;
    /**
     * 
     * @type {PaginationDetailsDto}
     * @memberof PersonListResponseDto
     */
    pagination: PaginationDetailsDto;
    /**
     * 
     * @type {TaxonomySummaryDto}
     * @memberof PersonListResponseDto
     */
    summary: TaxonomySummaryDto;
}
/**
 * 
 * @export
 * @interface PersonResponseDto
 */
export interface PersonResponseDto {
    /**
     * 
     * @type {string}
     * @memberof PersonResponseDto
     */
    id: string;
    /**
     * 
     * @type {string}
     * @memberof PersonResponseDto
     */
    name: string;
    /**
     * 
     * @type {string}
     * @memberof PersonResponseDto
     */
    slug: string;
    /**
     * 
     * @type {string}
     * @memberof PersonResponseDto
     */
    photoMediaId?: string | null;
    /**
     * Resolved delivery URL for `photoMediaId`. Null when there is no photo, or the media row is gone or not yet ready.
     * @type {string}
     * @memberof PersonResponseDto
     */
    photoUrl?: string | null;
    /**
     * 
     * @type {string}
     * @memberof PersonResponseDto
     */
    bio?: string | null;
    /**
     * 
     * @type {string}
     * @memberof PersonResponseDto
     */
    knownFor?: PersonResponseDtoKnownForEnum | null;
    /**
     * Number of distinct non-deleted contents the person is credited on
     * @type {number}
     * @memberof PersonResponseDto
     */
    contentCount: number;
}


/**
 * @export
 */
export const PersonResponseDtoKnownForEnum = {
    Actor: 'actor',
    Director: 'director',
    Writer: 'writer',
    Producer: 'producer',
    Other: 'other'
} as const;
export type PersonResponseDtoKnownForEnum = typeof PersonResponseDtoKnownForEnum[keyof typeof PersonResponseDtoKnownForEnum];

/**
 * 
 * @export
 * @interface PlanControllerListV1200Response
 */
export interface PlanControllerListV1200Response {
    /**
     * 
     * @type {number}
     * @memberof PlanControllerListV1200Response
     */
    statusCode: number;
    /**
     * 
     * @type {string}
     * @memberof PlanControllerListV1200Response
     */
    status: string;
    /**
     * 
     * @type {string}
     * @memberof PlanControllerListV1200Response
     */
    message: string;
    /**
     * Error details, or null on success
     * @type {object}
     * @memberof PlanControllerListV1200Response
     */
    error: object | null;
    /**
     * 
     * @type {Array<CustomerPlanDto>}
     * @memberof PlanControllerListV1200Response
     */
    data?: Array<CustomerPlanDto>;
}
/**
 * 
 * @export
 * @interface PlanDto
 */
export interface PlanDto {
    /**
     * 
     * @type {string}
     * @memberof PlanDto
     */
    id: string;
    /**
     * 
     * @type {string}
     * @memberof PlanDto
     */
    name: string;
    /**
     * 
     * @type {string}
     * @memberof PlanDto
     */
    description?: string | null;
    /**
     * 
     * @type {number}
     * @memberof PlanDto
     */
    basePriceCents: number;
    /**
     * 
     * @type {string}
     * @memberof PlanDto
     */
    baseCurrency: string;
    /**
     * 
     * @type {string}
     * @memberof PlanDto
     */
    interval: PlanDtoIntervalEnum;
    /**
     * 
     * @type {number}
     * @memberof PlanDto
     */
    trialDays: number;
    /**
     * 
     * @type {Array<string>}
     * @memberof PlanDto
     */
    features: Array<string>;
    /**
     * 
     * @type {boolean}
     * @memberof PlanDto
     */
    isActive: boolean;
    /**
     * 
     * @type {boolean}
     * @memberof PlanDto
     */
    isPopular: boolean;
    /**
     * 
     * @type {number}
     * @memberof PlanDto
     */
    sortOrder: number;
}


/**
 * @export
 */
export const PlanDtoIntervalEnum = {
    Monthly: 'monthly',
    Yearly: 'yearly'
} as const;
export type PlanDtoIntervalEnum = typeof PlanDtoIntervalEnum[keyof typeof PlanDtoIntervalEnum];

/**
 * 
 * @export
 * @interface PlanOptionDto
 */
export interface PlanOptionDto {
    /**
     * 
     * @type {string}
     * @memberof PlanOptionDto
     */
    id: string;
    /**
     * 
     * @type {string}
     * @memberof PlanOptionDto
     */
    name: string;
    /**
     * 
     * @type {string}
     * @memberof PlanOptionDto
     */
    interval: string;
    /**
     * Price resolved for the caller's region
     * @type {object}
     * @memberof PlanOptionDto
     */
    price: object;
    /**
     * 
     * @type {boolean}
     * @memberof PlanOptionDto
     */
    isCurrent: boolean;
    /**
     * 
     * @type {string}
     * @memberof PlanOptionDto
     */
    action: PlanOptionDtoActionEnum;
}


/**
 * @export
 */
export const PlanOptionDtoActionEnum = {
    Subscribe: 'subscribe',
    Current: 'current',
    Upgrade: 'upgrade',
    Downgrade: 'downgrade'
} as const;
export type PlanOptionDtoActionEnum = typeof PlanOptionDtoActionEnum[keyof typeof PlanOptionDtoActionEnum];

/**
 * 
 * @export
 * @interface PlatformMentionsDto
 */
export interface PlatformMentionsDto {
    /**
     * 
     * @type {string}
     * @memberof PlatformMentionsDto
     */
    platform: string;
    /**
     * 
     * @type {number}
     * @memberof PlatformMentionsDto
     */
    mentions: number;
    /**
     * 
     * @type {number}
     * @memberof PlatformMentionsDto
     */
    impressions: number;
    /**
     * 
     * @type {number}
     * @memberof PlatformMentionsDto
     */
    positive: number;
    /**
     * 
     * @type {number}
     * @memberof PlatformMentionsDto
     */
    negative: number;
}
/**
 * 
 * @export
 * @interface PlaybackDto
 */
export interface PlaybackDto {
    /**
     * 
     * @type {string}
     * @memberof PlaybackDto
     */
    kind: PlaybackDtoKindEnum;
    /**
     * 
     * @type {string}
     * @memberof PlaybackDto
     */
    url: string;
    /**
     * Signed cookies to send on CDN requests (HLS); empty otherwise
     * @type {{ [key: string]: string; }}
     * @memberof PlaybackDto
     */
    cookies: { [key: string]: string; };
    /**
     * 
     * @type {number}
     * @memberof PlaybackDto
     */
    expiresInSeconds: number;
}


/**
 * @export
 */
export const PlaybackDtoKindEnum = {
    Hls: 'hls',
    File: 'file'
} as const;
export type PlaybackDtoKindEnum = typeof PlaybackDtoKindEnum[keyof typeof PlaybackDtoKindEnum];

/**
 * 
 * @export
 * @interface PredictionCancelResultDto
 */
export interface PredictionCancelResultDto {
    /**
     * 
     * @type {string}
     * @memberof PredictionCancelResultDto
     */
    id: string;
    /**
     * 
     * @type {string}
     * @memberof PredictionCancelResultDto
     */
    status: string;
    /**
     * Number of stakes refunded
     * @type {number}
     * @memberof PredictionCancelResultDto
     */
    refunded: number;
}
/**
 * 
 * @export
 * @interface PredictionControllerDetailV1200Response
 */
export interface PredictionControllerDetailV1200Response {
    /**
     * 
     * @type {number}
     * @memberof PredictionControllerDetailV1200Response
     */
    statusCode: number;
    /**
     * 
     * @type {string}
     * @memberof PredictionControllerDetailV1200Response
     */
    status: string;
    /**
     * 
     * @type {string}
     * @memberof PredictionControllerDetailV1200Response
     */
    message: string;
    /**
     * Error details, or null on success
     * @type {object}
     * @memberof PredictionControllerDetailV1200Response
     */
    error: object | null;
    /**
     * 
     * @type {PredictionCustomerDetailDto}
     * @memberof PredictionControllerDetailV1200Response
     */
    data?: PredictionCustomerDetailDto;
}
/**
 * 
 * @export
 * @interface PredictionControllerEnterV1200Response
 */
export interface PredictionControllerEnterV1200Response {
    /**
     * 
     * @type {number}
     * @memberof PredictionControllerEnterV1200Response
     */
    statusCode: number;
    /**
     * 
     * @type {string}
     * @memberof PredictionControllerEnterV1200Response
     */
    status: string;
    /**
     * 
     * @type {string}
     * @memberof PredictionControllerEnterV1200Response
     */
    message: string;
    /**
     * Error details, or null on success
     * @type {object}
     * @memberof PredictionControllerEnterV1200Response
     */
    error: object | null;
    /**
     * 
     * @type {PredictionEnterResultDto}
     * @memberof PredictionControllerEnterV1200Response
     */
    data?: PredictionEnterResultDto;
}
/**
 * 
 * @export
 * @interface PredictionControllerEntitlementV1200Response
 */
export interface PredictionControllerEntitlementV1200Response {
    /**
     * 
     * @type {number}
     * @memberof PredictionControllerEntitlementV1200Response
     */
    statusCode: number;
    /**
     * 
     * @type {string}
     * @memberof PredictionControllerEntitlementV1200Response
     */
    status: string;
    /**
     * 
     * @type {string}
     * @memberof PredictionControllerEntitlementV1200Response
     */
    message: string;
    /**
     * Error details, or null on success
     * @type {object}
     * @memberof PredictionControllerEntitlementV1200Response
     */
    error: object | null;
    /**
     * 
     * @type {PredictionEntitlementDto}
     * @memberof PredictionControllerEntitlementV1200Response
     */
    data?: PredictionEntitlementDto;
}
/**
 * 
 * @export
 * @interface PredictionControllerOpenV1200Response
 */
export interface PredictionControllerOpenV1200Response {
    /**
     * 
     * @type {number}
     * @memberof PredictionControllerOpenV1200Response
     */
    statusCode: number;
    /**
     * 
     * @type {string}
     * @memberof PredictionControllerOpenV1200Response
     */
    status: string;
    /**
     * 
     * @type {string}
     * @memberof PredictionControllerOpenV1200Response
     */
    message: string;
    /**
     * Error details, or null on success
     * @type {object}
     * @memberof PredictionControllerOpenV1200Response
     */
    error: object | null;
    /**
     * 
     * @type {OpenPredictionsResponseDto}
     * @memberof PredictionControllerOpenV1200Response
     */
    data?: OpenPredictionsResponseDto;
}
/**
 * 
 * @export
 * @interface PredictionCustomerDetailDto
 */
export interface PredictionCustomerDetailDto {
    /**
     * 
     * @type {string}
     * @memberof PredictionCustomerDetailDto
     */
    id: string;
    /**
     * 
     * @type {string}
     * @memberof PredictionCustomerDetailDto
     */
    title?: string | null;
    /**
     * 
     * @type {string}
     * @memberof PredictionCustomerDetailDto
     */
    question: string;
    /**
     * 
     * @type {string}
     * @memberof PredictionCustomerDetailDto
     */
    description?: string | null;
    /**
     * 
     * @type {string}
     * @memberof PredictionCustomerDetailDto
     */
    status: string;
    /**
     * 
     * @type {string}
     * @memberof PredictionCustomerDetailDto
     */
    startAt: string;
    /**
     * 
     * @type {string}
     * @memberof PredictionCustomerDetailDto
     */
    endAt: string;
    /**
     * 
     * @type {number}
     * @memberof PredictionCustomerDetailDto
     */
    entryCostPoints: number;
    /**
     * 
     * @type {number}
     * @memberof PredictionCustomerDetailDto
     */
    rewardPoints: number;
    /**
     * 
     * @type {number}
     * @memberof PredictionCustomerDetailDto
     */
    payoutMultiplier: number;
    /**
     * 
     * @type {number}
     * @memberof PredictionCustomerDetailDto
     */
    resolutionNo: number;
    /**
     * 
     * @type {string}
     * @memberof PredictionCustomerDetailDto
     */
    correctOptionId?: string | null;
    /**
     * 
     * @type {Array<PredictionCustomerOptionDto>}
     * @memberof PredictionCustomerDetailDto
     */
    options: Array<PredictionCustomerOptionDto>;
    /**
     * 
     * @type {MyPredictionEntryDto}
     * @memberof PredictionCustomerDetailDto
     */
    myEntry?: MyPredictionEntryDto | null;
    /**
     * 
     * @type {Array<OptionShareDto>}
     * @memberof PredictionCustomerDetailDto
     */
    optionShares?: Array<OptionShareDto>;
    /**
     * 
     * @type {number}
     * @memberof PredictionCustomerDetailDto
     */
    turnoutPercent?: number;
}
/**
 * 
 * @export
 * @interface PredictionCustomerOptionDto
 */
export interface PredictionCustomerOptionDto {
    /**
     * 
     * @type {string}
     * @memberof PredictionCustomerOptionDto
     */
    id: string;
    /**
     * 
     * @type {string}
     * @memberof PredictionCustomerOptionDto
     */
    label?: string | null;
    /**
     * 
     * @type {string}
     * @memberof PredictionCustomerOptionDto
     */
    optionMediaId?: string | null;
    /**
     * Only present once the prediction is resolved
     * @type {boolean}
     * @memberof PredictionCustomerOptionDto
     */
    isCorrect?: boolean;
}
/**
 * 
 * @export
 * @interface PredictionDeletedResultDto
 */
export interface PredictionDeletedResultDto {
    /**
     * 
     * @type {boolean}
     * @memberof PredictionDeletedResultDto
     */
    deleted: boolean;
}
/**
 * 
 * @export
 * @interface PredictionDetailDto
 */
export interface PredictionDetailDto {
    /**
     * 
     * @type {string}
     * @memberof PredictionDetailDto
     */
    id: string;
    /**
     * 
     * @type {string}
     * @memberof PredictionDetailDto
     */
    title?: string | null;
    /**
     * 
     * @type {string}
     * @memberof PredictionDetailDto
     */
    question: string;
    /**
     * 
     * @type {string}
     * @memberof PredictionDetailDto
     */
    description?: string | null;
    /**
     * 
     * @type {string}
     * @memberof PredictionDetailDto
     */
    contentId?: string | null;
    /**
     * 
     * @type {string}
     * @memberof PredictionDetailDto
     */
    startAt: string;
    /**
     * 
     * @type {string}
     * @memberof PredictionDetailDto
     */
    endAt: string;
    /**
     * 
     * @type {string}
     * @memberof PredictionDetailDto
     */
    status: string;
    /**
     * 
     * @type {number}
     * @memberof PredictionDetailDto
     */
    rewardPoints: number;
    /**
     * 
     * @type {number}
     * @memberof PredictionDetailDto
     */
    entryCostPoints: number;
    /**
     * 
     * @type {number}
     * @memberof PredictionDetailDto
     */
    payoutMultiplier: number;
    /**
     * 
     * @type {number}
     * @memberof PredictionDetailDto
     */
    resolutionNo: number;
    /**
     * 
     * @type {string}
     * @memberof PredictionDetailDto
     */
    correctOptionId?: string | null;
    /**
     * 
     * @type {Array<PredictionOptionDto>}
     * @memberof PredictionDetailDto
     */
    options: Array<PredictionOptionDto>;
}
/**
 * 
 * @export
 * @interface PredictionDto
 */
export interface PredictionDto {
    /**
     * 
     * @type {string}
     * @memberof PredictionDto
     */
    id: string;
    /**
     * 
     * @type {string}
     * @memberof PredictionDto
     */
    title?: string | null;
    /**
     * 
     * @type {string}
     * @memberof PredictionDto
     */
    question: string;
    /**
     * 
     * @type {string}
     * @memberof PredictionDto
     */
    description?: string | null;
    /**
     * 
     * @type {string}
     * @memberof PredictionDto
     */
    contentId?: string | null;
    /**
     * 
     * @type {string}
     * @memberof PredictionDto
     */
    startAt: string;
    /**
     * 
     * @type {string}
     * @memberof PredictionDto
     */
    endAt: string;
    /**
     * 
     * @type {string}
     * @memberof PredictionDto
     */
    status: string;
    /**
     * 
     * @type {number}
     * @memberof PredictionDto
     */
    rewardPoints: number;
    /**
     * 
     * @type {number}
     * @memberof PredictionDto
     */
    entryCostPoints: number;
    /**
     * 
     * @type {number}
     * @memberof PredictionDto
     */
    payoutMultiplier: number;
    /**
     * 
     * @type {number}
     * @memberof PredictionDto
     */
    resolutionNo: number;
    /**
     * 
     * @type {string}
     * @memberof PredictionDto
     */
    correctOptionId?: string | null;
}
/**
 * 
 * @export
 * @interface PredictionEnterResultDto
 */
export interface PredictionEnterResultDto {
    /**
     * 
     * @type {string}
     * @memberof PredictionEnterResultDto
     */
    entryId: string;
    /**
     * 
     * @type {string}
     * @memberof PredictionEnterResultDto
     */
    optionId: string;
    /**
     * 
     * @type {number}
     * @memberof PredictionEnterResultDto
     */
    pointsStaked: number;
}
/**
 * 
 * @export
 * @interface PredictionEntitlementDto
 */
export interface PredictionEntitlementDto {
    /**
     * 
     * @type {boolean}
     * @memberof PredictionEntitlementDto
     */
    isSubscriber: boolean;
    /**
     * null = unlimited (subscribers)
     * @type {number}
     * @memberof PredictionEntitlementDto
     */
    viewsAllowed?: number | null;
    /**
     * 
     * @type {number}
     * @memberof PredictionEntitlementDto
     */
    viewsUsed: number;
    /**
     * null = unlimited
     * @type {number}
     * @memberof PredictionEntitlementDto
     */
    viewsRemaining?: number | null;
    /**
     * 
     * @type {boolean}
     * @memberof PredictionEntitlementDto
     */
    canEnter: boolean;
}
/**
 * 
 * @export
 * @interface PredictionEntriesListDto
 */
export interface PredictionEntriesListDto {
    /**
     * 
     * @type {Array<PredictionEntryDto>}
     * @memberof PredictionEntriesListDto
     */
    items: Array<PredictionEntryDto>;
    /**
     * 
     * @type {PaginationDetailsDto}
     * @memberof PredictionEntriesListDto
     */
    pagination: PaginationDetailsDto;
    /**
     * Totals for the whole prediction — unaffected by `result`/paging
     * @type {PredictionEntryStatsDto}
     * @memberof PredictionEntriesListDto
     */
    summary: PredictionEntryStatsDto;
}
/**
 * 
 * @export
 * @interface PredictionEntryDto
 */
export interface PredictionEntryDto {
    /**
     * 
     * @type {string}
     * @memberof PredictionEntryDto
     */
    userId: string;
    /**
     * 
     * @type {string}
     * @memberof PredictionEntryDto
     */
    username?: string | null;
    /**
     * 
     * @type {string}
     * @memberof PredictionEntryDto
     */
    firstName?: string | null;
    /**
     * 
     * @type {string}
     * @memberof PredictionEntryDto
     */
    lastName?: string | null;
    /**
     * 
     * @type {string}
     * @memberof PredictionEntryDto
     */
    avatarUrl?: string | null;
    /**
     * The option this user predicted
     * @type {string}
     * @memberof PredictionEntryDto
     */
    optionId: string;
    /**
     * 
     * @type {string}
     * @memberof PredictionEntryDto
     */
    optionLabel?: string | null;
    /**
     * null until the prediction is resolved
     * @type {boolean}
     * @memberof PredictionEntryDto
     */
    isCorrect?: boolean | null;
    /**
     * What this entry cost the user; 0 on a free prediction
     * @type {number}
     * @memberof PredictionEntryDto
     */
    pointsStaked: number;
    /**
     * Paid to this user; 0 for losers and for winners not yet paid
     * @type {number}
     * @memberof PredictionEntryDto
     */
    pointsPaid: number;
    /**
     * 
     * @type {string}
     * @memberof PredictionEntryDto
     */
    enteredAt: string;
    /**
     * 
     * @type {string}
     * @memberof PredictionEntryDto
     */
    paidAt?: string | null;
}
/**
 * 
 * @export
 * @interface PredictionEntryStatsDto
 */
export interface PredictionEntryStatsDto {
    /**
     * Number of entries — one per user, so also the participant count
     * @type {number}
     * @memberof PredictionEntryStatsDto
     */
    participantCount: number;
    /**
     * Winners; 0 until the prediction is resolved
     * @type {number}
     * @memberof PredictionEntryStatsDto
     */
    correctCount: number;
    /**
     * Total entry cost collected
     * @type {number}
     * @memberof PredictionEntryStatsDto
     */
    pointsStaked: number;
    /**
     * Total paid out to winners
     * @type {number}
     * @memberof PredictionEntryStatsDto
     */
    pointsPaid: number;
    /**
     * Every option, including ones nobody picked
     * @type {Array<PredictionOptionBreakdownDto>}
     * @memberof PredictionEntryStatsDto
     */
    options: Array<PredictionOptionBreakdownDto>;
}
/**
 * 
 * @export
 * @interface PredictionListDto
 */
export interface PredictionListDto {
    /**
     * 
     * @type {Array<PredictionDto>}
     * @memberof PredictionListDto
     */
    items: Array<PredictionDto>;
    /**
     * 
     * @type {PaginationDetailsDto}
     * @memberof PredictionListDto
     */
    pagination: PaginationDetailsDto;
}
/**
 * 
 * @export
 * @interface PredictionOptionBreakdownDto
 */
export interface PredictionOptionBreakdownDto {
    /**
     * 
     * @type {string}
     * @memberof PredictionOptionBreakdownDto
     */
    optionId: string;
    /**
     * 
     * @type {string}
     * @memberof PredictionOptionBreakdownDto
     */
    label?: string | null;
    /**
     * Entries that picked this option
     * @type {number}
     * @memberof PredictionOptionBreakdownDto
     */
    entries: number;
    /**
     * Share of all entries, rounded — need not total exactly 100
     * @type {number}
     * @memberof PredictionOptionBreakdownDto
     */
    percent: number;
}
/**
 * 
 * @export
 * @interface PredictionOptionDto
 */
export interface PredictionOptionDto {
    /**
     * 
     * @type {string}
     * @memberof PredictionOptionDto
     */
    id: string;
    /**
     * 
     * @type {string}
     * @memberof PredictionOptionDto
     */
    label?: string | null;
    /**
     * 
     * @type {string}
     * @memberof PredictionOptionDto
     */
    optionMediaId?: string | null;
    /**
     * 
     * @type {number}
     * @memberof PredictionOptionDto
     */
    sortOrder: number;
    /**
     * 
     * @type {boolean}
     * @memberof PredictionOptionDto
     */
    isCorrect: boolean;
}
/**
 * 
 * @export
 * @interface PredictionResolvePreviewResultDto
 */
export interface PredictionResolvePreviewResultDto {
    /**
     * 
     * @type {string}
     * @memberof PredictionResolvePreviewResultDto
     */
    previewToken: string;
    /**
     * 
     * @type {number}
     * @memberof PredictionResolvePreviewResultDto
     */
    entries: number;
    /**
     * 
     * @type {number}
     * @memberof PredictionResolvePreviewResultDto
     */
    correctCount: number;
    /**
     * 
     * @type {number}
     * @memberof PredictionResolvePreviewResultDto
     */
    totalPayout: number;
    /**
     * 
     * @type {string}
     * @memberof PredictionResolvePreviewResultDto
     */
    expiresAt: string;
}
/**
 * 
 * @export
 * @interface PredictionResolveResultDto
 */
export interface PredictionResolveResultDto {
    /**
     * 
     * @type {string}
     * @memberof PredictionResolveResultDto
     */
    id: string;
    /**
     * 
     * @type {string}
     * @memberof PredictionResolveResultDto
     */
    status: string;
    /**
     * 
     * @type {string}
     * @memberof PredictionResolveResultDto
     */
    correctOptionId: string;
    /**
     * 
     * @type {number}
     * @memberof PredictionResolveResultDto
     */
    totalEntries: number;
    /**
     * 
     * @type {number}
     * @memberof PredictionResolveResultDto
     */
    correctCount: number;
}
/**
 * 
 * @export
 * @interface PredictionReverseResultDto
 */
export interface PredictionReverseResultDto {
    /**
     * 
     * @type {string}
     * @memberof PredictionReverseResultDto
     */
    id: string;
    /**
     * 
     * @type {string}
     * @memberof PredictionReverseResultDto
     */
    status: string;
    /**
     * 
     * @type {number}
     * @memberof PredictionReverseResultDto
     */
    resolutionNo: number;
    /**
     * 
     * @type {number}
     * @memberof PredictionReverseResultDto
     */
    reversed: number;
}
/**
 * 
 * @export
 * @interface PredictionVoidResultDto
 */
export interface PredictionVoidResultDto {
    /**
     * 
     * @type {string}
     * @memberof PredictionVoidResultDto
     */
    id: string;
    /**
     * 
     * @type {string}
     * @memberof PredictionVoidResultDto
     */
    status: string;
    /**
     * Number of stakes refunded
     * @type {number}
     * @memberof PredictionVoidResultDto
     */
    refunded: number;
}
/**
 * 
 * @export
 * @interface PriorTicketDto
 */
export interface PriorTicketDto {
    /**
     * 
     * @type {string}
     * @memberof PriorTicketDto
     */
    id: string;
    /**
     * 
     * @type {string}
     * @memberof PriorTicketDto
     */
    subjectType: string;
    /**
     * 
     * @type {string}
     * @memberof PriorTicketDto
     */
    category: string;
    /**
     * 
     * @type {string}
     * @memberof PriorTicketDto
     */
    severity: string;
    /**
     * 
     * @type {string}
     * @memberof PriorTicketDto
     */
    status: string;
    /**
     * 
     * @type {string}
     * @memberof PriorTicketDto
     */
    resolution?: string | null;
    /**
     * 
     * @type {string}
     * @memberof PriorTicketDto
     */
    createdAt: string;
}
/**
 * 
 * @export
 * @interface ProfileControllerReferralV1200Response
 */
export interface ProfileControllerReferralV1200Response {
    /**
     * 
     * @type {number}
     * @memberof ProfileControllerReferralV1200Response
     */
    statusCode: number;
    /**
     * 
     * @type {string}
     * @memberof ProfileControllerReferralV1200Response
     */
    status: string;
    /**
     * 
     * @type {string}
     * @memberof ProfileControllerReferralV1200Response
     */
    message: string;
    /**
     * Error details, or null on success
     * @type {object}
     * @memberof ProfileControllerReferralV1200Response
     */
    error: object | null;
    /**
     * 
     * @type {ReferralDto}
     * @memberof ProfileControllerReferralV1200Response
     */
    data?: ReferralDto;
}
/**
 * 
 * @export
 * @interface ProfileControllerScreenV1200Response
 */
export interface ProfileControllerScreenV1200Response {
    /**
     * 
     * @type {number}
     * @memberof ProfileControllerScreenV1200Response
     */
    statusCode: number;
    /**
     * 
     * @type {string}
     * @memberof ProfileControllerScreenV1200Response
     */
    status: string;
    /**
     * 
     * @type {string}
     * @memberof ProfileControllerScreenV1200Response
     */
    message: string;
    /**
     * Error details, or null on success
     * @type {object}
     * @memberof ProfileControllerScreenV1200Response
     */
    error: object | null;
    /**
     * 
     * @type {ProfileScreenDto}
     * @memberof ProfileControllerScreenV1200Response
     */
    data?: ProfileScreenDto;
}
/**
 * 
 * @export
 * @interface ProfileControllerUpdateV1200Response
 */
export interface ProfileControllerUpdateV1200Response {
    /**
     * 
     * @type {number}
     * @memberof ProfileControllerUpdateV1200Response
     */
    statusCode: number;
    /**
     * 
     * @type {string}
     * @memberof ProfileControllerUpdateV1200Response
     */
    status: string;
    /**
     * 
     * @type {string}
     * @memberof ProfileControllerUpdateV1200Response
     */
    message: string;
    /**
     * Error details, or null on success
     * @type {object}
     * @memberof ProfileControllerUpdateV1200Response
     */
    error: object | null;
    /**
     * 
     * @type {ProfileDto}
     * @memberof ProfileControllerUpdateV1200Response
     */
    data?: ProfileDto;
}
/**
 * 
 * @export
 * @interface ProfileControllerWalletV1200Response
 */
export interface ProfileControllerWalletV1200Response {
    /**
     * 
     * @type {number}
     * @memberof ProfileControllerWalletV1200Response
     */
    statusCode: number;
    /**
     * 
     * @type {string}
     * @memberof ProfileControllerWalletV1200Response
     */
    status: string;
    /**
     * 
     * @type {string}
     * @memberof ProfileControllerWalletV1200Response
     */
    message: string;
    /**
     * Error details, or null on success
     * @type {object}
     * @memberof ProfileControllerWalletV1200Response
     */
    error: object | null;
    /**
     * 
     * @type {WalletDto}
     * @memberof ProfileControllerWalletV1200Response
     */
    data?: WalletDto;
}
/**
 * 
 * @export
 * @interface ProfileDto
 */
export interface ProfileDto {
    /**
     * 
     * @type {string}
     * @memberof ProfileDto
     */
    id: string;
    /**
     * 
     * @type {string}
     * @memberof ProfileDto
     */
    accountType: string;
    /**
     * 
     * @type {string}
     * @memberof ProfileDto
     */
    email?: string | null;
    /**
     * 
     * @type {string}
     * @memberof ProfileDto
     */
    phone?: string | null;
    /**
     * 
     * @type {string}
     * @memberof ProfileDto
     */
    username?: string | null;
    /**
     * 
     * @type {string}
     * @memberof ProfileDto
     */
    firstName?: string | null;
    /**
     * 
     * @type {string}
     * @memberof ProfileDto
     */
    lastName?: string | null;
    /**
     * About You
     * @type {string}
     * @memberof ProfileDto
     */
    bio?: string | null;
    /**
     * 
     * @type {string}
     * @memberof ProfileDto
     */
    gender?: string | null;
    /**
     * 
     * @type {string}
     * @memberof ProfileDto
     */
    avatarUrl?: string | null;
    /**
     * 
     * @type {string}
     * @memberof ProfileDto
     */
    countryCode?: string | null;
    /**
     * 
     * @type {string}
     * @memberof ProfileDto
     */
    timezone?: string | null;
    /**
     * 
     * @type {boolean}
     * @memberof ProfileDto
     */
    isEmailVerified: boolean;
    /**
     * 
     * @type {boolean}
     * @memberof ProfileDto
     */
    isPhoneVerified: boolean;
    /**
     * 
     * @type {string}
     * @memberof ProfileDto
     */
    createdAt: string;
}
/**
 * 
 * @export
 * @interface ProfileScreenDto
 */
export interface ProfileScreenDto {
    /**
     * 
     * @type {ProfileDto}
     * @memberof ProfileScreenDto
     */
    profile: ProfileDto;
    /**
     * 
     * @type {WalletDto}
     * @memberof ProfileScreenDto
     */
    wallet: WalletDto;
    /**
     * 
     * @type {StreakDto}
     * @memberof ProfileScreenDto
     */
    streak: StreakDto;
    /**
     * 
     * @type {SubscriptionSummaryDto}
     * @memberof ProfileScreenDto
     */
    subscription?: SubscriptionSummaryDto | null;
    /**
     * Unread notification badge count
     * @type {number}
     * @memberof ProfileScreenDto
     */
    unreadNotifications: number;
}
/**
 * 
 * @export
 * @interface ProgressResponseDto
 */
export interface ProgressResponseDto {
    /**
     * 
     * @type {number}
     * @memberof ProgressResponseDto
     */
    lastPositionSeconds: number;
    /**
     * 
     * @type {boolean}
     * @memberof ProgressResponseDto
     */
    isCompleted: boolean;
    /**
     * 
     * @type {string}
     * @memberof ProgressResponseDto
     */
    updatedAt?: string | null;
    /**
     * Heartbeat only — streak progress for today
     * @type {StreakTodayDto}
     * @memberof ProgressResponseDto
     */
    today?: StreakTodayDto;
}
/**
 * 
 * @export
 * @interface PublishRegionDto
 */
export interface PublishRegionDto {
    /**
     * 
     * @type {string}
     * @memberof PublishRegionDto
     */
    region: PublishRegionDtoRegionEnum;
    /**
     * Live in this region (false = selected but switched off)
     * @type {boolean}
     * @memberof PublishRegionDto
     */
    live: boolean;
}


/**
 * @export
 */
export const PublishRegionDtoRegionEnum = {
    Na: 'NA',
    Eu: 'EU',
    Apac: 'APAC',
    Latam: 'LATAM',
    Mea: 'MEA'
} as const;
export type PublishRegionDtoRegionEnum = typeof PublishRegionDtoRegionEnum[keyof typeof PublishRegionDtoRegionEnum];

/**
 * 
 * @export
 * @interface QuestActionDto
 */
export interface QuestActionDto {
    /**
     * 
     * @type {string}
     * @memberof QuestActionDto
     */
    key: string;
    /**
     * 
     * @type {string}
     * @memberof QuestActionDto
     */
    type: QuestActionDtoTypeEnum;
    /**
     * 
     * @type {string}
     * @memberof QuestActionDto
     */
    title: string;
    /**
     * 
     * @type {string}
     * @memberof QuestActionDto
     */
    description?: string;
    /**
     * 
     * @type {number}
     * @memberof QuestActionDto
     */
    target?: number;
    /**
     * 
     * @type {string}
     * @memberof QuestActionDto
     */
    imageMediaId?: string;
    /**
     * 
     * @type {Array<string>}
     * @memberof QuestActionDto
     */
    curatedContentIds?: Array<string>;
}


/**
 * @export
 */
export const QuestActionDtoTypeEnum = {
    Watch: 'watch',
    Like: 'like',
    Comment: 'comment',
    Share: 'share'
} as const;
export type QuestActionDtoTypeEnum = typeof QuestActionDtoTypeEnum[keyof typeof QuestActionDtoTypeEnum];

/**
 * 
 * @export
 * @interface QuestActionProgressDto
 */
export interface QuestActionProgressDto {
    /**
     * 
     * @type {string}
     * @memberof QuestActionProgressDto
     */
    key: string;
    /**
     * 
     * @type {string}
     * @memberof QuestActionProgressDto
     */
    type: QuestActionProgressDtoTypeEnum;
    /**
     * 
     * @type {string}
     * @memberof QuestActionProgressDto
     */
    title: string;
    /**
     * 
     * @type {string}
     * @memberof QuestActionProgressDto
     */
    description?: string | null;
    /**
     * 
     * @type {string}
     * @memberof QuestActionProgressDto
     */
    imageMediaId?: string | null;
    /**
     * 
     * @type {number}
     * @memberof QuestActionProgressDto
     */
    target: number;
    /**
     * 
     * @type {number}
     * @memberof QuestActionProgressDto
     */
    done: number;
    /**
     * 
     * @type {Array<string>}
     * @memberof QuestActionProgressDto
     */
    curatedContentIds: Array<string>;
}


/**
 * @export
 */
export const QuestActionProgressDtoTypeEnum = {
    Watch: 'watch',
    Like: 'like',
    Comment: 'comment',
    Share: 'share'
} as const;
export type QuestActionProgressDtoTypeEnum = typeof QuestActionProgressDtoTypeEnum[keyof typeof QuestActionProgressDtoTypeEnum];

/**
 * 
 * @export
 * @interface QuestCancelResultDto
 */
export interface QuestCancelResultDto {
    /**
     * 
     * @type {string}
     * @memberof QuestCancelResultDto
     */
    id: string;
    /**
     * 
     * @type {string}
     * @memberof QuestCancelResultDto
     */
    status: string;
    /**
     * Completed-but-unclaimed participations paid automatically
     * @type {number}
     * @memberof QuestCancelResultDto
     */
    autoClaimedCount: number;
}
/**
 * 
 * @export
 * @interface QuestClaimResultDto
 */
export interface QuestClaimResultDto {
    /**
     * 
     * @type {number}
     * @memberof QuestClaimResultDto
     */
    rewardedPoints: number;
    /**
     * 
     * @type {boolean}
     * @memberof QuestClaimResultDto
     */
    alreadyClaimed: boolean;
}
/**
 * 
 * @export
 * @interface QuestControllerActiveV1200Response
 */
export interface QuestControllerActiveV1200Response {
    /**
     * 
     * @type {number}
     * @memberof QuestControllerActiveV1200Response
     */
    statusCode: number;
    /**
     * 
     * @type {string}
     * @memberof QuestControllerActiveV1200Response
     */
    status: string;
    /**
     * 
     * @type {string}
     * @memberof QuestControllerActiveV1200Response
     */
    message: string;
    /**
     * Error details, or null on success
     * @type {object}
     * @memberof QuestControllerActiveV1200Response
     */
    error: object | null;
    /**
     * 
     * @type {QuestsListResponseDto}
     * @memberof QuestControllerActiveV1200Response
     */
    data?: QuestsListResponseDto;
}
/**
 * 
 * @export
 * @interface QuestControllerClaimV1200Response
 */
export interface QuestControllerClaimV1200Response {
    /**
     * 
     * @type {number}
     * @memberof QuestControllerClaimV1200Response
     */
    statusCode: number;
    /**
     * 
     * @type {string}
     * @memberof QuestControllerClaimV1200Response
     */
    status: string;
    /**
     * 
     * @type {string}
     * @memberof QuestControllerClaimV1200Response
     */
    message: string;
    /**
     * Error details, or null on success
     * @type {object}
     * @memberof QuestControllerClaimV1200Response
     */
    error: object | null;
    /**
     * 
     * @type {QuestClaimResultDto}
     * @memberof QuestControllerClaimV1200Response
     */
    data?: QuestClaimResultDto;
}
/**
 * 
 * @export
 * @interface QuestControllerDetailV1200Response
 */
export interface QuestControllerDetailV1200Response {
    /**
     * 
     * @type {number}
     * @memberof QuestControllerDetailV1200Response
     */
    statusCode: number;
    /**
     * 
     * @type {string}
     * @memberof QuestControllerDetailV1200Response
     */
    status: string;
    /**
     * 
     * @type {string}
     * @memberof QuestControllerDetailV1200Response
     */
    message: string;
    /**
     * Error details, or null on success
     * @type {object}
     * @memberof QuestControllerDetailV1200Response
     */
    error: object | null;
    /**
     * 
     * @type {QuestCustomerDetailDto}
     * @memberof QuestControllerDetailV1200Response
     */
    data?: QuestCustomerDetailDto;
}
/**
 * 
 * @export
 * @interface QuestControllerStartV1200Response
 */
export interface QuestControllerStartV1200Response {
    /**
     * 
     * @type {number}
     * @memberof QuestControllerStartV1200Response
     */
    statusCode: number;
    /**
     * 
     * @type {string}
     * @memberof QuestControllerStartV1200Response
     */
    status: string;
    /**
     * 
     * @type {string}
     * @memberof QuestControllerStartV1200Response
     */
    message: string;
    /**
     * Error details, or null on success
     * @type {object}
     * @memberof QuestControllerStartV1200Response
     */
    error: object | null;
    /**
     * 
     * @type {QuestStartResultDto}
     * @memberof QuestControllerStartV1200Response
     */
    data?: QuestStartResultDto;
}
/**
 * 
 * @export
 * @interface QuestCustomerDetailDto
 */
export interface QuestCustomerDetailDto {
    /**
     * 
     * @type {string}
     * @memberof QuestCustomerDetailDto
     */
    id: string;
    /**
     * 
     * @type {string}
     * @memberof QuestCustomerDetailDto
     */
    title: string;
    /**
     * 
     * @type {string}
     * @memberof QuestCustomerDetailDto
     */
    description?: string | null;
    /**
     * 
     * @type {string}
     * @memberof QuestCustomerDetailDto
     */
    bannerMediaId?: string | null;
    /**
     * 
     * @type {number}
     * @memberof QuestCustomerDetailDto
     */
    rewardPoints: number;
    /**
     * 
     * @type {string}
     * @memberof QuestCustomerDetailDto
     */
    status: string;
    /**
     * 
     * @type {string}
     * @memberof QuestCustomerDetailDto
     */
    startAt: string;
    /**
     * 
     * @type {string}
     * @memberof QuestCustomerDetailDto
     */
    endAt: string;
    /**
     * 
     * @type {boolean}
     * @memberof QuestCustomerDetailDto
     */
    featured: boolean;
    /**
     * 
     * @type {QuestLockDto}
     * @memberof QuestCustomerDetailDto
     */
    lock?: QuestLockDto | null;
    /**
     * 
     * @type {QuestParticipationSummaryDto}
     * @memberof QuestCustomerDetailDto
     */
    participation: QuestParticipationSummaryDto;
    /**
     * 
     * @type {Array<QuestActionProgressDto>}
     * @memberof QuestCustomerDetailDto
     */
    actions: Array<QuestActionProgressDto>;
}
/**
 * 
 * @export
 * @interface QuestDeletedResultDto
 */
export interface QuestDeletedResultDto {
    /**
     * 
     * @type {boolean}
     * @memberof QuestDeletedResultDto
     */
    deleted: boolean;
}
/**
 * 
 * @export
 * @interface QuestDetailDto
 */
export interface QuestDetailDto {
    /**
     * 
     * @type {string}
     * @memberof QuestDetailDto
     */
    id: string;
    /**
     * 
     * @type {string}
     * @memberof QuestDetailDto
     */
    name: string;
    /**
     * 
     * @type {string}
     * @memberof QuestDetailDto
     */
    description?: string | null;
    /**
     * 
     * @type {number}
     * @memberof QuestDetailDto
     */
    rewardPoints: number;
    /**
     * 
     * @type {string}
     * @memberof QuestDetailDto
     */
    startAt: string;
    /**
     * 
     * @type {string}
     * @memberof QuestDetailDto
     */
    endAt: string;
    /**
     * 
     * @type {string}
     * @memberof QuestDetailDto
     */
    status: string;
    /**
     * 
     * @type {boolean}
     * @memberof QuestDetailDto
     */
    featuredFlag: boolean;
    /**
     * 
     * @type {string}
     * @memberof QuestDetailDto
     */
    bannerMediaId?: string | null;
    /**
     * Resolved CDN URL for bannerMediaId; null when unset, or while the asset is not READY+PUBLIC
     * @type {string}
     * @memberof QuestDetailDto
     */
    bannerUrl?: string | null;
    /**
     * 
     * @type {Array<string>}
     * @memberof QuestDetailDto
     */
    geofenceCountries?: Array<string> | null;
    /**
     * 
     * @type {number}
     * @memberof QuestDetailDto
     */
    claimGraceDays?: number | null;
    /**
     * Users who started this quest
     * @type {number}
     * @memberof QuestDetailDto
     */
    participantCount: number;
    /**
     * Users who finished every non-voided action
     * @type {number}
     * @memberof QuestDetailDto
     */
    completedCount: number;
    /**
     * Points actually credited for this quest (from the ledger, not rewardPoints × claims)
     * @type {number}
     * @memberof QuestDetailDto
     */
    pointsPaid: number;
    /**
     * 
     * @type {Array<QuestActionDto>}
     * @memberof QuestDetailDto
     */
    actions: Array<QuestActionDto>;
}
/**
 * 
 * @export
 * @interface QuestDto
 */
export interface QuestDto {
    /**
     * 
     * @type {string}
     * @memberof QuestDto
     */
    id: string;
    /**
     * 
     * @type {string}
     * @memberof QuestDto
     */
    name: string;
    /**
     * 
     * @type {string}
     * @memberof QuestDto
     */
    description?: string | null;
    /**
     * 
     * @type {number}
     * @memberof QuestDto
     */
    rewardPoints: number;
    /**
     * 
     * @type {string}
     * @memberof QuestDto
     */
    startAt: string;
    /**
     * 
     * @type {string}
     * @memberof QuestDto
     */
    endAt: string;
    /**
     * 
     * @type {string}
     * @memberof QuestDto
     */
    status: string;
    /**
     * 
     * @type {boolean}
     * @memberof QuestDto
     */
    featuredFlag: boolean;
    /**
     * 
     * @type {string}
     * @memberof QuestDto
     */
    bannerMediaId?: string | null;
    /**
     * Resolved CDN URL for bannerMediaId; null when unset, or while the asset is not READY+PUBLIC
     * @type {string}
     * @memberof QuestDto
     */
    bannerUrl?: string | null;
    /**
     * 
     * @type {Array<string>}
     * @memberof QuestDto
     */
    geofenceCountries?: Array<string> | null;
    /**
     * 
     * @type {number}
     * @memberof QuestDto
     */
    claimGraceDays?: number | null;
    /**
     * Users who started this quest
     * @type {number}
     * @memberof QuestDto
     */
    participantCount: number;
    /**
     * Users who finished every non-voided action
     * @type {number}
     * @memberof QuestDto
     */
    completedCount: number;
    /**
     * Points actually credited for this quest (from the ledger, not rewardPoints × claims)
     * @type {number}
     * @memberof QuestDto
     */
    pointsPaid: number;
}
/**
 * 
 * @export
 * @interface QuestListDto
 */
export interface QuestListDto {
    /**
     * 
     * @type {Array<QuestDto>}
     * @memberof QuestListDto
     */
    items: Array<QuestDto>;
    /**
     * 
     * @type {PaginationDetailsDto}
     * @memberof QuestListDto
     */
    pagination: PaginationDetailsDto;
}
/**
 * 
 * @export
 * @interface QuestLockDto
 */
export interface QuestLockDto {
    /**
     * 
     * @type {boolean}
     * @memberof QuestLockDto
     */
    locked: boolean;
    /**
     * 
     * @type {number}
     * @memberof QuestLockDto
     */
    required: number;
    /**
     * 
     * @type {number}
     * @memberof QuestLockDto
     */
    current: number;
}
/**
 * 
 * @export
 * @interface QuestParticipantDto
 */
export interface QuestParticipantDto {
    /**
     * 
     * @type {string}
     * @memberof QuestParticipantDto
     */
    userId: string;
    /**
     * 
     * @type {string}
     * @memberof QuestParticipantDto
     */
    username?: string | null;
    /**
     * 
     * @type {string}
     * @memberof QuestParticipantDto
     */
    firstName?: string | null;
    /**
     * 
     * @type {string}
     * @memberof QuestParticipantDto
     */
    lastName?: string | null;
    /**
     * 
     * @type {string}
     * @memberof QuestParticipantDto
     */
    avatarUrl?: string | null;
    /**
     * 
     * @type {string}
     * @memberof QuestParticipantDto
     */
    status: QuestParticipantDtoStatusEnum;
    /**
     * 
     * @type {string}
     * @memberof QuestParticipantDto
     */
    startedAt?: string | null;
    /**
     * 
     * @type {string}
     * @memberof QuestParticipantDto
     */
    completedAt?: string | null;
    /**
     * 
     * @type {string}
     * @memberof QuestParticipantDto
     */
    claimedAt?: string | null;
    /**
     * 
     * @type {number}
     * @memberof QuestParticipantDto
     */
    actionsDone: number;
    /**
     * Snapshotted at start — a user keeps their own denominator if the quest changes
     * @type {number}
     * @memberof QuestParticipantDto
     */
    actionsTotal: number;
    /**
     * 
     * @type {number}
     * @memberof QuestParticipantDto
     */
    completedInDays?: number | null;
    /**
     * 
     * @type {string}
     * @memberof QuestParticipantDto
     */
    badgeAwardedSlug?: string | null;
    /**
     * Points credited to this user for this quest; 0 until claimed
     * @type {number}
     * @memberof QuestParticipantDto
     */
    pointsPaid: number;
}


/**
 * @export
 */
export const QuestParticipantDtoStatusEnum = {
    InProgress: 'in_progress',
    Completed: 'completed',
    Claimed: 'claimed'
} as const;
export type QuestParticipantDtoStatusEnum = typeof QuestParticipantDtoStatusEnum[keyof typeof QuestParticipantDtoStatusEnum];

/**
 * 
 * @export
 * @interface QuestParticipantsListDto
 */
export interface QuestParticipantsListDto {
    /**
     * 
     * @type {Array<QuestParticipantDto>}
     * @memberof QuestParticipantsListDto
     */
    items: Array<QuestParticipantDto>;
    /**
     * 
     * @type {PaginationDetailsDto}
     * @memberof QuestParticipantsListDto
     */
    pagination: PaginationDetailsDto;
    /**
     * Totals for the whole quest — unaffected by `status`/paging
     * @type {QuestStatsDto}
     * @memberof QuestParticipantsListDto
     */
    summary: QuestStatsDto;
}
/**
 * 
 * @export
 * @interface QuestParticipationSummaryDto
 */
export interface QuestParticipationSummaryDto {
    /**
     * 
     * @type {string}
     * @memberof QuestParticipationSummaryDto
     */
    status: QuestParticipationSummaryDtoStatusEnum;
    /**
     * 
     * @type {string}
     * @memberof QuestParticipationSummaryDto
     */
    startedAt?: string | null;
    /**
     * 
     * @type {number}
     * @memberof QuestParticipationSummaryDto
     */
    actionsDone: number;
    /**
     * 
     * @type {number}
     * @memberof QuestParticipationSummaryDto
     */
    actionsTotal: number;
    /**
     * 
     * @type {number}
     * @memberof QuestParticipationSummaryDto
     */
    completedInDays?: number | null;
}


/**
 * @export
 */
export const QuestParticipationSummaryDtoStatusEnum = {
    NotStarted: 'not_started',
    InProgress: 'in_progress',
    Completed: 'completed',
    Claimed: 'claimed'
} as const;
export type QuestParticipationSummaryDtoStatusEnum = typeof QuestParticipationSummaryDtoStatusEnum[keyof typeof QuestParticipationSummaryDtoStatusEnum];

/**
 * 
 * @export
 * @interface QuestStartResultDto
 */
export interface QuestStartResultDto {
    /**
     * False when already started (idempotent)
     * @type {boolean}
     * @memberof QuestStartResultDto
     */
    started: boolean;
}
/**
 * 
 * @export
 * @interface QuestStatsDto
 */
export interface QuestStatsDto {
    /**
     * 
     * @type {number}
     * @memberof QuestStatsDto
     */
    participantCount: number;
    /**
     * 
     * @type {number}
     * @memberof QuestStatsDto
     */
    completedCount: number;
    /**
     * 
     * @type {number}
     * @memberof QuestStatsDto
     */
    pointsPaid: number;
}
/**
 * 
 * @export
 * @interface QuestStatusResultDto
 */
export interface QuestStatusResultDto {
    /**
     * 
     * @type {string}
     * @memberof QuestStatusResultDto
     */
    id: string;
    /**
     * 
     * @type {string}
     * @memberof QuestStatusResultDto
     */
    status: string;
}
/**
 * 
 * @export
 * @interface QuestSummaryDto
 */
export interface QuestSummaryDto {
    /**
     * 
     * @type {string}
     * @memberof QuestSummaryDto
     */
    id: string;
    /**
     * 
     * @type {string}
     * @memberof QuestSummaryDto
     */
    title: string;
    /**
     * 
     * @type {string}
     * @memberof QuestSummaryDto
     */
    description?: string | null;
    /**
     * 
     * @type {string}
     * @memberof QuestSummaryDto
     */
    bannerMediaId?: string | null;
    /**
     * 
     * @type {number}
     * @memberof QuestSummaryDto
     */
    rewardPoints: number;
    /**
     * 
     * @type {string}
     * @memberof QuestSummaryDto
     */
    status: string;
    /**
     * 
     * @type {string}
     * @memberof QuestSummaryDto
     */
    startAt: string;
    /**
     * 
     * @type {string}
     * @memberof QuestSummaryDto
     */
    endAt: string;
    /**
     * 
     * @type {boolean}
     * @memberof QuestSummaryDto
     */
    featured: boolean;
    /**
     * 
     * @type {QuestLockDto}
     * @memberof QuestSummaryDto
     */
    lock?: QuestLockDto | null;
    /**
     * 
     * @type {QuestParticipationSummaryDto}
     * @memberof QuestSummaryDto
     */
    participation: QuestParticipationSummaryDto;
}
/**
 * 
 * @export
 * @interface QuestsListResponseDto
 */
export interface QuestsListResponseDto {
    /**
     * 
     * @type {QuestSummaryDto}
     * @memberof QuestsListResponseDto
     */
    featured?: QuestSummaryDto | null;
    /**
     * 
     * @type {Array<QuestSummaryDto>}
     * @memberof QuestsListResponseDto
     */
    quests: Array<QuestSummaryDto>;
    /**
     * 
     * @type {string}
     * @memberof QuestsListResponseDto
     */
    serverTime: string;
}
/**
 * 
 * @export
 * @interface RankBoardDto
 */
export interface RankBoardDto {
    /**
     * 
     * @type {string}
     * @memberof RankBoardDto
     */
    region: RankBoardDtoRegionEnum;
    /**
     * 
     * @type {string}
     * @memberof RankBoardDto
     */
    from: string;
    /**
     * 
     * @type {string}
     * @memberof RankBoardDto
     */
    to: string;
    /**
     * 
     * @type {Array<RankSlotDto>}
     * @memberof RankBoardDto
     */
    ranks: Array<RankSlotDto>;
    /**
     * Lowest rank free for the whole window, null when all are booked
     * @type {number}
     * @memberof RankBoardDto
     */
    nextFreeRank?: number | null;
}


/**
 * @export
 */
export const RankBoardDtoRegionEnum = {
    Na: 'NA',
    Eu: 'EU',
    Apac: 'APAC',
    Latam: 'LATAM',
    Mea: 'MEA'
} as const;
export type RankBoardDtoRegionEnum = typeof RankBoardDtoRegionEnum[keyof typeof RankBoardDtoRegionEnum];

/**
 * 
 * @export
 * @interface RankBookingDto
 */
export interface RankBookingDto {
    /**
     * 
     * @type {string}
     * @memberof RankBookingDto
     */
    campaignId: string;
    /**
     * 
     * @type {string}
     * @memberof RankBookingDto
     */
    campaignName: string;
    /**
     * 
     * @type {string}
     * @memberof RankBookingDto
     */
    advertiserName: string;
    /**
     * 
     * @type {string}
     * @memberof RankBookingDto
     */
    status: RankBookingDtoStatusEnum;
    /**
     * 
     * @type {number}
     * @memberof RankBookingDto
     */
    rank: number;
    /**
     * 
     * @type {string}
     * @memberof RankBookingDto
     */
    startsAt: string;
    /**
     * 
     * @type {string}
     * @memberof RankBookingDto
     */
    endsAt: string;
}


/**
 * @export
 */
export const RankBookingDtoStatusEnum = {
    Draft: 'draft',
    Scheduled: 'scheduled',
    Active: 'active',
    Paused: 'paused',
    Ended: 'ended'
} as const;
export type RankBookingDtoStatusEnum = typeof RankBookingDtoStatusEnum[keyof typeof RankBookingDtoStatusEnum];

/**
 * 
 * @export
 * @interface RankSlotDto
 */
export interface RankSlotDto {
    /**
     * 
     * @type {number}
     * @memberof RankSlotDto
     */
    rank: number;
    /**
     * Held by these ads during the window (empty = free)
     * @type {Array<RankBookingDto>}
     * @memberof RankSlotDto
     */
    bookings: Array<RankBookingDto>;
}
/**
 * 
 * @export
 * @interface ReactionControllerGetV1200Response
 */
export interface ReactionControllerGetV1200Response {
    /**
     * 
     * @type {number}
     * @memberof ReactionControllerGetV1200Response
     */
    statusCode: number;
    /**
     * 
     * @type {string}
     * @memberof ReactionControllerGetV1200Response
     */
    status: string;
    /**
     * 
     * @type {string}
     * @memberof ReactionControllerGetV1200Response
     */
    message: string;
    /**
     * Error details, or null on success
     * @type {object}
     * @memberof ReactionControllerGetV1200Response
     */
    error: object | null;
    /**
     * 
     * @type {ReactionStateDto}
     * @memberof ReactionControllerGetV1200Response
     */
    data?: ReactionStateDto;
}
/**
 * 
 * @export
 * @interface ReactionControllerMineV1200Response
 */
export interface ReactionControllerMineV1200Response {
    /**
     * 
     * @type {number}
     * @memberof ReactionControllerMineV1200Response
     */
    statusCode: number;
    /**
     * 
     * @type {string}
     * @memberof ReactionControllerMineV1200Response
     */
    status: string;
    /**
     * 
     * @type {string}
     * @memberof ReactionControllerMineV1200Response
     */
    message: string;
    /**
     * Error details, or null on success
     * @type {object}
     * @memberof ReactionControllerMineV1200Response
     */
    error: object | null;
    /**
     * 
     * @type {BatchReactionsDto}
     * @memberof ReactionControllerMineV1200Response
     */
    data?: BatchReactionsDto;
}
/**
 * 
 * @export
 * @interface ReactionStateDto
 */
export interface ReactionStateDto {
    /**
     * The caller's current reaction
     * @type {string}
     * @memberof ReactionStateDto
     */
    reaction?: ReactionStateDtoReactionEnum | null;
    /**
     * 
     * @type {number}
     * @memberof ReactionStateDto
     */
    likeCount: number;
    /**
     * 
     * @type {number}
     * @memberof ReactionStateDto
     */
    dislikeCount: number;
}


/**
 * @export
 */
export const ReactionStateDtoReactionEnum = {
    Like: 'like',
    Dislike: 'dislike'
} as const;
export type ReactionStateDtoReactionEnum = typeof ReactionStateDtoReactionEnum[keyof typeof ReactionStateDtoReactionEnum];

/**
 * 
 * @export
 * @interface RealtimeAnalyticsDto
 */
export interface RealtimeAnalyticsDto {
    /**
     * Distinct viewers with a heartbeat in the last 5 minutes
     * @type {number}
     * @memberof RealtimeAnalyticsDto
     */
    liveViewers: number;
    /**
     * Views started in the last hour
     * @type {number}
     * @memberof RealtimeAnalyticsDto
     */
    viewsLastHour: number;
    /**
     * Customer signups today
     * @type {number}
     * @memberof RealtimeAnalyticsDto
     */
    signupsToday: number;
    /**
     * Points earned today
     * @type {number}
     * @memberof RealtimeAnalyticsDto
     */
    pointsEarnedToday: number;
}
/**
 * 
 * @export
 * @interface RecommendedActionDto
 */
export interface RecommendedActionDto {
    /**
     * Stable rule id — the client maps it to its own screen/filter
     * @type {string}
     * @memberof RecommendedActionDto
     */
    key: RecommendedActionDtoKeyEnum;
    /**
     * How many items the rule matched (never 0 — empty rules are omitted)
     * @type {number}
     * @memberof RecommendedActionDto
     */
    count: number;
    /**
     * 
     * @type {string}
     * @memberof RecommendedActionDto
     */
    severity: RecommendedActionDtoSeverityEnum;
    /**
     * Count already embedded, plural-correct
     * @type {string}
     * @memberof RecommendedActionDto
     */
    title: string;
    /**
     * 
     * @type {string}
     * @memberof RecommendedActionDto
     */
    detail: string;
    /**
     * Button label
     * @type {string}
     * @memberof RecommendedActionDto
     */
    cta: string;
}


/**
 * @export
 */
export const RecommendedActionDtoKeyEnum = {
    PendingReview: 'pending_review',
    LicensesExpiring: 'licenses_expiring',
    RejectedFollowup: 'rejected_followup'
} as const;
export type RecommendedActionDtoKeyEnum = typeof RecommendedActionDtoKeyEnum[keyof typeof RecommendedActionDtoKeyEnum];

/**
 * @export
 */
export const RecommendedActionDtoSeverityEnum = {
    High: 'high',
    Medium: 'medium',
    Low: 'low'
} as const;
export type RecommendedActionDtoSeverityEnum = typeof RecommendedActionDtoSeverityEnum[keyof typeof RecommendedActionDtoSeverityEnum];

/**
 * 
 * @export
 * @interface RedemptionWeekDto
 */
export interface RedemptionWeekDto {
    /**
     * 
     * @type {string}
     * @memberof RedemptionWeekDto
     */
    week: string;
    /**
     * 
     * @type {string}
     * @memberof RedemptionWeekDto
     */
    weekStart: string;
    /**
     * 
     * @type {number}
     * @memberof RedemptionWeekDto
     */
    rate: number;
}
/**
 * 
 * @export
 * @interface ReferralCountsDto
 */
export interface ReferralCountsDto {
    /**
     * 
     * @type {number}
     * @memberof ReferralCountsDto
     */
    total?: number | null;
    /**
     * Qualified or rewarded redemptions
     * @type {number}
     * @memberof ReferralCountsDto
     */
    completed?: number | null;
}
/**
 * 
 * @export
 * @interface ReferralDto
 */
export interface ReferralDto {
    /**
     * My shareable referral code
     * @type {string}
     * @memberof ReferralDto
     */
    code: string;
    /**
     * Friends who completed referral
     * @type {number}
     * @memberof ReferralDto
     */
    completedReferrals: number;
}
/**
 * 
 * @export
 * @interface ReferralInviteDto
 */
export interface ReferralInviteDto {
    /**
     * 
     * @type {string}
     * @memberof ReferralInviteDto
     */
    refereeId?: string | null;
    /**
     * 
     * @type {string}
     * @memberof ReferralInviteDto
     */
    username?: string | null;
    /**
     * 
     * @type {string}
     * @memberof ReferralInviteDto
     */
    status?: string | null;
    /**
     * 
     * @type {string}
     * @memberof ReferralInviteDto
     */
    createdAt?: string | null;
}
/**
 * 
 * @export
 * @interface ReferralsDto
 */
export interface ReferralsDto {
    /**
     * The customer's referral code
     * @type {string}
     * @memberof ReferralsDto
     */
    code?: string | null;
    /**
     * Invited users (max 100)
     * @type {Array<ReferralInviteDto>}
     * @memberof ReferralsDto
     */
    invited: Array<ReferralInviteDto>;
    /**
     * 
     * @type {ReferralCountsDto}
     * @memberof ReferralsDto
     */
    counts: ReferralCountsDto;
}
/**
 * 
 * @export
 * @interface RefreshDto
 */
export interface RefreshDto {
    /**
     * Refresh token (mobile). Web sends it via cookie.
     * @type {string}
     * @memberof RefreshDto
     */
    refreshToken?: string;
}
/**
 * 
 * @export
 * @interface RefreshResponseDto
 */
export interface RefreshResponseDto {
    /**
     * New access token (mobile). Web receives it as a cookie.
     * @type {string}
     * @memberof RefreshResponseDto
     */
    accessToken: string;
    /**
     * Rotated double-submit CSRF token (admin web refresh only; also set as the `csrf` cookie). Send it as `x-csrf-token` on mutations.
     * @type {string}
     * @memberof RefreshResponseDto
     */
    csrfToken?: string;
}
/**
 * 
 * @export
 * @interface RegionAnalyticsDto
 */
export interface RegionAnalyticsDto {
    /**
     * 
     * @type {string}
     * @memberof RegionAnalyticsDto
     */
    code: string;
    /**
     * 
     * @type {string}
     * @memberof RegionAnalyticsDto
     */
    name: string;
    /**
     * Parent macro-region for country scopes
     * @type {string}
     * @memberof RegionAnalyticsDto
     */
    macro?: string | null;
    /**
     * Scope customers ÷ all customers
     * @type {number}
     * @memberof RegionAnalyticsDto
     */
    factor: number;
    /**
     * 
     * @type {string}
     * @memberof RegionAnalyticsDto
     */
    from: string;
    /**
     * 
     * @type {string}
     * @memberof RegionAnalyticsDto
     */
    to: string;
    /**
     * 
     * @type {StripDto}
     * @memberof RegionAnalyticsDto
     */
    strip: StripDto;
    /**
     * 
     * @type {UserAnalyticsDataDto}
     * @memberof RegionAnalyticsDto
     */
    userAnalytics: UserAnalyticsDataDto;
    /**
     * 
     * @type {GamificationDataDto}
     * @memberof RegionAnalyticsDto
     */
    gamification: GamificationDataDto;
    /**
     * 
     * @type {ScreenTimeDataDto}
     * @memberof RegionAnalyticsDto
     */
    screenTime: ScreenTimeDataDto;
    /**
     * 
     * @type {MonetizationDataDto}
     * @memberof RegionAnalyticsDto
     */
    monetization: MonetizationDataDto;
    /**
     * 
     * @type {CommunityDataDto}
     * @memberof RegionAnalyticsDto
     */
    community: CommunityDataDto;
    /**
     * 
     * @type {GraphsDataDto}
     * @memberof RegionAnalyticsDto
     */
    graphs: GraphsDataDto;
}
/**
 * 
 * @export
 * @interface RegionCatalogDto
 */
export interface RegionCatalogDto {
    /**
     * 
     * @type {Array<RegionDto>}
     * @memberof RegionCatalogDto
     */
    regions: Array<RegionDto>;
    /**
     * Distinct currencies across the returned countries
     * @type {Array<CurrencyDto>}
     * @memberof RegionCatalogDto
     */
    currencies: Array<CurrencyDto>;
}
/**
 * 
 * @export
 * @interface RegionDto
 */
export interface RegionDto {
    /**
     * 
     * @type {string}
     * @memberof RegionDto
     */
    code: string;
    /**
     * 
     * @type {string}
     * @memberof RegionDto
     */
    label: string;
    /**
     * Countries in this region that are currently supported
     * @type {number}
     * @memberof RegionDto
     */
    supportedCount: number;
    /**
     * 
     * @type {Array<CountryDto>}
     * @memberof RegionDto
     */
    countries: Array<CountryDto>;
}
/**
 * 
 * @export
 * @interface RegionItemDto
 */
export interface RegionItemDto {
    /**
     * 
     * @type {string}
     * @memberof RegionItemDto
     */
    region: RegionItemDtoRegionEnum;
    /**
     * 
     * @type {boolean}
     * @memberof RegionItemDto
     */
    live: boolean;
}


/**
 * @export
 */
export const RegionItemDtoRegionEnum = {
    Na: 'NA',
    Eu: 'EU',
    Apac: 'APAC',
    Latam: 'LATAM',
    Mea: 'MEA'
} as const;
export type RegionItemDtoRegionEnum = typeof RegionItemDtoRegionEnum[keyof typeof RegionItemDtoRegionEnum];

/**
 * 
 * @export
 * @interface RegionPriceDto
 */
export interface RegionPriceDto {
    /**
     * 
     * @type {string}
     * @memberof RegionPriceDto
     */
    region: string;
    /**
     * 
     * @type {number}
     * @memberof RegionPriceDto
     */
    priceCents: number;
    /**
     * 
     * @type {string}
     * @memberof RegionPriceDto
     */
    currency: string;
}
/**
 * 
 * @export
 * @interface RegionPriceResultDto
 */
export interface RegionPriceResultDto {
    /**
     * 
     * @type {string}
     * @memberof RegionPriceResultDto
     */
    region: RegionPriceResultDtoRegionEnum;
    /**
     * 
     * @type {number}
     * @memberof RegionPriceResultDto
     */
    priceCents: number;
    /**
     * 
     * @type {string}
     * @memberof RegionPriceResultDto
     */
    currency: string;
}


/**
 * @export
 */
export const RegionPriceResultDtoRegionEnum = {
    Na: 'NA',
    Eu: 'EU',
    Apac: 'APAC',
    Latam: 'LATAM',
    Mea: 'MEA'
} as const;
export type RegionPriceResultDtoRegionEnum = typeof RegionPriceResultDtoRegionEnum[keyof typeof RegionPriceResultDtoRegionEnum];

/**
 * 
 * @export
 * @interface RegionRanksDto
 */
export interface RegionRanksDto {
    /**
     * North America
     * @type {number}
     * @memberof RegionRanksDto
     */
    NA?: number;
    /**
     * Europe
     * @type {number}
     * @memberof RegionRanksDto
     */
    EU?: number;
    /**
     * Asia-Pacific
     * @type {number}
     * @memberof RegionRanksDto
     */
    APAC?: number;
    /**
     * Latin America
     * @type {number}
     * @memberof RegionRanksDto
     */
    LATAM?: number;
    /**
     * Middle East & Africa
     * @type {number}
     * @memberof RegionRanksDto
     */
    MEA?: number;
}
/**
 * 
 * @export
 * @interface RegionsResponseDto
 */
export interface RegionsResponseDto {
    /**
     * All selected regions
     * @type {Array<string>}
     * @memberof RegionsResponseDto
     */
    regions: Array<string>;
    /**
     * Regions switched Live
     * @type {Array<string>}
     * @memberof RegionsResponseDto
     */
    liveRegions: Array<string>;
    /**
     * 
     * @type {Array<RegionItemDto>}
     * @memberof RegionsResponseDto
     */
    items: Array<RegionItemDto>;
}
/**
 * 
 * @export
 * @interface RegionsSummaryDto
 */
export interface RegionsSummaryDto {
    /**
     * 
     * @type {string}
     * @memberof RegionsSummaryDto
     */
    from: string;
    /**
     * 
     * @type {string}
     * @memberof RegionsSummaryDto
     */
    to: string;
    /**
     * 
     * @type {Array<MacroRegionSummaryDto>}
     * @memberof RegionsSummaryDto
     */
    regions: Array<MacroRegionSummaryDto>;
    /**
     * 
     * @type {Array<CountrySummaryDto>}
     * @memberof RegionsSummaryDto
     */
    countries: Array<CountrySummaryDto>;
    /**
     * Customers without a country_code
     * @type {number}
     * @memberof RegionsSummaryDto
     */
    unassignedUsers: number;
}
/**
 * 
 * @export
 * @interface RegisterDeviceDto
 */
export interface RegisterDeviceDto {
    /**
     * FCM registration token
     * @type {string}
     * @memberof RegisterDeviceDto
     */
    fcmToken: string;
    /**
     * 
     * @type {string}
     * @memberof RegisterDeviceDto
     */
    platform: RegisterDeviceDtoPlatformEnum;
    /**
     * Client-stable device identifier
     * @type {string}
     * @memberof RegisterDeviceDto
     */
    deviceId?: string;
    /**
     * 
     * @type {string}
     * @memberof RegisterDeviceDto
     */
    appVersion?: string;
}


/**
 * @export
 */
export const RegisterDeviceDtoPlatformEnum = {
    Ios: 'ios',
    Android: 'android',
    Web: 'web'
} as const;
export type RegisterDeviceDtoPlatformEnum = typeof RegisterDeviceDtoPlatformEnum[keyof typeof RegisterDeviceDtoPlatformEnum];

/**
 * 
 * @export
 * @interface ReinstateUserDto
 */
export interface ReinstateUserDto {
    /**
     * 
     * @type {string}
     * @memberof ReinstateUserDto
     */
    reason?: string;
}
/**
 * 
 * @export
 * @interface RejectContentDto
 */
export interface RejectContentDto {
    /**
     * 
     * @type {string}
     * @memberof RejectContentDto
     */
    reason: string;
}
/**
 * 
 * @export
 * @interface ReorderContentMediaDto
 */
export interface ReorderContentMediaDto {
    /**
     * Media ids in display order (listed first; the rest keep their order after)
     * @type {Array<string>}
     * @memberof ReorderContentMediaDto
     */
    mediaIds: Array<string>;
}
/**
 * 
 * @export
 * @interface ReportCatalogDto
 */
export interface ReportCatalogDto {
    /**
     * 
     * @type {Array<ReportGroupDto>}
     * @memberof ReportCatalogDto
     */
    groups: Array<ReportGroupDto>;
    /**
     * 
     * @type {Array<ReportPresetDto>}
     * @memberof ReportCatalogDto
     */
    presets: Array<ReportPresetDto>;
    /**
     * 
     * @type {Array<string>}
     * @memberof ReportCatalogDto
     */
    ranges: Array<string>;
}
/**
 * 
 * @export
 * @interface ReportCommentDto
 */
export interface ReportCommentDto {
    /**
     * 
     * @type {string}
     * @memberof ReportCommentDto
     */
    reason: ReportCommentDtoReasonEnum;
    /**
     * 
     * @type {string}
     * @memberof ReportCommentDto
     */
    description?: string;
}


/**
 * @export
 */
export const ReportCommentDtoReasonEnum = {
    NuditySexual: 'nudity_sexual',
    ViolenceGore: 'violence_gore',
    HateSpeech: 'hate_speech',
    HarassmentBullying: 'harassment_bullying',
    Spam: 'spam',
    Other: 'other'
} as const;
export type ReportCommentDtoReasonEnum = typeof ReportCommentDtoReasonEnum[keyof typeof ReportCommentDtoReasonEnum];

/**
 * 
 * @export
 * @interface ReportDto
 */
export interface ReportDto {
    /**
     * 
     * @type {string}
     * @memberof ReportDto
     */
    report: string;
    /**
     * 
     * @type {string}
     * @memberof ReportDto
     */
    generatedAt: string;
    /**
     * 
     * @type {string}
     * @memberof ReportDto
     */
    range: string;
    /**
     * 
     * @type {string}
     * @memberof ReportDto
     */
    from: string;
    /**
     * 
     * @type {string}
     * @memberof ReportDto
     */
    to: string;
    /**
     * 
     * @type {string}
     * @memberof ReportDto
     */
    region: string;
    /**
     * 
     * @type {Array<ReportRowDto>}
     * @memberof ReportDto
     */
    rows: Array<ReportRowDto>;
}
/**
 * 
 * @export
 * @interface ReportGroupDto
 */
export interface ReportGroupDto {
    /**
     * 
     * @type {string}
     * @memberof ReportGroupDto
     */
    group: string;
    /**
     * 
     * @type {Array<ReportMetricDefDto>}
     * @memberof ReportGroupDto
     */
    metrics: Array<ReportMetricDefDto>;
}
/**
 * 
 * @export
 * @interface ReportMetricDefDto
 */
export interface ReportMetricDefDto {
    /**
     * 
     * @type {string}
     * @memberof ReportMetricDefDto
     */
    key: string;
    /**
     * 
     * @type {string}
     * @memberof ReportMetricDefDto
     */
    label: string;
    /**
     * 
     * @type {string}
     * @memberof ReportMetricDefDto
     */
    unit: string;
    /**
     * 
     * @type {string}
     * @memberof ReportMetricDefDto
     */
    description: string;
}
/**
 * 
 * @export
 * @interface ReportPresetDto
 */
export interface ReportPresetDto {
    /**
     * 
     * @type {string}
     * @memberof ReportPresetDto
     */
    key: string;
    /**
     * 
     * @type {string}
     * @memberof ReportPresetDto
     */
    label: string;
    /**
     * 
     * @type {Array<string>}
     * @memberof ReportPresetDto
     */
    metrics: Array<string>;
}
/**
 * 
 * @export
 * @interface ReportReceivedDto
 */
export interface ReportReceivedDto {
    /**
     * 
     * @type {string}
     * @memberof ReportReceivedDto
     */
    ticketId: string;
    /**
     * 
     * @type {string}
     * @memberof ReportReceivedDto
     */
    status: string;
}
/**
 * 
 * @export
 * @interface ReportResultDto
 */
export interface ReportResultDto {
    /**
     * The created report id
     * @type {string}
     * @memberof ReportResultDto
     */
    reportId: string;
    /**
     * The moderation ticket this report was rolled into
     * @type {string}
     * @memberof ReportResultDto
     */
    ticketId: string;
}
/**
 * 
 * @export
 * @interface ReportRowDto
 */
export interface ReportRowDto {
    /**
     * 
     * @type {string}
     * @memberof ReportRowDto
     */
    group: string;
    /**
     * 
     * @type {string}
     * @memberof ReportRowDto
     */
    key: string;
    /**
     * 
     * @type {string}
     * @memberof ReportRowDto
     */
    label: string;
    /**
     * 
     * @type {number}
     * @memberof ReportRowDto
     */
    value: number;
    /**
     * 
     * @type {string}
     * @memberof ReportRowDto
     */
    unit: string;
}
/**
 * 
 * @export
 * @interface ReportVolumeDto
 */
export interface ReportVolumeDto {
    /**
     * 
     * @type {number}
     * @memberof ReportVolumeDto
     */
    total: number;
    /**
     * 
     * @type {number}
     * @memberof ReportVolumeDto
     */
    previous24h: number;
    /**
     * 
     * @type {Array<VolumeBucketDto>}
     * @memberof ReportVolumeDto
     */
    buckets: Array<VolumeBucketDto>;
}
/**
 * 
 * @export
 * @interface RequestEmailOtpDto
 */
export interface RequestEmailOtpDto {
    /**
     * Email to verify (case-insensitive)
     * @type {string}
     * @memberof RequestEmailOtpDto
     */
    email: string;
}
/**
 * 
 * @export
 * @interface RequestPhoneOtpDto
 */
export interface RequestPhoneOtpDto {
    /**
     * Phone number in E.164 format
     * @type {string}
     * @memberof RequestPhoneOtpDto
     */
    phone: string;
}
/**
 * 
 * @export
 * @interface RequestUploadDto
 */
export interface RequestUploadDto {
    /**
     * Intrinsic asset kind
     * @type {string}
     * @memberof RequestUploadDto
     */
    mediaType: RequestUploadDtoMediaTypeEnum;
    /**
     * What the asset is for (drives default access tier)
     * @type {string}
     * @memberof RequestUploadDto
     */
    usageType: RequestUploadDtoUsageTypeEnum;
    /**
     * 
     * @type {string}
     * @memberof RequestUploadDto
     */
    filename: string;
    /**
     * 
     * @type {string}
     * @memberof RequestUploadDto
     */
    mimeType: string;
    /**
     * Declared size in bytes
     * @type {number}
     * @memberof RequestUploadDto
     */
    sizeBytes: number;
    /**
     * Override the default security tier
     * @type {string}
     * @memberof RequestUploadDto
     */
    accessLevel?: RequestUploadDtoAccessLevelEnum;
    /**
     * Alt text (images, a11y)
     * @type {string}
     * @memberof RequestUploadDto
     */
    altText?: string;
}


/**
 * @export
 */
export const RequestUploadDtoMediaTypeEnum = {
    Image: 'image',
    Video: 'video',
    Audio: 'audio',
    Document: 'document',
    Other: 'other'
} as const;
export type RequestUploadDtoMediaTypeEnum = typeof RequestUploadDtoMediaTypeEnum[keyof typeof RequestUploadDtoMediaTypeEnum];

/**
 * @export
 */
export const RequestUploadDtoUsageTypeEnum = {
    ContentVideo: 'content_video',
    ContentTrailer: 'content_trailer',
    ContentThumbnail: 'content_thumbnail',
    Avatar: 'avatar',
    PersonPhoto: 'person_photo',
    StudioLogo: 'studio_logo',
    Banner: 'banner',
    BadgeIcon: 'badge_icon',
    Document: 'document',
    Generic: 'generic'
} as const;
export type RequestUploadDtoUsageTypeEnum = typeof RequestUploadDtoUsageTypeEnum[keyof typeof RequestUploadDtoUsageTypeEnum];

/**
 * @export
 */
export const RequestUploadDtoAccessLevelEnum = {
    Public: 'public',
    Protected: 'protected',
    Private: 'private'
} as const;
export type RequestUploadDtoAccessLevelEnum = typeof RequestUploadDtoAccessLevelEnum[keyof typeof RequestUploadDtoAccessLevelEnum];

/**
 * 
 * @export
 * @interface ResetPasswordDto
 */
export interface ResetPasswordDto {
    /**
     * 
     * @type {string}
     * @memberof ResetPasswordDto
     */
    email: string;
    /**
     * 6-digit code from email
     * @type {string}
     * @memberof ResetPasswordDto
     */
    code: string;
    /**
     * 
     * @type {string}
     * @memberof ResetPasswordDto
     */
    newPassword: string;
}
/**
 * 
 * @export
 * @interface ResolvePredictionDto
 */
export interface ResolvePredictionDto {
    /**
     * The winning option
     * @type {string}
     * @memberof ResolvePredictionDto
     */
    correctOptionId: string;
}
/**
 * 
 * @export
 * @interface ResolveReportDto
 */
export interface ResolveReportDto {
    /**
     * 
     * @type {string}
     * @memberof ResolveReportDto
     */
    status: ResolveReportDtoStatusEnum;
}


/**
 * @export
 */
export const ResolveReportDtoStatusEnum = {
    Actioned: 'actioned',
    Dismissed: 'dismissed'
} as const;
export type ResolveReportDtoStatusEnum = typeof ResolveReportDtoStatusEnum[keyof typeof ResolveReportDtoStatusEnum];

/**
 * 
 * @export
 * @interface ResolveReportResultDto
 */
export interface ResolveReportResultDto {
    /**
     * 
     * @type {string}
     * @memberof ResolveReportResultDto
     */
    id: string;
    /**
     * 
     * @type {string}
     * @memberof ResolveReportResultDto
     */
    status: ResolveReportResultDtoStatusEnum;
    /**
     * 
     * @type {string}
     * @memberof ResolveReportResultDto
     */
    commentId: string;
    /**
     * Pending reports left on the comment
     * @type {number}
     * @memberof ResolveReportResultDto
     */
    pendingReports: number;
    /**
     * Moderation ticket closed by this resolution
     * @type {string}
     * @memberof ResolveReportResultDto
     */
    ticketClosed?: string | null;
}


/**
 * @export
 */
export const ResolveReportResultDtoStatusEnum = {
    Actioned: 'actioned',
    Dismissed: 'dismissed'
} as const;
export type ResolveReportResultDtoStatusEnum = typeof ResolveReportResultDtoStatusEnum[keyof typeof ResolveReportResultDtoStatusEnum];

/**
 * 
 * @export
 * @interface ResolveTicketDto
 */
export interface ResolveTicketDto {
    /**
     * Action to take; no_action dismisses
     * @type {string}
     * @memberof ResolveTicketDto
     */
    resolution: ResolveTicketDtoResolutionEnum;
    /**
     * 
     * @type {string}
     * @memberof ResolveTicketDto
     */
    note?: string;
    /**
     * user_suspended only (default 7d). Permanent = user_banned
     * @type {string}
     * @memberof ResolveTicketDto
     */
    suspendDuration?: ResolveTicketDtoSuspendDurationEnum;
    /**
     * user_suspended only — explicit ISO end (future, ≤ 1 year); exclusive with suspendDuration
     * @type {string}
     * @memberof ResolveTicketDto
     */
    suspendUntil?: string;
}


/**
 * @export
 */
export const ResolveTicketDtoResolutionEnum = {
    ContentRemoved: 'content_removed',
    UserWarned: 'user_warned',
    UserSuspended: 'user_suspended',
    UserBanned: 'user_banned',
    NoAction: 'no_action'
} as const;
export type ResolveTicketDtoResolutionEnum = typeof ResolveTicketDtoResolutionEnum[keyof typeof ResolveTicketDtoResolutionEnum];

/**
 * @export
 */
export const ResolveTicketDtoSuspendDurationEnum = {
    _24h: '24h',
    _7d: '7d',
    _30d: '30d'
} as const;
export type ResolveTicketDtoSuspendDurationEnum = typeof ResolveTicketDtoSuspendDurationEnum[keyof typeof ResolveTicketDtoSuspendDurationEnum];

/**
 * 
 * @export
 * @interface ResolvedTodayDto
 */
export interface ResolvedTodayDto {
    /**
     * 
     * @type {number}
     * @memberof ResolvedTodayDto
     */
    today: number;
    /**
     * 
     * @type {number}
     * @memberof ResolvedTodayDto
     */
    yesterday: number;
    /**
     * 
     * @type {number}
     * @memberof ResolvedTodayDto
     */
    delta: number;
}
/**
 * 
 * @export
 * @interface RestoreRuleVersionDto
 */
export interface RestoreRuleVersionDto {
    /**
     * The historical version number to restore as a new current version
     * @type {number}
     * @memberof RestoreRuleVersionDto
     */
    version: number;
}
/**
 * 
 * @export
 * @interface RetentionDto
 */
export interface RetentionDto {
    /**
     * 
     * @type {number}
     * @memberof RetentionDto
     */
    d1: number;
    /**
     * 
     * @type {number}
     * @memberof RetentionDto
     */
    d7: number;
    /**
     * 
     * @type {number}
     * @memberof RetentionDto
     */
    d30: number;
    /**
     * 
     * @type {number}
     * @memberof RetentionDto
     */
    cohortSize: number;
    /**
     * 
     * @type {Array<RetentionPointDto>}
     * @memberof RetentionDto
     */
    series: Array<RetentionPointDto>;
}
/**
 * 
 * @export
 * @interface RetentionPointDto
 */
export interface RetentionPointDto {
    /**
     * 
     * @type {string}
     * @memberof RetentionPointDto
     */
    day: string;
    /**
     * 
     * @type {number}
     * @memberof RetentionPointDto
     */
    current: number;
    /**
     * 
     * @type {number}
     * @memberof RetentionPointDto
     */
    previous: number;
}
/**
 * 
 * @export
 * @interface RevenueMonthDto
 */
export interface RevenueMonthDto {
    /**
     * 
     * @type {string}
     * @memberof RevenueMonthDto
     */
    month: string;
    /**
     * Paid subscription revenue ($)
     * @type {number}
     * @memberof RevenueMonthDto
     */
    subscriptions: number;
}
/**
 * 
 * @export
 * @interface RewardRuleControllerListV1200Response
 */
export interface RewardRuleControllerListV1200Response {
    /**
     * 
     * @type {number}
     * @memberof RewardRuleControllerListV1200Response
     */
    statusCode: number;
    /**
     * 
     * @type {string}
     * @memberof RewardRuleControllerListV1200Response
     */
    status: string;
    /**
     * 
     * @type {string}
     * @memberof RewardRuleControllerListV1200Response
     */
    message: string;
    /**
     * Error details, or null on success
     * @type {object}
     * @memberof RewardRuleControllerListV1200Response
     */
    error: object | null;
    /**
     * 
     * @type {Array<EarnRuleDto>}
     * @memberof RewardRuleControllerListV1200Response
     */
    data?: Array<EarnRuleDto>;
}
/**
 * 
 * @export
 * @interface RewardRuleDto
 */
export interface RewardRuleDto {
    /**
     * 
     * @type {string}
     * @memberof RewardRuleDto
     */
    id: string;
    /**
     * 
     * @type {string}
     * @memberof RewardRuleDto
     */
    ruleKey: string;
    /**
     * 
     * @type {string}
     * @memberof RewardRuleDto
     */
    name: string;
    /**
     * 
     * @type {string}
     * @memberof RewardRuleDto
     */
    description?: string | null;
    /**
     * 
     * @type {boolean}
     * @memberof RewardRuleDto
     */
    isEnabled: boolean;
    /**
     * 
     * @type {{ [key: string]: any; }}
     * @memberof RewardRuleDto
     */
    config: { [key: string]: any; };
    /**
     * 
     * @type {number}
     * @memberof RewardRuleDto
     */
    version: number;
    /**
     * 
     * @type {string}
     * @memberof RewardRuleDto
     */
    updatedAt: string;
    /**
     * Version number scheduled to take effect, if any
     * @type {number}
     * @memberof RewardRuleDto
     */
    pendingVersion?: number | null;
    /**
     * 
     * @type {string}
     * @memberof RewardRuleDto
     */
    pendingEffectiveFrom?: string | null;
}
/**
 * 
 * @export
 * @interface RewardRuleVersionDto
 */
export interface RewardRuleVersionDto {
    /**
     * 
     * @type {number}
     * @memberof RewardRuleVersionDto
     */
    version: number;
    /**
     * 
     * @type {{ [key: string]: any; }}
     * @memberof RewardRuleVersionDto
     */
    config: { [key: string]: any; };
    /**
     * 
     * @type {string}
     * @memberof RewardRuleVersionDto
     */
    status: RewardRuleVersionDtoStatusEnum;
    /**
     * 
     * @type {string}
     * @memberof RewardRuleVersionDto
     */
    effectiveFrom: string;
    /**
     * 
     * @type {string}
     * @memberof RewardRuleVersionDto
     */
    changedBy?: string | null;
    /**
     * 
     * @type {string}
     * @memberof RewardRuleVersionDto
     */
    createdAt: string;
}


/**
 * @export
 */
export const RewardRuleVersionDtoStatusEnum = {
    Pending: 'pending',
    Current: 'current',
    Superseded: 'superseded'
} as const;
export type RewardRuleVersionDtoStatusEnum = typeof RewardRuleVersionDtoStatusEnum[keyof typeof RewardRuleVersionDtoStatusEnum];

/**
 * 
 * @export
 * @interface RoleResponseDto
 */
export interface RoleResponseDto {
    /**
     * 
     * @type {string}
     * @memberof RoleResponseDto
     */
    id: string;
    /**
     * 
     * @type {string}
     * @memberof RoleResponseDto
     */
    name: string;
    /**
     * 
     * @type {string}
     * @memberof RoleResponseDto
     */
    description: string | null;
    /**
     * 
     * @type {boolean}
     * @memberof RoleResponseDto
     */
    isSystem: boolean;
    /**
     * 
     * @type {SystemRoleName}
     * @memberof RoleResponseDto
     */
    systemName: SystemRoleName | null;
    /**
     * 
     * @type {boolean}
     * @memberof RoleResponseDto
     */
    isActive: boolean;
    /**
     * 
     * @type {Array<string>}
     * @memberof RoleResponseDto
     */
    permissions: Array<string>;
}


/**
 * 
 * @export
 * @interface RollupCoverageDto
 */
export interface RollupCoverageDto {
    /**
     * 
     * @type {string}
     * @memberof RollupCoverageDto
     */
    coveredFrom: string | null;
    /**
     * 
     * @type {string}
     * @memberof RollupCoverageDto
     */
    coveredThrough: string | null;
}
/**
 * 
 * @export
 * @interface RollupResultDto
 */
export interface RollupResultDto {
    /**
     * 
     * @type {string}
     * @memberof RollupResultDto
     */
    from: string;
    /**
     * 
     * @type {string}
     * @memberof RollupResultDto
     */
    to: string;
    /**
     * content_daily_stats rows written
     * @type {number}
     * @memberof RollupResultDto
     */
    rows: number;
    /**
     * 
     * @type {RollupCoverageDto}
     * @memberof RollupResultDto
     */
    coverage: RollupCoverageDto;
}
/**
 * 
 * @export
 * @interface RunRollupDto
 */
export interface RunRollupDto {
    /**
     * First UTC day (YYYY-MM-DD)
     * @type {string}
     * @memberof RunRollupDto
     */
    from: string;
    /**
     * Last UTC day, inclusive (clamped to today)
     * @type {string}
     * @memberof RunRollupDto
     */
    to: string;
}
/**
 * 
 * @export
 * @interface SafetyScoreDto
 */
export interface SafetyScoreDto {
    /**
     * 100 × (1 − flagged / total), 0.1 precision
     * @type {number}
     * @memberof SafetyScoreDto
     */
    score: number;
    /**
     * 
     * @type {number}
     * @memberof SafetyScoreDto
     */
    windowDays: number;
    /**
     * 
     * @type {number}
     * @memberof SafetyScoreDto
     */
    totalItems: number;
    /**
     * 
     * @type {number}
     * @memberof SafetyScoreDto
     */
    flaggedItems: number;
}
/**
 * 
 * @export
 * @interface ScheduleContentDto
 */
export interface ScheduleContentDto {
    /**
     * Go-live timestamp (ISO, future)
     * @type {string}
     * @memberof ScheduleContentDto
     */
    scheduledAt: string;
}
/**
 * 
 * @export
 * @interface ScreenTimeDataDto
 */
export interface ScreenTimeDataDto {
    /**
     * 
     * @type {number}
     * @memberof ScreenTimeDataDto
     */
    viewers: number;
    /**
     * 
     * @type {number}
     * @memberof ScreenTimeDataDto
     */
    gamified: number;
    /**
     * 
     * @type {number}
     * @memberof ScreenTimeDataDto
     */
    sessionAvgSecs: number;
    /**
     * 
     * @type {number}
     * @memberof ScreenTimeDataDto
     */
    sessionMedianSecs: number;
    /**
     * 
     * @type {Array<BucketPctDto>}
     * @memberof ScreenTimeDataDto
     */
    sessionBuckets: Array<BucketPctDto>;
    /**
     * 7 rows (Mon..Sun, UTC) × 24 hours, 0..1
     * @type {Array<Array<number>>}
     * @memberof ScreenTimeDataDto
     */
    heatmap: Array<Array<number>>;
    /**
     * 
     * @type {number}
     * @memberof ScreenTimeDataDto
     */
    bgFgPerSession: number;
    /**
     * 
     * @type {number}
     * @memberof ScreenTimeDataDto
     */
    doomscrollVideos: number;
    /**
     * 
     * @type {number}
     * @memberof ScreenTimeDataDto
     */
    doomscrollMinutes: number;
    /**
     * 
     * @type {number}
     * @memberof ScreenTimeDataDto
     */
    sessionsTracked: number;
}
/**
 * 
 * @export
 * @interface SetCastDto
 */
export interface SetCastDto {
    /**
     * Full replacement cast list (≤100)
     * @type {Array<CastMemberInputDto>}
     * @memberof SetCastDto
     */
    cast: Array<CastMemberInputDto>;
}
/**
 * 
 * @export
 * @interface SetCommentReactionDto
 */
export interface SetCommentReactionDto {
    /**
     * 
     * @type {string}
     * @memberof SetCommentReactionDto
     */
    reaction: SetCommentReactionDtoReactionEnum;
}


/**
 * @export
 */
export const SetCommentReactionDtoReactionEnum = {
    Like: 'like',
    Dislike: 'dislike'
} as const;
export type SetCommentReactionDtoReactionEnum = typeof SetCommentReactionDtoReactionEnum[keyof typeof SetCommentReactionDtoReactionEnum];

/**
 * 
 * @export
 * @interface SetEngineFlagDto
 */
export interface SetEngineFlagDto {
    /**
     * Short key — stored as engine.{key}
     * @type {string}
     * @memberof SetEngineFlagDto
     */
    key: SetEngineFlagDtoKeyEnum;
    /**
     * 
     * @type {boolean}
     * @memberof SetEngineFlagDto
     */
    value: boolean;
}


/**
 * @export
 */
export const SetEngineFlagDtoKeyEnum = {
    CreditEnabled: 'credit_enabled',
    PayoutsEnabled: 'payouts_enabled',
    BidsEnabled: 'bids_enabled',
    UnlocksEnabled: 'unlocks_enabled'
} as const;
export type SetEngineFlagDtoKeyEnum = typeof SetEngineFlagDtoKeyEnum[keyof typeof SetEngineFlagDtoKeyEnum];

/**
 * 
 * @export
 * @interface SetEngineLimitsDto
 */
export interface SetEngineLimitsDto {
    /**
     * 
     * @type {number}
     * @memberof SetEngineLimitsDto
     */
    maxRewardPointsPerInstance?: number;
    /**
     * 
     * @type {number}
     * @memberof SetEngineLimitsDto
     */
    maxEntryCost?: number;
    /**
     * 
     * @type {number}
     * @memberof SetEngineLimitsDto
     */
    maxMultiplier?: number;
    /**
     * 
     * @type {number}
     * @memberof SetEngineLimitsDto
     */
    maxStreakPointsPerDay?: number;
    /**
     * 
     * @type {number}
     * @memberof SetEngineLimitsDto
     */
    maxClearBonus?: number;
    /**
     * 
     * @type {number}
     * @memberof SetEngineLimitsDto
     */
    maxRunBonus?: number;
    /**
     * 
     * @type {number}
     * @memberof SetEngineLimitsDto
     */
    maxBehaviourPoints?: number;
    /**
     * 
     * @type {number}
     * @memberof SetEngineLimitsDto
     */
    minIncrement?: number;
    /**
     * 
     * @type {number}
     * @memberof SetEngineLimitsDto
     */
    maxMinBid?: number;
    /**
     * 
     * @type {number}
     * @memberof SetEngineLimitsDto
     */
    maxWinners?: number;
    /**
     * 
     * @type {number}
     * @memberof SetEngineLimitsDto
     */
    maxLevels?: number;
    /**
     * 
     * @type {number}
     * @memberof SetEngineLimitsDto
     */
    maxClaimGraceDays?: number;
    /**
     * 
     * @type {ConfirmAboveDto}
     * @memberof SetEngineLimitsDto
     */
    confirmAbove?: ConfirmAboveDto;
}
/**
 * 
 * @export
 * @interface SetFeatureFlagDto
 */
export interface SetFeatureFlagDto {
    /**
     * Flag key (feature. prefix added if absent)
     * @type {string}
     * @memberof SetFeatureFlagDto
     */
    key: string;
    /**
     * Flag value (usually boolean)
     * @type {object}
     * @memberof SetFeatureFlagDto
     */
    value: object;
}
/**
 * 
 * @export
 * @interface SetReactionDto
 */
export interface SetReactionDto {
    /**
     * 
     * @type {string}
     * @memberof SetReactionDto
     */
    reaction: SetReactionDtoReactionEnum;
}


/**
 * @export
 */
export const SetReactionDtoReactionEnum = {
    Like: 'like',
    Dislike: 'dislike'
} as const;
export type SetReactionDtoReactionEnum = typeof SetReactionDtoReactionEnum[keyof typeof SetReactionDtoReactionEnum];

/**
 * 
 * @export
 * @interface SetRegionPriceDto
 */
export interface SetRegionPriceDto {
    /**
     * 
     * @type {string}
     * @memberof SetRegionPriceDto
     */
    region: SetRegionPriceDtoRegionEnum;
    /**
     * Price in cents for this region
     * @type {number}
     * @memberof SetRegionPriceDto
     */
    priceCents: number;
    /**
     * 
     * @type {string}
     * @memberof SetRegionPriceDto
     */
    currency?: string;
}


/**
 * @export
 */
export const SetRegionPriceDtoRegionEnum = {
    Na: 'NA',
    Eu: 'EU',
    Apac: 'APAC',
    Latam: 'LATAM',
    Mea: 'MEA'
} as const;
export type SetRegionPriceDtoRegionEnum = typeof SetRegionPriceDtoRegionEnum[keyof typeof SetRegionPriceDtoRegionEnum];

/**
 * 
 * @export
 * @interface SetRegionsDto
 */
export interface SetRegionsDto {
    /**
     * Macro-regions to publish to
     * @type {Array<string>}
     * @memberof SetRegionsDto
     */
    regions: Array<SetRegionsDtoRegionsEnum>;
    /**
     * Selected but switched Off (subset of regions)
     * @type {Array<string>}
     * @memberof SetRegionsDto
     */
    offRegions?: Array<SetRegionsDtoOffRegionsEnum>;
}


/**
 * @export
 */
export const SetRegionsDtoRegionsEnum = {
    Na: 'NA',
    Eu: 'EU',
    Apac: 'APAC',
    Latam: 'LATAM',
    Mea: 'MEA'
} as const;
export type SetRegionsDtoRegionsEnum = typeof SetRegionsDtoRegionsEnum[keyof typeof SetRegionsDtoRegionsEnum];

/**
 * @export
 */
export const SetRegionsDtoOffRegionsEnum = {
    Na: 'NA',
    Eu: 'EU',
    Apac: 'APAC',
    Latam: 'LATAM',
    Mea: 'MEA'
} as const;
export type SetRegionsDtoOffRegionsEnum = typeof SetRegionsDtoOffRegionsEnum[keyof typeof SetRegionsDtoOffRegionsEnum];

/**
 * 
 * @export
 * @interface SetUserRolesDto
 */
export interface SetUserRolesDto {
    /**
     * Role names to assign (replaces current)
     * @type {Array<string>}
     * @memberof SetUserRolesDto
     */
    roles: Array<string>;
}
/**
 * 
 * @export
 * @interface ShareContentDto
 */
export interface ShareContentDto {
    /**
     * Where it was shared (optional)
     * @type {string}
     * @memberof ShareContentDto
     */
    channel?: ShareContentDtoChannelEnum;
}


/**
 * @export
 */
export const ShareContentDtoChannelEnum = {
    Whatsapp: 'whatsapp',
    Instagram: 'instagram',
    Facebook: 'facebook',
    X: 'x',
    Telegram: 'telegram',
    CopyLink: 'copy_link',
    Other: 'other'
} as const;
export type ShareContentDtoChannelEnum = typeof ShareContentDtoChannelEnum[keyof typeof ShareContentDtoChannelEnum];

/**
 * 
 * @export
 * @interface ShareControllerShareV1200Response
 */
export interface ShareControllerShareV1200Response {
    /**
     * 
     * @type {number}
     * @memberof ShareControllerShareV1200Response
     */
    statusCode: number;
    /**
     * 
     * @type {string}
     * @memberof ShareControllerShareV1200Response
     */
    status: string;
    /**
     * 
     * @type {string}
     * @memberof ShareControllerShareV1200Response
     */
    message: string;
    /**
     * Error details, or null on success
     * @type {object}
     * @memberof ShareControllerShareV1200Response
     */
    error: object | null;
    /**
     * 
     * @type {ShareResultDto}
     * @memberof ShareControllerShareV1200Response
     */
    data?: ShareResultDto;
}
/**
 * 
 * @export
 * @interface ShareResultDto
 */
export interface ShareResultDto {
    /**
     * 
     * @type {string}
     * @memberof ShareResultDto
     */
    shareId: string;
    /**
     * 
     * @type {number}
     * @memberof ShareResultDto
     */
    shareCount: number;
    /**
     * true when this user already shared this content to this channel today (not counted again)
     * @type {boolean}
     * @memberof ShareResultDto
     */
    deduped: boolean;
}
/**
 * 
 * @export
 * @interface SocialIngestResultDto
 */
export interface SocialIngestResultDto {
    /**
     * 
     * @type {number}
     * @memberof SocialIngestResultDto
     */
    ingested: number;
}
/**
 * 
 * @export
 * @interface SocialMentionDto
 */
export interface SocialMentionDto {
    /**
     * 
     * @type {string}
     * @memberof SocialMentionDto
     */
    id: string;
    /**
     * 
     * @type {string}
     * @memberof SocialMentionDto
     */
    platform: SocialMentionDtoPlatformEnum;
    /**
     * 
     * @type {string}
     * @memberof SocialMentionDto
     */
    externalId: string | null;
    /**
     * 
     * @type {string}
     * @memberof SocialMentionDto
     */
    authorHandle: string | null;
    /**
     * 
     * @type {string}
     * @memberof SocialMentionDto
     */
    url: string | null;
    /**
     * 
     * @type {string}
     * @memberof SocialMentionDto
     */
    content: string | null;
    /**
     * 
     * @type {string}
     * @memberof SocialMentionDto
     */
    sentiment: SocialMentionDtoSentimentEnum | null;
    /**
     * 
     * @type {number}
     * @memberof SocialMentionDto
     */
    impressions: number;
    /**
     * 
     * @type {number}
     * @memberof SocialMentionDto
     */
    engagement: number;
    /**
     * 
     * @type {number}
     * @memberof SocialMentionDto
     */
    emvCents: number;
    /**
     * 
     * @type {boolean}
     * @memberof SocialMentionDto
     */
    isViralMoment: boolean;
    /**
     * 
     * @type {string}
     * @memberof SocialMentionDto
     */
    countryCode: string | null;
    /**
     * 
     * @type {string}
     * @memberof SocialMentionDto
     */
    mentionedAt: string | null;
    /**
     * 
     * @type {string}
     * @memberof SocialMentionDto
     */
    ingestedAt: string;
}


/**
 * @export
 */
export const SocialMentionDtoPlatformEnum = {
    X: 'x',
    Tiktok: 'tiktok',
    Instagram: 'instagram',
    Reddit: 'reddit',
    Youtube: 'youtube',
    Other: 'other'
} as const;
export type SocialMentionDtoPlatformEnum = typeof SocialMentionDtoPlatformEnum[keyof typeof SocialMentionDtoPlatformEnum];

/**
 * @export
 */
export const SocialMentionDtoSentimentEnum = {
    Positive: 'positive',
    Neutral: 'neutral',
    Negative: 'negative'
} as const;
export type SocialMentionDtoSentimentEnum = typeof SocialMentionDtoSentimentEnum[keyof typeof SocialMentionDtoSentimentEnum];

/**
 * 
 * @export
 * @interface SocialMentionInputDto
 */
export interface SocialMentionInputDto {
    /**
     * 
     * @type {string}
     * @memberof SocialMentionInputDto
     */
    platform: SocialMentionInputDtoPlatformEnum;
    /**
     * Id on the source platform (enables idempotent re-ingest)
     * @type {string}
     * @memberof SocialMentionInputDto
     */
    externalId?: string;
    /**
     * 
     * @type {string}
     * @memberof SocialMentionInputDto
     */
    authorHandle?: string;
    /**
     * 
     * @type {string}
     * @memberof SocialMentionInputDto
     */
    url?: string;
    /**
     * 
     * @type {string}
     * @memberof SocialMentionInputDto
     */
    content?: string;
    /**
     * 
     * @type {string}
     * @memberof SocialMentionInputDto
     */
    sentiment?: SocialMentionInputDtoSentimentEnum;
    /**
     * 
     * @type {number}
     * @memberof SocialMentionInputDto
     */
    impressions?: number;
    /**
     * 
     * @type {number}
     * @memberof SocialMentionInputDto
     */
    engagement?: number;
    /**
     * Earned media value (cents)
     * @type {number}
     * @memberof SocialMentionInputDto
     */
    emvCents?: number;
    /**
     * 
     * @type {boolean}
     * @memberof SocialMentionInputDto
     */
    isViralMoment?: boolean;
    /**
     * ISO alpha-2 (for regional scoping)
     * @type {string}
     * @memberof SocialMentionInputDto
     */
    countryCode?: string;
    /**
     * 
     * @type {string}
     * @memberof SocialMentionInputDto
     */
    mentionedAt?: string;
}


/**
 * @export
 */
export const SocialMentionInputDtoPlatformEnum = {
    X: 'x',
    Tiktok: 'tiktok',
    Instagram: 'instagram',
    Reddit: 'reddit',
    Youtube: 'youtube',
    Other: 'other'
} as const;
export type SocialMentionInputDtoPlatformEnum = typeof SocialMentionInputDtoPlatformEnum[keyof typeof SocialMentionInputDtoPlatformEnum];

/**
 * @export
 */
export const SocialMentionInputDtoSentimentEnum = {
    Positive: 'positive',
    Neutral: 'neutral',
    Negative: 'negative'
} as const;
export type SocialMentionInputDtoSentimentEnum = typeof SocialMentionInputDtoSentimentEnum[keyof typeof SocialMentionInputDtoSentimentEnum];

/**
 * 
 * @export
 * @interface SocialMentionPageDto
 */
export interface SocialMentionPageDto {
    /**
     * 
     * @type {Array<SocialMentionDto>}
     * @memberof SocialMentionPageDto
     */
    items: Array<SocialMentionDto>;
    /**
     * 
     * @type {number}
     * @memberof SocialMentionPageDto
     */
    total: number;
    /**
     * 
     * @type {number}
     * @memberof SocialMentionPageDto
     */
    page: number;
    /**
     * 
     * @type {number}
     * @memberof SocialMentionPageDto
     */
    limit: number;
}
/**
 * 
 * @export
 * @interface SocialSummaryDto
 */
export interface SocialSummaryDto {
    /**
     * 
     * @type {string}
     * @memberof SocialSummaryDto
     */
    from: string;
    /**
     * 
     * @type {string}
     * @memberof SocialSummaryDto
     */
    to: string;
    /**
     * 
     * @type {string}
     * @memberof SocialSummaryDto
     */
    region: string;
    /**
     * 
     * @type {number}
     * @memberof SocialSummaryDto
     */
    mentionsPerWeek: number;
    /**
     * 
     * @type {Array<number>}
     * @memberof SocialSummaryDto
     */
    sentiment: Array<number>;
    /**
     * 
     * @type {number}
     * @memberof SocialSummaryDto
     */
    viralMoments: number;
    /**
     * 
     * @type {number}
     * @memberof SocialSummaryDto
     */
    organicImpressions: number;
    /**
     * 
     * @type {number}
     * @memberof SocialSummaryDto
     */
    earnedMediaValue: number;
    /**
     * 
     * @type {number}
     * @memberof SocialSummaryDto
     */
    topAdvocates: number;
    /**
     * 
     * @type {number}
     * @memberof SocialSummaryDto
     */
    mentions: number;
    /**
     * 
     * @type {Array<PlatformMentionsDto>}
     * @memberof SocialSummaryDto
     */
    byPlatform: Array<PlatformMentionsDto>;
}
/**
 * 
 * @export
 * @interface SourceSliceDto
 */
export interface SourceSliceDto {
    /**
     * 
     * @type {string}
     * @memberof SourceSliceDto
     */
    name: string;
    /**
     * % of earned points
     * @type {number}
     * @memberof SourceSliceDto
     */
    value: number;
    /**
     * 
     * @type {number}
     * @memberof SourceSliceDto
     */
    points: number;
    /**
     * 
     * @type {string}
     * @memberof SourceSliceDto
     */
    color: string;
}
/**
 * 
 * @export
 * @interface SponsorshipDto
 */
export interface SponsorshipDto {
    /**
     * `commercial` is rejected — feed commercials are Ad Sales campaigns (POST /v1/admin/ads/campaigns)
     * @type {string}
     * @memberof SponsorshipDto
     */
    adFormat?: SponsorshipDtoAdFormatEnum;
    /**
     * 
     * @type {string}
     * @memberof SponsorshipDto
     */
    sponsorName: string;
    /**
     * Sponsor banner/logo media id
     * @type {string}
     * @memberof SponsorshipDto
     */
    bannerMediaId?: string;
    /**
     * 
     * @type {number}
     * @memberof SponsorshipDto
     */
    adDurationSeconds?: number;
    /**
     * `icon-overlay` is accepted as an alias and stored/returned as `overlay`
     * @type {string}
     * @memberof SponsorshipDto
     */
    placement?: SponsorshipDtoPlacementEnum;
    /**
     * Commercial: insert every N videos in the feed
     * @type {number}
     * @memberof SponsorshipDto
     */
    feedFrequency?: number;
    /**
     * 
     * @type {number}
     * @memberof SponsorshipDto
     */
    skippableAfterSeconds?: number;
    /**
     * 
     * @type {number}
     * @memberof SponsorshipDto
     */
    revenueCents?: number;
    /**
     * 
     * @type {string}
     * @memberof SponsorshipDto
     */
    currency?: string;
    /**
     * Deal start (default now)
     * @type {string}
     * @memberof SponsorshipDto
     */
    startsAt?: string;
    /**
     * Deal end; must be after startsAt
     * @type {string}
     * @memberof SponsorshipDto
     */
    endsAt?: string;
    /**
     * Convenience: endsAt = (startsAt ?? now) + N days (ignored when endsAt is sent)
     * @type {number}
     * @memberof SponsorshipDto
     */
    overlayDays?: number;
    /**
     * Video creative for a roll ad (video media id)
     * @type {string}
     * @memberof SponsorshipDto
     */
    creativeMediaId?: string;
    /**
     * 
     * @type {string}
     * @memberof SponsorshipDto
     */
    clickUrl?: string;
    /**
     * 
     * @type {string}
     * @memberof SponsorshipDto
     */
    ctaLabel?: string;
    /**
     * Mid-roll cue point (required for placement=mid-roll)
     * @type {number}
     * @memberof SponsorshipDto
     */
    midRollAtSeconds?: number;
    /**
     * Overlay window start inside the video
     * @type {number}
     * @memberof SponsorshipDto
     */
    overlayStartSeconds?: number;
    /**
     * Overlay window length (default: whole video)
     * @type {number}
     * @memberof SponsorshipDto
     */
    overlayDurationSeconds?: number;
    /**
     * Variable revenue per 1000 impressions (cents)
     * @type {number}
     * @memberof SponsorshipDto
     */
    cpmCents?: number;
    /**
     * Variable revenue per click (cents)
     * @type {number}
     * @memberof SponsorshipDto
     */
    cpcCents?: number;
    /**
     * Ad Sales advertiser (default: find-or-create by sponsorName)
     * @type {string}
     * @memberof SponsorshipDto
     */
    advertiserId?: string;
    /**
     * Ad Sales sponsorship campaign this deal belongs to (same advertiser)
     * @type {string}
     * @memberof SponsorshipDto
     */
    campaignId?: string;
}


/**
 * @export
 */
export const SponsorshipDtoAdFormatEnum = {
    Sponsored: 'sponsored',
    Commercial: 'commercial'
} as const;
export type SponsorshipDtoAdFormatEnum = typeof SponsorshipDtoAdFormatEnum[keyof typeof SponsorshipDtoAdFormatEnum];

/**
 * @export
 */
export const SponsorshipDtoPlacementEnum = {
    PreRoll: 'pre-roll',
    MidRoll: 'mid-roll',
    PostRoll: 'post-roll',
    Overlay: 'overlay',
    IconOverlay: 'icon-overlay'
} as const;
export type SponsorshipDtoPlacementEnum = typeof SponsorshipDtoPlacementEnum[keyof typeof SponsorshipDtoPlacementEnum];

/**
 * 
 * @export
 * @interface SponsorshipResponseDto
 */
export interface SponsorshipResponseDto {
    /**
     * 
     * @type {string}
     * @memberof SponsorshipResponseDto
     */
    id: string;
    /**
     * 
     * @type {string}
     * @memberof SponsorshipResponseDto
     */
    contentId: string;
    /**
     * 
     * @type {string}
     * @memberof SponsorshipResponseDto
     */
    sponsorName: string;
    /**
     * 
     * @type {string}
     * @memberof SponsorshipResponseDto
     */
    bannerMediaId?: string | null;
    /**
     * Resolved public URL for `bannerMediaId`; null when unset or the media is not ready
     * @type {string}
     * @memberof SponsorshipResponseDto
     */
    bannerUrl?: string | null;
    /**
     * 
     * @type {number}
     * @memberof SponsorshipResponseDto
     */
    adDurationSeconds: number;
    /**
     * 
     * @type {string}
     * @memberof SponsorshipResponseDto
     */
    placement: SponsorshipResponseDtoPlacementEnum;
    /**
     * Attributed revenue in cents
     * @type {number}
     * @memberof SponsorshipResponseDto
     */
    revenueCents: number;
    /**
     * 
     * @type {string}
     * @memberof SponsorshipResponseDto
     */
    currency: string;
    /**
     * 
     * @type {string}
     * @memberof SponsorshipResponseDto
     */
    startsAt?: string | null;
    /**
     * 
     * @type {string}
     * @memberof SponsorshipResponseDto
     */
    endsAt?: string | null;
    /**
     * 
     * @type {boolean}
     * @memberof SponsorshipResponseDto
     */
    isActive: boolean;
    /**
     * 
     * @type {string}
     * @memberof SponsorshipResponseDto
     */
    createdBy?: string | null;
    /**
     * 
     * @type {string}
     * @memberof SponsorshipResponseDto
     */
    createdAt: string;
    /**
     * 
     * @type {string}
     * @memberof SponsorshipResponseDto
     */
    updatedAt: string;
    /**
     * 
     * @type {string}
     * @memberof SponsorshipResponseDto
     */
    adFormat: SponsorshipResponseDtoAdFormatEnum;
    /**
     * 
     * @type {number}
     * @memberof SponsorshipResponseDto
     */
    feedFrequency?: number | null;
    /**
     * 
     * @type {number}
     * @memberof SponsorshipResponseDto
     */
    skippableAfterSeconds?: number | null;
    /**
     * 
     * @type {string}
     * @memberof SponsorshipResponseDto
     */
    creativeMediaId?: string | null;
    /**
     * 
     * @type {string}
     * @memberof SponsorshipResponseDto
     */
    clickUrl?: string | null;
    /**
     * 
     * @type {string}
     * @memberof SponsorshipResponseDto
     */
    ctaLabel?: string | null;
    /**
     * 
     * @type {number}
     * @memberof SponsorshipResponseDto
     */
    midRollAtSeconds?: number | null;
    /**
     * 
     * @type {number}
     * @memberof SponsorshipResponseDto
     */
    overlayStartSeconds?: number | null;
    /**
     * 
     * @type {number}
     * @memberof SponsorshipResponseDto
     */
    overlayDurationSeconds?: number | null;
    /**
     * 
     * @type {number}
     * @memberof SponsorshipResponseDto
     */
    cpmCents?: number | null;
    /**
     * 
     * @type {number}
     * @memberof SponsorshipResponseDto
     */
    cpcCents?: number | null;
}


/**
 * @export
 */
export const SponsorshipResponseDtoPlacementEnum = {
    PreRoll: 'pre-roll',
    MidRoll: 'mid-roll',
    PostRoll: 'post-roll',
    Overlay: 'overlay'
} as const;
export type SponsorshipResponseDtoPlacementEnum = typeof SponsorshipResponseDtoPlacementEnum[keyof typeof SponsorshipResponseDtoPlacementEnum];

/**
 * @export
 */
export const SponsorshipResponseDtoAdFormatEnum = {
    Sponsored: 'sponsored',
    Commercial: 'commercial'
} as const;
export type SponsorshipResponseDtoAdFormatEnum = typeof SponsorshipResponseDtoAdFormatEnum[keyof typeof SponsorshipResponseDtoAdFormatEnum];

/**
 * 
 * @export
 * @interface StartViewDto
 */
export interface StartViewDto {
    /**
     * Client session id (dedupe)
     * @type {string}
     * @memberof StartViewDto
     */
    sessionId?: string;
    /**
     * 
     * @type {string}
     * @memberof StartViewDto
     */
    device?: StartViewDtoDeviceEnum;
    /**
     * Traffic source (drives admin traffic-source analytics)
     * @type {string}
     * @memberof StartViewDto
     */
    source?: StartViewDtoSourceEnum;
}


/**
 * @export
 */
export const StartViewDtoDeviceEnum = {
    Ios: 'ios',
    Android: 'android',
    Web: 'web'
} as const;
export type StartViewDtoDeviceEnum = typeof StartViewDtoDeviceEnum[keyof typeof StartViewDtoDeviceEnum];

/**
 * @export
 */
export const StartViewDtoSourceEnum = {
    Feed: 'feed',
    Search: 'search',
    Share: 'share',
    Notification: 'notification',
    Profile: 'profile',
    Deeplink: 'deeplink',
    Other: 'other'
} as const;
export type StartViewDtoSourceEnum = typeof StartViewDtoSourceEnum[keyof typeof StartViewDtoSourceEnum];

/**
 * 
 * @export
 * @interface StreakControllerHistoryV1200Response
 */
export interface StreakControllerHistoryV1200Response {
    /**
     * 
     * @type {number}
     * @memberof StreakControllerHistoryV1200Response
     */
    statusCode: number;
    /**
     * 
     * @type {string}
     * @memberof StreakControllerHistoryV1200Response
     */
    status: string;
    /**
     * 
     * @type {string}
     * @memberof StreakControllerHistoryV1200Response
     */
    message: string;
    /**
     * Error details, or null on success
     * @type {object}
     * @memberof StreakControllerHistoryV1200Response
     */
    error: object | null;
    /**
     * 
     * @type {Array<StreakDayDto>}
     * @memberof StreakControllerHistoryV1200Response
     */
    data?: Array<StreakDayDto>;
}
/**
 * 
 * @export
 * @interface StreakControllerStartV1200Response
 */
export interface StreakControllerStartV1200Response {
    /**
     * 
     * @type {number}
     * @memberof StreakControllerStartV1200Response
     */
    statusCode: number;
    /**
     * 
     * @type {string}
     * @memberof StreakControllerStartV1200Response
     */
    status: string;
    /**
     * 
     * @type {string}
     * @memberof StreakControllerStartV1200Response
     */
    message: string;
    /**
     * Error details, or null on success
     * @type {object}
     * @memberof StreakControllerStartV1200Response
     */
    error: object | null;
    /**
     * 
     * @type {StreakStartResultDto}
     * @memberof StreakControllerStartV1200Response
     */
    data?: StreakStartResultDto;
}
/**
 * 
 * @export
 * @interface StreakControllerStatusV1200Response
 */
export interface StreakControllerStatusV1200Response {
    /**
     * 
     * @type {number}
     * @memberof StreakControllerStatusV1200Response
     */
    statusCode: number;
    /**
     * 
     * @type {string}
     * @memberof StreakControllerStatusV1200Response
     */
    status: string;
    /**
     * 
     * @type {string}
     * @memberof StreakControllerStatusV1200Response
     */
    message: string;
    /**
     * Error details, or null on success
     * @type {object}
     * @memberof StreakControllerStatusV1200Response
     */
    error: object | null;
    /**
     * 
     * @type {StreakStatusDto}
     * @memberof StreakControllerStatusV1200Response
     */
    data?: StreakStatusDto;
}
/**
 * 
 * @export
 * @interface StreakDayDto
 */
export interface StreakDayDto {
    /**
     * 
     * @type {string}
     * @memberof StreakDayDto
     */
    day: string;
    /**
     * 
     * @type {number}
     * @memberof StreakDayDto
     */
    level: number;
    /**
     * 
     * @type {number}
     * @memberof StreakDayDto
     */
    watchSeconds: number;
    /**
     * 
     * @type {number}
     * @memberof StreakDayDto
     */
    runLengthAfter: number;
    /**
     * 
     * @type {number}
     * @memberof StreakDayDto
     */
    pointsPaid: number;
    /**
     * 
     * @type {boolean}
     * @memberof StreakDayDto
     */
    levelCompleted: boolean;
    /**
     * 
     * @type {number}
     * @memberof StreakDayDto
     */
    completionBonus: number;
    /**
     * 
     * @type {Array<string>}
     * @memberof StreakDayDto
     */
    behavioursPaid: Array<string>;
}
/**
 * 
 * @export
 * @interface StreakDto
 */
export interface StreakDto {
    /**
     * 
     * @type {number}
     * @memberof StreakDto
     */
    currentStreak: number;
    /**
     * 
     * @type {number}
     * @memberof StreakDto
     */
    longestStreak: number;
    /**
     * 
     * @type {number}
     * @memberof StreakDto
     */
    totalQualifiedDays: number;
    /**
     * 
     * @type {string}
     * @memberof StreakDto
     */
    lastQualifiedDate?: string | null;
}
/**
 * 
 * @export
 * @interface StreakLevelDto
 */
export interface StreakLevelDto {
    /**
     * 
     * @type {number}
     * @memberof StreakLevelDto
     */
    level: number;
    /**
     * 
     * @type {number}
     * @memberof StreakLevelDto
     */
    minutesPerDay: number;
    /**
     * 
     * @type {number}
     * @memberof StreakLevelDto
     */
    daysToClear: number;
    /**
     * 
     * @type {number}
     * @memberof StreakLevelDto
     */
    pointsPerQualifiedDay: number;
    /**
     * 
     * @type {number}
     * @memberof StreakLevelDto
     */
    clearBonusPoints: number;
    /**
     * 
     * @type {string}
     * @memberof StreakLevelDto
     */
    badgeSlug?: string | null;
}
/**
 * 
 * @export
 * @interface StreakStartResultDto
 */
export interface StreakStartResultDto {
    /**
     * False when the streak had already been started (idempotent)
     * @type {boolean}
     * @memberof StreakStartResultDto
     */
    started: boolean;
}
/**
 * 
 * @export
 * @interface StreakStatusDto
 */
export interface StreakStatusDto {
    /**
     * 
     * @type {boolean}
     * @memberof StreakStatusDto
     */
    hasStarted: boolean;
    /**
     * 
     * @type {boolean}
     * @memberof StreakStatusDto
     */
    paused: boolean;
    /**
     * 
     * @type {string}
     * @memberof StreakStatusDto
     */
    pauseReason?: string | null;
    /**
     * 
     * @type {number}
     * @memberof StreakStatusDto
     */
    level: number;
    /**
     * 
     * @type {number}
     * @memberof StreakStatusDto
     */
    minutesPerDay: number;
    /**
     * 
     * @type {number}
     * @memberof StreakStatusDto
     */
    daysToClear: number;
    /**
     * 
     * @type {number}
     * @memberof StreakStatusDto
     */
    daysDoneInLevel: number;
    /**
     * 
     * @type {number}
     * @memberof StreakStatusDto
     */
    minutesToday: number;
    /**
     * 
     * @type {number}
     * @memberof StreakStatusDto
     */
    currentRun: number;
    /**
     * 
     * @type {number}
     * @memberof StreakStatusDto
     */
    bestRun: number;
    /**
     * 
     * @type {number}
     * @memberof StreakStatusDto
     */
    totalActiveDays: number;
    /**
     * A level was cleared and the drawer hasn't been acknowledged yet
     * @type {boolean}
     * @memberof StreakStatusDto
     */
    drawerPending: boolean;
    /**
     * 
     * @type {string}
     * @memberof StreakStatusDto
     */
    nextLevelFrom?: string | null;
    /**
     * The ladder version pinned to the current level
     * @type {Array<StreakLevelDto>}
     * @memberof StreakStatusDto
     */
    ladder: Array<StreakLevelDto>;
    /**
     * 
     * @type {StreakTodayDto}
     * @memberof StreakStatusDto
     */
    today: StreakTodayDto;
    /**
     * 
     * @type {string}
     * @memberof StreakStatusDto
     */
    serverTime: string;
}
/**
 * 
 * @export
 * @interface StreakTodayDto
 */
export interface StreakTodayDto {
    /**
     * UTC day
     * @type {string}
     * @memberof StreakTodayDto
     */
    date: string;
    /**
     * Credited watch seconds today
     * @type {number}
     * @memberof StreakTodayDto
     */
    watchSeconds: number;
    /**
     * Current level's daily requirement
     * @type {number}
     * @memberof StreakTodayDto
     */
    requiredSeconds: number;
    /**
     * 
     * @type {number}
     * @memberof StreakTodayDto
     */
    remainingSeconds: number;
    /**
     * Today already counts toward the streak
     * @type {boolean}
     * @memberof StreakTodayDto
     */
    qualified: boolean;
}
/**
 * 
 * @export
 * @interface StripDto
 */
export interface StripDto {
    /**
     * 
     * @type {number}
     * @memberof StripDto
     */
    users: number;
    /**
     * 
     * @type {number}
     * @memberof StripDto
     */
    subscribers: number;
    /**
     * Distinct users with a view heartbeat / app event in the last 5 min
     * @type {number}
     * @memberof StripDto
     */
    onlineNow: number;
    /**
     * Distinct users with a game event / entry / bid in the last 5 min
     * @type {number}
     * @memberof StripDto
     */
    playingNow: number;
}
/**
 * 
 * @export
 * @interface StudioListResponseDto
 */
export interface StudioListResponseDto {
    /**
     * 
     * @type {Array<StudioResponseDto>}
     * @memberof StudioListResponseDto
     */
    items: Array<StudioResponseDto>;
    /**
     * 
     * @type {TaxonomySummaryDto}
     * @memberof StudioListResponseDto
     */
    summary: TaxonomySummaryDto;
}
/**
 * 
 * @export
 * @interface StudioResponseDto
 */
export interface StudioResponseDto {
    /**
     * 
     * @type {string}
     * @memberof StudioResponseDto
     */
    id: string;
    /**
     * 
     * @type {string}
     * @memberof StudioResponseDto
     */
    name: string;
    /**
     * 
     * @type {string}
     * @memberof StudioResponseDto
     */
    slug: string;
    /**
     * 
     * @type {string}
     * @memberof StudioResponseDto
     */
    logoMediaId?: string | null;
    /**
     * Resolved delivery URL for `logoMediaId`. Null when there is no logo, or the media row is gone or not yet ready.
     * @type {string}
     * @memberof StudioResponseDto
     */
    logoUrl?: string | null;
    /**
     * 
     * @type {string}
     * @memberof StudioResponseDto
     */
    description?: string | null;
    /**
     * ISO-3166-1 alpha-2
     * @type {string}
     * @memberof StudioResponseDto
     */
    countryCode?: string | null;
    /**
     * Number of non-deleted contents using it (drives "used by" / "most used" / "unused")
     * @type {number}
     * @memberof StudioResponseDto
     */
    contentCount: number;
}
/**
 * 
 * @export
 * @interface SubsWeekDto
 */
export interface SubsWeekDto {
    /**
     * 
     * @type {string}
     * @memberof SubsWeekDto
     */
    date: string;
    /**
     * 
     * @type {number}
     * @memberof SubsWeekDto
     */
    newSubs: number;
    /**
     * 
     * @type {number}
     * @memberof SubsWeekDto
     */
    cancellations: number;
}
/**
 * 
 * @export
 * @interface SubscribeDto
 */
export interface SubscribeDto {
    /**
     * 
     * @type {string}
     * @memberof SubscribeDto
     */
    planId: string;
    /**
     * Provider proof: Stripe session id or IAP receipt (ignored by manual)
     * @type {string}
     * @memberof SubscribeDto
     */
    proof?: string;
}
/**
 * 
 * @export
 * @interface SubscriptionActionResultDto
 */
export interface SubscriptionActionResultDto {
    /**
     * The affected subscription or invoice id
     * @type {string}
     * @memberof SubscriptionActionResultDto
     */
    id: string;
    /**
     * New status (e.g. canceled / refunded)
     * @type {string}
     * @memberof SubscriptionActionResultDto
     */
    status: string;
}
/**
 * 
 * @export
 * @interface SubscriptionAnalyticsByPlanDto
 */
export interface SubscriptionAnalyticsByPlanDto {
    /**
     * 
     * @type {string}
     * @memberof SubscriptionAnalyticsByPlanDto
     */
    planName?: string | null;
    /**
     * 
     * @type {number}
     * @memberof SubscriptionAnalyticsByPlanDto
     */
    count: number;
    /**
     * 
     * @type {number}
     * @memberof SubscriptionAnalyticsByPlanDto
     */
    mrrCents: number;
}
/**
 * 
 * @export
 * @interface SubscriptionAnalyticsByRegionDto
 */
export interface SubscriptionAnalyticsByRegionDto {
    /**
     * 
     * @type {string}
     * @memberof SubscriptionAnalyticsByRegionDto
     */
    region: string;
    /**
     * 
     * @type {number}
     * @memberof SubscriptionAnalyticsByRegionDto
     */
    count: number;
    /**
     * 
     * @type {number}
     * @memberof SubscriptionAnalyticsByRegionDto
     */
    mrrCents: number;
}
/**
 * 
 * @export
 * @interface SubscriptionAnalyticsDto
 */
export interface SubscriptionAnalyticsDto {
    /**
     * Active + trialing subscriptions
     * @type {number}
     * @memberof SubscriptionAnalyticsDto
     */
    active: number;
    /**
     * 
     * @type {number}
     * @memberof SubscriptionAnalyticsDto
     */
    trialing: number;
    /**
     * 
     * @type {number}
     * @memberof SubscriptionAnalyticsDto
     */
    canceled: number;
    /**
     * Sum of active subscription amounts (cents)
     * @type {number}
     * @memberof SubscriptionAnalyticsDto
     */
    mrrCents: number;
    /**
     * Sum of paid invoices (cents)
     * @type {number}
     * @memberof SubscriptionAnalyticsDto
     */
    grossRevenueCents: number;
    /**
     * 
     * @type {Array<SubscriptionAnalyticsByPlanDto>}
     * @memberof SubscriptionAnalyticsDto
     */
    byPlan: Array<SubscriptionAnalyticsByPlanDto>;
    /**
     * 
     * @type {Array<SubscriptionAnalyticsByRegionDto>}
     * @memberof SubscriptionAnalyticsDto
     */
    byRegion: Array<SubscriptionAnalyticsByRegionDto>;
}
/**
 * 
 * @export
 * @interface SubscriptionControllerCancelV1200Response
 */
export interface SubscriptionControllerCancelV1200Response {
    /**
     * 
     * @type {number}
     * @memberof SubscriptionControllerCancelV1200Response
     */
    statusCode: number;
    /**
     * 
     * @type {string}
     * @memberof SubscriptionControllerCancelV1200Response
     */
    status: string;
    /**
     * 
     * @type {string}
     * @memberof SubscriptionControllerCancelV1200Response
     */
    message: string;
    /**
     * Error details, or null on success
     * @type {object}
     * @memberof SubscriptionControllerCancelV1200Response
     */
    error: object | null;
    /**
     * 
     * @type {SubscriptionActionResultDto}
     * @memberof SubscriptionControllerCancelV1200Response
     */
    data?: SubscriptionActionResultDto;
}
/**
 * 
 * @export
 * @interface SubscriptionControllerInvoicesV1200Response
 */
export interface SubscriptionControllerInvoicesV1200Response {
    /**
     * 
     * @type {number}
     * @memberof SubscriptionControllerInvoicesV1200Response
     */
    statusCode: number;
    /**
     * 
     * @type {string}
     * @memberof SubscriptionControllerInvoicesV1200Response
     */
    status: string;
    /**
     * 
     * @type {string}
     * @memberof SubscriptionControllerInvoicesV1200Response
     */
    message: string;
    /**
     * Error details, or null on success
     * @type {object}
     * @memberof SubscriptionControllerInvoicesV1200Response
     */
    error: object | null;
    /**
     * 
     * @type {SubscriptionControllerInvoicesV1200ResponseAllOfData}
     * @memberof SubscriptionControllerInvoicesV1200Response
     */
    data?: SubscriptionControllerInvoicesV1200ResponseAllOfData;
}
/**
 * 
 * @export
 * @interface SubscriptionControllerInvoicesV1200ResponseAllOfData
 */
export interface SubscriptionControllerInvoicesV1200ResponseAllOfData {
    /**
     * 
     * @type {Array<InvoiceDto>}
     * @memberof SubscriptionControllerInvoicesV1200ResponseAllOfData
     */
    items?: Array<InvoiceDto>;
    /**
     * 
     * @type {PaginationDetailsDto}
     * @memberof SubscriptionControllerInvoicesV1200ResponseAllOfData
     */
    pagination?: PaginationDetailsDto;
}
/**
 * 
 * @export
 * @interface SubscriptionControllerOverviewV1200Response
 */
export interface SubscriptionControllerOverviewV1200Response {
    /**
     * 
     * @type {number}
     * @memberof SubscriptionControllerOverviewV1200Response
     */
    statusCode: number;
    /**
     * 
     * @type {string}
     * @memberof SubscriptionControllerOverviewV1200Response
     */
    status: string;
    /**
     * 
     * @type {string}
     * @memberof SubscriptionControllerOverviewV1200Response
     */
    message: string;
    /**
     * Error details, or null on success
     * @type {object}
     * @memberof SubscriptionControllerOverviewV1200Response
     */
    error: object | null;
    /**
     * 
     * @type {SubscriptionOverviewDto}
     * @memberof SubscriptionControllerOverviewV1200Response
     */
    data?: SubscriptionOverviewDto;
}
/**
 * 
 * @export
 * @interface SubscriptionControllerSubscribeV1200Response
 */
export interface SubscriptionControllerSubscribeV1200Response {
    /**
     * 
     * @type {number}
     * @memberof SubscriptionControllerSubscribeV1200Response
     */
    statusCode: number;
    /**
     * 
     * @type {string}
     * @memberof SubscriptionControllerSubscribeV1200Response
     */
    status: string;
    /**
     * 
     * @type {string}
     * @memberof SubscriptionControllerSubscribeV1200Response
     */
    message: string;
    /**
     * Error details, or null on success
     * @type {object}
     * @memberof SubscriptionControllerSubscribeV1200Response
     */
    error: object | null;
    /**
     * 
     * @type {SubscriptionDto}
     * @memberof SubscriptionControllerSubscribeV1200Response
     */
    data?: SubscriptionDto;
}
/**
 * 
 * @export
 * @interface SubscriptionDetailDto
 */
export interface SubscriptionDetailDto {
    /**
     * 
     * @type {SubscriptionDto}
     * @memberof SubscriptionDetailDto
     */
    subscription: SubscriptionDto;
    /**
     * Billing history (max 100)
     * @type {Array<InvoiceDto>}
     * @memberof SubscriptionDetailDto
     */
    invoices: Array<InvoiceDto>;
}
/**
 * 
 * @export
 * @interface SubscriptionDto
 */
export interface SubscriptionDto {
    /**
     * 
     * @type {string}
     * @memberof SubscriptionDto
     */
    id: string;
    /**
     * 
     * @type {string}
     * @memberof SubscriptionDto
     */
    userId: string;
    /**
     * 
     * @type {string}
     * @memberof SubscriptionDto
     */
    username?: string | null;
    /**
     * 
     * @type {string}
     * @memberof SubscriptionDto
     */
    planId?: string | null;
    /**
     * 
     * @type {string}
     * @memberof SubscriptionDto
     */
    planName?: string | null;
    /**
     * 
     * @type {string}
     * @memberof SubscriptionDto
     */
    status: string;
    /**
     * 
     * @type {string}
     * @memberof SubscriptionDto
     */
    region?: string | null;
    /**
     * 
     * @type {number}
     * @memberof SubscriptionDto
     */
    amountCents?: number | null;
    /**
     * 
     * @type {string}
     * @memberof SubscriptionDto
     */
    currency?: string | null;
    /**
     * 
     * @type {string}
     * @memberof SubscriptionDto
     */
    currentPeriodStart?: string | null;
    /**
     * 
     * @type {string}
     * @memberof SubscriptionDto
     */
    currentPeriodEnd?: string | null;
    /**
     * 
     * @type {string}
     * @memberof SubscriptionDto
     */
    trialEndAt?: string | null;
    /**
     * 
     * @type {string}
     * @memberof SubscriptionDto
     */
    canceledAt?: string | null;
    /**
     * 
     * @type {string}
     * @memberof SubscriptionDto
     */
    provider?: string | null;
    /**
     * 
     * @type {string}
     * @memberof SubscriptionDto
     */
    createdAt: string;
}
/**
 * 
 * @export
 * @interface SubscriptionOverviewDto
 */
export interface SubscriptionOverviewDto {
    /**
     * Current active subscription (null if none)
     * @type {SubscriptionDto}
     * @memberof SubscriptionOverviewDto
     */
    current?: SubscriptionDto | null;
    /**
     * Whether the caller can cancel right now
     * @type {boolean}
     * @memberof SubscriptionOverviewDto
     */
    canCancel: boolean;
    /**
     * All plans, each with the action available to this user
     * @type {Array<PlanOptionDto>}
     * @memberof SubscriptionOverviewDto
     */
    plans: Array<PlanOptionDto>;
}
/**
 * 
 * @export
 * @interface SubscriptionSummaryDto
 */
export interface SubscriptionSummaryDto {
    /**
     * 
     * @type {string}
     * @memberof SubscriptionSummaryDto
     */
    id: string;
    /**
     * 
     * @type {string}
     * @memberof SubscriptionSummaryDto
     */
    planId?: string | null;
    /**
     * 
     * @type {string}
     * @memberof SubscriptionSummaryDto
     */
    planName?: string | null;
    /**
     * 
     * @type {string}
     * @memberof SubscriptionSummaryDto
     */
    status: string;
    /**
     * 
     * @type {string}
     * @memberof SubscriptionSummaryDto
     */
    currentPeriodEnd?: string | null;
    /**
     * 
     * @type {boolean}
     * @memberof SubscriptionSummaryDto
     */
    cancelAtPeriodEnd: boolean;
}
/**
 * 
 * @export
 * @interface SuspendUserDto
 */
export interface SuspendUserDto {
    /**
     * 
     * @type {string}
     * @memberof SuspendUserDto
     */
    reason: string;
    /**
     * ISO8601; omit for indefinite suspension
     * @type {string}
     * @memberof SuspendUserDto
     */
    until?: string;
}
/**
 * 
 * @export
 * @interface SwapRanksDto
 */
export interface SwapRanksDto {
    /**
     * Only this region’s ranks change
     * @type {string}
     * @memberof SwapRanksDto
     */
    region: SwapRanksDtoRegionEnum;
    /**
     * Exactly two campaigns, both ranked in this region
     * @type {Array<string>}
     * @memberof SwapRanksDto
     */
    campaignIds: Array<string>;
}


/**
 * @export
 */
export const SwapRanksDtoRegionEnum = {
    Na: 'NA',
    Eu: 'EU',
    Apac: 'APAC',
    Latam: 'LATAM',
    Mea: 'MEA'
} as const;
export type SwapRanksDtoRegionEnum = typeof SwapRanksDtoRegionEnum[keyof typeof SwapRanksDtoRegionEnum];

/**
 * 
 * @export
 * @interface SwapRanksResultDto
 */
export interface SwapRanksResultDto {
    /**
     * 
     * @type {string}
     * @memberof SwapRanksResultDto
     */
    region: SwapRanksResultDtoRegionEnum;
    /**
     * 
     * @type {Array<SwappedRankDto>}
     * @memberof SwapRanksResultDto
     */
    swapped: Array<SwappedRankDto>;
}


/**
 * @export
 */
export const SwapRanksResultDtoRegionEnum = {
    Na: 'NA',
    Eu: 'EU',
    Apac: 'APAC',
    Latam: 'LATAM',
    Mea: 'MEA'
} as const;
export type SwapRanksResultDtoRegionEnum = typeof SwapRanksResultDtoRegionEnum[keyof typeof SwapRanksResultDtoRegionEnum];

/**
 * 
 * @export
 * @interface SwappedRankDto
 */
export interface SwappedRankDto {
    /**
     * 
     * @type {string}
     * @memberof SwappedRankDto
     */
    campaignId: string;
    /**
     * 
     * @type {string}
     * @memberof SwappedRankDto
     */
    name: string;
    /**
     * The rank the ad holds after the swap
     * @type {number}
     * @memberof SwappedRankDto
     */
    rank: number;
}

/**
 * 
 * @export
 */
export const SystemRoleName = {
    SuperAdmin: 'super_admin',
    Admin: 'admin'
} as const;
export type SystemRoleName = typeof SystemRoleName[keyof typeof SystemRoleName];

/**
 * 
 * @export
 * @interface TagListResponseDto
 */
export interface TagListResponseDto {
    /**
     * 
     * @type {Array<AdminTagResponseDto>}
     * @memberof TagListResponseDto
     */
    items: Array<AdminTagResponseDto>;
    /**
     * 
     * @type {PaginationDetailsDto}
     * @memberof TagListResponseDto
     */
    pagination: PaginationDetailsDto;
    /**
     * 
     * @type {TaxonomySummaryDto}
     * @memberof TagListResponseDto
     */
    summary: TaxonomySummaryDto;
}
/**
 * 
 * @export
 * @interface TagResponseDto
 */
export interface TagResponseDto {
    /**
     * 
     * @type {string}
     * @memberof TagResponseDto
     */
    id: string;
    /**
     * 
     * @type {string}
     * @memberof TagResponseDto
     */
    name: string;
    /**
     * 
     * @type {string}
     * @memberof TagResponseDto
     */
    slug: string;
}
/**
 * 
 * @export
 * @interface TaxonomyControllerGenresV1200Response
 */
export interface TaxonomyControllerGenresV1200Response {
    /**
     * 
     * @type {number}
     * @memberof TaxonomyControllerGenresV1200Response
     */
    statusCode: number;
    /**
     * 
     * @type {string}
     * @memberof TaxonomyControllerGenresV1200Response
     */
    status: string;
    /**
     * 
     * @type {string}
     * @memberof TaxonomyControllerGenresV1200Response
     */
    message: string;
    /**
     * Error details, or null on success
     * @type {object}
     * @memberof TaxonomyControllerGenresV1200Response
     */
    error: object | null;
    /**
     * 
     * @type {Array<GenreResponseDto>}
     * @memberof TaxonomyControllerGenresV1200Response
     */
    data?: Array<GenreResponseDto>;
}
/**
 * 
 * @export
 * @interface TaxonomyControllerTagsV1200Response
 */
export interface TaxonomyControllerTagsV1200Response {
    /**
     * 
     * @type {number}
     * @memberof TaxonomyControllerTagsV1200Response
     */
    statusCode: number;
    /**
     * 
     * @type {string}
     * @memberof TaxonomyControllerTagsV1200Response
     */
    status: string;
    /**
     * 
     * @type {string}
     * @memberof TaxonomyControllerTagsV1200Response
     */
    message: string;
    /**
     * Error details, or null on success
     * @type {object}
     * @memberof TaxonomyControllerTagsV1200Response
     */
    error: object | null;
    /**
     * 
     * @type {Array<TagResponseDto>}
     * @memberof TaxonomyControllerTagsV1200Response
     */
    data?: Array<TagResponseDto>;
}
/**
 * 
 * @export
 * @interface TaxonomyMostUsedDto
 */
export interface TaxonomyMostUsedDto {
    /**
     * 
     * @type {string}
     * @memberof TaxonomyMostUsedDto
     */
    id: string;
    /**
     * 
     * @type {string}
     * @memberof TaxonomyMostUsedDto
     */
    name: string;
    /**
     * Number of non-deleted contents using it (drives "used by" / "most used" / "unused")
     * @type {number}
     * @memberof TaxonomyMostUsedDto
     */
    contentCount: number;
}

/**
 * 
 * @export
 */
export const TaxonomySort = {
    MostUsed: 'most_used',
    LeastUsed: 'least_used',
    Name: 'name'
} as const;
export type TaxonomySort = typeof TaxonomySort[keyof typeof TaxonomySort];

/**
 * 
 * @export
 * @interface TaxonomySummaryDto
 */
export interface TaxonomySummaryDto {
    /**
     * Rows matching the current filter — all pages, not just this one
     * @type {number}
     * @memberof TaxonomySummaryDto
     */
    total: number;
    /**
     * Of those, how many no content uses
     * @type {number}
     * @memberof TaxonomySummaryDto
     */
    unusedCount: number;
    /**
     * Most-used match, ties broken by name. Null when nothing matched, or nothing is used at all.
     * @type {TaxonomyMostUsedDto}
     * @memberof TaxonomySummaryDto
     */
    mostUsed?: TaxonomyMostUsedDto | null;
}
/**
 * 
 * @export
 * @interface ThumbnailCandidateDto
 */
export interface ThumbnailCandidateDto {
    /**
     * null for the transcoder poster — use POST /:id/thumbnail/from-poster
     * @type {string}
     * @memberof ThumbnailCandidateDto
     */
    mediaId?: string | null;
    /**
     * 
     * @type {string}
     * @memberof ThumbnailCandidateDto
     */
    url?: string | null;
    /**
     * 
     * @type {string}
     * @memberof ThumbnailCandidateDto
     */
    source: ThumbnailCandidateDtoSourceEnum;
    /**
     * 
     * @type {boolean}
     * @memberof ThumbnailCandidateDto
     */
    isCurrent: boolean;
}


/**
 * @export
 */
export const ThumbnailCandidateDtoSourceEnum = {
    Current: 'current',
    TranscoderPoster: 'transcoder_poster',
    Thumbnail: 'thumbnail',
    Poster: 'poster',
    Still: 'still'
} as const;
export type ThumbnailCandidateDtoSourceEnum = typeof ThumbnailCandidateDtoSourceEnum[keyof typeof ThumbnailCandidateDtoSourceEnum];

/**
 * 
 * @export
 * @interface TicketAssignedDto
 */
export interface TicketAssignedDto {
    /**
     * 
     * @type {string}
     * @memberof TicketAssignedDto
     */
    id: string;
    /**
     * 
     * @type {string}
     * @memberof TicketAssignedDto
     */
    status: string;
    /**
     * Admin the ticket is now assigned to
     * @type {string}
     * @memberof TicketAssignedDto
     */
    assignedTo: string;
}
/**
 * 
 * @export
 * @interface TicketDetailDto
 */
export interface TicketDetailDto {
    /**
     * 
     * @type {string}
     * @memberof TicketDetailDto
     */
    id: string;
    /**
     * 
     * @type {string}
     * @memberof TicketDetailDto
     */
    subjectType: TicketDetailDtoSubjectTypeEnum;
    /**
     * 
     * @type {string}
     * @memberof TicketDetailDto
     */
    subjectId?: string | null;
    /**
     * 
     * @type {string}
     * @memberof TicketDetailDto
     */
    offenderUserId?: string | null;
    /**
     * 
     * @type {string}
     * @memberof TicketDetailDto
     */
    offenderUsername?: string | null;
    /**
     * 
     * @type {string}
     * @memberof TicketDetailDto
     */
    severity: string;
    /**
     * 
     * @type {string}
     * @memberof TicketDetailDto
     */
    category: string;
    /**
     * 
     * @type {string}
     * @memberof TicketDetailDto
     */
    contentSnapshot?: string | null;
    /**
     * 
     * @type {number}
     * @memberof TicketDetailDto
     */
    reportCount: number;
    /**
     * 
     * @type {boolean}
     * @memberof TicketDetailDto
     */
    isRepeatOffender: boolean;
    /**
     * 
     * @type {string}
     * @memberof TicketDetailDto
     */
    status: string;
    /**
     * 
     * @type {string}
     * @memberof TicketDetailDto
     */
    assignedTo?: string | null;
    /**
     * 
     * @type {string}
     * @memberof TicketDetailDto
     */
    assigneeName?: string | null;
    /**
     * 
     * @type {string}
     * @memberof TicketDetailDto
     */
    resolution?: string | null;
    /**
     * 
     * @type {string}
     * @memberof TicketDetailDto
     */
    createdAt: string;
    /**
     * 
     * @type {string}
     * @memberof TicketDetailDto
     */
    updatedAt: string;
    /**
     * 
     * @type {string}
     * @memberof TicketDetailDto
     */
    resolutionNote?: string | null;
    /**
     * 
     * @type {string}
     * @memberof TicketDetailDto
     */
    resolvedBy?: string | null;
    /**
     * 
     * @type {string}
     * @memberof TicketDetailDto
     */
    resolvedAt?: string | null;
    /**
     * 
     * @type {Array<ModerationReportDto>}
     * @memberof TicketDetailDto
     */
    reports: Array<ModerationReportDto>;
    /**
     * Subject preview (comment / content / user)
     * @type {object}
     * @memberof TicketDetailDto
     */
    subject?: object | null;
    /**
     * 
     * @type {OffenderDto}
     * @memberof TicketDetailDto
     */
    offender?: OffenderDto | null;
    /**
     * 
     * @type {OffenderHistoryDto}
     * @memberof TicketDetailDto
     */
    offenderHistory?: OffenderHistoryDto | null;
    /**
     * 
     * @type {Array<TicketNoteDto>}
     * @memberof TicketDetailDto
     */
    notes: Array<TicketNoteDto>;
    /**
     * 
     * @type {Array<AuditEntryDto>}
     * @memberof TicketDetailDto
     */
    activity: Array<AuditEntryDto>;
}


/**
 * @export
 */
export const TicketDetailDtoSubjectTypeEnum = {
    Comment: 'comment',
    Content: 'content',
    User: 'user'
} as const;
export type TicketDetailDtoSubjectTypeEnum = typeof TicketDetailDtoSubjectTypeEnum[keyof typeof TicketDetailDtoSubjectTypeEnum];

/**
 * 
 * @export
 * @interface TicketDto
 */
export interface TicketDto {
    /**
     * 
     * @type {string}
     * @memberof TicketDto
     */
    id: string;
    /**
     * 
     * @type {string}
     * @memberof TicketDto
     */
    subjectType: TicketDtoSubjectTypeEnum;
    /**
     * 
     * @type {string}
     * @memberof TicketDto
     */
    subjectId?: string | null;
    /**
     * 
     * @type {string}
     * @memberof TicketDto
     */
    offenderUserId?: string | null;
    /**
     * 
     * @type {string}
     * @memberof TicketDto
     */
    offenderUsername?: string | null;
    /**
     * 
     * @type {string}
     * @memberof TicketDto
     */
    severity: string;
    /**
     * 
     * @type {string}
     * @memberof TicketDto
     */
    category: string;
    /**
     * 
     * @type {string}
     * @memberof TicketDto
     */
    contentSnapshot?: string | null;
    /**
     * 
     * @type {number}
     * @memberof TicketDto
     */
    reportCount: number;
    /**
     * 
     * @type {boolean}
     * @memberof TicketDto
     */
    isRepeatOffender: boolean;
    /**
     * 
     * @type {string}
     * @memberof TicketDto
     */
    status: string;
    /**
     * 
     * @type {string}
     * @memberof TicketDto
     */
    assignedTo?: string | null;
    /**
     * 
     * @type {string}
     * @memberof TicketDto
     */
    assigneeName?: string | null;
    /**
     * 
     * @type {string}
     * @memberof TicketDto
     */
    resolution?: string | null;
    /**
     * 
     * @type {string}
     * @memberof TicketDto
     */
    createdAt: string;
    /**
     * 
     * @type {string}
     * @memberof TicketDto
     */
    updatedAt: string;
}


/**
 * @export
 */
export const TicketDtoSubjectTypeEnum = {
    Comment: 'comment',
    Content: 'content',
    User: 'user'
} as const;
export type TicketDtoSubjectTypeEnum = typeof TicketDtoSubjectTypeEnum[keyof typeof TicketDtoSubjectTypeEnum];

/**
 * 
 * @export
 * @interface TicketNoteDto
 */
export interface TicketNoteDto {
    /**
     * 
     * @type {string}
     * @memberof TicketNoteDto
     */
    id: string;
    /**
     * 
     * @type {string}
     * @memberof TicketNoteDto
     */
    body: string;
    /**
     * 
     * @type {string}
     * @memberof TicketNoteDto
     */
    authorId?: string | null;
    /**
     * 
     * @type {string}
     * @memberof TicketNoteDto
     */
    authorName?: string | null;
    /**
     * 
     * @type {string}
     * @memberof TicketNoteDto
     */
    createdAt: string;
}
/**
 * 
 * @export
 * @interface TicketResolvedDto
 */
export interface TicketResolvedDto {
    /**
     * 
     * @type {string}
     * @memberof TicketResolvedDto
     */
    id: string;
    /**
     * 
     * @type {string}
     * @memberof TicketResolvedDto
     */
    resolution: TicketResolvedDtoResolutionEnum;
    /**
     * 
     * @type {string}
     * @memberof TicketResolvedDto
     */
    status: TicketResolvedDtoStatusEnum;
    /**
     * Pending comment reports closed with the ticket (comment tickets)
     * @type {number}
     * @memberof TicketResolvedDto
     */
    reportsClosed: number;
    /**
     * 
     * @type {EnforcementResultDto}
     * @memberof TicketResolvedDto
     */
    enforcement?: EnforcementResultDto | null;
}


/**
 * @export
 */
export const TicketResolvedDtoResolutionEnum = {
    ContentRemoved: 'content_removed',
    UserWarned: 'user_warned',
    UserSuspended: 'user_suspended',
    UserBanned: 'user_banned',
    NoAction: 'no_action'
} as const;
export type TicketResolvedDtoResolutionEnum = typeof TicketResolvedDtoResolutionEnum[keyof typeof TicketResolvedDtoResolutionEnum];

/**
 * @export
 */
export const TicketResolvedDtoStatusEnum = {
    Resolved: 'resolved',
    Dismissed: 'dismissed'
} as const;
export type TicketResolvedDtoStatusEnum = typeof TicketResolvedDtoStatusEnum[keyof typeof TicketResolvedDtoStatusEnum];

/**
 * 
 * @export
 * @interface TicketStatusDto
 */
export interface TicketStatusDto {
    /**
     * 
     * @type {string}
     * @memberof TicketStatusDto
     */
    id: string;
    /**
     * 
     * @type {string}
     * @memberof TicketStatusDto
     */
    status: string;
}
/**
 * 
 * @export
 * @interface TierRefDto
 */
export interface TierRefDto {
    /**
     * 
     * @type {string}
     * @memberof TierRefDto
     */
    slug: string;
    /**
     * 
     * @type {string}
     * @memberof TierRefDto
     */
    name: string;
    /**
     * 
     * @type {number}
     * @memberof TierRefDto
     */
    threshold?: number | null;
    /**
     * 
     * @type {number}
     * @memberof TierRefDto
     */
    pointsToGo?: number | null;
}
/**
 * 
 * @export
 * @interface TrackAdEventsDto
 */
export interface TrackAdEventsDto {
    /**
     * 
     * @type {Array<AdEventInputDto>}
     * @memberof TrackAdEventsDto
     */
    events: Array<AdEventInputDto>;
}
/**
 * 
 * @export
 * @interface TrackAdEventsResultDto
 */
export interface TrackAdEventsResultDto {
    /**
     * Newly recorded events
     * @type {number}
     * @memberof TrackAdEventsResultDto
     */
    accepted: number;
    /**
     * Already recorded for that view (or repeated in the batch)
     * @type {number}
     * @memberof TrackAdEventsResultDto
     */
    duplicates: number;
    /**
     * Unknown sponsorship / campaign, both ids sent, or out-of-range time
     * @type {number}
     * @memberof TrackAdEventsResultDto
     */
    rejected: number;
    /**
     * 
     * @type {Array<string>}
     * @memberof TrackAdEventsResultDto
     */
    rejectedSponsorshipIds: Array<string>;
    /**
     * 
     * @type {Array<string>}
     * @memberof TrackAdEventsResultDto
     */
    rejectedCampaignIds: Array<string>;
}
/**
 * 
 * @export
 * @interface TrendPointDto
 */
export interface TrendPointDto {
    /**
     * UTC bucket start (YYYY-MM-DD)
     * @type {string}
     * @memberof TrendPointDto
     */
    bucket: string;
    /**
     * 
     * @type {number}
     * @memberof TrendPointDto
     */
    value: number;
}
/**
 * 
 * @export
 * @interface TrendsDto
 */
export interface TrendsDto {
    /**
     * 
     * @type {string}
     * @memberof TrendsDto
     */
    interval: TrendsDtoIntervalEnum;
    /**
     * 
     * @type {string}
     * @memberof TrendsDto
     */
    from: string;
    /**
     * 
     * @type {string}
     * @memberof TrendsDto
     */
    to: string;
    /**
     * 
     * @type {string}
     * @memberof TrendsDto
     */
    region?: string | null;
    /**
     * Only the requested metrics are present
     * @type {TrendsSeriesDto}
     * @memberof TrendsDto
     */
    series: TrendsSeriesDto;
}


/**
 * @export
 */
export const TrendsDtoIntervalEnum = {
    Day: 'day',
    Week: 'week',
    Month: 'month'
} as const;
export type TrendsDtoIntervalEnum = typeof TrendsDtoIntervalEnum[keyof typeof TrendsDtoIntervalEnum];

/**
 * 
 * @export
 * @interface TrendsSeriesDto
 */
export interface TrendsSeriesDto {
    /**
     * Customer signups
     * @type {Array<TrendPointDto>}
     * @memberof TrendsSeriesDto
     */
    signups?: Array<TrendPointDto>;
    /**
     * Distinct viewers per bucket
     * @type {Array<TrendPointDto>}
     * @memberof TrendsSeriesDto
     */
    active_users?: Array<TrendPointDto>;
    /**
     * 
     * @type {Array<TrendPointDto>}
     * @memberof TrendsSeriesDto
     */
    views?: Array<TrendPointDto>;
    /**
     * 
     * @type {Array<TrendPointDto>}
     * @memberof TrendsSeriesDto
     */
    watch_seconds?: Array<TrendPointDto>;
    /**
     * 
     * @type {Array<TrendPointDto>}
     * @memberof TrendsSeriesDto
     */
    points_earned?: Array<TrendPointDto>;
    /**
     * 
     * @type {Array<TrendPointDto>}
     * @memberof TrendsSeriesDto
     */
    points_spent?: Array<TrendPointDto>;
    /**
     * Paid subscription invoices (cents)
     * @type {Array<TrendPointDto>}
     * @memberof TrendsSeriesDto
     */
    revenue?: Array<TrendPointDto>;
}
/**
 * 
 * @export
 * @interface UnlockResultDto
 */
export interface UnlockResultDto {
    /**
     * 
     * @type {boolean}
     * @memberof UnlockResultDto
     */
    isUnlocked: boolean;
    /**
     * True if it was already unlocked (no points spent)
     * @type {boolean}
     * @memberof UnlockResultDto
     */
    alreadyUnlocked: boolean;
    /**
     * 
     * @type {number}
     * @memberof UnlockResultDto
     */
    pointsSpent: number;
    /**
     * Points balance after the spend
     * @type {number}
     * @memberof UnlockResultDto
     */
    pointsBalance?: number | null;
}
/**
 * 
 * @export
 * @interface UnreadCountDto
 */
export interface UnreadCountDto {
    /**
     * Unread notification badge count
     * @type {number}
     * @memberof UnreadCountDto
     */
    count: number;
}
/**
 * 
 * @export
 * @interface UpdateAdCampaignDto
 */
export interface UpdateAdCampaignDto {
    /**
     * 
     * @type {string}
     * @memberof UpdateAdCampaignDto
     */
    startsAt?: string | null;
    /**
     * 
     * @type {string}
     * @memberof UpdateAdCampaignDto
     */
    endsAt?: string | null;
    /**
     * Empty = everywhere
     * @type {Array<string>}
     * @memberof UpdateAdCampaignDto
     */
    regions?: Array<UpdateAdCampaignDtoRegionsEnum>;
    /**
     * Commercial: feed rank 1–5 per targeted region
     * @type {RegionRanksDto}
     * @memberof UpdateAdCampaignDto
     */
    ranks?: RegionRanksDto;
    /**
     * Shown under the ad in the feed, like a video description
     * @type {string}
     * @memberof UpdateAdCampaignDto
     */
    caption?: string | null;
    /**
     * Commercial creative video (ready media)
     * @type {string}
     * @memberof UpdateAdCampaignDto
     */
    creativeMediaId?: string | null;
    /**
     * 
     * @type {string}
     * @memberof UpdateAdCampaignDto
     */
    clickUrl?: string | null;
    /**
     * 
     * @type {string}
     * @memberof UpdateAdCampaignDto
     */
    ctaLabel?: string | null;
    /**
     * 
     * @type {number}
     * @memberof UpdateAdCampaignDto
     */
    durationSeconds?: number | null;
    /**
     * 
     * @type {number}
     * @memberof UpdateAdCampaignDto
     */
    skippableAfterSeconds?: number | null;
    /**
     * 
     * @type {number}
     * @memberof UpdateAdCampaignDto
     */
    frequencyCapPerUserDay?: number | null;
    /**
     * 
     * @type {string}
     * @memberof UpdateAdCampaignDto
     */
    pricingModel?: UpdateAdCampaignDtoPricingModelEnum;
    /**
     * Flat fee (cents) — booked to the ledger on activation
     * @type {number}
     * @memberof UpdateAdCampaignDto
     */
    flatFeeCents?: number;
    /**
     * Price per 1000 impressions (cents)
     * @type {number}
     * @memberof UpdateAdCampaignDto
     */
    cpmCents?: number;
    /**
     * Price per click (cents)
     * @type {number}
     * @memberof UpdateAdCampaignDto
     */
    cpcCents?: number;
    /**
     * Stop serving when delivered value reaches this (cents)
     * @type {number}
     * @memberof UpdateAdCampaignDto
     */
    budgetCents?: number | null;
    /**
     * 
     * @type {number}
     * @memberof UpdateAdCampaignDto
     */
    dailyBudgetCents?: number | null;
    /**
     * 
     * @type {number}
     * @memberof UpdateAdCampaignDto
     */
    impressionGoal?: number | null;
    /**
     * 
     * @type {string}
     * @memberof UpdateAdCampaignDto
     */
    currency?: string;
    /**
     * 
     * @type {string}
     * @memberof UpdateAdCampaignDto
     */
    notes?: string | null;
    /**
     * 
     * @type {string}
     * @memberof UpdateAdCampaignDto
     */
    name?: string;
}


/**
 * @export
 */
export const UpdateAdCampaignDtoRegionsEnum = {
    Na: 'NA',
    Eu: 'EU',
    Apac: 'APAC',
    Latam: 'LATAM',
    Mea: 'MEA'
} as const;
export type UpdateAdCampaignDtoRegionsEnum = typeof UpdateAdCampaignDtoRegionsEnum[keyof typeof UpdateAdCampaignDtoRegionsEnum];

/**
 * @export
 */
export const UpdateAdCampaignDtoPricingModelEnum = {
    Flat: 'flat',
    Cpm: 'cpm',
    Cpc: 'cpc'
} as const;
export type UpdateAdCampaignDtoPricingModelEnum = typeof UpdateAdCampaignDtoPricingModelEnum[keyof typeof UpdateAdCampaignDtoPricingModelEnum];

/**
 * 
 * @export
 * @interface UpdateAdminDto
 */
export interface UpdateAdminDto {
    /**
     * 
     * @type {string}
     * @memberof UpdateAdminDto
     */
    firstName?: string;
    /**
     * 
     * @type {string}
     * @memberof UpdateAdminDto
     */
    lastName?: string;
    /**
     * Replace the admin's role assignment
     * @type {Array<string>}
     * @memberof UpdateAdminDto
     */
    roleIds?: Array<string>;
    /**
     * 
     * @type {string}
     * @memberof UpdateAdminDto
     */
    status?: UpdateAdminDtoStatusEnum;
}


/**
 * @export
 */
export const UpdateAdminDtoStatusEnum = {
    Active: 'active',
    Disabled: 'disabled'
} as const;
export type UpdateAdminDtoStatusEnum = typeof UpdateAdminDtoStatusEnum[keyof typeof UpdateAdminDtoStatusEnum];

/**
 * 
 * @export
 * @interface UpdateAdminProfileDto
 */
export interface UpdateAdminProfileDto {
    /**
     * 
     * @type {string}
     * @memberof UpdateAdminProfileDto
     */
    firstName: string;
    /**
     * 
     * @type {string}
     * @memberof UpdateAdminProfileDto
     */
    lastName: string;
}
/**
 * 
 * @export
 * @interface UpdateAdvertiserDto
 */
export interface UpdateAdvertiserDto {
    /**
     * 
     * @type {string}
     * @memberof UpdateAdvertiserDto
     */
    name?: string;
    /**
     * 
     * @type {string}
     * @memberof UpdateAdvertiserDto
     */
    logoMediaId?: string | null;
    /**
     * 
     * @type {string}
     * @memberof UpdateAdvertiserDto
     */
    website?: string | null;
    /**
     * 
     * @type {string}
     * @memberof UpdateAdvertiserDto
     */
    contactName?: string | null;
    /**
     * 
     * @type {string}
     * @memberof UpdateAdvertiserDto
     */
    contactEmail?: string | null;
    /**
     * 
     * @type {string}
     * @memberof UpdateAdvertiserDto
     */
    billingEmail?: string | null;
    /**
     * 
     * @type {string}
     * @memberof UpdateAdvertiserDto
     */
    currency?: string;
    /**
     * 
     * @type {string}
     * @memberof UpdateAdvertiserDto
     */
    status?: UpdateAdvertiserDtoStatusEnum;
    /**
     * 
     * @type {string}
     * @memberof UpdateAdvertiserDto
     */
    notes?: string | null;
}


/**
 * @export
 */
export const UpdateAdvertiserDtoStatusEnum = {
    Active: 'active',
    Paused: 'paused',
    Archived: 'archived'
} as const;
export type UpdateAdvertiserDtoStatusEnum = typeof UpdateAdvertiserDtoStatusEnum[keyof typeof UpdateAdvertiserDtoStatusEnum];

/**
 * 
 * @export
 * @interface UpdateBadgeDto
 */
export interface UpdateBadgeDto {
    /**
     * 
     * @type {string}
     * @memberof UpdateBadgeDto
     */
    name?: string;
    /**
     * 
     * @type {string}
     * @memberof UpdateBadgeDto
     */
    description?: string;
    /**
     * 
     * @type {string}
     * @memberof UpdateBadgeDto
     */
    family?: UpdateBadgeDtoFamilyEnum;
    /**
     * 
     * @type {string}
     * @memberof UpdateBadgeDto
     */
    gameType?: string;
    /**
     * 
     * @type {number}
     * @memberof UpdateBadgeDto
     */
    sortOrder?: number;
    /**
     * 
     * @type {string}
     * @memberof UpdateBadgeDto
     */
    awardedBy?: UpdateBadgeDtoAwardedByEnum;
    /**
     * 
     * @type {string}
     * @memberof UpdateBadgeDto
     */
    triggerKey?: string;
    /**
     * 
     * @type {string}
     * @memberof UpdateBadgeDto
     */
    operator?: UpdateBadgeDtoOperatorEnum;
    /**
     * 
     * @type {number}
     * @memberof UpdateBadgeDto
     */
    threshold?: number;
    /**
     * 
     * @type {number}
     * @memberof UpdateBadgeDto
     */
    rewardPoints?: number;
    /**
     * 
     * @type {boolean}
     * @memberof UpdateBadgeDto
     */
    isActive?: boolean;
    /**
     * Earned-state icon media id; `null` removes it
     * @type {string}
     * @memberof UpdateBadgeDto
     */
    activeIconMediaId?: string | null;
    /**
     * Locked-state icon media id; `null` removes it
     * @type {string}
     * @memberof UpdateBadgeDto
     */
    inactiveIconMediaId?: string | null;
}


/**
 * @export
 */
export const UpdateBadgeDtoFamilyEnum = {
    Tier: 'tier',
    Achievement: 'achievement'
} as const;
export type UpdateBadgeDtoFamilyEnum = typeof UpdateBadgeDtoFamilyEnum[keyof typeof UpdateBadgeDtoFamilyEnum];

/**
 * @export
 */
export const UpdateBadgeDtoAwardedByEnum = {
    Trigger: 'trigger',
    Direct: 'direct',
    Both: 'both'
} as const;
export type UpdateBadgeDtoAwardedByEnum = typeof UpdateBadgeDtoAwardedByEnum[keyof typeof UpdateBadgeDtoAwardedByEnum];

/**
 * @export
 */
export const UpdateBadgeDtoOperatorEnum = {
    Gt: 'gt',
    Gte: 'gte',
    Eq: 'eq',
    Lt: 'lt',
    Lte: 'lte'
} as const;
export type UpdateBadgeDtoOperatorEnum = typeof UpdateBadgeDtoOperatorEnum[keyof typeof UpdateBadgeDtoOperatorEnum];

/**
 * 
 * @export
 * @interface UpdateContentDto
 */
export interface UpdateContentDto {
    /**
     * 
     * @type {string}
     * @memberof UpdateContentDto
     */
    title?: string;
    /**
     * 
     * @type {string}
     * @memberof UpdateContentDto
     */
    description?: string;
    /**
     * 
     * @type {string}
     * @memberof UpdateContentDto
     */
    contentType?: UpdateContentDtoContentTypeEnum;
    /**
     * 
     * @type {string}
     * @memberof UpdateContentDto
     */
    accessTier?: UpdateContentDtoAccessTierEnum;
    /**
     * Unlock cost when accessTier=exclusive
     * @type {number}
     * @memberof UpdateContentDto
     */
    unlockPoints?: number;
    /**
     * Studio id; null clears (update). Use studioName for free text.
     * @type {string}
     * @memberof UpdateContentDto
     */
    studioId?: string | null;
    /**
     * Free-text studio — find-or-create (case-insensitive). Not with studioId.
     * @type {string}
     * @memberof UpdateContentDto
     */
    studioName?: string;
    /**
     * Manual duration override; null returns to the video media duration
     * @type {number}
     * @memberof UpdateContentDto
     */
    durationSeconds?: number | null;
    /**
     * HLS video media id
     * @type {string}
     * @memberof UpdateContentDto
     */
    videoMediaId?: string;
    /**
     * Primary thumbnail media id
     * @type {string}
     * @memberof UpdateContentDto
     */
    thumbnailMediaId?: string;
    /**
     * 
     * @type {string}
     * @memberof UpdateContentDto
     */
    language?: string;
    /**
     * 
     * @type {string}
     * @memberof UpdateContentDto
     */
    rightsRegion?: UpdateContentDtoRightsRegionEnum;
    /**
     * Primary title (for a BTS/clip)
     * @type {string}
     * @memberof UpdateContentDto
     */
    parentContentId?: string;
    /**
     * 
     * @type {string}
     * @memberof UpdateContentDto
     */
    recommendation?: UpdateContentDtoRecommendationEnum;
    /**
     * Full genre set (≤10); replaces when present
     * @type {Array<string>}
     * @memberof UpdateContentDto
     */
    genreIds?: Array<string>;
    /**
     * Must be one of genreIds
     * @type {string}
     * @memberof UpdateContentDto
     */
    primaryGenreId?: string;
    /**
     * Full tag set (≤30); replaces when present
     * @type {Array<string>}
     * @memberof UpdateContentDto
     */
    tagIds?: Array<string>;
    /**
     * Free-text tags (≤30) — find-or-create, merged with tagIds
     * @type {Array<string>}
     * @memberof UpdateContentDto
     */
    tagNames?: Array<string>;
    /**
     * Full cast list (≤100); replaces when present
     * @type {Array<CastMemberInputDto>}
     * @memberof UpdateContentDto
     */
    cast?: Array<CastMemberInputDto>;
    /**
     * "Where to watch" CTAs (≤3)
     * @type {Array<WatchLinkInputDto>}
     * @memberof UpdateContentDto
     */
    watchLinks?: Array<WatchLinkInputDto>;
    /**
     * End of the live window; null clears
     * @type {string}
     * @memberof UpdateContentDto
     */
    availableUntil?: string | null;
}


/**
 * @export
 */
export const UpdateContentDtoContentTypeEnum = {
    Trailer: 'trailer',
    Bts: 'bts',
    Clip: 'clip'
} as const;
export type UpdateContentDtoContentTypeEnum = typeof UpdateContentDtoContentTypeEnum[keyof typeof UpdateContentDtoContentTypeEnum];

/**
 * @export
 */
export const UpdateContentDtoAccessTierEnum = {
    Free: 'free',
    Exclusive: 'exclusive'
} as const;
export type UpdateContentDtoAccessTierEnum = typeof UpdateContentDtoAccessTierEnum[keyof typeof UpdateContentDtoAccessTierEnum];

/**
 * @export
 */
export const UpdateContentDtoRightsRegionEnum = {
    Global: 'global',
    Na: 'NA',
    Eu: 'EU',
    Apac: 'APAC',
    Latam: 'LATAM',
    Mea: 'MEA'
} as const;
export type UpdateContentDtoRightsRegionEnum = typeof UpdateContentDtoRightsRegionEnum[keyof typeof UpdateContentDtoRightsRegionEnum];

/**
 * @export
 */
export const UpdateContentDtoRecommendationEnum = {
    Promoted: 'promoted',
    Normal: 'normal',
    Deprioritized: 'deprioritized'
} as const;
export type UpdateContentDtoRecommendationEnum = typeof UpdateContentDtoRecommendationEnum[keyof typeof UpdateContentDtoRecommendationEnum];

/**
 * 
 * @export
 * @interface UpdateGenreDto
 */
export interface UpdateGenreDto {
    /**
     * 
     * @type {string}
     * @memberof UpdateGenreDto
     */
    name?: string;
    /**
     * 
     * @type {number}
     * @memberof UpdateGenreDto
     */
    sortOrder?: number;
    /**
     * 
     * @type {boolean}
     * @memberof UpdateGenreDto
     */
    isActive?: boolean;
}
/**
 * 
 * @export
 * @interface UpdateMediaMetadataDto
 */
export interface UpdateMediaMetadataDto {
    /**
     * 
     * @type {number}
     * @memberof UpdateMediaMetadataDto
     */
    durationSeconds?: number | null;
    /**
     * 
     * @type {number}
     * @memberof UpdateMediaMetadataDto
     */
    width?: number | null;
    /**
     * 
     * @type {number}
     * @memberof UpdateMediaMetadataDto
     */
    height?: number | null;
    /**
     * 
     * @type {string}
     * @memberof UpdateMediaMetadataDto
     */
    altText?: string | null;
}
/**
 * 
 * @export
 * @interface UpdatePersonDto
 */
export interface UpdatePersonDto {
    /**
     * 
     * @type {string}
     * @memberof UpdatePersonDto
     */
    name?: string;
    /**
     * 
     * @type {string}
     * @memberof UpdatePersonDto
     */
    bio?: string;
    /**
     * `null` clears it
     * @type {string}
     * @memberof UpdatePersonDto
     */
    knownFor?: UpdatePersonDtoKnownForEnum | null;
    /**
     * Headshot media id; `null` removes the photo
     * @type {string}
     * @memberof UpdatePersonDto
     */
    photoMediaId?: string | null;
}


/**
 * @export
 */
export const UpdatePersonDtoKnownForEnum = {
    Actor: 'actor',
    Director: 'director',
    Writer: 'writer',
    Producer: 'producer',
    Other: 'other'
} as const;
export type UpdatePersonDtoKnownForEnum = typeof UpdatePersonDtoKnownForEnum[keyof typeof UpdatePersonDtoKnownForEnum];

/**
 * 
 * @export
 * @interface UpdatePhoneDto
 */
export interface UpdatePhoneDto {
    /**
     * Firebase ID token from the client-side Firebase Phone Auth flow
     * @type {string}
     * @memberof UpdatePhoneDto
     */
    firebaseToken: string;
}
/**
 * 
 * @export
 * @interface UpdatePlanDto
 */
export interface UpdatePlanDto {
    /**
     * 
     * @type {string}
     * @memberof UpdatePlanDto
     */
    name?: string;
    /**
     * 
     * @type {string}
     * @memberof UpdatePlanDto
     */
    description?: string;
    /**
     * 
     * @type {number}
     * @memberof UpdatePlanDto
     */
    basePriceCents?: number;
    /**
     * 
     * @type {string}
     * @memberof UpdatePlanDto
     */
    baseCurrency?: string;
    /**
     * 
     * @type {string}
     * @memberof UpdatePlanDto
     */
    interval?: UpdatePlanDtoIntervalEnum;
    /**
     * 
     * @type {number}
     * @memberof UpdatePlanDto
     */
    trialDays?: number;
    /**
     * 
     * @type {Array<string>}
     * @memberof UpdatePlanDto
     */
    features?: Array<string>;
    /**
     * 
     * @type {boolean}
     * @memberof UpdatePlanDto
     */
    isPopular?: boolean;
    /**
     * 
     * @type {boolean}
     * @memberof UpdatePlanDto
     */
    isActive?: boolean;
    /**
     * 
     * @type {number}
     * @memberof UpdatePlanDto
     */
    sortOrder?: number;
}


/**
 * @export
 */
export const UpdatePlanDtoIntervalEnum = {
    Monthly: 'monthly',
    Yearly: 'yearly'
} as const;
export type UpdatePlanDtoIntervalEnum = typeof UpdatePlanDtoIntervalEnum[keyof typeof UpdatePlanDtoIntervalEnum];

/**
 * 
 * @export
 * @interface UpdatePredictionDto
 */
export interface UpdatePredictionDto {
    /**
     * 
     * @type {string}
     * @memberof UpdatePredictionDto
     */
    title?: string;
    /**
     * 
     * @type {string}
     * @memberof UpdatePredictionDto
     */
    question?: string;
    /**
     * 
     * @type {string}
     * @memberof UpdatePredictionDto
     */
    description?: string;
    /**
     * 
     * @type {string}
     * @memberof UpdatePredictionDto
     */
    contentId?: string;
    /**
     * 
     * @type {string}
     * @memberof UpdatePredictionDto
     */
    startAt?: string;
    /**
     * 
     * @type {string}
     * @memberof UpdatePredictionDto
     */
    endAt?: string;
    /**
     * 
     * @type {number}
     * @memberof UpdatePredictionDto
     */
    rewardPoints?: number;
    /**
     * 
     * @type {number}
     * @memberof UpdatePredictionDto
     */
    entryCostPoints?: number;
    /**
     * 
     * @type {number}
     * @memberof UpdatePredictionDto
     */
    payoutMultiplier?: number;
}
/**
 * 
 * @export
 * @interface UpdateProfileDto
 */
export interface UpdateProfileDto {
    /**
     * 
     * @type {string}
     * @memberof UpdateProfileDto
     */
    firstName?: string;
    /**
     * 
     * @type {string}
     * @memberof UpdateProfileDto
     */
    lastName?: string;
    /**
     * About You
     * @type {string}
     * @memberof UpdateProfileDto
     */
    bio?: string;
    /**
     * 
     * @type {string}
     * @memberof UpdateProfileDto
     */
    gender?: UpdateProfileDtoGenderEnum;
    /**
     * Avatar from an uploaded media asset
     * @type {string}
     * @memberof UpdateProfileDto
     */
    avatarMediaId?: string;
    /**
     * Avatar URL (external / social avatar)
     * @type {string}
     * @memberof UpdateProfileDto
     */
    avatarUrl?: string;
    /**
     * ISO-3166 alpha-2
     * @type {string}
     * @memberof UpdateProfileDto
     */
    countryCode?: string;
    /**
     * 
     * @type {string}
     * @memberof UpdateProfileDto
     */
    timezone?: string;
}


/**
 * @export
 */
export const UpdateProfileDtoGenderEnum = {
    Male: 'male',
    Female: 'female',
    NonBinary: 'non_binary',
    PreferNotToSay: 'prefer_not_to_say'
} as const;
export type UpdateProfileDtoGenderEnum = typeof UpdateProfileDtoGenderEnum[keyof typeof UpdateProfileDtoGenderEnum];

/**
 * 
 * @export
 * @interface UpdateQuestDto
 */
export interface UpdateQuestDto {
    /**
     * 
     * @type {string}
     * @memberof UpdateQuestDto
     */
    name?: string;
    /**
     * 
     * @type {string}
     * @memberof UpdateQuestDto
     */
    description?: string;
    /**
     * 
     * @type {number}
     * @memberof UpdateQuestDto
     */
    rewardPoints?: number;
    /**
     * 
     * @type {string}
     * @memberof UpdateQuestDto
     */
    startAt?: string;
    /**
     * 
     * @type {string}
     * @memberof UpdateQuestDto
     */
    endAt?: string;
    /**
     * 
     * @type {number}
     * @memberof UpdateQuestDto
     */
    unlockThresholdPoints?: number;
    /**
     * `null` removes the banner
     * @type {string}
     * @memberof UpdateQuestDto
     */
    bannerMediaId?: string | null;
    /**
     * 
     * @type {Array<string>}
     * @memberof UpdateQuestDto
     */
    geofenceCountries?: Array<string>;
    /**
     * 
     * @type {number}
     * @memberof UpdateQuestDto
     */
    claimGraceDays?: number;
}
/**
 * 
 * @export
 * @interface UpdateRewardRuleDto
 */
export interface UpdateRewardRuleDto {
    /**
     * Schedule this config for a future instant (TRD R-V2); omitted or past = immediate
     * @type {string}
     * @memberof UpdateRewardRuleDto
     */
    effectiveFrom?: string;
    /**
     * 
     * @type {string}
     * @memberof UpdateRewardRuleDto
     */
    name?: string;
    /**
     * 
     * @type {string}
     * @memberof UpdateRewardRuleDto
     */
    description?: string;
    /**
     * Master on/off for this earning rule
     * @type {boolean}
     * @memberof UpdateRewardRuleDto
     */
    isEnabled?: boolean;
    /**
     * Rule config (amounts, caps, behaviors)
     * @type {{ [key: string]: any; }}
     * @memberof UpdateRewardRuleDto
     */
    config?: { [key: string]: any; };
}
/**
 * 
 * @export
 * @interface UpdateRoleDto
 */
export interface UpdateRoleDto {
    /**
     * 
     * @type {string}
     * @memberof UpdateRoleDto
     */
    description?: string;
    /**
     * Replace the role's permission set
     * @type {Array<string>}
     * @memberof UpdateRoleDto
     */
    permissionNames?: Array<string>;
}
/**
 * 
 * @export
 * @interface UpdateSocialMentionDto
 */
export interface UpdateSocialMentionDto {
    /**
     * 
     * @type {string}
     * @memberof UpdateSocialMentionDto
     */
    authorHandle?: string;
    /**
     * 
     * @type {string}
     * @memberof UpdateSocialMentionDto
     */
    url?: string;
    /**
     * 
     * @type {string}
     * @memberof UpdateSocialMentionDto
     */
    content?: string;
    /**
     * 
     * @type {string}
     * @memberof UpdateSocialMentionDto
     */
    sentiment?: UpdateSocialMentionDtoSentimentEnum;
    /**
     * 
     * @type {number}
     * @memberof UpdateSocialMentionDto
     */
    impressions?: number;
    /**
     * 
     * @type {number}
     * @memberof UpdateSocialMentionDto
     */
    engagement?: number;
    /**
     * 
     * @type {number}
     * @memberof UpdateSocialMentionDto
     */
    emvCents?: number;
    /**
     * 
     * @type {boolean}
     * @memberof UpdateSocialMentionDto
     */
    isViralMoment?: boolean;
    /**
     * 
     * @type {string}
     * @memberof UpdateSocialMentionDto
     */
    countryCode?: string;
    /**
     * 
     * @type {string}
     * @memberof UpdateSocialMentionDto
     */
    mentionedAt?: string;
}


/**
 * @export
 */
export const UpdateSocialMentionDtoSentimentEnum = {
    Positive: 'positive',
    Neutral: 'neutral',
    Negative: 'negative'
} as const;
export type UpdateSocialMentionDtoSentimentEnum = typeof UpdateSocialMentionDtoSentimentEnum[keyof typeof UpdateSocialMentionDtoSentimentEnum];

/**
 * 
 * @export
 * @interface UpdateStudioDto
 */
export interface UpdateStudioDto {
    /**
     * 
     * @type {string}
     * @memberof UpdateStudioDto
     */
    name?: string;
    /**
     * 
     * @type {string}
     * @memberof UpdateStudioDto
     */
    description?: string;
    /**
     * ISO-3166-1 alpha-2; `null` clears it
     * @type {string}
     * @memberof UpdateStudioDto
     */
    countryCode?: string | null;
    /**
     * Logo media id; `null` removes the logo
     * @type {string}
     * @memberof UpdateStudioDto
     */
    logoMediaId?: string | null;
}
/**
 * 
 * @export
 * @interface UpdateTicketStatusDto
 */
export interface UpdateTicketStatusDto {
    /**
     * 'open' returns the ticket to the queue (unassigned)
     * @type {string}
     * @memberof UpdateTicketStatusDto
     */
    status: UpdateTicketStatusDtoStatusEnum;
    /**
     * Stored as an internal note (e.g. escalation reason)
     * @type {string}
     * @memberof UpdateTicketStatusDto
     */
    note?: string;
}


/**
 * @export
 */
export const UpdateTicketStatusDtoStatusEnum = {
    InReview: 'in_review',
    Escalated: 'escalated',
    Open: 'open'
} as const;
export type UpdateTicketStatusDtoStatusEnum = typeof UpdateTicketStatusDtoStatusEnum[keyof typeof UpdateTicketStatusDtoStatusEnum];

/**
 * 
 * @export
 * @interface UploadTargetDto
 */
export interface UploadTargetDto {
    /**
     * 
     * @type {string}
     * @memberof UploadTargetDto
     */
    url: string;
    /**
     * 
     * @type {string}
     * @memberof UploadTargetDto
     */
    method: string;
    /**
     * 
     * @type {{ [key: string]: string; }}
     * @memberof UploadTargetDto
     */
    headers: { [key: string]: string; };
    /**
     * 
     * @type {number}
     * @memberof UploadTargetDto
     */
    expiresInSeconds: number;
}
/**
 * 
 * @export
 * @interface UploadTicketDto
 */
export interface UploadTicketDto {
    /**
     * Persist this; send it to other modules for association
     * @type {string}
     * @memberof UploadTicketDto
     */
    mediaId: string;
    /**
     * 
     * @type {string}
     * @memberof UploadTicketDto
     */
    status: UploadTicketDtoStatusEnum;
    /**
     * 
     * @type {UploadTargetDto}
     * @memberof UploadTicketDto
     */
    upload: UploadTargetDto;
}


/**
 * @export
 */
export const UploadTicketDtoStatusEnum = {
    Pending: 'pending',
    Uploading: 'uploading',
    Uploaded: 'uploaded',
    Processing: 'processing',
    Ready: 'ready',
    Failed: 'failed',
    Archived: 'archived'
} as const;
export type UploadTicketDtoStatusEnum = typeof UploadTicketDtoStatusEnum[keyof typeof UploadTicketDtoStatusEnum];

/**
 * 
 * @export
 * @interface UpsertMarketingSpendDto
 */
export interface UpsertMarketingSpendDto {
    /**
     * 
     * @type {string}
     * @memberof UpsertMarketingSpendDto
     */
    channel: UpsertMarketingSpendDtoChannelEnum;
    /**
     * Month (YYYY-MM or YYYY-MM-01)
     * @type {string}
     * @memberof UpsertMarketingSpendDto
     */
    periodMonth: string;
    /**
     * 
     * @type {number}
     * @memberof UpsertMarketingSpendDto
     */
    spendCents: number;
    /**
     * 
     * @type {string}
     * @memberof UpsertMarketingSpendDto
     */
    currency?: string;
    /**
     * Attributed acquisitions (else signups with that acquisition_channel are used)
     * @type {number}
     * @memberof UpsertMarketingSpendDto
     */
    newUsers?: number;
}


/**
 * @export
 */
export const UpsertMarketingSpendDtoChannelEnum = {
    Organic: 'organic',
    PaidSocial: 'paid_social',
    Referral: 'referral',
    Influencer: 'influencer',
    Search: 'search',
    Other: 'other'
} as const;
export type UpsertMarketingSpendDtoChannelEnum = typeof UpsertMarketingSpendDtoChannelEnum[keyof typeof UpsertMarketingSpendDtoChannelEnum];

/**
 * 
 * @export
 * @interface UserAnalyticsDataDto
 */
export interface UserAnalyticsDataDto {
    /**
     * 
     * @type {number}
     * @memberof UserAnalyticsDataDto
     */
    starts: number;
    /**
     * 
     * @type {number}
     * @memberof UserAnalyticsDataDto
     */
    completes: number;
    /**
     * 
     * @type {number}
     * @memberof UserAnalyticsDataDto
     */
    avgWatchPct: number;
    /**
     * 
     * @type {number}
     * @memberof UserAnalyticsDataDto
     */
    avgWatchSecs: number;
    /**
     * 
     * @type {number}
     * @memberof UserAnalyticsDataDto
     */
    avgClipSecs: number;
    /**
     * % of sessions watched < 3 s (lower is better)
     * @type {number}
     * @memberof UserAnalyticsDataDto
     */
    swipeThroughPct: number;
    /**
     * 
     * @type {number}
     * @memberof UserAnalyticsDataDto
     */
    rewatchLoops: number;
    /**
     * 
     * @type {number}
     * @memberof UserAnalyticsDataDto
     */
    engagementPerSession: number;
    /**
     * 
     * @type {number}
     * @memberof UserAnalyticsDataDto
     */
    videosPerSession: number;
    /**
     * 
     * @type {number}
     * @memberof UserAnalyticsDataDto
     */
    videosPerDay: number;
    /**
     * 
     * @type {number}
     * @memberof UserAnalyticsDataDto
     */
    completionLivePct: number;
    /**
     * 
     * @type {number}
     * @memberof UserAnalyticsDataDto
     */
    hitRatePct: number;
    /**
     * 
     * @type {number}
     * @memberof UserAnalyticsDataDto
     */
    hitThreshold: number;
    /**
     * Derived sessions in the window (0 → per-session metrics fall back to per user-day)
     * @type {number}
     * @memberof UserAnalyticsDataDto
     */
    sessionsTracked: number;
}
/**
 * 
 * @export
 * @interface UserAnalyticsDto
 */
export interface UserAnalyticsDto {
    /**
     * 
     * @type {number}
     * @memberof UserAnalyticsDto
     */
    totalCustomers: number;
    /**
     * New customers in the last 7 days
     * @type {number}
     * @memberof UserAnalyticsDto
     */
    newLast7d: number;
    /**
     * New customers in the last 30 days
     * @type {number}
     * @memberof UserAnalyticsDto
     */
    newLast30d: number;
    /**
     * Customers active in the last 30 days
     * @type {number}
     * @memberof UserAnalyticsDto
     */
    activeLast30d: number;
    /**
     * 
     * @type {Array<UserAnalyticsRegionDto>}
     * @memberof UserAnalyticsDto
     */
    byRegion: Array<UserAnalyticsRegionDto>;
    /**
     * 
     * @type {Array<UserAnalyticsStatusDto>}
     * @memberof UserAnalyticsDto
     */
    byStatus: Array<UserAnalyticsStatusDto>;
}
/**
 * 
 * @export
 * @interface UserAnalyticsRegionDto
 */
export interface UserAnalyticsRegionDto {
    /**
     * 
     * @type {string}
     * @memberof UserAnalyticsRegionDto
     */
    region: string;
    /**
     * 
     * @type {number}
     * @memberof UserAnalyticsRegionDto
     */
    count: number;
}
/**
 * 
 * @export
 * @interface UserAnalyticsStatusDto
 */
export interface UserAnalyticsStatusDto {
    /**
     * 
     * @type {string}
     * @memberof UserAnalyticsStatusDto
     */
    status: string;
    /**
     * 
     * @type {number}
     * @memberof UserAnalyticsStatusDto
     */
    count: number;
}
/**
 * 
 * @export
 * @interface UserDetailResponseDto
 */
export interface UserDetailResponseDto {
    /**
     * 
     * @type {UserResponseDto}
     * @memberof UserDetailResponseDto
     */
    user: UserResponseDto;
    /**
     * 
     * @type {Array<EnforcementResponseDto>}
     * @memberof UserDetailResponseDto
     */
    enforcementHistory: Array<EnforcementResponseDto>;
}
/**
 * 
 * @export
 * @interface UserGamesActivityDto
 */
export interface UserGamesActivityDto {
    /**
     * 
     * @type {number}
     * @memberof UserGamesActivityDto
     */
    questsJoined?: number | null;
    /**
     * 
     * @type {number}
     * @memberof UserGamesActivityDto
     */
    questsCompleted?: number | null;
    /**
     * 
     * @type {number}
     * @memberof UserGamesActivityDto
     */
    predictionsEntered?: number | null;
    /**
     * 
     * @type {number}
     * @memberof UserGamesActivityDto
     */
    predictionsWon?: number | null;
    /**
     * 
     * @type {number}
     * @memberof UserGamesActivityDto
     */
    bidsPlaced?: number | null;
    /**
     * 
     * @type {number}
     * @memberof UserGamesActivityDto
     */
    auctionsWon?: number | null;
}
/**
 * 
 * @export
 * @interface UserListResponseDto
 */
export interface UserListResponseDto {
    /**
     * 
     * @type {Array<UserResponseDto>}
     * @memberof UserListResponseDto
     */
    data: Array<UserResponseDto>;
    /**
     * 
     * @type {number}
     * @memberof UserListResponseDto
     */
    total: number;
}
/**
 * 
 * @export
 * @interface UserReportAgainstDto
 */
export interface UserReportAgainstDto {
    /**
     * 
     * @type {string}
     * @memberof UserReportAgainstDto
     */
    id?: string | null;
    /**
     * 
     * @type {string}
     * @memberof UserReportAgainstDto
     */
    subjectType?: string | null;
    /**
     * 
     * @type {string}
     * @memberof UserReportAgainstDto
     */
    category?: string | null;
    /**
     * 
     * @type {string}
     * @memberof UserReportAgainstDto
     */
    severity?: string | null;
    /**
     * 
     * @type {string}
     * @memberof UserReportAgainstDto
     */
    status?: string | null;
    /**
     * 
     * @type {number}
     * @memberof UserReportAgainstDto
     */
    reportCount?: number | null;
    /**
     * 
     * @type {string}
     * @memberof UserReportAgainstDto
     */
    createdAt?: string | null;
}
/**
 * 
 * @export
 * @interface UserReportsActivityDto
 */
export interface UserReportsActivityDto {
    /**
     * Tickets where the user is the offender (max 50)
     * @type {Array<UserReportAgainstDto>}
     * @memberof UserReportsActivityDto
     */
    against: Array<UserReportAgainstDto>;
    /**
     * Number of reports the user has filed
     * @type {number}
     * @memberof UserReportsActivityDto
     */
    madeCount: number;
}
/**
 * 
 * @export
 * @interface UserResponseDto
 */
export interface UserResponseDto {
    /**
     * 
     * @type {string}
     * @memberof UserResponseDto
     */
    id: string;
    /**
     * 
     * @type {string}
     * @memberof UserResponseDto
     */
    accountType: UserResponseDtoAccountTypeEnum;
    /**
     * 
     * @type {string}
     * @memberof UserResponseDto
     */
    email: string | null;
    /**
     * 
     * @type {string}
     * @memberof UserResponseDto
     */
    phone: string | null;
    /**
     * 
     * @type {string}
     * @memberof UserResponseDto
     */
    username: string | null;
    /**
     * 
     * @type {string}
     * @memberof UserResponseDto
     */
    firstName: string | null;
    /**
     * 
     * @type {string}
     * @memberof UserResponseDto
     */
    lastName: string | null;
    /**
     * 
     * @type {string}
     * @memberof UserResponseDto
     */
    gender: string | null;
    /**
     * 
     * @type {string}
     * @memberof UserResponseDto
     */
    avatarUrl: string | null;
    /**
     * 
     * @type {string}
     * @memberof UserResponseDto
     */
    status: UserResponseDtoStatusEnum;
    /**
     * 
     * @type {boolean}
     * @memberof UserResponseDto
     */
    isPhoneVerified: boolean;
    /**
     * 
     * @type {boolean}
     * @memberof UserResponseDto
     */
    isEmailVerified: boolean;
    /**
     * 
     * @type {string}
     * @memberof UserResponseDto
     */
    countryCode: string | null;
    /**
     * 
     * @type {Array<string>}
     * @memberof UserResponseDto
     */
    roles: Array<string>;
    /**
     * 
     * @type {Array<string>}
     * @memberof UserResponseDto
     */
    permissions: Array<string>;
    /**
     * 
     * @type {string}
     * @memberof UserResponseDto
     */
    createdAt: string;
}


/**
 * @export
 */
export const UserResponseDtoAccountTypeEnum = {
    Guest: 'guest',
    Customer: 'customer',
    Admin: 'admin'
} as const;
export type UserResponseDtoAccountTypeEnum = typeof UserResponseDtoAccountTypeEnum[keyof typeof UserResponseDtoAccountTypeEnum];

/**
 * @export
 */
export const UserResponseDtoStatusEnum = {
    Active: 'active',
    Suspended: 'suspended',
    Banned: 'banned',
    Disabled: 'disabled'
} as const;
export type UserResponseDtoStatusEnum = typeof UserResponseDtoStatusEnum[keyof typeof UserResponseDtoStatusEnum];

/**
 * 
 * @export
 * @interface UserRolesDto
 */
export interface UserRolesDto {
    /**
     * The user's roles after the update
     * @type {Array<string>}
     * @memberof UserRolesDto
     */
    roles: Array<string>;
}
/**
 * 
 * @export
 * @interface UserWarnedDto
 */
export interface UserWarnedDto {
    /**
     * 
     * @type {boolean}
     * @memberof UserWarnedDto
     */
    warned: boolean;
}
/**
 * 
 * @export
 * @interface UsernameAvailableResponseDto
 */
export interface UsernameAvailableResponseDto {
    /**
     * true when nobody else has this username
     * @type {boolean}
     * @memberof UsernameAvailableResponseDto
     */
    available: boolean;
}
/**
 * 
 * @export
 * @interface VelocityPointDto
 */
export interface VelocityPointDto {
    /**
     * 
     * @type {string}
     * @memberof VelocityPointDto
     */
    day: string;
    /**
     * 
     * @type {string}
     * @memberof VelocityPointDto
     */
    weekday: string;
    /**
     * 
     * @type {number}
     * @memberof VelocityPointDto
     */
    players: number;
}
/**
 * 
 * @export
 * @interface VerifyEmailOtpDto
 */
export interface VerifyEmailOtpDto {
    /**
     * Short-lived challenge returned by /email/verify/request
     * @type {string}
     * @memberof VerifyEmailOtpDto
     */
    otpToken: string;
    /**
     * 6-digit OTP the user received
     * @type {string}
     * @memberof VerifyEmailOtpDto
     */
    code: string;
}
/**
 * 
 * @export
 * @interface VerifyPhoneDto
 */
export interface VerifyPhoneDto {
    /**
     * Firebase ID token from Firebase Phone Auth client SDK
     * @type {string}
     * @memberof VerifyPhoneDto
     */
    firebaseToken: string;
}
/**
 * 
 * @export
 * @interface ViewControllerHeartbeatV1200Response
 */
export interface ViewControllerHeartbeatV1200Response {
    /**
     * 
     * @type {number}
     * @memberof ViewControllerHeartbeatV1200Response
     */
    statusCode: number;
    /**
     * 
     * @type {string}
     * @memberof ViewControllerHeartbeatV1200Response
     */
    status: string;
    /**
     * 
     * @type {string}
     * @memberof ViewControllerHeartbeatV1200Response
     */
    message: string;
    /**
     * Error details, or null on success
     * @type {object}
     * @memberof ViewControllerHeartbeatV1200Response
     */
    error: object | null;
    /**
     * 
     * @type {ProgressResponseDto}
     * @memberof ViewControllerHeartbeatV1200Response
     */
    data?: ProgressResponseDto;
}
/**
 * 
 * @export
 * @interface ViewControllerIngestV1200Response
 */
export interface ViewControllerIngestV1200Response {
    /**
     * 
     * @type {number}
     * @memberof ViewControllerIngestV1200Response
     */
    statusCode: number;
    /**
     * 
     * @type {string}
     * @memberof ViewControllerIngestV1200Response
     */
    status: string;
    /**
     * 
     * @type {string}
     * @memberof ViewControllerIngestV1200Response
     */
    message: string;
    /**
     * Error details, or null on success
     * @type {object}
     * @memberof ViewControllerIngestV1200Response
     */
    error: object | null;
    /**
     * 
     * @type {IngestResultDto}
     * @memberof ViewControllerIngestV1200Response
     */
    data?: IngestResultDto;
}
/**
 * 
 * @export
 * @interface ViewControllerStartV1200Response
 */
export interface ViewControllerStartV1200Response {
    /**
     * 
     * @type {number}
     * @memberof ViewControllerStartV1200Response
     */
    statusCode: number;
    /**
     * 
     * @type {string}
     * @memberof ViewControllerStartV1200Response
     */
    status: string;
    /**
     * 
     * @type {string}
     * @memberof ViewControllerStartV1200Response
     */
    message: string;
    /**
     * Error details, or null on success
     * @type {object}
     * @memberof ViewControllerStartV1200Response
     */
    error: object | null;
    /**
     * 
     * @type {ViewStartedDto}
     * @memberof ViewControllerStartV1200Response
     */
    data?: ViewStartedDto;
}
/**
 * 
 * @export
 * @interface ViewStartedDto
 */
export interface ViewStartedDto {
    /**
     * 
     * @type {string}
     * @memberof ViewStartedDto
     */
    viewId: string;
    /**
     * true when an existing session was reused (same sessionId, or unfinished within 30 min)
     * @type {boolean}
     * @memberof ViewStartedDto
     */
    resumed: boolean;
}
/**
 * 
 * @export
 * @interface ViolationDto
 */
export interface ViolationDto {
    /**
     * 
     * @type {string}
     * @memberof ViolationDto
     */
    category: ViolationDtoCategoryEnum;
    /**
     * 
     * @type {number}
     * @memberof ViolationDto
     */
    count: number;
    /**
     * 
     * @type {number}
     * @memberof ViolationDto
     */
    percentage: number;
}


/**
 * @export
 */
export const ViolationDtoCategoryEnum = {
    HateSpeech: 'hate_speech',
    Spam: 'spam',
    Nudity: 'nudity',
    Violence: 'violence',
    Harassment: 'harassment',
    Other: 'other'
} as const;
export type ViolationDtoCategoryEnum = typeof ViolationDtoCategoryEnum[keyof typeof ViolationDtoCategoryEnum];

/**
 * 
 * @export
 * @interface VolumeBucketDto
 */
export interface VolumeBucketDto {
    /**
     * 
     * @type {string}
     * @memberof VolumeBucketDto
     */
    hour: string;
    /**
     * 
     * @type {number}
     * @memberof VolumeBucketDto
     */
    reports: number;
}
/**
 * 
 * @export
 * @interface WalletControllerGetV1200Response
 */
export interface WalletControllerGetV1200Response {
    /**
     * 
     * @type {number}
     * @memberof WalletControllerGetV1200Response
     */
    statusCode: number;
    /**
     * 
     * @type {string}
     * @memberof WalletControllerGetV1200Response
     */
    status: string;
    /**
     * 
     * @type {string}
     * @memberof WalletControllerGetV1200Response
     */
    message: string;
    /**
     * Error details, or null on success
     * @type {object}
     * @memberof WalletControllerGetV1200Response
     */
    error: object | null;
    /**
     * 
     * @type {WalletResponseDto}
     * @memberof WalletControllerGetV1200Response
     */
    data?: WalletResponseDto;
}
/**
 * 
 * @export
 * @interface WalletControllerLedgerV1200Response
 */
export interface WalletControllerLedgerV1200Response {
    /**
     * 
     * @type {number}
     * @memberof WalletControllerLedgerV1200Response
     */
    statusCode: number;
    /**
     * 
     * @type {string}
     * @memberof WalletControllerLedgerV1200Response
     */
    status: string;
    /**
     * 
     * @type {string}
     * @memberof WalletControllerLedgerV1200Response
     */
    message: string;
    /**
     * Error details, or null on success
     * @type {object}
     * @memberof WalletControllerLedgerV1200Response
     */
    error: object | null;
    /**
     * 
     * @type {WalletLedgerResponseDto}
     * @memberof WalletControllerLedgerV1200Response
     */
    data?: WalletLedgerResponseDto;
}
/**
 * 
 * @export
 * @interface WalletDto
 */
export interface WalletDto {
    /**
     * Spendable balance shown as "Coins" (alias of pointsBalance)
     * @type {number}
     * @memberof WalletDto
     */
    coins: number;
    /**
     * Spendable coins
     * @type {number}
     * @memberof WalletDto
     */
    pointsBalance: number;
    /**
     * Lifetime total earnings
     * @type {number}
     * @memberof WalletDto
     */
    pointsEarnedLifetime: number;
    /**
     * 
     * @type {number}
     * @memberof WalletDto
     */
    pointsSpentLifetime: number;
    /**
     * 
     * @type {number}
     * @memberof WalletDto
     */
    pointsPurchasedLifetime: number;
}
/**
 * 
 * @export
 * @interface WalletLedgerEntryDto
 */
export interface WalletLedgerEntryDto {
    /**
     * 
     * @type {string}
     * @memberof WalletLedgerEntryDto
     */
    id: string;
    /**
     * 
     * @type {number}
     * @memberof WalletLedgerEntryDto
     */
    amount: number;
    /**
     * 
     * @type {number}
     * @memberof WalletLedgerEntryDto
     */
    balanceAfter: number;
    /**
     * 
     * @type {string}
     * @memberof WalletLedgerEntryDto
     */
    direction: string;
    /**
     * 
     * @type {string}
     * @memberof WalletLedgerEntryDto
     */
    sourceType: string;
    /**
     * 
     * @type {string}
     * @memberof WalletLedgerEntryDto
     */
    sourceId?: string | null;
    /**
     * 
     * @type {string}
     * @memberof WalletLedgerEntryDto
     */
    note?: string | null;
    /**
     * 
     * @type {string}
     * @memberof WalletLedgerEntryDto
     */
    createdAt: string;
}
/**
 * 
 * @export
 * @interface WalletLedgerResponseDto
 */
export interface WalletLedgerResponseDto {
    /**
     * 
     * @type {Array<WalletLedgerEntryDto>}
     * @memberof WalletLedgerResponseDto
     */
    items: Array<WalletLedgerEntryDto>;
    /**
     * 
     * @type {PaginationDetailsDto}
     * @memberof WalletLedgerResponseDto
     */
    pagination: PaginationDetailsDto;
}
/**
 * 
 * @export
 * @interface WalletResponseDto
 */
export interface WalletResponseDto {
    /**
     * 
     * @type {number}
     * @memberof WalletResponseDto
     */
    pointsBalance: number;
    /**
     * 
     * @type {number}
     * @memberof WalletResponseDto
     */
    pointsEarnedLifetime: number;
    /**
     * 
     * @type {TierRefDto}
     * @memberof WalletResponseDto
     */
    tierBadge?: TierRefDto | null;
    /**
     * 
     * @type {TierRefDto}
     * @memberof WalletResponseDto
     */
    nextTier?: TierRefDto | null;
    /**
     * 
     * @type {string}
     * @memberof WalletResponseDto
     */
    serverTime: string;
}
/**
 * 
 * @export
 * @interface WarnUserDto
 */
export interface WarnUserDto {
    /**
     * 
     * @type {string}
     * @memberof WarnUserDto
     */
    message: string;
}
/**
 * 
 * @export
 * @interface WatchEventItemDto
 */
export interface WatchEventItemDto {
    /**
     * 
     * @type {string}
     * @memberof WatchEventItemDto
     */
    type: WatchEventItemDtoTypeEnum;
    /**
     * 
     * @type {number}
     * @memberof WatchEventItemDto
     */
    positionSeconds: number;
    /**
     * 
     * @type {string}
     * @memberof WatchEventItemDto
     */
    occurredAt: string;
}


/**
 * @export
 */
export const WatchEventItemDtoTypeEnum = {
    Play: 'play',
    Pause: 'pause',
    Seek: 'seek',
    Heartbeat: 'heartbeat',
    Complete: 'complete'
} as const;
export type WatchEventItemDtoTypeEnum = typeof WatchEventItemDtoTypeEnum[keyof typeof WatchEventItemDtoTypeEnum];

/**
 * 
 * @export
 * @interface WatchHistoryControllerListV1200Response
 */
export interface WatchHistoryControllerListV1200Response {
    /**
     * 
     * @type {number}
     * @memberof WatchHistoryControllerListV1200Response
     */
    statusCode: number;
    /**
     * 
     * @type {string}
     * @memberof WatchHistoryControllerListV1200Response
     */
    status: string;
    /**
     * 
     * @type {string}
     * @memberof WatchHistoryControllerListV1200Response
     */
    message: string;
    /**
     * Error details, or null on success
     * @type {object}
     * @memberof WatchHistoryControllerListV1200Response
     */
    error: object | null;
    /**
     * 
     * @type {Array<WatchHistoryItemDto>}
     * @memberof WatchHistoryControllerListV1200Response
     */
    data?: Array<WatchHistoryItemDto>;
}
/**
 * 
 * @export
 * @interface WatchHistoryDto
 */
export interface WatchHistoryDto {
    /**
     * Recent watch history (max 50)
     * @type {Array<WatchHistoryItemDto>}
     * @memberof WatchHistoryDto
     */
    items: Array<WatchHistoryItemDto>;
}
/**
 * 
 * @export
 * @interface WatchHistoryItemDto
 */
export interface WatchHistoryItemDto {
    /**
     * 
     * @type {string}
     * @memberof WatchHistoryItemDto
     */
    id: string;
    /**
     * 
     * @type {string}
     * @memberof WatchHistoryItemDto
     */
    title: string;
    /**
     * 
     * @type {string}
     * @memberof WatchHistoryItemDto
     */
    slug: string;
    /**
     * 
     * @type {string}
     * @memberof WatchHistoryItemDto
     */
    description?: string | null;
    /**
     * 
     * @type {string}
     * @memberof WatchHistoryItemDto
     */
    contentType: WatchHistoryItemDtoContentTypeEnum;
    /**
     * 
     * @type {string}
     * @memberof WatchHistoryItemDto
     */
    accessTier: WatchHistoryItemDtoAccessTierEnum;
    /**
     * 
     * @type {number}
     * @memberof WatchHistoryItemDto
     */
    unlockPoints?: number | null;
    /**
     * 
     * @type {string}
     * @memberof WatchHistoryItemDto
     */
    studioId?: string | null;
    /**
     * 
     * @type {string}
     * @memberof WatchHistoryItemDto
     */
    videoMediaId?: string | null;
    /**
     * 
     * @type {string}
     * @memberof WatchHistoryItemDto
     */
    thumbnailMediaId?: string | null;
    /**
     * 
     * @type {number}
     * @memberof WatchHistoryItemDto
     */
    durationSeconds?: number | null;
    /**
     * 
     * @type {string}
     * @memberof WatchHistoryItemDto
     */
    language?: string | null;
    /**
     * 
     * @type {string}
     * @memberof WatchHistoryItemDto
     */
    status: string;
    /**
     * 
     * @type {boolean}
     * @memberof WatchHistoryItemDto
     */
    isBoosted: boolean;
    /**
     * 
     * @type {string}
     * @memberof WatchHistoryItemDto
     */
    rightsRegion: string;
    /**
     * 
     * @type {string}
     * @memberof WatchHistoryItemDto
     */
    parentContentId?: string | null;
    /**
     * End of the live window (hidden from the feed after)
     * @type {string}
     * @memberof WatchHistoryItemDto
     */
    availableUntil?: string | null;
    /**
     * 
     * @type {Array<WatchLinkDto>}
     * @memberof WatchHistoryItemDto
     */
    watchLinks: Array<WatchLinkDto>;
    /**
     * 
     * @type {number}
     * @memberof WatchHistoryItemDto
     */
    viewCount: number;
    /**
     * 
     * @type {number}
     * @memberof WatchHistoryItemDto
     */
    likeCount: number;
    /**
     * 
     * @type {number}
     * @memberof WatchHistoryItemDto
     */
    dislikeCount: number;
    /**
     * 
     * @type {number}
     * @memberof WatchHistoryItemDto
     */
    commentCount: number;
    /**
     * 
     * @type {number}
     * @memberof WatchHistoryItemDto
     */
    shareCount: number;
    /**
     * Video media width (px)
     * @type {number}
     * @memberof WatchHistoryItemDto
     */
    videoWidth?: number | null;
    /**
     * Video media height (px)
     * @type {number}
     * @memberof WatchHistoryItemDto
     */
    videoHeight?: number | null;
    /**
     * Signed playback for this viewer. Null when the item is locked, has no video, or its video is still processing. Credentials are short-lived — see expiresInSeconds.
     * @type {PlaybackDto}
     * @memberof WatchHistoryItemDto
     */
    playback?: PlaybackDto | null;
    /**
     * Exclusive content this viewer has not unlocked. Metadata is still returned; playback is not.
     * @type {boolean}
     * @memberof WatchHistoryItemDto
     */
    isLocked?: boolean;
    /**
     * Geo-blocked for this viewer. Metadata is still returned so a share link resolves, but playback is not. Distinct from isLocked — there is nothing the viewer can do about it.
     * @type {boolean}
     * @memberof WatchHistoryItemDto
     */
    isRegionBlocked?: boolean;
    /**
     * Has a live sponsorship ("Sponsored by")
     * @type {boolean}
     * @memberof WatchHistoryItemDto
     */
    sponsored?: boolean;
    /**
     * Feed-inserted commercial (ad slot), not organic content
     * @type {boolean}
     * @memberof WatchHistoryItemDto
     */
    isCommercial?: boolean;
    /**
     * Commercial descriptor (isCommercial items only)
     * @type {FeedAdDto}
     * @memberof WatchHistoryItemDto
     */
    ad?: FeedAdDto | null;
    /**
     * 
     * @type {string}
     * @memberof WatchHistoryItemDto
     */
    durationSource?: WatchHistoryItemDtoDurationSourceEnum;
    /**
     * When the boost notifications campaign was claimed
     * @type {string}
     * @memberof WatchHistoryItemDto
     */
    boostNotifiedAt?: string | null;
    /**
     * Lifetime ad impressions (active sponsorship)
     * @type {number}
     * @memberof WatchHistoryItemDto
     */
    adImpressions?: number;
    /**
     * Lifetime ad clicks (active sponsorship)
     * @type {number}
     * @memberof WatchHistoryItemDto
     */
    adClicks?: number;
    /**
     * clicks / impressions (0..1)
     * @type {number}
     * @memberof WatchHistoryItemDto
     */
    adCtr?: number;
    /**
     * Sponsorship revenue per 1K ad impressions, in cents
     * @type {number}
     * @memberof WatchHistoryItemDto
     */
    adRevenuePer1kImpressionsCents?: number;
    /**
     * 
     * @type {string}
     * @memberof WatchHistoryItemDto
     */
    recommendation?: string;
    /**
     * 
     * @type {boolean}
     * @memberof WatchHistoryItemDto
     */
    isSponsored?: boolean;
    /**
     * 
     * @type {boolean}
     * @memberof WatchHistoryItemDto
     */
    isAdCommercial?: boolean;
    /**
     * 
     * @type {string}
     * @memberof WatchHistoryItemDto
     */
    licenseStatus?: string;
    /**
     * 
     * @type {string}
     * @memberof WatchHistoryItemDto
     */
    licenseExpiresAt?: string | null;
    /**
     * 
     * @type {string}
     * @memberof WatchHistoryItemDto
     */
    scheduledAt?: string | null;
    /**
     * 
     * @type {string}
     * @memberof WatchHistoryItemDto
     */
    publishedAt?: string | null;
    /**
     * 
     * @type {string}
     * @memberof WatchHistoryItemDto
     */
    rejectionReason?: string | null;
    /**
     * 
     * @type {string}
     * @memberof WatchHistoryItemDto
     */
    licensorName?: string | null;
    /**
     * 
     * @type {string}
     * @memberof WatchHistoryItemDto
     */
    licenseTerms?: string | null;
    /**
     * 
     * @type {number}
     * @memberof WatchHistoryItemDto
     */
    boostPriority?: number;
    /**
     * 
     * @type {string}
     * @memberof WatchHistoryItemDto
     */
    boostStartsAt?: string | null;
    /**
     * 
     * @type {string}
     * @memberof WatchHistoryItemDto
     */
    boostedUntil?: string | null;
    /**
     * 
     * @type {Array<string>}
     * @memberof WatchHistoryItemDto
     */
    boostChannels?: Array<WatchHistoryItemDtoBoostChannelsEnum>;
    /**
     * Boosted and now within the boost window
     * @type {boolean}
     * @memberof WatchHistoryItemDto
     */
    isBoostActive?: boolean;
    /**
     * 
     * @type {string}
     * @memberof WatchHistoryItemDto
     */
    studioName?: string | null;
    /**
     * Public URL of the ready thumbnail
     * @type {string}
     * @memberof WatchHistoryItemDto
     */
    thumbnailUrl?: string | null;
    /**
     * 
     * @type {Array<ContentGenreRefDto>}
     * @memberof WatchHistoryItemDto
     */
    genres?: Array<ContentGenreRefDto>;
    /**
     * 
     * @type {Array<ContentTagRefDto>}
     * @memberof WatchHistoryItemDto
     */
    tags?: Array<ContentTagRefDto>;
    /**
     * 
     * @type {Array<PublishRegionDto>}
     * @memberof WatchHistoryItemDto
     */
    publishRegions?: Array<PublishRegionDto>;
    /**
     * Predictions + auctions + quests referencing this content
     * @type {number}
     * @memberof WatchHistoryItemDto
     */
    linkedGamesCount?: number;
    /**
     * 
     * @type {string}
     * @memberof WatchHistoryItemDto
     */
    sponsorName?: string | null;
    /**
     * Sponsor logo/banner for the card badge. The sponsorship's banner on a sponsored video, the advertiser logo on a commercial. Null when the sponsor has no banner or it is not ready. Roll creatives and the click-through still come from GET /v1/content/:id/ads.
     * @type {string}
     * @memberof WatchHistoryItemDto
     */
    sponsorLogoUrl?: string | null;
    /**
     * Where tapping the sponsor logo should go. **Null means the logo is not tappable** — render it as a plain badge, do not fall back to a search or the advertiser site. Null whenever the sponsorship (or commercial) has no clickUrl configured.
     * @type {string}
     * @memberof WatchHistoryItemDto
     */
    sponsorClickUrl?: string | null;
    /**
     * 
     * @type {string}
     * @memberof WatchHistoryItemDto
     */
    adPlacement?: WatchHistoryItemDtoAdPlacementEnum | null;
    /**
     * Average completion % across view sessions
     * @type {number}
     * @memberof WatchHistoryItemDto
     */
    completionRate?: number;
    /**
     * Views last 7d vs previous 7d (±10% = flat)
     * @type {string}
     * @memberof WatchHistoryItemDto
     */
    viewsTrend?: WatchHistoryItemDtoViewsTrendEnum;
    /**
     * (license + sponsorship revenue) / views × 1000, in cents
     * @type {number}
     * @memberof WatchHistoryItemDto
     */
    revenuePer1kCents?: number;
    /**
     * Open moderation tickets on this content
     * @type {number}
     * @memberof WatchHistoryItemDto
     */
    unresolvedFlags?: number;
    /**
     * 
     * @type {ActorRefDto}
     * @memberof WatchHistoryItemDto
     */
    createdBy?: ActorRefDto | null;
    /**
     * 
     * @type {ActorRefDto}
     * @memberof WatchHistoryItemDto
     */
    updatedBy?: ActorRefDto | null;
    /**
     * Cast & crew (detail only)
     * @type {Array<CastMemberDto>}
     * @memberof WatchHistoryItemDto
     */
    cast?: Array<CastMemberDto>;
    /**
     * 
     * @type {string}
     * @memberof WatchHistoryItemDto
     */
    createdAt: string;
    /**
     * 
     * @type {string}
     * @memberof WatchHistoryItemDto
     */
    updatedAt: string;
    /**
     * Resume point, in seconds
     * @type {number}
     * @memberof WatchHistoryItemDto
     */
    lastPositionSeconds: number;
    /**
     * 
     * @type {boolean}
     * @memberof WatchHistoryItemDto
     */
    isCompleted: boolean;
    /**
     * When this content was last watched
     * @type {string}
     * @memberof WatchHistoryItemDto
     */
    watchedAt: string;
}


/**
 * @export
 */
export const WatchHistoryItemDtoContentTypeEnum = {
    Trailer: 'trailer',
    Bts: 'bts',
    Clip: 'clip'
} as const;
export type WatchHistoryItemDtoContentTypeEnum = typeof WatchHistoryItemDtoContentTypeEnum[keyof typeof WatchHistoryItemDtoContentTypeEnum];

/**
 * @export
 */
export const WatchHistoryItemDtoAccessTierEnum = {
    Free: 'free',
    Exclusive: 'exclusive'
} as const;
export type WatchHistoryItemDtoAccessTierEnum = typeof WatchHistoryItemDtoAccessTierEnum[keyof typeof WatchHistoryItemDtoAccessTierEnum];

/**
 * @export
 */
export const WatchHistoryItemDtoDurationSourceEnum = {
    Media: 'media',
    Manual: 'manual'
} as const;
export type WatchHistoryItemDtoDurationSourceEnum = typeof WatchHistoryItemDtoDurationSourceEnum[keyof typeof WatchHistoryItemDtoDurationSourceEnum];

/**
 * @export
 */
export const WatchHistoryItemDtoBoostChannelsEnum = {
    Homepage: 'homepage',
    Notifications: 'notifications',
    Regional: 'regional',
    Subscribers: 'subscribers'
} as const;
export type WatchHistoryItemDtoBoostChannelsEnum = typeof WatchHistoryItemDtoBoostChannelsEnum[keyof typeof WatchHistoryItemDtoBoostChannelsEnum];

/**
 * @export
 */
export const WatchHistoryItemDtoAdPlacementEnum = {
    PreRoll: 'pre-roll',
    MidRoll: 'mid-roll',
    PostRoll: 'post-roll',
    Overlay: 'overlay'
} as const;
export type WatchHistoryItemDtoAdPlacementEnum = typeof WatchHistoryItemDtoAdPlacementEnum[keyof typeof WatchHistoryItemDtoAdPlacementEnum];

/**
 * @export
 */
export const WatchHistoryItemDtoViewsTrendEnum = {
    Up: 'up',
    Flat: 'flat',
    Down: 'down'
} as const;
export type WatchHistoryItemDtoViewsTrendEnum = typeof WatchHistoryItemDtoViewsTrendEnum[keyof typeof WatchHistoryItemDtoViewsTrendEnum];

/**
 * 
 * @export
 * @interface WatchLinkDto
 */
export interface WatchLinkDto {
    /**
     * 
     * @type {string}
     * @memberof WatchLinkDto
     */
    platform: WatchLinkDtoPlatformEnum;
    /**
     * Display label (required when platform = Other)
     * @type {string}
     * @memberof WatchLinkDto
     */
    label?: string;
    /**
     * https:// deep link
     * @type {string}
     * @memberof WatchLinkDto
     */
    url?: string;
}


/**
 * @export
 */
export const WatchLinkDtoPlatformEnum = {
    Netflix: 'Netflix',
    PrimeVideo: 'Prime Video',
    Disney: 'Disney+',
    AppleTv: 'Apple TV',
    InCinemas: 'In cinemas',
    Other: 'Other'
} as const;
export type WatchLinkDtoPlatformEnum = typeof WatchLinkDtoPlatformEnum[keyof typeof WatchLinkDtoPlatformEnum];

/**
 * 
 * @export
 * @interface WatchLinkInputDto
 */
export interface WatchLinkInputDto {
    /**
     * 
     * @type {string}
     * @memberof WatchLinkInputDto
     */
    platform: WatchLinkInputDtoPlatformEnum;
    /**
     * Required when platform = Other
     * @type {string}
     * @memberof WatchLinkInputDto
     */
    label?: string;
    /**
     * 
     * @type {string}
     * @memberof WatchLinkInputDto
     */
    url?: string;
}


/**
 * @export
 */
export const WatchLinkInputDtoPlatformEnum = {
    Netflix: 'Netflix',
    PrimeVideo: 'Prime Video',
    Disney: 'Disney+',
    AppleTv: 'Apple TV',
    InCinemas: 'In cinemas',
    Other: 'Other'
} as const;
export type WatchLinkInputDtoPlatformEnum = typeof WatchLinkInputDtoPlatformEnum[keyof typeof WatchLinkInputDtoPlatformEnum];

/**
 * 
 * @export
 * @interface WatchStatsDto
 */
export interface WatchStatsDto {
    /**
     * Distinct contents with a counted view
     * @type {number}
     * @memberof WatchStatsDto
     */
    videosWatched: number;
    /**
     * All viewing sessions
     * @type {number}
     * @memberof WatchStatsDto
     */
    sessions: number;
    /**
     * Counted views
     * @type {number}
     * @memberof WatchStatsDto
     */
    views: number;
    /**
     * 
     * @type {number}
     * @memberof WatchStatsDto
     */
    totalWatchSeconds: number;
    /**
     * Avg watch seconds per session ("Avg. Session")
     * @type {number}
     * @memberof WatchStatsDto
     */
    avgSessionSeconds: number;
    /**
     * % of counted views completed
     * @type {number}
     * @memberof WatchStatsDto
     */
    completionRate: number;
    /**
     * 
     * @type {string}
     * @memberof WatchStatsDto
     */
    lastWatchedAt?: string | null;
    /**
     * Top 10 by watch time
     * @type {Array<FavoriteGenreDto>}
     * @memberof WatchStatsDto
     */
    favoriteGenres: Array<FavoriteGenreDto>;
    /**
     * 
     * @type {WatchStreakSummaryDto}
     * @memberof WatchStatsDto
     */
    streak: WatchStreakSummaryDto;
}
/**
 * 
 * @export
 * @interface WatchStreakSummaryDto
 */
export interface WatchStreakSummaryDto {
    /**
     * 0 when broken
     * @type {number}
     * @memberof WatchStreakSummaryDto
     */
    currentStreak: number;
    /**
     * 
     * @type {number}
     * @memberof WatchStreakSummaryDto
     */
    longestStreak: number;
    /**
     * 
     * @type {number}
     * @memberof WatchStreakSummaryDto
     */
    level: number;
    /**
     * 
     * @type {number}
     * @memberof WatchStreakSummaryDto
     */
    activeDays: number;
}
/**
 * 
 * @export
 * @interface WatchlistControllerListV1200Response
 */
export interface WatchlistControllerListV1200Response {
    /**
     * 
     * @type {number}
     * @memberof WatchlistControllerListV1200Response
     */
    statusCode: number;
    /**
     * 
     * @type {string}
     * @memberof WatchlistControllerListV1200Response
     */
    status: string;
    /**
     * 
     * @type {string}
     * @memberof WatchlistControllerListV1200Response
     */
    message: string;
    /**
     * Error details, or null on success
     * @type {object}
     * @memberof WatchlistControllerListV1200Response
     */
    error: object | null;
    /**
     * 
     * @type {Array<ContentResponseDto>}
     * @memberof WatchlistControllerListV1200Response
     */
    data?: Array<ContentResponseDto>;
}
/**
 * 
 * @export
 * @interface WatchlistControllerSaveV1200Response
 */
export interface WatchlistControllerSaveV1200Response {
    /**
     * 
     * @type {number}
     * @memberof WatchlistControllerSaveV1200Response
     */
    statusCode: number;
    /**
     * 
     * @type {string}
     * @memberof WatchlistControllerSaveV1200Response
     */
    status: string;
    /**
     * 
     * @type {string}
     * @memberof WatchlistControllerSaveV1200Response
     */
    message: string;
    /**
     * Error details, or null on success
     * @type {object}
     * @memberof WatchlistControllerSaveV1200Response
     */
    error: object | null;
    /**
     * 
     * @type {WatchlistResultDto}
     * @memberof WatchlistControllerSaveV1200Response
     */
    data?: WatchlistResultDto;
}
/**
 * 
 * @export
 * @interface WatchlistResultDto
 */
export interface WatchlistResultDto {
    /**
     * true after save, false after remove
     * @type {boolean}
     * @memberof WatchlistResultDto
     */
    saved: boolean;
}
