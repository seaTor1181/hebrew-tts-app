@echo off
REM Deployment script for Hebrew TTS App to Google Cloud Run
REM Run this after installing Google Cloud SDK

echo.
echo ========================================
echo  Hebrew TTS App - Cloud Run Deployment
echo ========================================
echo.

REM Prompt for password
set /p APP_PASSWORD="Enter a secure password for your app: "

if "%APP_PASSWORD%"=="" (
    echo ERROR: Password cannot be empty!
    pause
    exit /b 1
)

echo.
echo Deploying to Google Cloud Run...
echo - Project: vivid-science-480719-b5
echo - Region: us-central1
echo - Password Protection: ENABLED
echo - Cloud-Only Mode: ENABLED
echo.

REM Read credentials and deploy
for /f "delims=" %%i in ('type google-credentials.json') do set CREDS=%%i

gcloud run deploy hebrew-tts ^
  --source . ^
  --region us-central1 ^
  --allow-unauthenticated ^
  --set-env-vars "GOOGLE_CREDENTIALS_JSON=%CREDS%,PASSWORD=%APP_PASSWORD%,CLOUD_ONLY=true" ^
  --project vivid-science-480719-b5

echo.
echo ========================================
echo  Deployment Complete!
echo ========================================
echo.
echo Your app is now live on Google Cloud Run!
echo Username: user
echo Password: %APP_PASSWORD%
echo.
echo IMPORTANT: Save your password somewhere safe!
echo.
pause
