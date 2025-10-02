import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { View, Platform } from "react-native";
import { BlurView } from "expo-blur";
import { Ionicons, FontAwesome5 } from "@expo/vector-icons";
import InventoryListScreen from "../screens/InventoryListScreen";
import ScanItemScreen from "../screens/ScanItemScreen";
import AddItemScreen from "../screens/AddItemScreen";
import EditItemScreen from "../screens/EditItemScreen";
import ItemDetailScreen from "../screens/ItemDetailScreen";
import SettingsScreen from "../screens/SettingsScreen";
import StorageLocationsScreen from "../screens/StorageLocationsScreen";
import AddStorageLocationScreen from "../screens/AddStorageLocationScreen";
import StorageLocationDetailScreen from "../screens/StorageLocationDetailScreen";
import QRCodeDisplayScreen from "../screens/QRCodeDisplayScreen";
import ScanStorageQRScreen from "../screens/ScanStorageQRScreen";
import { Colors } from "../utils/colors";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function InventoryStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="InventoryList" component={InventoryListScreen} />
      <Stack.Screen name="ItemDetail" component={ItemDetailScreen} />
      <Stack.Screen name="EditItem" component={EditItemScreen} />
      <Stack.Screen name="ScanItem" component={ScanItemScreen} />
      <Stack.Screen name="AddItem" component={AddItemScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="StorageLocations" component={StorageLocationsScreen} />
      <Stack.Screen name="AddStorageLocation" component={AddStorageLocationScreen} />
      <Stack.Screen name="StorageLocationDetail" component={StorageLocationDetailScreen} />
      <Stack.Screen name="QRCodeDisplay" component={QRCodeDisplayScreen} />
      <Stack.Screen name="ScanStorageQR" component={ScanStorageQRScreen} />
    </Stack.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          if (route.name === "Inventory") {
            // Garage icon from FontAwesome5
            return <FontAwesome5 name="warehouse" size={size} color={color} solid={focused} />;
          } else if (route.name === "Add") {
            // Center button - larger plus icon with blue background
            return (
              <View
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 28,
                  backgroundColor: Colors.accent,
                  justifyContent: "center",
                  alignItems: "center",
                  marginBottom: 20,
                  shadowColor: Colors.accent,
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: 8,
                }}
              >
                <Ionicons name="add" size={32} color="white" />
              </View>
            );
          } else if (route.name === "QRScan") {
            const iconName = focused ? "qr-code" : "qr-code-outline";
            return <Ionicons name={iconName} size={size} color={color} />;
          }

          return null;
        },
        tabBarActiveTintColor: Colors.accent,
        tabBarInactiveTintColor: Colors.gray500,
        tabBarStyle: {
          position: "absolute",
          bottom: 25,
          left: 20,
          right: 20,
          height: 70,
          paddingBottom: 10,
          paddingTop: 10,
          borderTopWidth: 0,
          backgroundColor: "transparent",
        },
        tabBarBackground: () => (
          <BlurView
            intensity={80}
            tint="light"
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              borderRadius: 24,
              overflow: "hidden",
              backgroundColor: Platform.OS === "ios" ? "rgba(255, 255, 255, 0.7)" : "rgba(255, 255, 255, 0.95)",
              borderWidth: 0.5,
              borderColor: "rgba(255, 255, 255, 0.8)",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 10 },
              shadowOpacity: 0.15,
              shadowRadius: 20,
              elevation: 10,
            }}
          />
        ),
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
          marginTop: 2,
        },
        tabBarItemStyle: {
          paddingVertical: 5,
        },
      })}
    >
      <Tab.Screen 
        name="Inventory" 
        component={InventoryStack}
        options={{
          tabBarLabel: "Garage",
        }}
      />
      <Tab.Screen 
        name="Add" 
        component={ScanItemScreen}
        options={{
          tabBarLabel: "",
        }}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            e.preventDefault();
            navigation.navigate("Inventory", {
              screen: "ScanItem",
            });
          },
        })}
      />
      <Tab.Screen 
        name="QRScan" 
        component={ScanStorageQRScreen}
        options={{
          tabBarLabel: "Scan QR",
        }}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            e.preventDefault();
            navigation.navigate("Inventory", {
              screen: "ScanStorageQR",
            });
          },
        })}
      />
    </Tab.Navigator>
  );
}
