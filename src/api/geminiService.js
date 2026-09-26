import axios from 'axios';

const geminiAPI = axios.create({
  baseURL: '/api/gemini',
  timeout: 30000,
});

export const generateLiveCommentary = async (matchData) => {
  const prompt = `You are a professional sports commentator. Generate a single, exciting live commentary sentence based on this match data. Be concise, energetic, and use sports terminology naturally. Match: ${JSON.stringify(matchData)}`;
  try {
    const resp = await geminiAPI.post('', { prompt, data: matchData });
    return resp.data?.text || null;
  } catch { return null; }
};

export const generateMatchSummary = async (matchData) => {
  const prompt = `Generate a detailed post-game summary and tactical analysis for this completed match. Include: final score context, key moments, standout performances, and tactical insights. Be professional and engaging. Match data: ${JSON.stringify(matchData)}`;
  try {
    const resp = await geminiAPI.post('', { prompt, data: matchData });
    return resp.data?.text || null;
  } catch { return null; }
};

export const askNaturalQuestion = async (question, sportsData) => {
  const prompt = `You are a sports statistics expert. Answer the user's question using ONLY the data provided. If the answer is not in the data, say so. Be accurate, concise, and cite specific numbers from the data. Question: ${question}. Data: ${JSON.stringify(sportsData)}`;
  try {
    const resp = await geminiAPI.post('', { prompt, data: sportsData });
    return resp.data?.text || null;
  } catch { return null; }
};
