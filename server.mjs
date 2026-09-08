import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import os from 'os';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { SYSTEM_PROMPT } from './chatKnowledgeBase.mjs';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Parse JSON bodies for API requests
app.use(express.json({ limit: '1mb' }));

// --- AI Chat API Endpoint ---
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
let genAI = null;

if (GEMINI_API_KEY && GEMINI_API_KEY !== 'MY_GEMINI_API_KEY') {
  genAI = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
  console.log('✅ Gemini AI initialized successfully');
} else {
  console.warn('⚠️  GEMINI_API_KEY not set — AI chatbot will be unavailable.');
  console.warn('   Set it in your .env file: GEMINI_API_KEY=your_key_here');
  console.warn('   Get a free key at: https://aistudio.google.com/apikey');
}

app.post('/api/chat', async (req, res) => {
  try {
    if (!genAI) {
      return res.status(503).json({
        error: 'AI chatbot is not configured. Please set GEMINI_API_KEY in your .env file.',
      });
    }

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

    return res.json({ reply });
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
});

// Serve static files from dist folder
app.use(express.static(path.join(__dirname, 'dist')));

// Handle SPA routing - serve index.html for all routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Get network IP
function getNetworkIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      // Skip internal and non-IPv4 addresses
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

app.listen(PORT, '0.0.0.0', () => {
  const networkIP = getNetworkIP();
  console.log(`
╔══════════════════════════════════════════════════════════╗
║   SortBench Server Running 24/7                         ║
║   Local:   http://localhost:${PORT}/                      ║
║   Network: http://${networkIP}:${PORT}/                     ║
║                                                          ║
║   AI Chatbot: ${genAI ? '✅ Enabled' : '❌ Disabled (set GEMINI_API_KEY)'}${''.padEnd(genAI ? 23 : 4)}║
║   Server will run even if VS Code is closed             ║
╚══════════════════════════════════════════════════════════╝
  `);
});
