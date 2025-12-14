# PowerShell Script to Install Hebrew Text-to-Speech Voices on Windows
# Run this script as Administrator

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "Hebrew Text-to-Speech Voice Installer" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Check if running as Administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "⚠️  This script needs to run as Administrator!" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Please:" -ForegroundColor White
    Write-Host "1. Right-click on PowerShell" -ForegroundColor White
    Write-Host "2. Select 'Run as Administrator'" -ForegroundColor White
    Write-Host "3. Run this script again" -ForegroundColor White
    Write-Host ""
    pause
    exit
}

Write-Host "✅ Running as Administrator" -ForegroundColor Green
Write-Host ""

# Check Windows version
$windowsVersion = (Get-WmiObject -Class Win32_OperatingSystem).Caption
Write-Host "Windows Version: $windowsVersion" -ForegroundColor White
Write-Host ""

# Method 1: Try to add Hebrew language pack
Write-Host "📦 Method 1: Installing Hebrew Language Pack..." -ForegroundColor Cyan
Write-Host ""

try {
    # Check if Hebrew is already installed
    $installedLanguages = Get-WinUserLanguageList
    $hebrewInstalled = $installedLanguages | Where-Object { $_.LanguageTag -eq "he-IL" }

    if ($hebrewInstalled) {
        Write-Host "✅ Hebrew language is already installed!" -ForegroundColor Green
    } else {
        Write-Host "Installing Hebrew (Israel) language pack..." -ForegroundColor Yellow

        # Add Hebrew language
        $languageList = Get-WinUserLanguageList
        $languageList.Add("he-IL")
        Set-WinUserLanguageList $languageList -Force

        Write-Host "✅ Hebrew language pack added!" -ForegroundColor Green
        Write-Host "⏳ Downloading speech components... (this may take a few minutes)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠️  Method 1 failed: $_" -ForegroundColor Red
}

Write-Host ""

# Method 2: Install via Windows Capability
Write-Host "📦 Method 2: Installing Hebrew Speech Components..." -ForegroundColor Cyan
Write-Host ""

try {
    # List available speech capabilities
    $speechCapabilities = Get-WindowsCapability -Online | Where-Object { $_.Name -like "*TextToSpeech*he-IL*" }

    if ($speechCapabilities) {
        foreach ($capability in $speechCapabilities) {
            Write-Host "Found: $($capability.Name)" -ForegroundColor White

            if ($capability.State -eq "Installed") {
                Write-Host "  ✅ Already installed" -ForegroundColor Green
            } else {
                Write-Host "  ⏳ Installing..." -ForegroundColor Yellow
                Add-WindowsCapability -Online -Name $capability.Name
                Write-Host "  ✅ Installed!" -ForegroundColor Green
            }
        }
    } else {
        Write-Host "⚠️  No Hebrew TTS capabilities found via Windows Capability" -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠️  Method 2 failed: $_" -ForegroundColor Red
}

Write-Host ""

# Method 3: Direct Speech Engine Installation
Write-Host "📦 Method 3: Checking Speech Engines..." -ForegroundColor Cyan
Write-Host ""

# Check installed speech voices using .NET
Add-Type -AssemblyName System.Speech
$synth = New-Object System.Speech.Synthesis.SpeechSynthesizer
$voices = $synth.GetInstalledVoices()

Write-Host "Currently installed TTS voices:" -ForegroundColor White
$hebrewFound = $false

foreach ($voice in $voices) {
    $voiceInfo = $voice.VoiceInfo
    $culture = $voiceInfo.Culture.Name
    $name = $voiceInfo.Name

    if ($culture -like "he*") {
        Write-Host "  ✅ $name ($culture) - HEBREW VOICE FOUND!" -ForegroundColor Green
        $hebrewFound = $true
    } else {
        Write-Host "  • $name ($culture)" -ForegroundColor Gray
    }
}

Write-Host ""

if ($hebrewFound) {
    Write-Host "================================================" -ForegroundColor Green
    Write-Host "✅ SUCCESS! Hebrew voices are installed!" -ForegroundColor Green
    Write-Host "================================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor White
    Write-Host "1. Close and reopen your web browser" -ForegroundColor White
    Write-Host "2. Open the Hebrew TTS app (index.html)" -ForegroundColor White
    Write-Host "3. You should now see Hebrew voices marked with ⭐" -ForegroundColor White
} else {
    Write-Host "================================================" -ForegroundColor Yellow
    Write-Host "⚠️  No Hebrew voices found yet" -ForegroundColor Yellow
    Write-Host "================================================" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Manual installation steps:" -ForegroundColor White
    Write-Host ""
    Write-Host "Option A - Windows Settings:" -ForegroundColor Cyan
    Write-Host "1. Open Settings (Win + I)" -ForegroundColor White
    Write-Host "2. Go to Time & Language → Language & Region" -ForegroundColor White
    Write-Host "3. Click 'Add a language'" -ForegroundColor White
    Write-Host "4. Search for 'Hebrew' and select 'עברית (ישראל)'" -ForegroundColor White
    Write-Host "5. Click Next, then Install" -ForegroundColor White
    Write-Host "6. After installation, click on Hebrew → Options" -ForegroundColor White
    Write-Host "7. Under 'Speech', click Download" -ForegroundColor White
    Write-Host ""
    Write-Host "Option B - Microsoft Store:" -ForegroundColor Cyan
    Write-Host "1. Open Microsoft Store" -ForegroundColor White
    Write-Host "2. Search for 'Hebrew Local Experience Pack'" -ForegroundColor White
    Write-Host "3. Install it" -ForegroundColor White
    Write-Host ""
    Write-Host "Option C - Cloud-based TTS:" -ForegroundColor Cyan
    Write-Host "If you can't install Hebrew voices, consider using" -ForegroundColor White
    Write-Host "Google Cloud TTS API for high-quality Hebrew speech" -ForegroundColor White
}

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
pause
