/**
 * AfriLink Core API Client & Response Envelope Enforcement
 * 
 * Strict implementation of Phase 2/4 API Specification:
 * - Reads NEXT_PUBLIC_API_BASE_URL with fallback to 'http://localhost:4000/api/v1'
 * - Guarantees strict response envelope structure:
 *   {
 *     "data": T | null,
 *     "meta": Meta | null,
 *     "error": { "code": string, "message": string, "details"?: any[] } | null
 *   }
 * - Auto-injects Authorization Bearer header when JWT access token is present
 * - Silent 401 token refresh queue mutex via POST /auth/refresh
 * - Non-throwing network error fallback returning normalized NETWORK_ERROR envelope
 * - Graceful mock fallback guard for offline / unconfigured environments
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
 * Normalizes any backend response (enveloped, NestJS error, or raw) into
 * the strict AfriLink API Response Envelope.
 */
export function parseEnvelope<T = any>(
  raw: any,
  status: number = 200,
  statusText: string = 'OK'
): ApiResponse<T> {
  // 1. Handle empty or null bodies
  if (raw === null || raw === undefined || raw === '') {
    if (status >= 400) {
      return {
        data: null,
        meta: null,
        error: {
          code: status === 401 ? 'UNAUTHORIZED' : status === 404 ? 'NOT_FOUND' : 'API_ERROR',
          message: statusText || 'Request failed',
        },
      };
    }
    return { data: null, meta: null, error: null };
  }

  // 2. Handle standard NestJS Exception Filter payloads { statusCode, message, error }
  // e.g.: { statusCode: 400, message: ['...'], error: 'Bad Request' }
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
        code = 'UNAUTHORIZED';
      } else if (statusCode === 422 || statusCode === 400) {
        code = 'VALIDATION_ERROR';
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
      } else if (typeof raw.error === 'string') {
        message = raw.error;
      }

      return {
        data: null,
        meta: null,
        error: { code, message, details },
      };
    }
  }

  // 3. Handle standard AfriLink Envelope { data, meta, error }
  if (typeof raw === 'object' && ('data' in raw || 'error' in raw || 'meta' in raw)) {
    const data = raw.data !== undefined ? raw.data : null;
    const meta = raw.meta !== undefined ? raw.meta : null;
    let error: ApiErrorPayload | null = null;

    if (raw.error && typeof raw.error === 'object') {
      error = {
        code: raw.error.code || (status === 401 ? 'UNAUTHORIZED' : status === 422 ? 'VALIDATION_ERROR' : 'API_ERROR'),
        message: raw.error.message || statusText || 'Request failed',
        details: Array.isArray(raw.error.details) ? raw.error.details : undefined,
      };
    } else if (status >= 400) {
      error = {
        code: status === 401 ? 'UNAUTHORIZED' : status === 422 ? 'VALIDATION_ERROR' : 'API_ERROR',
        message: statusText || 'Request failed',
      };
    }

    return { data, meta, error };
  }

  // 4. Handle raw success object / array without envelope
  if (status < 400) {
    return {
      data: raw as T,
      meta: null,
      error: null,
    };
  }

  // 5. Fallback for unhandled error status
  return {
    data: null,
    meta: null,
    error: {
      code: 'API_ERROR',
      message: statusText || 'Unknown error occurred',
    },
  };
}

/**
 * Creates a normalized NETWORK_ERROR envelope for offline or timeout scenarios.
 */
export function createNetworkErrorEnvelope(errorMessage?: string): ApiResponse<null> {
  return {
    data: null,
    meta: null,
    error: {
      code: 'NETWORK_ERROR',
      message: errorMessage || 'Unable to connect to the AfriLink server. Please check your network connection.',
    },
  };
}

export class ApiClient {
  private baseURL: string;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private refreshTokenKey = 'afrilink_refresh_token';
  public defaultThrowOnError: boolean = false;

  // Refresh token mutex queue
  private isRefreshing = false;
  private refreshPromise: Promise<string | null> | null = null;

