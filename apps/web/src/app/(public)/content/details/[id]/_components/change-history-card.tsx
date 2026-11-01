"use client";

import * as React from "react";
import { useState } from "react";

import { ChevronDown, ChevronUp, History } from "lucide-react";

import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

import type { ContentHistoryEntryDto } from "@/app/_libs/api/generated";
import { formatRoleName } from "@/app/_libs/utils/user-display";
import { GlassCard } from "@/components/custom/glass-card";

import { formatDateTime } from "../../../_shared/content-format";
import { DETAILS_COPY, historyActionLabel, historyChangeDetail } from "./details-config";

export interface ChangeHistoryCardProps {
  /** Newest first, as the API returns it. */
  history: ContentHistoryEntryDto[];
  className?: string;
}

/** Collapsible timeline of who did what to the video, and when. */
export const ChangeHistoryCard: React.FC<ChangeHistoryCardProps> = ({ history, className }) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className={className}>
      <GlassCard>
        <CollapsibleTrigger className="w-full cursor-pointer">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-accent flex items-center gap-2 text-base">
              <History className="h-4 w-4" />
              Change History
            </CardTitle>
            {isOpen ? (
              <ChevronUp className="text-foreground-secondary h-4 w-4" />
            ) : (
              <ChevronDown className="text-foreground-secondary h-4 w-4" />
            )}
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-0">
            {history.length === 0 ? (
              <p className="text-muted-foreground text-sm">{DETAILS_COPY.noHistory}</p>
            ) : (
              <ol className="space-y-3">
                {history.map((entry, index) => (
                  <li key={entry.id} className="relative pl-4">
                    {index !== history.length - 1 && (
                      <div className="bg-border absolute top-6 bottom-0 left-[5px] w-0.5" />
                    )}
                    <div className="bg-primary absolute top-1.5 left-0 h-3 w-3 rounded-full" />
                    <div className="text-left text-sm">
                      <p className="text-foreground font-medium">
                        {entry.changedByName ?? "System"}
                        {entry.changedByRole && (
                          <span className="text-foreground-muted font-normal">
                            {" "}
                            ({formatRoleName(entry.changedByRole)})
                          </span>
                        )}
                      </p>
                      <p className="text-foreground-secondary">
                        {historyActionLabel(entry.action)}
                      </p>
                      {entry.note && (
                        <p className="text-muted-foreground mt-0.5 text-xs">{entry.note}</p>
                      )}
                      {historyChangeDetail(entry) && (
                        <p className="text-muted-foreground text-xs">
                          {historyChangeDetail(entry)}
                        </p>
                      )}
                      <p className="text-foreground-muted mt-0.5 font-mono text-xs">
                        {formatDateTime(entry.createdAt)}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </CardContent>
        </CollapsibleContent>
      </GlassCard>
    </Collapsible>
  );
};

ChangeHistoryCard.displayName = "ChangeHistoryCard";
