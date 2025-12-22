# Read credentials as base64
$credBytes = [System.IO.File]::ReadAllBytes(".\google-credentials.json")
$credBase64 = [Convert]::ToBase64String($credBytes)

# Deploy to Cloud Run
gcloud run deploy hebrew-tts `
  --source . `
  --region us-central1 `
  --allow-unauthenticated `
  --set-env-vars "GOOGLE_CREDENTIALS_BASE64=$credBase64,PASSWORD=St24031979--,CLOUD_ONLY=true" `
  --project vivid-science-480719-b5
