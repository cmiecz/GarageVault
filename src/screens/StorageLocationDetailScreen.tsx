import React, { useMemo } from "react";
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
import { InventoryItem, StorageType } from "../types/inventory";
import { Image } from "expo-image";

const STORAGE_ICONS: Record<StorageType, keyof typeof Ionicons.glyphMap> = {
  packout: "cube",
  bin: "file-tray-stacked",
  drawer: "layers",
  shelf: "menu",
  cabinet: "archive",
  toolbox: "construct",
  other: "ellipsis-horizontal-circle",
};

export default function StorageLocationDetailScreen({ navigation, route }: any) {
  const insets = useSafeAreaInsets();
  const { locationId } = route.params;
  const getLocationById = useStorageStore((state) => state.getLocationById);
  const deleteLocation = useStorageStore((state) => state.deleteLocation);
  const items = useInventoryStore((state) => state.items);
  const location = getLocationById(locationId);

  const itemsInLocation = useMemo(() => {
    return items.filter(
      (item) => item.details.storageLocationId === locationId && !item.deletedAt
    );
  }, [items, locationId]);

  if (!location) {
    return (
      <View className="flex-1 bg-gray-50 items-center justify-center">
        <Text className="text-gray-500">Storage location not found</Text>
        <Pressable
          onPress={() => navigation.goBack()}
          className="mt-4 bg-blue-500 px-6 py-3 rounded-xl"
        >
          <Text className="text-white font-semibold">Go Back</Text>
        </Pressable>
      </View>
    );
  }

  const handleDelete = () => {
    if (itemsInLocation.length > 0) {
      Alert.alert(
        "Cannot Delete",
        `This storage location has ${itemsInLocation.length} item${itemsInLocation.length === 1 ? "" : "s"} assigned to it. Please reassign or remove items before deleting.`,
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
          onPress: async () => {
            await deleteLocation(location.id);
            navigation.goBack();
          },
        },
      ]
    );
  };

  const iconName = STORAGE_ICONS[location.type];
  const color = location.color || "#3B82F6";

  const renderItem = ({ item }: { item: InventoryItem }) => {
    const isLowStock = item.quantity <= item.threshold;

    return (
      <Pressable
        onPress={() => navigation.navigate("ItemDetail", { itemId: item.id })}
        className="mx-4 mb-3 bg-white rounded-2xl overflow-hidden flex-row"
        style={styles.card}
      >
        {item.imageUri ? (
          <Image
            source={{ uri: item.imageUri }}
            style={styles.itemImage}
            contentFit="cover"
          />
        ) : (
          <View
            className="bg-gray-100 items-center justify-center"
            style={styles.itemImage}
          >
            <Ionicons name="cube-outline" size={32} color="#9CA3AF" />
          </View>
        )}
        <View className="flex-1 p-3">
          <View className="flex-row justify-between items-start mb-1">
            <View className="flex-1 mr-2">
              <Text className="text-base font-semibold text-gray-900" numberOfLines={1}>
                {item.name}
              </Text>
              <Text className="text-xs text-gray-500">{item.category}</Text>
            </View>
            {isLowStock && (
              <View className="bg-red-100 px-2 py-0.5 rounded-full">
                <Text className="text-xs font-medium text-red-700">Low</Text>
              </View>
            )}
          </View>
          
          {/* Position if available */}
          {item.details.storagePosition && (
            <Text className="text-xs text-gray-600 mb-1">
              📍 {item.details.storagePosition}
            </Text>
          )}

          <View className="flex-row items-center mt-1">
            <Text className="text-sm font-medium text-gray-700">
              {item.quantity} {item.unit}
            </Text>
            <Text className="text-xs text-gray-400 ml-2">
              / {item.maxQuantity} {item.unit}
            </Text>
          </View>
        </View>
      </Pressable>
    );
  };

  const EmptyState = () => (
    <View className="flex-1 items-center justify-center px-8" style={{ marginTop: 60 }}>
      <View className="w-24 h-24 rounded-full bg-gray-100 items-center justify-center mb-4">
        <Ionicons name="cube-outline" size={48} color="#9CA3AF" />
      </View>
      <Text className="text-xl font-semibold text-gray-900 mb-2 text-center">
        No Items Yet
      </Text>
      <Text className="text-base text-gray-500 text-center mb-6">
        Add items to your inventory and assign them to this storage location
      </Text>
      <Pressable
        onPress={() => navigation.navigate("AddItem")}
        className="bg-blue-500 px-6 py-3 rounded-xl"
      >
        <Text className="text-white font-semibold">Add First Item</Text>
      </Pressable>
    </View>
  );

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View
        className="bg-white border-b border-gray-200"
        style={{ paddingTop: insets.top }}
      >
        <View className="px-4 py-3">
          <View className="flex-row items-center justify-between mb-3">
            <Pressable
              onPress={() => navigation.goBack()}
              className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center"
            >
              <Ionicons name="arrow-back" size={20} color="#111827" />
            </Pressable>

            <View className="flex-row gap-2">
              <Pressable
                onPress={() => navigation.navigate("QRCodeDisplay", { locationId: location.id })}
                className="w-10 h-10 rounded-full bg-blue-100 items-center justify-center"
              >
                <Ionicons name="qr-code" size={20} color="#3B82F6" />
              </Pressable>
              
              <Pressable
                onPress={() => navigation.navigate("AddStorageLocation", { locationId: location.id })}
                className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center"
              >
                <Ionicons name="create-outline" size={20} color="#111827" />
              </Pressable>

              <Pressable
                onPress={handleDelete}
                className="w-10 h-10 rounded-full bg-red-100 items-center justify-center"
              >
                <Ionicons name="trash-outline" size={20} color="#EF4444" />
              </Pressable>
            </View>
          </View>

          {/* Location Info */}
          <View className="flex-row items-center mb-3">
            <View
              className="w-16 h-16 rounded-2xl items-center justify-center mr-3"
              style={{ backgroundColor: `${color}15` }}
            >
              <Ionicons name={iconName} size={32} color={color} />
            </View>
            <View className="flex-1">
              <Text className="text-2xl font-bold text-gray-900">
                {location.name}
              </Text>
              <Text className="text-base text-gray-500 capitalize">
                {location.type.replace("_", " ")}
              </Text>
            </View>
          </View>

          {location.description && (
            <Text className="text-sm text-gray-600 mb-3">
              {location.description}
            </Text>
          )}

          {/* Item Count */}
          <View className="bg-gray-50 rounded-xl p-3">
            <Text className="text-sm font-medium text-gray-700">
              {itemsInLocation.length} {itemsInLocation.length === 1 ? "Item" : "Items"} in this location
            </Text>
          </View>
        </View>
      </View>

      {/* Items List */}
      {itemsInLocation.length === 0 ? (
        <EmptyState />
      ) : (
        <FlatList
          data={itemsInLocation}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingTop: 16, paddingBottom: insets.bottom + 24 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  itemImage: {
    width: 80,
    height: 80,
  },
});
