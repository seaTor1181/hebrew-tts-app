// Hebrew TTS Server using Google Cloud Text-to-Speech API
const express = require('express');
const textToSpeech = require('@google-cloud/text-to-speech');
const vision = require('@google-cloud/vision');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' })); // Increase limit for image uploads
app.use(express.static('public'));

// Initialize Google Cloud clients with flexible credential loading
let ttsClient, visionClient;

if (process.env.GOOGLE_CREDENTIALS_JSON) {
    // Option 1: Credentials stored directly in environment variable (JSON string)
    const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS_JSON);
    ttsClient = new textToSpeech.TextToSpeechClient({ credentials });
    visionClient = new vision.ImageAnnotatorClient({ credentials });
    console.log('✅ Using credentials from GOOGLE_CREDENTIALS_JSON environment variable');
} else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    // Option 2: Credentials file path in environment variable
    ttsClient = new textToSpeech.TextToSpeechClient({
        keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS
    });
    visionClient = new vision.ImageAnnotatorClient({
        keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS
    });
    console.log('✅ Using credentials from file:', process.env.GOOGLE_APPLICATION_CREDENTIALS);
} else {
    // Option 3: Default local file
    ttsClient = new textToSpeech.TextToSpeechClient({
        keyFilename: './google-credentials.json'
    });
    visionClient = new vision.ImageAnnotatorClient({
        keyFilename: './google-credentials.json'
    });
    console.log('✅ Using credentials from ./google-credentials.json');
}

// Available Hebrew voices
const HEBREW_VOICES = [
    { name: 'he-IL-Wavenet-A', gender: 'FEMALE', description: 'Hebrew Female (WaveNet - Premium)' },
    { name: 'he-IL-Wavenet-B', gender: 'MALE', description: 'Hebrew Male (WaveNet - Premium)' },
    { name: 'he-IL-Wavenet-C', gender: 'FEMALE', description: 'Hebrew Female 2 (WaveNet - Premium)' },
    { name: 'he-IL-Wavenet-D', gender: 'MALE', description: 'Hebrew Male 2 (WaveNet - Premium)' },
    { name: 'he-IL-Standard-A', gender: 'FEMALE', description: 'Hebrew Female (Standard)' },
    { name: 'he-IL-Standard-B', gender: 'MALE', description: 'Hebrew Male (Standard)' },
    { name: 'he-IL-Standard-C', gender: 'FEMALE', description: 'Hebrew Female 2 (Standard)' },
    { name: 'he-IL-Standard-D', gender: 'MALE', description: 'Hebrew Male 2 (Standard)' }
];

// Root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index-cloud.html'));
});

// Get available voices
app.get('/api/voices', (req, res) => {
    res.json({
        success: true,
        voices: HEBREW_VOICES
    });
});

// Generate speech
app.post('/api/synthesize', async (req, res) => {
    try {
        const { text, voiceName, speakingRate, pitch } = req.body;

        if (!text) {
            return res.status(400).json({
                success: false,
                error: 'Text is required'
            });
        }

        // Find the selected voice or use default
        const selectedVoice = HEBREW_VOICES.find(v => v.name === voiceName) || HEBREW_VOICES[0];

        // Construct the request
        const request = {
            input: { text: text },
            voice: {
                languageCode: 'he-IL',
                name: selectedVoice.name,
                ssmlGender: selectedVoice.gender
            },
            audioConfig: {
                audioEncoding: 'MP3',
                speakingRate: speakingRate || 1.0,
                pitch: pitch || 0.0
            }
        };

        // Perform the text-to-speech request
        const [response] = await ttsClient.synthesizeSpeech(request);

        // Convert audio content to base64
        const audioContent = response.audioContent.toString('base64');

        res.json({
            success: true,
            audio: audioContent,
            contentType: 'audio/mp3'
        });

    } catch (error) {
        console.error('TTS Error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to synthesize speech'
        });
    }
});

// OCR endpoint to extract text from images
app.post('/api/ocr', async (req, res) => {
    try {
        const { image } = req.body;

        if (!image) {
            return res.status(400).json({
                success: false,
                error: 'Image data is required'
            });
        }

        // Remove data:image/...;base64, prefix if present
        const base64Image = image.replace(/^data:image\/\w+;base64,/, '');
        const imageBuffer = Buffer.from(base64Image, 'base64');

        // Perform OCR
        const [result] = await visionClient.textDetection({
            image: { content: imageBuffer }
        });

        const detections = result.textAnnotations;

        if (!detections || detections.length === 0) {
            return res.json({
                success: true,
                text: '',
                message: 'No text detected in image'
            });
        }

        // First annotation contains all detected text
        const extractedText = detections[0].description;

        res.json({
            success: true,
            text: extractedText
        });

    } catch (error) {
        console.error('OCR Error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to extract text from image'
        });
    }
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'Server is running',
        timestamp: new Date().toISOString()
    });
});

// Start server
app.listen(PORT, () => {
    console.log('================================================');
    console.log('🎙️  Hebrew TTS Server Running');
    console.log('================================================');
    console.log(`Server: http://localhost:${PORT}`);
    console.log(`API: http://localhost:${PORT}/api`);
    console.log('================================================');
    console.log('');
    console.log('Available Hebrew Voices:');
    HEBREW_VOICES.forEach((voice, index) => {
        console.log(`  ${index + 1}. ${voice.description} (${voice.name})`);
    });
    console.log('');
    console.log('================================================');
});
