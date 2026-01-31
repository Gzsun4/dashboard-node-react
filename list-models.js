
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';
dotenv.config();

async function list() {
    const key = process.env.GEMINI_API_KEY;
    console.log("Using Key:", key ? "OK" : "MISSING");

    try {
        const resp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
        const data = await resp.json();

        if (data.error) {
            console.error("API Error:", data.error);
            return;
        }

        console.log("--- AVAILABLE MODELS ---");
        data.models.forEach(m => {
            if (m.supportedGenerationMethods.includes("generateContent")) {
                console.log(m.name.replace("models/", ""));
            }
        });
        console.log("------------------------");
    } catch (e) {
        console.error("Fetch failed:", e);
    }
}

list();
