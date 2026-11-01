/** Ad Sales types for the ads screens, re-exported from the generated SDK. */
import type {
  AdCampaignDtoPricingModelEnum,
  AdCampaignDtoStatusEnum,
  AdCampaignDtoTypeEnum,
} from "@/app/_libs/api/generated";

export type {
  AdCampaignDetailDto,
  AdCampaignPerformanceDto,
  AdCampaignDto,
  AdDailyDeliveryDto,
  AdKindDeliveryDto,
  AdLinkedContentDto,
  AdPacingDto,
  AdSalesSummaryDto,
  CreateAdCampaignDto,
  DeliveryDto,
  LedgerTotalsDto,
  RankBoardDto,
  RankBookingDto,
  RankSlotDto,
  RegionRanksDto,
  SwapRanksDto,
  SwapRanksResultDto,
  UpdateAdCampaignDto,
} from "@/app/_libs/api/generated";
export {
  AdCampaignDtoStatusEnum as AdCampaignStatusEnum,
  AdCampaignDtoTypeEnum as AdCampaignTypeEnum,
  AdCampaignDtoPricingModelEnum as AdPricingModelEnum,
  RankBoardDtoRegionEnum as AdRegionEnum,
} from "@/app/_libs/api/generated";

export type AdCampaignStatus = AdCampaignDtoStatusEnum;
export type AdCampaignType = AdCampaignDtoTypeEnum;
export type AdPricingModel = AdCampaignDtoPricingModelEnum;
