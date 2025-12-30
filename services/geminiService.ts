
import { GoogleGenAI, Type } from "@google/genai";
import { IAInsight, LeadScore, Interaction, Contact } from "../types";

const getAIInstance = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Limpia la respuesta de la IA en caso de que venga envuelta en bloques de markdown
 */
const cleanJSONResponse = (text: string): string => {
  return text.replace(/```json/g, '').replace(/```/g, '').trim();
};

export const analyzeDataWithIA = async (chartTitle: string, data: any): Promise<IAInsight> => {
  const ai = getAIInstance();
  
  const prompt = `
    Analiza estos datos de CRM de la plataforma AXIS: ${chartTitle}.
    Datos actuales: ${JSON.stringify(data)}
    Responde estrictamente en formato JSON siguiendo el esquema de IAInsight. 
    Asegúrate de que las recomendaciones sean accionables para un equipo comercial B2B.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            findings: { type: Type.ARRAY, items: { type: Type.STRING } },
            interpretation: { type: Type.STRING },
            alerts: { type: Type.ARRAY, items: { type: Type.STRING } },
            recommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
            suggestedQuestions: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: ["findings", "interpretation", "alerts", "recommendations", "suggestedQuestions"]
        }
      }
    });

    return JSON.parse(cleanJSONResponse(response.text));
  } catch (error) {
    console.error("Error IA AXIS:", error);
    return { 
      findings: ["Error al procesar datos"], 
      interpretation: "No se pudo generar un análisis en este momento.", 
      alerts: ["Servicio de análisis temporalmente fuera de línea"], 
      recommendations: ["Verifica la conexión a internet", "Reintenta en unos minutos"], 
      suggestedQuestions: [] 
    };
  }
};

export const calculateLeadScore = async (contact: Contact, interactions: Interaction[]): Promise<LeadScore> => {
  const ai = getAIInstance();
  
  const prompt = `
    Actúa como un Gerente de Ventas Senior de AXIS CRM. 
    Evalúa el potencial de cierre de este lead: ${contact.name} de ${contact.companyName}.
    
    HISTORIAL DE INTERACCIONES:
    ${interactions.length > 0 ? interactions.map(i => `- ${i.summary}`).join('\n') : 'Sin interacciones previas.'}
    
    CRITERIO:
    1 estrella: Prospecto frío o negativo.
    5 estrellas: Negociación avanzada con alta probabilidad de cierre inmediato.

    Devuelve JSON: { "stars": número }
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            stars: { type: Type.INTEGER },
          },
          required: ["stars"]
        }
      }
    });

    const result = JSON.parse(cleanJSONResponse(response.text));
    return { stars: Math.min(Math.max(result.stars || 1, 1), 5) };
  } catch (error) {
    console.error("Error Lead Score:", error);
    return { stars: 1 };
  }
};
