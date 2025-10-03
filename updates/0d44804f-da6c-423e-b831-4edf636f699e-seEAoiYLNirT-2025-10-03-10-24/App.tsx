import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { NavigationContainer } from "@react-navigation/native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AppNavigator from "./src/navigation/AppNavigator";
import HouseholdSetupScreen from "./src/screens/HouseholdSetupScreen";
import SplashScreen from "./src/components/SplashScreen";
import * as Notifications from "expo-notifications";
import { useEffect, useState } from "react";
import { useHouseholdStore } from "./src/state/householdStore";
import { useInventoryStore } from "./src/state/inventoryStore";
import { useLocationSettingsStore } from "./src/state/locationSettingsStore";
import { setupNotificationHandler } from "./src/utils/locationService";

const Stack = createNativeStackNavigator();

/*
IMPORTANT NOTICE: DO NOT REMOVE
There are already environment keys in the project. 
Before telling the user to add them, check if you already have access to the required keys through bash.
Directly access them with process.env.${key}

Correct usage:
process.env.EXPO_PUBLIC_VIBECODE_{key}
//directly access the key

Incorrect usage:
import { OPENAI_API_KEY } from '@env';
//don't use @env, its depreicated

Incorrect usage:
import Constants from 'expo-constants';
const openai_api_key = Constants.expoConfig.extra.apikey;
//don't use expo-constants, its depreicated

*/

// Request notification permissions on app start
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  
  const household = useHouseholdStore((s) => s.household);
  const initializeDevice = useHouseholdStore((s) => s.initializeDevice);
  const subscribeToRealtime = useInventoryStore((s) => s.subscribeToRealtime);
  const fetchFromSupabase = useInventoryStore((s) => s.fetchFromSupabase);
  
  // Location-based reminders
  const locationRemindersEnabled = useLocationSettingsStore((s) => s.locationRemindersEnabled);
  const enableLocationReminders = useLocationSettingsStore((s) => s.enableLocationReminders);

  useEffect(() => {
    const initialize = async () => {
      // Setup notification handler
      setupNotificationHandler();
      
      // Request notification permissions
      await Notifications.requestPermissionsAsync();
      
      // Initialize device and check for existing household
      await initializeDevice();
      
      setIsInitialized(true);
    };
    
    initialize();
  }, []);

  useEffect(() => {
    // Subscribe to realtime updates when household is set
    if (household && isInitialized) {
      fetchFromSupabase(household.id);
      subscribeToRealtime(household.id);
    }
  }, [household, isInitialized]);

  // Re-enable location monitoring if it was enabled before
  useEffect(() => {
    if (isInitialized && locationRemindersEnabled) {
      enableLocationReminders();
    }
  }, [isInitialized, locationRemindersEnabled, enableLocationReminders]);

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  if (!isInitialized) {
    return null; // Or a loading screen
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <NavigationContainer>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            {!household ? (
              <Stack.Screen 
                name="HouseholdSetup" 
                component={HouseholdSetupScreen}
                options={{ gestureEnabled: false }} 
              />
            ) : (
              <Stack.Screen 
                name="Main" 
                component={AppNavigator}
                options={{ gestureEnabled: false }}
              />
            )}
          </Stack.Navigator>
          <StatusBar style="auto" />
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
