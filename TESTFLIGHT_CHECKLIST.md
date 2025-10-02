# TestFlight Deployment Checklist for Garage Vault

## ✅ Prerequisites (What You Need)

### 1. Apple Developer Account
- [ ] Enroll in Apple Developer Program ($99/year)
- [ ] Go to: https://developer.apple.com/programs/
- [ ] Wait for approval (can take 24-48 hours)

### 2. App Store Connect Setup
- [ ] Log into App Store Connect: https://appstoreconnect.apple.com
- [ ] Create a new app listing
- [ ] App Name: "Garage Vault"
- [ ] Bundle ID: `com.garagevault.app` (must match app.json)
- [ ] Primary Language: English
- [ ] Category: Productivity

### 3. Required Assets

#### App Icon (Required)
- [ ] 1024x1024px PNG (no transparency, no rounded corners)
- Location: `./assets/images/icon.png`
- Currently using: `logo.jpg` - **NEEDS TO BE UPDATED**

#### Screenshots (Required for each device size)
- [ ] 6.7" Display (iPhone 15 Pro Max): 1290 x 2796 px (3-10 screenshots)
- [ ] 6.5" Display (iPhone 11 Pro Max): 1242 x 2688 px (3-10 screenshots)
- [ ] 5.5" Display (iPhone 8 Plus): 1242 x 2208 px (3-10 screenshots)

#### Optional but Recommended
- [ ] App Preview Videos (15-30 seconds per device size)

### 4. App Store Information

#### Marketing
- [ ] App Name: "Garage Vault"
- [ ] Subtitle: "Inventory Unlocked" (30 chars max)
- [ ] Description (4000 chars):
```
Garage Vault is the ultimate inventory management app for your garage, workshop, and storage spaces. Keep track of tools, fasteners, paint, hardware, and all your items with ease.

KEY FEATURES:
• AI-Powered Scanning - Take a photo and automatically identify products
• QR Code Organization - Generate QR codes for storage containers
• Smart Inventory - Track quantities, get low stock alerts
• Paint Management - Track paint colors, formulas, and room assignments
• Storage Locations - Organize items by bins, drawers, shelves, and more
• Visual Gauges - See at a glance how much of each item remains
• Category Filters - Quickly find items by category
• Offline First - Works without internet, syncs when connected

PERFECT FOR:
• Homeowners organizing garages
• DIY enthusiasts and makers
• Contractors managing job site materials
• Anyone tired of buying duplicate items

Never wonder "do I have this?" again. Scan, organize, and unlock your inventory!
```

- [ ] Keywords (100 chars): "garage,inventory,organization,tools,paint,storage,QR,scanner"
- [ ] Support URL: https://yourdomain.com/support
- [ ] Marketing URL: https://yourdomain.com
- [ ] Privacy Policy URL: https://yourdomain.com/privacy (REQUIRED)

#### App Review Information
- [ ] Contact Email: your-email@domain.com
- [ ] Contact Phone: +1-xxx-xxx-xxxx
- [ ] Demo Account (if login required): N/A
- [ ] Notes for Reviewer:
```
Garage Vault is an inventory management app. No login required for basic features.

TESTING INSTRUCTIONS:
1. Tap the center "+" button to scan an item
2. Take a photo of any product (paint can, tool, etc.)
3. AI will automatically extract product details
4. Item is added to your inventory
5. Navigate to "Settings" to see storage locations

The app uses:
- Camera: For scanning items and QR codes
- Photo Library: For selecting existing photos
- AI Vision (OpenAI GPT-4o): For product identification
```

### 5. Legal Documents (REQUIRED)

#### Privacy Policy
- [✅] Create privacy policy covering:
  - What data is collected (photos, inventory data)
  - How data is used (AI analysis, local storage)
  - Third-party services (OpenAI API)
  - Data retention and deletion
  - User rights
- [ ] Host on Render.com (see deployment guide below)
- [✅] Link added to app (Already in Settings - needs URL update)

