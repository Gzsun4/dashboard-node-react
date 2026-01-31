import OpenAI from "openai";
import dotenv from 'dotenv';
dotenv.config();

async function testGroq() {
    const apiKey = process.env.GROQ_API_KEY;
    console.log("🔑 Checking GROQ_API_KEY...");

    if (!apiKey) {
        console.error("❌ ERROR: GROQ_API_KEY is missing in .env file");
        return;
    }

    console.log(`✅ Key found: ${apiKey.substring(0, 10)}...`);

    const groq = new OpenAI({
        apiKey: apiKey,
        baseURL: "https://api.groq.com/openai/v1"
    });

    try {
        console.log("⚡ Sending test request to Groq (llama3-8b-8192)...");
        const completion = await groq.chat.completions.create({
            messages: [{ role: "user", content: "Hola, responde con una sola palabra." }],
            model: "llama-3.1-8b-instant",
        });
        console.log("🎉 SUCCESS! Response:");
        console.log(completion.choices[0].message.content);
    } catch (error) {
        console.error("❌ FAILED:", error.message);
        if (error.message.includes("401")) {
            console.error("💡 Hint: Check if your API Key is correct.");
        }
    }
}

testGroq();
