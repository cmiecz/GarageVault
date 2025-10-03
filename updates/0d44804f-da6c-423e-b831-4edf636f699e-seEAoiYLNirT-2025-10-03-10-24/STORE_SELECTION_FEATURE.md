# 🏪 Store Selection Feature Update

## 🎯 New Feature: Selective Store Monitoring

Users can now choose **which specific stores** they want to be notified about, instead of getting alerts for all hardware stores.

---

## 📱 User Experience

### **Settings Flow**

1. **Enable Store Reminders** (Settings → Store Reminders toggle)
2. **Select Stores** button appears
3. Tap "Select Stores" → Choose from 7 stores
4. Get notified only at selected stores

### **Store Selection Screen**

**Available Stores:**
- 🔨 Home Depot (Orange)
- 🔧 Lowes (Blue)
- 💾 Ace Hardware (Red)
- 🏠 Menards (Gold)
- 🔨 Harbor Freight (Orange)
- ⚙️ True Value (Blue)
- 🌿 Tractor Supply (Green)

**Quick Actions:**
- **Select All** - Enable all 7 stores
- **Deselect All** - Disable all stores

**Features:**
- ✅ Toggle individual stores on/off
- ✅ Visual checkmarks for selected stores
- ✅ Store-specific colors and icons
- ✅ Shows "X of 7 stores selected"
- ✅ Warning if no stores selected

---

## 🎨 UI Design

### **Settings Screen - Store Reminders**
```
Preferences
├── 🔔 Notifications
├── 📍 Store Reminders              [Toggle]
│    "3 stores selected"
└── 🏪 Select Stores               →
     "3 of 7 stores selected"
```

### **Select Stores Screen**
```
┌─────────────────────────────────┐
│ ←  Select Stores                │
└─────────────────────────────────┘

┌──────────────┬──────────────────┐
│ Select All   │  Deselect All    │
└──────────────┴──────────────────┘

ℹ️  Choose Your Stores
   You will only be notified when near
   selected stores.

┌─────────────────────────────────┐
│  Hardware Stores                 │
│  3 of 7 selected                 │
│─────────────────────────────────│
│  🔨 Home Depot            ✓     │
│  🔧 Lowes                 ✓     │
│  💾 Ace Hardware          ○     │
│  🏠 Menards               ✓     │
│  🔨 Harbor Freight        ○     │
│  ⚙️  True Value            ○     │
│  🌿 Tractor Supply        ○     │
└─────────────────────────────────┘

⚠️  Warning appears if none selected
```

---

## 🏗️ Technical Implementation

### **Files Created**

1. **`src/screens/SelectStoresScreen.tsx`**
   - Full store selection UI
   - Select/deselect all buttons
   - Individual store toggles
   - Store-specific styling

### **Files Modified**

1. **`src/state/locationSettingsStore.ts`**
   - Added `selectedStores: StoreChain[]`
   - Added `toggleStore()` method
   - Added `selectAllStores()` method
   - Added `deselectAllStores()` method
   - Default: All stores enabled

2. **`src/utils/locationService.ts`**
   - Updated `isNearHardwareStore()` to accept `selectedStores` parameter
   - Only checks for stores in the selected list
   - Handles "Lowes" vs "Lowe's" variations

3. **`src/utils/locationMonitoring.ts`**
   - Fetches `selectedStores` from settings
   - Passes to `isNearHardwareStore()`
   - Won't notify if no stores selected

4. **`src/screens/SettingsScreen.tsx`**
   - Shows count of selected stores
   - "Select Stores" button (only when enabled)
   - Navigate to SelectStoresScreen

5. **`src/navigation/AppNavigator.tsx`**
   - Added SelectStoresScreen route

---

## 💾 Data Persistence

**Stored in AsyncStorage:**
```typescript
{
  locationRemindersEnabled: boolean,
  selectedStores: ["Home Depot", "Lowes", "Menards"],
  lastNotificationTime: number | null
}
```

**Default Behavior:**
- All 7 stores selected by default
- Users can customize their list
- Selections persist across app restarts

---

## 🔄 User Flow Examples

### **Example 1: First Time Setup**
1. User opens Settings
2. Toggles "Store Reminders" ON
3. Grants location permissions
4. Grants notification permissions
5. Feature enabled with all 7 stores
6. User taps "Select Stores"
7. Deselects stores they don't visit
8. Keeps Home Depot and Lowes
9. Done! Only notified at those 2 stores

### **Example 2: Change Preferences**
1. User at Ace Hardware (not selected)
2. No notification received ✓
3. User realizes they shop there
4. Opens Settings → Select Stores
5. Taps "Ace Hardware" to enable
6. Next visit → Notification works! 🎉

### **Example 3: Temporarily Disable All**
1. User going on vacation
2. Settings → Select Stores
3. Tap "Deselect All"
4. Warning shows: "No stores selected"
5. Returns home
6. Tap "Select All"
7. Back to normal!

---

## ✅ Benefits

**For Users:**
- ✨ **More Control** - Choose exactly which stores matter
- ✨ **Less Noise** - No unwanted notifications
- ✨ **Flexibility** - Easy to add/remove stores
- ✨ **Visual Feedback** - Clear which stores are active

**For App:**
- ⚡ **Battery Efficient** - Fewer store checks
- 🎯 **Better UX** - Relevant notifications only
- 📊 **User Insights** - See which stores are popular

---

## 🧪 Testing Checklist

- [✅] Select individual stores
- [✅] Select all stores button
- [✅] Deselect all stores button
- [✅] Settings shows correct count
- [✅] No notification when store not selected
- [✅] Notification works for selected stores
- [✅] Selections persist after app restart
- [✅] Warning appears when none selected
- [✅] "Lowes" matches "Lowe's" in addresses

---

## 🚀 Future Enhancements

Potential improvements:
1. **Store Distance** - Show "2.3 miles away"
2. **Most Visited** - Auto-suggest based on history
3. **Store Hours** - Don't notify if closed
4. **Custom Stores** - Add local hardware stores
5. **Store Notes** - "Best prices on paint"
6. **Route Optimization** - "Passing by on your way home"

---

## 📝 Documentation Updates

### **User Guide**

**How to Select Stores:**
1. Settings → Store Reminders → Toggle ON
2. Tap "Select Stores"
3. Tap stores to toggle selection
4. Checkmark = selected
5. Tap "Select All" or "Deselect All" for quick changes

**Tip:** Only select stores you visit regularly for best results!

---

## ✅ Status

**Feature Status:** ✅ Complete and Production Ready!

Users now have full control over which stores trigger notifications. Much better user experience!

---

**Updated:** October 2, 2025
**Feature:** Selective Store Monitoring
**Impact:** More relevant notifications, less notification fatigue
