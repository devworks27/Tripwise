import { useState, useEffect, useCallback } from 'react';
import type { Destination, ItineraryItem, TripStats } from './types/trip';
import { API_BASE_URL } from './config';
import { Navbar } from './components/Navbar';
import { DestinationCard } from './components/DestinationCard';
import { DestinationModal } from './components/DestinationModal';
import { ItineraryView } from './components/ItineraryView';
import { TripStatsView } from './components/TripStatsView';
import {
  Search,
  Filter,
  ArrowUpDown,
  RefreshCw,
  Sparkles,
  MapPin,
  CheckCircle,
  AlertTriangle,
  Info
} from 'lucide-react';

const SUGGESTED_DESTINATIONS = [
  'Kyoto',
  'Paris',
  'Ooty',
  'Santorini',
  'Bali',
  'Taj Mahal',
  'Rome',
  'Grand Canyon',
  'Goa',
  'Banff'
];

export default function App() {
  const [activeTab, setActiveTab] = useState<'explore' | 'itinerary' | 'analytics'>('explore');
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [itinerary, setItinerary] = useState<ItineraryItem[]>([]);
  const [stats, setStats] = useState<TripStats | null>(null);
  
  // Controls
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [sortBy, setSortBy] = useState('rating');
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');
  
  // UX State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [serverOnline, setServerOnline] = useState(true);
  const [selectedDestination, setSelectedDestination] = useState<Destination | null>(null);
  
  // Toast notifications
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  const checkHealth = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/health`);
      setServerOnline(res.ok);
    } catch {
      setServerOnline(false);
    }
  };

  const fetchDestinations = useCallback(async (query = search, cat = category, sort = sortBy, ord = order) => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({
        search: query,
        category: cat,
        sortBy: sort,
        order: ord
      });
      const res = await fetch(`${API_BASE_URL}/api/destinations?${params.toString()}`);
      if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
      const data = await res.json();
      setDestinations(data);
      setServerOnline(true);
    } catch (err: any) {
      console.error(err);
      setError('Unable to fetch destination catalog. Please verify that the backend API is running.');
      setServerOnline(false);
    } finally {
      setLoading(false);
    }
  }, [search, category, sortBy, order]);

  const fetchItinerary = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/itinerary`);
      if (res.ok) {
        const data = await res.json();
        setItinerary(data);
        setServerOnline(true);
      }
    } catch (err) {
      console.error('Failed to sync itinerary from database:', err);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/itinerary/stats`);
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  };

  // Initial load
  useEffect(() => {
    checkHealth();
    fetchDestinations();
    fetchItinerary();
    fetchStats();
  }, []);

  // Refresh when category or sorting changes
  useEffect(() => {
    fetchDestinations(search, category, sortBy, order);
  }, [category, sortBy, order]);

  // Handle Search Submission
  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    fetchDestinations(search, category, sortBy, order);
  };

  const handleSuggestionClick = (keyword: string) => {
    setSearch(keyword);
    fetchDestinations(keyword, category, sortBy, order);
  };

  const resetFilters = () => {
    setSearch('');
    setCategory('all');
    setSortBy('rating');
    setOrder('desc');
    fetchDestinations('', 'all', 'rating', 'desc');
  };

  // Add destination to Itinerary (persisted to SQLite)
  const addToItinerary = async (
    dest: Destination,
    travelDate?: string,
    notes?: string,
    cost?: number
  ) => {
    try {
      const payload = {
        destination_id: dest.id,
        name: dest.name,
        location: dest.location,
        category: dest.category,
        description: dest.description,
        image: dest.image,
        travel_date: travelDate || null,
        notes: notes || '',
        status: 'planned',
        estimated_cost: cost !== undefined ? cost : dest.estimatedCost
      };

      const res = await fetch(`${API_BASE_URL}/api/itinerary`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.status === 409) {
        showToast(`"${dest.name}" is already in your itinerary!`, 'info');
        return;
      }

      if (!res.ok) {
        throw new Error('Failed to save destination');
      }

      await fetchItinerary();
      await fetchStats();
      showToast(`Added "${dest.name}" to your itinerary!`, 'success');
      if (selectedDestination) {
        setSelectedDestination(null);
      }
    } catch (err) {
      console.error(err);
      showToast('Could not save destination to itinerary.', 'error');
    }
  };

  // Update Itinerary Item in SQLite
  const updateItineraryItem = async (id: number, updates: Partial<ItineraryItem>) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/itinerary/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });

      if (!res.ok) throw new Error('Failed to update itinerary item');

      await fetchItinerary();
      await fetchStats();
      showToast('Itinerary updated successfully.', 'success');
    } catch (err) {
      console.error(err);
      showToast('Failed to update itinerary.', 'error');
    }
  };

  // Delete from Itinerary
  const removeFromItinerary = async (id: number) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/itinerary/${id}`, {
        method: 'DELETE'
      });

      if (!res.ok) throw new Error('Failed to delete itinerary item');

      await fetchItinerary();
      await fetchStats();
      showToast('Destination removed from itinerary.', 'info');
    } catch (err) {
      console.error(err);
      showToast('Failed to remove item.', 'error');
    }
  };

  // Set of saved destination names for quick check
  const savedDestinationNames = new Set(itinerary.map((i) => i.name.toLowerCase()));

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans selection:bg-sky-500 selection:text-white">
      {/* Toast Notification Container */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce-short">
          <div
            className={`flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl border text-sm font-semibold backdrop-blur-md ${
              toast.type === 'success'
                ? 'bg-emerald-950/90 text-emerald-200 border-emerald-700/80'
                : toast.type === 'error'
                ? 'bg-rose-950/90 text-rose-200 border-rose-700/80'
                : 'bg-slate-900/90 text-slate-200 border-slate-700/80'
            }`}
          >
            {toast.type === 'success' && <CheckCircle className="w-4 h-4 text-emerald-400" />}
            {toast.type === 'error' && <AlertTriangle className="w-4 h-4 text-rose-400" />}
            {toast.type === 'info' && <Info className="w-4 h-4 text-sky-400" />}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Navigation Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        itineraryCount={itinerary.length}
        serverOnline={serverOnline}
      />

      {/* Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {activeTab === 'explore' && (
          <div className="space-y-8">
            {/* Hero Search Banner */}
            <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-slate-900 via-sky-950 to-slate-900 text-white p-6 sm:p-10 shadow-2xl border border-slate-800">
              <div className="max-w-2xl relative z-10">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-sky-500/20 text-sky-300 border border-sky-400/30 mb-4">
                  <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                  Live Destination Discovery
                </span>
                <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
                  Discover places.<br />
                  <span className="bg-gradient-to-r from-sky-400 to-emerald-400 bg-clip-text text-transparent">
                    Plan your next journey.
                  </span>
                </h1>
                <p className="mt-3 text-slate-300 text-sm sm:text-base leading-relaxed">
                  Search any destination worldwide. Explore real-time weather forecasts, rich cultural summaries, and organize your trip with persistent itineraries.
                </p>

                {/* Search Bar Input Form */}
                <form onSubmit={handleSearchSubmit} className="mt-6 flex flex-col sm:flex-row gap-2 max-w-xl">
                  <div className="relative flex-1">
                    <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      placeholder="Search any place (e.g. Kyoto, Paris, Ooty, Rome...)"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:bg-white/15 text-sm transition"
                    />
                  </div>
                  <button
                    type="submit"
                    className="bg-gradient-to-r from-sky-500 to-emerald-500 hover:from-sky-600 hover:to-emerald-600 text-white font-bold px-6 py-3 rounded-2xl text-sm shadow-lg shadow-sky-500/25 transition-all active:scale-95 flex items-center justify-center gap-2"
                  >
                    <Search className="w-4 h-4" />
                    <span>Search</span>
                  </button>
                </form>

                {/* Quick Suggestion Chips */}
                <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-slate-300">
                  <span className="font-semibold text-slate-400 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-sky-400" />
                    Popular:
                  </span>
                  {SUGGESTED_DESTINATIONS.map((dest) => (
                    <button
                      key={dest}
                      onClick={() => handleSuggestionClick(dest)}
                      className="bg-white/10 hover:bg-white/20 text-slate-200 px-2.5 py-1 rounded-lg border border-white/10 transition-colors"
                    >
                      {dest}
                    </button>
                  ))}
                </div>
              </div>

              {/* Decorative Background Elements */}
              <div className="absolute right-[-80px] top-[-80px] w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute right-20 bottom-[-40px] w-72 h-72 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
            </div>

            {/* Filter & Sorting Toolbar */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
              {/* Category Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1 flex items-center gap-1">
                  <Filter className="w-3.5 h-3.5" />
                  Category:
                </span>
                {[
                  { id: 'all', label: 'All' },
                  { id: 'cultural', label: 'Cultural' },
                  { id: 'nature', label: 'Nature' },
                  { id: 'historical', label: 'Historical' },
                  { id: 'adventure', label: 'Adventure' },
                  { id: 'beach', label: 'Beach' },
                  { id: 'city', label: 'City' }
                ].map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setCategory(cat.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                      category === cat.id
                        ? 'bg-slate-900 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Sorting & Order Controls */}
              <div className="flex items-center gap-2 self-end md:self-auto">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <ArrowUpDown className="w-3.5 h-3.5" />
                  Sort:
                </span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 focus:outline-sky-500"
                >
                  <option value="rating">Top Rated</option>
                  <option value="name">Destination Name</option>
                  <option value="cost">Estimated Budget</option>
                  <option value="category">Category</option>
                </select>

                <button
                  onClick={() => setOrder(order === 'asc' ? 'desc' : 'asc')}
                  className="p-1.5 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold transition"
                  title={`Toggle order (currently ${order.toUpperCase()})`}
                >
                  {order === 'asc' ? '▲ Asc' : '▼ Desc'}
                </button>

                {(search || category !== 'all' || sortBy !== 'rating') && (
                  <button
                    onClick={resetFilters}
                    className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl transition"
                    title="Reset all filters"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-center justify-between text-rose-800 text-sm">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-rose-500 flex-shrink-0" />
                  <span>{error}</span>
                </div>
                <button
                  onClick={() => fetchDestinations()}
                  className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition"
                >
                  Retry
                </button>
              </div>
            )}

            {/* Loading Skeletons */}
            {loading && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div
                    key={i}
                    className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm animate-pulse"
                  >
                    <div className="h-48 bg-slate-200" />
                    <div className="p-5 space-y-3">
                      <div className="h-4 bg-slate-200 rounded w-1/3" />
                      <div className="h-6 bg-slate-200 rounded w-3/4" />
                      <div className="h-4 bg-slate-200 rounded w-1/2" />
                      <div className="h-12 bg-slate-100 rounded" />
                      <div className="h-8 bg-slate-200 rounded mt-4" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Empty State */}
            {!loading && !error && destinations.length === 0 && (
              <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-slate-300 shadow-sm max-w-lg mx-auto">
                <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-1">No destinations found</h3>
                <p className="text-xs text-slate-500 mb-4">
                  We couldn't find matching places for "{search}". Try searching for major cities, countries, or resetting your category filter.
                </p>
                <button
                  onClick={resetFilters}
                  className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2 rounded-xl transition"
                >
                  Reset Filters
                </button>
              </div>
            )}

            {/* Destinations Cards Grid */}
            {!loading && destinations.length > 0 && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">
                    Showing {destinations.length} Destinations
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {destinations.map((dest) => (
                    <DestinationCard
                      key={dest.id}
                      destination={dest}
                      onSelect={(selected) => setSelectedDestination(selected)}
                      onAddToItinerary={(target) => addToItinerary(target)}
                      isSaved={savedDestinationNames.has(dest.name.toLowerCase())}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* My Itinerary Tab */}
        {activeTab === 'itinerary' && (
          <ItineraryView
            items={itinerary}
            onRemove={removeFromItinerary}
            onUpdate={updateItineraryItem}
            onNavigateToExplore={() => setActiveTab('explore')}
          />
        )}

        {/* Trip Analytics Tab */}
        {activeTab === 'analytics' && (
          <TripStatsView
            stats={stats}
            items={itinerary}
            onNavigateToExplore={() => setActiveTab('explore')}
            onNavigateToItinerary={() => setActiveTab('itinerary')}
          />
        )}
      </main>

      {/* Destination Details Modal with Live Weather */}
      {selectedDestination && (
        <DestinationModal
          destination={selectedDestination}
          onClose={() => setSelectedDestination(null)}
          onAddToItinerary={(dest, travelDate, notes, cost) =>
            addToItinerary(dest, travelDate, notes, cost)
          }
          isSaved={savedDestinationNames.has(selectedDestination.name.toLowerCase())}
        />
      )}

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 text-xs py-6 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-white text-sm">TripWise</span>
            <span>— Smart Travel Planning & Itinerary Assistant</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Powered by Open-Meteo & Wikipedia APIs</span>
            <span>•</span>
            <span>SQLite Database Persistence</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
