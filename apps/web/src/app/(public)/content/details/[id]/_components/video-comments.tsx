"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import {
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  EyeOff,
  Flag,
  MessageSquare,
  MoreHorizontal,
  Reply,
  ThumbsDown,
  ThumbsUp,
  Trash2,
  User,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { cn } from "@/app/_libs/utils/cn";
import { ConfirmationDialog } from "@/components/custom/confirmation-dialog";

import { GlassCard } from "../../../../games/_components/glass-card";

interface CommentReply {
  id: string;
  user: string;
  userId: string;
  text: string;
  timestamp: string;
  likes: number;
  dislikes: number;
  flagged: boolean;
  flagReason?: string;
}

interface Comment {
  id: string;
  user: string;
  userId: string;
  text: string;
  timestamp: string;
  likes: number;
  dislikes: number;
  flagged: boolean;
  flagReason?: string;
  replies: CommentReply[];
}

// Extended mock data with replies
const mockCommentsData: Comment[] = [
  {
    id: "1",
    user: "User123",
    userId: "u123",
    text: "Great video! Really enjoyed the cinematography and storytelling. Can't wait for the next episode!",
    timestamp: "2h ago",
    likes: 24,
    dislikes: 1,
    flagged: false,
    replies: [
      {
        id: "1-1",
        user: "MovieFan99",
        userId: "mf99",
        text: "Totally agree! The lighting was amazing.",
        timestamp: "1h ago",
        likes: 8,
        dislikes: 0,
        flagged: false,
      },
      {
        id: "1-2",
        user: "CinemaLover",
        userId: "cl42",
        text: "The director really outdid themselves this time!",
        timestamp: "45m ago",
        likes: 5,
        dislikes: 0,
        flagged: false,
      },
    ],
  },
  {
    id: "2",
    user: "TrollAccount",
    userId: "troll1",
    text: "Inappropriate content here that violates community guidelines...",
    timestamp: "4h ago",
    likes: 0,
    dislikes: 15,
    flagged: true,
    flagReason: "Hate Speech",
    replies: [
      {
        id: "2-1",
        user: "AngryReply",
        userId: "ar77",
        text: "This is also inappropriate...",
        timestamp: "3h ago",
        likes: 0,
        dislikes: 8,
        flagged: true,
        flagReason: "Harassment",
      },
    ],
  },
  {
    id: "3",
    user: "FanGirl",
    userId: "fg22",
    text: "Love this series! 💖 The romance is so well done.",
    timestamp: "6h ago",
    likes: 42,
    dislikes: 2,
    flagged: false,
    replies: [],
  },
  {
    id: "4",
    user: "CriticalViewer",
    userId: "cv88",
    text: "The pacing felt a bit slow in the middle, but overall a solid episode.",
    timestamp: "8h ago",
    likes: 18,
    dislikes: 4,
    flagged: false,
    replies: [
      {
        id: "4-1",
        user: "SpamBot2000",
        userId: "spam1",
        text: "Check out this link for FREE stuff!!!",
        timestamp: "7h ago",
        likes: 0,
        dislikes: 12,
        flagged: true,
        flagReason: "Spam",
      },
      {
        id: "4-2",
        user: "MovieBuff",
        userId: "mb55",
        text: "I think the slow pacing was intentional for character development.",
        timestamp: "6h ago",
        likes: 9,
        dislikes: 1,
        flagged: false,
      },
    ],
  },
  {
    id: "5",
    user: "NewViewer",
    userId: "nv01",
    text: "First time watching this channel. Really impressed! Subscribed!",
    timestamp: "12h ago",
    likes: 31,
    dislikes: 0,
    flagged: false,
    replies: [
      {
        id: "5-1",
        user: "WelcomeBot",
        userId: "wb1",
        text: "Welcome to the community! 🎉",
        timestamp: "11h ago",
        likes: 12,
        dislikes: 0,
        flagged: false,
      },
    ],
  },
];

type ModerationAction = "hide" | "delete" | "warn" | "ban" | "custom";

interface VideoCommentsProps {
  videoId?: string;
}

