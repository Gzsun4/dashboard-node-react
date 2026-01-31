// Debug Script to LIST available models
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';
dotenv.config();

async function listModels() {
    const apiKey = process.env.GEMINI_API_KEY;
    console.log("🔑 Checking API Access with Key:", apiKey ? "Present" : "Missing");

    // Direct API call to list models
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);

        if (!response.ok) {
            console.error(`❌ API Error: ${response.status} ${response.statusText}`);
            console.error(await response.text());
            return;
        }

        const data = await response.json();
        console.log("\n📋 AVAILABLE MODELS FOR THIS KEY:");

        // Filter for models that support content generation
        const usefulModels = data.models.filter(m =>
            m.supportedGenerationMethods.includes("generateContent")
        );

        usefulModels.forEach(m => {
            console.log(`- ${m.name.replace('models/', '')} \t [Input Limit: ${m.inputTokenLimit}]`);
        });

    } catch (error) {
        console.error("Fatal Error:", error);
    }
}

listModels();
