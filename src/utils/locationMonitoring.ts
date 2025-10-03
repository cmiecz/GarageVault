import * as Location from "expo-location";
import { useInventoryStore } from "../state/inventoryStore";
import { useLocationSettingsStore } from "../state/locationSettingsStore";
import { isNearHardwareStore, sendStoreProximityNotification } from "./locationService";

const LOCATION_CHECK_INTERVAL = 5 * 60 * 1000; // Check every 5 minutes
const NOTIFICATION_COOLDOWN = 2 * 60 * 60 * 1000; // Don't spam - 2 hours between notifications

let lastNotificationTime: number | null = null;
let locationWatchId: Location.LocationSubscription | null = null;

/**
 * Start monitoring location for hardware stores
 */
export async function startLocationMonitoring(): Promise<boolean> {
  try {
    // Check if we have permission
    const { status } = await Location.getForegroundPermissionsAsync();
    if (status !== "granted") {
      console.log("Location permission not granted");
      return false;
    }

    // Stop existing watch if any
    if (locationWatchId) {
      locationWatchId.remove();
    }

    // Start watching location with significant changes only (battery efficient)
    locationWatchId = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.Balanced,
        distanceInterval: 100, // Update every 100 meters
        timeInterval: LOCATION_CHECK_INTERVAL,
      },
      async (_location) => {
        await checkLocationAndNotify();
      }
    );

    console.log("Location monitoring started");
    return true;
  } catch (error) {
    console.error("Error starting location monitoring:", error);
    return false;
  }
}

/**
 * Stop monitoring location
 */
export async function stopLocationMonitoring(): Promise<void> {
  if (locationWatchId) {
    locationWatchId.remove();
    locationWatchId = null;
    console.log("Location monitoring stopped");
  }
}

/**
 * Check current location and send notification if near store
 */
async function checkLocationAndNotify(): Promise<void> {
  try {
    // Check cooldown - don't spam notifications
    if (lastNotificationTime && Date.now() - lastNotificationTime < NOTIFICATION_COOLDOWN) {
      console.log("Notification cooldown active");
      return;
    }

    // Get selected stores from settings
    const selectedStores = useLocationSettingsStore.getState().selectedStores;
    
    if (selectedStores.length === 0) {
      console.log("No stores selected for monitoring");
      return;
    }

    // Check if near hardware store (only selected ones)
    const { isNear, storeName } = await isNearHardwareStore(selectedStores);

    if (!isNear || !storeName) {
      return;
    }

    console.log(`Near ${storeName}! Checking inventory...`);

    // Get low stock items
    const items = useInventoryStore.getState().items;
    const lowStockItems = items.filter((item) => item.quantity <= item.threshold);

    if (lowStockItems.length === 0) {
      console.log("No low stock items");
      return;
    }

    // Get item names for notification
    const itemNames = lowStockItems.map((item) => item.name);

    // Send notification
    await sendStoreProximityNotification(storeName, lowStockItems.length, itemNames);

    // Update last notification time
    lastNotificationTime = Date.now();

    console.log(`Sent notification for ${lowStockItems.length} low stock items`);
  } catch (error) {
    console.error("Error checking location:", error);
  }
}

/**
 * Manual check (for testing or one-time checks)
 */
export async function manualLocationCheck(): Promise<void> {
  await checkLocationAndNotify();
}
