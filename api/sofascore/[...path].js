import axios from 'axios';

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
  'Accept': 'application/json, text/plain, */*',
  'Accept-Language': 'en-US,en;q=0.9',
  'Referer': 'https://www.sofascore.com/',
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const path = req.query.path || [];
    const pathStr = Array.isArray(path) ? path.join('/') : path;
    const { path: _, ...queryParams } = req.query;
    const resp = await axios.get(`https://api.sofascore.com/api/v1/${pathStr}`, {
      params: queryParams,
      headers: HEADERS,
      timeout: 15000,
    });
    res.status(200).json(resp.data);
  } catch (err) {
    res.status(err.response?.status || 500).json({ error: err.message });
  }
}
