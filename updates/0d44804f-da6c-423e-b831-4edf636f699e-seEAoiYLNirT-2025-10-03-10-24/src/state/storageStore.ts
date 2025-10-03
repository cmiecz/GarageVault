import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { StorageLocation, StorageType } from "../types/inventory";
import { supabase } from "../api/supabase";
import { RealtimeChannel } from "@supabase/supabase-js";

interface StorageState {
  locations: StorageLocation[];
  isSyncing: boolean;
  lastSyncTime: string | null;
  realtimeChannel: RealtimeChannel | null;

  // Core actions
  addLocation: (
    location: Omit<StorageLocation, "id" | "qrCode" | "dateAdded" | "lastUpdated">,
    householdId?: string
  ) => Promise<StorageLocation>;
  updateLocation: (id: string, updates: Partial<StorageLocation>) => Promise<void>;
  deleteLocation: (id: string) => Promise<void>;
  getLocationById: (id: string) => StorageLocation | undefined;
  getLocationByQRCode: (qrCode: string) => StorageLocation | undefined;
  getLocationsByType: (type: StorageType) => StorageLocation[];

  // Supabase sync actions
  syncToSupabase: (householdId: string) => Promise<void>;
  fetchFromSupabase: (householdId: string) => Promise<void>;
  subscribeToRealtime: (householdId: string) => void;
  unsubscribeFromRealtime: () => void;
  clearAllLocations: () => void;
}

// Helper: Convert StorageLocation to Supabase format
function toSupabaseFormat(location: StorageLocation, householdId: string) {
  return {
    id: location.id,
    household_id: householdId,
    name: location.name,
    type: location.type,
    description: location.description || null,
    qr_code: location.qrCode,
    color: location.color || null,
    date_added: location.dateAdded,
    last_updated: location.lastUpdated,
    synced_at: new Date().toISOString(),
  };
}

// Helper: Convert Supabase format to StorageLocation
function fromSupabaseFormat(dbLocation: any): StorageLocation {
  return {
    id: dbLocation.id,
    name: dbLocation.name,
    type: dbLocation.type,
    description: dbLocation.description,
    qrCode: dbLocation.qr_code,
    color: dbLocation.color,
    dateAdded: dbLocation.date_added,
    lastUpdated: dbLocation.last_updated,
    householdId: dbLocation.household_id,
    syncedAt: dbLocation.synced_at,
    deletedAt: dbLocation.deleted_at,
  };
}

