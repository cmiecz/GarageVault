# 🏪 Smart Store Location Reminders Feature

## Overview
Garage Vault now includes intelligent location-based reminders that notify you when you're near hardware stores (Home Depot, Lowe's, etc.) if you have low stock items.

## 🎯 How It Works

1. **Enable Feature**: Go to Settings → toggle "Store Reminders"
2. **Grant Permissions**: App requests location and notification permissions
3. **Background Monitoring**: App monitors your location (battery efficient)
4. **Smart Detection**: When you're near a hardware store, checks if you have low stock items
5. **Push Notification**: Get notified: "You're at Home Depot! 3 items need restocking: screws, paint, drill bits..."
6. **Cooldown**: Won't spam you - only one notification every 2 hours

## 🏗️ Technical Implementation

### Files Created

1. **`src/utils/locationService.ts`** - Core location utilities
   - Store detection (Home Depot, Lowe's, Ace Hardware, etc.)
   - Distance calculations (Haversine formula)
   - Permission requests
   - Notification sending

2. **`src/utils/locationMonitoring.ts`** - Background monitoring
   - Location watch with battery optimization
   - 100m distance intervals
   - 5-minute time intervals
   - 2-hour notification cooldown

3. **`src/state/locationSettingsStore.ts`** - Zustand store
   - Persists location reminder settings
   - Enable/disable monitoring
   - Tracks last notification time

### Files Modified

1. **`App.tsx`**
   - Initializes notification handler on app start
   - Re-enables location monitoring if it was previously enabled
   - Handles app lifecycle for location monitoring

2. **`src/screens/SettingsScreen.tsx`**
   - Added "Store Reminders" toggle in Preferences section
   - Permission request handling
   - User-friendly alerts and messaging

3. **`app.json`**
   - Added location permissions for iOS and Android
   - Background location mode for iOS
   - Location usage descriptions for App Store compliance

## 📱 User Experience

### Settings UI
```
Preferences
├── Notifications (existing)
└── Store Reminders (NEW)
    ├── Icon: location pin (teal color)
    ├── Title: "Store Reminders"
    ├── Subtitle: "Notify when near Home Depot, Lowe's, etc."
    └── Toggle: ON/OFF
```

### Notification Example
```
🏪 You're at Home Depot!

3 items need restocking:
• 2" Wood Screws
• White Paint
• Drill Bits

[Tap to open Garage Vault]
```

## 🔋 Battery Optimization

- Uses `Accuracy.Balanced` (not high accuracy GPS)
- Only checks location every 100 meters of movement
- Time-based check every 5 minutes minimum
- No continuous GPS tracking
- Stops monitoring when feature is disabled

## 🏬 Supported Stores

Currently detects these hardware store chains:
- Home Depot
- Lowe's / Lowes
- Ace Hardware
- Menards
- Harbor Freight
- True Value
- Tractor Supply

Detection uses reverse geocoding to identify store names in your current location.

## 🔐 Privacy & Permissions

### iOS Permissions Required
- `NSLocationWhenInUseUsageDescription` - Foreground location
- `NSLocationAlwaysAndWhenInUseUsageDescription` - Background location
- `UIBackgroundModes: ["location"]` - Background processing

### Android Permissions Required
- `ACCESS_FINE_LOCATION` - Precise location
- `ACCESS_COARSE_LOCATION` - Approximate location
- `ACCESS_BACKGROUND_LOCATION` - Background monitoring

### Permission Flow
1. User enables "Store Reminders" in Settings
2. App requests location permission (iOS shows dialog)
3. User chooses "While Using" or "Always"
4. App requests notification permission
5. Feature activates when both are granted

## 🧪 Testing

### Test the Feature
```typescript
// In app, import and call:
import { manualLocationCheck } from './src/utils/locationMonitoring';

// Simulate being at a store (for testing)
await manualLocationCheck();
```

### Mock Store Detection
To test without physically going to a store, you can temporarily modify `isNearHardwareStore()` in `locationService.ts` to always return true.

## 🚀 Future Enhancements

Potential improvements:
1. **Custom Store List**: Let users add their favorite local hardware stores
2. **Geofencing**: Use native geofencing APIs for better battery life
3. **Store-Specific Lists**: Different shopping lists for different stores
4. **Route Optimization**: "You're passing by Home Depot on your way home"
5. **Price Comparison**: Show prices at nearby stores
6. **Store Hours**: Don't notify if store is closed

## 📊 App Store Compliance

### Privacy Policy Updates Needed
Add to privacy policy:
```
LOCATION DATA:
Garage Vault may collect location data to provide store proximity 
reminders when you enable this feature. Location data is processed 
locally on your device and is not stored on our servers. You can 
disable this feature at any time in Settings.

We use location data to:
- Detect when you're near hardware stores
- Send helpful reminders about low stock items
- Improve your shopping experience

Location permissions:
- "While Using": Reminders only when app is open
- "Always": Reminders even when app is in background
```

### App Store Review Notes
```
LOCATION USAGE:
Garage Vault requests location access for an optional "Store Reminders" 
feature. When enabled, the app monitors location to detect when users 
are near hardware stores (Home Depot, Lowe's, etc.) and sends 
notifications if they have low stock items in their inventory.

This feature is:
- Completely optional (off by default)
- Clearly explained before requesting permission
- Can be disabled at any time in Settings
- Battery optimized (uses significant location changes)
- Privacy-focused (location not sent to servers)

To test: Enable "Store Reminders" in Settings, grant permissions, 
and simulate being near a hardware store.
```

## 💡 Tips for Users

**Best Practices:**
- Enable "Always Allow" location for automatic reminders
- Keep notifications enabled
- Update your inventory regularly
- Set realistic stock thresholds
- Don't worry about battery - it's optimized!

**Privacy Note:**
Your location is NEVER sent to our servers. All store detection happens locally on your device.

---

## 🛠️ Developer Notes

### Adding New Store Chains

Edit `src/utils/locationService.ts`:
```typescript
const HARDWARE_STORE_CHAINS = [
  "Home Depot",
  "Lowes",
  "Your New Store Name Here",
];
```

### Adjusting Notification Cooldown

Edit `src/utils/locationMonitoring.ts`:
```typescript
const NOTIFICATION_COOLDOWN = 2 * 60 * 60 * 1000; // Change to desired milliseconds
```

### Changing Location Check Interval

Edit `src/utils/locationMonitoring.ts`:
```typescript
const LOCATION_CHECK_INTERVAL = 5 * 60 * 1000; // Change to desired milliseconds
distanceInterval: 100, // Change to desired meters
```

---

**Feature Status:** ✅ Complete and ready for testing!
