"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";

import { useAdCampaign } from "@/app/_libs/hooks/api/use-admin-ads";
import { useReturnTo } from "@/hooks/use-return-to";

import { AdQueryState } from "../../../_components/ad-query-state";
import { AdFormSkeleton } from "../../../_components/ad-skeletons";
import { canEditAd } from "../../../_components/ad-status-actions";
import { AD_ROUTES } from "../../../_libs/ad-config";
import { AdForm } from "../../../new/_components/ad-form";

export function EditAdClient({ id }: { id: string }) {
  const { campaignQuery, campaign } = useAdCampaign(id);
  const listHref = useReturnTo(AD_ROUTES.LIST);

  if (!campaign) return <AdQueryState query={campaignQuery} skeleton={<AdFormSkeleton />} />;

  if (!canEditAd(campaign?.status)) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center">
        <p className="text-foreground text-lg font-semibold">Ended ads can&apos;t be edited</p>
        <Button asChild variant="outline">
          <Link href={AD_ROUTES.details(campaign?.id, listHref)}>Back to the ad</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in pb-12">
      <AdForm campaign={campaign} />
    </div>
  );
}
