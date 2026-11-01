"use client";

import type { ComponentType } from "react";

import Link from "next/link";

import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { useTabParam } from "@/app/_libs/use-tab-param";

import { CONTENT_ROUTES } from "../../_shared/content-config";
import {
  TAXONOMY_COPY,
  TAXONOMY_DEFAULTS,
  TAXONOMY_TABS_CONFIG,
  TaxonomyTab,
  toTaxonomyTab,
} from "../_shared/taxonomy-config";
import { GenresTab } from "./genres/genres-tab";
import { PeopleTab } from "./people/people-tab";
import { StudiosTab } from "./studios/studios-tab";
import { TagsTab } from "./tags/tags-tab";

const TAB_PANELS: Record<TaxonomyTab, ComponentType> = {
  [TaxonomyTab.Studios]: StudiosTab,
  [TaxonomyTab.Genres]: GenresTab,
  [TaxonomyTab.Tags]: TagsTab,
  [TaxonomyTab.People]: PeopleTab,
};

const TABS = Object.values(TaxonomyTab);

/** Header + tab shell; each tab owns its data in `_components/<tab>/`. */
export function TaxonomyView() {
  const [rawTab, setTab] = useTabParam(TAXONOMY_DEFAULTS.tab);
  const tab = toTaxonomyTab(rawTab);

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="icon" aria-label={TAXONOMY_COPY.backLabel}>
          <Link href={CONTENT_ROUTES.LIST}>
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="font-gaming text-foreground text-3xl font-bold">
            {TAXONOMY_COPY.pageTitle}
          </h1>
          <p className="text-foreground-secondary mt-1">{TAXONOMY_COPY.pageSubtitle}</p>
        </div>
      </div>

      <Tabs value={tab} onValueChange={setTab} className="space-y-6">
        <TabsList className="bg-muted/30 p-1">
          {TABS.map((value) => (
            <TabsTrigger key={value} value={value} className="cursor-pointer">
              {TAXONOMY_TABS_CONFIG[value].title}
            </TabsTrigger>
          ))}
        </TabsList>

        {TABS.map((value) => {
          const Panel = TAB_PANELS[value];
          return (
            <TabsContent key={value} value={value}>
              <Panel />
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}
