const { GoogleGenAI } = require("@google/genai");

exports.handler = async (event) => {
  const { lat, lng, userPrompt } = JSON.parse(event.body);
  const client = new GoogleGenAI({ apiKey: process.env.AI_API });

  try {
    const response = await client.models.generateContent({
      model: "gemini-3.1-flash-lite",
      // Use template literals directly to avoid .replace() errors
      contents: `You are a hotel information assistant.
        Find details about the hotel named "${userPrompt}" located at Lat: ${lat}, Lon: ${lng}.
        Return ONLY valid JSON matching this schema:
        {
          "name": "string | null",
          "rating": "number | null",
          "summary": "string | null",
          "address": "string | null",
          "city": "string | null",
          "country": "string | null",
          "amenities": ["string"],
          "highlights": ["string"],
          "review_overview": { "positive": ["string"], "negative": ["string"] },
          "silence_rating": { "score": "number", "reason": "string" }
        }
        Rules: No markdown, no comments, no extra text. Use null for missing data.`,
      config: {
        responseMimeType: "application/json",
        tools: [{ googleSearch: {} }]
      }
    });

    // 1. Get the text content
    const responseText = response.text(); 
    
    // 2. Parse the string to a JSON object so it can be safely sent as a proper JSON response
    const parsedData = JSON.parse(responseText);

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ result: parsedData }),
    };
  } catch (error) {
    console.error("Function failed:", error);
    return { 
      statusCode: 500, 
      body: JSON.stringify({ error: "Failed to process request: " + error.message }) 
    };
  }
};