export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Use POST" });
  }

  try {
    const { message } = req.body || {};
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error: "Gemini API key is missing from Vercel settings."
      });
    }

    if (!message) {
      return res.status(400).json({
        error: "Please enter a message."
      });
    }

    const models = [
      "gemini-3.8-flash",
      "gemini-3.6-flash"
    ];

    let lastError = "All Gemini models failed.";

    for (const model of models) {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": apiKey
          },
          body: JSON.stringify({
            systemInstruction: {
              parts: [{
                text: "You are PHANTOM, a futuristic AI assistant. Address the user as Operator. Be intelligent, helpful, and concise."
              }]
            },
            contents: [{
              parts: [{ text: message }]
            }]
          })
        }
      );

      const data = await response.json();

      if (response.ok) {
        const reply = data.candidates?.[0]?.content?.parts
          ?.map(part => part.text || "")
          .join("");

        if (reply) {
          return res.status(200).json({ reply });
        }
      }

      lastError = data.error?.message || `Model ${model} failed.`;

      console.log(`${model} failed:`, lastError);
    }

    return res.status(503).json({
      error: lastError
    });

  } catch (error) {
    console.error("Phantom error:", error.message);

    return res.status(500).json({
      error: "Server error. Please try again."
    });
  }
}
