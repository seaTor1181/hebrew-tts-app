# Deployment script for Hebrew TTS App to Google Cloud Run
# Run this after installing Google Cloud SDK

Write-Host ""
Write-Host "========================================"
Write-Host " Hebrew TTS App - Cloud Run Deployment"
Write-Host "========================================"
Write-Host ""

# Prompt for password
$APP_PASSWORD = Read-Host "Enter a secure password for your app"

if ([string]::IsNullOrWhiteSpace($APP_PASSWORD)) {
    Write-Host "ERROR: Password cannot be empty!" -ForegroundColor Red
    pause
    exit 1
}

Write-Host ""
Write-Host "Deploying to Google Cloud Run..."
Write-Host "- Project: vivid-science-480719-b5"
Write-Host "- Region: us-central1"
Write-Host "- Password Protection: ENABLED"
Write-Host "- Cloud-Only Mode: ENABLED"
Write-Host ""

# Read credentials file
$CREDS = Get-Content .\google-credentials.json -Raw | ForEach-Object { $_ -replace "`r`n", "" -replace "`n", "" }

# Deploy to Cloud Run
gcloud run deploy hebrew-tts `
  --source . `
  --region us-central1 `
  --allow-unauthenticated `
  --set-env-vars "GOOGLE_CREDENTIALS_JSON=$CREDS,PASSWORD=$APP_PASSWORD,CLOUD_ONLY=true" `
  --project vivid-science-480719-b5

Write-Host ""
Write-Host "========================================"
Write-Host " Deployment Complete!"
Write-Host "========================================"
Write-Host ""
Write-Host "Your app is now live on Google Cloud Run!"
Write-Host "Username: user"
Write-Host "Password: $APP_PASSWORD"
Write-Host ""
Write-Host "IMPORTANT: Save your password somewhere safe!"
Write-Host ""
pause
