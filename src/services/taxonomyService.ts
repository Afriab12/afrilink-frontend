/**
 * AfriLink Pan-African Taxonomy Service
 * Provides access to African countries, geopolitical regions, and cultural/economic interests.
 * Integrates with apiClient with offline fallback to local taxonomy constants.
 */

import { apiClient, ApiError } from './apiClient.ts';
import { Country, AfricanRegion } from '@/types';
import {
  AFRICAN_COUNTRIES,
  AFRICAN_INTERESTS,
  AFRICAN_REGIONS,
  getCountryByCode,
  getCountriesByRegion,
} from '@/utils/countryData';

export interface InterestItem {
  id: string;
  label: string;
  icon: string;
  count?: string;
  category?: string;
}

export class TaxonomyService {
  /**
   * Fetches active African countries from backend with offline fallback.
   */
  public async getCountries(): Promise<Country[]> {
    try {
      const res = await apiClient.get<Country[]>('/countries');
      if (res.data && Array.isArray(res.data) && res.data.length > 0) {
        return res.data;
      }
    } catch {
      // Fallback to local country data if offline/mock
    }
    return AFRICAN_COUNTRIES;
  }

  /**
   * Fetches curated Pan-African interest taxonomies with offline fallback.
   */
  public async getInterests(): Promise<InterestItem[]> {
    try {
      const res = await apiClient.get<InterestItem[]>('/interests');
      if (res.data && Array.isArray(res.data) && res.data.length > 0) {
        return res.data;
      }
    } catch {
      // Fallback to local interest data
    }
    return AFRICAN_INTERESTS;
  }

  /**
   * Updates authenticated user's selected interests.
   * Endpoint: PUT /api/v1/users/me/interests
   */
  public async updateUserInterests(interests: string[]): Promise<string[]> {
    try {
      const res = await apiClient.put<{ interests: string[] }>('/users/me/interests', {
        interests,
      });
      if (res.data?.interests) {
        return res.data.interests;
      }
    } catch (err) {
      if (err instanceof ApiError && err.code !== 'NETWORK_ERROR') {
        throw err;
      }
    }
    return interests;
  }

  /**
   * Helper: Get countries filtered by geopolitical region.
   */
  public getCountriesByRegion(region: AfricanRegion): Country[] {
    return getCountriesByRegion(region);
  }

  /**
   * Helper: Lookup single country by ISO 2-letter country code.
   */
  public getCountryByCode(code: string): Country | undefined {
    return getCountryByCode(code);
  }
}

export const taxonomyService = new TaxonomyService();
export { AFRICAN_REGIONS, AFRICAN_COUNTRIES, AFRICAN_INTERESTS };
