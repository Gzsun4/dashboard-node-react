import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load env vars
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

async function testGemini() {
    console.log("Testing Gemini API...");
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        console.error("❌ No GEMINI_API_KEY found in .env");
        return;
    }
    console.log("Key found:", apiKey.substring(0, 5) + "...");

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
        model: "gemini-2.0-flash",
        systemInstruction: "You are a helpful assistant. Reply in JSON format: { \"message\": \"Hello\" }"
    });

    try {
        console.log("Sending request...");
        const result = await model.generateContent({
            contents: [{ role: 'user', parts: [{ text: "Test message" }] }],
            generationConfig: { responseMimeType: "application/json" }
        });
        console.log("✅ Response received:");
        console.log(result.response.text());
    } catch (error) {
        console.error("❌ Error testing Gemini:", error);
        if (error.response) {
            console.error("Error Details:", JSON.stringify(error.response, null, 2));
        }
    }
}

testGemini();
