// Hebrew TTS Cloud Edition - Client Side
// Use relative URL to work in both local and cloud environments
const API_URL = window.location.hostname === 'localhost'
    ? 'http://localhost:3000/api'
    : '/api';

let voices = [];
let currentAudio = null;

// Audio caching
let cachedAudio = null;
let cacheKey = null;

// Generate cache key from current settings (text, voice, rate, pitch)
function generateCacheKey() {
    const text = textInput.value.trim();
    const voiceName = voiceSelect.value;
    const rate = parseFloat(rateControl.value);
    const pitch = parseFloat(pitchControl.value);
    return `${text}|${voiceName}|${rate}|${pitch}`;
}

// Invalidate cache when any setting changes
function invalidateCache() {
    const newKey = generateCacheKey();
    if (newKey !== cacheKey) {
        if (cachedAudio && cachedAudio.audioUrl) {
            URL.revokeObjectURL(cachedAudio.audioUrl);
        }
        cachedAudio = null;
        cacheKey = null;
    }
}

// Monthly usage tracking
const USAGE_KEY = 'hebrewTTS_monthlyUsage';
const USAGE_MONTH_KEY = 'hebrewTTS_usageMonth';

function getMonthKey() {
    const now = new Date();
    return `${now.getFullYear()}-${now.getMonth() + 1}`;
}

function getMonthlyUsage() {
    const currentMonth = getMonthKey();
    const savedMonth = localStorage.getItem(USAGE_MONTH_KEY);

    // Reset if it's a new month
    if (savedMonth !== currentMonth) {
        localStorage.setItem(USAGE_MONTH_KEY, currentMonth);
        localStorage.setItem(USAGE_KEY, '0');
        return 0;
    }

    return parseInt(localStorage.getItem(USAGE_KEY) || '0');
}

function addToMonthlyUsage(characters) {
    const current = getMonthlyUsage();
    const newTotal = current + characters;
    localStorage.setItem(USAGE_KEY, newTotal.toString());
    updateUsageDisplay();
    return newTotal;
}

function updateUsageDisplay() {
    const monthlyUsage = document.getElementById('monthlyUsage');
    const usageBar = document.getElementById('usageBar');
    const usagePercent = document.getElementById('usagePercent');

    if (!monthlyUsage) return;

    const usage = getMonthlyUsage();
    const freeTierLimit = 1000000; // 1 million for WaveNet (most restrictive)
    const percentage = (usage / freeTierLimit) * 100;

    // Format number nicely (e.g., 6,608 or 6.6K if over 10K)
    let formattedUsage;
    if (usage >= 10000) {
        formattedUsage = (usage / 1000).toFixed(1) + 'K';
    } else {
        formattedUsage = usage.toLocaleString();
    }

    monthlyUsage.textContent = formattedUsage;

    if (usagePercent) {
        usagePercent.textContent = `${percentage.toFixed(1)}%`;
    }

    if (usageBar) {
        const barWidth = Math.min(percentage, 100);
        usageBar.style.width = `${barWidth}%`;

        // Change color based on usage
        if (percentage < 50) {
            usageBar.style.background = 'linear-gradient(90deg, #10b981, #059669)';
        } else if (percentage < 80) {
            usageBar.style.background = 'linear-gradient(90deg, #f59e0b, #d97706)';
        } else {
            usageBar.style.background = 'linear-gradient(90deg, #ef4444, #dc2626)';
        }
    }
}

// DOM Elements
const titleInput = document.getElementById('titleInput');
const textInput = document.getElementById('textInput');
const voiceSelect = document.getElementById('voiceSelect');
const rateControl = document.getElementById('rateControl');
const pitchControl = document.getElementById('pitchControl');
const rateValue = document.getElementById('rateValue');
const pitchValue = document.getElementById('pitchValue');
const playBtn = document.getElementById('playBtn');
const stopBtn = document.getElementById('stopBtn');
const downloadBtn = document.getElementById('downloadBtn');
const status = document.getElementById('status');
const audioPlayer = document.getElementById('audioPlayer');
const audioElement = document.getElementById('audioElement');
const costDisplay = document.getElementById('costDisplay');
const currentChars = document.getElementById('currentChars');
const quickCost = document.getElementById('quickCost');

