import { MessageSquare, User, Video } from "lucide-react";

export interface ModerationTicket {
  id: string;
  type: "comment" | "video" | "user";
  severity: "high" | "medium" | "low";
  category: "hate_speech" | "spam" | "nudity" | "harassment" | "other";
  content: string;
  offenderName: string;
  offenderId: string;
  reportCount: number;
  timestamp: string;
  isRepeatOffender: boolean;
}

export const MOCK_TICKETS: ModerationTicket[] = [
  {
    id: "1",
    type: "comment",
    severity: "high",
    category: "hate_speech",
    content: "This is an example of flagged content that violates community guidelines...",
    offenderName: "ToxicUser42",
    offenderId: "u1",
    reportCount: 12,
    timestamp: "10 mins ago",
    isRepeatOffender: true,
  },
  {
    id: "2",
    type: "video",
    severity: "medium",
    category: "spam",
    content: "Promotional video with misleading title and clickbait thumbnail",
    offenderName: "SpammerBot",
    offenderId: "u2",
    reportCount: 8,
    timestamp: "25 mins ago",
    isRepeatOffender: false,
  },
  {
    id: "3",
    type: "user",
    severity: "high",
    category: "harassment",
    content: "User profile with offensive bio and targeted harassment history",
    offenderName: "HarasserAccount",
    offenderId: "u3",
    reportCount: 15,
    timestamp: "1 hour ago",
    isRepeatOffender: true,
  },
  {
    id: "4",
    type: "comment",
    severity: "low",
    category: "spam",
    content: "Check out my channel for free stuff! Link in bio...",
    offenderName: "PromoGuy",
    offenderId: "u4",
    reportCount: 3,
    timestamp: "2 hours ago",
    isRepeatOffender: false,
  },
  {
    id: "5",
    type: "video",
    severity: "high",
    category: "nudity",
    content: "Video thumbnail contains inappropriate imagery",
    offenderName: "NSFWUploader",
    offenderId: "u5",
    reportCount: 22,
    timestamp: "3 hours ago",
    isRepeatOffender: true,
  },
  {
    id: "6",
    type: "comment",
    severity: "medium",
    category: "harassment",
    content: "Targeted insults directed at another user in comments",
    offenderName: "AngryCommenter",
    offenderId: "u6",
    reportCount: 6,
    timestamp: "4 hours ago",
    isRepeatOffender: false,
  },
];

export const TYPE_ICONS = {
  comment: MessageSquare,
  video: Video,
  user: User,
};

export const SEVERITY_STYLES = {
  high: "bg-destructive/20 text-destructive border-destructive/30",
  medium: "bg-warning/20 text-warning border-warning/30",
  low: "bg-muted/20 text-muted-foreground border-muted/30",
};

export const CATEGORY_LABELS = {
  hate_speech: "Hate Speech",
  spam: "Spam",
  nudity: "Nudity",
  harassment: "Harassment",
  other: "Other",
};
