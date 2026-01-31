import dotenv from 'dotenv';
dotenv.config();

async function listModels() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) { console.log("Missing Key"); return; }

    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

    console.log(`🔍 Checking available models for key ending in ...${apiKey.slice(-4)}`);

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.models) {
            console.log("\n✅ AVAILABLE MODELS (generateContent):");
            const usable = data.models.filter(m => m.supportedGenerationMethods.includes("generateContent"));

            if (usable.length === 0) {
                console.log("⚠️ No models found with 'generateContent' capability.");
            }

            usable.forEach(m => {
                console.log(` - ${m.name.replace('models/', '')}`);
            });

            console.log("\n❌ OTHER MODELS:");
            data.models.filter(m => !m.supportedGenerationMethods.includes("generateContent")).forEach(m => {
                console.log(` - ${m.name.replace('models/', '')} [${m.supportedGenerationMethods.join(', ')}]`);
            });

        } else {
            console.log("❌ Error listing models:", JSON.stringify(data, null, 2));
        }
    } catch (error) {
        console.error("❌ Network error:", error.message);
    }
}

listModels();
