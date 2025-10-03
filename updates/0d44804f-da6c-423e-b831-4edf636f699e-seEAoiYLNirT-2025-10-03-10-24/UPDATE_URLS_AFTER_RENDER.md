# 🔧 Update App URLs After Render Deployment

After you deploy your website to Render.com, you'll get a URL like:
```
https://garagevault-website.onrender.com
```

## Step 1: Get Your Render URLs

Once deployed, your pages will be at:
- **Privacy Policy:** `https://YOUR-SITE.onrender.com/privacy.html`
- **Terms of Service:** `https://YOUR-SITE.onrender.com/terms.html`
- **Home Page:** `https://YOUR-SITE.onrender.com/`

## Step 2: Update Settings Screen

Open the file: `/src/screens/SettingsScreen.tsx`

Find these three lines and replace the placeholder URLs:

### Line 247 - Privacy Policy
**Find:**
```typescript
onPress={() => Linking.openURL("https://yourdomain.com/privacy")}
```

**Replace with:**
```typescript
onPress={() => Linking.openURL("https://YOUR-ACTUAL-SITE.onrender.com/privacy.html")}
```

### Line 257 - Terms of Service
**Find:**
```typescript
onPress={() => Linking.openURL("https://yourdomain.com/terms")}
```

**Replace with:**
```typescript
onPress={() => Linking.openURL("https://YOUR-ACTUAL-SITE.onrender.com/terms.html")}
```

### Line 267 - Support Email
**Find:**
```typescript
onPress={() => Linking.openURL("mailto:support@yourdomain.com")}
```

**Replace with:**
```typescript
onPress={() => Linking.openURL("mailto:YOUR-EMAIL@gmail.com")}
```
(or use `support@garagevault.app` if you set up that email)

## Step 3: Test the Links

1. Save the file
2. Restart the dev server if needed
3. Open the app
4. Go to Settings
5. Tap each link to verify they open correctly:
   - ✅ Privacy Policy opens in browser
   - ✅ Terms of Service opens in browser
   - ✅ Support opens email app

## Step 4: Update App Store Connect

When filling out App Store Connect metadata, use the same URLs:
- **Privacy Policy URL:** `https://YOUR-SITE.onrender.com/privacy.html`
- **Support URL:** `https://YOUR-SITE.onrender.com/` (or your support email)
- **Marketing URL:** `https://YOUR-SITE.onrender.com/` (optional)

---

## ✅ Quick Checklist

- [ ] Deployed website to Render.com
- [ ] Copied my Render URL
- [ ] Updated line 247 in SettingsScreen.tsx (Privacy)
- [ ] Updated line 257 in SettingsScreen.tsx (Terms)
- [ ] Updated line 267 in SettingsScreen.tsx (Support email)
- [ ] Tested all 3 links in the app
- [ ] Ready to proceed with EAS build!

---

## Example (After Update)

Here's what your SettingsScreen.tsx should look like after updating:

```typescript
<SettingsRow
  icon="document-text"
  iconColor={Colors.textSecondary}
  iconBg={Colors.gray100}
  label="Privacy Policy"
  onPress={() => Linking.openURL("https://garagevault-website.onrender.com/privacy.html")}
  showChevron={false}
  showExternal
/>
<View style={styles.divider} />
<SettingsRow
  icon="document-text"
  iconColor={Colors.textSecondary}
  iconBg={Colors.gray100}
  label="Terms of Service"
  onPress={() => Linking.openURL("https://garagevault-website.onrender.com/terms.html")}
  showChevron={false}
  showExternal
/>
<View style={styles.divider} />
<SettingsRow
  icon="help-circle"
  iconColor={Colors.textSecondary}
  iconBg={Colors.gray100}
  label="Support & Feedback"
  onPress={() => Linking.openURL("mailto:youremail@gmail.com")}
  showChevron={false}
  showExternal
/>
```

---

**Next Steps After This:**
1. ✅ URLs updated in app
2. ✅ Ready to build for TestFlight
3. Run: `eas build --platform ios --profile production`
