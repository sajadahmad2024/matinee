/*
 * UI demo build only: the in-memory "backend" behind the `_libs/api/sdk/*` objects. The real app's
 * SDK objects send HTTP requests; on this branch they answer from here, with the same method names
 * and `{ data }` envelopes, so the hooks and screens stay identical to the real app.
 */
import { ApiError } from "@/app/_libs/api/api-error";
import type { PaginationDetailsDto } from "@/app/_libs/api/generated";

const LATENCY_MS = 300;

/** A short pause, so loaders and skeletons show as they would against the API. */
export const delay = () => new Promise((resolve) => setTimeout(resolve, LATENCY_MS));

/** Callers get copies, so the query cache never shares objects with the store. */
export const copy = <T>(value: T): T => structuredClone(value);

/** The API's success envelope (`ApiResponse`): hooks read `.data`, some toasts read `.message`. */
export async function ok<T>(data: T, message = "Success") {
  await delay();
  return { statusCode: 200, status: "Success", message, error: null, data: copy(data) };
}

export function paginate<T>(rows: T[], page = 1, limit = 20) {
  const start = (page - 1) * limit;
  const pagination: PaginationDetailsDto = {
    pageNo: page,
    pageSize: limit,
    totalCount: rows.length,
    totalPages: Math.max(1, Math.ceil(rows.length / limit)),
  };
  return { items: rows.slice(start, start + limit), pagination };
}

export const notFound = (what: string) =>
  new ApiError({ statusCode: 404, message: `${what} not found`, error: "Not Found" });
export const conflict = (message: string) =>
  new ApiError({ statusCode: 409, message, error: "Conflict" });
export const badRequest = (message: string) =>
  new ApiError({ statusCode: 400, message, error: "Bad Request" });

let nextId = 1000;
export const newId = (prefix: string) => `${prefix}-${++nextId}`;

export const nowIso = () => new Date().toISOString();
const DAY_MS = 86_400_000;
/** An ISO time `days` from now (negative = past), on the hour. */
export const daysFromNow = (days: number) => {
  const d = new Date(Date.now() + days * DAY_MS);
  d.setMinutes(0, 0, 0);
  return d.toISOString();
};
export const hoursAgo = (hours: number) => new Date(Date.now() - hours * 3_600_000).toISOString();

export const slugify = (name: string) =>
  name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

/** Display names for generated players (results tables, leaderboards). */
export const PLAYER_NAMES = [
  "cinephile_88",
  "filmfan_22",
  "moviebuff",
  "reeldeal",
  "popcornpete",
  "scenequeen",
  "directorscut",
  "framebyframe",
  "bingeking",
  "trailertrish",
  "criticchris",
  "flickfan",
  "plotwist",
  "screenaddict",
  "showstopper",
];
