// Script to upload credentials to Google Secret Manager
// Run this ONCE to set up the secret, then delete this file

const { SecretManagerServiceClient } = require('@google-cloud/secret-manager');
const fs = require('fs');

async function setupSecret() {
    const client = new SecretManagerServiceClient({
        keyFilename: './google-credentials.json'
    });

    const projectId = 'vivid-science-480719-b5';
    const secretId = 'hebrew-tts-credentials';

    try {
        console.log('📤 Uploading credentials to Google Secret Manager...');

        // Read the credentials file
        const credentialsContent = fs.readFileSync('./google-credentials.json', 'utf8');

        // Create the secret
        console.log('Creating secret...');
        const [secret] = await client.createSecret({
            parent: `projects/${projectId}`,
            secretId: secretId,
            secret: {
                replication: {
                    automatic: {},
                },
            },
        });

        console.log(`✅ Secret created: ${secret.name}`);

        // Add a version with the credentials
        console.log('Adding secret version...');
        const [version] = await client.addSecretVersion({
            parent: secret.name,
            payload: {
                data: Buffer.from(credentialsContent, 'utf8'),
            },
        });

        console.log(`✅ Secret version created: ${version.name}`);
        console.log('');
        console.log('🎉 SUCCESS! Your credentials are now stored securely in Google Cloud!');
        console.log('');
        console.log('Next steps:');
        console.log('1. Delete this setup-secret.js file (no longer needed)');
        console.log('2. You can now run the app on any computer with Google Cloud SDK installed');
        console.log('3. On new computers, just authenticate with: gcloud auth application-default login');

    } catch (error) {
        if (error.code === 6) {
            console.log('⚠️  Secret already exists! Updating with new version...');

            // Add new version to existing secret
            const secretName = `projects/${projectId}/secrets/${secretId}`;
            const credentialsContent = fs.readFileSync('./google-credentials.json', 'utf8');

            const [version] = await client.addSecretVersion({
                parent: secretName,
                payload: {
                    data: Buffer.from(credentialsContent, 'utf8'),
                },
            });

            console.log(`✅ Secret updated: ${version.name}`);
            console.log('');
            console.log('🎉 Your credentials have been updated in Google Cloud!');
        } else {
            console.error('❌ Error:', error.message);
            console.log('');
            console.log('Make sure:');
            console.log('1. Secret Manager API is enabled in Google Cloud Console');
            console.log('2. Your service account has "Secret Manager Admin" role');
        }
    }
}

setupSecret();
