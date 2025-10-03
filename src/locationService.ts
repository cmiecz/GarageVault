import * as Location from "expo-location";
import * as Notifications from "expo-notifications";
import { StoreChain } from "../state/locationSettingsStore";
import { GEOFENCE_RADIUS, getStoresByChain } from "./storeLocations";

// Store locations with coordinates (Home Depot, Lowe's, etc.)
export interface StoreLocation {
  name: string;
  chain: StoreChain;
  latitude: number;
  longitude: number;
  radius: number; // meters
}

/**
 * Check if current location is near a hardware store
 * PRIMARY: Uses geofencing with pre-loaded coordinates
 * FALLBACK: Uses reverse geocoding if no geofence match
 * @param selectedStores - Array of store chains to check for
 */
export async function isNearHardwareStore(selectedStores: StoreChain[]): Promise<{
  isNear: boolean;
  storeName?: string;
  distance?: number;
  method?: "geofence" | "geocoding";
}> {
  try {
    // If no stores selected, return false
    if (selectedStores.length === 0) {
      return { isNear: false };
    }

    // Get current location
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    const userLat = location.coords.latitude;
    const userLon = location.coords.longitude;

    // === PRIMARY METHOD: GEOFENCING ===
    // Check if within radius of any pre-loaded store locations
    const geofenceResult = checkGeofences(userLat, userLon, selectedStores);
    
    if (geofenceResult.isNear) {
      console.log(`🎯 Geofence match: ${geofenceResult.storeName} (${geofenceResult.distance}m away)`);
      return {
        ...geofenceResult,
        method: "geofence",
      };
    }

    // === FALLBACK METHOD: REVERSE GEOCODING ===
    // Use reverse geocoding for stores not in our database
    console.log("No geofence match, trying reverse geocoding...");
    const geocodingResult = await checkReverseGeocoding(userLat, userLon, selectedStores);
    
    if (geocodingResult.isNear) {
      console.log(`📍 Geocoding match: ${geocodingResult.storeName}`);
      return {
        ...geocodingResult,
        method: "geocoding",
      };
    }

    return { isNear: false };
  } catch (error) {
    console.error("Error checking location:", error);
    return { isNear: false };
  }
}

/**
 * PRIMARY: Check if user is within geofence radius of any store
 */
function checkGeofences(
  userLat: number,
  userLon: number,
  selectedStores: StoreChain[]
): {
  isNear: boolean;
  storeName?: string;
  distance?: number;
} {
  let closestStore: { chain: StoreChain; distance: number } | null = null;

  // Check each selected store chain
  for (const storeChain of selectedStores) {
    const storesOfChain = getStoresByChain(storeChain);
    
    // Check each location for this chain
    for (const store of storesOfChain) {
      const distance = calculateDistance(
        userLat,
        userLon,
        store.latitude,
        store.longitude
      );

      // Within geofence radius?
      if (distance <= GEOFENCE_RADIUS) {
        // Track closest store
        if (!closestStore || distance < closestStore.distance) {
          closestStore = { chain: storeChain, distance };
        }
      }
    }
  }

  if (closestStore) {
    return {
      isNear: true,
      storeName: closestStore.chain,
      distance: Math.round(closestStore.distance),
    };
  }

  return { isNear: false };
}

/**
 * FALLBACK: Use reverse geocoding for stores not in database
 */
async function checkReverseGeocoding(
  userLat: number,
  userLon: number,
  selectedStores: StoreChain[]
): Promise<{
  isNear: boolean;
  storeName?: string;
}> {
  try {
    // Reverse geocode to get nearby places
    const addresses = await Location.reverseGeocodeAsync({
      latitude: userLat,
      longitude: userLon,
    });

    // Check if any address contains selected hardware store names
    for (const address of addresses) {
      const fullAddress = `${address.name || ""} ${address.street || ""} ${address.district || ""}`;
      
      for (const storeChain of selectedStores) {
        // Handle "Lowes" vs "Lowe's" variations
        const variations = storeChain === "Lowes" ? ["Lowes", "Lowe's"] : [storeChain];
        
        for (const variation of variations) {
          if (fullAddress.toLowerCase().includes(variation.toLowerCase())) {
            return {
              isNear: true,
              storeName: storeChain,
            };
          }
        }
      }
    }

    return { isNear: false };
  } catch (error) {
    console.error("Error with reverse geocoding:", error);
    return { isNear: false };
  }
}

/**
 * Calculate distance between two coordinates (Haversine formula)
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
}

/**
 * Check if coordinates are within radius of a store location
 */
export function isWithinStoreRadius(
  userLat: number,
  userLon: number,
  store: StoreLocation
): boolean {
  const distance = calculateDistance(userLat, userLon, store.latitude, store.longitude);
  return distance <= store.radius;
}

/**
 * Request location permissions
 */
export async function requestLocationPermissions(): Promise<boolean> {
  try {
    const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
    
    if (foregroundStatus !== "granted") {
      return false;
    }

    // For background location (iOS requires additional permission)
    const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
    
    return backgroundStatus === "granted";
  } catch (error) {
    console.error("Error requesting location permissions:", error);
    return false;
  }
}

/**
 * Send notification when near store with low stock items
 */
export async function sendStoreProximityNotification(
  storeName: string,
  lowStockCount: number,
  lowStockItems: string[]
): Promise<void> {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: `You're at ${storeName}! 🏪`,
        body: `${lowStockCount} ${lowStockCount === 1 ? "item needs" : "items need"} restocking: ${lowStockItems.slice(0, 3).join(", ")}${lowStockCount > 3 ? "..." : ""}`,
        data: { type: "store_proximity", storeName, lowStockCount },
        sound: true,
      },
      trigger: null, // Send immediately
    });
  } catch (error) {
    console.error("Error sending notification:", error);
  }
}

/**
 * Setup notification handler
 */
export function setupNotificationHandler(): void {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}