#### Terms of Service
- [✅] Create terms of service
- [ ] Host on Render.com (see deployment guide below)
- [✅] Link added to app (Already in Settings - needs URL update)

#### **🚨 IMPORTANT: Deploy Legal Pages First!**

**Files Ready:** ✅ All HTML files are in `/website/` folder
- `website/index.html` - Landing page
- `website/privacy.html` - Privacy Policy (ready)
- `website/terms.html` - Terms of Service (ready)
- `website/README.md` - Deployment instructions

**Deploy to Render.com:**
1. [ ] Log into https://render.com
2. [ ] Click "New +" → "Static Site"
3. [ ] Connect your GitHub repo
4. [ ] Configure:
   - Root Directory: `website`
   - Build Command: (leave blank)
   - Publish Directory: `website`
5. [ ] Deploy (takes 2-3 minutes)
6. [ ] Copy your Render URL (e.g., `https://garagevault.onrender.com`)
7. [ ] Update URLs in `/src/screens/SettingsScreen.tsx`:
   - Line 247: Privacy Policy URL
   - Line 257: Terms of Service URL
   - Line 267: Support email

**📖 Full Deployment Guide:** See `/website/README.md`

### 6. Export Compliance
- [ ] Declare if app uses encryption (typically YES for HTTPS)
- [ ] Most apps: "Your app uses standard encryption" → No export documentation needed

---

## 🚀 Build & Deploy Steps

### Step 1: Update App Configuration
```bash
cd /home/user/workspace
```

Update `app.json` with all metadata (see updated file below)

### Step 2: Install EAS CLI
```bash
npm install -g eas-cli
eas login
```

### Step 3: Configure EAS Build
```bash
eas build:configure
```

### Step 4: Build for iOS
```bash
eas build --platform ios --profile production
```

This will:
- Build your app in the cloud
- Generate an .ipa file
- Takes 10-20 minutes

### Step 5: Submit to TestFlight
```bash
eas submit --platform ios
```

Or manually:
1. Download .ipa from Expo dashboard
2. Use Transporter app (Mac App Store)
3. Upload to App Store Connect
4. Wait for processing (15-60 minutes)

### Step 6: Configure TestFlight
1. Go to App Store Connect → TestFlight
2. Add "What to Test" notes for testers
3. Enable automatic distribution
4. Invite internal testers (up to 100)
5. Submit for Beta Review (required for external testers)

---

## ⚠️ Common Issues & Fixes

### Build Failures
- **Missing icon**: Update icon.png to 1024x1024
- **Bundle ID mismatch**: Ensure consistency across files
- **Permissions missing**: Already configured ✅

### Rejection Reasons
- **No privacy policy**: Create and link ✅ Already done
- **Incomplete metadata**: Fill all required fields
- **Missing screenshots**: Provide for all device sizes
- **Crash on launch**: Test thoroughly first

### TestFlight Limits
- Internal testers: 100 (no review needed)
- External testers: 10,000 (requires Apple review)
- Build expires after 90 days
- Max 100 builds per app

---

## 📋 Quick Checklist

Before submitting:
- [ ] App icon is 1024x1024 PNG
- [ ] All permissions explained
- [ ] Privacy policy live and linked
- [ ] App tested on physical device
- [ ] No placeholder text or URLs
- [ ] Version number incremented
- [ ] Screenshots prepared
- [ ] App Store metadata written
- [ ] Contact info updated
- [ ] Build successful
- [ ] .ipa uploaded

---

## 🎯 Estimated Timeline

- App Icon Creation: 1 hour
- Screenshots: 2-3 hours
- Privacy Policy: 2 hours (or use generator)
- First Build: 20 minutes
- TestFlight Processing: 30-60 minutes
- Beta App Review (external): 24-48 hours

**Total: 1-2 days** to first TestFlight build

---

## 📞 Need Help?

- Expo Docs: https://docs.expo.dev/submit/ios/
- EAS Build: https://docs.expo.dev/build/introduction/
- TestFlight Guide: https://developer.apple.com/testflight/

Good luck with your launch! 🚀