// Generate UUID v4
function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export const useStorageStore = create<StorageState>()(
  persist(
    (set, get) => ({
      locations: [],
      isSyncing: false,
      lastSyncTime: null,
      realtimeChannel: null,

      addLocation: async (
        locationData: Omit<StorageLocation, "id" | "qrCode" | "dateAdded" | "lastUpdated">,
        householdId?: string
      ): Promise<StorageLocation> => {
        const now = new Date().toISOString();
        const id = generateUUID();
        const newLocation: StorageLocation = {
          ...locationData,
          id,
          qrCode: id, // QR code is the UUID
          dateAdded: now,
          lastUpdated: now,
          householdId,
        };

        set((state) => ({
          locations: [...state.locations, newLocation],
        }));

        // Sync to Supabase ONLY if user is in a household
        if (householdId) {
          try {
            const { error } = await supabase
              .from("storage_locations")
              .insert([toSupabaseFormat(newLocation, householdId)]);

            if (error) {
              console.error("Error syncing new location to Supabase:", error);
              // Keep local copy even if sync fails
            }
          } catch (error) {
            console.error("Error syncing new location to Supabase:", error);
            // Keep local copy even if sync fails
          }
        }

        return newLocation;
      },

      updateLocation: async (id: string, updates: Partial<StorageLocation>) => {
        const location = get().getLocationById(id);
        if (!location) return;

        const updatedLocation: StorageLocation = {
          ...location,
          ...updates,
          lastUpdated: new Date().toISOString(),
        };

        set((state) => ({
          locations: state.locations.map((loc) => (loc.id === id ? updatedLocation : loc)),
        }));

        // Sync to Supabase if in household
        if (location.householdId) {
          try {
            const { error } = await supabase
              .from("storage_locations")
              .update({
                name: updatedLocation.name,
                type: updatedLocation.type,
                description: updatedLocation.description || null,
                color: updatedLocation.color || null,
                last_updated: updatedLocation.lastUpdated,
                synced_at: new Date().toISOString(),
              })
              .eq("id", id);

            if (error) throw error;
          } catch (error) {
            console.error("Error syncing location update to Supabase:", error);
          }
        }
      },

      deleteLocation: async (id: string) => {
        const location = get().getLocationById(id);
        if (!location) return;

        // Soft delete: mark as deleted
        const deletedAt = new Date().toISOString();
        
        set((state) => ({
          locations: state.locations.map((loc) =>
            loc.id === id ? { ...loc, deletedAt } : loc
          ),
        }));

        // Sync to Supabase if in household
        if (location.householdId) {
          try {
            const { error } = await supabase
              .from("storage_locations")
              .update({ deleted_at: deletedAt })
              .eq("id", id);

            if (error) throw error;
          } catch (error) {
            console.error("Error syncing location deletion to Supabase:", error);
          }
        }

        // Remove from local state after a delay (to allow sync)
        setTimeout(() => {
          set((state) => ({
            locations: state.locations.filter((loc) => loc.id !== id),
          }));
        }, 1000);
      },

      getLocationById: (id: string) => {
        return get().locations.find((loc) => loc.id === id && !loc.deletedAt);
      },

      getLocationByQRCode: (qrCode: string) => {
        return get().locations.find((loc) => loc.qrCode === qrCode && !loc.deletedAt);
      },

      getLocationsByType: (type: StorageType) => {
        return get().locations.filter((loc) => loc.type === type && !loc.deletedAt);
      },

      syncToSupabase: async (householdId: string) => {
        set({ isSyncing: true });
        try {
          const localLocations = get().locations.filter((loc) => !loc.deletedAt);

          // Upsert all local locations
          for (const location of localLocations) {
            const { error } = await supabase
              .from("storage_locations")
              .upsert([toSupabaseFormat(location, householdId)], {
                onConflict: "id",
              });

            if (error) throw error;
          }

          set({ lastSyncTime: new Date().toISOString() });
        } catch (error) {
          console.error("Error syncing storage locations to Supabase:", error);
        } finally {
          set({ isSyncing: false });
        }
      },

      fetchFromSupabase: async (householdId: string) => {
        set({ isSyncing: true });
        try {
          const { data, error } = await supabase
            .from("storage_locations")
            .select("*")
            .eq("household_id", householdId)
            .is("deleted_at", null)
            .order("date_added", { ascending: false });

          if (error) throw error;

          if (data) {
            const fetchedLocations = data.map(fromSupabaseFormat);
            set({ 
              locations: fetchedLocations,
              lastSyncTime: new Date().toISOString() 
            });
          }
        } catch (error) {
          console.error("Error fetching storage locations from Supabase:", error);
        } finally {
          set({ isSyncing: false });
        }
      },

      subscribeToRealtime: (householdId: string) => {
        // Unsubscribe from any existing channel
        get().unsubscribeFromRealtime();

        const channel = supabase
          .channel(`storage_locations:${householdId}`)
          .on(
            "postgres_changes",
            {
              event: "*",
              schema: "public",
              table: "storage_locations",
              filter: `household_id=eq.${householdId}`,
            },
            (payload) => {
              console.log("Storage location change received:", payload);

              if (payload.eventType === "INSERT") {
                const newLocation = fromSupabaseFormat(payload.new);
                set((state) => {
                  // Avoid duplicates
                  const exists = state.locations.some((loc) => loc.id === newLocation.id);
                  if (exists) return state;
                  return { locations: [...state.locations, newLocation] };
                });
              } else if (payload.eventType === "UPDATE") {
                const updatedLocation = fromSupabaseFormat(payload.new);
                set((state) => ({
                  locations: state.locations.map((loc) =>
                    loc.id === updatedLocation.id ? updatedLocation : loc
                  ),
                }));
              } else if (payload.eventType === "DELETE") {
                set((state) => ({
                  locations: state.locations.filter((loc) => loc.id !== payload.old.id),
                }));
              }
            }
          )
          .subscribe();

        set({ realtimeChannel: channel });
      },

      unsubscribeFromRealtime: () => {
        const channel = get().realtimeChannel;
        if (channel) {
          supabase.removeChannel(channel);
          set({ realtimeChannel: null });
        }
      },

      clearAllLocations: () => {
        set({ 
          locations: [],
          lastSyncTime: null,
        });
      },
    }),
    {
      name: "storage-locations-storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        locations: state.locations,
        lastSyncTime: state.lastSyncTime,
      }),
    }
  )
);
