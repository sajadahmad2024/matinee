/*
 * UI demo build only: mock of the generated `MediaApi`. Files picked in this tab are "uploaded" by
 * the demo `use-media-upload` into `_demo/media-store`; these answer for them with local URLs.
 * No request is ever sent.
 */
import type { MediaDto, PlaybackDto } from "@/app/_libs/api/generated";

import { notFound, nowIso, ok } from "./_demo/core";
import { mediaUrl } from "./_demo/media-store";

const asMedia = (id: string, url: string): MediaDto =>
  ({
    id,
    mediaType: "video",
    usageType: "generic",
    accessLevel: "public",
    status: "ready",
    isHls: false,
    createdAt: nowIso(),
    url,
  }) as MediaDto;

export const mediaApi = {
  async mediaControllerGetByIdV1({ id }: { id: string }) {
    const url = mediaUrl(id);
    if (!url) throw notFound("Media");
    return ok(asMedia(id, url));
  },

  async mediaControllerGetPlaybackV1({ id }: { id: string }) {
    const url = mediaUrl(id);
    if (!url) throw notFound("Media");
    const playback: PlaybackDto = {
      kind: "file" as PlaybackDto["kind"],
      url,
      cookies: {},
      expiresInSeconds: 3600,
    };
    return ok(playback);
  },
};
