import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useHouseholdStore } from "../state/householdStore";
import { useInventoryStore } from "../state/inventoryStore";
import { Image } from "expo-image";

export default function HouseholdSetupScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const [mode, setMode] = useState<"welcome" | "create" | "join">("welcome");
  const [householdName, setHouseholdName] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const createHousehold = useHouseholdStore((s) => s.createHousehold);
  const joinHousehold = useHouseholdStore((s) => s.joinHousehold);
  const migrateLocalToSupabase = useInventoryStore(
    (s) => s.migrateLocalToSupabase
  );
  const fetchFromSupabase = useInventoryStore((s) => s.fetchFromSupabase);
  const subscribeToRealtime = useInventoryStore((s) => s.subscribeToRealtime);

  const handleCreateHousehold = async () => {
    if (!householdName.trim()) {
      Alert.alert("Error", "Please enter a household name");
      return;
    }

    setIsLoading(true);
    try {
      const code = await createHousehold(householdName.trim());

      // Get the household ID from the store
      const household = useHouseholdStore.getState().household;
      if (household) {
        // Migrate local items to Supabase
        await migrateLocalToSupabase(household.id);

        // Subscribe to realtime updates
        subscribeToRealtime(household.id);
      }

      // Show invite code
      Alert.alert(
        "Household Created!",
        `Your household "${householdName}" has been created.\n\nInvite Code: ${code}\n\nShare this code with family members so they can join.`,
        [{ text: "Got it!", onPress: () => navigation.replace("Main") }]
      );
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to create household");
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinHousehold = async () => {
    if (!inviteCode.trim()) {
      Alert.alert("Error", "Please enter an invite code");
      return;
    }

    setIsLoading(true);
    try {
      const success = await joinHousehold(inviteCode.trim().toUpperCase());

      if (success) {
        const household = useHouseholdStore.getState().household;
        if (household) {
          // Fetch household inventory
          await fetchFromSupabase(household.id);

          // Subscribe to realtime updates
          subscribeToRealtime(household.id);
        }

        Alert.alert(
          "Success!",
          "You have joined the household. Inventory synced!",
          [{ text: "Continue", onPress: () => navigation.replace("Main") }]
        );
      } else {
        Alert.alert("Error", "Invalid invite code. Please try again.");
      }
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to join household");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    navigation.replace("Main");
  };

  if (mode === "welcome") {
    return (
      <View className="flex-1 bg-gray-50">
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: "center",
            paddingHorizontal: 24,
            paddingTop: insets.top + 40,
            paddingBottom: insets.bottom + 40,
          }}
        >
          <View className="items-center mb-8">
            <Image
              source={require("../../assets/images/inventory-icon.jpg")}
              style={{ width: 140, height: 140, marginBottom: 24 }}
              contentFit="contain"
            />
            <Text className="text-3xl font-bold text-gray-900 mb-3 text-center">
              Welcome to GarageVault
            </Text>
            <Text className="text-base text-gray-600 text-center leading-6">
              Share your garage inventory with family members in real-time
            </Text>
          </View>

          <View className="space-y-3">
            <Pressable
              onPress={() => setMode("create")}
              className="bg-blue-500 rounded-2xl p-5 items-center"
            >
              <View className="flex-row items-center">
                <Ionicons name="home" size={24} color="white" />
                <Text className="text-white text-lg font-semibold ml-3">
                  Create Household
                </Text>
              </View>
              <Text className="text-blue-100 text-sm mt-2 text-center">
                Start fresh and invite family members
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setMode("join")}
              className="bg-green-500 rounded-2xl p-5 items-center mt-3"
            >
              <View className="flex-row items-center">
                <Ionicons name="people" size={24} color="white" />
                <Text className="text-white text-lg font-semibold ml-3">
                  Join Household
                </Text>
              </View>
              <Text className="text-green-100 text-sm mt-2 text-center">
                Enter a code to join an existing household
              </Text>
            </Pressable>

            <Pressable
              onPress={handleSkip}
              className="bg-gray-200 rounded-2xl p-4 items-center mt-3"
            >
              <Text className="text-gray-700 text-base font-medium">
                Skip for Now
              </Text>
              <Text className="text-gray-500 text-xs mt-1">
                Use locally without sharing
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </View>
    );
  }

  if (mode === "create") {
    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1 bg-gray-50"
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: "center",
            paddingHorizontal: 24,
            paddingTop: insets.top + 40,
            paddingBottom: insets.bottom + 40,
          }}
          keyboardShouldPersistTaps="handled"
        >
          <Pressable onPress={() => setMode("welcome")} className="mb-6">
            <Ionicons name="arrow-back" size={28} color="#374151" />
          </Pressable>

          <View className="items-center mb-8">
            <View className="bg-blue-100 rounded-full p-4 mb-4">
              <Ionicons name="home" size={48} color="#3B82F6" />
            </View>
            <Text className="text-2xl font-bold text-gray-900 mb-2">
              Create Your Household
            </Text>
            <Text className="text-sm text-gray-600 text-center">
              Give your household a name. You can share the invite code with family later.
            </Text>
          </View>

          <View className="space-y-4">
            <View>
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Household Name
              </Text>
              <TextInput
                value={householdName}
                onChangeText={setHouseholdName}
                placeholder="Smith Family Garage"
                placeholderTextColor="#9CA3AF"
                className="bg-white border border-gray-300 rounded-xl px-4 py-4 text-base text-gray-900"
                autoFocus
                maxLength={50}
              />
            </View>

            <Pressable
              onPress={handleCreateHousehold}
              disabled={isLoading || !householdName.trim()}
              className={`rounded-xl p-4 items-center mt-4 ${
                isLoading || !householdName.trim()
                  ? "bg-gray-300"
                  : "bg-blue-500"
              }`}
            >
              {isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white text-lg font-semibold">
                  Create Household
                </Text>
              )}
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  // Join mode
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-gray-50"
    >
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: "center",
          paddingHorizontal: 24,
          paddingTop: insets.top + 40,
          paddingBottom: insets.bottom + 40,
        }}
        keyboardShouldPersistTaps="handled"
      >
        <Pressable onPress={() => setMode("welcome")} className="mb-6">
          <Ionicons name="arrow-back" size={28} color="#374151" />
        </Pressable>

        <View className="items-center mb-8">
          <View className="bg-green-100 rounded-full p-4 mb-4">
            <Ionicons name="people" size={48} color="#10B981" />
          </View>
          <Text className="text-2xl font-bold text-gray-900 mb-2">
            Join a Household
          </Text>
          <Text className="text-sm text-gray-600 text-center">
            Enter the 6-digit code shared by your family member
          </Text>
        </View>

        <View className="space-y-4">
          <View>
            <Text className="text-sm font-medium text-gray-700 mb-2">
              Invite Code
            </Text>
            <TextInput
              value={inviteCode}
              onChangeText={(text) => setInviteCode(text.toUpperCase())}
              placeholder="000000"
              placeholderTextColor="#9CA3AF"
              className="bg-white border border-gray-300 rounded-xl px-4 py-4 text-2xl text-center text-gray-900 tracking-widest font-mono"
              autoFocus
              keyboardType="number-pad"
              maxLength={6}
              autoCapitalize="characters"
            />
          </View>

          <Pressable
            onPress={handleJoinHousehold}
            disabled={isLoading || inviteCode.length !== 6}
            className={`rounded-xl p-4 items-center mt-4 ${
              isLoading || inviteCode.length !== 6
                ? "bg-gray-300"
                : "bg-green-500"
            }`}
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white text-lg font-semibold">
                Join Household
              </Text>
            )}
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
