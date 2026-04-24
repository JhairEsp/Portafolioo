export default async function handler(req, res) {

  // 🔥 SOLUCIÓN CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // 🔥 IMPORTANTE (preflight)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const response = await fetch('https://TU-ENDPOINT-REAL.com/api/heartbeat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        projectId: 'TU_PROJECT_ID',
        apiKey: 'eb79ae517cd24ef118c610bdea35dc67d69a8d27378c29dd'
      })
    });

    const data = await response.json();

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Error' });
  }
}
