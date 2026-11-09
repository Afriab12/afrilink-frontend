/**
 * AfriLink Core API Client & Response Envelope Enforcement
 *
 * Fully integrated with NestJS Cookie Session & CSRF Architecture:
 * - Includes credentials: 'include' on all requests for HTTP-Only cookies (afrilink_at, afrilink_rt)
 * - Automatically injects X-CSRF-Token header from afrilink_csrf cookie on mutating methods
 * - Handles cookie-based /auth/refresh mutex
 * - Guarantees strict response envelope structure: { data, meta, error }
 */

export interface ApiErrorDetail {
  field?: string;
  message: string;
  [key: string]: any;
}

export interface ApiErrorPayload {
  code: string;
  message: string;
  details?: ApiErrorDetail[];
}

export interface ApiResponse<T = any> {
  data: T | null;
  meta: Record<string, any> | null;
  error: ApiErrorPayload | null;
}

export class ApiError extends Error {
  public readonly code: string;
  public readonly details?: ApiErrorDetail[];
  public readonly status: number;
  public readonly envelope?: ApiResponse<any>;

  constructor(
    code: string,
    message: string,
    status: number = 400,
    details?: ApiErrorDetail[],
    envelope?: ApiResponse<any>
  ) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
    this.details = details;
    this.envelope = envelope;
  }
}

export interface ApiRequestOptions extends RequestInit {
  throwOnError?: boolean;
  timeoutMs?: number;
}

/**
 * Utility to extract cookie value by name in browser environments.
 */
export function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
}

/**
 * Normalizes any backend response into strict AfriLink API Response Envelope.
 */
export function parseEnvelope<T = any>(
  raw: any,
  status: number = 200,
  statusText: string = 'OK'
): ApiResponse<T> {
  if (raw === null || raw === undefined || raw === '') {
    if (status >= 400) {
      return {
        data: null,
        meta: null,
        error: {
          code: status === 401 ? 'AUTHENTICATION_REQUIRED' : status === 404 ? 'NOT_FOUND' : 'API_ERROR',
          message: statusText || 'Request failed',
        },
      };
    }
    return { data: null, meta: null, error: null };
  }

  if (
    typeof raw === 'object' &&
    ('statusCode' in raw || (typeof raw.error === 'string' && !('data' in raw)))
  ) {
    const statusCode = raw.statusCode || status;
    const isError = statusCode >= 400 || status >= 400;

    if (isError) {
      let code = 'API_ERROR';
      if (raw.error && typeof raw.error === 'string') {
        code = raw.error.toUpperCase().replace(/\s+/g, '_');
      } else if (statusCode === 401) {
        code = 'AUTHENTICATION_REQUIRED';
      } else if (statusCode === 422 || statusCode === 400) {
        code = 'VALIDATION_FAILED';
      } else if (statusCode === 404) {
        code = 'NOT_FOUND';
      }

      let message = 'An error occurred';
      let details: ApiErrorDetail[] | undefined = undefined;

      if (Array.isArray(raw.message)) {
        message = raw.message
          .map((m: any) => (typeof m === 'object' ? m.message || JSON.stringify(m) : String(m)))
          .join('; ');
        details = raw.message.map((m: any) =>
          typeof m === 'object' ? m : { message: String(m) }
        );
      } else if (typeof raw.message === 'string') {
        message = raw.message;
      }

      return { data: null, meta: null, error: { code, message, details } };
    }
  }

  if (typeof raw === 'object' && ('data' in raw || 'error' in raw || 'meta' in raw)) {
    const data = raw.data !== undefined ? raw.data : null;
    const meta = raw.meta !== undefined ? raw.meta : null;
    let error: ApiErrorPayload | null = null;

    if (raw.error && typeof raw.error === 'object') {
      error = {
        code: raw.error.code || (status === 401 ? 'AUTHENTICATION_REQUIRED' : 'API_ERROR'),
        message: raw.error.message || statusText || 'Request failed',
        details: Array.isArray(raw.error.details) ? raw.error.details : undefined,
      };
    } else if (status >= 400) {
      error = {
        code: status === 401 ? 'AUTHENTICATION_REQUIRED' : 'API_ERROR',
        message: statusText || 'Request failed',
      };
    }

    return { data, meta, error };
  }

  if (status < 400) {
    return { data: raw as T, meta: null, error: null };
  }

  return {
    data: null,
    meta: null,
    error: { code: 'API_ERROR', message: statusText || 'Unknown error occurred' },
  };
}

export function createNetworkErrorEnvelope(errorMessage?: string): ApiResponse<null> {
  return {
    data: null,
    meta: null,
    error: {
      code: 'NETWORK_ERROR',
      message: errorMessage || 'Unable to connect to the AfriLink server.',
    },
  };
}

export class ApiClient {
  private baseURL: string;
  public defaultThrowOnError: boolean = false;

  // Refresh token mutex
  private isRefreshing = false;
  private refreshPromise: Promise<boolean> | null = null;

  constructor(baseURL?: string, defaultThrowOnError: boolean = false) {
    this.baseURL =
      baseURL ||
      (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_API_BASE_URL) ||
      'http://localhost:3001/api/v1';
    this.defaultThrowOnError = defaultThrowOnError;
  }

