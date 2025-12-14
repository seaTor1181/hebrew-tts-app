# Hebrew Text-to-Speech App

A simple, user-friendly web application for converting Hebrew text to speech with audio download capabilities.

## Features

- 🎙️ **Hebrew Text-to-Speech**: Paste or type Hebrew text and hear it read aloud
- 🎛️ **Voice Controls**: Select from available Hebrew voices
- ⚡ **Speed Control**: Adjust reading speed (0.5x - 2x)
- 🎵 **Pitch Control**: Modify voice pitch
- ⏸️ **Playback Controls**: Play, pause, and stop functionality
- ⬇️ **Audio Download**: Download the speech as an audio file

## How to Use

1. Open `index.html` in a web browser (Chrome, Edge, or Safari recommended)
2. Paste or type Hebrew text in the text area
3. Select a Hebrew voice from the dropdown (voices with ⭐ are Hebrew)
4. Adjust speed and pitch as desired
5. Click "הפעל" (Play) to hear the text
6. Click "הורד MP3" (Download MP3) to save the audio

## Installation

No installation required! Simply open the `index.html` file in a modern web browser.

### Files Structure
```
hebrew-tts-app/
├── index.html      # Main HTML file
├── script.js       # JavaScript functionality
├── styles.css      # Styling
└── README.md       # This file
```

## Browser Compatibility

- **Chrome/Edge**: Full support ✅
- **Safari**: Full support ✅
- **Firefox**: Partial support (limited Hebrew voices)

## Important Notes

### About Audio Download

The Web Speech API used in this app has limitations with audio recording in browsers. The download feature may not work perfectly in all browsers. For production use, consider:

1. **Using system recording tools** while playing the speech
2. **Server-side TTS services** like:
   - Google Cloud Text-to-Speech
   - Amazon Polly
   - Microsoft Azure Speech Services
   - ElevenLabs

### Hebrew Voice Availability

The availability of Hebrew voices depends on your operating system:

- **Windows 10/11**: Usually includes Hebrew voices
- **macOS**: Includes Hebrew voices by default
- **Linux**: May require additional voice packs

To add Hebrew voices on Windows:
1. Settings → Time & Language → Speech
2. Add voices → Download Hebrew voice pack

## Advanced Usage

### Customizing the App

You can modify the following in `script.js`:

- Voice filtering logic
- Default speed and pitch values
- UI language (currently in Hebrew)
- Audio format (currently WebM)

### Using with Other Languages

To adapt this app for other languages:
1. Change the language filter in `loadVoices()` function
2. Update the `lang` attribute in `index.html`
3. Modify text direction if needed (RTL for Hebrew/Arabic, LTR for most others)

## Troubleshooting

**No Hebrew voices available?**
- Install Hebrew language pack on your OS
- Try a different browser
- The app will show all available voices if no Hebrew voices are found

**Download not working?**
- This is a browser limitation with Web Speech API
- Use system audio recording instead
- Consider implementing a server-side solution

**Speech not playing?**
- Check browser compatibility
- Ensure text is entered in the textarea
- Try refreshing the page

## Future Enhancements

Potential improvements:
- Server-side TTS for reliable MP3 download
- Support for multiple languages
- Text highlighting during speech
- Save/load text presets
- Batch processing of multiple texts
- SSML support for advanced speech control

## License

Free to use and modify for personal and commercial projects.

## Credits

Built using:
- Web Speech API
- Modern JavaScript (ES6+)
- CSS3 with gradient designs
