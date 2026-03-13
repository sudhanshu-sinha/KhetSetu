import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import api from '../../utils/api';

const WEATHER_CONDITIONS = {
  Clear:  { emoji: '☀️', label: 'Clear Sky', hi: 'साफ़ आसमान', farming: 'great' },
  Clouds: { emoji: '☁️', label: 'Cloudy',    hi: 'बादल', farming: 'good' },
  Rain:   { emoji: '🌧️', label: 'Rain',      hi: 'बारिश', farming: 'poor' },
  Drizzle:{ emoji: '🌦️', label: 'Drizzle',   hi: 'बूंदाबांदी', farming: 'moderate' },
  Thunderstorm: { emoji: '⛈️', label: 'Storm', hi: 'तूफ़ान', farming: 'bad' },
  Snow:   { emoji: '❄️', label: 'Snow',       hi: 'बर्फ़', farming: 'bad' },
  Mist:   { emoji: '🌫️', label: 'Mist',      hi: 'धुंध', farming: 'moderate' },
  Haze:   { emoji: '🌫️', label: 'Haze',      hi: 'धुंध', farming: 'moderate' },
};

const FARMING_COLORS = {
  great:    { bg: 'from-primary-400 to-primary-500', text: 'text-primary-700 dark:text-primary-400' },
  good:     { bg: 'from-blue-400 to-blue-500', text: 'text-blue-700 dark:text-blue-400' },
  moderate: { bg: 'from-gold-400 to-gold-500', text: 'text-gold-700 dark:text-gold-400' },
  poor:     { bg: 'from-orange-400 to-orange-500', text: 'text-orange-700 dark:text-orange-400' },
  bad:      { bg: 'from-red-400 to-red-500', text: 'text-red-700 dark:text-red-400' },
};

export default function WeatherWidget({ lat, lon, compact = false }) {
  const { i18n } = useTranslation();
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        // Try to get user's location if lat/lon not provided
        let useLat = lat;
        let useLon = lon;

        if (!useLat || !useLon) {
          try {
            const pos = await new Promise((resolve, reject) =>
              navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 })
            );
            useLat = pos.coords.latitude;
            useLon = pos.coords.longitude;
          } catch {
            // Default to Delhi if geolocation fails
            useLat = 28.6139;
            useLon = 77.2090;
          }
        }

        const { data } = await api.get(`/weather?lat=${useLat}&lon=${useLon}`);
        setWeather(data);
      } catch (err) {
        console.error('Weather fetch failed:', err.message);
        setWeather(null);
      } finally {
        setLoading(false);
      }
    };
    fetchWeather();
  }, [lat, lon]);

  if (loading) return <div className="skeleton h-24 w-full rounded-3xl" />;
  if (!weather) return null;

  const cond = WEATHER_CONDITIONS[weather.condition] || WEATHER_CONDITIONS.Clear;
  const farm = FARMING_COLORS[cond.farming];
  const isHi = i18n.language === 'hi';

  if (compact) {
    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-white/60 dark:bg-white/5 backdrop-blur-sm border border-gray-200/50 dark:border-white/5">
        <span className="text-xl">{cond.emoji}</span>
        <span className="text-sm font-semibold text-gray-800 dark:text-white">{weather.temp}°</span>
        <span className={`text-[10px] font-medium ${farm.text}`}>
          {isHi ? cond.hi : cond.label}
        </span>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      className="card-gradient overflow-hidden">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-3xl">{cond.emoji}</span>
            <span className="text-3xl font-extrabold text-gray-900 dark:text-white font-display">{weather.temp}°C</span>
          </div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {isHi ? cond.hi : cond.label} • 💧 {weather.humidity}% • 💨 {weather.wind} km/h
          </p>
          {weather.city && (
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-0.5">📍 {weather.city}</p>
          )}
        </div>
        <div className="text-right">
          <div className={`px-3 py-1.5 rounded-xl bg-gradient-to-r ${farm.bg} text-white text-xs font-semibold`}>
            {isHi
              ? cond.farming === 'great' ? '🌾 खेती के लिए बढ़िया' : cond.farming === 'good' ? '👍 अच्छा' : cond.farming === 'bad' ? '⚠️ सावधान' : '⚡ ठीक'
              : cond.farming === 'great' ? '🌾 Great for farming' : cond.farming === 'good' ? '👍 Good' : cond.farming === 'bad' ? '⚠️ Caution' : '⚡ Moderate'
            }
          </div>
        </div>
      </div>
    </motion.div>
  );
}
