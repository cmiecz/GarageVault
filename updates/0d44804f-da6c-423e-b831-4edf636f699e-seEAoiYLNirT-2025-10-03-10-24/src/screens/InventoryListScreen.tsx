import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useInventoryStore } from "../state/inventoryStore";
import { useStorageStore } from "../state/storageStore";
import { InventoryItem, StorageType } from "../types/inventory";
import { Image } from "expo-image";
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

export default function InventoryListScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const items = useInventoryStore((state) => state.items);
  const allLocations = useStorageStore((state) => state.locations);
  const locations = allLocations.filter((loc) => !loc.deletedAt);
  const getLocationById = useStorageStore((state) => state.getLocationById);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const categories = useMemo(() => {
    const cats = new Set(items.map((item) => item.category));
    return Array.from(cats);
  }, [items]);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch = item.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategories.length > 0
        ? selectedCategories.includes(item.category)
        : true;
      return matchesSearch && matchesCategory;
    });
  }, [items, searchQuery, selectedCategories]);

  const lowStockItems = items.filter((item) => item.quantity <= item.threshold);

  const itemsByStorage = useMemo(() => {
    const grouped: { [key: string]: InventoryItem[] } = {};
    locations.forEach((loc) => {
      grouped[loc.id] = items.filter(
        (item) => item.details.storageLocationId === loc.id
      );
    });
    return grouped;
  }, [items, locations]);

  return (
    <View className="flex-1" style={{ backgroundColor: Colors.background }}>
      {/* Blue Header */}
      <View
        style={[styles.header, { paddingTop: insets.top + 16 }]}
      >
        <View className="px-5 pb-5">
          <View className="flex-row items-center justify-between mb-6">
            <View>
              <Text className="text-3xl font-bold tracking-tight" style={{ color: Colors.textOnPrimary, letterSpacing: -0.5 }}>
                Garage Vault
              </Text>
              <Text className="text-sm mt-0.5" style={{ color: "rgba(255, 255, 255, 0.75)", fontWeight: "400" }}>
                Inventory Unlocked
              </Text>
            </View>
            <Pressable onPress={() => navigation.navigate("Settings")}>
              <Ionicons name="settings-outline" size={26} color={Colors.textOnPrimary} />
            </Pressable>
          </View>

          {/* Search Bar */}
          <View className="flex-row items-center rounded-xl px-4 py-3" style={{ backgroundColor: "rgba(255, 255, 255, 0.2)" }}>
            <Ionicons name="search" size={20} color={Colors.textOnPrimary} />
            <TextInput
              className="flex-1 ml-3 text-base"
              style={{ color: Colors.textOnPrimary }}
              placeholder="Search inventory..."
              placeholderTextColor="rgba(255, 255, 255, 0.6)"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <Pressable onPress={() => setSearchQuery("")}>
                <Ionicons name="close-circle" size={20} color={Colors.textOnPrimary} />
              </Pressable>
            )}
          </View>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Low Stock Alert Card */}
        {lowStockItems.length > 0 && (
          <View className="rounded-2xl p-5 mb-4" style={[styles.card, { marginTop: 16 }]}>
            <View className="flex-row items-center justify-between mb-2">
              <View className="flex-row items-center flex-1">
                <View
                  className="w-10 h-10 rounded-full items-center justify-center mr-3"
                  style={{ backgroundColor: "#FEE2E2" }}
                >
                  <Ionicons name="alert-circle" size={24} color={Colors.error} />
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-medium" style={{ color: Colors.textSecondary }}>
                    Low stock alert
                  </Text>
                  <Text className="text-lg font-semibold" style={{ color: Colors.textPrimary }}>
                    {lowStockItems.length} items need attention
                  </Text>
                </View>
              </View>
              <View
                className="px-3 py-1 rounded-full"
                style={{ backgroundColor: "#FEE2E2" }}
              >
                <Text className="text-xs font-semibold" style={{ color: Colors.error }}>
                  Alert
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Combined Categories & Storage Locations Section */}
        {(categories.length > 0 || locations.length > 0) && (
          <View className="rounded-2xl overflow-hidden mb-4" style={styles.card}>
            {/* Categories Section */}
            {categories.length > 0 && (
              <>
                <View className="px-5 py-4">
                  <Text className="text-base font-semibold mb-3" style={{ color: Colors.textPrimary }}>
                    Categories
                  </Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ gap: 8 }}
                  >
                    {categories.map((cat) => {
                      const isSelected = selectedCategories.includes(cat);
                      return (
                        <Pressable
                          key={cat}
                          onPress={() => {
                            if (isSelected) {
                              setSelectedCategories(selectedCategories.filter(c => c !== cat));
                            } else {
                              setSelectedCategories([...selectedCategories, cat]);
                            }
                          }}
                          className="px-4 py-2 rounded-full border"
                          style={{
                            backgroundColor: isSelected ? Colors.accent : Colors.cardBackground,
                            borderColor: isSelected ? Colors.accent : Colors.gray200,
                          }}
                        >
                          <Text
                            className="text-sm font-medium"
                            style={{ color: isSelected ? Colors.textOnPrimary : Colors.textSecondary }}
                          >
                            {cat}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </ScrollView>
                </View>
                {locations.length > 0 && <View style={styles.divider} />}
              </>
            )}

            {/* Storage Locations Section */}
            {locations.length > 0 && (
              <View className="px-5 py-4">
                <View className="flex-row items-center justify-between mb-3">
                  <Text className="text-base font-semibold" style={{ color: Colors.textPrimary }}>
                    Storage Locations
                  </Text>
                  <Pressable onPress={() => navigation.navigate("StorageLocations")}>
                    <Text className="text-sm font-medium" style={{ color: Colors.accent }}>
                      View All
                    </Text>
                  </Pressable>
                </View>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ gap: 12 }}
                >
                  {locations.slice(0, 5).map((loc) => {
                    const itemCount = itemsByStorage[loc.id]?.length || 0;
                    return (
                      <Pressable
                        key={loc.id}
                        onPress={() =>
                          navigation.navigate("StorageLocationDetail", {
                            locationId: loc.id,
                          })
                        }
                        className="items-center"
                        style={{ width: 80 }}
                      >
                        <View
                          className="w-14 h-14 rounded-2xl items-center justify-center mb-2"
                          style={{ backgroundColor: `${loc.color || Colors.accent}20` }}
                        >
                          <Ionicons
                            name={STORAGE_ICONS[loc.type]}
                            size={24}
                            color={loc.color || Colors.accent}
                          />
                        </View>
                        <Text
                          className="text-xs font-medium text-center"
                          numberOfLines={2}
                          style={{ color: Colors.textPrimary }}
                        >
                          {loc.name}
                        </Text>
                        <Text className="text-xs text-center mt-0.5" style={{ color: Colors.textSecondary }}>
                          {itemCount} item{itemCount !== 1 ? "s" : ""}
                        </Text>
                      </Pressable>
                    );
                  })}
                </ScrollView>
              </View>
            )}
          </View>
        )}

        {/* Inventory Items Card */}
        <View className="rounded-2xl overflow-hidden mb-4" style={styles.card}>
          <View className="px-5 py-4 border-b" style={{ borderBottomColor: Colors.gray100 }}>
            <Text className="text-lg font-semibold" style={{ color: Colors.textPrimary }}>
              Inventory Items
            </Text>
            <Text className="text-sm mt-0.5" style={{ color: Colors.textSecondary }}>
              {filteredItems.length} {filteredItems.length === 1 ? "item" : "items"}
            </Text>
          </View>

          {filteredItems.length === 0 ? (
            <View className="px-5 py-8 items-center">
              <Ionicons name="cube-outline" size={48} color={Colors.gray300} />
              <Text className="text-base font-medium mt-3" style={{ color: Colors.textTertiary }}>
                {items.length === 0 ? "No items yet" : "No items match your search"}
              </Text>
              <Text className="text-sm mt-1 text-center" style={{ color: Colors.textTertiary }}>
                {items.length === 0 ? "Tap the scan button to add items" : "Try adjusting your filters"}
              </Text>
            </View>
          ) : (
            filteredItems.map((item, index) => {
              const isLowStock = item.quantity <= item.threshold;
              const storageLocation = item.details.storageLocationId
                ? getLocationById(item.details.storageLocationId)
                : null;

              return (
                <View key={item.id}>
                  {index > 0 && <View style={styles.divider} />}
                  <Pressable
                    onPress={() =>
                      navigation.navigate("ItemDetail", { itemId: item.id })
                    }
                    className="px-5 py-4 flex-row items-center"
                  >
                    {item.imageUri ? (
                      <Image
                        source={{ uri: item.imageUri }}
                        style={styles.itemImage}
                        contentFit="cover"
                      />
                    ) : (
                      <View
                        className="items-center justify-center rounded-xl"
                        style={[styles.itemImage, { backgroundColor: Colors.gray100 }]}
                      >
                        <Ionicons name="cube-outline" size={24} color={Colors.gray400} />
                      </View>
                    )}
                    <View className="flex-1 ml-3">
                      <View className="flex-row items-start justify-between mb-1">
                        <Text
                          className="text-base font-semibold flex-1"
                          numberOfLines={1}
                          style={{ color: Colors.textPrimary }}
                        >
                          {item.name}
                        </Text>
                        {isLowStock && (
                          <View
                            className="px-2 py-0.5 rounded-full ml-2"
                            style={{ backgroundColor: "#FEE2E2" }}
                          >
                            <Text className="text-xs font-semibold" style={{ color: Colors.error }}>
                              Low
                            </Text>
                          </View>
                        )}
                      </View>
                      
                      {/* Size and Details Row */}
                      <View className="flex-row items-center mb-2 flex-wrap">
                        {item.details.size && (
                          <View className="flex-row items-center mr-3">
                            <Ionicons name="resize-outline" size={14} color={Colors.accent} />
                            <Text className="text-sm font-semibold ml-1" style={{ color: Colors.accent }}>
                              {item.details.size}
                            </Text>
                          </View>
                        )}
                        <Text className="text-sm" style={{ color: Colors.textSecondary }}>
                          {item.quantity} {item.unit} • {item.category}
                        </Text>
                      </View>
                      
                      {/* Progress bar showing quantity remaining */}
                      <View className="flex-row items-center mb-2">
                        <View className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <View
                            className="h-full"
                            style={{ 
                              width: `${Math.min((item.quantity / item.maxQuantity) * 100, 100)}%`,
                              backgroundColor: 
                                (item.quantity / item.maxQuantity) > 0.5 ? "#10B981" : // Green (>50%)
                                (item.quantity / item.maxQuantity) > 0.25 ? "#F59E0B" : // Yellow (25-50%)
                                "#EF4444" // Red (≤25%)
                            }}
                          />
                        </View>
                        <Text className="text-xs ml-2" style={{ color: Colors.textTertiary }}>
                          {Math.round((item.quantity / item.maxQuantity) * 100)}%
                        </Text>
                      </View>
                      
                      {/* Paint rooms or storage location */}
                      {item.category === "Paint" && item.details.rooms && item.details.rooms.length > 0 ? (
                        <View className="flex-row flex-wrap gap-1">
                          {item.details.rooms.slice(0, 2).map((room, index) => (
                            <View
                              key={index}
                              className="px-2 py-0.5 rounded-full"
                              style={{ backgroundColor: `${Colors.accent}15` }}
                            >
                              <Text className="text-xs font-medium" style={{ color: Colors.accent }}>
                                {room}
                              </Text>
                            </View>
                          ))}
                          {item.details.rooms.length > 2 && (
                            <View
                              className="px-2 py-0.5 rounded-full"
                              style={{ backgroundColor: `${Colors.accent}15` }}
                            >
                              <Text className="text-xs font-medium" style={{ color: Colors.accent }}>
                                +{item.details.rooms.length - 2}
                              </Text>
                            </View>
                          )}
                        </View>
                      ) : storageLocation ? (
                        <View
                          className="flex-row items-center self-start px-2 py-1 rounded-full"
                          style={{ backgroundColor: `${storageLocation.color || Colors.accent}15` }}
                        >
                          <Ionicons
                            name={STORAGE_ICONS[storageLocation.type]}
                            size={10}
                            color={storageLocation.color || Colors.accent}
                          />
                          <Text
                            className="text-xs font-medium ml-1"
                            style={{ color: storageLocation.color || Colors.accent }}
                          >
                            {storageLocation.name}
                          </Text>
                        </View>
                      ) : null}
                    </View>
                  </Pressable>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>
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
  itemImage: {
    width: 56,
    height: 56,
    borderRadius: 12,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.gray200,
    marginLeft: 68,
  },
});
