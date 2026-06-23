const { GoogleGenAI } = require("@google/genai");

exports.handler = async (event) => {
  const { lat, lng, userPrompt } = JSON.parse(event.body);
  const client = new GoogleGenAI({ apiKey: process.env.AI_API });

  try {
    const response = await client.models.generateContent({
      model: "gemini-3.1-flash-lite",
      // Use the prompt from the user, defaulting to a general query
      contents: `You are a hotel information assistant.

                Find details about the hotel named "{hotel_name}" located in the Lat/Lon Given "{lat} , "{lon}".

                Return ONLY valid JSON matching this schema:

                {
                  "name": "string | null",
                  "rating": number | null,
                  "summary": "string | null",
                  "address": "string | null",
                  "city": "string | null",
                  "country": "string | null",
                  "amenities": ["string"],
                  "highlights": ["string"],
                  "review_overview": {
                    "positive": ["string"],
                    "negative": ["string"]
                  },
                  "silence_rating": {
                    "score": number,
                    "reason": "string"
                  }
                }

                Rules:
                - No markdown.
                - No comments.
                - No extra text before or after the JSON.
                - Use null when information is unavailable.
                - Summary must be factual and concise.
                - silence_rating.score must be an integer from 0 to 100.
                - silence_rating.score is an AI-estimated quietness score based on hotel location, nearby roads, nightlife, airports, railways, guest reviews, room soundproofing, and surrounding environment.
                - 100 = exceptionally quiet and ideal for sleep.
                - 80–99 = very quiet.
                - 60–79 = generally quiet with occasional noise.
                - 40–59 = moderate noise.
                - 20–39 = frequently noisy.
                - 0–19 = extremely noisy.
                - silence_rating.reason must briefly explain the score.
                - Base conclusions on available evidence, reviews, and location characteristics.
                - If evidence is insufficient, provide the best estimate and explain the uncertainty in the reason field.
                `.replace("{hotel_name}", userPrompt).replace("{lat}", lat).replace("{lon}", lng),
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