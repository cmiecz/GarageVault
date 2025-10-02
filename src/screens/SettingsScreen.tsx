import React, { useMemo } from "react";
import { View, Text, Pressable, ScrollView, StyleSheet, Linking, Share, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Notifications from "expo-notifications";
import { useInventoryStore } from "../state/inventoryStore";
import { useHouseholdStore } from "../state/householdStore";
import { useStorageStore } from "../state/storageStore";
import { Colors } from "../utils/colors";
import Constants from "expo-constants";

export default function SettingsScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const items = useInventoryStore((state) => state.items);
  const allLocations = useStorageStore((state) => state.locations);
  const locations = allLocations.filter((loc) => !loc.deletedAt);
  const household = useHouseholdStore((s) => s.household);
  const members = useHouseholdStore((s) => s.members);
  const leaveHousehold = useHouseholdStore((s) => s.leaveHousehold);
  const unsubscribeFromRealtime = useInventoryStore((s) => s.unsubscribeFromRealtime);
  const clearAllItems = useInventoryStore((s) => s.clearAllItems);

  const lowStockItems = useMemo(() => {
    return items.filter((item) => item.quantity <= item.threshold);
  }, [items]);

  const appVersion = Constants.expoConfig?.version || "1.0.0";

  const requestNotificationPermissions = async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status === "granted") {
      Alert.alert("Success", "Notifications enabled! You will receive alerts when items are low on stock.");
    } else {
      Alert.alert("Permission Denied", "Notification permissions are required for low stock alerts. Please enable them in Settings.");
    }
  };

  const handleLeaveHousehold = () => {
    if (!household) return;
    
    Alert.alert(
      "Leave Household",
      `Are you sure you want to leave "${household.name}"?\n\nWhat would you like to do with your ${items.length} local item(s)?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Keep Items",
          onPress: async () => {
            try {
              unsubscribeFromRealtime();
              await leaveHousehold();
              Alert.alert("Success", `You have left the household. Your ${items.length} item(s) remain on this device.`);
            } catch (error) {
              console.error("Error leaving household:", error);
              Alert.alert("Error", "Failed to leave household. Please try again.");
            }
          },
        },
        {
          text: "Clear All Items",
          style: "destructive",
          onPress: async () => {
            try {
              unsubscribeFromRealtime();
              clearAllItems();
              await leaveHousehold();
              Alert.alert("Success", "You have left the household and all items have been cleared.");
            } catch (error) {
              console.error("Error leaving household:", error);
              Alert.alert("Error", "Failed to leave household. Please try again.");
            }
          },
        },
      ]
    );
  };

  const stats = {
    totalItems: items.length,
    lowStock: lowStockItems.length,
    storageLocations: locations.length,
  };

  return (
    <View className="flex-1" style={{ backgroundColor: Colors.background }}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <View className="px-5 pb-5">
          <View className="flex-row items-center justify-between">
            <Pressable
              onPress={() => navigation.goBack()}
              className="w-10 h-10 rounded-full items-center justify-center"
              style={{ backgroundColor: "rgba(255, 255, 255, 0.2)" }}
            >
              <Ionicons name="arrow-back" size={22} color={Colors.textOnPrimary} />
            </Pressable>
            <Text className="text-xl font-semibold" style={{ color: Colors.textOnPrimary }}>
              Settings
            </Text>
            <View className="w-10" />
          </View>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: insets.bottom + 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Inventory Overview */}
        <View className="rounded-2xl overflow-hidden mb-4" style={styles.card}>
          <View className="px-5 py-4">
            <Text className="text-lg font-semibold mb-4" style={{ color: Colors.textPrimary }}>
              Inventory Overview
            </Text>
            <StatRow icon="cube" label="Total Items" value={stats.totalItems.toString()} />
            <View style={styles.divider} />
            <StatRow
              icon="alert-circle"
              label="Low Stock Items"
              value={stats.lowStock.toString()}
              valueColor={stats.lowStock > 0 ? Colors.error : Colors.textPrimary}
            />
            <View style={styles.divider} />
            <StatRow
              icon="file-tray-stacked"
              label="Storage Locations"
              value={stats.storageLocations.toString()}
            />
          </View>
        </View>

        {/* Household Section */}
        {household && (
          <View className="rounded-2xl overflow-hidden mb-4" style={styles.card}>
            <View className="px-5 py-4">
              <Text className="text-lg font-semibold mb-4" style={{ color: Colors.textPrimary }}>
                Household
              </Text>
              <View className="mb-4">
                <Text className="text-sm mb-1" style={{ color: Colors.textSecondary }}>
                  Name
                </Text>
                <Text className="text-base font-medium" style={{ color: Colors.textPrimary }}>
                  {household.name}
                </Text>
              </View>
              <View className="mb-4">
                <Text className="text-sm mb-2" style={{ color: Colors.textSecondary }}>
                  Invite Code
                </Text>
                <View className="flex-row items-center justify-between p-3 rounded-xl" style={{ backgroundColor: Colors.gray100 }}>
                  <Text className="text-2xl font-mono font-bold" style={{ color: Colors.accent }}>
                    {household.inviteCode}
                  </Text>
                  <Pressable
                    onPress={() => {
                      Share.share({
                        message: `Join my GarageVault household "${household.name}"!\n\nInvite Code: ${household.inviteCode}`,
                      });
                    }}
                    className="px-4 py-2 rounded-lg"
                    style={{ backgroundColor: Colors.accent }}
                  >
                    <Text className="font-semibold" style={{ color: Colors.textOnPrimary }}>
                      Share
                    </Text>
                  </Pressable>
                </View>
              </View>
              <View>
                <Text className="text-sm mb-1" style={{ color: Colors.textSecondary }}>
                  Members
                </Text>
                <Text className="text-base font-medium" style={{ color: Colors.textPrimary }}>
                  {members.length} {members.length === 1 ? "device" : "devices"} connected
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Organization */}
        <View className="rounded-2xl overflow-hidden mb-4" style={styles.card}>
          <View className="px-5 py-4">
            <Text className="text-lg font-semibold mb-3" style={{ color: Colors.textPrimary }}>
              Organization
            </Text>
          </View>
          <SettingsRow
            icon="file-tray-stacked"
            iconColor={Colors.accent}
            iconBg={`${Colors.accent}15`}
            label="Storage Locations"
            subtitle={`${locations.length} ${locations.length === 1 ? "location" : "locations"}`}
            onPress={() => navigation.navigate("Inventory", { screen: "StorageLocations" })}
          />
        </View>

        {/* Preferences */}
        <View className="rounded-2xl overflow-hidden mb-4" style={styles.card}>
          <View className="px-5 py-4">
            <Text className="text-lg font-semibold mb-3" style={{ color: Colors.textPrimary }}>
              Preferences
            </Text>
          </View>
          <SettingsRow
            icon="notifications"
            iconColor={Colors.warning}
            iconBg={`${Colors.warning}15`}
            label="Notifications"
            subtitle="Get low stock alerts"
            onPress={requestNotificationPermissions}
          />
        </View>

        {/* About */}
        <View className="rounded-2xl overflow-hidden mb-4" style={styles.card}>
          <View className="px-5 py-4">
            <Text className="text-lg font-semibold mb-3" style={{ color: Colors.textPrimary }}>
              About
            </Text>
          </View>
          <View className="px-5 py-4 items-center">
            <View className="w-20 h-20 rounded-2xl items-center justify-center mb-3" style={{ backgroundColor: Colors.primary }}>
              <Ionicons name="cube" size={40} color={Colors.textOnPrimary} />
            </View>
            <Text className="text-xl font-bold mb-1" style={{ color: Colors.textPrimary }}>
              Garage Vault
            </Text>
            <Text className="text-sm mb-2" style={{ color: Colors.textSecondary }}>
              Inventory Unlocked
            </Text>
            <Text className="text-xs mb-4" style={{ color: Colors.textTertiary }}>
              Version {appVersion}
            </Text>
            <Text className="text-sm text-center leading-5" style={{ color: Colors.textSecondary }}>
              Keep track of tools, fasteners, paint, and all your garage items. Scan items with AI to automatically identify and catalog them.
            </Text>
          </View>
          <View style={styles.divider} />
          <SettingsRow
            icon="document-text"
            iconColor={Colors.textSecondary}
            iconBg={Colors.gray100}
            label="Privacy Policy"
            onPress={() => Linking.openURL("https://garagevault.onrender.com/privacy.html")}
            showChevron={false}
            showExternal
          />
          <View style={styles.divider} />
          <SettingsRow
            icon="document-text"
            iconColor={Colors.textSecondary}
            iconBg={Colors.gray100}
            label="Terms of Service"
            onPress={() => Linking.openURL("https://garagevault.onrender.com/terms.html")}
            showChevron={false}
            showExternal
          />
          <View style={styles.divider} />
          <SettingsRow
            icon="help-circle"
            iconColor={Colors.textSecondary}
            iconBg={Colors.gray100}
            label="Support & Feedback"
            onPress={() => Linking.openURL("mailto:support@garagevault.app")}
            showChevron={false}
            showExternal
          />
        </View>

        {/* Danger Zone */}
        {household && (
          <View className="rounded-2xl overflow-hidden mb-4" style={styles.card}>
            <View className="px-5 py-4">
              <Text className="text-lg font-semibold mb-3" style={{ color: Colors.error }}>
                Danger Zone
              </Text>
            </View>
            <SettingsRow
              icon="exit"
              iconColor={Colors.error}
              iconBg="#FEE2E2"
              label="Leave Household"
              labelColor={Colors.error}
              onPress={handleLeaveHousehold}
            />
          </View>
        )}

        {/* Legal Text */}
        <Text className="text-xs text-center leading-5 px-4" style={{ color: Colors.textTertiary }}>
          © 2025 Garage Vault. All rights reserved.{"\n"}
          Made with ❤️ for organizing your garage
        </Text>
      </ScrollView>
    </View>
  );
}

function StatRow({
  icon,
  label,
  value,
  valueColor = Colors.textPrimary,
}: {
  icon: any;
  label: string;
  value: string;
  valueColor?: string;
}) {
  return (
    <View className="flex-row items-center justify-between py-3">
      <View className="flex-row items-center flex-1">
        <Ionicons name={icon} size={20} color={Colors.textSecondary} />
        <Text className="text-base ml-3" style={{ color: Colors.textSecondary }}>
          {label}
        </Text>
      </View>
      <Text className="text-lg font-semibold" style={{ color: valueColor }}>
        {value}
      </Text>
    </View>
  );
}

function SettingsRow({
  icon,
  iconColor,
  iconBg,
  label,
  subtitle,
  labelColor = Colors.textPrimary,
  onPress,
  showChevron = true,
  showExternal = false,
}: {
  icon: any;
  iconColor: string;
  iconBg: string;
  label: string;
  subtitle?: string;
  labelColor?: string;
  onPress: () => void;
  showChevron?: boolean;
  showExternal?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="px-5 py-4 flex-row items-center justify-between"
    >
      <View className="flex-row items-center flex-1">
        <View
          className="w-10 h-10 rounded-full items-center justify-center"
          style={{ backgroundColor: iconBg }}
        >
          <Ionicons name={icon} size={20} color={iconColor} />
        </View>
        <View className="ml-3 flex-1">
          <Text className="text-base font-medium" style={{ color: labelColor }}>
            {label}
          </Text>
          {subtitle && (
            <Text className="text-sm mt-0.5" style={{ color: Colors.textSecondary }}>
              {subtitle}
            </Text>
          )}
        </View>
      </View>
      {showChevron && <Ionicons name="chevron-forward" size={20} color={Colors.textTertiary} />}
      {showExternal && <Ionicons name="open-outline" size={20} color={Colors.textTertiary} />}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: Colors.primary,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  card: {
    backgroundColor: Colors.cardBackground,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.gray200,
    marginLeft: 58,
  },
});
