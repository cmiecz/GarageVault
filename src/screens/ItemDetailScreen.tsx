import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  Alert,
  Linking,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import Slider from "@react-native-community/slider";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useInventoryStore } from "../state/inventoryStore";
import { useStorageStore } from "../state/storageStore";
import { StorageType } from "../types/inventory";

const STORAGE_ICONS: Record<StorageType, keyof typeof Ionicons.glyphMap> = {
  packout: "cube",
  bin: "file-tray-stacked",
  drawer: "layers",
  shelf: "menu",
  cabinet: "archive",
  toolbox: "construct",
  other: "ellipsis-horizontal-circle",
};

export default function ItemDetailScreen({ route, navigation }: any) {
  const insets = useSafeAreaInsets();
  const { itemId } = route.params;
  const item = useInventoryStore((state) => state.getItemById(itemId));
  const updateQuantity = useInventoryStore((state) => state.updateQuantity);
  const deleteItem = useInventoryStore((state) => state.deleteItem);
  const getLocationById = useStorageStore((state) => state.getLocationById);

  const [quantity, setQuantity] = useState(item?.quantity || 0);

  // Update quantity when item changes or when screen comes into focus
  useEffect(() => {
    if (item) {
      setQuantity(item.quantity);
    }
  }, [item, item?.quantity, itemId]);

  // Also refresh when screen regains focus (after editing)
  useFocusEffect(
    React.useCallback(() => {
      if (item) {
        setQuantity(item.quantity);
      }
    }, [item, itemId])
  );

  if (!item) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <Text className="text-lg text-gray-500">Item not found</Text>
      </View>
    );
  }

  const isLowStock = quantity <= item.threshold;
  const percentRemaining = (quantity / item.maxQuantity) * 100;

  const handleQuantityChange = (value: number) => {
    // For paint, use precise decimals; for others, round to integers
    const isPaint = item.category === "Paint";
    
    if (isPaint) {
      // For paint, round to 2 decimal places for smooth slider
      const rounded = Math.round(value * 100) / 100;
      setQuantity(rounded);
    } else {
      // For non-paint items, use snap points
      const snapPoints = [
        0,
        Math.floor(item.maxQuantity * 0.25),
        Math.floor(item.maxQuantity * 0.5),
        Math.floor(item.maxQuantity * 0.75),
        item.maxQuantity,
      ];

      // Find closest snap point within 5% tolerance
      const tolerance = item.maxQuantity * 0.05;
      const closestSnap = snapPoints.find(
        (snap) => Math.abs(value - snap) < tolerance
      );

      const newQuantity = closestSnap !== undefined ? closestSnap : Math.round(value);
      setQuantity(newQuantity);
    }
  };

  const handleQuantityCommit = () => {
    updateQuantity(itemId, quantity);
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete Item",
      `Are you sure you want to delete ${item.name}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            deleteItem(itemId);
            navigation.goBack();
          },
        },
      ]
    );
  };

  const openPurchaseLink = (store: string, searchQuery: string) => {
    const urls: Record<string, string> = {
      "Home Depot": `https://www.homedepot.com/s/${encodeURIComponent(searchQuery)}`,
      Lowes: `https://www.lowes.com/search?searchTerm=${encodeURIComponent(searchQuery)}`,
      Amazon: `https://www.amazon.com/s?k=${encodeURIComponent(searchQuery)}`,
    };

    const url = urls[store];
    if (url) {
      Linking.openURL(url);
    }
  };

  const searchQuery = `${item.details.brand || ""} ${item.name} ${item.details.size || ""}`.trim();

  return (
    <View className="flex-1 bg-gray-50" style={{ paddingTop: insets.top }}>
      <View className="flex-row items-center justify-between px-4 py-4 bg-white border-b border-gray-200">
        <Pressable onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#374151" />
        </Pressable>
        <View className="flex-row items-center">
          <Pressable
            onPress={() => navigation.navigate("EditItem", { itemId })}
            className="mr-4"
          >
            <Ionicons name="pencil" size={24} color="#3B82F6" />
          </Pressable>
          <Pressable onPress={handleDelete}>
            <Ionicons name="trash-outline" size={24} color="#EF4444" />
          </Pressable>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
        showsVerticalScrollIndicator={false}
      >
        {item.imageUri && (
          <Image
            source={{ uri: item.imageUri }}
            style={styles.image}
            contentFit="cover"
          />
        )}

        <View className="px-4 mt-4">
          <View className="flex-row items-start justify-between mb-2">
            <Text className="text-3xl font-bold text-gray-900 flex-1">
              {item.name}
            </Text>
            {isLowStock && (
              <View className="bg-red-100 px-3 py-1.5 rounded-full ml-2">
                <Text className="text-sm font-semibold text-red-700">
                  Low Stock
                </Text>
              </View>
            )}
          </View>
          <Text className="text-lg text-gray-500 mb-1">{item.category}</Text>
          {item.description && (
            <Text className="text-base text-gray-600 mt-2">
              {item.description}
            </Text>
          )}
          
          {/* Paint Room Tags - Prominent Display */}
          {item.category === "Paint" && item.details.rooms && item.details.rooms.length > 0 && (
            <View className="mt-4 bg-blue-50 rounded-xl p-4 border border-blue-200">
              <View className="flex-row items-center mb-2">
                <Ionicons name="home" size={18} color="#3B82F6" />
                <Text className="text-sm font-semibold text-blue-900 ml-2">
                  Used in Rooms
                </Text>
              </View>
              <View className="flex-row flex-wrap">
                {item.details.rooms.map((room, index) => (
                  <View
                    key={index}
                    className="bg-blue-500 rounded-full px-3 py-1.5 mr-2 mb-2"
                  >
                    <Text className="text-white font-medium text-sm">{room}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
          
          {/* Storage Location Card - For non-Paint items */}
          {item.category !== "Paint" && item.details.storageLocationId && (() => {
            const location = getLocationById(item.details.storageLocationId);
            if (!location) return null;
            
            const iconName = STORAGE_ICONS[location.type];
            const color = location.color || "#3B82F6";
            
            return (
              <Pressable
                onPress={() => navigation.navigate("StorageLocationDetail", { locationId: location.id })}
                className="mt-4 bg-purple-50 rounded-xl p-4 border border-purple-200"
              >
                <View className="flex-row items-center mb-2">
                  <View
                    className="w-10 h-10 rounded-lg items-center justify-center mr-3"
                    style={{ backgroundColor: `${color}20` }}
                  >
                    <Ionicons name={iconName} size={20} color={color} />
                  </View>
                  <View className="flex-1">
                    <Text className="text-sm font-semibold text-purple-900">
                      Stored In
                    </Text>
                    <Text className="text-base font-bold text-purple-700">
                      {location.name}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#8B5CF6" />
                </View>
                {item.details.storagePosition && (
                  <Text className="text-sm text-purple-600 ml-13">
                    📍 {item.details.storagePosition}
                  </Text>
                )}
              </Pressable>
            );
          })()}
        </View>

        <View className="mx-4 mt-6 bg-white rounded-2xl p-5" style={styles.card}>
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-lg font-semibold text-gray-900">
              Current Stock
            </Text>
            <Text className="text-3xl font-bold text-blue-500">
              {item.category === "Paint" ? quantity.toFixed(2) : quantity} <Text className="text-lg text-gray-500">{item.unit}</Text>
            </Text>
          </View>

          <View className="h-2 bg-gray-200 rounded-full overflow-hidden mb-6">
            <View
              className={`h-full ${isLowStock ? "bg-red-500" : "bg-blue-500"}`}
              style={{ width: `${percentRemaining}%` }}
            />
          </View>

          <Text className="text-sm font-medium text-gray-700 mb-3">
            Adjust Quantity
          </Text>
          
          {/* Slider markers */}
          <View className="flex-row justify-between px-1 mb-2">
            <View className="items-center">
              <View className="w-0.5 h-3 bg-gray-400" />
              <Text className="text-xs text-gray-400 mt-1">0</Text>
            </View>
            <View className="items-center">
              <View className="w-0.5 h-3 bg-gray-400" />
              <Text className="text-xs text-gray-400 mt-1">¼</Text>
            </View>
            <View className="items-center">
              <View className="w-0.5 h-3 bg-gray-400" />
              <Text className="text-xs text-gray-400 mt-1">½</Text>
            </View>
            <View className="items-center">
              <View className="w-0.5 h-3 bg-gray-400" />
              <Text className="text-xs text-gray-400 mt-1">¾</Text>
            </View>
            <View className="items-center">
              <View className="w-0.5 h-3 bg-gray-400" />
              <Text className="text-xs text-gray-400 mt-1">Max</Text>
            </View>
          </View>
          
          <Slider
            key={`slider-${itemId}-${item.quantity}`}
            style={{ width: "100%", height: 40 }}
            minimumValue={0}
            maximumValue={item.maxQuantity}
            step={item.category === "Paint" ? item.maxQuantity / 100 : 1}
            value={quantity}
            onValueChange={handleQuantityChange}
            onSlidingComplete={handleQuantityCommit}
            minimumTrackTintColor="#3B82F6"
            maximumTrackTintColor="#E5E7EB"
            thumbTintColor="#3B82F6"
          />

          <View className="flex-row justify-between mt-2 px-1">
            <Text className="text-sm font-medium text-gray-600">0</Text>
            <Text className="text-sm font-medium text-gray-600">
              {item.category === "Paint" 
                ? (Math.round(item.maxQuantity * 0.25 * 100) / 100).toFixed(2)
                : Math.floor(item.maxQuantity * 0.25)}
            </Text>
            <Text className="text-sm font-medium text-gray-600">
              {item.category === "Paint" 
                ? (Math.round(item.maxQuantity * 0.5 * 100) / 100).toFixed(2)
                : Math.floor(item.maxQuantity * 0.5)}
            </Text>
            <Text className="text-sm font-medium text-gray-600">
              {item.category === "Paint" 
                ? (Math.round(item.maxQuantity * 0.75 * 100) / 100).toFixed(2)
                : Math.floor(item.maxQuantity * 0.75)}
            </Text>
            <Text className="text-sm font-medium text-gray-600">
              {item.category === "Paint" 
                ? item.maxQuantity.toFixed(2)
                : item.maxQuantity}
            </Text>
          </View>

          <View className="flex-row mt-4">
            <Pressable
              onPress={() => {
                const newQty = Math.max(0, quantity - (item.category === "Paint" ? 0.1 : 1));
                const rounded = item.category === "Paint" ? Math.round(newQty * 10) / 10 : newQty;
                setQuantity(rounded);
                updateQuantity(itemId, rounded);
              }}
              className="bg-gray-100 px-4 py-3 rounded-xl mr-2"
            >
              <Text className="text-center text-gray-700 font-semibold text-base">
                {item.category === "Paint" ? "-0.1" : "-1"}
              </Text>
            </Pressable>
            
            <Pressable
              onPress={() => {
                const newQty = item.category === "Paint" 
                  ? Math.round(item.maxQuantity * 0.25 * 100) / 100
                  : Math.floor(item.maxQuantity * 0.25);
                setQuantity(newQty);
                updateQuantity(itemId, newQty);
              }}
              className="flex-1 bg-gray-100 py-3 rounded-xl mr-2"
            >
              <Text className="text-center text-gray-700 font-medium text-sm">
                ¼ Full
              </Text>
            </Pressable>
            
            <Pressable
              onPress={() => {
                const newQty = item.category === "Paint" 
                  ? Math.round(item.maxQuantity * 0.5 * 100) / 100
                  : Math.floor(item.maxQuantity * 0.5);
                setQuantity(newQty);
                updateQuantity(itemId, newQty);
              }}
              className="flex-1 bg-gray-100 py-3 rounded-xl mr-2"
            >
              <Text className="text-center text-gray-700 font-medium text-sm">
                ½ Full
              </Text>
            </Pressable>
            
            <Pressable
              onPress={() => {
                const newQty = item.category === "Paint" 
                  ? Math.round(item.maxQuantity * 0.75 * 100) / 100
                  : Math.floor(item.maxQuantity * 0.75);
                setQuantity(newQty);
                updateQuantity(itemId, newQty);
              }}
              className="flex-1 bg-gray-100 py-3 rounded-xl mr-2"
            >
              <Text className="text-center text-gray-700 font-medium text-sm">
                ¾ Full
              </Text>
            </Pressable>
            
            <Pressable
              onPress={() => {
                const newQty = Math.min(item.maxQuantity, quantity + (item.category === "Paint" ? 0.1 : 1));
                const rounded = item.category === "Paint" ? Math.round(newQty * 10) / 10 : newQty;
                setQuantity(rounded);
                updateQuantity(itemId, rounded);
              }}
              className="bg-blue-500 px-4 py-3 rounded-xl"
            >
              <Text className="text-center text-white font-semibold text-base">
                {item.category === "Paint" ? "+0.1" : "+1"}
              </Text>
            </Pressable>
          </View>
        </View>

        {Object.keys(item.details).some((key) => item.details[key]) && (
          <View className="mx-4 mt-4 bg-white rounded-2xl p-5" style={styles.card}>
            <Text className="text-lg font-semibold text-gray-900 mb-4">
              Details
            </Text>
            {item.details.brand && (
              <DetailRow label="Brand" value={item.details.brand} />
            )}
            {item.details.size && (
              <DetailRow label="Size" value={item.details.size} />
            )}
            {item.details.color && (
              <DetailRow label="Color" value={item.details.color} />
            )}
            {item.details.type && (
              <DetailRow label="Type" value={item.details.type} />
            )}
            {item.details.material && (
              <DetailRow label="Material" value={item.details.material} />
            )}
            {item.details.rooms && item.details.rooms.length > 0 && (
              <View className="pt-4 border-t border-gray-100 mt-4">
                <Text className="text-sm font-medium text-gray-500 mb-2">Rooms</Text>
                <View className="flex-row flex-wrap">
                  {item.details.rooms.map((room, index) => (
                    <View
                      key={index}
                      className="bg-blue-100 rounded-full px-3 py-1.5 mr-2 mb-2"
                    >
                      <Text className="text-blue-700 font-medium text-sm">{room}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>
        )}

        <View className="mx-4 mt-4 bg-white rounded-2xl p-5" style={styles.card}>
          <Text className="text-lg font-semibold text-gray-900 mb-4">
            Thresholds
          </Text>
          <DetailRow
            label="Low Stock Alert"
            value={`${item.threshold} ${item.unit}`}
          />
          <DetailRow
            label="Maximum Capacity"
            value={`${item.maxQuantity} ${item.unit}`}
          />
        </View>

        <View className="mx-4 mt-4 bg-white rounded-2xl p-5" style={styles.card}>
          <View className="flex-row items-center mb-3">
            <Ionicons name="cart" size={24} color="#3B82F6" />
            <Text className="text-lg font-semibold text-gray-900 ml-2">
              Order More
            </Text>
          </View>
          {isLowStock && (
            <Text className="text-sm text-red-600 mb-4 font-medium">
              ⚠️ Stock is running low! Consider restocking soon.
            </Text>
          )}
          <Text className="text-sm text-gray-600 mb-4">
            Purchase from these retailers:
          </Text>

          <Pressable
            onPress={() => openPurchaseLink("Home Depot", searchQuery)}
            className="flex-row items-center justify-between bg-orange-50 p-4 rounded-xl mb-3"
          >
            <Text className="text-base font-semibold text-orange-700">
              Home Depot
            </Text>
            <Ionicons name="arrow-forward" size={20} color="#C2410C" />
          </Pressable>

          <Pressable
            onPress={() => openPurchaseLink("Lowes", searchQuery)}
            className="flex-row items-center justify-between bg-blue-50 p-4 rounded-xl mb-3"
          >
            <Text className="text-base font-semibold text-blue-700">
              Lowes
            </Text>
            <Ionicons name="arrow-forward" size={20} color="#1D4ED8" />
          </Pressable>

          <Pressable
            onPress={() => openPurchaseLink("Amazon", searchQuery)}
            className="flex-row items-center justify-between bg-gray-50 p-4 rounded-xl"
          >
            <Text className="text-base font-semibold text-gray-700">
              Amazon
            </Text>
            <Ionicons name="arrow-forward" size={20} color="#374151" />
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row justify-between py-2">
      <Text className="text-sm text-gray-500">{label}</Text>
      <Text className="text-sm font-medium text-gray-900">{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  image: {
    width: "100%",
    height: 250,
  },
  card: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
});
