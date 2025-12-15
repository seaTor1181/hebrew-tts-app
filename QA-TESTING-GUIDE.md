# QA Testing Guide - Hebrew TTS App

## Current Status

✅ Dependencies installed
✅ .env file created
⚠️ **Google Cloud credentials needed** (see Setup section below)

---

## Quick Start for QA Testing

### 1. Setup Google Cloud Credentials (Required)

You have **3 options** to provide credentials:

#### Option A: Environment Variable (Recommended for CI/CD)
Edit `.env` and replace the placeholder with your actual Google Cloud service account JSON:
```bash
GOOGLE_CREDENTIALS_JSON={"type":"service_account","project_id":"your-project",...}
```

#### Option B: Credentials File
1. Download your Google Cloud service account JSON key
2. Save it as `google-credentials.json` in the project root
3. Edit `.env` and uncomment:
   ```bash
   GOOGLE_APPLICATION_CREDENTIALS=./google-credentials.json
   ```

#### Option C: Default File Path (Simplest)
1. Download your Google Cloud service account JSON key
2. Save it as `google-credentials.json` in the project root
3. The app will auto-detect it

**How to get Google Cloud credentials:**
1. Go to https://console.cloud.google.com/
2. Create a project or select existing one
3. Enable "Cloud Text-to-Speech API" and "Cloud Vision API"
4. Go to "APIs & Services" → "Credentials"
5. Click "Create Credentials" → "Service Account"
6. Download the JSON key file

---

### 2. Start the Server

```bash
npm start
```

Expected output:
```
================================================
🎙️  Hebrew TTS Server Running
================================================
Server: http://localhost:3000
API: http://localhost:3000/api
================================================
```

---

### 3. Run Diagnostic Check

```bash
node test-setup.js
```

This will verify:
- Node.js version
- All dependencies installed
- Configuration files present
- Google credentials loaded

---

## QA Test Cases

### Test 1: Server Health Check

**Endpoint:** GET `/api/health`

**Test:**
```bash
curl http://localhost:3000/api/health
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2025-12-15T..."
}
```

**Status:** ✅ Pass / ❌ Fail

---

### Test 2: Get Available Voices

**Endpoint:** GET `/api/voices`

**Test:**
```bash
curl http://localhost:3000/api/voices
```

**Expected Response:**
```json
{
  "success": true,
  "voices": [
    {
      "name": "he-IL-Wavenet-A",
      "gender": "FEMALE",
      "description": "Hebrew Female (WaveNet - Premium)"
    },
    ...
  ]
}
```

**Verify:** Should return 8 Hebrew voices (4 WaveNet, 4 Standard)

**Status:** ✅ Pass / ❌ Fail

---

### Test 3: Text-to-Speech Synthesis

**Endpoint:** POST `/api/synthesize`

**Test:**
```bash
curl -X POST http://localhost:3000/api/synthesize \
  -H "Content-Type: application/json" \
  -d '{
    "text": "שלום עולם",
    "voiceName": "he-IL-Wavenet-A",
    "speakingRate": 1.0,
    "pitch": 0.0
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "audio": "base64_encoded_mp3_data...",
  "contentType": "audio/mp3"
}
```

**Verify:**
- `success` is `true`
- `audio` contains base64 string
- `contentType` is "audio/mp3"

**Status:** ✅ Pass / ❌ Fail

---

### Test 4: Error Handling - Missing Text

**Test:**
```bash
curl -X POST http://localhost:3000/api/synthesize \
  -H "Content-Type: application/json" \
  -d '{}'
```

**Expected Response:**
```json
{
  "success": false,
  "error": "Text is required"
}
```

**Status:** ✅ Pass / ❌ Fail

---

### Test 5: OCR (Image Text Extraction)

**Endpoint:** POST `/api/ocr`