export function VideoComments({ videoId: _videoId }: VideoCommentsProps) {
  const router = useRouter();
  const [commentsOpen, setCommentsOpen] = useState(true);
  const [comments, setComments] = useState<Comment[]>(mockCommentsData);
  const [expandedReplies, setExpandedReplies] = useState<Set<string>>(new Set(["1", "2", "4"]));

  // Confirmation dialog state
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    action: ModerationAction;
    targetType: "comment" | "reply";
    targetId: string;
    parentId?: string;
    userName: string;
  }>({
    open: false,
    action: "hide",
    targetType: "comment",
    targetId: "",
    userName: "",
  });

  const toggleReplies = (commentId: string) => {
    setExpandedReplies((prev) => {
      const next = new Set(prev);
      if (next.has(commentId)) {
        next.delete(commentId);
      } else {
        next.add(commentId);
      }
      return next;
    });
  };

  const handleModerationAction = (
    action: ModerationAction,
    targetType: "comment" | "reply",
    targetId: string,
    userName: string,
    parentId?: string,
  ) => {
    setConfirmDialog({
      open: true,
      action,
      targetType,
      targetId,
      parentId,
      userName,
    });
  };

  const confirmModeration = () => {
    const { action, targetType, targetId, parentId, userName } = confirmDialog;

    if (targetType === "comment") {
      if (action === "delete") {
        setComments((prev) => prev.filter((c) => c.id !== targetId));
        toast.success(`Comment by ${userName} deleted`);
      } else if (action === "hide") {
        toast.success(`Comment by ${userName} hidden from public view`);
      } else if (action === "warn") {
        toast.success(`Warning sent to ${userName}`);
      } else if (action === "ban") {
        setComments((prev) => prev.filter((c) => c.id !== targetId));
        toast.success(`${userName} has been banned and comment removed`);
      }
    } else {
      // Handle reply moderation
      if (action === "delete") {
        setComments((prev) =>
          prev.map((c) =>
            c.id === parentId ? { ...c, replies: c.replies.filter((r) => r.id !== targetId) } : c,
          ),
        );
        toast.success(`Reply by ${userName} deleted`);
      } else if (action === "hide") {
        toast.success(`Reply by ${userName} hidden from public view`);
      } else if (action === "warn") {
        toast.success(`Warning sent to ${userName}`);
      } else if (action === "ban") {
        setComments((prev) =>
          prev.map((c) =>
            c.id === parentId ? { ...c, replies: c.replies.filter((r) => r.id !== targetId) } : c,
          ),
        );
        toast.success(`${userName} has been banned and reply removed`);
      }
    }

    setConfirmDialog((prev) => ({ ...prev, open: false }));
  };

  const getActionConfig = (action: ModerationAction) => {
    switch (action) {
      case "hide":
        return {
          title: "Hide Content",
          description:
            "This will hide the content from public view but keep it in the moderation records.",
          confirmLabel: "Hide",
          variant: "default" as const,
        };
      case "delete":
        return {
          title: "Delete Content",
          description: "This will permanently delete the content. This action cannot be undone.",
          confirmLabel: "Delete",
          variant: "destructive" as const,
        };
      case "warn":
        return {
          title: "Warn User",
          description:
            "This will send a warning notification to the user about their content violating community guidelines.",
          confirmLabel: "Send Warning",
          variant: "default" as const,
        };
      case "ban":
        return {
          title: "Ban User",
          description:
            "This will permanently ban the user and remove all their content. This action cannot be undone.",
          confirmLabel: "Ban User",
          variant: "destructive" as const,
        };
      default:
        return {
          title: "Confirm Action",
          description: "Are you sure you want to perform this action?",
          confirmLabel: "Confirm",
          variant: "default" as const,
        };
    }
  };

  const totalComments = comments.reduce((acc, c) => acc + 1 + c.replies.length, 0);
  const flaggedCount = comments.reduce(
    (acc, c) => acc + (c.flagged ? 1 : 0) + c.replies.filter((r) => r.flagged).length,
    0,
  );

  const renderCommentItem = (
    item: Comment | CommentReply,
    isReply: boolean = false,
    parentId?: string,
  ) => {
    return (
      <div
        key={item.id}
        className={cn(
          "rounded-lg p-3",
          isReply ? "border-muted ml-6 border-l-2" : "",
          item.flagged ? "border-destructive/30 bg-destructive/10 border" : "bg-muted/30",
        )}>
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <div className="bg-primary/20 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full">
              <User className="text-primary h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-foreground text-sm font-medium">{item.user}</span>
                <span className="text-muted-foreground text-xs">{item.timestamp}</span>
                {item.flagged && (
                  <Badge variant="destructive" className="h-5 text-xs">
                    <Flag className="mr-1 h-3 w-3" />
                    {item.flagReason || "Flagged"}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Actions Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem
                onClick={() =>
                  handleModerationAction(
                    "hide",
                    isReply ? "reply" : "comment",
                    item.id,
                    item.user,
                    parentId,
                  )
                }>
                <EyeOff className="mr-2 h-4 w-4" />
                Hide {isReply ? "Reply" : "Comment"}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  handleModerationAction(
                    "delete",
                    isReply ? "reply" : "comment",
                    item.id,
                    item.user,
                    parentId,
                  )
                }
                className="text-destructive focus:text-destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete {isReply ? "Reply" : "Comment"}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() =>
                  handleModerationAction(
                    "warn",
                    isReply ? "reply" : "comment",
                    item.id,
                    item.user,
                    parentId,
                  )
                }>
                <AlertTriangle className="mr-2 h-4 w-4" />
                Warn User
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  handleModerationAction(
                    "ban",
                    isReply ? "reply" : "comment",
                    item.id,
                    item.user,
                    parentId,
                  )
                }
                className="text-destructive focus:text-destructive">
                <Flag className="mr-2 h-4 w-4" />
                Ban User
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Content */}
        <p className="text-foreground mt-2 ml-9 text-sm">{item.text}</p>

        {/* Stats & Quick Actions */}
        <div className="mt-2 ml-9 flex items-center gap-4">
          <div className="text-muted-foreground flex items-center gap-1 text-xs">
            <ThumbsUp className="h-3 w-3" />
            <span>{item.likes}</span>
          </div>
          <div className="text-muted-foreground flex items-center gap-1 text-xs">
            <ThumbsDown className="h-3 w-3" />
            <span>{item.dislikes}</span>
          </div>

          {/* Quick action buttons for flagged content */}
          {item.flagged && (
            <div className="ml-auto flex items-center gap-1">
              <Button
                size="sm"
                variant="ghost"
                className="h-6 px-2 text-xs"
                onClick={() =>
                  handleModerationAction(
                    "hide",
                    isReply ? "reply" : "comment",
                    item.id,
                    item.user,
                    parentId,
                  )
                }>
                Hide
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="hover:text-destructive text-destructive h-6 px-2 text-xs"
                onClick={() =>
                  handleModerationAction(
                    "delete",
                    isReply ? "reply" : "comment",
                    item.id,
                    item.user,
                    parentId,
                  )
                }>
                Delete
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-6 px-2 text-xs"
                onClick={() =>
                  handleModerationAction(
                    "warn",
                    isReply ? "reply" : "comment",
                    item.id,
                    item.user,
                    parentId,
                  )
                }>
                Warn User
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  };

  const actionConfig = getActionConfig(confirmDialog.action);

  return (
    <>
      <Collapsible open={commentsOpen} onOpenChange={setCommentsOpen}>
        <GlassCard>
          <CollapsibleTrigger className="w-full">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-foreground flex items-center gap-2 text-base">
                <MessageSquare className="text-primary h-4 w-4" />
                Comments ({totalComments})
                {flaggedCount > 0 && (
                  <Badge variant="destructive" className="ml-2">
                    {flaggedCount} flagged
                  </Badge>
                )}
              </CardTitle>
              {commentsOpen ? (
                <ChevronUp className="text-muted-foreground h-4 w-4" />
              ) : (
                <ChevronDown className="text-muted-foreground h-4 w-4" />
              )}
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="max-h-[500px] space-y-4 overflow-y-auto pt-0">
              {comments.map((comment) => (
                <div key={comment.id} className="space-y-2">
                  {renderCommentItem(comment)}

                  {/* Replies */}
                  {comment.replies.length > 0 && (
                    <div className="ml-6">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-primary hover:text-primary h-6 text-xs"
                        onClick={() => toggleReplies(comment.id)}>
                        <Reply className="mr-1 h-3 w-3" />
                        {expandedReplies.has(comment.id) ? "Hide" : "View"} {comment.replies.length}{" "}
                        {comment.replies.length === 1 ? "reply" : "replies"}
                      </Button>

                      {expandedReplies.has(comment.id) && (
                        <div className="mt-2 space-y-2">
                          {comment.replies.map((reply) =>
                            renderCommentItem(reply, true, comment.id),
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}

              {comments.length === 0 && (
                <div className="text-muted-foreground py-6 text-center">
                  <MessageSquare className="mx-auto mb-2 h-8 w-8 opacity-50" />
                  <p>No comments yet</p>
                </div>
              )}

              <Button
                variant="link"
                className="text-primary w-full text-sm"
                onClick={() => router.push("/moderation")}>
                View All in Moderation Queue
              </Button>
            </CardContent>
          </CollapsibleContent>
        </GlassCard>
      </Collapsible>

      <ConfirmationDialog
        open={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog((prev) => ({ ...prev, open }))}
        title={actionConfig.title}
        description={`${actionConfig.description} Target: ${confirmDialog.userName}`}
        action={confirmDialog.action}
        confirmLabel={actionConfig.confirmLabel}
        destructive={actionConfig.variant === "destructive"}
        onConfirm={confirmModeration}
      />
    </>
  );
}
