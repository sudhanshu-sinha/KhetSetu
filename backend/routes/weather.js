const express = require('express');
const router = express.Router();

// ── In-memory cache (free plan: 60 calls/min) ──
// Cache weather per lat/lon rounded to 2 decimals, TTL = 15 minutes
const cache = new Map();
const CACHE_TTL = 15 * 60 * 1000; // 15 minutes

function getCacheKey(lat, lon) {
  return `${parseFloat(lat).toFixed(2)}_${parseFloat(lon).toFixed(2)}`;
}

function getCached(key) {
  const entry = cache.get(key);
  if (entry && Date.now() - entry.ts < CACHE_TTL) return entry.data;
  if (entry) cache.delete(key);
  return null;
}

// Fallback mock data when API is unavailable
function getMockWeather() {
  const conditions = ['Clear', 'Clouds', 'Haze'];
  return {
    temp: 28 + Math.floor(Math.random() * 8),
    humidity: 55 + Math.floor(Math.random() * 25),
    condition: conditions[Math.floor(Math.random() * 3)],
    description: 'simulated data',
    wind: (5 + Math.random() * 10).toFixed(1),
    city: 'Your Location',
    icon: '01d',
    mock: true,
  };
}

// GET /api/weather?lat=...&lon=...
router.get('/', async (req, res) => {
  try {
    const { lat = 28.6139, lon = 77.2090 } = req.query; // Default: Delhi
    const apiKey = process.env.OPENWEATHER_API_KEY;

    // If no API key, return mock data
    if (!apiKey) {
      return res.json(getMockWeather());
    }

    // Check cache first
    const cacheKey = getCacheKey(lat, lon);
    const cached = getCached(cacheKey);
    if (cached) {
      return res.json({ ...cached, cached: true });
    }

    // Free plan endpoint: /data/2.5/weather (current weather only)
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
    const response = await fetch(url);

    if (!response.ok) {
      console.error('OpenWeather API error:', response.status);
      // On any API error, return mock data so UI never breaks
      return res.json(getMockWeather());
    }

    const data = await response.json();

    const result = {
      temp: Math.round(data.main.temp),
      humidity: data.main.humidity,
      condition: data.weather[0].main,
      description: data.weather[0].description,
      wind: (data.wind.speed * 3.6).toFixed(1), // m/s → km/h
      city: data.name,
      icon: data.weather[0].icon,
    };

    // Store in cache
    cache.set(cacheKey, { data: result, ts: Date.now() });

    // Limit cache size to prevent memory leak (max 100 locations)
    if (cache.size > 100) {
      const oldest = cache.keys().next().value;
      cache.delete(oldest);
    }

    res.json(result);
  } catch (err) {
    console.error('Weather fetch error:', err.message);
    // Always return data so the widget never shows empty
    res.json(getMockWeather());
  }
});

module.exports = router;