// OCR Elements - Removed from UI but keeping references for safety
const uploadImageBtn = null;
const pasteImageBtn = null;
const imageFileInput = null;
const ocrStatus = null;

// Update character counter at top of textarea
function updateCharCounter() {
    const text = textInput.value;
    // Google API limit is 5000 BYTES, not characters
    // Hebrew characters are 2-3 bytes each in UTF-8
    const byteCount = new TextEncoder().encode(text).length;
    const byteLimit = 5000;

    if (currentChars) {
        currentChars.textContent = byteCount.toLocaleString();

        // Change color based on limit
        if (byteCount > byteLimit) {
            currentChars.style.color = '#dc2626'; // Red if over limit
        } else if (byteCount > byteLimit * 0.9) {
            currentChars.style.color = '#f59e0b'; // Orange if near limit
        } else {
            currentChars.style.color = '#0ea5e9'; // Blue if safe
        }
    }

    // Update quick cost display
    if (quickCost && voiceSelect.value) {
        const voiceName = voiceSelect.value;
        const costInfo = calculateCost(text, voiceName);
        quickCost.textContent = costInfo.costFormatted;

        // Change color based on cost
        if (costInfo.withinFreeTier) {
            quickCost.style.color = '#059669'; // Green if free
        } else {
            quickCost.style.color = '#dc3545'; // Red if paid
        }
    }
}

// Load voices from server
async function loadVoices() {
    try {
        showStatus('⏳ טוען קולות עבריים...', 'info');

        const response = await fetch(`${API_URL}/voices`);
        const data = await response.json();

        if (data.success) {
            voices = data.voices;
            populateVoiceSelect();
            showStatus('✅ קולות עבריים נטענו בהצלחה!', 'success');
            setTimeout(hideStatus, 2000);
            // Update cost display after voices are loaded
            updateCostDisplay();
        } else {
            throw new Error('Failed to load voices');
        }
    } catch (error) {
        showStatus('❌ שגיאה בטעינת קולות. וודא שהשרת רץ.', 'error');
        console.error('Error loading voices:', error);
    }
}

// Populate voice select dropdown
function populateVoiceSelect() {
    voiceSelect.innerHTML = '';

    voices.forEach((voice, index) => {
        const option = document.createElement('option');
        option.value = voice.name;
        option.textContent = voice.description;

        // Mark WaveNet voices
        if (voice.name.includes('Wavenet')) {
            option.textContent += ' ⭐';
        }

        voiceSelect.appendChild(option);
    });
}

// Update rate display
rateControl.addEventListener('input', (e) => {
    rateValue.textContent = `${parseFloat(e.target.value).toFixed(2)}x`;
});

// Update pitch display
pitchControl.addEventListener('input', (e) => {
    pitchValue.textContent = parseFloat(e.target.value).toFixed(1);
});

// Calculate cost based on character count and voice type
function calculateCost(text, voiceName) {
    const charLength = text.length;
    const isWaveNet = voiceName.includes('Wavenet');

    // Pricing per Google Cloud TTS (as of 2024)
    // WaveNet: $16 per 1 million characters
    // Standard: $4 per 1 million characters
    const costPerMillion = isWaveNet ? 16 : 4;
    const cost = (charLength / 1000000) * costPerMillion;

    // Free tier info
    const freeTierLimit = isWaveNet ? 1000000 : 4000000;
    const withinFreeTier = charLength <= freeTierLimit;

    return {
        charLength,
        cost,
        costFormatted: cost < 0.01 ? '< $0.01' : `$${cost.toFixed(4)}`,
        isWaveNet,
        withinFreeTier,
        freeTierLimit
    };
}

