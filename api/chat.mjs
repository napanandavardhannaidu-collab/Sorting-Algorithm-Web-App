import { GoogleGenAI } from '@google/genai';
import { SYSTEM_PROMPT } from '../chatKnowledgeBase.mjs';

let genAI = null;

if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY') {
  genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
}

export default async function handler(req, res) {
  // Only accept POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  // Check if Gemini is configured
  if (!genAI) {
    return res.status(503).json({
      error: 'AI chatbot is not configured. Please set GEMINI_API_KEY in Vercel environment variables.',
    });
  }

  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array is required.' });
    }

    // Build the conversation contents for Gemini
    const contents = messages.map((msg) => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    }));

    // Call Gemini API with system instruction
    const response = await genAI.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: contents,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        temperature: 0.7,
        topP: 0.9,
        topK: 40,
        maxOutputTokens: 2048,
      },
    });

    const reply = response.text || 'I could not generate a response. Please try again.';

    return res.status(200).json({ reply });
  } catch (error) {
    console.error('Chat API error:', error);

    if (error.status === 429) {
      return res.status(429).json({
        error: 'Rate limit exceeded. Please wait a moment and try again.',
      });
    }

    return res.status(500).json({
      error: 'An internal error occurred while processing your request.',
    });
  }
}
