# 🚀 Quick Setup Guide - Run on Any PC

## ✅ EASIEST METHOD: Use .env File

### Step 1: Create a `.env` File

In your `hebrew-tts-app` folder, create a new file called `.env` (just ".env" with a dot)

Paste your Google Cloud credentials JSON (all on ONE line):

```
GOOGLE_CREDENTIALS_JSON=<your-credentials-json-here>
```

⚠️ **IMPORTANT**:
- Save this in your password manager!
- Don't share it publicly
- The `.env` file won't be uploaded to GitHub (already in `.gitignore`)

### Step 2: Run the App

```bash
npm install
npm start
```

That's it! Open `http://localhost:3000`

---

## 📦 To Use on Another PC:

1. Copy your code folder OR clone from GitHub
2. Create the `.env` file (paste the text above)
3. Run `npm install`
4. Run `npm start`

Done!

---

## 🔐 Security Tip

Store the `.env` file content in your **password manager** (1Password, LastPass, Bitwarden) so you can easily copy it to any new PC.

---

See [README.md](README.md) for full documentation
