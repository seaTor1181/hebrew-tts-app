// Text-to-Speech App for Hebrew
let synth = window.speechSynthesis;
let voices = [];
let currentUtterance = null;
let mediaRecorder = null;
let audioChunks = [];

// DOM Elements
const textInput = document.getElementById('textInput');
const voiceSelect = document.getElementById('voiceSelect');
const rateControl = document.getElementById('rateControl');
const pitchControl = document.getElementById('pitchControl');
const rateValue = document.getElementById('rateValue');
const pitchValue = document.getElementById('pitchValue');
const playBtn = document.getElementById('playBtn');
const pauseBtn = document.getElementById('pauseBtn');
const stopBtn = document.getElementById('stopBtn');
const downloadBtn = document.getElementById('downloadBtn');
const status = document.getElementById('status');

// Load voices
function loadVoices() {
    voices = synth.getVoices();

    console.log('All available voices:', voices.map(v => `${v.name} (${v.lang})`));

    // Show all voices and mark Hebrew ones
    voiceSelect.innerHTML = '';

    let hebrewVoiceCount = 0;

    voices.forEach((voice, index) => {
        const option = document.createElement('option');
        option.value = index;

        const isHebrew = voice.lang.startsWith('he') ||
                        voice.lang.includes('IL') ||
                        voice.lang.toLowerCase().includes('he-') ||
                        voice.name.toLowerCase().includes('hebrew');

        if (isHebrew) {
            option.textContent = `${voice.name} (${voice.lang}) ⭐`;
            hebrewVoiceCount++;
        } else {
            option.textContent = `${voice.name} (${voice.lang})`;
        }

        voiceSelect.appendChild(option);
    });

    if (hebrewVoiceCount === 0) {
        showStatus('⚠️ לא נמצאו קולות עבריים במערכת. ניתן להשתמש בקולות אחרים - הם יקראו את הטקסט העברי.', 'warning');
    } else {
        showStatus(`✅ נמצאו ${hebrewVoiceCount} קולות עבריים`, 'success');
        setTimeout(hideStatus, 3000);
    }
}

// Load voices on page load and when voices change
loadVoices();
if (speechSynthesis.onvoiceschanged !== undefined) {
    speechSynthesis.onvoiceschanged = loadVoices;
}

// Update rate display
rateControl.addEventListener('input', (e) => {
    rateValue.textContent = `${parseFloat(e.target.value).toFixed(1)}x`;
});

// Update pitch display
pitchControl.addEventListener('input', (e) => {
    pitchValue.textContent = parseFloat(e.target.value).toFixed(1);
});

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

// Play text
playBtn.addEventListener('click', () => {
    const text = textInput.value.trim();

    if (!text) {
        showStatus('❌ אנא הזן טקסט לקריאה', 'error');
        return;
    }

    // Stop any current speech
    synth.cancel();

    // Create utterance
    currentUtterance = new SpeechSynthesisUtterance(text);

    // Set voice
    const selectedVoiceIndex = voiceSelect.value;
    if (voices[selectedVoiceIndex]) {
        currentUtterance.voice = voices[selectedVoiceIndex];
    }

    // Set rate and pitch
    currentUtterance.rate = parseFloat(rateControl.value);
    currentUtterance.pitch = parseFloat(pitchControl.value);

    // Event handlers
    currentUtterance.onstart = () => {
        showStatus('🔊 מדבר...', 'info');
        playBtn.disabled = true;
        pauseBtn.disabled = false;
        stopBtn.disabled = false;
    };

    currentUtterance.onend = () => {
        showStatus('✅ הקריאה הסתיימה', 'success');
        playBtn.disabled = false;
        pauseBtn.disabled = true;
        stopBtn.disabled = true;
    };

    currentUtterance.onerror = (event) => {
        showStatus(`❌ שגיאה: ${event.error}`, 'error');
        playBtn.disabled = false;
        pauseBtn.disabled = true;
        stopBtn.disabled = true;
    };

    // Speak
    synth.speak(currentUtterance);
});

// Pause speech
pauseBtn.addEventListener('click', () => {
    if (synth.speaking) {
        synth.pause();
        showStatus('⏸️ מושהה', 'info');
        pauseBtn.textContent = '▶️ המשך';
        pauseBtn.onclick = () => {
            synth.resume();
            showStatus('🔊 מדבר...', 'info');
            pauseBtn.innerHTML = '<span class="icon">⏸️</span> השהה';
            pauseBtn.onclick = null;
            pauseBtn.addEventListener('click', arguments.callee);
        };
    }
});

// Stop speech
stopBtn.addEventListener('click', () => {
    synth.cancel();
    showStatus('⏹️ נעצר', 'info');
    playBtn.disabled = false;
    pauseBtn.disabled = true;
    stopBtn.disabled = true;
    pauseBtn.innerHTML = '<span class="icon">⏸️</span> השהה';
});

// Download as MP3 (using Web Audio API)
downloadBtn.addEventListener('click', async () => {
    const text = textInput.value.trim();

    if (!text) {
        showStatus('❌ אנא הזן טקסט להורדה', 'error');
        return;
    }

    showStatus('🎵 מכין קובץ להורדה...', 'info');

    try {
        // Create an audio context
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const destination = audioContext.createMediaStreamDestination();

        // Start recording
        mediaRecorder = new MediaRecorder(destination.stream);
        audioChunks = [];

        mediaRecorder.ondataavailable = (event) => {
            audioChunks.push(event.data);
        };

        mediaRecorder.onstop = () => {
            const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
            const url = URL.createObjectURL(audioBlob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `hebrew-tts-${Date.now()}.webm`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            showStatus('✅ הקובץ הורד בהצלחה!', 'success');
        };

        mediaRecorder.start();

        // Create utterance for recording
        const utterance = new SpeechSynthesisUtterance(text);
        const selectedVoiceIndex = voiceSelect.value;
        if (voices[selectedVoiceIndex]) {
            utterance.voice = voices[selectedVoiceIndex];
        }
        utterance.rate = parseFloat(rateControl.value);
        utterance.pitch = parseFloat(pitchControl.value);

        utterance.onend = () => {
            setTimeout(() => {
                mediaRecorder.stop();
            }, 500); // Small delay to ensure all audio is captured
        };

        // Note: Web Speech API doesn't directly support audio recording
        // This is a workaround, but it may not work in all browsers
        // For production, consider using a server-side TTS API

        showStatus('⚠️ שים לב: הורדת אודיו עשויה לא לעבוד בכל הדפדפנים. לתוצאות מיטביות, השתמש בשירות TTS מבוסס שרת.', 'warning');

        // Alternative: Use a service like Google Cloud TTS, Amazon Polly, etc.
        // For now, we'll inform the user about the limitation
        setTimeout(() => {
            showStatus('💡 לחץ על "הפעל" ושמור את האודיו באמצעות כלי הקלטה של המערכת', 'info');
        }, 3000);

    } catch (error) {
        showStatus('❌ שגיאה בהורדת הקובץ. נסה להקליט באמצעות כלי מערכת.', 'error');
        console.error('Download error:', error);
    }
});
