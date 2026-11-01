/**
 * Error shape every failed backend call is normalised into.
 *
 * Mirrors the backend `HttpExceptionFilter` body:
 * `{ statusCode, status: "Failure", message, error, data, traceId }`.
 * `statusCode` is `0` when the request never reached the API (offline, DNS, aborted).
 */
export interface ApiErrorData {
  statusCode: number;
  status: string;
  message: string;
  /** HTTP status text, e.g. "Bad Request" — not a domain code, don't branch on it. */
  error: string | null;
  data: unknown;
  /** Correlates with backend logs; show it on 5xx so support can find the request. */
  traceId?: string;
  /** Domain code, when the backend sends one (e.g. `ACCOUNT_SUSPENDED`). */
  code?: string;
}

export const NETWORK_ERROR_MESSAGE =
  "Unable to reach the server. Check your connection and try again.";

const FALLBACK_ERROR_MESSAGE = "Something went wrong. Please try again.";

export class ApiError extends Error implements ApiErrorData {
  readonly statusCode: number;
  readonly status: string;
  readonly error: string | null;
  readonly data: unknown;
  readonly traceId?: string;
  readonly code?: string;

  constructor(body: Partial<ApiErrorData> & { statusCode: number }) {
    super(body.message || FALLBACK_ERROR_MESSAGE);
    this.name = "ApiError";
    this.statusCode = body.statusCode;
    this.status = body.status ?? "Failure";
    this.error = body.error ?? null;
    this.data = body.data ?? null;
    this.traceId = body.traceId;
    this.code = body.code;
  }

  get isNetworkError(): boolean {
    return this.statusCode === 0;
  }

  get isUnauthorized(): boolean {
    return this.statusCode === 401;
  }

  get isForbidden(): boolean {
    return this.statusCode === 403;
  }
}

export const isApiError = (value: unknown): value is ApiError => value instanceof ApiError;

declare module "@tanstack/react-query" {
  interface Register {
    // Every queryFn/mutationFn goes through `executeFetch`, which only ever throws ApiError.
    defaultError: ApiError;
  }
}
