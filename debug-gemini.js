import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';
dotenv.config();

async function testGemini() {
    const apiKey = process.env.GEMINI_API_KEY;
    const genAI = new GoogleGenerativeAI(apiKey);

    // Testing the user suggested model which was in the list
    const modelName = "gemini-2.5-flash";

    console.log(`🤖 Testing: ${modelName}`);
    try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent("Hola, eres la version 2.5?");
        console.log(`✅ SUCCESS: ${modelName}`);
        console.log(result.response.text());
    } catch (error) {
        console.log(`❌ FAILED: ${modelName} - ${error.message}`);
    }
}

testGemini();
