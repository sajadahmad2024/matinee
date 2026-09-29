import type { Route } from "next";
import Link from "next/link";

import { Button } from "@/components/ui/button";

import { getAdById } from "../../constants";
import { AdForm } from "../../new/_components/ad-form";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditAdPage({ params }: PageProps) {
  const { id } = await params;
  const ad = getAdById(decodeURIComponent(id));

  if (!ad) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center">
        <p className="text-foreground text-lg font-semibold">Ad not found</p>
        <Button asChild variant="outline">
          <Link href={"/ads" as Route}>Back to Ads</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in pb-12">
      <AdForm initial={ad} />
    </div>
  );
}
