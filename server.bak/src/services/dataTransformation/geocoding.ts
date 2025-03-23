import axios from 'axios';
import { logger } from '../../utils/logger';

/**
 * Interface for geocoding result coordinates
 */
export interface GeocodingResult {
  latitude: number;
  longitude: number;
  formattedAddress: string;
  confidence: number; // 0-1 value representing confidence level of the result
}

/**
 * Interface for Nominatim API response
 */
interface NominatimResult {
  lat: string;
  lon: string;
  display_name: string;
  importance: number;
}

/**
 * Cache for geocoding results to minimize API calls
 */
const geocodingCache = new Map<string, GeocodingResult>();

/**
 * Maximum cache size to prevent memory issues
 */
const MAX_CACHE_SIZE = 10000;

/**
 * Geocode an address to get latitude and longitude
 * Uses OpenStreetMap Nominatim by default but can be configured
 * for other providers like Google Maps or Mapbox
 * 
 * @param address The address to geocode
 * @returns Geocoding result with lat/long coordinates
 */
export async function geocodeAddress(address: string): Promise<GeocodingResult | null> {
  if (!address) {
    console.warn('Cannot geocode empty address');
    return null;
  }
  
  // Check cache first
  const cachedResult = getCachedCoordinates(address);
  if (cachedResult) {
    return cachedResult;
  }
  
  try {
    // For the PoC, use simulated geocoding
    // In production, this would call a real geocoding API
    const USE_SIMULATED_GEOCODING = true;
    
    let result: GeocodingResult;
    
    if (USE_SIMULATED_GEOCODING) {
      // Use simulated geocoding for demonstration
      console.info(`Simulating geocoding for address: ${address}`);
      result = simulateGeocoding(address);
    } else {
      // This section would normally call an actual geocoding service API
      // For example, using OpenStreetMap's Nominatim API:
      
      /* 
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`,
        {
          headers: {
            'User-Agent': 'RealEstateInvestmentPlatform/1.0'
          }
        }
      );
      
      const data = await response.json();
      
      if (!data || data.length === 0) {
        return null;
      }
      
      result = {
        latitude: parseFloat(data[0].lat),
        longitude: parseFloat(data[0].lon),
        formattedAddress: data[0].display_name,
        confidence: parseFloat(data[0].importance)
      };
      */
      
      // For now, just simulate
      console.info(`Using simulated geocoding as fallback for address: ${address}`);
      result = simulateGeocoding(address);
    }
    
    // Cache the result
    cacheCoordinates(address, result);
    
    return result;
  } catch (error) {
    console.error(`Geocoding failed for address "${address}": ${error instanceof Error ? error.message : String(error)}`);
    return null;
  }
}

/**
 * Add coordinates to the cache
 * @param address The address (cache key)
 * @param coordinates The coordinates to cache
 */
function cacheCoordinates(address: string, coordinates: GeocodingResult): void {
  // Manage cache size - if we exceed the max, remove the oldest entries (not perfect LRU but simple)
  if (geocodingCache.size >= MAX_CACHE_SIZE) {
    const keysToDelete = Array.from(geocodingCache.keys()).slice(0, Math.floor(MAX_CACHE_SIZE * 0.1));
    for (const key of keysToDelete) {
      geocodingCache.delete(key);
    }
  }
  
  geocodingCache.set(address, coordinates);
}

/**
 * Get geocoding result from cache if available
 * @param address The address to look up
 * @returns Cached result or undefined if not in cache
 */
function getCachedCoordinates(address: string): GeocodingResult | undefined {
  return geocodingCache.get(address);
}

/**
 * Clear the geocoding cache
 */
export function clearGeocodingCache(): void {
  geocodingCache.clear();
  logger.debug('Geocoding cache cleared');
}

/**
 * Get the size of the geocoding cache
 */
export function getGeocodingCacheSize(): number {
  return geocodingCache.size;
}

/**
 * Simulate geocoding an address to coordinates
 * In production, this would use a real geocoding service
 * 
 * @param address The address to geocode
 * @returns Coordinates with lat/long or null if geocoding failed
 */
export async function simulateGeocoding(address: string): Promise<GeocodingResult | null> {
  if (!address || address.trim() === '') {
    logger.warn('Empty address provided for simulated geocoding');
    return null;
  }
  
  const safeAddress = address.trim();
  
  // Check cache first
  const cacheKey = safeAddress.toLowerCase();
  if (geocodingCache.has(cacheKey)) {
    return geocodingCache.get(cacheKey)!;
  }
  
  try {
    // For demonstration, generate deterministic but fake coordinates based on the address
    // This ensures the same address always gets the same coordinates
    const hash = simpleHash(safeAddress);
    
    // Base coordinates for Maryland (approximate center)
    const baseLat = 39.0458;
    const baseLng = -76.6413;
    
    // Add a small offset based on the hash (± ~0.5 degrees)
    const latOffset = (hash % 1000) / 1000 - 0.5;
    const lngOffset = ((hash % 1000) / 1000 - 0.5) * 1.5; // Wider longitude range
    
    const geocodingResult: GeocodingResult = {
      latitude: baseLat + latOffset,
      longitude: baseLng + lngOffset,
      formattedAddress: safeAddress,
      confidence: 0.8
    };
    
    // Cache the result
    cacheCoordinates(cacheKey, geocodingResult);
    
    logger.info(`Geocoded address: "${safeAddress}" (simulated)`);
    
    return geocodingResult;
  } catch (error) {
    logger.error(`Simulated geocoding error for address "${safeAddress}": ${error instanceof Error ? error.message : 'Unknown error'}`);
    return null;
  }
}

/**
 * Generate a simple numeric hash from a string
 * Used for deterministic coordinate generation in the demo
 * @param str The string to hash
 * @returns A numeric hash
 */
function simpleHash(str: string): number {
  let hash = 0;
  
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0; // Convert to 32bit integer
  }
  
  return Math.abs(hash);
} 