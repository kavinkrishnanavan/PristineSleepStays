const { GoogleGenAI } = require("@google/genai");

exports.handler = async (event) => {
  try {
    const { lat, lng, userPrompt } = JSON.parse(event.body);
    const client = new GoogleGenAI({ apiKey: process.env.AI_API });

    const response = await client.models.generateContent({
      model: "gemini-3.1-flash-lite",
      contents: `Find details for hotel "${userPrompt}" near ${lat}, ${lng}. Return JSON matching schema: {name, rating, summary, address, city, country, amenities, highlights, review_overview, silence_rating}.`,
      config: {
        responseMimeType: "application/json",
        tools: [{ googleSearch: {} }]
      }
    });

    // Extract text properly
    const responseText = response.candidates[0].content.parts[0].text;
    const parsedData = JSON.parse(responseText);

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsedData), // Send the raw object
    };
  } catch (error) {
    console.error("Lambda Error:", error);
    return { 
      statusCode: 500, 
      body: JSON.stringify({ error: error.message }) 
    };
  }
};