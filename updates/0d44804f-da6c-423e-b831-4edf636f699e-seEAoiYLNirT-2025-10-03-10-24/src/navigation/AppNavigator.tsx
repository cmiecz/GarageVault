import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { View, Pressable, StyleSheet, Text, Platform } from "react-native";
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
import ManageCategoriesScreen from "../screens/ManageCategoriesScreen";
import SelectStoresScreen from "../screens/SelectStoresScreen";
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
      <Stack.Screen name="ManageCategories" component={ManageCategoriesScreen} />
      <Stack.Screen name="SelectStores" component={SelectStoresScreen} />
    </Stack.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          position: "absolute",
          bottom: 30,
          left: "40%",
          right: "40%",
          height: 70,
          backgroundColor: "transparent",
          borderRadius: 35,
          borderWidth: 0,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.3,
          shadowRadius: 20,
          elevation: 10,
          paddingBottom: 0,
          paddingTop: 0,
        },
        tabBarBackground: () => (
          <BlurView
            intensity={5}
            tint="dark"
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              borderRadius: 35,
              overflow: "hidden",
              backgroundColor: Platform.OS === "ios"
                ? "rgba(37, 72, 99, 0.32)"
                : "rgba(37, 72, 99, 0.6)",
              borderWidth: 1.5,
              borderColor: "rgba(255, 255, 255, 0.15)",
            }}
          />
        ),
      }}
    >
      <Tab.Screen
        name="Inventory"
        component={InventoryStack}
        options={{
          tabBarIcon: () => (
            <View style={[styles.tabItem, { transform: [{ translateX: 28 }] }]}>
              <FontAwesome5 name="warehouse" size={22} color="#FFFFFF" solid />
              <Text style={styles.label} numberOfLines={1}>Garage</Text>
            </View>
          ),
          tabBarButton: (props) => (
            <Pressable
              {...props}
              android_ripple={{ color: "transparent" }}
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "transparent",
              }}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Add"
        component={ScanItemScreen}
        options={{
          tabBarIcon: () => (
            <View
              style={{
                width: 60,
                height: 60,
                borderRadius: 30,
                backgroundColor: Colors.accent,
                justifyContent: "center",
                alignItems: "center",
                marginBottom: 30,
                shadowColor: Colors.accent,
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.5,
                shadowRadius: 12,
                elevation: 12,
                borderWidth: 3,
                borderColor: "rgba(255, 255, 255, 0.2)",
              }}
            >
              <Ionicons name="add" size={36} color="white" />
            </View>
          ),
          tabBarButton: (props) => (
            <Pressable
              {...props}
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
              }}
            />
          ),
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
          tabBarIcon: () => (
            <View style={[styles.tabItem, { transform: [{ translateX: -28 }] }]}>
              <Ionicons name="qr-code" size={22} color="#FFFFFF" />
              <Text style={styles.label} numberOfLines={1}>Scan QR</Text>
            </View>
          ),
          tabBarButton: (props) => (
            <Pressable
              {...props}
              android_ripple={{ color: "transparent" }}
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "transparent",
              }}
            />
          ),
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

const styles = StyleSheet.create({
  tabItem: {
    alignItems: "center",
    justifyContent: "center",
    minWidth: 60,
  },
  label: {
    fontSize: 11,
    fontWeight: "600",
    color: "#FFFFFF",
    marginTop: 4,
    textAlign: "center",
  },
});
