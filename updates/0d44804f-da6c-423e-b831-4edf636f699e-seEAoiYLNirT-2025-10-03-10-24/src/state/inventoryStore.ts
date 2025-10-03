import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { InventoryItem } from "../types/inventory";
import * as Notifications from "expo-notifications";
import { supabase } from "../api/supabase";
import { RealtimeChannel } from "@supabase/supabase-js";

interface InventoryState {
  items: InventoryItem[];
  isSyncing: boolean;
  lastSyncTime: string | null;
  realtimeChannel: RealtimeChannel | null;

  // Original actions
  addItem: (
    item: Omit<InventoryItem, "id" | "dateAdded" | "lastUpdated">,
    householdId?: string
  ) => Promise<void>;
  updateItem: (id: string, updates: Partial<InventoryItem>) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  updateQuantity: (id: string, quantity: number) => Promise<void>;
  getItemById: (id: string) => InventoryItem | undefined;
  getLowStockItems: () => InventoryItem[];
  checkAndNotifyLowStock: (itemId: string) => Promise<void>;

  // New Supabase sync actions
  syncToSupabase: (householdId: string) => Promise<void>;
  fetchFromSupabase: (householdId: string) => Promise<void>;
  subscribeToRealtime: (householdId: string) => void;
  unsubscribeFromRealtime: () => void;
  migrateLocalToSupabase: (householdId: string) => Promise<void>;
  clearAllItems: () => void;
}

// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// Helper: Convert InventoryItem to Supabase format
function toSupabaseFormat(item: InventoryItem, householdId: string, includeDetails = true) {
  const baseFormat = {
    id: item.id,
    household_id: householdId,
    name: item.name,
    category: item.category,
    quantity: item.quantity,
    max_quantity: item.maxQuantity,
    threshold: item.threshold,
    unit: item.unit,
    image_uri: item.imageUri || null,
    images: item.images || null,
    purchase_links: item.purchaseLinks || null,
    notes: item.description || null,
    created_at: item.dateAdded,
    updated_at: item.lastUpdated,
    synced_at: new Date().toISOString(),
  };
  
  // Only include details if requested and has data (for backward compatibility)
  if (includeDetails && item.details && Object.keys(item.details).length > 0) {
    return { ...baseFormat, details: item.details };
  }
  
  return baseFormat;
}

// Helper: Convert Supabase format to InventoryItem
function fromSupabaseFormat(dbItem: any): InventoryItem {
  return {
    id: dbItem.id,
    name: dbItem.name,
    category: dbItem.category,
    quantity: dbItem.quantity,
    maxQuantity: dbItem.max_quantity,
    threshold: dbItem.threshold,
    unit: dbItem.unit,
    imageUri: dbItem.image_uri,
    images: dbItem.images,
    purchaseLinks: dbItem.purchase_links,
    description: dbItem.notes,
    dateAdded: dbItem.created_at,
    lastUpdated: dbItem.updated_at,
    householdId: dbItem.household_id,
    syncedAt: dbItem.synced_at,
    deletedAt: dbItem.deleted_at,
    details: dbItem.details || {},
  };
}

