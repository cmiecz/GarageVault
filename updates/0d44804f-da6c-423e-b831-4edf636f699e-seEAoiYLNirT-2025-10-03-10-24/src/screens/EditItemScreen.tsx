import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useInventoryStore } from "../state/inventoryStore";
import { useCategoryStore } from "../state/categoryStore";
import * as ImagePicker from "expo-image-picker";
import StorageLocationPicker from "../components/StorageLocationPicker";

const UNITS = ["units", "pcs", "oz", "lbs", "gallons", "count", "pack"];

export default function EditItemScreen({ route, navigation }: any) {
  const insets = useSafeAreaInsets();
  const { itemId } = route.params;
  const item = useInventoryStore((state) => state.getItemById(itemId));
  const updateItem = useInventoryStore((state) => state.updateItem);
  
  // Use category store
  const categories = useCategoryStore((s) => s.getAllCategories());
  const addCategory = useCategoryStore((s) => s.addCategory);

  const [name, setName] = useState("");
  const [category, setCategory] = useState("Tools");
  const [description, setDescription] = useState("");
  const [quantity, setQuantity] = useState("");
  const [maxQuantity, setMaxQuantity] = useState("");
  const [unit, setUnit] = useState("units");
  const [threshold, setThreshold] = useState("");
  const [brand, setBrand] = useState("");
  const [size, setSize] = useState("");
  const [color, setColor] = useState("");
  const [type, setType] = useState("");
  const [material, setMaterial] = useState("");
  const [imageUri, setImageUri] = useState("");
  
  // Paint-specific states
  const [rooms, setRooms] = useState<string[]>([]);
  const [roomInput, setRoomInput] = useState("");
  
  // Storage location states
  const [storageLocationId, setStorageLocationId] = useState<string | undefined>(undefined);
  const [storagePosition, setStoragePosition] = useState("");

  useEffect(() => {
    if (item) {
      setName(item.name);
      setCategory(item.category);
      setDescription(item.description || "");
      setQuantity(item.quantity.toString());
      setMaxQuantity(item.maxQuantity.toString());
      setUnit(item.unit);
      setThreshold(item.threshold.toString());
      setBrand(item.details.brand || "");
      setSize(item.details.size || "");
      setColor(item.details.color || "");
      setType(item.details.type || "");
      setMaterial(item.details.material || "");
      setImageUri(item.imageUri || "");
      setRooms(item.details.rooms || []);
      setStorageLocationId(item.details.storageLocationId);
      setStoragePosition(item.details.storagePosition || "");
    }
  }, [item]);

  if (!item) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <Text className="text-lg text-gray-500">Item not found</Text>
      </View>
    );
  }

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert("Required Field", "Please enter an item name");
      return;
    }

    const qty = parseInt(quantity) || 0;
    const maxQty = parseInt(maxQuantity) || qty;
    const thresh = parseInt(threshold) || 0;

    if (maxQty < qty) {
      Alert.alert("Invalid Values", "Max quantity cannot be less than current quantity");
      return;
    }

    if (thresh > maxQty) {
      Alert.alert("Invalid Values", "Threshold cannot be greater than max quantity");
      return;
    }

    updateItem(itemId, {
      name: name.trim(),
      category,
      description: description.trim() || undefined,
      quantity: qty,
      maxQuantity: maxQty,
      unit,
      threshold: thresh,
      imageUri: imageUri || undefined,
      details: {
        brand: brand.trim() || undefined,
        size: size.trim() || undefined,
        color: color.trim() || undefined,
        type: type.trim() || undefined,
        material: material.trim() || undefined,
        rooms: rooms.length > 0 ? rooms : undefined,
        storageLocationId: storageLocationId || undefined,
        storagePosition: storagePosition.trim() || undefined,
      },
    });

    navigation.goBack();
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: "images",
        quality: 0.7,
        allowsEditing: true,
      });

      if (!result.canceled && result.assets[0]) {
        setImageUri(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Error picking image:", error);
    }
  };

  const addRoom = () => {
    if (roomInput.trim() && !rooms.includes(roomInput.trim())) {
      setRooms([...rooms, roomInput.trim()]);
      setRoomInput("");
    }
  };

  const removeRoom = (room: string) => {
    setRooms(rooms.filter((r) => r !== room));
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-gray-50"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ paddingTop: insets.top }}
    >
      <View className="flex-row items-center justify-between px-4 py-4 bg-white border-b border-gray-200">
        <Pressable onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={28} color="#374151" />
        </Pressable>
        <Text className="text-xl font-semibold text-gray-900">Edit Item</Text>
        <Pressable onPress={handleSave}>
          <Text className="text-blue-500 font-semibold text-base">Save</Text>
        </Pressable>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {imageUri ? (
          <Pressable onPress={pickImage} className="relative">
            <Image
              source={{ uri: imageUri }}
              style={styles.image}
              contentFit="cover"
            />
            <View className="absolute bottom-4 right-4 bg-black/60 px-3 py-2 rounded-lg">
              <Text className="text-white text-xs font-medium">Change Photo</Text>
            </View>
          </Pressable>
        ) : (
          <Pressable
            onPress={pickImage}
            className="mx-4 mt-4 h-48 bg-gray-100 rounded-2xl items-center justify-center border-2 border-dashed border-gray-300"
          >
            <Ionicons name="image-outline" size={48} color="#9CA3AF" />
            <Text className="text-gray-500 mt-2 font-medium">Add Photo</Text>
          </Pressable>
        )}

        <View className="px-4 mt-4">
          <Text className="text-sm font-medium text-gray-700 mb-2">
            Name *
          </Text>
          <TextInput
            className="bg-white px-4 py-3 rounded-xl text-base text-gray-900 border border-gray-200"
            placeholder="e.g. Phillips Screwdriver"
            placeholderTextColor="#9CA3AF"
            value={name}
            onChangeText={setName}
          />
        </View>

        <View className="px-4 mt-4">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-sm font-medium text-gray-700">
              Category
            </Text>
            <Pressable
              onPress={() => {
                Alert.prompt(
                  "New Category",
                  "Enter a new category name:",
                  [
                    { text: "Cancel", style: "cancel" },
                    {
                      text: "Add",
                      onPress: (text) => {
                        if (text && text.trim()) {
                          addCategory(text.trim());
                          setCategory(text.trim());
                          Alert.alert("Success", `Added "${text.trim()}" category!`);
                        }
                      },
                    },
                  ],
                  "plain-text"
                );
              }}
              className="flex-row items-center"
            >
              <Ionicons name="add-circle-outline" size={16} color="#3B82F6" />
              <Text className="text-xs font-medium ml-1" style={{ color: "#3B82F6" }}>
                New
              </Text>
            </Pressable>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {categories.map((cat: string) => (
              <Pressable
                key={cat}
                onPress={() => setCategory(cat)}
                className={`px-4 py-2 rounded-xl mr-2 ${
                  category === cat ? "bg-blue-500" : "bg-white border border-gray-200"
                }`}
              >
                <Text
                  className={`text-sm font-medium ${
                    category === cat ? "text-white" : "text-gray-700"
                  }`}
                >
                  {cat}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        <View className="px-4 mt-4">
          <Text className="text-sm font-medium text-gray-700 mb-2">
            Description
          </Text>
          <TextInput
            className="bg-white px-4 py-3 rounded-xl text-base text-gray-900 border border-gray-200"
            placeholder="Optional details"
            placeholderTextColor="#9CA3AF"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={2}
          />
        </View>

        <View className="px-4 mt-6">
          <Text className="text-lg font-semibold text-gray-900 mb-3">
            Quantity Settings
          </Text>

          <View className="flex-row mb-4">
            <View className="flex-1 mr-2">
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Current Quantity *
              </Text>
              <TextInput
                className="bg-white px-4 py-3 rounded-xl text-base text-gray-900 border border-gray-200"
                placeholder="10"
                placeholderTextColor="#9CA3AF"
                value={quantity}
                onChangeText={setQuantity}
                keyboardType="number-pad"
              />
            </View>
            <View className="flex-1 ml-2">
              <Text className="text-sm font-medium text-gray-700 mb-2">Unit</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {UNITS.map((u) => (
                  <Pressable
                    key={u}
                    onPress={() => setUnit(u)}
                    className={`px-3 py-3 rounded-xl mr-2 ${
                      unit === u ? "bg-blue-500" : "bg-white border border-gray-200"
                    }`}
                  >
                    <Text
                      className={`text-sm font-medium ${
                        unit === u ? "text-white" : "text-gray-700"
                      }`}
                    >
                      {u}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          </View>

          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 mb-2">
              Maximum Capacity *
            </Text>
            <TextInput
              className="bg-white px-4 py-3 rounded-xl text-base text-gray-900 border border-gray-200"
              placeholder="100"
              placeholderTextColor="#9CA3AF"
              value={maxQuantity}
              onChangeText={setMaxQuantity}
              keyboardType="number-pad"
            />
            <Text className="text-xs text-gray-500 mt-1">
              The maximum amount you can store
            </Text>
          </View>

          <View className="mb-2">
            <Text className="text-sm font-medium text-gray-700 mb-2">
              Low Stock Threshold *
            </Text>
            <TextInput
              className="bg-white px-4 py-3 rounded-xl text-base text-gray-900 border border-gray-200"
              placeholder="20"
              placeholderTextColor="#9CA3AF"
              value={threshold}
              onChangeText={setThreshold}
              keyboardType="number-pad"
            />
            <Text className="text-xs text-gray-500 mt-1">
              Get notified when quantity drops to or below this amount
            </Text>
          </View>
        </View>

        <View className="px-4 mt-6">
          <Text className="text-lg font-semibold text-gray-900 mb-3">
            Additional Details
          </Text>

          <Text className="text-sm font-medium text-gray-700 mb-2">Brand</Text>
          <TextInput
            className="bg-white px-4 py-3 rounded-xl text-base text-gray-900 border border-gray-200 mb-3"
            placeholder="e.g. DeWalt"
            placeholderTextColor="#9CA3AF"
            value={brand}
            onChangeText={setBrand}
          />

          <Text className="text-sm font-medium text-gray-700 mb-2">Size</Text>
          <TextInput
            className="bg-white px-4 py-3 rounded-xl text-base text-gray-900 border border-gray-200 mb-3"
            placeholder="e.g. 1/4 inch, 10mm"
            placeholderTextColor="#9CA3AF"
            value={size}
            onChangeText={setSize}
          />

          <Text className="text-sm font-medium text-gray-700 mb-2">Color</Text>
          <TextInput
            className="bg-white px-4 py-3 rounded-xl text-base text-gray-900 border border-gray-200 mb-3"
            placeholder="e.g. Blue, Silver"
            placeholderTextColor="#9CA3AF"
            value={color}
            onChangeText={setColor}
          />

          <Text className="text-sm font-medium text-gray-700 mb-2">Type</Text>
          <TextInput
            className="bg-white px-4 py-3 rounded-xl text-base text-gray-900 border border-gray-200 mb-3"
            placeholder="e.g. Phillips head"
            placeholderTextColor="#9CA3AF"
            value={type}
            onChangeText={setType}
          />

          <Text className="text-sm font-medium text-gray-700 mb-2">
            Material
          </Text>
          <TextInput
            className="bg-white px-4 py-3 rounded-xl text-base text-gray-900 border border-gray-200"
            placeholder="e.g. Stainless steel"
            placeholderTextColor="#9CA3AF"
            value={material}
            onChangeText={setMaterial}
          />

          {/* Paint-specific: Room Tags */}
          {category === "Paint" && (
            <View className="mt-4">
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Rooms (Optional)
              </Text>
              <Text className="text-xs text-gray-500 mb-3">
                Tag which rooms this paint is used in
              </Text>
              
              {/* Suggested Rooms */}
              <Text className="text-xs font-medium text-gray-600 mb-2">
                Quick Add:
              </Text>
              <View className="flex-row flex-wrap mb-3">
                {[
                  "Living Room",
                  "Kitchen",
                  "Bedroom",
                  "Bathroom",
                  "Garage",
                  "Dining Room",
                  "Office",
                  "Basement",
                  "Hallway",
                  "Exterior"
                ].map((suggestedRoom) => (
                  <Pressable
                    key={suggestedRoom}
                    onPress={() => {
                      if (!rooms.includes(suggestedRoom)) {
                        setRooms([...rooms, suggestedRoom]);
                      }
                    }}
                    className={`rounded-full px-3 py-2 mr-2 mb-2 border ${
                      rooms.includes(suggestedRoom)
                        ? "bg-blue-500 border-blue-500"
                        : "bg-white border-gray-300"
                    }`}
                  >
                    <Text
                      className={`text-sm font-medium ${
                        rooms.includes(suggestedRoom)
                          ? "text-white"
                          : "text-gray-700"
                      }`}
                    >
                      {suggestedRoom}
                    </Text>
                  </Pressable>
                ))}
              </View>
              
              {/* Custom Room Input */}
              <Text className="text-xs font-medium text-gray-600 mb-2">
                Or add custom:
              </Text>
              <View className="flex-row items-center mb-3">
                <TextInput
                  className="flex-1 bg-white px-4 py-3 rounded-xl text-base text-gray-900 border border-gray-200"
                  placeholder="e.g., Guest Room"
                  placeholderTextColor="#9CA3AF"
                  value={roomInput}
                  onChangeText={setRoomInput}
                  onSubmitEditing={addRoom}
                  returnKeyType="done"
                />
                <Pressable
                  onPress={addRoom}
                  className="ml-2 bg-blue-500 rounded-xl px-4 py-3"
                >
                  <Ionicons name="add" size={20} color="white" />
                </Pressable>
              </View>
              
              {/* Selected Rooms */}
              {rooms.length > 0 && (
                <View>
                  <Text className="text-xs font-medium text-gray-600 mb-2">
                    Selected Rooms:
                  </Text>
                  <View className="flex-row flex-wrap">
                    {rooms.map((room, index) => (
                      <View
                        key={index}
                        className="bg-blue-100 rounded-full px-3 py-2 mr-2 mb-2 flex-row items-center"
                      >
                        <Text className="text-blue-700 font-medium mr-2">{room}</Text>
                        <Pressable onPress={() => removeRoom(room)}>
                          <Ionicons name="close-circle" size={18} color="#3B82F6" />
                        </Pressable>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </View>
          )}
          
          {/* Storage Location Picker - Only for non-Paint categories */}
          {category !== "Paint" && (
            <View className="mx-4 mb-4 bg-white rounded-2xl p-4 border border-gray-200">
              <Text className="text-sm font-medium text-gray-700 mb-3">
                Storage Location
              </Text>
              <StorageLocationPicker
                selectedLocationId={storageLocationId}
                onLocationSelect={setStorageLocationId}
                storagePosition={storagePosition}
                onPositionChange={setStoragePosition}
                showPositionInput={true}
              />
            </View>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  image: {
    width: "100%",
    height: 200,
  },
});
