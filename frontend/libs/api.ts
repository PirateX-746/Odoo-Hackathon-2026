import { API_BASE_URL, HTTP_STATUS, RATE_LIMIT_MESSAGE } from "@/libs/constant";
import { getAccessToken, getRetryAfterSeconds } from "@/libs/helper";

// ─── Types ─────────────────────────────────────────────────────────────────
export interface ApiResponse<T = unknown> {
  data: T | null;
  error: string | null;
  status: number;
  rateLimitRetryAfter?: number; // seconds — populated on 429
}

export interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
  skipAuth?: boolean;
}

// ─── Builder ───────────────────────────────────────────────────────────────
function buildUrl(path: string, params?: RequestOptions["params"]): string {
  const url = new URL(path.startsWith("http") ? path : `${API_BASE_URL}${path}`);
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined) url.searchParams.set(k, String(v));
    });
  }
  return url.toString();
}

// ─── Core wrapper ────────────────────────────────────────────────────────
export async function apiFetch<T>(
  path: string,
  options: RequestOptions = {},
): Promise<ApiResponse<T>> {
  const { params, skipAuth = false, headers: extraHeaders, ...init } = options;

  const headers = new Headers({
    "Content-Type": "application/json",
    ...(extraHeaders as Record<string, string>),
  });

  if (!skipAuth) {
    const token = getAccessToken();
    if (token) headers.set("Authorization", `Bearer ${token}`);
  }

  try {
    const response = await fetch(buildUrl(path, params), {
      ...init,
      headers,
    });

    // ── Rate limit ────────────────────────────────────────────────────
    if (response.status === HTTP_STATUS.TOO_MANY) {
      const retryAfter = getRetryAfterSeconds(response.headers);
      return {
        data: null,
        error: RATE_LIMIT_MESSAGE,
        status: response.status,
        rateLimitRetryAfter: retryAfter,
      };
    }

    // ── No content ────────────────────────────────────────────────────
    if (response.status === HTTP_STATUS.NO_CONTENT) {
      return { data: null, error: null, status: 204 };
    }

    // ── Parse JSON ────────────────────────────────────────────────────
    const json = await response.json().catch(() => ({}));

    if (!response.ok) {
      // NestJS's ValidationPipe returns `message` as string[]; everything
      // else returns a single string. Normalize to one readable string.
      const rawMessage = json?.message ?? json?.detail ?? json?.error;
      const errorMsg = Array.isArray(rawMessage)
        ? rawMessage.join(" ")
        : (rawMessage ?? `HTTP ${response.status}`);

      // A 401 on an *authenticated* request means the access token is
      // invalid/expired — trigger the refresh/logout flow. A 401 from a
      // public endpoint (e.g. wrong password on /auth/login) is just a
      // normal failed request and must not force a logout.
      if (response.status === HTTP_STATUS.UNAUTHORIZED && !skipAuth) {
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("auth:unauthorized"));
        }
      }

      return { data: null, error: errorMsg, status: response.status };
    }

    return { data: json as T, error: null, status: response.status };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Network error.";
    return { data: null, error: message, status: 0 };
  }
}

// ─── Convenience methods ───────────────────────────────────────────────────
export const apiGet = <T,>(path: string, options?: RequestOptions) =>
  apiFetch<T>(path, { method: "GET", ...options });

export const apiPost = <T,>(path: string, body: unknown, options?: RequestOptions) =>
  apiFetch<T>(path, {
    method: "POST",
    body: JSON.stringify(body),
    ...options,
  });

export const apiPut = <T,>(path: string, body: unknown, options?: RequestOptions) =>
  apiFetch<T>(path, {
    method: "PUT",
    body: JSON.stringify(body),
    ...options,
  });

export const apiPatch = <T,>(path: string, body: unknown, options?: RequestOptions) =>
  apiFetch<T>(path, {
    method: "PATCH",
    body: JSON.stringify(body),
    ...options,
  });

export const apiDelete = <T,>(path: string, options?: RequestOptions) =>
  apiFetch<T>(path, { method: "DELETE", ...options });
