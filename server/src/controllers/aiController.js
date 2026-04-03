import { env } from "../config/env.js";

const GEMINI_API_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models";
const MAX_MESSAGE_LENGTH = 4000;
const MAX_HISTORY_MESSAGES = 20;

const systemPrompt = `You are an AI Placement Preparation Assistant for a student portal called "PlacePrep".
Your role is to help students with:
- Coding Interview Preparation (DSA, Algorithms, Problem Solving)
- Aptitude Test Preparation (Quantitative, Logical Reasoning, Verbal Ability)
- Technical Interview Questions
- HR Interview Tips
- Resume Building Advice
- Career Guidance

Provide helpful, accurate, and practical responses.
Keep answers concise but informative.
If you don't know something, say so and suggest next steps.`;

export function handleAIStatus(req, res) {
  const configured = Boolean(env.geminiApiKey);
  res.json({
    provider: "gemini",
    configured,
    model: env.geminiModel,
  });
}

export async function handleAIChat(req, res) {
  try {
    const { message, history } = req.body ?? {};
    const userMessage = typeof message === "string" ? message.trim() : "";

    if (!userMessage) {
      return res.status(400).json({ error: "Message is required" });
    }
    if (userMessage.length > MAX_MESSAGE_LENGTH) {
      return res.status(400).json({
        error: `Message is too long (max ${MAX_MESSAGE_LENGTH} characters)`,
      });
    }

    // Check if API key is configured
    if (!env.geminiApiKey) {
      return res.status(503).json({
        error: "AI service not configured",
        message: "Please configure GEMINI_API_KEY in the environment variables",
      });
    }

    // Prepare the request body for Gemini API
    const contents = [];

    // Add conversation history if available
    if (history && Array.isArray(history)) {
      const recentHistory = history
        .slice(-MAX_HISTORY_MESSAGES)
        .filter((msg) => msg && typeof msg.content === "string" && msg.content.trim());

      recentHistory.forEach((msg) => {
        contents.push({
          role: msg.role === "user" ? "user" : "model",
          parts: [{ text: msg.content.trim().slice(0, MAX_MESSAGE_LENGTH) }],
        });
      });
    }

    // Add the current message
    contents.push({
      role: "user",
      parts: [{ text: userMessage }],
    });

    const requestBody = {
      contents,
      systemInstruction: {
        parts: [{ text: systemPrompt }],
      },
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1024,
      },
    };

    // Make the API call to Gemini
    const response = await fetch(
      `${GEMINI_API_BASE_URL}/${env.geminiModel}:generateContent?key=${env.geminiApiKey}`,
      {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Gemini API error:", errorData);
      return res.status(response.status).json({
        error: "Failed to get AI response",
        details: errorData.error?.message || "Unknown error",
      });
    }

    const data = await response.json();

    // Extract the response text
    const aiResponse =
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "I'm sorry, I couldn't generate a response. Please try again.";

    res.json({ response: aiResponse });
  } catch (error) {
    console.error("AI Controller error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
