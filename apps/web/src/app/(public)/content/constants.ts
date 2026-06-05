import {
  Calendar,
  FileText,
  Film,
  Inbox,
  Rocket,
  XCircle,
} from "lucide-react";

export interface VideoItem {
  id: string;
  title: string;
  thumbnail: string;
  studioName: string;
  duration: string;
  status: "published" | "draft" | "scheduled" | "boosted" | "pending" | "rejected";
  linkedGames: number;
  views: number;
  likes: number;
  isLive?: boolean;
  isFeatured?: boolean;
  scheduledAt?: string;
}

export const MOCK_VIDEOS: VideoItem[] = [
  {
    id: "1",
    title: "K-Drama Romance: Episode 1",
    thumbnail: "",
    studioName: "Seoul Studios",
    duration: "42:15",
    status: "published",
    linkedGames: 3,
    views: 124500,
    likes: 8920,
    isLive: true,
  },
  {
    id: "2",
    title: "Action Thrill: The Chase",
    thumbnail: "",
    studioName: "Thunder Productions",
    duration: "1:35:20",
    status: "published",
    linkedGames: 2,
    views: 89200,
    likes: 6540,
    isFeatured: true,
  },
  {
    id: "3",
    title: "The Sword Master",
    thumbnail: "",
    studioName: "Wuxia Films",
    duration: "2:05:40",
    status: "published",
    linkedGames: 4,
    views: 156800,
    likes: 12400,
    isLive: true,
  },
  {
    id: "4",
    title: "Mystery Night: The Beginning",
    thumbnail: "",
    studioName: "Dark Moon Studios",
    duration: "48:30",
    status: "draft",
    linkedGames: 0,
    views: 0,
    likes: 0,
  },
  {
    id: "5",
    title: "Cooking Battle: Season 2 Finale",
    thumbnail: "",
    studioName: "Food Network Asia",
    duration: "55:00",
    status: "scheduled",
    linkedGames: 2,
    views: 0,
    likes: 0,
    scheduledAt: "2026-01-25 20:00 UTC",
  },
  {
    id: "6",
    title: "Travel Adventures: Japan",
    thumbnail: "",
    studioName: "Wanderlust Media",
    duration: "38:45",
    status: "boosted",
    linkedGames: 1,
    views: 245000,
    likes: 18900,
  },
];

export const PENDING_VIDEOS: VideoItem[] = [
  {
    id: "p1",
    title: "New Drama Upload",
    thumbnail: "",
    studioName: "Admin User",
    duration: "45:00",
    status: "pending",
    linkedGames: 0,
    views: 0,
    likes: 0,
  },
];

export const REJECTED_VIDEOS: VideoItem[] = [
  {
    id: "r1",
    title: "Rejected Content Sample",
    thumbnail: "",
    studioName: "Studio X",
    duration: "30:00",
    status: "rejected",
    linkedGames: 0,
    views: 0,
    likes: 0,
  },
];

export type TabValue = "requests" | "drafts" | "scheduled" | "boosted" | "all" | "rejected";

export const CONTENT_TABS_CONFIG: { value: TabValue; label: string; icon: any; count?: number }[] = [
  { value: "requests", label: "Requests", icon: Inbox, count: 1 },
  { value: "drafts", label: "Drafts", icon: FileText, count: 2 },
  { value: "scheduled", label: "Scheduled", icon: Calendar, count: 1 },
  { value: "boosted", label: "Priority", icon: Rocket, count: 1 },
  { value: "all", label: "Live Videos", icon: Film },
  { value: "rejected", label: "Rejected", icon: XCircle, count: 1 },
];

export const CONTENT_FUNNEL_DATA = [
  { stage: "Impressions", value: 100000 },
  { stage: "3s View", value: 72000 },
  { stage: "50% Watch", value: 45000 },
  { stage: "Game Start", value: 28000 },
  { stage: "Game Complete", value: 18000 },
  { stage: "Shared", value: 8500 },
];

export const SHARE_VELOCITY_DATA = [
  { time: "12am", shares: 120 },
  { time: "4am", shares: 85 },
  { time: "8am", shares: 210 },
  { time: "12pm", shares: 380 },
  { time: "4pm", shares: 520 },
  { time: "8pm", shares: 450 },
  { time: "Now", shares: 320 },
];


