import dotenv from 'dotenv';
// import fetch from 'node-fetch'; // Native in Node 18+
import fs from 'fs';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

console.log("🔑 Querying models with key ending in:", apiKey.slice(-4));

async function listModels() {
    try {
        const response = await fetch(url);
        const data = await response.json();

        if (!response.ok) {
            fs.writeFileSync('models_log.txt', "❌ API Error: " + JSON.stringify(data, null, 2));
            return;
        }

        const models = data.models || [];
        const visionModels = models.filter(m => m.supportedGenerationMethods.includes("generateContent"));

        const output = visionModels.map(m => `- ${m.name} (Version: ${m.version})`).join('\n');
        fs.writeFileSync('models_log.txt', "✅ Available Models:\n" + output);
        console.log("Written to models_log.txt");

    } catch (error) {
        fs.writeFileSync('models_log.txt', "❌ Network Error: " + error.message);
    }
}

listModels();
