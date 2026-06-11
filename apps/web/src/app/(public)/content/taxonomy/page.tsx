"use client";

import type { Route } from "next";
import Link from "next/link";

import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { useTabParam } from "@/app/_libs/use-tab-param";

import { TaxonomyManager, type TaxonomyItem } from "./_components/taxonomy-manager";

const STUDIOS: TaxonomyItem[] = [
  { id: "s1", name: "Seoul Studios", meta: "South Korea", count: 142 },
  { id: "s2", name: "Global Rights Co", meta: "USA", count: 98 },
  { id: "s3", name: "ArtHouse Dist.", meta: "France", count: 41 },
  { id: "s4", name: "Premiere Media", meta: "UK", count: 67 },
];

const GENRES: TaxonomyItem[] = [
  { id: "g1", name: "Action", count: 312 },
  { id: "g2", name: "Drama", count: 280 },
  { id: "g3", name: "Romance", count: 191 },
  { id: "g4", name: "Comedy", count: 164 },
  { id: "g5", name: "Thriller", count: 133 },
  { id: "g6", name: "Documentary", count: 58 },
];

const TAGS: TaxonomyItem[] = [
  { id: "t1", name: "trending", count: 88 },
  { id: "t2", name: "award-winning", count: 54 },
  { id: "t3", name: "exclusive", count: 122 },
  { id: "t4", name: "behind-the-scenes", count: 76 },
];

const CAST: TaxonomyItem[] = [
  { id: "p1", name: "Min-jun Kim", meta: "Actor", count: 23 },
  { id: "p2", name: "Sarah Okafor", meta: "Director", count: 11 },
  { id: "p3", name: "Diego Ramos", meta: "Actor", count: 18 },
  { id: "p4", name: "Aria Nakamura", meta: "Writer", count: 7 },
];

export default function TaxonomyPage() {
  const [tab, setTab] = useTabParam("studios");
  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="icon">
          <Link href={"/content" as Route}>
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="font-gaming text-foreground text-3xl font-bold">Content Library</h1>
          <p className="text-foreground-secondary mt-1">
            Manage the master data referenced across content — studios, genres, tags, cast.
          </p>
        </div>
      </div>

      <Tabs value={tab} onValueChange={setTab} className="space-y-6">
        <TabsList className="bg-muted/30 p-1">
          <TabsTrigger value="studios">Studios</TabsTrigger>
          <TabsTrigger value="genres">Genres</TabsTrigger>
          <TabsTrigger value="tags">Tags</TabsTrigger>
          <TabsTrigger value="cast">Cast & Crew</TabsTrigger>
        </TabsList>

        <TabsContent value="studios">
          <TaxonomyManager title="Studios" noun="Studio" metaLabel="Country" imageLabel="Logo" initialItems={STUDIOS} />
        </TabsContent>
        <TabsContent value="genres">
          <TaxonomyManager title="Genres" noun="Genre" initialItems={GENRES} />
        </TabsContent>
        <TabsContent value="tags">
          <TaxonomyManager title="Tags" noun="Tag" initialItems={TAGS} />
        </TabsContent>
        <TabsContent value="cast">
          <TaxonomyManager title="Cast & Crew" noun="Person" metaLabel="Role" imageLabel="Photo" initialItems={CAST} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
