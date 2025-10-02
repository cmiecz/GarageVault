import React, { useState, useRef } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CameraView, CameraType, useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../utils/colors";
import { getOpenAITextResponse } from "../api/chat-service";

export default function ScanItemScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const [showCamera, setShowCamera] = useState(false);
  const [facing, setFacing] = useState<CameraType>("back");
  const [permission, requestPermission] = useCameraPermissions();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const cameraRef = useRef<any>(null);

  const handleOpenCamera = async () => {
    if (!permission?.granted) {
      const result = await requestPermission();
      if (!result.granted) {
        Alert.alert(
          "Permission Required",
          "Camera permission is required to scan items."
        );
        return;
      }
    }
    setShowCamera(true);
  };

  const takePicture = async () => {
    if (!cameraRef.current) return;

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: false,
      });
      
      setShowCamera(false);
      
      // Analyze the image with AI
      await analyzeImage(photo.uri);
    } catch (error) {
      console.error("Error taking picture:", error);
      Alert.alert("Error", "Failed to take picture. Please try again.");
    }
  };

  const pickFromGallery = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        quality: 0.8,
        allowsEditing: false,
        base64: false,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const asset = result.assets[0];
        await analyzeImage(asset.uri);
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "Failed to select image. Please try again.");
    }
  };

  const analyzeImage = async (imageUri: string) => {
    setIsAnalyzing(true);
    try {
      // Convert image to base64
      const base64 = await FileSystem.readAsStringAsync(imageUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const prompt = `Analyze this image of a product/tool/hardware item and extract the following details in JSON format:
{
  "name": "product name",
  "category": "Tools|Fasteners|Paint|Hardware|Electrical|Plumbing|Detailing|Other",
  "description": "brief description",
  "quantity": estimated count if visible (number),
  "unit": "units|pcs|oz|lbs|gallons|quarts|pints|count|pack",
  "details": {
    "brand": "brand name if visible",
    "size": "container size WITH unit (e.g., '1 gallon', '128 oz', '5 lbs', '#10 x 1 inch')",
    "color": "color name and code",
    "type": "specific type/finish",
    "material": "material if applicable",
    "threadType": "for fasteners only",
    "finish": "for paint: sheen type (flat, eggshell, satin, semi-gloss, gloss)",
    "paintType": "for paint: base type (latex, oil-based, acrylic, etc.)"
  }
}

IMPORTANT INSTRUCTIONS:
For PAINT:
- Extract container size (look for "GALLON", "QUART", "PINT" on label) and put in "size" field
- If 1 gallon: set quantity to 1, unit to "gallons"
- If 1 quart: set quantity to 1, unit to "quarts"  
- If 1 pint: set quantity to 1, unit to "pints"
- Extract color name AND any paint code/formula (e.g., "Benjamin Moore OC-17 White Dove", "SW 7006")
- Extract finish/sheen (eggshell, satin, semi-gloss, etc.) into "finish"
- Extract paint type (latex, oil-based, acrylic) into "paintType"
- Look for mixing formulas or color codes on stickers/labels

For FASTENERS (screws, bolts, nails):
- Extract size (e.g., "#10 x 1 inch", "M8 x 20mm")
- Extract thread type if visible (coarse, fine, etc.) into "threadType"
- Extract material (stainless steel, zinc plated, brass, etc.)
- Extract quantity count if visible on package

For TOOLS:
- Extract brand, model number, size
- Extract power type if applicable (corded, cordless, battery voltage)

Be specific and accurate. If you cannot determine a value, omit it.`;

      const response = await getOpenAITextResponse([
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64}`,
              },
            },
          ],
        },
      ]);

      let itemData;
      try {
        const jsonMatch = response.content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          itemData = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error("No JSON found in response");
        }
      } catch (parseError) {
        throw new Error("Failed to parse AI response");
      }

      navigation.navigate("AddItem", {
        imageUri,
        extractedData: itemData,
      });
    } catch (error) {
      console.error("Error analyzing image:", error);
      Alert.alert(
        "Analysis Failed",
        "Could not analyze the image. You can still add the item manually.",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Add Manually",
            onPress: () => navigation.navigate("AddItem", { imageUri }),
          },
        ]
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Analyzing state
  if (isAnalyzing) {
    return (
      <View className="flex-1 items-center justify-center" style={{ backgroundColor: Colors.background }}>
        <ActivityIndicator size="large" color={Colors.accent} />
        <Text className="text-lg font-semibold mt-4" style={{ color: Colors.textPrimary }}>
          Analyzing image...
        </Text>
        <Text className="text-sm mt-2" style={{ color: Colors.textSecondary }}>
          Identifying product details
        </Text>
      </View>
    );
  }

  // Camera View
  if (showCamera) {
    return (
      <View className="flex-1 bg-black">
        <CameraView
          ref={cameraRef}
          style={{ flex: 1 }}
          facing={facing}
        >
          {/* Camera Overlay UI */}
          <View className="flex-1">
            {/* Top Bar */}
            <View
              style={{
                paddingTop: insets.top + 16,
                paddingHorizontal: 20,
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Pressable
                onPress={() => setShowCamera(false)}
                className="w-10 h-10 rounded-full items-center justify-center"
                style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
              >
                <Ionicons name="close" size={28} color="white" />
              </Pressable>

              <Pressable
                onPress={() => setFacing(facing === "back" ? "front" : "back")}
                className="w-10 h-10 rounded-full items-center justify-center"
                style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
              >
                <Ionicons name="camera-reverse" size={28} color="white" />
              </Pressable>
            </View>

            {/* Bottom Controls */}
            <View
              style={{
                position: "absolute",
                bottom: 140, // Fixed: moved up to avoid tab bar
                left: 0,
                right: 0,
                alignItems: "center",
              }}
            >
              <Pressable
                onPress={takePicture}
                className="w-20 h-20 rounded-full items-center justify-center"
                style={{
                  backgroundColor: "white",
                  borderWidth: 4,
                  borderColor: Colors.accent,
                }}
              >
                <View
                  className="w-16 h-16 rounded-full"
                  style={{ backgroundColor: Colors.accent }}
                />
              </Pressable>
            </View>
          </View>
        </CameraView>
      </View>
    );
  }

  // Main Screen
  return (
    <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
      <View className="px-4 pt-6">
        <Pressable
          onPress={() => navigation.goBack()}
          className="w-10 h-10 items-center justify-center"
        >
          <Ionicons name="close" size={28} color={Colors.textPrimary} />
        </Pressable>
      </View>

      <View className="flex-1 items-center justify-center px-8">
        <Image
          source={require("../../assets/images/inventory-icon.jpg")}
          style={{ width: 100, height: 100, marginBottom: 24 }}
          contentFit="contain"
        />

        <Text className="text-3xl font-bold mb-3 text-center" style={{ color: Colors.textPrimary }}>
          Scan Item
        </Text>
        <Text className="text-base text-center mb-12" style={{ color: Colors.textSecondary }}>
          Take a photo or select from gallery to add items to your inventory
        </Text>

        <Pressable
          onPress={handleOpenCamera}
          className="w-full py-4 rounded-2xl mb-4"
          style={[styles.button, { backgroundColor: Colors.accent }]}
        >
          <View className="flex-row items-center justify-center">
            <Ionicons name="camera" size={24} color="white" />
            <Text className="font-semibold text-lg ml-3" style={{ color: Colors.textOnPrimary }}>
              Take Photo
            </Text>
          </View>
        </Pressable>

        <Pressable
          onPress={pickFromGallery}
          className="w-full py-4 rounded-2xl border-2"
          style={[styles.button, { backgroundColor: Colors.cardBackground, borderColor: Colors.gray200 }]}
        >
          <View className="flex-row items-center justify-center">
            <Ionicons name="images" size={24} color={Colors.textPrimary} />
            <Text className="font-semibold text-lg ml-3" style={{ color: Colors.textPrimary }}>
              Choose from Gallery
            </Text>
          </View>
        </Pressable>

        <Pressable
          onPress={() => navigation.navigate("AddItem")}
          className="mt-6"
        >
          <Text className="font-medium text-base" style={{ color: Colors.accent }}>
            Or add manually
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
});
