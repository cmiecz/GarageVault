import React from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useLocationSettingsStore, ALL_STORE_CHAINS, StoreChain } from "../state/locationSettingsStore";
import { Colors } from "../utils/colors";

// Store icons and colors
const STORE_INFO: Record<StoreChain, { icon: keyof typeof Ionicons.glyphMap; color: string }> = {
  "Home Depot": { icon: "hammer", color: "#F96302" },
  "Lowes": { icon: "construct", color: "#004990" },
  "Ace Hardware": { icon: "hardware-chip", color: "#D11E28" },
  "Menards": { icon: "home", color: "#FFD700" },
  "Harbor Freight": { icon: "build", color: "#FF6B35" },
  "True Value": { icon: "settings", color: "#1E5BA8" },
  "Tractor Supply": { icon: "leaf", color: "#006341" },
};

export default function SelectStoresScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const selectedStores = useLocationSettingsStore((s) => s.selectedStores);
  const toggleStore = useLocationSettingsStore((s) => s.toggleStore);
  const selectAllStores = useLocationSettingsStore((s) => s.selectAllStores);
  const deselectAllStores = useLocationSettingsStore((s) => s.deselectAllStores);

  const allSelected = selectedStores.length === ALL_STORE_CHAINS.length;
  const noneSelected = selectedStores.length === 0;

  return (
    <View className="flex-1" style={{ backgroundColor: Colors.background }}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <View className="px-5 pb-5">
          <View className="flex-row items-center justify-between">
            <Pressable
              onPress={() => navigation.goBack()}
              className="w-10 h-10 rounded-full items-center justify-center"
              style={{ backgroundColor: "rgba(255, 255, 255, 0.2)" }}
            >
              <Ionicons name="arrow-back" size={22} color={Colors.textOnPrimary} />
            </Pressable>
            <Text className="text-xl font-semibold" style={{ color: Colors.textOnPrimary }}>
              Select Stores
            </Text>
            <View className="w-10" />
          </View>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Quick Actions */}
        <View className="flex-row gap-3 mb-4">
          <Pressable
            onPress={selectAllStores}
            disabled={allSelected}
            className="flex-1 rounded-xl px-4 py-3 flex-row items-center justify-center"
            style={{
              backgroundColor: allSelected ? Colors.gray100 : Colors.accent,
              opacity: allSelected ? 0.5 : 1,
            }}
          >
            <Ionicons
              name="checkmark-done"
              size={20}
              color={allSelected ? Colors.textSecondary : Colors.textOnPrimary}
            />
            <Text
              className="text-sm font-semibold ml-2"
              style={{ color: allSelected ? Colors.textSecondary : Colors.textOnPrimary }}
            >
              Select All
            </Text>
          </Pressable>

          <Pressable
            onPress={deselectAllStores}
            disabled={noneSelected}
            className="flex-1 rounded-xl px-4 py-3 flex-row items-center justify-center border"
            style={{
              borderColor: noneSelected ? Colors.gray200 : Colors.accent,
              backgroundColor: Colors.cardBackground,
              opacity: noneSelected ? 0.5 : 1,
            }}
          >
            <Ionicons
              name="close-circle"
              size={20}
              color={noneSelected ? Colors.textSecondary : Colors.accent}
            />
            <Text
              className="text-sm font-semibold ml-2"
              style={{ color: noneSelected ? Colors.textSecondary : Colors.accent }}
            >
              Deselect All
            </Text>
          </Pressable>
        </View>

        {/* Info Card */}
        <View
          className="rounded-xl p-4 mb-4 flex-row"
          style={{ backgroundColor: `${Colors.accent}10` }}
        >
          <Ionicons name="information-circle" size={24} color={Colors.accent} />
          <View className="flex-1 ml-3">
            <Text className="text-sm font-medium mb-1" style={{ color: Colors.textPrimary }}>
              Choose Your Stores
            </Text>
            <Text className="text-xs leading-5" style={{ color: Colors.textSecondary }}>
              You will only be notified when near selected stores. Choose stores you frequently visit.
            </Text>
          </View>
        </View>

        {/* Store List */}
        <View className="rounded-2xl overflow-hidden mb-4" style={styles.card}>
          <View className="px-5 py-4 border-b" style={{ borderBottomColor: Colors.gray100 }}>
            <Text className="text-lg font-semibold" style={{ color: Colors.textPrimary }}>
              Hardware Stores
            </Text>
            <Text className="text-sm mt-0.5" style={{ color: Colors.textSecondary }}>
              {selectedStores.length} of {ALL_STORE_CHAINS.length} selected
            </Text>
          </View>

          {ALL_STORE_CHAINS.map((store, index) => {
            const isSelected = selectedStores.includes(store);
            const storeInfo = STORE_INFO[store];

            return (
              <View key={store}>
                {index > 0 && <View style={styles.divider} />}
                <Pressable
                  onPress={() => toggleStore(store)}
                  className="px-5 py-4 flex-row items-center justify-between"
                >
                  <View className="flex-row items-center flex-1">
                    <View
                      className="w-10 h-10 rounded-full items-center justify-center"
                      style={{
                        backgroundColor: isSelected ? `${storeInfo.color}20` : Colors.gray100,
                      }}
                    >
                      <Ionicons
                        name={storeInfo.icon}
                        size={20}
                        color={isSelected ? storeInfo.color : Colors.textSecondary}
                      />
                    </View>
                    <Text
                      className="text-base font-medium ml-3"
                      style={{ color: Colors.textPrimary }}
                    >
                      {store}
                    </Text>
                  </View>

                  {/* Checkmark */}
                  <View
                    className="w-6 h-6 rounded-full items-center justify-center border-2"
                    style={{
                      borderColor: isSelected ? Colors.accent : Colors.gray300,
                      backgroundColor: isSelected ? Colors.accent : "transparent",
                    }}
                  >
                    {isSelected && (
                      <Ionicons name="checkmark" size={16} color={Colors.textOnPrimary} />
                    )}
                  </View>
                </Pressable>
              </View>
            );
          })}
        </View>

        {/* Warning if none selected */}
        {noneSelected && (
          <View
            className="rounded-xl p-4 flex-row"
            style={{ backgroundColor: "#FEF3C7" }}
          >
            <Ionicons name="warning" size={24} color="#F59E0B" />
            <View className="flex-1 ml-3">
              <Text className="text-sm font-medium mb-1" style={{ color: "#92400E" }}>
                No Stores Selected
              </Text>
              <Text className="text-xs leading-5" style={{ color: "#78350F" }}>
                You won't receive any store reminders. Select at least one store to enable notifications.
              </Text>
            </View>
          </View>
        )}
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
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.gray200,
    marginLeft: 58,
  },
});
