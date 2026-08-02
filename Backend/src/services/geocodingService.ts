import axios from "axios";
import { env, isGeocodingConfigured } from "../config/env";
import { logger } from "../utils/logger";

export interface GeocodeResult {
  lat: number;
  lng: number;
  formattedAddress: string;
}

interface GeocodeApiResponse {
  status: string;
  results: Array<{
    formatted_address: string;
    geometry: { location: { lat: number; lng: number } };
  }>;
}

/**
 * Resolves a free-text location (district/department/project name) to
 * coordinates via the Google Maps Geocoding API. Best-effort only: analysis
 * should never fail just because geocoding didn't find a match, so this
 * returns null instead of throwing on any non-fatal outcome (no key
 * configured, no match, API error).
 */
export async function geocodeLocation(query: string): Promise<GeocodeResult | null> {
  if (!isGeocodingConfigured() || !query.trim()) {
    return null;
  }

  try {
    const response = await axios.get<GeocodeApiResponse>(
      "https://maps.googleapis.com/maps/api/geocode/json",
      {
        params: { address: query, key: env.googleMapsApiKey },
        timeout: 10_000,
      }
    );

    if (response.data.status !== "OK" || response.data.results.length === 0) {
      logger.warn("Geocoding returned no match", { query, status: response.data.status });
      return null;
    }

    const [result] = response.data.results;
    return {
      lat: result.geometry.location.lat,
      lng: result.geometry.location.lng,
      formattedAddress: result.formatted_address,
    };
  } catch (error) {
    logger.warn("Geocoding request failed", {
      query,
      error: error instanceof Error ? error.message : String(error),
    });
    return null;
  }
}
