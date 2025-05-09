const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY});

const generateQuestions = async (category) => {
  const prompt = `Actúa como un generador de preguntas de trivia. Genera una pregunta sobre ${category}. 
  IMPORTANTE: Responde SOLO con un objeto JSON válido, sin markdown, sin anotaciones, sin comillas backticks.
  El JSON debe tener este formato exacto:
  {
    "question": "la pregunta aquí",
    "options": ["opción 1", "opción 2", "opción 3", "opción 4"],
    "correctAnswer": 0
  }
  donde correctAnswer es el índice (0-3) de la respuesta correcta en el array de options.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
    });

    const content = response.text;
    
    // Limpiamos cualquier formato markdown que pueda venir en la respuesta
    const cleanedContent = content
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    return JSON.parse(cleanedContent);
  } catch (error) {
    console.error('Error generando pregunta:', error);
    throw error;
  }
};

module.exports = { generateQuestions };