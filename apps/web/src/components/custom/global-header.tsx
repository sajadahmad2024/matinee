"use client";

import { useEffect, useRef, useState } from "react";

import type { Route } from "next";
import { usePathname, useRouter } from "next/navigation";

import {
  LuBell,
  LuChevronRight,
  LuClock,
  LuExternalLink,
  LuFilm,
  LuLoaderCircle,
  LuSearch,
} from "react-icons/lu";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

import { cn } from "@/app/_libs/utils/cn";

const breadcrumbMap: Record<string, string> = {
  dashboard: "Dashboard",
  content: "Content Management",
  details: "Video Details",
  games: "Game Center",
  users: "User Management",
  subscriptions: "Subscriptions",
  moderation: "Moderation Queue",
  settings: "Settings",
};

// All searchable videos (combined from all tabs)
const allVideos = [
  { id: "1", title: "K-Drama Romance: Episode 1", studioName: "Seoul Studios" },
  { id: "2", title: "Action Thrill: The Chase", studioName: "Thunder Productions" },
  { id: "3", title: "The Sword Master", studioName: "Wuxia Films" },
  { id: "4", title: "Mystery Night: The Beginning", studioName: "Dark Moon Studios" },
  { id: "5", title: "Cooking Battle: Season 2 Finale", studioName: "Food Network Asia" },
  { id: "6", title: "Travel Adventures: Japan", studioName: "Wanderlust Media" },
];

interface Notification {
  id: string;
  type: "report" | "upload" | "system";
  title: string;
  message: string;
  time: string;
  read: boolean;
  linkedVideoId?: string;
}

const mockNotifications: Notification[] = [
  {
    id: "1",
    type: "report",
    title: "User Reported",
    message: "Video #1203 flagged for review",
    time: "2 min ago",
    read: false,
    linkedVideoId: "1",
  },
  {
    id: "2",
    type: "upload",
    title: "Upload Complete",
    message: "K-Drama Romance is now live",
    time: "15 min ago",
    read: false,
    linkedVideoId: "1",
  },
  {
    id: "3",
    type: "system",
    title: "System Update",
    message: "New features deployed successfully",
    time: "1 hour ago",
    read: true,
  },
];

// Simulated API call with delay
const searchVideos = (query: string): Promise<typeof allVideos> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (!query) {
        resolve(allVideos);
      } else {
        const filtered = allVideos.filter((v) =>
          v.title.toLowerCase().startsWith(query.toLowerCase()),
        );
        resolve(filtered);
      }
    }, 400);
  });
};

