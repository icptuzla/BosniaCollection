// Next.js API route for fetching World Cup 2026 data
export default async function handler(req, res) {
    const API_KEY = process.env.API_FOOTBALL_KEY; // Store this in your .env.local file
    const LEAGUE_ID = '1'; // World Cup 2026 ID
    const SEASON = '2026';

    try {
        const response = await fetch(
            `https://v3.football.api-sports.io/fixtures?league=${LEAGUE_ID}&season=${SEASON}`,
            {
                method: 'GET',
                headers: {
                    'x-apisports-key': API_KEY,
                    'x-rapidapi-host': 'v3.football.api-sports.io',
                },
            }
        );

        const data = await response.json();

        // Cache this in your database here (e.g., Vercel KV) 
        // to avoid hitting the 100-request limit!

        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch data' });
    }
}
import { Redis } from '@upstash/redis'

const redis = Redis.fromEnv();

await redis.set('foo', 'bar');
const data = await redis.get('foo');
import { Redis } from '@upstash/redis';

// Initialize Redis using the environment variables added by Vercel
const redis = new Redis({
    url: process.env.KV_REST_API_URL,
    token: process.env.KV_REST_API_TOKEN,
});

export default async function handler(req, res) {
    const CACHE_KEY = 'world_cup_2026_data';

    // 1. Check if cached data exists
    const cachedData = await redis.get(CACHE_KEY);
    if (cachedData) {
        return res.status(200).json(cachedData);
    }

    // 2. If no cache, fetch from API
    try {
        const response = await fetch(
            `https://v3.football.api-sports.io/fixtures?league=1&season=2026`,
            {
                headers: { 'x-apisports-key': process.env.API_FOOTBALL_KEY }
            }
        );
        const data = await response.json();

        // 3. Store in Redis with a 1-hour expiration (3600 seconds)
        await redis.set(CACHE_KEY, JSON.stringify(data), { ex: 3600 });

        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch data' });
    }
}
import { Redis } from '@upstash/redis';
import { NextResponse } from 'next/server';

// Initialize Redis
const redis = Redis.fromEnv();

export const POST = async () => {
    // Fetch data from Redis
    const result = await redis.get("item");

    // Return the result in the response
    return new NextResponse(JSON.stringify({ result }), { status: 200 });
};