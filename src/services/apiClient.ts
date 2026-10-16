/**
 * AfriLink Core API Client
 * Strict implementation of Phase 2 Backend API Specification:
 * - Base URL: NEXT_PUBLIC_API_BASE_URL or http://localhost:4000/api/v1
 * - Standardized response envelope: { data: T | null, meta: any | null, error: { code, message, details? } | null }
 * - In-memory access token storage
 * - Mutex queue for silent 401 TOKEN_EXPIRED refresh via POST /auth/refresh
 */

export interface ApiErrorPayload {
  code: string;
  message: string;
  details?: Array<{ field?: string; message: string; [key: string]: any }>;
}

export interface ApiResponse<T> {
  data: T | null;
  meta: Record<string, any> | null;
  error: ApiErrorPayload | null;
}

export class ApiError extends Error {
  public readonly code: string;
  public readonly details?: any[];
  public readonly status: number;

  constructor(code: string, message: string, status: number = 400, details?: any[]) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

class ApiClient {
  private baseURL: string;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private refreshTokenKey = 'afrilink_refresh_token';

  // Refresh token mutex queue
  private isRefreshing = false;
  private refreshPromise: Promise<string | null> | null = null;

  constructor() {
    this.baseURL =
      (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_API_BASE_URL) ||
      'http://localhost:4000/api/v1';
  }

  public setBaseURL(url: string): void {
    this.baseURL = url;
  }

  public getBaseURL(): string {
    return this.baseURL;
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
      if (token) {
        localStorage.setItem(this.refreshTokenKey, token);
      } else {
        localStorage.removeItem(this.refreshTokenKey);
      }
    }
  }

  public getRefreshToken(): string | null {
    if (this.refreshToken) {
      return this.refreshToken;
    }
    if (typeof window !== 'undefined') {
      return localStorage.getItem(this.refreshTokenKey);
    }
    return null;
  }

  public clearTokens(): void {
    this.accessToken = null;
    this.refreshToken = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.refreshTokenKey);
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

        const envelope: ApiResponse<{ accessToken: string; refreshToken?: string }> =
          await response.json();

        if (response.ok && envelope.data?.accessToken) {
          this.setAccessToken(envelope.data.accessToken);
          if (envelope.data.refreshToken) {
            this.setRefreshToken(envelope.data.refreshToken);
          }
          return envelope.data.accessToken;
        } else {
          this.clearTokens();
          return null;
        }
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
  public async request<T>(
    endpoint: string,
    options: RequestInit = {},
    retryOn401 = true
  ): Promise<ApiResponse<T>> {
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
      throw new ApiError(
        'NETWORK_ERROR',
        networkError?.message || 'Unable to communicate with AfriLink server.',
        0
      );
    }

    // Intercept 401 for silent token refresh
    if (response.status === 401 && retryOn401) {
      let isTokenExpired = false;
      let clonedEnvelope: ApiResponse<any> | null = null;

      try {
        const text = await response.clone().text();
        if (text) {
          clonedEnvelope = JSON.parse(text);
          if (
            clonedEnvelope?.error?.code === 'TOKEN_EXPIRED' ||
            clonedEnvelope?.error?.code === 'UNAUTHORIZED' ||
            clonedEnvelope?.error?.message?.toLowerCase().includes('expired')
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
          // Retry the original request with the fresh access token
          headers['Authorization'] = `Bearer ${newAccessToken}`;
          return this.request<T>(endpoint, { ...options, headers }, false);
        }
      }
    }

    // Parse Response Envelope
    let envelope: ApiResponse<T>;
    try {
      const text = await response.text();
      envelope = text
        ? JSON.parse(text)
        : { data: null, meta: null, error: null };
    } catch {
      throw new ApiError(
        'PARSE_ERROR',
        'Invalid response envelope received from server.',
        response.status
      );
    }

    // If HTTP error code or envelope has an error, throw structured ApiError
    if (!response.ok || envelope.error) {
      const errCode = envelope.error?.code || (response.status === 401 ? 'INVALID_CREDENTIALS' : 'API_ERROR');
      const errMessage = envelope.error?.message || response.statusText || 'Operation failed';
      throw new ApiError(errCode, errMessage, response.status, envelope.error?.details);
    }

    return envelope;
  }

  // --- Convenience Methods ---
  public get<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  public post<T>(endpoint: string, body?: any, options?: RequestInit): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  }

  public put<T>(endpoint: string, body?: any, options?: RequestInit): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  }

  public patch<T>(endpoint: string, body?: any, options?: RequestInit): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  }

  public delete<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }
}

export const apiClient = new ApiClient();
