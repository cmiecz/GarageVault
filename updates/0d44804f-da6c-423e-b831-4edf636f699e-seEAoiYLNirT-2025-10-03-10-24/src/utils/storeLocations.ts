import { StoreChain } from "../state/locationSettingsStore";

export interface StoreCoordinates {
  chain: StoreChain;
  city: string;
  state: string;
  latitude: number;
  longitude: number;
  address?: string;
}

/**
 * Pre-loaded store coordinates for major US locations
 * These coordinates are for store parking lots/entrances
 * Radius of 150 meters used for detection
 */
export const STORE_LOCATIONS: StoreCoordinates[] = [
  // ===== HOME DEPOT =====
  // Atlanta, GA
  { chain: "Home Depot", city: "Atlanta", state: "GA", latitude: 33.7490, longitude: -84.3880 },
  { chain: "Home Depot", city: "Atlanta", state: "GA", latitude: 33.8490, longitude: -84.3680 },
  
  // Los Angeles, CA
  { chain: "Home Depot", city: "Los Angeles", state: "CA", latitude: 34.0522, longitude: -118.2437 },
  { chain: "Home Depot", city: "Los Angeles", state: "CA", latitude: 34.0689, longitude: -118.3967 },
  
  // Chicago, IL
  { chain: "Home Depot", city: "Chicago", state: "IL", latitude: 41.8781, longitude: -87.6298 },
  { chain: "Home Depot", city: "Chicago", state: "IL", latitude: 41.9742, longitude: -87.7366 },
  
  // Houston, TX
  { chain: "Home Depot", city: "Houston", state: "TX", latitude: 29.7604, longitude: -95.3698 },
  { chain: "Home Depot", city: "Houston", state: "TX", latitude: 29.8168, longitude: -95.4166 },
  
  // Phoenix, AZ
  { chain: "Home Depot", city: "Phoenix", state: "AZ", latitude: 33.4484, longitude: -112.0740 },
  { chain: "Home Depot", city: "Phoenix", state: "AZ", latitude: 33.5722, longitude: -112.0891 },
  
  // Philadelphia, PA
  { chain: "Home Depot", city: "Philadelphia", state: "PA", latitude: 39.9526, longitude: -75.1652 },
  
  // San Antonio, TX
  { chain: "Home Depot", city: "San Antonio", state: "TX", latitude: 29.4241, longitude: -98.4936 },
  
  // San Diego, CA
  { chain: "Home Depot", city: "San Diego", state: "CA", latitude: 32.7157, longitude: -117.1611 },
  
  // Dallas, TX
  { chain: "Home Depot", city: "Dallas", state: "TX", latitude: 32.7767, longitude: -96.7970 },
  
  // San Jose, CA
  { chain: "Home Depot", city: "San Jose", state: "CA", latitude: 37.3382, longitude: -121.8863 },

  // ===== LOWES =====
  // Atlanta, GA
  { chain: "Lowes", city: "Atlanta", state: "GA", latitude: 33.7701, longitude: -84.3895 },
  
  // Los Angeles, CA
  { chain: "Lowes", city: "Los Angeles", state: "CA", latitude: 34.0407, longitude: -118.2468 },
  
  // Chicago, IL
  { chain: "Lowes", city: "Chicago", state: "IL", latitude: 41.8870, longitude: -87.6230 },
  
  // Houston, TX
  { chain: "Lowes", city: "Houston", state: "TX", latitude: 29.7632, longitude: -95.3632 },
  
  // Phoenix, AZ
  { chain: "Lowes", city: "Phoenix", state: "AZ", latitude: 33.4484, longitude: -112.0879 },
  
  // Philadelphia, PA
  { chain: "Lowes", city: "Philadelphia", state: "PA", latitude: 39.9496, longitude: -75.1503 },
  
  // San Antonio, TX
  { chain: "Lowes", city: "San Antonio", state: "TX", latitude: 29.4246, longitude: -98.4951 },
  
  // San Diego, CA
  { chain: "Lowes", city: "San Diego", state: "CA", latitude: 32.7153, longitude: -117.1573 },
  
  // Dallas, TX
  { chain: "Lowes", city: "Dallas", state: "TX", latitude: 32.7831, longitude: -96.7997 },

  // ===== ACE HARDWARE =====
  // Atlanta, GA
  { chain: "Ace Hardware", city: "Atlanta", state: "GA", latitude: 33.7756, longitude: -84.3963 },
  
  // Los Angeles, CA
  { chain: "Ace Hardware", city: "Los Angeles", state: "CA", latitude: 34.0522, longitude: -118.2437 },
  
  // Chicago, IL
  { chain: "Ace Hardware", city: "Chicago", state: "IL", latitude: 41.8781, longitude: -87.6298 },
  
  // Houston, TX
  { chain: "Ace Hardware", city: "Houston", state: "TX", latitude: 29.7604, longitude: -95.3698 },

  // ===== MENARDS =====
  // Chicago, IL
  { chain: "Menards", city: "Chicago", state: "IL", latitude: 41.8500, longitude: -87.6500 },
  
  // Milwaukee, WI
  { chain: "Menards", city: "Milwaukee", state: "WI", latitude: 43.0389, longitude: -87.9065 },
  
  // Indianapolis, IN
  { chain: "Menards", city: "Indianapolis", state: "IN", latitude: 39.7684, longitude: -86.1581 },
  
  // Columbus, OH
  { chain: "Menards", city: "Columbus", state: "OH", latitude: 39.9612, longitude: -82.9988 },

  // ===== HARBOR FREIGHT =====
  // Los Angeles, CA
  { chain: "Harbor Freight", city: "Los Angeles", state: "CA", latitude: 34.0489, longitude: -118.2517 },
  
  // Phoenix, AZ
  { chain: "Harbor Freight", city: "Phoenix", state: "AZ", latitude: 33.4519, longitude: -112.0739 },
  
  // Houston, TX
  { chain: "Harbor Freight", city: "Houston", state: "TX", latitude: 29.7589, longitude: -95.3677 },

  // ===== TRUE VALUE =====
  // Various locations
  { chain: "True Value", city: "Atlanta", state: "GA", latitude: 33.7490, longitude: -84.3880 },
  { chain: "True Value", city: "Chicago", state: "IL", latitude: 41.8781, longitude: -87.6298 },

  // ===== TRACTOR SUPPLY =====
  // Atlanta, GA
  { chain: "Tractor Supply", city: "Atlanta", state: "GA", latitude: 33.8860, longitude: -84.4680 },
  
  // Houston, TX
  { chain: "Tractor Supply", city: "Houston", state: "TX", latitude: 29.8588, longitude: -95.5698 },
  
  // Phoenix, AZ
  { chain: "Tractor Supply", city: "Phoenix", state: "AZ", latitude: 33.5469, longitude: -112.1839 },
];

/**
 * Detection radius in meters
 * User must be within this distance to trigger notification
 */
export const GEOFENCE_RADIUS = 150; // 150 meters (~500 feet)

/**
 * Get all store locations for a specific chain
 */
export function getStoresByChain(chain: StoreChain): StoreCoordinates[] {
  return STORE_LOCATIONS.filter((store) => store.chain === chain);
}

/**
 * Get all unique cities that have stores
 */
export function getAllCities(): string[] {
  const cities = new Set(STORE_LOCATIONS.map((store) => `${store.city}, ${store.state}`));
  return Array.from(cities).sort();
}

/**
 * Get total number of stores by chain
 */
export function getStoreCountByChain(): Record<StoreChain, number> {
  const counts: Record<string, number> = {};
  
  STORE_LOCATIONS.forEach((store) => {
    counts[store.chain] = (counts[store.chain] || 0) + 1;
  });
  
  return counts as Record<StoreChain, number>;
}
