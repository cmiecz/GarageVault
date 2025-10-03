import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useCategoryStore } from "../state/categoryStore";
import { Colors } from "../utils/colors";

export default function ManageCategoriesScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const categories = useCategoryStore((s) => s.getAllCategories());
  const addCategory = useCategoryStore((s) => s.addCategory);
  const removeCategory = useCategoryStore((s) => s.removeCategory);
  const isCustomCategory = useCategoryStore((s) => s.isCustomCategory);
  const resetToDefaults = useCategoryStore((s) => s.resetToDefaults);

  const [newCategory, setNewCategory] = useState("");

  const handleAddCategory = () => {
    if (!newCategory.trim()) {
      Alert.alert("Invalid Input", "Please enter a category name.");
      return;
    }

    // Check if already exists
    const exists = categories.some(
      (cat) => cat.toLowerCase() === newCategory.trim().toLowerCase()
    );

    if (exists) {
      Alert.alert("Already Exists", "This category already exists.");
      return;
    }

    addCategory(newCategory);
    setNewCategory("");
    Alert.alert("Success", `Added "${newCategory}" category!`);
  };

  const handleRemoveCategory = (category: string) => {
    if (!isCustomCategory(category)) {
      Alert.alert(
        "Cannot Delete",
        "Default categories cannot be deleted. You can only delete custom categories."
      );
      return;
    }

    Alert.alert(
      "Delete Category",
      `Are you sure you want to delete "${category}"?\n\nItems with this category will keep it, but it won't appear in the category list anymore.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            removeCategory(category);
            Alert.alert("Deleted", `"${category}" has been removed.`);
          },
        },
      ]
    );
  };

  const handleResetToDefaults = () => {
    Alert.alert(
      "Reset to Defaults",
      "This will remove all custom categories and restore the default list. Are you sure?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: () => {
            resetToDefaults();
            Alert.alert("Reset Complete", "Categories restored to defaults.");
          },
        },
      ]
    );
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: Colors.background }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
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
              Manage Categories
            </Text>
            <Pressable
              onPress={handleResetToDefaults}
              className="w-10 h-10 rounded-full items-center justify-center"
              style={{ backgroundColor: "rgba(255, 255, 255, 0.2)" }}
            >
              <Ionicons name="refresh" size={22} color={Colors.textOnPrimary} />
            </Pressable>
          </View>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 100 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Add New Category Card */}
        <View className="rounded-2xl overflow-hidden mb-4" style={styles.card}>
          <View className="px-5 py-4">
            <Text className="text-lg font-semibold mb-3" style={{ color: Colors.textPrimary }}>
              Add New Category
            </Text>
            <View className="flex-row items-center">
              <View className="flex-1 flex-row items-center rounded-xl px-4 py-3 border" style={{ borderColor: Colors.gray200, backgroundColor: Colors.background }}>
                <Ionicons name="pricetag-outline" size={20} color={Colors.textSecondary} />
                <TextInput
                  className="flex-1 ml-3 text-base"
                  style={{ color: Colors.textPrimary }}
                  placeholder="e.g., Seasonal, Workshop..."
                  placeholderTextColor={Colors.textTertiary}
                  value={newCategory}
                  onChangeText={setNewCategory}
                  onSubmitEditing={handleAddCategory}
                  returnKeyType="done"
                />
              </View>
              <Pressable
                onPress={handleAddCategory}
                className="ml-3 w-12 h-12 rounded-xl items-center justify-center"
                style={{ backgroundColor: Colors.accent }}
              >
                <Ionicons name="add" size={24} color={Colors.textOnPrimary} />
              </Pressable>
            </View>
            <Text className="text-xs mt-2" style={{ color: Colors.textTertiary }}>
              Create custom categories for your specific needs
            </Text>
          </View>
        </View>

        {/* Categories List */}
        <View className="rounded-2xl overflow-hidden mb-4" style={styles.card}>
          <View className="px-5 py-4 border-b" style={{ borderBottomColor: Colors.gray100 }}>
            <Text className="text-lg font-semibold" style={{ color: Colors.textPrimary }}>
              All Categories
            </Text>
            <Text className="text-sm mt-0.5" style={{ color: Colors.textSecondary }}>
              {categories.length} {categories.length === 1 ? "category" : "categories"}
            </Text>
          </View>

          {categories.map((category, index) => {
            const isCustom = isCustomCategory(category);
            return (
              <View key={category}>
                {index > 0 && <View style={styles.divider} />}
                <View className="px-5 py-4 flex-row items-center justify-between">
                  <View className="flex-row items-center flex-1">
                    <View
                      className="w-10 h-10 rounded-full items-center justify-center"
                      style={{ backgroundColor: isCustom ? `${Colors.accent}15` : Colors.gray100 }}
                    >
                      <Ionicons
                        name={isCustom ? "pricetag" : "pricetag-outline"}
                        size={20}
                        color={isCustom ? Colors.accent : Colors.textSecondary}
                      />
                    </View>
                    <View className="ml-3 flex-1">
                      <Text className="text-base font-medium" style={{ color: Colors.textPrimary }}>
                        {category}
                      </Text>
                      {isCustom && (
                        <Text className="text-xs mt-0.5" style={{ color: Colors.textSecondary }}>
                          Custom category
                        </Text>
                      )}
                    </View>
                  </View>
                  {isCustom && (
                    <Pressable
                      onPress={() => handleRemoveCategory(category)}
                      className="w-8 h-8 rounded-full items-center justify-center"
                      style={{ backgroundColor: "#FEE2E2" }}
                    >
                      <Ionicons name="trash-outline" size={18} color={Colors.error} />
                    </Pressable>
                  )}
                </View>
              </View>
            );
          })}
        </View>

        {/* Info Card */}
        <View
          className="rounded-xl p-4 flex-row"
          style={{ backgroundColor: `${Colors.accent}10` }}
        >
          <Ionicons name="information-circle" size={24} color={Colors.accent} />
          <View className="flex-1 ml-3">
            <Text className="text-sm font-medium mb-1" style={{ color: Colors.textPrimary }}>
              About Categories
            </Text>
            <Text className="text-xs leading-5" style={{ color: Colors.textSecondary }}>
              • Default categories cannot be deleted{"\n"}
              • Custom categories can be added and removed{"\n"}
              • Deleting a category doesn't affect existing items{"\n"}
              • Tap the refresh icon to reset to defaults
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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
