import React, { useMemo, useState } from "react";
import { View, Text, Pressable, ScrollView, StyleSheet, Linking, Share, Alert, Switch, Modal } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Notifications from "expo-notifications";
import { useInventoryStore } from "../state/inventoryStore";
import { useHouseholdStore } from "../state/householdStore";
import { useStorageStore } from "../state/storageStore";
import { useLocationSettingsStore } from "../state/locationSettingsStore";
import { Colors } from "../utils/colors";
import Constants from "expo-constants";
import { requestLocationPermissions } from "../utils/locationService";
import { InventoryItem } from "../types/inventory";

// Helper function to get category breakdown
function getCategoryBreakdown(items: InventoryItem[]) {
  const categoryCount: { [key: string]: number } = {};
  
  items.forEach((item) => {
    if (!item.deletedAt) {
      categoryCount[item.category] = (categoryCount[item.category] || 0) + 1;
    }
  });
  
  return Object.entries(categoryCount)
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5); // Top 5 categories
}

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

  // Location-based reminders
  const locationRemindersEnabled = useLocationSettingsStore((s) => s.locationRemindersEnabled);
  const selectedStores = useLocationSettingsStore((s) => s.selectedStores);
  const enableLocationReminders = useLocationSettingsStore((s) => s.enableLocationReminders);
  const disableLocationReminders = useLocationSettingsStore((s) => s.disableLocationReminders);
  const [isTogglingLocation, setIsTogglingLocation] = useState(false);

  // Modal states
  const [showReportingModal, setShowReportingModal] = useState(false);
  const [showHouseholdModal, setShowHouseholdModal] = useState(false);

  const activeItems = useMemo(() => items.filter((item) => !item.deletedAt), [items]);

  const lowStockItems = useMemo(() => {
    return activeItems.filter((item) => item.quantity <= item.threshold);
  }, [activeItems]);

  const appVersion = Constants.expoConfig?.version || "1.0.0";

  const requestNotificationPermissions = async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Denied", "Notification permissions are required for low stock alerts. Please enable them in Settings.");
    }
  };

  const handleLocationToggle = async () => {
    if (isTogglingLocation) return;

    setIsTogglingLocation(true);
    
    try {
      if (locationRemindersEnabled) {
        await disableLocationReminders();
      } else {
        const hasPermission = await requestLocationPermissions();
        
        if (!hasPermission) {
          Alert.alert(
            "Permission Required",
            "Location access is required to remind you when you're near hardware stores. Please enable location permissions in Settings.",
            [{ text: "OK" }]
          );
          setIsTogglingLocation(false);
          return;
        }

        const { status } = await Notifications.requestPermissionsAsync();
        if (status !== "granted") {
          Alert.alert(
            "Notification Permission Required",
            "Notification access is also required for store reminders.",
            [{ text: "OK" }]
          );
          setIsTogglingLocation(false);
          return;
        }

        await enableLocationReminders();
      }
    } catch (error) {
      console.error("Error toggling location reminders:", error);
      Alert.alert("Error", "Failed to toggle location reminders. Please try again.");
    } finally {
      setIsTogglingLocation(false);
    }
  };

  const handleLeaveHousehold = () => {
    if (!household) return;
    
    Alert.alert(
      "Leave Household",
      `Are you sure you want to leave "${household.name}"?\n\nWhat would you like to do with your ${activeItems.length} local item(s)?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Keep Items",
          onPress: async () => {
            try {
              unsubscribeFromRealtime();
              await leaveHousehold();
              Alert.alert("Success", `You have left the household. Your ${activeItems.length} item(s) remain on this device.`);
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
        contentContainerStyle={{ paddingTop: 24, paddingBottom: insets.bottom + 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* INVENTORY MANAGEMENT */}
        <SectionHeader title="INVENTORY MANAGEMENT" />
        <View style={styles.section}>
          <SettingsRow
            icon="file-tray-stacked"
            iconColor={Colors.accent}
            iconBg={`${Colors.accent}15`}
            label="Storage Locations"
            subtitle={`${locations.length} ${locations.length === 1 ? "location" : "locations"}`}
            onPress={() => navigation.navigate("Inventory", { screen: "StorageLocations" })}
          />
          <View style={styles.divider} />
          <SettingsRow
            icon="pricetags"
            iconColor="#8B5CF6"
            iconBg="#8B5CF615"
            label="Categories"
            subtitle="Manage custom categories"
            onPress={() => navigation.navigate("ManageCategories")}
          />
        </View>

        {/* STORE REMINDERS */}
        <SectionHeader title="STORE REMINDERS" />
        <View style={styles.section}>
          <Pressable
            onPress={handleLocationToggle}
            className="px-5 py-4 flex-row items-center justify-between"
            disabled={isTogglingLocation}
          >
            <View className="flex-row items-center flex-1">
              <View
                className="w-10 h-10 rounded-full items-center justify-center"
                style={{ backgroundColor: `${Colors.accent}15` }}
              >
                <Ionicons name="location" size={20} color={Colors.accent} />
              </View>
              <View className="ml-3 flex-1">
                <Text className="text-base font-medium" style={{ color: Colors.textPrimary }}>
                  Location-Based Alerts
                </Text>
                <Text className="text-sm mt-0.5" style={{ color: Colors.textSecondary }}>
                  {locationRemindersEnabled ? "Active" : "Disabled"}
                </Text>
              </View>
            </View>
            <Switch
              value={locationRemindersEnabled}
              onValueChange={handleLocationToggle}
              trackColor={{ false: Colors.gray200, true: `${Colors.accent}50` }}
              thumbColor={locationRemindersEnabled ? Colors.accent : Colors.gray100}
              disabled={isTogglingLocation}
            />
          </Pressable>
          {locationRemindersEnabled && (
            <>
              <View style={styles.divider} />
              <SettingsRow
                icon="storefront"
                iconColor={Colors.accent}
                iconBg={`${Colors.accent}15`}
                label="Select Stores"
                subtitle={`${selectedStores.length} of 7 stores selected`}
                onPress={() => navigation.navigate("SelectStores")}
              />
            </>
          )}
          <View style={styles.divider} />
          <SettingsRow
            icon="notifications"
            iconColor={Colors.warning}
            iconBg={`${Colors.warning}15`}
            label="Notification Permissions"
            subtitle="Enable low stock alerts"
            onPress={requestNotificationPermissions}
          />
        </View>

        {/* REPORTING */}
        <SectionHeader title="REPORTING" />
        <View style={styles.section}>
          <SettingsRow
            icon="bar-chart"
            iconColor="#10B981"
            iconBg="#10B98115"
            label="Usage & Analytics"
            subtitle="View inventory insights"
            onPress={() => setShowReportingModal(true)}
          />
        </View>

        {/* HOUSEHOLD */}
        {household && (
          <>
            <SectionHeader title="HOUSEHOLD" />
            <View style={styles.section}>
              <SettingsRow
                icon="people"
                iconColor={Colors.accent}
                iconBg={`${Colors.accent}15`}
                label={household.name}
                subtitle={`${members.length} ${members.length === 1 ? "device" : "devices"} connected`}
                onPress={() => setShowHouseholdModal(true)}
              />
              <View style={styles.divider} />
              <SettingsRow
                icon="exit"
                iconColor={Colors.error}
                iconBg="#FEE2E2"
                label="Leave Household"
                labelColor={Colors.error}
                onPress={handleLeaveHousehold}
                showChevron={false}
              />
            </View>
          </>
        )}

        {/* ABOUT */}
        <SectionHeader title="ABOUT" />
        <View style={styles.section}>
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
          <View style={styles.divider} />
          <View className="px-5 py-4">
            <Text className="text-xs" style={{ color: Colors.textTertiary }}>
              Version {appVersion}
            </Text>
          </View>
        </View>

        {/* Legal Text */}
        <Text className="text-xs text-center leading-5 px-4 mt-6" style={{ color: Colors.textTertiary }}>
          © 2025 Garage Vault. All rights reserved.{"\n"}
          Made with ❤️ for organizing your garage
        </Text>
      </ScrollView>

      {/* Reporting Modal */}
      <Modal
        visible={showReportingModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowReportingModal(false)}
      >
        <View className="flex-1" style={{ backgroundColor: Colors.background }}>
          <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
            <View className="px-5 pb-5">
              <View className="flex-row items-center justify-between">
                <Pressable
                  onPress={() => setShowReportingModal(false)}
                  className="w-10 h-10 rounded-full items-center justify-center"
                  style={{ backgroundColor: "rgba(255, 255, 255, 0.2)" }}
                >
                  <Ionicons name="close" size={22} color={Colors.textOnPrimary} />
                </Pressable>
                <Text className="text-xl font-semibold" style={{ color: Colors.textOnPrimary }}>
                  Usage & Analytics
                </Text>
                <View className="w-10" />
              </View>
            </View>
          </View>

          <ScrollView className="flex-1" contentContainerStyle={{ padding: 20 }}>
            {/* Overview Stats */}
            <View style={styles.reportCard}>
              <Text className="text-lg font-semibold mb-4" style={{ color: Colors.textPrimary }}>
                Inventory Overview
              </Text>
              <StatRow icon="cube" label="Total Items" value={activeItems.length.toString()} />
              <View style={styles.reportDivider} />
              <StatRow
                icon="alert-circle"
                label="Low Stock Items"
                value={lowStockItems.length.toString()}
                valueColor={lowStockItems.length > 0 ? Colors.error : Colors.success}
              />
              <View style={styles.reportDivider} />
              <StatRow
                icon="file-tray-stacked"
                label="Storage Locations"
                value={locations.length.toString()}
              />
            </View>

            {/* Category Breakdown */}
            <View style={styles.reportCard}>
              <Text className="text-lg font-semibold mb-2" style={{ color: Colors.textPrimary }}>
                Top Categories
              </Text>
              <Text className="text-sm mb-4" style={{ color: Colors.textSecondary }}>
                Your most stocked items
              </Text>
              {getCategoryBreakdown(activeItems).map((cat, idx) => (
                <View key={cat.category}>
                  {idx > 0 && <View style={styles.reportDivider} />}
                  <View className="flex-row items-center justify-between py-3">
                    <Text className="text-base" style={{ color: Colors.textPrimary }}>
                      {cat.category}
                    </Text>
                    <Text className="text-base font-semibold" style={{ color: Colors.accent }}>
                      {cat.count}
                    </Text>
                  </View>
                </View>
              ))}
              {getCategoryBreakdown(activeItems).length === 0 && (
                <Text className="text-sm text-center py-8" style={{ color: Colors.textSecondary }}>
                  No items yet. Start adding items to see your breakdown!
                </Text>
              )}
            </View>

            {/* Usage Note */}
            <View className="mt-4 p-4 rounded-xl" style={{ backgroundColor: Colors.gray100 }}>
              <Text className="text-xs leading-5" style={{ color: Colors.textSecondary }}>
                Analytics are calculated based on your current inventory. Low stock items are those at or below their threshold quantity.
              </Text>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Household Details Modal */}
      <Modal
        visible={showHouseholdModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowHouseholdModal(false)}
      >
        <View className="flex-1" style={{ backgroundColor: Colors.background }}>
          <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
            <View className="px-5 pb-5">
              <View className="flex-row items-center justify-between">
                <Pressable
                  onPress={() => setShowHouseholdModal(false)}
                  className="w-10 h-10 rounded-full items-center justify-center"
                  style={{ backgroundColor: "rgba(255, 255, 255, 0.2)" }}
                >
                  <Ionicons name="close" size={22} color={Colors.textOnPrimary} />
                </Pressable>
                <Text className="text-xl font-semibold" style={{ color: Colors.textOnPrimary }}>
                  Household
                </Text>
                <View className="w-10" />
              </View>
            </View>
          </View>

          <ScrollView className="flex-1" contentContainerStyle={{ padding: 20 }}>
            {household && (
              <>
                <View style={styles.reportCard}>
                  <Text className="text-sm mb-2" style={{ color: Colors.textSecondary }}>
                    Name
                  </Text>
                  <Text className="text-2xl font-semibold mb-6" style={{ color: Colors.textPrimary }}>
                    {household.name}
                  </Text>

                  <Text className="text-sm mb-3" style={{ color: Colors.textSecondary }}>
                    Invite Code
                  </Text>
                  <View className="flex-row items-center justify-between p-4 rounded-xl mb-6" style={{ backgroundColor: Colors.gray100 }}>
                    <Text className="text-3xl font-mono font-bold" style={{ color: Colors.accent }}>
                      {household.inviteCode}
                    </Text>
                    <Pressable
                      onPress={() => {
                        Share.share({
                          message: `Join my GarageVault household "${household.name}"!\n\nInvite Code: ${household.inviteCode}`,
                        });
                      }}
                      className="px-5 py-3 rounded-lg"
                      style={{ backgroundColor: Colors.accent }}
                    >
                      <Text className="font-semibold" style={{ color: Colors.textOnPrimary }}>
                        Share
                      </Text>
                    </Pressable>
                  </View>

                  <Text className="text-sm mb-2" style={{ color: Colors.textSecondary }}>
                    Connected Devices
                  </Text>
                  <Text className="text-xl font-semibold" style={{ color: Colors.textPrimary }}>
                    {members.length} {members.length === 1 ? "device" : "devices"}
                  </Text>
                </View>

                <View className="mt-4 p-4 rounded-xl" style={{ backgroundColor: Colors.gray100 }}>
                  <Text className="text-xs leading-5" style={{ color: Colors.textSecondary }}>
                    Share your invite code with family members to sync your inventory across devices. All household members can add, edit, and remove items.
                  </Text>
                </View>
              </>
            )}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

function SectionHeader({ title }: { title: string }) {
  return (
    <View className="px-6 pb-2">
      <Text className="text-xs font-semibold" style={{ color: Colors.textTertiary }}>
        {title}
      </Text>
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
  section: {
    backgroundColor: Colors.cardBackground,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    overflow: "hidden",
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.gray200,
    marginLeft: 58,
  },
  reportCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  reportDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.gray200,
  },
});