**Test:** (You'll need a base64 encoded image)
```bash
curl -X POST http://localhost:3000/api/ocr \
  -H "Content-Type: application/json" \
  -d '{
    "image": "data:image/png;base64,iVBORw0KG..."
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "text": "extracted text from image"
}
```

**Status:** ✅ Pass / ❌ Fail

---

### Test 6: Frontend UI Testing

**Test:** Open browser at http://localhost:3000

**UI Elements to Verify:**
- [ ] Text area for Hebrew input
- [ ] Voice selector dropdown (8 voices)
- [ ] Speed slider (0.5x - 2x)
- [ ] Pitch slider (-5 to +5)
- [ ] Play button (הפעל)
- [ ] Download MP3 button (הורד MP3)
- [ ] Upload image for OCR button
- [ ] Hebrew RTL text direction

**Functional Tests:**
1. **Enter text:** "שלום, זה בדיקה של מערכת הקראת טקסט"
2. **Select voice:** Try different voices
3. **Adjust speed:** Set to 1.5x
4. **Adjust pitch:** Set to +2
5. **Click Play:** Audio should play
6. **Click Download:** MP3 file should download

**Status:** ✅ Pass / ❌ Fail

---

### Test 7: Different Hebrew Texts

Test with various Hebrew text samples:

**Test Case A - Simple:**
```
שלום עולם
```

**Test Case B - Long Text:**
```
זהו טקסט ארוך יותר בעברית. המטרה היא לבדוק איך המערכת מתמודדת עם משפטים ארוכים ומורכבים יותר. האם ההקראה תישמע טבעית?
```

**Test Case C - Numbers:**
```
יש לי 5 תפוחים ו-3 תפוזים
```

**Test Case D - Mixed Punctuation:**
```
מה שלומך? אני בסדר! תודה רבה.
```

**Status:** ✅ Pass / ❌ Fail

---

### Test 8: Voice Quality Comparison

Compare different voices for the same text:

**Text:** "שלום, איך אפשר לעזור לך היום?"

**Test with:**
- he-IL-Wavenet-A (Female Premium)
- he-IL-Wavenet-B (Male Premium)
- he-IL-Standard-A (Female Standard)
- he-IL-Standard-B (Male Standard)

**Evaluate:**
- Naturalness
- Pronunciation accuracy
- Audio quality
- WaveNet vs Standard difference

**Status:** ✅ Pass / ❌ Fail

---

### Test 9: Speed and Pitch Variations

**Text:** "בדיקת מהירות וגובה צליל"

**Test Matrix:**

| Speed | Pitch | Expected Result |
|-------|-------|-----------------|
| 0.5x  | 0     | Very slow, normal pitch |
| 1.0x  | 0     | Normal speed, normal pitch |
| 2.0x  | 0     | Very fast, normal pitch |
| 1.0x  | -5    | Normal speed, low pitch |
| 1.0x  | +5    | Normal speed, high pitch |
| 1.5x  | +2    | Fast, slightly higher pitch |

**Status:** ✅ Pass / ❌ Fail

---

### Test 10: Edge Cases

**Test Case A - Empty Text:**
- Input: ""
- Expected: Error message

**Test Case B - Very Long Text:**
- Input: 5000+ character Hebrew text
- Expected: Should process or show appropriate limit message

**Test Case C - Special Characters:**
- Input: "שלום! @#$% 123"
- Expected: Should handle gracefully

**Test Case D - Invalid Voice:**
- API: POST with voiceName: "invalid-voice"
- Expected: Fallback to default voice

**Status:** ✅ Pass / ❌ Fail

---

## Performance Testing

### Response Time Benchmarks

**Test:** Measure API response times

```bash
# Install apache bench or use curl with timing
time curl -X POST http://localhost:3000/api/synthesize \
  -H "Content-Type: application/json" \
  -d '{"text":"שלום עולם","voiceName":"he-IL-Wavenet-A"}'
```

**Expected Performance:**
- Health check: < 50ms
- Voice list: < 100ms
- TTS synthesis (short text): < 2s
- TTS synthesis (long text): < 5s
- OCR (small image): < 3s

**Status:** ✅ Pass / ❌ Fail

---

## Browser Compatibility Testing

Test the frontend on:

- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

**Status:** ✅ Pass / ❌ Fail

---

## Error Scenarios

### Test 11: No Credentials

**Setup:** Remove/rename `.env` and `google-credentials.json`

**Start Server:** `npm start`

**Expected:** Server starts but API calls fail with authentication error

**Status:** ✅ Pass / ❌ Fail

---

### Test 12: Invalid Credentials

**Setup:** Put invalid JSON in `.env`

**Expected:** Server fails to start with clear error message

**Status:** ✅ Pass / ❌ Fail

---

## Load Testing (Optional)

Test concurrent requests:

```bash
# Install artillery: npm install -g artillery
# Create artillery.yml config file
# Run: artillery run artillery.yml
```

**Test scenarios:**
- 10 concurrent users
- 50 concurrent users
- 100 concurrent users

**Status:** ✅ Pass / ❌ Fail

---

## Security Testing

### Test 13: Input Validation

**Test SQL Injection-like inputs:**
```
"; DROP TABLE--
<script>alert('xss')</script>
```

**Expected:** Should handle safely without errors

**Status:** ✅ Pass / ❌ Fail

---

### Test 14: File Size Limits

**Test:** Upload very large image (>10MB) to OCR endpoint

**Expected:** Should reject or handle gracefully

**Status:** ✅ Pass / ❌ Fail

---

## Common Issues & Solutions

### Issue: "Express: NOT INSTALLED"
**Solution:** Run `npm install`

### Issue: ".env file NOT FOUND"
**Solution:** Run `cp .env.example .env` and add credentials

### Issue: "google-credentials.json NOT FOUND"
**Solution:** Download from Google Cloud Console and save in project root

### Issue: "Failed to synthesize speech"
**Solution:**
- Check Google Cloud credentials are valid
- Verify Cloud Text-to-Speech API is enabled
- Check service account has proper permissions

### Issue: "No text detected in image"
**Solution:**
- Ensure image has clear, readable text
- Verify Cloud Vision API is enabled
- Check image format is supported (JPG, PNG)

---

## QA Sign-off Checklist

**Before marking as production-ready:**

- [ ] All API endpoints tested and working
- [ ] Frontend UI functional in major browsers
- [ ] Hebrew text rendering correctly (RTL)
- [ ] All 8 voices working
- [ ] Speed and pitch controls functional
- [ ] MP3 download working
- [ ] OCR feature working
- [ ] Error handling appropriate
- [ ] Performance meets benchmarks
- [ ] No security vulnerabilities
- [ ] Documentation complete
- [ ] Google Cloud setup documented

**QA Tester:** ________________

**Date:** ________________

**Status:** ✅ Approved / ❌ Needs Work

**Notes:**
_____________________________________________
_____________________________________________
_____________________________________________
