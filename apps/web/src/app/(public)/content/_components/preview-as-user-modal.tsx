"use client";

import { Heart, MessageCircle, Play, Share2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

import type { VideoItem } from "../constants";

interface PreviewAsUserModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  video: VideoItem | null;
}

const fmt = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(1)}K` : `${n}`);

/** Preview how the content appears in the customer app (vertical mockup). */
export function PreviewAsUserModal({ open, onOpenChange, video }: PreviewAsUserModalProps) {
  if (!video) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Preview as user</DialogTitle>
        </DialogHeader>

        {/* phone frame */}
        <div className="mx-auto w-[280px]">
          <div className="border-border/60 relative aspect-[9/16] overflow-hidden rounded-[2rem] border-4 bg-black">
            {/* video surface */}
            <div className="from-primary/40 to-accent/20 absolute inset-0 bg-linear-to-br" />
            {video.thumbnail && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={video.thumbnail} alt={video.title} className="absolute inset-0 h-full w-full object-cover" />
            )}
            {video.sponsored && (
              <div className="absolute top-3 left-3">
                <Badge className="bg-white/90 text-black text-[10px]">Sponsored · {video.sponsor}</Badge>
              </div>
            )}
            {video.isLive && (
              <div className="bg-destructive absolute top-3 right-3 rounded-full px-2 py-0.5 text-[10px] font-bold text-white">
                LIVE
              </div>
            )}

            {/* play */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full border border-white/30 bg-white/20 backdrop-blur-sm">
                <Play className="ml-0.5 h-6 w-6 text-white" />
              </div>
            </div>

            {/* right rail */}
            <div className="absolute right-3 bottom-20 flex flex-col items-center gap-4 text-white">
              <Rail icon={<Heart className="h-5 w-5" />} value={fmt(video.likes)} />
              <Rail icon={<MessageCircle className="h-5 w-5" />} value="12" />
              <Rail icon={<Share2 className="h-5 w-5" />} value="" />
            </div>

            {/* bottom meta */}
            <div className="absolute right-3 bottom-4 left-3 text-white">
              <p className="truncate text-sm font-semibold">{video.title}</p>
              <p className="text-xs text-white/70">{video.studioName}</p>
              <div className="mt-1 flex flex-wrap gap-1">
                {video.genres?.slice(0, 2).map((g) => (
                  <span key={g} className="rounded bg-white/15 px-1.5 py-0.5 text-[10px]">
                    {g}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Rail({ icon, value }: { icon: React.ReactNode; value: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15">{icon}</div>
      {value && <span className="text-[10px]">{value}</span>}
    </div>
  );
}