  public setBaseURL(url: string): void {
    this.baseURL = url;
  }

  public getBaseURL(): string {
    return this.baseURL;
  }

  public isConfigured(): boolean {
    return Boolean(typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_API_BASE_URL);
  }

  // --- Backward-Compatible Token Stubs (Cookie Architecture Migration) ---
  public setAccessToken(_token: string | null): void {
    // In cookie architecture, access tokens are managed exclusively via HttpOnly cookies
  }

  public getAccessToken(): string | null {
    return null;
  }

  public setRefreshToken(_token: string | null): void {
    // Refresh tokens are managed exclusively via HttpOnly cookies
  }

  public getRefreshToken(): string | null {
    return null;
  }

  public clearTokens(): void {
    // In cookie architecture, session clearance is performed via POST /auth/logout
  }

  // --- Cookie-Based Token Refresh Mutex ---
  public async refreshAccessToken(): Promise<boolean> {
    if (this.isRefreshing && this.refreshPromise) {
      return this.refreshPromise;
    }

    this.isRefreshing = true;
    this.refreshPromise = (async () => {
      try {
        const response = await fetch(`${this.baseURL}/auth/refresh`, {
          method: 'POST',
          credentials: 'include', // Sends afrilink_rt HTTP-Only cookie
          headers: {
            'Content-Type': 'application/json',
          },
        });

        return response.ok;
      } catch {
        return false;
      } finally {
        this.isRefreshing = false;
        this.refreshPromise = null;
      }
    })();

    return this.refreshPromise;
  }

  // --- Core Request Pipeline ---
  public async request<T = any>(
    endpoint: string,
    options: ApiRequestOptions = {},
    retryOn401 = true
  ): Promise<ApiResponse<T>> {
    const shouldThrow =
      options.throwOnError !== undefined ? options.throwOnError : this.defaultThrowOnError;

    const url = endpoint.startsWith('http')
      ? endpoint
      : `${this.baseURL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

    const method = (options.method || 'GET').toUpperCase();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    };

    // Auto-inject CSRF Token header for mutating requests
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
      const csrfToken = getCookie('afrilink_csrf');
      const hasExistingCsrf = Object.keys(headers).some(
        (key) => key.toLowerCase() === 'x-csrf-token'
      );
      if (csrfToken && !hasExistingCsrf) {
        headers['X-CSRF-Token'] = csrfToken;
      }
    }

    // Configure optional timeout signal
    let signal = options.signal;
    if (options.timeoutMs && typeof AbortSignal !== 'undefined' && 'timeout' in AbortSignal) {
      signal = AbortSignal.timeout(options.timeoutMs);
    }

    let response: Response;
    try {
      response = await fetch(url, {
        ...options,
        method,
        headers,
        signal,
        credentials: 'include', // Passes HTTP-Only cookies (afrilink_at, afrilink_rt)
      });
    } catch (networkError: any) {
      const networkEnvelope = createNetworkErrorEnvelope(networkError?.message);
      if (shouldThrow) {
        throw new ApiError(
          networkEnvelope.error!.code,
          networkEnvelope.error!.message,
          0,
          undefined,
          networkEnvelope
        );
      }
      return networkEnvelope as ApiResponse<T>;
    }

    // Intercept 401 for silent cookie-based token refresh
    const isAuthHandshake =
      endpoint.includes('/auth/login') ||
      endpoint.includes('/auth/refresh') ||
      endpoint.includes('/auth/register');

    if (response.status === 401 && retryOn401 && !isAuthHandshake) {
      const refreshed = await this.refreshAccessToken();
      if (refreshed) {
        return this.request<T>(endpoint, { ...options, headers }, false);
      }
    }

    // Parse Response Envelope
    let envelope: ApiResponse<T>;
    try {
      const text = await response.text();
      const json = text ? JSON.parse(text) : null;
      envelope = parseEnvelope<T>(json, response.status, response.statusText);
    } catch {
      envelope = {
        data: null,
        meta: null,
        error: { code: 'PARSE_ERROR', message: 'Invalid response envelope.' },
      };
    }

    if (!response.ok || envelope.error) {
      if (shouldThrow) {
        const errCode = envelope.error?.code || 'API_ERROR';
        const errMessage = envelope.error?.message || response.statusText || 'Operation failed';
        throw new ApiError(errCode, errMessage, response.status, envelope.error?.details, envelope);
      }
    }

    return envelope;
  }

  // --- Convenience Methods ---
  public get<T = any>(endpoint: string, options?: ApiRequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  public post<T = any>(endpoint: string, body?: any, options?: ApiRequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  }

  public put<T = any>(endpoint: string, body?: any, options?: ApiRequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  }

  public patch<T = any>(endpoint: string, body?: any, options?: ApiRequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  }

  public delete<T = any>(endpoint: string, options?: ApiRequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }

  public safeRequest<T = any>(endpoint: string, options: ApiRequestOptions = {}): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, throwOnError: false });
  }
}

export const apiClient = new ApiClient(undefined, false);
export default apiClient;
