import * as React from "react";

import { differenceInCalendarDays } from "date-fns";
import { Gavel } from "lucide-react";

import {
  LicenseResponseDtoLicenseTypeEnum as LicenseExclusivity,
  type LicenseResponseDto,
} from "@/app/_libs/api/generated";
import { DetailRow } from "@/components/custom/detail-row";

import { RENEWAL_OPTIONS } from "../../../../_libs/video-form/rights/rights-options";
import {
  EMPTY,
  formatCents,
  formatDateRange,
  parseApiDate,
} from "../../../../_shared/content-format";
import { DetailsCard } from "../details-card";
import { DETAILS_COPY } from "../details-config";

export interface RightsSectionProps {
  /** The active licence; none means the title is original / owned. */
  license?: LicenseResponseDto | null;
}

/** The licence's `licenseType` is its exclusivity. */
const EXCLUSIVITY_LABELS: Record<LicenseExclusivity, string> = {
  [LicenseExclusivity.Exclusive]: "Exclusive",
  [LicenseExclusivity.NonExclusive]: "Non-exclusive",
};

const renewalLabel = (value?: string) =>
  RENEWAL_OPTIONS.find((option) => option.value === value)?.label ?? value ?? EMPTY;

/** "in 42 days" / "today" / "12 days ago". */
const expiryText = (expiresAt?: string | null) => {
  const expiry = parseApiDate(expiresAt);
  if (!expiry) return EMPTY;
  const days = differenceInCalendarDays(expiry, new Date());
  if (days === 0) return "Expires today";
  return days > 0 ? `Expires in ${days} days` : `Expired ${-days} days ago`;
};

/** Wizard step 2: original, or the licence's holder, term, renewal, money and terms. */
export const RightsSection: React.FC<RightsSectionProps> = ({ license }) => (
  <DetailsCard title="Licensing & Rights" icon={Gavel}>
    {!license ? (
      <DetailRow label="License type">{DETAILS_COPY.noLicense}</DetailRow>
    ) : (
      <>
        <DetailRow label="License type">Licensed</DetailRow>
        <DetailRow label="Exclusivity">
          {EXCLUSIVITY_LABELS[license.licenseType] ?? license.licenseType}
        </DetailRow>
        <DetailRow label="Licensor / rights holder">{license.licensorName || EMPTY}</DetailRow>
        <DetailRow label="Term">{formatDateRange(license.startsAt, license.expiresAt)}</DetailRow>
        <DetailRow label="Expiry">{expiryText(license.expiresAt)}</DetailRow>
        <DetailRow label="Renewal status">{renewalLabel(license.renewalStatus)}</DetailRow>
        <DetailRow label="License cost">
          {formatCents(license.licenseCostCents, license.currency)}
        </DetailRow>
        <DetailRow label="Revenue source">{license.revenueSource || EMPTY}</DetailRow>
        <DetailRow label="Revenue generated">
          {formatCents(license.revenueGeneratedCents, license.currency)}
        </DetailRow>
        <DetailRow label="License terms">
          <p className="whitespace-pre-line">{license.terms || EMPTY}</p>
        </DetailRow>
      </>
    )}
  </DetailsCard>
);

RightsSection.displayName = "RightsSection";
