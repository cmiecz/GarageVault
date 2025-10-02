import React, { useRef } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  Alert,
  StyleSheet,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useStorageStore } from "../state/storageStore";
import QRCode from "react-native-qrcode-svg";
import * as Sharing from "expo-sharing";
import ViewShot from "react-native-view-shot";
import { Colors } from "../utils/colors";

export default function QRCodeDisplayScreen({ navigation, route }: any) {
  const insets = useSafeAreaInsets();
  const { locationId } = route.params;
  const getLocationById = useStorageStore((state) => state.getLocationById);
  const location = getLocationById(locationId);
  const viewShotRef = useRef<ViewShot>(null);

  if (!location) {
    return (
      <View className="flex-1 items-center justify-center" style={{ backgroundColor: Colors.background }}>
        <Text className="text-base" style={{ color: Colors.textSecondary }}>
          Storage location not found
        </Text>
        <Pressable
          onPress={() => navigation.goBack()}
          className="mt-4 px-6 py-3 rounded-xl"
          style={{ backgroundColor: Colors.accent }}
        >
          <Text className="font-semibold" style={{ color: Colors.textOnPrimary }}>
            Go Back
          </Text>
        </Pressable>
      </View>
    );
  }

  const handleShare = async () => {
    try {
      if (viewShotRef.current && viewShotRef.current.capture) {
        await viewShotRef.current.capture();
        
        if (Platform.OS === "ios" || Platform.OS === "android") {
          const isAvailable = await Sharing.isAvailableAsync();
          if (isAvailable) {
            Alert.alert(
              "QR Code Ready",
              "Use the share button to save or print this QR code",
              [{ text: "OK" }]
            );
          }
        }
      }
    } catch (error) {
      console.error("Error sharing QR code:", error);
      Alert.alert("Error", "Failed to share QR code");
    }
  };

  return (
    <View className="flex-1" style={{ backgroundColor: Colors.background }}>
      {/* Teal Header */}
      <View
        style={[styles.header, { paddingTop: insets.top + 16 }]}
      >
        <View className="px-5 pb-5">
          <View className="flex-row items-center justify-between">
            <Pressable
              onPress={() => navigation.goBack()}
              className="w-10 h-10 rounded-full items-center justify-center"
              style={{ backgroundColor: "rgba(255, 255, 255, 0.2)" }}
            >
              <Ionicons name="arrow-back" size={22} color={Colors.textOnPrimary} />
            </Pressable>

            <Text className="text-lg font-semibold" style={{ color: Colors.textOnPrimary }}>
              QR Code
            </Text>

            <Pressable
              onPress={handleShare}
              className="w-10 h-10 rounded-full items-center justify-center"
              style={{ backgroundColor: "rgba(255, 255, 255, 0.2)" }}
            >
              <Ionicons name="share-outline" size={22} color={Colors.textOnPrimary} />
            </Pressable>
          </View>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ 
          paddingHorizontal: 16,
          paddingTop: 16,
          paddingBottom: insets.bottom + 120,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* QR Code Card */}
        <ViewShot
          ref={viewShotRef}
          options={{ format: "png", quality: 1.0 }}
          style={{ backgroundColor: "white" }}
        >
          <View className="rounded-2xl p-8" style={styles.card}>
            {/* Header Info */}
            <View className="items-center mb-6">
              <Text className="text-2xl font-bold text-center mb-2" style={{ color: Colors.textPrimary }}>
                {location.name}
              </Text>
              <Text className="text-base capitalize" style={{ color: Colors.textSecondary }}>
                {location.type.replace("_", " ")}
              </Text>
            </View>

            {/* QR Code */}
            <View className="items-center mb-6">
              <QRCode
                value={location.qrCode}
                size={280}
                backgroundColor="white"
                color="black"
                quietZone={10}
              />
            </View>

            {/* Footer Info */}
            <View className="items-center">
              <Text className="text-sm font-mono" style={{ color: Colors.textTertiary }}>
                ID: {location.id.substring(0, 8)}...
              </Text>
            </View>
          </View>
        </ViewShot>

        {/* Instructions Card */}
        <View className="rounded-2xl p-5 mt-4" style={styles.card}>
          <View className="flex-row items-start">
            <View
              className="w-10 h-10 rounded-full items-center justify-center mr-3"
              style={{ backgroundColor: Colors.accentLight }}
            >
              <Ionicons name="information-circle" size={24} color={Colors.accent} />
            </View>
            <View className="flex-1">
              <Text className="text-base font-semibold mb-2" style={{ color: Colors.textPrimary }}>
                How to Use
              </Text>
              <Text className="text-sm leading-6" style={{ color: Colors.textSecondary }}>
                1. Save or print this QR code{"\n"}
                2. Attach it to your physical storage container{"\n"}
                3. Scan the code anytime to see what is inside
              </Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View className="mt-4 gap-3">
          <Pressable
            onPress={handleShare}
            className="py-4 rounded-xl flex-row items-center justify-center"
            style={[styles.button, { backgroundColor: Colors.accent }]}
          >
            <Ionicons name="share-outline" size={20} color="white" />
            <Text className="font-semibold text-base ml-2" style={{ color: Colors.textOnPrimary }}>
              Share QR Code
            </Text>
          </Pressable>

          <Pressable
            onPress={() => navigation.navigate("StorageLocationDetail", { locationId: location.id })}
            className="py-4 rounded-xl flex-row items-center justify-center border"
            style={[styles.card, { borderColor: Colors.gray200 }]}
          >
            <Ionicons name="list" size={20} color={Colors.textPrimary} />
            <Text className="font-semibold text-base ml-2" style={{ color: Colors.textPrimary }}>
              View Items in Location
            </Text>
          </Pressable>
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
  button: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
});
