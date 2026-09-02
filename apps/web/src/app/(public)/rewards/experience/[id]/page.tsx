import type { Route } from "next";
import Link from "next/link";

import { ArrowLeft, Gift } from "lucide-react";

import { Button } from "@/components/ui/button";
import { CardContent } from "@/components/ui/card";

import { GlassCard } from "@/app/(public)/games/_components/glass-card";

import { MOCK_EXPERIENCES } from "../../constants";
import { ExperienceForm } from "../_components/experience-form";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ExperienceDetailPage({ params }: PageProps) {
  const { id } = await params;
  const experience = MOCK_EXPERIENCES.find((e) => e.id === id);

  if (!experience) {
    return (
      <div className="animate-fade-in">
        <GlassCard>
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <Gift className="text-muted-foreground h-8 w-8" />
            <p className="text-foreground font-medium">Unknown experience</p>
            <p className="text-muted-foreground text-sm">
              This reward doesn&apos;t exist (or was removed).
            </p>
            <Button asChild variant="outline" className="mt-2 gap-2">
              <Link href={"/rewards" as Route}>
                <ArrowLeft className="h-4 w-4" /> Back to Rewards
              </Link>
            </Button>
          </CardContent>
        </GlassCard>
      </div>
    );
  }

  return <ExperienceForm experience={experience} />;
}
