# 🚀 Quick Start - Deploy in 5 Minutes

Follow these steps to deploy your Hebrew TTS app to Google Cloud Run.

## Step 1: Install Google Cloud SDK

**Windows:**
1. Download: https://cloud.google.com/sdk/docs/install-sdk#windows
2. Run the installer
3. Restart your terminal/PowerShell

**Verify installation:**
```bash
gcloud --version
```

## Step 2: Set Up Billing Alert (One-time)

1. Visit: https://console.cloud.google.com/billing/budgets
2. Click **"CREATE BUDGET"**
3. Configure:
   - Name: "Hebrew TTS Free Tier Alert"
   - Project: `vivid-science-480719-b5`
   - Amount: $5.00
   - Alerts at: 50%, 90%, 100%
4. Add your email
5. Click **"FINISH"**

✅ You'll get email alerts if costs approach $5/month (well above free tier)

## Step 3: Authenticate

```bash
# Login to Google Cloud
gcloud auth login

# Set your project
gcloud config set project vivid-science-480719-b5
```

## Step 4: Enable APIs (One-time)

```bash
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com
gcloud services enable cloudbuild.googleapis.com
```

## Step 5: Deploy!

**Option A: Using the deployment script (Recommended)**

**Windows Command Prompt:**
```cmd
cd hebrew-tts-app
deploy.bat
```

**Windows PowerShell:**
```powershell
cd hebrew-tts-app
.\deploy.ps1
```

The script will:
- Ask you for a password
- Deploy to Cloud Run with password protection
- Enable cloud-only mode
- Show you the Service URL when done

**Option B: Manual deployment**

```bash
cd hebrew-tts-app

# Replace YourSecurePassword123 with your own password!
gcloud run deploy hebrew-tts \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars "GOOGLE_CREDENTIALS_JSON=$(cat google-credentials.json | tr -d '\n'),PASSWORD=YourSecurePassword123,CLOUD_ONLY=true" \
  --project vivid-science-480719-b5
```

## Step 6: Access Your App

After deployment completes (2-5 minutes), you'll see:

```
Service URL: https://hebrew-tts-xyz-uc.a.run.app
```

1. Copy the URL
2. Open it in your browser
3. When prompted, enter:
   - **Username:** `user`
   - **Password:** (the password you chose)

🎉 **You're done!** Your Hebrew TTS app is now accessible from any device!

---

## 📱 Using on Other Computers

Just visit the Service URL from any computer and enter your password - no installation needed!

---

## 🔄 Updating the App

Made changes to the code? Redeploy:

```bash
cd hebrew-tts-app
gcloud run deploy hebrew-tts \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars "GOOGLE_CREDENTIALS_JSON=$(cat google-credentials.json | tr -d '\n'),PASSWORD=YourPassword,CLOUD_ONLY=true"
```

---

## 📊 Monitoring

**View logs:**
```bash
gcloud run services logs read hebrew-tts --region us-central1
```

**Check service status:**
```bash
gcloud run services describe hebrew-tts --region us-central1
```

**View in Cloud Console:**
https://console.cloud.google.com/run

---

## 💰 Cost Tracking

- **View current usage:** https://console.cloud.google.com/billing
- **Free tier includes:** 2M requests/month + 1M WaveNet characters/month
- **Expected cost for personal use:** $0/month

---

## ❓ Troubleshooting

**"gcloud: command not found"**
- Install Google Cloud SDK (see Step 1)
- Restart your terminal

**"Billing must be enabled"**
- Visit: https://console.cloud.google.com/billing
- Enable billing for project `vivid-science-480719-b5`

**"Permission denied"**
- Run: `gcloud auth login`
- Make sure project is set: `gcloud config get-value project`

**Need more help?**
- See detailed guide: [DEPLOY.md](DEPLOY.md)
- Setup guide: [SETUP-GUIDE.md](SETUP-GUIDE.md)

---

**Last Updated:** December 14, 2024
