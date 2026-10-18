/**
 * AfriLink Core API Client
 * Backward-compatible service proxy leveraging src/lib/api-client.ts
 * Configured with throwOnError: true for existing service callers and tests.
 */

import {
  ApiClient,
  ApiError,
  parseEnvelope,
  createNetworkErrorEnvelope,
} from '../lib/api-client.ts';

import type {
  ApiErrorDetail,
  ApiErrorPayload,
  ApiResponse,
  ApiRequestOptions,
} from '../lib/api-client.ts';

export {
  ApiClient,
  ApiError,
  parseEnvelope,
  createNetworkErrorEnvelope,
};

export type {
  ApiErrorDetail,
  ApiErrorPayload,
  ApiResponse,
  ApiRequestOptions,
};

// Singleton configured with defaultThrowOnError: true for backward-compatible service calls
export const apiClient = new ApiClient(undefined, true);
export default apiClient;
