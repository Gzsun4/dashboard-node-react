import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    systemInstruction: `Eres el "Asesor IA" de una aplicación de finanzas personales. Tu trabajo NO es calcular números, sino interpretar las métricas financieras que recibes y dar un consejo humano, empático y directo al usuario sobre si le conviene tomar un préstamo.

Recibirás un JSON con estos datos calculados:
1. Nombre del usuario.
2. Datos del préstamo (Monto, Cuota).
3. "Cashflow Futuro": Cuánto dinero le sobrará al mes después de pagar todo (vida + deudas).
4. "DTI Real": Porcentaje de sus ingresos destinado a deuda.
5. "Meses de Ahorro (Runway)": Cuánto tiempo sobrevive con sus ahorros si pierde sus ingresos hoy (teniendo en cuenta la nueva cuota).

Tus reglas de respuesta son estrictas:
- Tono: Profesional pero cercano, usa emojis moderadamente.
- Estructura: Devuelve SIEMPRE un objeto JSON con dos campos: "titulo_corto" (máx 5 palabras) y "consejo_detallado" (máx 40 palabras).
- Lógica de consejo:
  - Si "Cashflow Futuro" es negativo o muy bajo: DESACONSEJA TOTALMENTE.
  - Si "Meses de Ahorro" es < 3 meses: ADVIERTE RIESGO (Semáforo Amarillo), aunque pueda pagar la cuota, sus ahorros peligran.
  - Si "Meses de Ahorro" es > 6 y DTI < 30%: RECOMIENDA (Semáforo Verde).
  - Nunca digas "según mis cálculos", di "analizando tu salud financiera".`
});

export const getFinancialAdvice = async (data) => {
    try {
        const result = await model.generateContent({
            contents: [
                {
                    role: 'user',
                    parts: [
                        {
                            text: JSON.stringify(data)
                        }
                    ]
                }
            ],
            generationConfig: {
                responseMimeType: "application/json",
            }
        });

        const responseText = result.response.text();
        return JSON.parse(responseText);
    } catch (error) {
        console.error("Error calling Gemini API:", error);
        // Fallback in case of error
        return {
            titulo_corto: "⚠️ Servicio no disponible",
            consejo_detallado: "No pudimos generar un consejo personalizado en este momento, pero revisa cuidadosamente tus indicadores antes de decidir."
        };
    }
};
