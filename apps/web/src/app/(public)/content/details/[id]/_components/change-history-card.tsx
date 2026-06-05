"use client";

import { useState } from "react";

import { ChevronDown, ChevronUp, History } from "lucide-react";

import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

import { GlassCard } from "../../../../games/_components/glass-card";

interface ChangeHistoryEntry {
  id: string;
  admin: string;
  role: string;
  action: string;
  timestamp: string;
}

interface ChangeHistoryCardProps {
  history: ChangeHistoryEntry[];
}

export function ChangeHistoryCard({ history }: ChangeHistoryCardProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <GlassCard>
        <CollapsibleTrigger className="w-full">
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
            <div className="space-y-3">
              {history.map((entry, index) => (
                <div key={entry.id} className="relative pl-4">
                  {index !== history.length - 1 && (
                    <div className="bg-border absolute top-6 bottom-0 left-[5px] w-0.5" />
                  )}
                  <div className="bg-primary absolute top-1.5 left-0 h-3 w-3 rounded-full" />
                  <div className="text-left text-sm">
                    <p className="text-foreground font-medium">
                      {entry.admin}{" "}
                      <span className="text-foreground-muted font-normal">({entry.role})</span>
                    </p>
                    <p className="text-foreground-secondary">{entry.action}</p>
                    <p className="text-foreground-muted mt-0.5 font-mono text-xs">
                      {entry.timestamp}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </CollapsibleContent>
      </GlassCard>
    </Collapsible>
  );
}
