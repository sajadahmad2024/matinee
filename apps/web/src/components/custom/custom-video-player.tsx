"use client";

import { useEffect, useRef } from "react";

import Hls from "hls.js";

import { cn } from "@/app/_libs/utils/cn";

/** CloudFront signed-cookie names → the query parameters that carry the same grant. */
const CLOUDFRONT_QUERY_PARAMS: Record<string, string> = {
  "CloudFront-Policy": "Policy",
  "CloudFront-Signature": "Signature",
  "CloudFront-Key-Pair-Id": "Key-Pair-Id",
};

/**
 * A page can't set cookies for the CDN's domain, so the grant goes on every request's query
 * string instead. Other cookie names (e.g. the local dev stub's) aren't checked — skip them.
 */
const toSignedQuery = (cookies: Record<string, string> = {}) =>
  new URLSearchParams(
    Object.entries(cookies)
      .filter(([name]) => name in CLOUDFRONT_QUERY_PARAMS)
      .map(([name, value]) => [CLOUDFRONT_QUERY_PARAMS[name], value]),
  ).toString();

export interface CustomVideoPlayerProps {
  src: string;
  /** `hls` streams through hls.js; `file` is a plain `<video src>`. */
  kind: "hls" | "file";
  /** Signed CDN cookies for protected HLS. */
  cookies?: Record<string, string>;
  poster?: string;
  autoPlay?: boolean;
  className?: string;
}

/** Video player for a file or an HLS stream (hls.js; native HLS where hls.js isn't supported). */
export function CustomVideoPlayer({
  src,
  kind,
  cookies,
  poster,
  autoPlay = false,
  className,
}: CustomVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const signedQuery = toSignedQuery(cookies);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (kind === "file" || !Hls.isSupported()) {
      // Safari plays HLS natively; it can't sign segment requests, so it suits public streams.
      video.src = signedQuery && kind === "hls" ? `${src}?${signedQuery}` : src;
      return () => video.removeAttribute("src");
    }

    const hls = new Hls({
      xhrSetup: (xhr, url) => {
        if (!signedQuery) return;
        xhr.open("GET", `${url}${url.includes("?") ? "&" : "?"}${signedQuery}`, true);
      },
    });
    hls.loadSource(src);
    hls.attachMedia(video);
    return () => hls.destroy();
  }, [src, kind, signedQuery]);

  return (
    <video
      ref={videoRef}
      controls
      playsInline
      autoPlay={autoPlay}
      poster={poster}
      className={cn("aspect-video w-full rounded-lg bg-black", className)}
    />
  );
}
