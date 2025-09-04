import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();
const app = express();
const PORT = 3001;

// Ollama configuration
const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
const SYSTEM_PROMPT = "You are NOMOS AI, a professional Kenyan legal assistant. Provide accurate, clear, and helpful information about Kenyan law, legal procedures, and regulations. Always maintain a professional and respectful tone.";

// CORS configuration for specific origins
const allowedOrigins = [
  'http://localhost:3001',
  'https://c672046b1632.ngrok-free.app', // Current ngrok URL
  'https://f68d23c0db40.ngrok-free.app', // Previous ngrok URL
  /^https:\/\/.*\.ngrok-free\.app$/, // Allow all ngrok URLs
  /^https:\/\/.*\.netlify\.app$/ // Allow all Netlify domains
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    // Check if the origin is in our allowed list
    const isAllowed = allowedOrigins.some(allowedOrigin => {
      if (typeof allowedOrigin === 'string') {
        return allowedOrigin === origin;
      } else if (allowedOrigin instanceof RegExp) {
        return allowedOrigin.test(origin);
      }
      return false;
    });

    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'ngrok-skip-browser-warning']
}));
app.use(express.json());
app.use(express.static('public'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Get available Ollama models
app.get('/api/models', async (req, res) => {
  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/tags`);
    if (!response.ok) {
      throw new Error('Failed to fetch models');
    }
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Error fetching models:', error);
    res.status(500).json({ error: 'Failed to fetch Ollama models' });
  }
});

// Chat with Ollama
app.post('/api/chat', async (req, res) => {
  const { prompt, model = 'llama3.2' } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        prompt: `${SYSTEM_PROMPT}\n\nUser: ${prompt}`,
        stream: false,
        options: {
          temperature: 0.7,
          top_p: 0.9,
        }
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.status}`);
    }

    const data = await response.json();
    res.json({ response: data.response });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ 
      error: 'Failed to generate response',
      details: error.message 
    });
  }
});

// Chat with streaming
app.post('/api/chat/stream', async (req, res) => {
  const { prompt, model = 'llama3.2' } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  res.setHeader('Content-Type', 'text/plain');
  res.setHeader('Transfer-Encoding', 'chunked');

  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        prompt: `${SYSTEM_PROMPT}\n\nUser: ${prompt}`,
        stream: true,
        options: {
          temperature: 0.7,
          top_p: 0.9,
        }
      }),
    });

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n').filter(line => line.trim());

      for (const line of lines) {
        try {
          const json = JSON.parse(line);
          if (json.response) {
            res.write(json.response);
          }
        } catch (e) {
          console.error('Error parsing JSON:', e);
        }
      }
    }

    res.end();

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ 
      error: 'Failed to generate response',
      details: error.message 
    });
  }
});

// Gemini API endpoint (existing)
app.post('/api/gemini', async (req, res) => {
  const { prompt } = req.body;

  if (!prompt) return res.status(400).json({ error: 'Prompt required' });

  try {
    const systemInstructions = "You are a polite and professional AI law assistant for Kenyan law. Provide clear, accurate information about Kenyan legal matters.";

    const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemma-3-1b-it:generateContent';
    const API_KEY = process.env.GEMINI_API_KEY;

    if (!API_KEY) {
      return res.status(500).json({ error: 'Gemini API key not configured' });
    }

    const response = await fetch(`${API_URL}?key=${API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `${systemInstructions}\n\nUSER QUESTION: ${prompt}`
          }]
        }]
      })
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Sorry, I cannot respond at this time';
    res.json({ response: reply });

  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ 
      error: 'Server error',
      details: err.message 
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 NOMOS AI Server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🤖 Ollama endpoint: http://localhost:${PORT}/api/chat`);
  console.log(`💎 Gemini endpoint: http://localhost:${PORT}/api/gemini`);
});
