import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Household, HouseholdMember } from "../types/inventory";
import { supabase, getDeviceId, getDeviceName } from "../api/supabase";

interface HouseholdState {
  household: Household | null;
  deviceId: string | null;
  members: HouseholdMember[];
  isLoading: boolean;
  error: string | null;

  // Actions
  initializeDevice: () => Promise<void>;
  createHousehold: (name: string) => Promise<string>; // Returns invite code
  joinHousehold: (inviteCode: string) => Promise<boolean>;
  leaveHousehold: () => Promise<void>;
  fetchMembers: () => Promise<void>;
  setHousehold: (household: Household | null) => void;
  clearError: () => void;
}

export const useHouseholdStore = create<HouseholdState>()(
  persist(
    (set, get) => ({
      household: null,
      deviceId: null,
      members: [],
      isLoading: false,
      error: null,

      initializeDevice: async () => {
        try {
          const deviceId = await getDeviceId();
          set({ deviceId });

          // Check if device is already in a household
          const { data: memberData, error: memberError } = await supabase
            .from("household_members")
            .select("household_id, household:households(*)")
            .eq("device_id", deviceId)
            .single();

          if (memberError) {
            console.log("No existing household membership");
            return;
          }

          if (memberData && memberData.household) {
            const householdData = memberData.household as any;
            set({
              household: {
                id: householdData.id,
                name: householdData.name,
                inviteCode: householdData.invite_code,
                createdAt: householdData.created_at,
                updatedAt: householdData.updated_at,
              },
            });

            // Fetch members
            await get().fetchMembers();
          }
        } catch (error: any) {
          console.error("Device initialization error:", error);
          set({ error: error.message });
        }
      },

      createHousehold: async (name: string) => {
        set({ isLoading: true, error: null });
        try {
          const deviceId = await getDeviceId();
          const deviceName = await getDeviceName();

          console.log("Creating household:", name);
          console.log("Device ID:", deviceId);

          // Generate invite code
          const { data: codeData, error: codeError } = await supabase.rpc(
            "generate_invite_code"
          );

          if (codeError) {
            console.error("Error generating invite code:", codeError);
            throw codeError;
          }

          const inviteCode = codeData as string;
          console.log("Generated invite code:", inviteCode);

          // Create household
          const { data: householdData, error: householdError } = await supabase
            .from("households")
            .insert({
              name,
              invite_code: inviteCode,
            })
            .select()
            .single();

          if (householdError) {
            console.error("Error creating household:", householdError);
            throw householdError;
          }

          console.log("Household created:", householdData);

          // Add device as member
          const { error: memberError } = await supabase.from("household_members").insert({
            household_id: householdData.id,
            device_id: deviceId,
            device_name: deviceName,
          });

          if (memberError) {
            console.error("Error adding member:", memberError);
            throw memberError;
          }

          console.log("Device added as member");

          set({
            household: {
              id: householdData.id,
              name: householdData.name,
              inviteCode: householdData.invite_code,
              createdAt: householdData.created_at,
              updatedAt: householdData.updated_at,
            },
            deviceId,
            isLoading: false,
          });

          await get().fetchMembers();

          console.log("✅ Household creation complete!");
          return inviteCode;
        } catch (error: any) {
          console.error("❌ Household creation failed:", error);
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      joinHousehold: async (inviteCode: string) => {
        set({ isLoading: true, error: null });
        try {
          const deviceId = await getDeviceId();
          const deviceName = await getDeviceName();

          // Find household by invite code
          const { data: householdData, error: householdError } = await supabase
            .from("households")
            .select()
            .eq("invite_code", inviteCode.trim().toUpperCase())
            .single();

          if (householdError || !householdData) {
            set({ error: "Invalid invite code", isLoading: false });
            return false;
          }

          // Check if already a member
          const { data: existingMember } = await supabase
            .from("household_members")
            .select()
            .eq("household_id", householdData.id)
            .eq("device_id", deviceId)
            .single();

          if (!existingMember) {
            // Add device as member
            await supabase.from("household_members").insert({
              household_id: householdData.id,
              device_id: deviceId,
              device_name: deviceName,
            });
          }

          set({
            household: {
              id: householdData.id,
              name: householdData.name,
              inviteCode: householdData.invite_code,
              createdAt: householdData.created_at,
              updatedAt: householdData.updated_at,
            },
            deviceId,
            isLoading: false,
          });

          await get().fetchMembers();

          return true;
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
          return false;
        }
      },

      leaveHousehold: async () => {
        set({ isLoading: true });
        try {
          const { deviceId, household } = get();
          if (!deviceId || !household) return;

          // Remove device from household
          await supabase
            .from("household_members")
            .delete()
            .eq("household_id", household.id)
            .eq("device_id", deviceId);

          set({
            household: null,
            members: [],
            isLoading: false,
          });
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
        }
      },

      fetchMembers: async () => {
        try {
          const { household } = get();
          if (!household) return;

          const { data, error } = await supabase
            .from("household_members")
            .select()
            .eq("household_id", household.id);

          if (error) throw error;

          set({
            members: data.map((m) => ({
              id: m.id,
              householdId: m.household_id,
              deviceId: m.device_id,
              deviceName: m.device_name,
              joinedAt: m.joined_at,
              lastActive: m.last_active,
            })),
          });
        } catch (error: any) {
          console.error("Fetch members error:", error);
        }
      },

      setHousehold: (household) => set({ household }),

      clearError: () => set({ error: null }),
    }),
    {
      name: "household-storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        household: state.household,
        deviceId: state.deviceId,
      }),
    }
  )
);