// Update cost display
function updateCostDisplay() {
    const text = textInput.value;
    const voiceName = voiceSelect.value;

    if (!text || !voiceName) {
        costDisplay.innerHTML = '<span class="cost-info">הזן טקסט לחישוב עלות</span>';
        return;
    }

    const costInfo = calculateCost(text, voiceName);

    let costHTML = `
        <div class="cost-details">
            <div class="cost-line">
                <span class="cost-label">תווים:</span>
                <span class="cost-value">${costInfo.charLength.toLocaleString()}</span>
            </div>
            <div class="cost-line">
                <span class="cost-label">עלות משוערת:</span>
                <span class="cost-value ${costInfo.withinFreeTier ? 'free' : 'paid'}">${costInfo.costFormatted}</span>
            </div>
    `;

    if (costInfo.withinFreeTier) {
        costHTML += `
            <div class="cost-note free-tier">
                ✅ בתוך המסגרת החינמית החודשית
            </div>
        `;
    } else {
        costHTML += `
            <div class="cost-note paid-tier">
                💰 מעבר למסגרת החינמית (${costInfo.freeTierLimit.toLocaleString()} תווים/חודש)
            </div>
        `;
    }

    costHTML += '</div>';
    costDisplay.innerHTML = costHTML;
}

// Listen for all changes that should invalidate cache
textInput.addEventListener('input', () => {
    invalidateCache();
    updateCharCounter();
    updateCostDisplay();
});
voiceSelect.addEventListener('change', () => {
    invalidateCache();
    updateCharCounter();
    updateCostDisplay();
});

// Rate and pitch changes also invalidate cache to force fresh generation
rateControl.addEventListener('change', invalidateCache);
pitchControl.addEventListener('change', invalidateCache);

// Show status message
function showStatus(message, type = 'info') {
    status.textContent = message;
    status.className = `status ${type}`;
    status.style.display = 'block';
}

// Hide status message
function hideStatus() {
    status.style.display = 'none';
}

// Base64 to Blob conversion
function base64ToBlob(base64, contentType) {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);

    for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: contentType });
}

// Synthesize speech
async function synthesizeSpeech(downloadMode = false) {
    const text = textInput.value.trim();

    if (!text) {
        showStatus('❌ אנא הזן טקסט', 'error');
        return null;
    }

    const voiceName = voiceSelect.value;
    const speakingRate = parseFloat(rateControl.value);
    const pitch = parseFloat(pitchControl.value);

    // Check if we have cached audio for current settings
    const currentCacheKey = generateCacheKey();
    if (cachedAudio && cacheKey === currentCacheKey) {
        showStatus('✅ משתמש באודיו שמור במטמון', 'success');
        setTimeout(hideStatus, 1500);
        return cachedAudio;
    }

    try {
        showStatus('🎵 מייצר אודיו...', 'info');

        playBtn.disabled = true;
        downloadBtn.disabled = true;

        const response = await fetch(`${API_URL}/synthesize`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                text,
                voiceName,
                speakingRate,
                pitch
            })
        });

        const data = await response.json();

        if (!data.success) {
            throw new Error(data.error || 'Synthesis failed');
        }

        // Convert base64 to blob
        const audioBlob = base64ToBlob(data.audio, 'audio/mp3');
        const audioUrl = URL.createObjectURL(audioBlob);

        playBtn.disabled = false;
        downloadBtn.disabled = false;

        // Track usage (only on new synthesis, not from cache)
        addToMonthlyUsage(text.length);

        // Cache the audio
        cachedAudio = { audioUrl, audioBlob };
        cacheKey = currentCacheKey;

        return { audioUrl, audioBlob };

    } catch (error) {
        showStatus(`❌ שגיאה: ${error.message}`, 'error');
        console.error('Synthesis error:', error);

        playBtn.disabled = false;
        downloadBtn.disabled = false;

        return null;
    }
}

// Play button handler
playBtn.addEventListener('click', async () => {
    const result = await synthesizeSpeech(false);

    if (result) {
        // Stop current audio if playing
        if (currentAudio) {
            currentAudio.pause();
            URL.revokeObjectURL(currentAudio.src);
        }

        // Set new audio
        audioElement.src = result.audioUrl;
        audioPlayer.style.display = 'block';
        currentAudio = audioElement;

        // Play audio
        audioElement.play();

        showStatus('🔊 מנגן...', 'info');
        stopBtn.disabled = false;

        audioElement.onended = () => {
            showStatus('✅ הקריאה הסתיימה', 'success');
            stopBtn.disabled = true;
        };

        audioElement.onerror = () => {
            showStatus('❌ שגיאה בניגון', 'error');
            stopBtn.disabled = true;
        };
    }
});

