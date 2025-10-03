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
import Slider from "@react-native-community/slider";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useInventoryStore } from "../state/inventoryStore";
import { useHouseholdStore } from "../state/householdStore";
import { useCategoryStore } from "../state/categoryStore";
import * as ImagePicker from "expo-image-picker";
import StorageLocationPicker from "../components/StorageLocationPicker";

const UNITS = ["units", "pcs", "oz", "lbs", "gallons", "quarts", "pints", "count", "pack"];

// Paint size options
const PAINT_SIZES = [
  { label: "Gallon", value: 1, oz: 128 },
  { label: "Quart", value: 0.25, oz: 32 },
  { label: "Pint", value: 0.125, oz: 16 },
  { label: "Half Pint", value: 0.0625, oz: 8 },
];

export default function AddItemScreen({ route, navigation }: any) {
  const insets = useSafeAreaInsets();
  const addItem = useInventoryStore((state) => state.addItem);
  const household = useHouseholdStore((s) => s.household);
  
  // Use category store instead of hardcoded list
  const categories = useCategoryStore((s) => s.getAllCategories());
  const addCategory = useCategoryStore((s) => s.addCategory);
  
  const { imageUri, extractedData } = route.params || {};

  const [name, setName] = useState("");
  const [category, setCategory] = useState(categories.length > 0 ? categories[0] : "Tools");
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
  const [isNewPackage, setIsNewPackage] = useState(true);
  const [numberOfPackages, setNumberOfPackages] = useState("1");
  const [images, setImages] = useState<string[]>([]);
  
  // Paint-specific states
  const [paintSize, setPaintSize] = useState(1); // Default to gallon
  const [rooms, setRooms] = useState<string[]>([]);
  const [roomInput, setRoomInput] = useState("");
  
  // Storage location states
  const [storageLocationId, setStorageLocationId] = useState<string | undefined>(undefined);
  const [storagePosition, setStoragePosition] = useState("");

  useEffect(() => {
    if (extractedData) {
      if (extractedData.name) setName(extractedData.name);
      if (extractedData.category) {
        setCategory(extractedData.category);
        // Auto-set unit to gallons for paint
        if (extractedData.category === "Paint") {
          setUnit("gallons");
        }
      }
      if (extractedData.description) setDescription(extractedData.description);
      if (extractedData.quantity) {
        const detectedQty = extractedData.quantity;
        setQuantity(detectedQty.toString());
        // If AI detected a quantity, assume it's a new package and set max to that amount
        setMaxQuantity(detectedQty.toString());
      }
      if (extractedData.unit) setUnit(extractedData.unit);
      if (extractedData.details) {
        if (extractedData.details.brand) setBrand(extractedData.details.brand);
        if (extractedData.details.size) setSize(extractedData.details.size);
        if (extractedData.details.color) setColor(extractedData.details.color);
        if (extractedData.details.type) setType(extractedData.details.type);
        if (extractedData.details.material)
          setMaterial(extractedData.details.material);
      }
    }
    // Set initial image if provided
    if (imageUri) {
      setImages([imageUri]);
    }
  }, [extractedData, imageUri]);

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert("Required Field", "Please enter an item name");
      return;
    }

    let finalQuantity: number;
    let finalMaxQuantity: number;
    let finalUnit: string = unit;

    // Special handling for paint
    if (category === "Paint") {
      // For paint, quantity is in gallons/quarts based on paintSize
      finalQuantity = parseFloat(quantity) || paintSize;
      finalMaxQuantity = parseFloat(maxQuantity) || paintSize;
      finalUnit = paintSize >= 1 ? "gallons" : paintSize >= 0.25 ? "quarts" : "pints";
    } else {
      const packages = parseInt(numberOfPackages) || 1;
      const qtyPerPackage = parseInt(quantity) || 1;
      const totalQty = qtyPerPackage * packages;
      
      if (isNewPackage && maxQuantity) {
        finalMaxQuantity = parseInt(maxQuantity) * packages;
      } else {
        finalMaxQuantity = parseInt(maxQuantity) || totalQty * 10;
      }
      finalQuantity = totalQty;
    }
    
    const thresh = parseInt(threshold) || Math.floor(finalMaxQuantity * 0.2);

    addItem({
      name: name.trim(),
      category,
      description: description.trim() || undefined,
      quantity: finalQuantity,
      maxQuantity: finalMaxQuantity,
      unit: finalUnit,
      threshold: thresh,
      imageUri: images[0] || undefined,
      images: images.length > 0 ? images : undefined,
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
    }, household?.id);

    navigation.navigate("InventoryList");
  };

  const addImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: "images",
        quality: 0.7,
        allowsEditing: false,
      });

      if (!result.canceled && result.assets[0]) {
        setImages([...images, result.assets[0].uri]);
      }
    } catch (error) {
      console.error("Error picking image:", error);
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
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
        <Text className="text-xl font-semibold text-gray-900">Add Item</Text>
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
        {/* Multiple Images Section */}
        <View className="px-4 mt-4">
          <Text className="text-sm font-medium text-gray-700 mb-3">
            Photos {category === "Paint" && "(Paint chip, mix formula, etc.)"}
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {images.map((uri, index) => (
              <View key={index} className="mr-3 relative">
                <Image
                  source={{ uri }}
                  style={styles.thumbnailImage}
                  contentFit="cover"
                />
                <Pressable
                  onPress={() => removeImage(index)}
                  className="absolute top-2 right-2 bg-red-500 rounded-full w-6 h-6 items-center justify-center"
                  style={{ shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 2, elevation: 3 }}
                >
                  <Ionicons name="close" size={16} color="white" />
                </Pressable>
              </View>
            ))}
            <Pressable
              onPress={addImage}
              className="w-32 h-32 bg-gray-100 rounded-2xl items-center justify-center border-2 border-dashed border-gray-300"
            >
              <Ionicons name="add" size={32} color="#9CA3AF" />
              <Text className="text-gray-500 text-xs mt-1">Add Photo</Text>
            </Pressable>
          </ScrollView>
        </View>

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

          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 mb-3">
              Is this a new/unopened package?
            </Text>
            <View className="flex-row">
              <Pressable
                onPress={() => setIsNewPackage(true)}
                className={`flex-1 py-3 rounded-xl mr-2 ${
                  isNewPackage ? "bg-blue-500" : "bg-white border border-gray-200"
                }`}
              >
                <Text
                  className={`text-center text-sm font-medium ${
                    isNewPackage ? "text-white" : "text-gray-700"
                  }`}
                >
                  Yes - New Package
                </Text>
              </Pressable>
              <Pressable
                onPress={() => setIsNewPackage(false)}
                className={`flex-1 py-3 rounded-xl ml-2 ${
                  !isNewPackage ? "bg-blue-500" : "bg-white border border-gray-200"
                }`}
              >
                <Text
                  className={`text-center text-sm font-medium ${
                    !isNewPackage ? "text-white" : "text-gray-700"
                  }`}
                >
                  No - Partial
                </Text>
              </Pressable>
            </View>
            <Text className="text-xs text-gray-500 mt-2">
              {isNewPackage
                ? "We will use the detected quantity as your max capacity"
                : "You can manually set your max capacity"}
            </Text>
          </View>

          {isNewPackage && (
            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Number of Packages/Boxes
              </Text>
              <TextInput
                className="bg-white px-4 py-3 rounded-xl text-base text-gray-900 border border-gray-200"
                placeholder="1"
                placeholderTextColor="#9CA3AF"
                value={numberOfPackages}
                onChangeText={setNumberOfPackages}
                keyboardType="number-pad"
              />
              <Text className="text-xs text-gray-500 mt-1">
                If you have multiple boxes, enter the number here
              </Text>
            </View>
          )}

          <View className="flex-row mb-4">
            <View className="flex-1 mr-2">
              <Text className="text-sm font-medium text-gray-700 mb-2">
                {isNewPackage ? "Quantity per Package" : "Current Quantity"}
              </Text>
              <TextInput
                className="bg-white px-4 py-3 rounded-xl text-base text-gray-900 border border-gray-200"
                placeholder="10"
                placeholderTextColor="#9CA3AF"
                value={quantity}
                onChangeText={setQuantity}
                keyboardType="number-pad"
              />
              {isNewPackage && numberOfPackages && parseInt(numberOfPackages) > 1 && (
                <Text className="text-xs text-gray-500 mt-1">
                  Total: {(parseInt(quantity) || 0) * (parseInt(numberOfPackages) || 1)} {unit}
                </Text>
              )}
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

          {!isNewPackage && (
            <>
              <View className="mb-4">
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  Maximum Capacity
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

              {/* Visual Slider for Partial Packages */}
              {maxQuantity && parseInt(maxQuantity) > 0 && (
                <View className="mb-4 bg-white rounded-2xl p-4 border border-gray-200">
                  <Text className="text-sm font-medium text-gray-700 mb-3">
                    Visual Quantity Check
                  </Text>
                  <Text className="text-xs text-gray-500 mb-3">
                    {category === "Paint" 
                      ? "Drag the slider or tap a fraction to estimate how full the can is"
                      : "Drag the slider to visually estimate how full the container is"}
                  </Text>
                  
                  {/* Paint-specific preset buttons */}
                  {category === "Paint" && (
                    <View className="flex-row justify-between mb-3">
                      {[
                        { label: "Full", fraction: 1 },
                        { label: "3/4", fraction: 0.75 },
                        { label: "1/2", fraction: 0.5 },
                        { label: "1/4", fraction: 0.25 },
                        { label: "Empty", fraction: 0 }
                      ].map((preset) => (
                        <Pressable
                          key={preset.label}
                          onPress={() => {
                            const newQty = Math.round(parseInt(maxQuantity) * preset.fraction * 100) / 100;
                            setQuantity(newQty.toString());
                          }}
                          className="bg-gray-100 px-3 py-2 rounded-lg"
                        >
                          <Text className="text-xs font-medium text-gray-700">{preset.label}</Text>
                        </Pressable>
                      ))}
                    </View>
                  )}
                  
                  {/* Container visualization */}
                  <View className="h-48 bg-gray-100 rounded-xl mb-4 overflow-hidden relative border-2 border-gray-300">
                    <View 
                      className="absolute bottom-0 left-0 right-0 bg-blue-400"
                      style={{ 
                        height: ((parseFloat(quantity) || 0) / parseFloat(maxQuantity)) * 192 // 192px = 48 * 4 (h-48)
                      }}
                    />
                    {/* Fraction markers for paint */}
                    {category === "Paint" && (
                      <>
                        <View className="absolute left-0 right-0 border-t border-dashed border-gray-400" style={{ top: 192 * 0.25 }} />
                        <View className="absolute left-0 right-0 border-t border-dashed border-gray-400" style={{ top: 192 * 0.5 }} />
                        <View className="absolute left-0 right-0 border-t border-dashed border-gray-400" style={{ top: 192 * 0.75 }} />
                      </>
                    )}
                    <View className="absolute inset-0 items-center justify-center">
                      <Text className="text-2xl font-bold text-gray-700">
                        {parseFloat(quantity) || 0} {unit}
                      </Text>
                      <Text className="text-sm text-gray-500">
                        {Math.round(((parseFloat(quantity) || 0) / parseFloat(maxQuantity)) * 100)}% Full
                      </Text>
                    </View>
                  </View>

                  <Slider
                    style={{ width: "100%", height: 40 }}
                    minimumValue={0}
                    maximumValue={parseFloat(maxQuantity)}
                    step={category === "Paint" ? parseFloat(maxQuantity) / 100 : 1}
                    value={parseFloat(quantity) || 0}
                    onValueChange={(value) => {
                      const rounded = category === "Paint" 
                        ? Math.round(value * 100) / 100 
                        : Math.round(value);
                      setQuantity(rounded.toString());
                    }}
                    minimumTrackTintColor="#3B82F6"
                    maximumTrackTintColor="#E5E7EB"
                    thumbTintColor="#3B82F6"
                  />

                  <View className="flex-row justify-between mt-2">
                    <Text className="text-xs text-gray-500">Empty</Text>
                    {category === "Paint" && (
                      <>
                        <Text className="text-xs text-gray-500">1/4</Text>
                        <Text className="text-xs text-gray-500">1/2</Text>
                        <Text className="text-xs text-gray-500">3/4</Text>
                      </>
                    )}
                    <Text className="text-xs text-gray-500">Full</Text>
                  </View>
                </View>
              )}
            </>
          )}

          <View className="mb-2">
            <Text className="text-sm font-medium text-gray-700 mb-2">
              Low Stock Threshold
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
            className="bg-white px-4 py-3 rounded-xl text-base text-gray-900 border border-gray-200 mb-3"
            placeholder="e.g. Steel, Aluminum"
            placeholderTextColor="#9CA3AF"
            value={material}
            onChangeText={setMaterial}
          />

          {/* Paint-specific: Room Tags */}
          {category === "Paint" && (
            <View className="mt-2">
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
  thumbnailImage: {
    width: 128,
    height: 128,
    borderRadius: 16,
  },
});