export const useInventoryStore = create<InventoryState>()(
  persist(
    (set, get) => ({
      items: [],
      isSyncing: false,
      lastSyncTime: null,
      realtimeChannel: null,

      addItem: async (item, householdId) => {
        const newItem: InventoryItem = {
          ...item,
          id: Date.now().toString() + Math.random().toString(36).substring(2, 11),
          dateAdded: new Date().toISOString(),
          lastUpdated: new Date().toISOString(),
          householdId,
          syncedAt: undefined,
        };

        // Add to local state immediately (offline-first)
        set((state) => ({ items: [...state.items, newItem] }));

        // Sync to Supabase ONLY if householdId is provided and valid
        if (householdId) {
          try {
            console.log(`Syncing item ${newItem.name} to household ${householdId}`);
            
            const { error } = await supabase
              .from("inventory_items")
              .insert(toSupabaseFormat(newItem, householdId, true)); // Re-enabled details sync

            if (error) throw error;

            // Update synced timestamp
            set((state) => ({
              items: state.items.map((i) =>
                i.id === newItem.id
                  ? { ...i, syncedAt: new Date().toISOString() }
                  : i
              ),
            }));
            
            console.log(`✅ Item ${newItem.name} synced successfully`);
          } catch (error: any) {
            console.error("❌ Error syncing new item to Supabase:", error.message || error);
            // Item still exists locally, will retry sync later
          }
        } else {
          console.log("No household ID, item saved locally only");
        }
      },

      updateItem: async (id, updates) => {
        const item = get().getItemById(id);
        if (!item) return;

        const updatedItem = {
          ...updates,
          lastUpdated: new Date().toISOString(),
        };

        // Update local state immediately
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id ? { ...item, ...updatedItem } : item
          ),
        }));

        // Sync to Supabase if in household
        if (item.householdId) {
          try {
            const { error } = await supabase
              .from("inventory_items")
              .update({
                ...toSupabaseFormat({ ...item, ...updatedItem }, item.householdId, true), // Re-enabled details sync
                updated_at: updatedItem.lastUpdated,
              })
              .eq("id", id);

            if (error) throw error;

            set((state) => ({
              items: state.items.map((i) =>
                i.id === id ? { ...i, syncedAt: new Date().toISOString() } : i
              ),
            }));
          } catch (error) {
            console.error("Error syncing update to Supabase:", error);
          }
        }
      },

      deleteItem: async (id) => {
        const item = get().getItemById(id);
        if (!item) return;

        // Remove from local state immediately
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        }));

        // Soft delete in Supabase if in household
        if (item.householdId) {
          try {
            await supabase
              .from("inventory_items")
              .update({ deleted_at: new Date().toISOString() })
              .eq("id", id);
          } catch (error) {
            console.error("Error soft-deleting from Supabase:", error);
          }
        }
      },

      updateQuantity: async (id, quantity) => {
        const item = get().getItemById(id);
        if (!item) return;

        const updates = {
          quantity,
          lastUpdated: new Date().toISOString(),
        };

        // Update local immediately
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id ? { ...item, ...updates } : item
          ),
        }));

        // Sync to Supabase
        if (item.householdId) {
          try {
            await supabase
              .from("inventory_items")
              .update({
                quantity,
                updated_at: updates.lastUpdated,
                synced_at: new Date().toISOString(),
              })
              .eq("id", id);

            set((state) => ({
              items: state.items.map((i) =>
                i.id === id ? { ...i, syncedAt: new Date().toISOString() } : i
              ),
            }));
          } catch (error) {
            console.error("Error syncing quantity to Supabase:", error);
          }
        }

        await get().checkAndNotifyLowStock(id);
      },

      getItemById: (id) => {
        return get().items.find((item) => item.id === id);
      },

      getLowStockItems: () => {
        return get().items.filter((item) => item.quantity <= item.threshold);
      },

      checkAndNotifyLowStock: async (itemId) => {
        const item = get().getItemById(itemId);
        if (!item) return;

        if (item.quantity <= item.threshold) {
          await Notifications.scheduleNotificationAsync({
            content: {
              title: "Low Stock Alert",
              body: `${item.name} is running low. Only ${item.quantity} ${item.unit} remaining.`,
              data: { itemId: item.id },
            },
            trigger: null,
          });
        }
      },

      syncToSupabase: async (householdId: string) => {
        if (get().isSyncing) return;
        set({ isSyncing: true });

        try {
          const unsyncedItems = get().items.filter(
            (item) => !item.syncedAt && item.householdId === householdId
          );

          for (const item of unsyncedItems) {
            await supabase
              .from("inventory_items")
              .upsert(toSupabaseFormat(item, householdId, true)); // Re-enabled details sync
          }

          set({
            items: get().items.map((item) =>
              unsyncedItems.find((u) => u.id === item.id)
                ? { ...item, syncedAt: new Date().toISOString() }
                : item
            ),
            lastSyncTime: new Date().toISOString(),
          });
        } catch (error) {
          console.error("Sync to Supabase error:", error);
        } finally {
          set({ isSyncing: false });
        }
      },

      fetchFromSupabase: async (householdId: string) => {
        set({ isSyncing: true });

        try {
          const { data, error } = await supabase
            .from("inventory_items")
            .select("*")
            .eq("household_id", householdId)
            .is("deleted_at", null);

          if (error) throw error;

          if (data) {
            const fetchedItems = data.map(fromSupabaseFormat);
            
            // Merge with local items (keep local-only items, update synced items)
            set((state) => {
              const localOnlyItems = state.items.filter(item => !item.householdId || item.householdId !== householdId);
              const itemMap = new Map(fetchedItems.map(item => [item.id, item]));
              
              // Add any local items that aren't in Supabase yet
              localOnlyItems.forEach(item => {
                if (!itemMap.has(item.id)) {
                  itemMap.set(item.id, item);
                }
              });
              
              return {
                items: Array.from(itemMap.values()),
                lastSyncTime: new Date().toISOString()
              };
            });
            
            console.log(`Fetched ${fetchedItems.length} items from Supabase`);
          }
        } catch (error) {
          console.error("Fetch from Supabase error:", error);
        } finally {
          set({ isSyncing: false });
        }
      },

      subscribeToRealtime: (householdId: string) => {
        // Unsubscribe from existing channel first
        get().unsubscribeFromRealtime();

        const channel = supabase
          .channel(`inventory:${householdId}`)
          .on(
            "postgres_changes",
            {
              event: "*",
              schema: "public",
              table: "inventory_items",
              filter: `household_id=eq.${householdId}`,
            },
            (payload) => {
              console.log("Realtime update:", payload);

              if (payload.eventType === "INSERT") {
                const newItem = fromSupabaseFormat(payload.new);
                set((state) => {
                  // Avoid duplicates
                  if (state.items.find((i) => i.id === newItem.id)) {
                    return state;
                  }
                  return { items: [...state.items, newItem] };
                });
              } else if (payload.eventType === "UPDATE") {
                const updatedItem = fromSupabaseFormat(payload.new);
                set((state) => ({
                  items: state.items.map((item) =>
                    item.id === updatedItem.id ? updatedItem : item
                  ),
                }));
              } else if (payload.eventType === "DELETE") {
                set((state) => ({
                  items: state.items.filter((item) => item.id !== payload.old.id),
                }));
              }
            }
          )
          .subscribe();

        set({ realtimeChannel: channel });
      },

      unsubscribeFromRealtime: () => {
        const { realtimeChannel } = get();
        if (realtimeChannel) {
          supabase.removeChannel(realtimeChannel);
          set({ realtimeChannel: null });
        }
      },

      migrateLocalToSupabase: async (householdId: string) => {
        set({ isSyncing: true });

        try {
          const localItems = get().items.filter((item) => !item.householdId);

          if (localItems.length === 0) {
            set({ isSyncing: false });
            return;
          }

          // Add householdId to all local items
          const itemsToMigrate = localItems.map((item) => ({
            ...item,
            householdId,
          }));

          // Insert all items to Supabase
          const supabaseItems = itemsToMigrate.map((item) =>
            toSupabaseFormat(item, householdId, true) // Re-enabled details sync
          );

          const { error } = await supabase
            .from("inventory_items")
            .insert(supabaseItems);

          if (error) throw error;

          // Update local state with householdId and synced flag
          set({
            items: get().items.map((item) => {
              const migrated = itemsToMigrate.find((m) => m.id === item.id);
              return migrated
                ? { ...migrated, syncedAt: new Date().toISOString() }
                : item;
            }),
            lastSyncTime: new Date().toISOString(),
          });

          console.log(`Migrated ${localItems.length} items to Supabase`);
        } catch (error) {
          console.error("Migration error:", error);
        } finally {
          set({ isSyncing: false });
        }
      },

      clearAllItems: () => {
        set({
          items: [],
          lastSyncTime: null,
          isSyncing: false,
        });
      },
    }),
    {
      name: "inventory-storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        items: state.items,
        lastSyncTime: state.lastSyncTime,
      }),
    }
  )
);
