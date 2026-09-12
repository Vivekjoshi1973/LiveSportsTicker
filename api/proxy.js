export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { api, ...rest } = req.query;
  const params = {};
  for (const [k, v] of Object.entries(rest)) {
    if (k === 'path') continue;
    params[k] = v;
  }

  const targets = {
    sportscore: 'https://sportscore.com',
    sofascore: 'https://api.sofascore.com/api/v1',
    thesportsdb: 'https://www.thesportsdb.com/api/v1/json/3',
  };

  const base = targets[api];
  if (!base) return res.status(400).json({ error: 'Invalid API' });

  const path = Array.isArray(req.query.path) ? req.query.path.join('/') : (req.query.path || '');
  const url = `${base}/${path}`;

  try {
    const { default: axios } = await import('axios');
    const resp = await axios.get(url, {
      params,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': 'https://www.sofascore.com/',
      },
      timeout: 15000,
    });
    res.status(200).json(resp.data);
  } catch (err) {
    res.status(err.response?.status || 500).json({ error: err.message });
  }
}
