import React from "react";
import { View, Text, Pressable, ScrollView, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";
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

interface StorageLocationPickerProps {
  selectedLocationId?: string;
  onLocationSelect: (locationId: string | undefined) => void;
  storagePosition?: string;
  onPositionChange?: (position: string) => void;
  showPositionInput?: boolean;
}

export default function StorageLocationPicker({
  selectedLocationId,
  onLocationSelect,
  storagePosition,
  onPositionChange,
  showPositionInput = false,
}: StorageLocationPickerProps) {
  const allLocations = useStorageStore((state) => state.locations);
  const locations = allLocations.filter((loc) => !loc.deletedAt);

  const selectedLocation = locations.find((loc) => loc.id === selectedLocationId);

  if (locations.length === 0) {
    return (
      <View className="bg-gray-50 rounded-xl p-4 border border-dashed border-gray-300">
        <View className="flex-row items-center mb-2">
          <Ionicons name="information-circle-outline" size={20} color="#6B7280" />
          <Text className="text-sm font-medium text-gray-700 ml-2">
            No Storage Locations
          </Text>
        </View>
        <Text className="text-sm text-gray-600">
          Create storage locations to organize items by physical location
        </Text>
      </View>
    );
  }

  return (
    <View>
      {/* Selected Location Display */}
      {selectedLocation ? (
        <View className="mb-3">
          <View className="bg-blue-50 rounded-xl p-3 flex-row items-center justify-between">
            <View className="flex-row items-center flex-1">
              <View
                className="w-10 h-10 rounded-lg items-center justify-center mr-3"
                style={{ backgroundColor: selectedLocation.color || "#3B82F6" }}
              >
                <Ionicons
                  name={STORAGE_ICONS[selectedLocation.type]}
                  size={20}
                  color="white"
                />
              </View>
              <View className="flex-1">
                <Text className="text-sm font-semibold text-blue-900">
                  {selectedLocation.name}
                </Text>
                <Text className="text-xs text-blue-600 capitalize">
                  {selectedLocation.type.replace("_", " ")}
                </Text>
              </View>
            </View>
            <Pressable
              onPress={() => onLocationSelect(undefined)}
              className="w-8 h-8 rounded-full bg-blue-200 items-center justify-center"
            >
              <Ionicons name="close" size={16} color="#1E40AF" />
            </Pressable>
          </View>
        </View>
      ) : null}

      {/* Location Selection */}
      {!selectedLocation && (
        <View className="mb-3">
          <Text className="text-sm font-medium text-gray-700 mb-2">
            Select Storage Location (Optional)
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingRight: 16 }}
          >
            {locations.map((location) => {
              const color = location.color || "#3B82F6";
              return (
                <Pressable
                  key={location.id}
                  onPress={() => onLocationSelect(location.id)}
                  className="mr-3 items-center"
                  style={{ width: 80 }}
                >
                  <View
                    className="w-16 h-16 rounded-2xl items-center justify-center mb-2"
                    style={{ backgroundColor: `${color}15` }}
                  >
                    <Ionicons
                      name={STORAGE_ICONS[location.type]}
                      size={28}
                      color={color}
                    />
                  </View>
                  <Text
                    className="text-xs text-gray-700 text-center font-medium"
                    numberOfLines={2}
                  >
                    {location.name}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      )}

      {/* Position Input (optional) */}
      {showPositionInput && selectedLocation && onPositionChange && (
        <View>
          <Text className="text-sm font-medium text-gray-700 mb-2">
            Position (Optional)
          </Text>
          <TextInput
            value={storagePosition}
            onChangeText={onPositionChange}
            placeholder="e.g., Top drawer, Slot 3, Left side"
            className="text-base text-gray-900 bg-gray-50 px-4 py-3 rounded-xl"
          />
        </View>
      )}
    </View>
  );
}
