import type { Metadata } from "next";

import { PageHeader } from "@/components/custom/page-header";

import { GAME_ROUTES } from "../_libs/game-config";
import { BadgeManagement } from "./_components/badge-management";

export const metadata: Metadata = {
  title: "Badges",
  description: "Achievement badges users unlock across game formats.",
};

export default function BadgesPage() {
  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader
        title="Badges"
        subtitle="Achievement badges users unlock across game formats."
        backHref={GAME_ROUTES.LIST}
        backLabel="Back to Game Management"
      />
      <BadgeManagement />
    </div>
  );
}
