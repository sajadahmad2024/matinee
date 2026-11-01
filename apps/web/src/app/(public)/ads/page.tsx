import { Suspense } from "react";

import Link from "next/link";

import { BarChart3, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";

import { PageHeader } from "@/components/custom/page-header";

import { AdList } from "./_components/ad-list";
import { AdListSkeleton } from "./_components/ad-skeletons";
import { AdSummaryTiles } from "./_components/ad-summary-tiles";
import { AD_ROUTES } from "./_libs/ad-config";

export default function AdsManagementPage() {
  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader
        title="Ads Management"
        subtitle="Video ads shown between reels"
        actions={
          <>
            <Button asChild variant="outline" className="gap-2">
              <Link href={AD_ROUTES.PLATFORM}>
                <BarChart3 className="h-4 w-4" /> Global analytics
              </Link>
            </Button>
            <Button asChild className="gap-2">
              <Link href={AD_ROUTES.NEW}>
                <Plus className="h-4 w-4" /> New Ad
              </Link>
            </Button>
          </>
        }
      />

      <AdSummaryTiles />

      <Suspense fallback={<AdListSkeleton />}>
        <AdList />
      </Suspense>
    </div>
  );
}
