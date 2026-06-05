import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";
import type { Route } from "next";

import { Button } from "@/components/ui/button";

interface FormatHeaderProps {
  name: string;
  isNew: boolean;
  onSave: () => void;
  formatIcon: React.ElementType;
}

export function FormatHeader({ name, isNew, onSave, formatIcon: FormatIcon }: FormatHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={"/games" as Route}>
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div className="flex items-center gap-3">
          <div className="bg-accent/10 text-accent rounded-lg p-2">
            <FormatIcon className="h-6 w-6" />
          </div>
          <div>
            <h1 className="font-gaming text-foreground text-2xl font-bold">
              {isNew ? "Create Game Format" : name || "Game Format Details"}
            </h1>
            <p className="text-foreground-secondary text-sm">
              {isNew ? "Define a new game format" : `Manage format settings and view analytics`}
            </p>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Button variant="outline" asChild>
          <Link href={"/games" as Route}>Cancel</Link>
        </Button>
        <Button onClick={onSave}>
          <Save className="mr-2 h-4 w-4" />
          {isNew ? "Create Format" : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}
