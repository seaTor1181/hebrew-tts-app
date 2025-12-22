# 🚀 Deploy Hebrew TTS to Google Cloud Run

This guide shows you how to deploy your Hebrew TTS app to Google Cloud Run so you can access it from **any computer** with just a web browser!

## ✨ Why Cloud Run?

- ✅ **Access from anywhere** - Just visit a URL, no installation needed
- ✅ **Automatic scaling** - Google handles traffic spikes
- ✅ **HTTPS included** - Secure by default
- ✅ **Free tier** - 2 million requests/month free
- ✅ **Pay only for use** - Billed per second of usage

---

## 📋 Prerequisites

1. **Google Cloud Project** - You already have: `vivid-science-480719-b5`
2. **Google Cloud SDK** installed - [Download here](https://cloud.google.com/sdk/docs/install)
3. **Billing enabled** on your project (required for Cloud Run)

---

## 🚀 Deployment Steps

### Step 1: Install Google Cloud SDK (If not installed)

**Windows:**
- Download from: https://cloud.google.com/sdk/docs/install-sdk#windows
- Run the installer
- Restart your terminal

**Mac:**
```bash
brew install google-cloud-sdk
```

**Verify installation:**
```bash
gcloud --version
```

### Step 2: Authenticate with Google Cloud

```bash
# Login to your Google account
gcloud auth login

# Set your project
gcloud config set project vivid-science-480719-b5
```

### Step 3: Enable Required APIs

```bash
# Enable Cloud Run API
gcloud services enable run.googleapis.com

# Enable Container Registry API
gcloud services enable containerregistry.googleapis.com

# Enable Cloud Build API
gcloud services enable cloudbuild.googleapis.com
```

### Step 4: Set Up Credentials as Environment Variable

Cloud Run will use your service account credentials. You need to pass them as an environment variable during deployment.

First, convert your credentials to base64:

**Windows PowerShell:**
```powershell
$json = Get-Content .\google-credentials.json -Raw
$bytes = [System.Text.Encoding]::UTF8.GetBytes($json)
$base64 = [Convert]::ToBase64String($bytes)
Write-Output $base64
```

**Mac/Linux:**
```bash
base64 -i google-credentials.json
```

**Copy the output** - you'll need it in the next step.

### Step 5: Deploy to Cloud Run

```bash
# Build and deploy in one command
gcloud run deploy hebrew-tts \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars "GOOGLE_CREDENTIALS_JSON=$(cat google-credentials.json | tr -d '\n')"
```

**What this does:**
- `hebrew-tts` - Name of your service
- `--source .` - Build from current directory
- `--region us-central1` - Deploy to US region (change if needed)
- `--allow-unauthenticated` - Make it public (anyone can access)
- `--set-env-vars` - Pass credentials as environment variable

### Step 6: Wait for Deployment

The deployment will take 2-5 minutes. You'll see:
```
Building using Dockerfile and deploying container to Cloud Run...
✓ Deploying... Done.
  ✓ Creating Revision...
  ✓ Routing traffic...
Done.
Service [hebrew-tts] revision [hebrew-tts-00001-xyz] has been deployed
and is serving 100 percent of traffic.
Service URL: https://hebrew-tts-xyz-uc.a.run.app
```

### Step 7: Access Your App!

Copy the **Service URL** from the output and paste it in your browser!

🎉 **Your Hebrew TTS app is now live!**

---

## 🔧 Alternative: Manual Deployment

If the automatic deployment doesn't work, use this manual method:

### 1. Build Docker Image

```bash
# Build the container
gcloud builds submit --tag gcr.io/vivid-science-480719-b5/hebrew-tts
```

### 2. Deploy to Cloud Run

```bash
# Deploy the container
gcloud run deploy hebrew-tts \
  --image gcr.io/vivid-science-480719-b5/hebrew-tts \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars "GOOGLE_CREDENTIALS_JSON=$(cat google-credentials.json | tr -d '\n')"
```

---

## 📊 Managing Your Deployment

### View Logs

```bash
gcloud run services logs read hebrew-tts --region us-central1
```

### Update the App

Make your code changes, then redeploy:

```bash
gcloud run deploy hebrew-tts \
  --source . \
  --region us-central1 \
  --allow-unauthenticated
```

### Delete the Service

```bash
gcloud run services delete hebrew-tts --region us-central1
```

### Check Service Status

```bash
gcloud run services describe hebrew-tts --region us-central1
```

---

## 💰 Pricing

**Cloud Run Pricing (Free Tier):**
- ✅ 2 million requests/month FREE
- ✅ 360,000 GB-seconds memory FREE
- ✅ 180,000 vCPU-seconds FREE

After free tier:
- $0.40 per million requests
- $0.00002400 per GB-second
- $0.00001000 per vCPU-second

**Your app will likely stay in free tier** for personal use!

---

## 🔐 Security Notes

### Public Access
The deployment above makes your app public (`--allow-unauthenticated`). This means anyone with the URL can access it.

### To Make it Private:

```bash
gcloud run deploy hebrew-tts \
  --source . \
  --region us-central1 \
  --no-allow-unauthenticated
```

Then users need to authenticate with Google to access.

### Environment Variables Security
Your credentials are passed as environment variables, which is secure on Cloud Run.

---

## 🌍 Custom Domain (Optional)

Want to use your own domain like `tts.yourdomain.com`?

1. **Map a custom domain:**
   ```bash
   gcloud run domain-mappings create \
     --service hebrew-tts \
     --domain tts.yourdomain.com \
     --region us-central1
   ```

2. **Follow the DNS instructions** provided to point your domain to Cloud Run

---

## 🐛 Troubleshooting

### Error: "Billing must be enabled"
- Go to https://console.cloud.google.com/billing
- Enable billing for your project

### Error: "Permission denied"
- Run: `gcloud auth login`
- Make sure you're using the correct project: `gcloud config set project vivid-science-480719-b5`

### Error: "Container failed to start"
- Check logs: `gcloud run services logs read hebrew-tts --region us-central1`
- Verify your `Dockerfile` and `server.js` are correct

### App deploys but doesn't work
- Check environment variables are set correctly
- Test locally with Docker first:
  ```bash
  docker build -t hebrew-tts .
  docker run -p 8080:8080 -e GOOGLE_CREDENTIALS_JSON="$(cat google-credentials.json)" hebrew-tts
  ```

---

## ✅ Success Checklist

- [ ] Google Cloud SDK installed
- [ ] Authenticated with `gcloud auth login`
- [ ] Project set to `vivid-science-480719-b5`
- [ ] APIs enabled (Cloud Run, Container Registry, Cloud Build)
- [ ] Credentials ready as environment variable
- [ ] Deployed successfully
- [ ] Can access the Service URL
- [ ] Voices load correctly
- [ ] Can synthesize speech
- [ ] Can download MP3 files

---

## 🎯 Next Steps

After deploying:
1. ✅ Bookmark your Service URL
2. ✅ Share with friends/family (if you want)
3. ✅ Monitor usage in [Google Cloud Console](https://console.cloud.google.com/)
4. ✅ Set up billing alerts to avoid surprises

---

**Need help?** Check the [main README](README.md) or [setup guide](SETUP-GUIDE.md).

**Last Updated:** December 14, 2024
