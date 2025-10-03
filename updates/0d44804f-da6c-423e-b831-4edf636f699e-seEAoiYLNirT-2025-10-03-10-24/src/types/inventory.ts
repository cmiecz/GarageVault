export type StorageType = "packout" | "bin" | "drawer" | "shelf" | "cabinet" | "toolbox" | "other";

export interface StorageLocation {
  id: string; // UUID - also used as QR code data
  name: string; // e.g., "Packout #1", "Small Parts Bin A"
  type: StorageType;
  description?: string;
  qrCode: string; // UUID (same as id)
  color?: string; // Optional color coding
  dateAdded: string;
  lastUpdated: string;
  // Supabase sync fields
  householdId?: string;
  syncedAt?: string;
  deletedAt?: string | null;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  description?: string;
  quantity: number;
  maxQuantity: number;
  unit: string;
  threshold: number;
  imageUri?: string;
  images?: string[]; // Multiple images support
  barcode?: string;
  details: {
    brand?: string;
    model?: string;
    size?: string;
    color?: string;
    type?: string;
    material?: string;
    rooms?: string[]; // For paint - which rooms it's used in
    storageLocationId?: string; // Reference to StorageLocation
    storagePosition?: string; // Optional position within storage (e.g., "Top drawer", "Slot 3")
    [key: string]: string | string[] | undefined;
  };
  purchaseLinks?: {
    homeDepot?: string;
    lowes?: string;
    amazon?: string;
  };
  dateAdded: string;
  lastUpdated: string;
  // Supabase sync fields
  householdId?: string;
  syncedAt?: string;
  deletedAt?: string | null;
}

export interface Household {
  id: string;
  name: string;
  inviteCode: string;
  createdAt: string;
  updatedAt: string;
}

export interface HouseholdMember {
  id: string;
  householdId: string;
  deviceId: string;
  deviceName: string | null;
  joinedAt: string;
  lastActive: string;
}


export interface InventoryFilters {
  searchQuery: string;
  category: string | null;
  showLowStock: boolean;
  storageLocationId?: string | null; // Filter by storage location
}

export type SortOption = "name" | "quantity" | "category" | "dateAdded";