  constructor(baseURL?: string, defaultThrowOnError: boolean = false) {
    this.baseURL =
      baseURL ||
      (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_API_BASE_URL) ||
      'http://localhost:4000/api/v1';
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

  // --- Token Management ---
  public setAccessToken(token: string | null): void {
    this.accessToken = token;
  }

  public getAccessToken(): string | null {
    return this.accessToken;
  }

  public setRefreshToken(token: string | null): void {
    this.refreshToken = token;
    if (typeof window !== 'undefined') {
      try {
        if (token) {
          localStorage.setItem(this.refreshTokenKey, token);
        } else {
          localStorage.removeItem(this.refreshTokenKey);
        }
      } catch {
        // Safe ignore on restricted environments
      }
    }
  }

  public getRefreshToken(): string | null {
    if (this.refreshToken) {
      return this.refreshToken;
    }
    if (typeof window !== 'undefined') {
      try {
        return localStorage.getItem(this.refreshTokenKey);
      } catch {
        return null;
      }
    }
    return null;
  }

  public clearTokens(): void {
    this.accessToken = null;
    this.refreshToken = null;
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(this.refreshTokenKey);
      } catch {
        // Safe ignore
      }
    }
  }

  // --- Silent Token Refresh Mutex ---
  private async refreshAccessToken(): Promise<string | null> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      this.clearTokens();
      return null;
    }

    if (this.isRefreshing && this.refreshPromise) {
      return this.refreshPromise;
    }

    this.isRefreshing = true;
    this.refreshPromise = (async () => {
      try {
        const response = await fetch(`${this.baseURL}/auth/refresh`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ refreshToken }),
        });

        let envelope: ApiResponse<{ accessToken: string; refreshToken?: string }>;
        if (response.ok) {
          try {
            const text = await response.text();
            envelope = parseEnvelope(text ? JSON.parse(text) : null, response.status);
          } catch {
            envelope = { data: null, meta: null, error: null };
          }

          if (envelope.data?.accessToken) {
            this.setAccessToken(envelope.data.accessToken);
            if (envelope.data.refreshToken) {
              this.setRefreshToken(envelope.data.refreshToken);
            }
            return envelope.data.accessToken;
          }
        }

        this.clearTokens();
        return null;
      } catch {
        this.clearTokens();
        return null;
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

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    };

    if (this.accessToken && !headers['Authorization']) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    let response: Response;
    try {
      response = await fetch(url, {
        ...options,
        headers,
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

    // Intercept 401 for silent token refresh
    if (response.status === 401 && retryOn401) {
      let isTokenExpired = false;
      try {
        const text = await response.clone().text();
        if (text) {
          const parsed = JSON.parse(text);
          if (
            parsed?.error?.code === 'TOKEN_EXPIRED' ||
            parsed?.error?.code === 'UNAUTHORIZED' ||
            parsed?.error?.message?.toLowerCase().includes('expired') ||
            parsed?.message?.toLowerCase?.()?.includes('expired')
          ) {
            isTokenExpired = true;
          }
        }
      } catch {
        isTokenExpired = true;
      }

      if (isTokenExpired || response.status === 401) {
        const newAccessToken = await this.refreshAccessToken();
        if (newAccessToken) {
          headers['Authorization'] = `Bearer ${newAccessToken}`;
          return this.request<T>(endpoint, { ...options, headers }, false);
        }
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
        error: {
          code: 'PARSE_ERROR',
          message: 'Invalid response envelope received from server.',
        },
      };
    }

    // Handle error dispatch / throwing
    if (!response.ok || envelope.error) {
      if (shouldThrow) {
        const errCode =
          envelope.error?.code || (response.status === 401 ? 'INVALID_CREDENTIALS' : 'API_ERROR');
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

  public post<T = any>(
    endpoint: string,
    body?: any,
    options?: ApiRequestOptions
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  }

  public put<T = any>(
    endpoint: string,
    body?: any,
    options?: ApiRequestOptions
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  }

  public patch<T = any>(
    endpoint: string,
    body?: any,
    options?: ApiRequestOptions
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  }

  public delete<T = any>(endpoint: string, options?: ApiRequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }

  /**
   * Safe request method that guarantees no unhandled exception is thrown,
   * returning normalized { data, meta, error } envelope in all cases.
   */
  public safeRequest<T = any>(
    endpoint: string,
    options: ApiRequestOptions = {}
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, throwOnError: false });
  }
}

// Default export for src/lib/api-client: non-throwing envelope client
export const apiClient = new ApiClient(undefined, false);
export default apiClient;
