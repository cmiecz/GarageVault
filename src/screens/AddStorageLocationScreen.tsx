import React, { useState } from "react";
import {
  View,
  Text,
  Pressable,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useStorageStore } from "../state/storageStore";
import { useHouseholdStore } from "../state/householdStore";
import { StorageType } from "../types/inventory";

const STORAGE_TYPES: { type: StorageType; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { type: "packout", label: "Packout", icon: "cube" },
  { type: "bin", label: "Bin", icon: "file-tray-stacked" },
  { type: "drawer", label: "Drawer", icon: "layers" },
  { type: "shelf", label: "Shelf", icon: "menu" },
  { type: "cabinet", label: "Cabinet", icon: "archive" },
  { type: "toolbox", label: "Toolbox", icon: "construct" },
  { type: "other", label: "Other", icon: "ellipsis-horizontal-circle" },
];

const COLOR_OPTIONS = [
  { color: "#EF4444", label: "Red" },
  { color: "#F59E0B", label: "Orange" },
  { color: "#10B981", label: "Green" },
  { color: "#3B82F6", label: "Blue" },
  { color: "#8B5CF6", label: "Purple" },
  { color: "#6366F1", label: "Indigo" },
  { color: "#EC4899", label: "Pink" },
  { color: "#6B7280", label: "Gray" },
];

export default function AddStorageLocationScreen({ navigation, route }: any) {
  const insets = useSafeAreaInsets();
  const addLocation = useStorageStore((state) => state.addLocation);
  const updateLocation = useStorageStore((state) => state.updateLocation);
  const getLocationById = useStorageStore((state) => state.getLocationById);
  const household = useHouseholdStore((state) => state.household);

  const editingLocationId = route.params?.locationId;
  const editingLocation = editingLocationId ? getLocationById(editingLocationId) : null;
  const isEditing = !!editingLocation;

  const [name, setName] = useState(editingLocation?.name || "");
  const [type, setType] = useState<StorageType>(editingLocation?.type || "bin");
  const [description, setDescription] = useState(editingLocation?.description || "");
  const [selectedColor, setSelectedColor] = useState(editingLocation?.color || "#3B82F6");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      return;
    }

    setIsSubmitting(true);
    try {
      if (isEditing && editingLocation) {
        await updateLocation(editingLocation.id, {
          name: name.trim(),
          type,
          description: description.trim() || undefined,
          color: selectedColor,
        });
      } else {
        await addLocation(
          {
            name: name.trim(),
            type,
            description: description.trim() || undefined,
            color: selectedColor,
          },
          household?.id
        );
      }
      navigation.goBack();
    } catch (error) {
      console.error("Error saving location:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const canSave = name.trim().length > 0;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-gray-50"
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View className="flex-1">
          {/* Header */}
          <View
            className="bg-white border-b border-gray-200"
            style={{ paddingTop: insets.top }}
          >
            <View className="flex-row items-center justify-between px-4 py-3">
              <Pressable
                onPress={() => navigation.goBack()}
                className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center"
              >
                <Ionicons name="close" size={20} color="#111827" />
              </Pressable>

              <Text className="text-lg font-semibold text-gray-900">
                {isEditing ? "Edit Location" : "New Storage Location"}
              </Text>

              <Pressable
                onPress={handleSave}
                disabled={!canSave || isSubmitting}
                className={`px-4 py-2 rounded-lg ${
                  canSave && !isSubmitting ? "bg-blue-500" : "bg-gray-200"
                }`}
              >
                <Text
                  className={`font-semibold ${
                    canSave && !isSubmitting ? "text-white" : "text-gray-400"
                  }`}
                >
                  {isEditing ? "Save" : "Create"}
                </Text>
              </Pressable>
            </View>
          </View>

          <ScrollView
            className="flex-1"
            contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Name */}
            <View className="bg-white px-4 py-4 mb-3">
              <Text className="text-sm font-medium text-gray-700 mb-2">Name *</Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="e.g., Packout #1, Small Parts Bin A"
                className="text-base text-gray-900 bg-gray-50 px-4 py-3 rounded-xl"
                autoFocus={!isEditing}
                returnKeyType="next"
              />
            </View>

            {/* Type */}
            <View className="bg-white px-4 py-4 mb-3">
              <Text className="text-sm font-medium text-gray-700 mb-3">Type *</Text>
              <View className="flex-row flex-wrap gap-2">
                {STORAGE_TYPES.map((storageType) => {
                  const isSelected = type === storageType.type;
                  return (
                    <Pressable
                      key={storageType.type}
                      onPress={() => setType(storageType.type)}
                      className={`flex-row items-center px-4 py-2.5 rounded-xl ${
                        isSelected ? "bg-blue-100" : "bg-gray-100"
                      }`}
                    >
                      <Ionicons
                        name={storageType.icon}
                        size={18}
                        color={isSelected ? "#3B82F6" : "#6B7280"}
                      />
                      <Text
                        className={`ml-2 font-medium ${
                          isSelected ? "text-blue-700" : "text-gray-700"
                        }`}
                      >
                        {storageType.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* Color */}
            <View className="bg-white px-4 py-4 mb-3">
              <Text className="text-sm font-medium text-gray-700 mb-3">Color (Optional)</Text>
              <View className="flex-row flex-wrap gap-3">
                {COLOR_OPTIONS.map((colorOption) => {
                  const isSelected = selectedColor === colorOption.color;
                  return (
                    <Pressable
                      key={colorOption.color}
                      onPress={() => setSelectedColor(colorOption.color)}
                      className="items-center"
                    >
                      <View
                        className={`w-12 h-12 rounded-full items-center justify-center ${
                          isSelected ? "border-2" : "border"
                        }`}
                        style={{
                          backgroundColor: colorOption.color,
                          borderColor: isSelected ? "#111827" : "#E5E7EB",
                        }}
                      >
                        {isSelected && <Ionicons name="checkmark" size={24} color="white" />}
                      </View>
                      <Text className="text-xs text-gray-600 mt-1">{colorOption.label}</Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* Description */}
            <View className="bg-white px-4 py-4">
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Description (Optional)
              </Text>
              <TextInput
                value={description}
                onChangeText={setDescription}
                placeholder="Add details about this storage location..."
                className="text-base text-gray-900 bg-gray-50 px-4 py-3 rounded-xl"
                multiline
                numberOfLines={3}
                style={{ minHeight: 80, textAlignVertical: "top" }}
              />
            </View>
          </ScrollView>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}
