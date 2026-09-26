import axios from 'axios';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const { prompt, data } = req.body;
    if (!prompt) return res.status(400).json({ error: 'Prompt is required' });

    if (!GEMINI_API_KEY) return res.status(500).json({ error: 'API key not configured' });

    const response = await axios.post(GEMINI_URL, {
      contents: [{
        parts: [{
          text: `${data ? `Context data: ${JSON.stringify(data)}\n\n` : ''}${prompt}`
        }]
      }],
      generationConfig: {
        temperature: 0.7,
        topP: 0.95,
        maxOutputTokens: 500,
      },
    }, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 30000,
    });

    const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || 'No response from Gemini';
    res.status(200).json({ text });
  } catch (err) {
    res.status(err.response?.status || 500).json({ error: err.message || 'Gemini API error' });
  }
}
