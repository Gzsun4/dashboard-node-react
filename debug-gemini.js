import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';
dotenv.config();

async function testGemini() {
    const apiKey = process.env.GEMINI_API_KEY;
    const genAI = new GoogleGenerativeAI(apiKey);

    // Testing the lite version explicitly found in the list
    const modelName = "gemini-2.0-flash-lite";

    console.log(`🤖 Testing: ${modelName}`);
    try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent("Hola, eres rapido?");
        console.log(`✅ SUCCESS: ${modelName}`);
        console.log(result.response.text());
    } catch (error) {
        console.log(`❌ FAILED: ${modelName} - ${error.message}`);
    }
}

testGemini();
