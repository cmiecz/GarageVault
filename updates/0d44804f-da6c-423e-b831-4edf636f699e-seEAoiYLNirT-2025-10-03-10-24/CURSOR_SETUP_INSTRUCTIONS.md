# 🚀 Setup GarageVault in Cursor - Quick Guide

## Step 1: Clone from GitHub

```bash
cd ~/Documents
git clone https://github.com/cmiecz/GarageVault.git
cd GarageVault
```

## Step 2: Open in Cursor

1. Open Cursor
2. File → Open Folder
3. Select: `/Users/cassmieczakowski/Documents/GarageVault`

## Step 3: Make These 2 Quick Updates

### UPDATE 1: app.json

**Line 44-50** - Remove `microphonePermission` line:

FIND:
```json
    "plugins": [
      [
        "expo-camera",
        {
          "cameraPermission": "Allow Garage Vault to access your camera to scan items and QR codes.",
          "microphonePermission": false
        }
      ],
```

REPLACE WITH:
```json
    "plugins": [
      [
        "expo-camera",
        {
          "cameraPermission": "Allow Garage Vault to access your camera to scan items and QR codes."
        }
      ],
```

**End of file** - Add CLI config (after line 64, before final `}`):

FIND the end:
```json
    }
  }
}
```

REPLACE WITH:
```json
    }
  },
  "cli": {
    "appVersionSource": "remote"
  }
}
```

### UPDATE 2: src/screens/SettingsScreen.tsx

**Line 247** - Update Privacy URL:
```typescript
onPress={() => Linking.openURL("https://garagevault.onrender.com/privacy.html")}
```

**Line 257** - Update Terms URL:
```typescript
onPress={() => Linking.openURL("https://garagevault.onrender.com/terms.html")}
```

**Line 267** - Update Support Email:
```typescript
onPress={() => Linking.openURL("mailto:support@garagevault.app")}
```

## Step 4: Install Dependencies

In Cursor's integrated terminal:

```bash
npm install
```

## Step 5: Setup EAS & Build

```bash
# Login to Expo
eas login

# Configure EAS (creates project)
eas build:configure

# Build for iOS
eas build --platform ios --profile production
```

## ✅ That's It!

Your build will start and take 15-20 minutes. You'll get a link to download the .ipa file.

---

**Need Help?** The build process will give you a URL to track progress.
