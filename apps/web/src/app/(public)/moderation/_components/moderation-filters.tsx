"use client";

import { useCallback, useEffect, useState } from "react";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { Filter, Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { GlassCard } from "../../games/_components/glass-card";

interface ModerationFiltersProps {
  searchQuery: string;
}

export function ModerationFilters({ searchQuery }: ModerationFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [localSearch, setLocalSearch] = useState(searchQuery);

  const typeFilter = searchParams.get("type") || "all";
  const severityFilter = searchParams.get("severity") || "all";
  const categoryFilter = searchParams.get("category") || "all";

  // Debounce search update to URL
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch !== searchQuery) {
        updateQuery("q", localSearch);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [localSearch, searchQuery]);

  const updateQuery = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value && value !== "all") {
        params.set(name, value);
      } else {
        params.delete(name);
      }
      params.delete("page"); // Reset pagination
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [searchParams, pathname, router],
  );

  return (
    // <GlassCard className="p-4">
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
      <div className="relative w-[500px]">
        <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
        <Input
          placeholder="Search by username, user ID, or content keywords..."
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          className="pl-10"
        />
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-2">
          <Filter className="text-muted-foreground h-4 w-4" />
          <span className="text-muted-foreground text-sm font-medium">Filters:</span>
        </div>
        <Select value={typeFilter} onValueChange={(v) => updateQuery("type", v)}>
          <SelectTrigger className="min-w-[130px]">
            <SelectValue placeholder="Content Type" />
          </SelectTrigger>
          <SelectContent className="border-border bg-card z-50">
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="comment">Comments</SelectItem>
            <SelectItem value="video">Videos</SelectItem>
            <SelectItem value="user">Users</SelectItem>
          </SelectContent>
        </Select>

        <Select value={severityFilter} onValueChange={(v) => updateQuery("severity", v)}>
          <SelectTrigger className="min-w-[130px]">
            <SelectValue placeholder="Severity" />
          </SelectTrigger>
          <SelectContent className="border-border bg-card z-50">
            <SelectItem value="all">All Severities</SelectItem>
            <SelectItem value="high">High Risk</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low Risk</SelectItem>
          </SelectContent>
        </Select>

        <Select value={categoryFilter} onValueChange={(v) => updateQuery("category", v)}>
          <SelectTrigger className="min-w-[130px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent className="border-border bg-card z-50">
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="hate_speech">Hate Speech</SelectItem>
            <SelectItem value="harassment">Harassment</SelectItem>
            <SelectItem value="spam">Spam</SelectItem>
            <SelectItem value="nudity">Nudity</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
    // </GlassCard>
  );
}
