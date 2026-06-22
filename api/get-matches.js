import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  try {
    // 1. Check Redis Cache
    const cachedMatches = await kv.get('bosnia_matches');
    
    if (cachedMatches) {
      return res.status(200).json(cachedMatches);
    }

    // 2. Fetch from v3.football.api-sports.io
    const apiKey = process.env.API_SPORTS_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "API_SPORTS_KEY is missing in environment variables" });
    }

    // Fetch fixtures for Bosnia & Herzegovina (Team ID: 18)
    const response = await fetch('https://v3.football.api-sports.io/fixtures?team=18&season=2026', {
      headers: {
        'x-apisports-key': apiKey
      }
    });
    
    const data = await response.json();
    
    if (!data.response) {
      throw new Error("Invalid response from API-Sports");
    }

    const matches = data.response;
    
    // 3. Cache the real data in Vercel KV for 60 seconds
    await kv.set('bosnia_matches', matches, { ex: 60 });

    return res.status(200).json(matches);
  } catch (error) {
    console.error("API Error:", error);
    return res.status(500).json({ error: error.message });
  }
}
