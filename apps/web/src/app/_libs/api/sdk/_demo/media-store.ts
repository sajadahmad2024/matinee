/*
 * UI demo build only: files "uploaded" in this browser tab. `use-media-upload` (demo version)
 * registers the picked file here; screens get its local object URL wherever the API would return a
 * CDN URL (badge icons, quest banners, videos).
 */
const urls = new Map<string, string>();
let next = 1;

export function registerFile(file: File): string {
  const id = `demo-media-${next++}`;
  urls.set(id, URL.createObjectURL(file));
  return id;
}

/** Seeded demo creatives (ads) play a public CC0 sample clip. */
export const DEMO_CREATIVE_PREFIX = "demo-creative-";
const DEMO_VIDEO_URL = "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4";

export const mediaUrl = (id?: string | null) => {
  if (!id) return null;
  if (id.startsWith(DEMO_CREATIVE_PREFIX)) return DEMO_VIDEO_URL;
  return urls.get(id) ?? null;
};
