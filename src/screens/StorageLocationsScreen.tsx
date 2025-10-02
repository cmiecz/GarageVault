import React from "react";
import {
  View,
  Text,
  Pressable,
  FlatList,
  StyleSheet,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useStorageStore } from "../state/storageStore";
import { useInventoryStore } from "../state/inventoryStore";
import { StorageLocation, StorageType } from "../types/inventory";
import { Colors } from "../utils/colors";

const STORAGE_ICONS: Record<StorageType, keyof typeof Ionicons.glyphMap> = {
  packout: "cube",
  bin: "file-tray-stacked",
  drawer: "layers",
  shelf: "menu",
  cabinet: "archive",
  toolbox: "construct",
  other: "ellipsis-horizontal-circle",
};

const STORAGE_COLORS: Record<StorageType, string> = {
  packout: "#EF4444", // red
  bin: "#3B82F6", // blue
  drawer: "#8B5CF6", // purple
  shelf: "#10B981", // green
  cabinet: "#F59E0B", // amber
  toolbox: "#6366F1", // indigo
  other: "#6B7280", // gray
};

export default function StorageLocationsScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const allLocations = useStorageStore((state) => state.locations);
  const locations = allLocations.filter(loc => !loc.deletedAt);
  const deleteLocation = useStorageStore((state) => state.deleteLocation);
  const items = useInventoryStore((state) => state.items);

  const getItemCountForLocation = (locationId: string): number => {
    return items.filter(
      (item) => item.details.storageLocationId === locationId && !item.deletedAt
    ).length;
  };

  const handleDeleteLocation = (location: StorageLocation) => {
    const itemCount = getItemCountForLocation(location.id);
    
    if (itemCount > 0) {
      Alert.alert(
        "Cannot Delete",
        `This storage location has ${itemCount} item${itemCount === 1 ? "" : "s"} assigned to it. Please reassign or remove items before deleting.`,
        [{ text: "OK" }]
      );
      return;
    }

    Alert.alert(
      "Delete Storage Location",
      `Are you sure you want to delete "${location.name}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteLocation(location.id),
        },
      ]
    );
  };

  const renderLocation = ({ item, index }: { item: StorageLocation; index: number }) => {
    const itemCount = getItemCountForLocation(item.id);
    const iconName = STORAGE_ICONS[item.type];
    const color = item.color || STORAGE_COLORS[item.type];

    return (
      <View>
        {index > 0 && <View style={styles.divider} />}
        <Pressable
          onPress={() =>
            navigation.navigate("StorageLocationDetail", {
              locationId: item.id,
            })
          }
          onLongPress={() => handleDeleteLocation(item)}
          className="px-5 py-4 flex-row items-center"
        >
          <View
            className="w-12 h-12 rounded-full items-center justify-center mr-4"
            style={{ backgroundColor: `${color}20` }}
          >
            <Ionicons name={iconName} size={24} color={color} />
          </View>
          
          <View className="flex-1">
            <Text className="text-base font-semibold mb-0.5" style={{ color: Colors.textPrimary }}>
              {item.name}
            </Text>
            <Text className="text-sm" style={{ color: Colors.textSecondary }}>
              {itemCount} {itemCount === 1 ? "item" : "items"} • {item.type.replace("_", " ")}
            </Text>
            {item.description && (
              <Text className="text-xs mt-1" style={{ color: Colors.textTertiary }} numberOfLines={1}>
                {item.description}
              </Text>
            )}
          </View>

          <Pressable
            onPress={() =>
              navigation.navigate("QRCodeDisplay", { locationId: item.id })
            }
            className="w-10 h-10 rounded-full items-center justify-center ml-2"
            style={{ backgroundColor: Colors.gray100 }}
          >
            <Ionicons name="qr-code" size={18} color={Colors.textSecondary} />
          </Pressable>

          <Ionicons name="chevron-forward" size={20} color={Colors.textTertiary} className="ml-2" />
        </Pressable>
      </View>
    );
  };

  return (
    <View className="flex-1" style={{ backgroundColor: Colors.background }}>
      {/* Teal Header */}
      <View
        style={[styles.header, { paddingTop: insets.top + 16 }]}
      >
        <View className="px-5 pb-5">
          <View className="flex-row items-center justify-between mb-2">
            <Pressable
              onPress={() => navigation.goBack()}
              className="w-10 h-10 rounded-full items-center justify-center"
              style={{ backgroundColor: "rgba(255, 255, 255, 0.2)" }}
            >
              <Ionicons name="arrow-back" size={22} color={Colors.textOnPrimary} />
            </Pressable>

            <Text className="text-lg font-semibold" style={{ color: Colors.textOnPrimary }}>
              Storage Locations
            </Text>

            <Pressable
              onPress={() => navigation.navigate("AddStorageLocation")}
              className="w-10 h-10 rounded-full items-center justify-center"
              style={{ backgroundColor: "rgba(255, 255, 255, 0.2)" }}
            >
              <Ionicons name="add" size={24} color={Colors.textOnPrimary} />
            </Pressable>
          </View>
        </View>
      </View>

      {locations.length === 0 ? (
        <View className="flex-1 items-center justify-center px-8">
          <View
            className="w-20 h-20 rounded-full items-center justify-center mb-4"
            style={{ backgroundColor: Colors.accentLight }}
          >
            <Ionicons name="cube-outline" size={40} color={Colors.accent} />
          </View>
          <Text className="text-xl font-bold mb-2 text-center" style={{ color: Colors.textPrimary }}>
            No Storage Locations
          </Text>
          <Text className="text-base text-center mb-6" style={{ color: Colors.textSecondary }}>
            Create storage locations to organize your inventory with QR codes
          </Text>
          <Pressable
            onPress={() => navigation.navigate("AddStorageLocation")}
            className="px-6 py-3 rounded-xl"
            style={[styles.button, { backgroundColor: Colors.accent }]}
          >
            <Text className="font-semibold text-base" style={{ color: Colors.textOnPrimary }}>
              Add Storage Location
            </Text>
          </Pressable>
        </View>
      ) : (
        <View className="flex-1 px-4 pt-4">
          <View className="rounded-2xl overflow-hidden mb-4" style={styles.card}>
            <View className="px-5 py-4 border-b" style={{ borderBottomColor: Colors.gray100 }}>
              <Text className="text-lg font-semibold" style={{ color: Colors.textPrimary }}>
                All Locations
              </Text>
              <Text className="text-sm mt-0.5" style={{ color: Colors.textSecondary }}>
                {locations.length} {locations.length === 1 ? "location" : "locations"}
              </Text>
            </View>
            <FlatList
              data={locations}
              renderItem={renderLocation}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{ paddingBottom: 120 }}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </View>
      )}
    </View>
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
  button: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.gray200,
    marginLeft: 72,
  },
});
