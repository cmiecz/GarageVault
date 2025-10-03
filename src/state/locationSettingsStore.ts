import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { startLocationMonitoring, stopLocationMonitoring } from "../utils/locationMonitoring";

export type StoreChain = "Home Depot" | "Lowes" | "Ace Hardware" | "Menards" | "Harbor Freight" | "True Value" | "Tractor Supply";

export const ALL_STORE_CHAINS: StoreChain[] = [
  "Home Depot",
  "Lowes",
  "Ace Hardware",
  "Menards",
  "Harbor Freight",
  "True Value",
  "Tractor Supply",
];

interface LocationSettingsState {
  locationRemindersEnabled: boolean;
  lastNotificationTime: number | null;
  selectedStores: StoreChain[]; // Which stores to monitor
  
  // Actions
  enableLocationReminders: () => Promise<void>;
  disableLocationReminders: () => Promise<void>;
  setLastNotificationTime: (time: number) => void;
  toggleStore: (store: StoreChain) => void;
  selectAllStores: () => void;
  deselectAllStores: () => void;
}

export const useLocationSettingsStore = create<LocationSettingsState>()(
  persist(
    (set, get) => ({
      locationRemindersEnabled: false,
      lastNotificationTime: null,
      selectedStores: ALL_STORE_CHAINS, // Default: all stores enabled

      enableLocationReminders: async () => {
        const started = await startLocationMonitoring();
        if (started) {
          set({ locationRemindersEnabled: true });
        }
      },

      disableLocationReminders: async () => {
        await stopLocationMonitoring();
        set({ locationRemindersEnabled: false });
      },

      setLastNotificationTime: (time: number) => {
        set({ lastNotificationTime: time });
      },

      toggleStore: (store: StoreChain) => {
        const current = get().selectedStores;
        const exists = current.includes(store);
        
        if (exists) {
          // Remove store
          set({ selectedStores: current.filter((s) => s !== store) });
        } else {
          // Add store
          set({ selectedStores: [...current, store] });
        }
      },

      selectAllStores: () => {
        set({ selectedStores: ALL_STORE_CHAINS });
      },

      deselectAllStores: () => {
        set({ selectedStores: [] });
      },
    }),
    {
      name: "location-settings-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
