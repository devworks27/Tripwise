import React, { useState, useEffect } from 'react';
import type { Destination, WeatherInfo } from '../types/trip';
import { API_BASE_URL } from '../config';
import {
  X,
  MapPin,
  Calendar,
  CloudSun,
  Sun,
  CloudRain,
  Cloud,
  Wind,
  Compass,
  Star,
  DollarSign,
  ExternalLink,
  Plus,
  Check,
  Clock
} from 'lucide-react';

interface DestinationModalProps {
  destination: Destination | null;
  onClose: () => void;
  onAddToItinerary: (dest: Destination, travelDate?: string, notes?: string, cost?: number) => void;
  isSaved: boolean;
}

export const DestinationModal: React.FC<DestinationModalProps> = ({
  destination,
  onClose,
  onAddToItinerary,
  isSaved
}) => {
  const [weather, setWeather] = useState<WeatherInfo | null>(null);
  const [loadingWeather, setLoadingWeather] = useState(false);
  const [travelDate, setTravelDate] = useState('');
  const [notes, setNotes] = useState('');
  const [budget, setBudget] = useState<number>(destination?.estimatedCost || 100);

  useEffect(() => {
    if (!destination) return;

    setBudget(destination.estimatedCost || 100);
    setTravelDate('');
    setNotes('');

    // Fetch live weather from API
    const fetchWeather = async () => {
      setLoadingWeather(true);
      try {
        const res = await fetch(
          `${API_BASE_URL}/api/weather?lat=${destination.coordinates.lat}&lon=${destination.coordinates.lon}`
        );
        if (res.ok) {
          const data = await res.json();
          setWeather(data);
        }
      } catch (err) {
        console.error('Failed to load weather:', err);
      } finally {
        setLoadingWeather(false);
      }
    };

    fetchWeather();
  }, [destination]);

  if (!destination) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onAddToItinerary(destination, travelDate, notes, budget);
  };

  const getWeatherIcon = (type?: string) => {
    switch (type) {
      case 'Sunny':
        return <Sun className="w-8 h-8 text-amber-500 animate-spin-slow" />;
      case 'Rain':
        return <CloudRain className="w-8 h-8 text-sky-500" />;
      case 'Cloudy':
        return <Cloud className="w-8 h-8 text-slate-400" />;
      default:
        return <CloudSun className="w-8 h-8 text-amber-500" />;
    }
  };

  const mapUrl = `https://www.openstreetmap.org/?mlat=${destination.coordinates.lat}&mlon=${destination.coordinates.lon}#map=12/${destination.coordinates.lat}/${destination.coordinates.lon}`;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fade-in">
      <div 
        className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full overflow-hidden border border-slate-100 flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header & Hero Image */}
        <div className="relative h-64 sm:h-72 w-full bg-slate-900 flex-shrink-0">
          <img
            src={destination.image}
            alt={destination.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-slate-900/60 hover:bg-slate-900 text-white p-2 rounded-full backdrop-blur-md border border-white/20 transition-all hover:scale-105"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Destination Header Info */}
          <div className="absolute bottom-5 left-5 right-5 text-white">
            <span className="text-xs uppercase font-extrabold tracking-wider bg-sky-500/90 backdrop-blur-md px-3 py-1 rounded-full inline-block mb-2 shadow-sm">
              {destination.category}
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight drop-shadow-md">
              {destination.name}
            </h2>
            <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-slate-200 mt-1.5 font-medium">
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4 text-sky-400" />
                {destination.location}
              </span>
              <span className="flex items-center gap-1">
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                {destination.rating.toFixed(1)} / 5.0
              </span>
              <a
                href={mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-sky-300 hover:text-sky-200 underline underline-offset-2 ml-auto"
              >
                <span>View Map</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Live Open-Meteo Weather Card */}
          <div className="bg-gradient-to-r from-sky-50 to-blue-50 border border-sky-100 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white rounded-2xl shadow-sm border border-sky-100">
                {getWeatherIcon(weather?.weatherType)}
              </div>
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-slate-900">
                    {loadingWeather ? '...' : `${weather?.temperature ?? 24}°C`}
                  </span>
                  <span className="text-xs text-slate-500 font-semibold">
                    ({loadingWeather ? '' : `${Math.round(((weather?.temperature ?? 24) * 9) / 5 + 32)}°F`})
                  </span>
                </div>
                <p className="text-xs font-bold text-sky-900 mt-0.5">
                  {loadingWeather ? 'Fetching real-time weather...' : weather?.condition}
                </p>
                <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                  <Wind className="w-3 h-3 text-slate-400" />
                  Wind: {weather?.windspeed ?? 5} km/h • High: {weather?.maxTemp ?? 26}°C • Low: {weather?.minTemp ?? 19}°C
                </p>
              </div>
            </div>

            <div className="text-right sm:border-l sm:border-sky-200/80 sm:pl-4 w-full sm:w-auto flex justify-between sm:flex-col items-end">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-sky-600 bg-sky-100/70 px-2.5 py-1 rounded-full">
                Live Open-Meteo API
              </span>
              <span className="text-[11px] text-slate-400 mt-1">Real-time coordinates telemetry</span>
            </div>
          </div>

          {/* About / Overview */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Destination Overview
            </h4>
            <p className="text-slate-700 leading-relaxed text-sm sm:text-base">
              {destination.description}
            </p>
          </div>

          {/* Quick Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/70 flex items-start gap-3">
              <Clock className="w-5 h-5 text-sky-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Best Season to Visit</p>
                <p className="text-sm font-semibold text-slate-800 mt-0.5">
                  {destination.bestTimeToVisit || 'September to April'}
                </p>
              </div>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/70 flex items-start gap-3">
              <Compass className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Geo Coordinates</p>
                <p className="text-sm font-mono font-semibold text-slate-800 mt-0.5">
                  {destination.coordinates.lat.toFixed(4)}° N, {destination.coordinates.lon.toFixed(4)}° E
                </p>
              </div>
            </div>
          </div>

          {/* Highlights */}
          {destination.highlights && destination.highlights.length > 0 && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Top Highlights & Points of Interest
              </h4>
              <div className="flex flex-wrap gap-2">
                {destination.highlights.map((h, i) => (
                  <span
                    key={i}
                    className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-800 px-3 py-1.5 rounded-xl font-medium border border-slate-200/80 transition"
                  >
                    ✨ {h}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Add to Itinerary Form */}
          <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-lg border border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold flex items-center gap-2">
                <Calendar className="w-4 h-4 text-sky-400" />
                Add to Personal Itinerary
              </h3>
              {isSaved && (
                <span className="text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 rounded-full font-semibold flex items-center gap-1">
                  <Check className="w-3 h-3" /> In Itinerary
                </span>
              )}
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Planned Travel Date
                  </label>
                  <input
                    type="date"
                    value={travelDate}
                    onChange={(e) => setTravelDate(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-sky-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Estimated Budget ($ USD)
                  </label>
                  <div className="relative">
                    <DollarSign className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="number"
                      min="0"
                      step="10"
                      value={budget}
                      onChange={(e) => setBudget(Number(e.target.value))}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-sm text-white focus:outline-sky-400"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Travel Notes / Checklist (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Bring camera for sunrise, pack trekking shoes..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-sky-400"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 bg-gradient-to-r from-sky-500 to-emerald-500 hover:from-sky-600 hover:to-emerald-600 text-white px-5 py-2 rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  {isSaved ? 'Save Additional Leg' : 'Add to My Itinerary'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