// Stop button handler
stopBtn.addEventListener('click', () => {
    if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
        showStatus('⏹️ נעצר', 'info');
        stopBtn.disabled = true;
    }
});

// Generate filename from title or use default
function generateFilename() {
    let filename = titleInput.value.trim();

    if (filename) {
        // Remove invalid characters for filenames
        filename = filename.replace(/[<>:"/\\|?*]/g, '-');
        // Limit length
        if (filename.length > 100) {
            filename = filename.substring(0, 100);
        }
    } else {
        // Default filename with timestamp
        const now = new Date();
        const dateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD
        const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '-'); // HH-MM-SS
        filename = `hebrew-tts-${dateStr}-${timeStr}`;
    }

    return `${filename}.mp3`;
}

// Download button handler
downloadBtn.addEventListener('click', async () => {
    showStatus('⏳ מכין קובץ להורדה...', 'info');

    const result = await synthesizeSpeech(true);

    if (result) {
        // Create download link
        const a = document.createElement('a');
        a.href = result.audioUrl;
        a.download = generateFilename();
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        showStatus('✅ הקובץ הורד בהצלחה!', 'success');

        // Clean up
        setTimeout(() => {
            URL.revokeObjectURL(result.audioUrl);
        }, 1000);
    }
});

// Reset usage counter
function resetUsage() {
    if (confirm('האם אתה בטוח שברצונך לאפס את מונה השימוש החודשי?')) {
        localStorage.setItem(USAGE_KEY, '0');
        updateUsageDisplay();
        showStatus('✅ מונה השימוש אופס בהצלחה!', 'success');
        setTimeout(hideStatus, 2000);
    }
}

// Toggle info section
function toggleInfo() {
    const content = document.getElementById('infoContent');
    const icon = document.getElementById('toggleIcon');

    if (content.style.display === 'none') {
        content.style.display = 'block';
        icon.textContent = '▼';
    } else {
        content.style.display = 'none';
        icon.textContent = '▶';
    }
}

// OCR Functions
function showOcrStatus(message, type = 'processing') {
    ocrStatus.textContent = message;
    ocrStatus.className = `ocr-status ${type}`;
    ocrStatus.style.display = 'block';
}

function hideOcrStatus() {
    ocrStatus.style.display = 'none';
}

// Convert image file to base64
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// Extract text from image using OCR
async function extractTextFromImage(base64Image) {
    try {
        showOcrStatus('🔍 מזהה טקסט בתמונה...', 'processing');

        const response = await fetch(`${API_URL}/ocr`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ image: base64Image })
        });

        const data = await response.json();

        if (!data.success) {
            throw new Error(data.error || 'OCR failed');
        }

        if (!data.text || data.text.trim() === '') {
            showOcrStatus('⚠️ לא נמצא טקסט בתמונה', 'error');
            setTimeout(hideOcrStatus, 3000);
            return null;
        }

        return data.text;

    } catch (error) {
        showOcrStatus(`❌ שגיאה: ${error.message}`, 'error');
        console.error('OCR error:', error);
        setTimeout(hideOcrStatus, 3000);
        return null;
    }
}

// Append extracted text to textbox
function appendTextToTextbox(extractedText) {
    const currentText = textInput.value;

    // Add newline separator if textbox already has content
    const separator = currentText.trim() ? '\n\n' : '';

    // Append extracted text at the bottom
    textInput.value = currentText + separator + extractedText;

    // Update counters
    invalidateCache();
    updateCharCounter();
    updateCostDisplay();

    // Show success message
    showOcrStatus('✅ הטקסט נוסף בהצלחה!', 'success');
    setTimeout(hideOcrStatus, 2000);
}

// OCR event listeners removed - UI no longer has these buttons
// Keeping OCR functions above for potential future use

// Initialize
window.addEventListener('DOMContentLoaded', () => {
    loadVoices();
    updateCharCounter();
    updateCostDisplay();
    updateUsageDisplay();

    // Start with info collapsed for cleaner look
    document.getElementById('infoContent').style.display = 'none';
    document.getElementById('toggleIcon').textContent = '▶';
});
