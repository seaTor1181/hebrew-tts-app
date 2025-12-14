// Diagnostic script to check setup
console.log('================================================');
console.log('🔍 Hebrew TTS Setup Diagnostic');
console.log('================================================\n');

// Check Node.js version
console.log('✓ Node.js version:', process.version);

// Check if dependencies are installed
console.log('\n📦 Checking dependencies...\n');

try {
    require('express');
    console.log('✓ Express: Installed');
} catch (e) {
    console.log('✗ Express: NOT INSTALLED');
    console.log('  Run: npm install express');
}

try {
    require('cors');
    console.log('✓ CORS: Installed');
} catch (e) {
    console.log('✗ CORS: NOT INSTALLED');
    console.log('  Run: npm install cors');
}

try {
    require('dotenv');
    console.log('✓ dotenv: Installed');
} catch (e) {
    console.log('✗ dotenv: NOT INSTALLED');
    console.log('  Run: npm install dotenv');
}

try {
    require('@google-cloud/text-to-speech');
    console.log('✓ Google Cloud TTS: Installed');
} catch (e) {
    console.log('✗ Google Cloud TTS: NOT INSTALLED');
    console.log('  Run: npm install @google-cloud/text-to-speech');
}

// Check for .env file
console.log('\n⚙️  Checking configuration...\n');

const fs = require('fs');
const path = require('path');

if (fs.existsSync('.env')) {
    console.log('✓ .env file exists');
    const envContent = fs.readFileSync('.env', 'utf8');
    console.log('  Contents:');
    envContent.split('\n').forEach(line => {
        if (line.trim() && !line.startsWith('#')) {
            console.log('  ' + line);
        }
    });
} else {
    console.log('✗ .env file NOT FOUND');
    console.log('  Create it by copying .env.example:');
    console.log('  copy .env.example .env');
}

// Check for credentials file
console.log('\n🔑 Checking credentials...\n');

if (fs.existsSync('google-credentials.json')) {
    console.log('✓ google-credentials.json exists');
    try {
        const credentials = JSON.parse(fs.readFileSync('google-credentials.json', 'utf8'));
        console.log('  Project ID:', credentials.project_id || 'N/A');
        console.log('  Client Email:', credentials.client_email || 'N/A');
    } catch (e) {
        console.log('✗ google-credentials.json is invalid JSON');
    }
} else {
    console.log('✗ google-credentials.json NOT FOUND');
    console.log('  Download it from Google Cloud Console:');
    console.log('  1. Go to: https://console.cloud.google.com/');
    console.log('  2. APIs & Services → Credentials');
    console.log('  3. Create Service Account → Download JSON key');
    console.log('  4. Save as google-credentials.json in this folder');
}

// Check public folder
console.log('\n📁 Checking files...\n');

const requiredFiles = [
    'server.js',
    'package.json',
    'public/index-cloud.html',
    'public/script-cloud.js',
    'public/styles-cloud.css'
];

requiredFiles.forEach(file => {
    if (fs.existsSync(file)) {
        console.log(`✓ ${file}`);
    } else {
        console.log(`✗ ${file} NOT FOUND`);
    }
});

console.log('\n================================================');
console.log('🎯 Next Steps:');
console.log('================================================\n');

let missingSteps = [];

if (!fs.existsSync('node_modules')) {
    missingSteps.push('1. Run: npm install');
}

if (!fs.existsSync('.env')) {
    missingSteps.push('2. Create .env file: copy .env.example .env');
}

if (!fs.existsSync('google-credentials.json')) {
    missingSteps.push('3. Download google-credentials.json from Google Cloud Console');
}

if (missingSteps.length === 0) {
    console.log('✅ Everything looks good!');
    console.log('\nRun the server:');
    console.log('  npm start');
    console.log('\nThen open: http://localhost:3000');
} else {
    console.log('Complete these steps:\n');
    missingSteps.forEach(step => console.log(step));
}

console.log('\n================================================\n');
