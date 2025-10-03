import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Default categories that come with the app
const DEFAULT_CATEGORIES = [
  "Fasteners",
  "Tools",
  "Paint",
  "Hardware",
  "Electrical",
  "Plumbing",
  "Automotive",
  "Lumber",
  "Safety",
  "Cleaning",
  "Garden",
  "Other",
];

interface CategoryState {
  categories: string[];
  customCategories: string[]; // Track user-added categories separately
  
  // Actions
  addCategory: (category: string) => void;
  removeCategory: (category: string) => void;
  getAllCategories: () => string[];
  isCustomCategory: (category: string) => boolean;
  resetToDefaults: () => void;
}

export const useCategoryStore = create<CategoryState>()(
  persist(
    (set, get) => ({
      categories: DEFAULT_CATEGORIES,
      customCategories: [],

      addCategory: (category: string) => {
        const trimmed = category.trim();
        if (!trimmed) return;
        
        const currentCategories = get().categories;
        
        // Check if category already exists (case-insensitive)
        const exists = currentCategories.some(
          (cat) => cat.toLowerCase() === trimmed.toLowerCase()
        );
        
        if (!exists) {
          set({
            categories: [...currentCategories, trimmed],
            customCategories: [...get().customCategories, trimmed],
          });
        }
      },

      removeCategory: (category: string) => {
        // Only allow removing custom categories (not defaults)
        if (!get().isCustomCategory(category)) {
          return;
        }
        
        set({
          categories: get().categories.filter((cat) => cat !== category),
          customCategories: get().customCategories.filter((cat) => cat !== category),
        });
      },

      getAllCategories: () => {
        return get().categories.sort();
      },

      isCustomCategory: (category: string) => {
        return get().customCategories.includes(category);
      },

      resetToDefaults: () => {
        set({
          categories: DEFAULT_CATEGORIES,
          customCategories: [],
        });
      },
    }),
    {
      name: "category-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
