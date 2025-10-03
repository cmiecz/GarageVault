import { createClient } from "@supabase/supabase-js";
import * as Device from "expo-device";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

console.log("Supabase URL:", supabaseUrl);
console.log("Supabase Key:", supabaseAnonKey ? "✅ Loaded" : "❌ Missing");

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false, // We're using device IDs, not user auth
  },
  global: {
    headers: {
      'apikey': supabaseAnonKey,
    },
  },
});

// Database types
export interface Database {
  public: {
    Tables: {
      households: {
        Row: {
          id: string;
          name: string;
          invite_code: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          invite_code: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          invite_code?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      household_members: {
        Row: {
          id: string;
          household_id: string;
          device_id: string;
          device_name: string | null;
          joined_at: string;
          last_active: string;
        };
        Insert: {
          id?: string;
          household_id: string;
          device_id: string;
          device_name?: string | null;
          joined_at?: string;
          last_active?: string;
        };
        Update: {
          id?: string;
          household_id?: string;
          device_id?: string;
          device_name?: string | null;
          joined_at?: string;
          last_active?: string;
        };
      };
      inventory_items: {
        Row: {
          id: string;
          household_id: string;
          name: string;
          category: string;
          quantity: number;
          max_quantity: number;
          threshold: number;
          unit: string;
          image_uri: string | null;
          images: string[] | null;
          purchase_links: {
            homeDepot?: string;
            lowes?: string;
            amazon?: string;
          } | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
          synced_at: string;
        };
        Insert: {
          id: string;
          household_id: string;
          name: string;
          category: string;
          quantity: number;
          max_quantity: number;
          threshold: number;
          unit: string;
          image_uri?: string | null;
          images?: string[] | null;
          purchase_links?: {
            homeDepot?: string;
            lowes?: string;
            amazon?: string;
          } | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
          synced_at?: string;
        };
        Update: {
          id?: string;
          household_id?: string;
          name?: string;
          category?: string;
          quantity?: number;
          max_quantity?: number;
          threshold?: number;
          unit?: string;
          image_uri?: string | null;
          images?: string[] | null;
          purchase_links?: {
            homeDepot?: string;
            lowes?: string;
            amazon?: string;
          } | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
          synced_at?: string;
        };
      };
    };
  };
}

// Get unique device ID
export async function getDeviceId(): Promise<string> {
  // Use a combination of device properties for a unique ID
  const deviceName = Device.deviceName || "Unknown Device";
  const modelName = Device.modelName || "Unknown Model";
  const osVersion = Device.osVersion || "Unknown OS";
  
  // Create a simple hash from device info
  const deviceInfo = `${deviceName}-${modelName}-${osVersion}`;
  return deviceInfo;
}

export async function getDeviceName(): Promise<string> {
  return Device.deviceName || "Unknown Device";
}
