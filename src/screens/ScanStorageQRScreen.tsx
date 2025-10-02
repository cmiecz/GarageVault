import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useStorageStore } from "../state/storageStore";

export default function ScanStorageQRScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const getLocationByQRCode = useStorageStore((state) => state.getLocationByQRCode);

  useEffect(() => {
    // Request camera permissions on mount
    if (!permission?.granted && !permission?.canAskAgain) {
      requestPermission();
    }
  }, []);

  const handleBarCodeScanned = ({ data }: { type: string; data: string }) => {
    if (scanned) return;
    
    setScanned(true);
    
    // Look up location by QR code
    const location = getLocationByQRCode(data);
    
    if (location) {
      // Navigate to location detail
      navigation.replace("StorageLocationDetail", { locationId: location.id });
    } else {
      // QR code doesn't match any location
      Alert.alert(
        "Unknown QR Code",
        "This QR code does not match any storage location in your inventory.",
        [
          {
            text: "Scan Again",
            onPress: () => setScanned(false),
          },
          {
            text: "Cancel",
            onPress: () => navigation.goBack(),
            style: "cancel",
          },
        ]
      );
    }
  };

  // Handle permission states
  if (!permission) {
    return (
      <View className="flex-1 bg-gray-50 items-center justify-center">
        <Text className="text-gray-500">Loading camera...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View className="flex-1 bg-gray-50">
        <View
          className="bg-white border-b border-gray-200"
          style={{ paddingTop: insets.top }}
        >
          <View className="flex-row items-center justify-between px-4 py-3">
            <Pressable
              onPress={() => navigation.goBack()}
              className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center"
            >
              <Ionicons name="arrow-back" size={20} color="#111827" />
            </Pressable>
            <Text className="text-lg font-semibold text-gray-900">
              Scan QR Code
            </Text>
            <View className="w-10" />
          </View>
        </View>

        <View className="flex-1 items-center justify-center px-8">
          <View className="w-24 h-24 rounded-full bg-gray-100 items-center justify-center mb-4">
            <Ionicons name="camera-outline" size={48} color="#9CA3AF" />
          </View>
          <Text className="text-xl font-semibold text-gray-900 mb-2 text-center">
            Camera Permission Required
          </Text>
          <Text className="text-base text-gray-500 text-center mb-6">
            Allow camera access to scan QR codes on your storage locations
          </Text>
          <Pressable
            onPress={requestPermission}
            className="bg-blue-500 px-6 py-3 rounded-xl"
          >
            <Text className="text-white font-semibold">Grant Permission</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-black">
      {/* Camera View */}
      <CameraView
        style={{ flex: 1 }}
        facing="back"
        barcodeScannerSettings={{
          barcodeTypes: ["qr"],
        }}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
      >
        {/* Overlay */}
        <View className="absolute top-0 left-0 right-0 bottom-0 z-10">
          {/* Header */}
          <View
            className="bg-black/50 px-4 py-3"
            style={{ paddingTop: insets.top }}
          >
            <View className="flex-row items-center justify-between">
              <Pressable
                onPress={() => navigation.goBack()}
                className="w-10 h-10 rounded-full bg-white/20 items-center justify-center"
              >
                <Ionicons name="close" size={24} color="white" />
              </Pressable>
              <Text className="text-lg font-semibold text-white">
                Scan Storage QR Code
              </Text>
              <View className="w-10" />
            </View>
          </View>

          {/* Scanning Frame */}
          <View className="flex-1 items-center justify-center">
            <View className="relative">
              {/* Corner Markers */}
              <View style={styles.scanFrame}>
                {/* Top Left */}
                <View style={[styles.corner, styles.topLeft]} />
                {/* Top Right */}
                <View style={[styles.corner, styles.topRight]} />
                {/* Bottom Left */}
                <View style={[styles.corner, styles.bottomLeft]} />
                {/* Bottom Right */}
                <View style={[styles.corner, styles.bottomRight]} />
              </View>
            </View>
            
            {/* Instructions */}
            <Text className="text-white text-center mt-8 text-base px-8">
              Position the QR code within the frame
            </Text>
          </View>

          {/* Manual Entry Button */}
          <View 
            className="px-6 mb-8"
            style={{ paddingBottom: insets.bottom }}
          >
            <Pressable
              onPress={() => navigation.goBack()}
              className="bg-white/90 py-4 rounded-xl items-center"
            >
              <Text className="text-gray-900 font-semibold">Cancel</Text>
            </Pressable>
          </View>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  scanFrame: {
    width: 280,
    height: 280,
    position: "relative",
  },
  corner: {
    position: "absolute",
    width: 40,
    height: 40,
    borderColor: "white",
  },
  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
  },
});
