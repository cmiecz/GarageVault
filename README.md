# Garage Vault Website - Render.com Deployment Guide

This folder contains the legal pages required for Apple App Store submission.

## Files Included
- `index.html` - Landing page with app description
- `privacy.html` - Privacy Policy (required by Apple)
- `terms.html` - Terms of Service (required by Apple)

## Deploying to Render.com

### Step 1: Prepare Your Repository
The easiest way to deploy to Render is through a Git repository. You have two options:

**Option A: Deploy from this existing repo**
- Just push this `website/` folder to your GitHub repository
- Render will deploy from the repo

**Option B: Create a separate repo for the website**
- Create a new GitHub repository called `garagevault-website`
- Copy the contents of this `website/` folder to that repo
- Push to GitHub

### Step 2: Deploy on Render.com

1. **Log in to Render.com**
   - Go to https://render.com
   - Sign in with your account

2. **Create a New Static Site**
   - Click "New +" button in the top right
   - Select "Static Site"

3. **Connect Your Repository**
   - Connect your GitHub account if not already connected
   - Select your repository (either the main workspace repo or the separate website repo)

4. **Configure the Static Site**
   - **Name**: `garagevault-website` (or any name you prefer)
   - **Branch**: `main` (or your default branch)
   - **Root Directory**: 
     - If using main repo: `website`
     - If using separate repo: leave blank or `.`
   - **Build Command**: Leave blank (no build needed for static HTML)
   - **Publish Directory**: 
     - If using main repo: `website`
     - If using separate repo: `.`

5. **Create the Static Site**
   - Click "Create Static Site"
   - Render will deploy your site (takes ~2-3 minutes)

6. **Get Your URLs**
   After deployment, your site will be available at:
   - **Main site**: `https://garagevault-website.onrender.com` (or your chosen name)
   - **Privacy**: `https://garagevault-website.onrender.com/privacy.html`
   - **Terms**: `https://garagevault-website.onrender.com/terms.html`

### Step 3: Update the App Settings Screen

Once deployed, you need to update the URLs in the app:

1. Open `/src/screens/SettingsScreen.tsx`
2. Replace the placeholder URLs (around lines 247, 257, 267) with your actual Render URLs:
   ```typescript
   // Line 247 - Privacy Policy
   onPress={() => Linking.openURL("https://YOUR-SITE.onrender.com/privacy.html")}
   
   // Line 257 - Terms of Service
   onPress={() => Linking.openURL("https://YOUR-SITE.onrender.com/terms.html")}
   
   // Line 267 - Support Email
   onPress={() => Linking.openURL("mailto:support@garagevault.app")}
   ```

3. Update the support email if you have a different one

### Step 4: Custom Domain (Optional)

If you want a custom domain like `garagevault.com`:

1. Purchase a domain from Namecheap, GoDaddy, etc.
2. In Render dashboard, go to your static site
3. Click "Settings" → "Custom Domain"
4. Add your domain and follow DNS configuration instructions
5. Update the app URLs to use your custom domain

## Testing Your Deployment

Before submitting to Apple, test that all links work:

1. Open the app on your device
2. Go to Settings
3. Tap "Privacy Policy" - should open in browser
4. Tap "Terms of Service" - should open in browser
5. Tap "Support & Feedback" - should open email app

## Troubleshooting

**404 Errors on Render**
- Make sure your "Publish Directory" is set correctly
- Check that HTML files are in the root of the publish directory

**Files Not Updating**
- Render auto-deploys when you push to GitHub
- You can manually trigger a deploy from the Render dashboard

**Custom Domain Not Working**
- DNS changes can take up to 48 hours
- Verify DNS records are set correctly in your domain registrar

## Need Help?

- Render Docs: https://render.com/docs/static-sites
- Render Support: https://render.com/docs/support

---

**Next Steps After Deployment:**
1. ✅ Deploy website to Render
2. ✅ Update URLs in SettingsScreen.tsx
3. ✅ Test all links in the app
4. ✅ Proceed with EAS build for TestFlight
