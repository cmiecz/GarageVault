# 📤 Upload Website Files to Your GitHub Repo

Your GitHub Repo: **https://github.com/cmiecz/GarageVault.git**

Since you're in Vibecode's environment, here's how to get the website files into your GitHub repo:

## Option 1: Upload via GitHub Web Interface (EASIEST - 5 minutes)

### Step 1: Download Files from Vibecode
You need to download these 4 files from your Vibecode workspace:
- `website/index.html`
- `website/privacy.html`
- `website/terms.html`
- `website/README.md`

### Step 2: Upload to GitHub
1. Go to: https://github.com/cmiecz/GarageVault
2. Click "Add file" → "Create new file"
3. In the filename box, type: `website/index.html`
   - The `website/` creates the folder automatically
4. Copy and paste the contents of `website/index.html` into the editor
5. Scroll down and click "Commit new file"
6. Repeat steps 2-5 for:
   - `website/privacy.html`
   - `website/terms.html`
   - `website/README.md`

✅ **Done!** Your website folder is now in GitHub.

---

## Option 2: Git Clone and Push (If you have Git locally)

If you have Git installed on your local machine:

```bash
# Clone your repo
git clone https://github.com/cmiecz/GarageVault.git
cd GarageVault

# Create website directory
mkdir -p website

# Copy the 4 files from Vibecode to this folder
# (You'll need to download them first)

# Add and commit
git add website/
git commit -m "Add legal pages for App Store submission"
git push origin main
```

---

## Option 3: Use GitHub Desktop (User-Friendly)

1. Download GitHub Desktop: https://desktop.github.com/
2. Clone your repo: https://github.com/cmiecz/GarageVault.git
3. Create a `website/` folder in your local repo
4. Download the 4 files from Vibecode and place them in the `website/` folder
5. In GitHub Desktop, commit and push the changes

---

## ✅ Verify Upload

After uploading, visit:
**https://github.com/cmiecz/GarageVault/tree/main/website**

You should see:
- index.html
- privacy.html
- terms.html
- README.md

---

## 🚀 Next: Deploy to Render.com

Once the files are in GitHub, proceed with Render deployment:

1. Go to: https://render.com
2. Sign in (or create free account)
3. Click "New +" → "Static Site"
4. Connect your GitHub: **cmiecz/GarageVault**
5. Configure:
   ```
   Name: garagevault-website
   Branch: main
   Root Directory: website
   Build Command: (leave blank)
   Publish Directory: website
   ```
6. Click "Create Static Site"
7. Wait 2-3 minutes ⏳
8. Get your URL: `https://garagevault-website.onrender.com`

---

## 📋 File Contents Reference

If you need to manually copy-paste, the files are located in Vibecode at:
- `/home/user/workspace/website/index.html`
- `/home/user/workspace/website/privacy.html`
- `/home/user/workspace/website/terms.html`
- `/home/user/workspace/website/README.md`

---

## 🆘 Need the File Contents?

If you can't access Vibecode files, let me know and I can provide the full contents of each file to copy-paste into GitHub's web editor.

---

**After Upload:** Continue with `RENDER_DEPLOYMENT.txt` Step 2!