export function GlobalHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [serverTime, setServerTime] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<typeof allVideos>([]);
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const searchRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Fetch videos on search query change
  useEffect(() => {
    let cancelled = false;

    const fetchVideos = async () => {
      setIsLoading(true);
      const results = await searchVideos(searchQuery);
      if (!cancelled) {
        setSearchResults(results);
        setIsLoading(false);
      }
    };

    if (isSearchOpen) {
      fetchVideos();
    }

    return () => {
      cancelled = true;
    };
  }, [searchQuery, isSearchOpen]);

  // Build breadcrumbs from path
  const pathSegments = pathname.split("/").filter(Boolean);
  const breadcrumbs = pathSegments.map((segment, index) => ({
    label: breadcrumbMap[segment] || segment,
    isLast: index === pathSegments.length - 1,
  }));

  // Update server time every second
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getUTCHours().toString().padStart(2, "0");
      const minutes = now.getUTCMinutes().toString().padStart(2, "0");
      setServerTime(`${hours}:${minutes} UTC`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Close search dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleVideoSelect = (videoId: string) => {
    router.push(`/content/details/${videoId}` as Route);
    setSearchQuery("");
    setIsSearchOpen(false);
  };

  const handleSearchFocus = () => {
    setIsSearchOpen(true);
  };

  const handleNotificationClick = (notification: Notification) => {
    // Mark as read
    setNotifications((prev) =>
      prev.map((n) => (n.id === notification.id ? { ...n, read: true } : n)),
    );

    // Navigate if there's a linked video (not for system updates)
    if (notification.linkedVideoId && notification.type !== "system") {
      router.push(`/content/details/${notification.linkedVideoId}` as Route);
    }
  };

  return (
    <header className="border-border bg-background-secondary/80 sticky top-0 z-50 flex h-16 items-center justify-between border-b px-6 backdrop-blur-xl">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-sm">
        {breadcrumbs.map((crumb, index) => (
          <div key={index} className="flex items-center gap-2">
            {index > 0 && <LuChevronRight className="text-foreground-muted h-4 w-4" />}
            <span
              className={cn(
                crumb.isLast ? "text-foreground font-medium" : "text-foreground-secondary",
              )}>
              {crumb.label}
            </span>
          </div>
        ))}
      </nav>

      {/* Right Section */}
      <div className="flex items-center gap-4">
        {/* Global Search with Dropdown */}
        <div className="relative w-72" ref={searchRef}>
          <LuSearch className="text-foreground-secondary absolute top-1/2 left-3 z-10 h-4 w-4 -translate-y-1/2" />
          <Input
            type="search"
            placeholder="Search videos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={handleSearchFocus}
            className="bg-background-secondary/80 border-border/50 focus:bg-background-secondary focus:border-primary/50 h-9 pl-10"
          />

          {/* Search Results Dropdown */}
          {isSearchOpen && (
            <div className="border-border/60 bg-background-secondary animate-in fade-in-0 zoom-in-95 absolute top-full right-0 left-0 z-50 mt-2 overflow-hidden rounded-xl border shadow-2xl duration-150">
              <div className="bg-background/60 border-border/40 border-b p-3">
                <div className="flex items-center justify-between">
                  <span className="text-foreground-secondary text-xs font-semibold tracking-wider uppercase">
                    Videos
                  </span>
                  {isLoading ? (
                    <LuLoaderCircle className="text-primary h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <span className="text-foreground-muted text-xs">
                      {searchResults.length} found
                    </span>
                  )}
                </div>
              </div>

              {isLoading ? (
                <div className="flex flex-col items-center justify-center gap-3 p-8">
                  <LuLoaderCircle className="text-primary h-6 w-6 animate-spin" />
                  <p className="text-foreground-secondary text-sm">Searching videos...</p>
                </div>
              ) : searchResults.length > 0 ? (
                <div className="max-h-80 overflow-y-auto">
                  {searchResults.map((video) => (
                    <button
                      key={video.id}
                      onClick={() => handleVideoSelect(video.id)}
                      className="hover:bg-primary/10 group border-border/20 flex w-full items-center gap-3 border-b px-4 py-3 text-left transition-all duration-150 last:border-0">
                      <div className="from-primary/30 to-accent/20 group-hover:from-primary/40 group-hover:to-accent/30 flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-linear-to-br transition-all">
                        <LuFilm className="text-primary h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-foreground group-hover:text-primary truncate text-sm font-medium transition-colors">
                          {video.title}
                        </p>
                        <p className="text-foreground-muted mt-0.5 truncate text-xs">
                          {video.studioName} • ID: {video.id}
                        </p>
                      </div>
                      <LuExternalLink className="text-foreground-muted group-hover:text-primary h-4 w-4 opacity-0 transition-all group-hover:opacity-100" />
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <div className="bg-foreground-muted/10 mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full">
                    <LuSearch className="text-foreground-muted h-5 w-5" />
                  </div>
                  <p className="text-foreground-secondary text-sm font-medium">No videos found</p>
                  <p className="text-foreground-muted mt-1 text-xs">Try a different search term</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Server Time */}
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="bg-background/50 border-border flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm">
              <LuClock className="text-primary h-4 w-4" />
              <span className="text-foreground font-mono">{serverTime}</span>
            </div>
          </TooltipTrigger>
          <TooltipContent className="bg-popover text-popover-foreground">
            All analytics, logs, schedules, and audit trails are computed in server time.
          </TooltipContent>
        </Tooltip>

        {/* Notifications */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-sidebar-accent! hover:text-sidebar-accent-foreground relative cursor-pointer">
              <LuBell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="bg-destructive text-destructive-foreground absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full text-xs font-medium">
                  {unreadCount}
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="border-border bg-popover w-80 p-0">
            <div className="border-border border-b p-3">
              <h3 className="text-foreground font-semibold">Notifications</h3>
            </div>
            <div className="max-h-80 overflow-y-auto">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={cn(
                    "border-border border-b p-3 transition-colors last:border-0",
                    !notification.read && "bg-primary/5",
                    notification.type !== "system"
                      ? "hover:bg-secondary/50 cursor-pointer"
                      : "cursor-default",
                  )}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-foreground text-sm font-medium">{notification.title}</p>
                        {notification.type !== "system" && (
                          <LuExternalLink className="text-muted-foreground h-3 w-3" />
                        )}
                      </div>
                      <p className="text-foreground-secondary mt-0.5 text-sm">
                        {notification.message}
                      </p>
                    </div>
                    {!notification.read && (
                      <div className="bg-primary mt-2 h-2 w-2 shrink-0 rounded-full" />
                    )}
                  </div>
                  <p className="text-foreground-muted mt-1 text-xs">{notification.time}</p>
                </div>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </header>
  );
}
