"use client";

import { AlertTriangle, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ModerationFiltersProps {
  searchQuery: string;
  onSearchQueryChange: (val: string) => void;
  typeFilter: string;
  onTypeFilterChange: (val: string) => void;
  severityFilter: string;
  onSeverityFilterChange: (val: string) => void;
  categoryFilter: string;
  onCategoryFilterChange: (val: string) => void;
}

export function ModerationFilters({
  searchQuery,
  onSearchQueryChange,
  typeFilter,
  onTypeFilterChange,
  severityFilter,
  onSeverityFilterChange,
  categoryFilter,
  onCategoryFilterChange,
}: ModerationFiltersProps) {
  return (
    <div className="flex flex-wrap gap-3">
      <div className="relative max-w-sm flex-1">
        <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
        <Input
          placeholder="Search content or user..."
          value={searchQuery}
          onChange={(e) => onSearchQueryChange(e.target.value)}
          className="bg-background/50 pl-9"
        />
      </div>
      <Select value={typeFilter} onValueChange={onTypeFilterChange}>
        <SelectTrigger className="bg-background/50 w-[130px]">
          <SelectValue placeholder="Type" />
        </SelectTrigger>
        <SelectContent className="border-border bg-card">
          <SelectItem value="all">All Types</SelectItem>
          <SelectItem value="comment">Comments</SelectItem>
          <SelectItem value="video">Videos</SelectItem>
          <SelectItem value="user">Users</SelectItem>
        </SelectContent>
      </Select>
      <Select value={severityFilter} onValueChange={onSeverityFilterChange}>
        <SelectTrigger className="bg-background/50 w-[130px]">
          <SelectValue placeholder="Severity" />
        </SelectTrigger>
        <SelectContent className="border-border bg-card">
          <SelectItem value="all">All Severity</SelectItem>
          <SelectItem value="high">High</SelectItem>
          <SelectItem value="medium">Medium</SelectItem>
          <SelectItem value="low">Low</SelectItem>
        </SelectContent>
      </Select>
      <Select value={categoryFilter} onValueChange={onCategoryFilterChange}>
        <SelectTrigger className="bg-background/50 w-[140px]">
          <SelectValue placeholder="Category" />
        </SelectTrigger>
        <SelectContent className="border-border bg-card">
          <SelectItem value="all">All Categories</SelectItem>
          <SelectItem value="hate_speech">Hate Speech</SelectItem>
          <SelectItem value="spam">Spam</SelectItem>
          <SelectItem value="nudity">Nudity</SelectItem>
          <SelectItem value="harassment">Harassment</SelectItem>
        </SelectContent>
      </Select>
      <Button
        variant={severityFilter === "high" ? "default" : "outline"}
        size="sm"
        onClick={() => onSeverityFilterChange(severityFilter === "high" ? "all" : "high")}
        className="gap-2">
        <AlertTriangle className="h-4 w-4" />
        High Severity
      </Button>
    </div>
  );
}
