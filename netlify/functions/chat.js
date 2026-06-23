const { GoogleGenAI } = require("@google/genai");

exports.handler = async (event) => {
  const { lat, lng, userPrompt } = JSON.parse(event.body);
  const client = new GoogleGenAI({ apiKey: process.env.AI_API });

  try {
    const response = await client.models.generateContent({
      model: "gemini-2.5-flash-lite",
      // Use the prompt from the user, defaulting to a general query
      contents: userPrompt || "What is the rating of the hotel nearby?",
      config: {
        tools: [{ googleMaps: {} }],
        toolConfig: {
          retrievalConfig: { latLng: { latitude: lat, longitude: lng } }
        }
      }
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ result: response.text }),
    };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};