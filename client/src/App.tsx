import { useState, useEffect } from 'react';

interface Destination {
  id: string; 
  name: string; 
  location: string; 
  category: string; 
  description: string; 
  image: string;
}

export default function App() {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [itinerary, setItinerary] = useState<Destination[]>([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchDestinations = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`http://localhost:5000/api/destinations?search=${search}&category=${category}`);
      if (!res.ok) throw new Error('Network failure');
      const data = await res.json();
      setDestinations(data);
    } catch (err) {
      setError('Could not fetch travel data. Please verify your backend server connection.');
    } finally {
      setLoading(false);
    }
  };

  const fetchItinerary = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/itinerary');
      if (res.ok) {
        const data = await res.json();
        setItinerary(data);
      }
    } catch (err) {
      console.error('Itinerary sync error:', err);
    }
  };

  useEffect(() => { 
    fetchDestinations(); 
    fetchItinerary(); 
  }, [category]);

  const addToItinerary = async (dest: Destination) => {
    try {
      await fetch('http://localhost:5000/api/itinerary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dest)
      });
      fetchItinerary();
    } catch (err) {
      console.error(err);
    }
  };

  const removeFromItinerary = async (id: string) => {
    try {
      await fetch(`http://localhost:5000/api/itinerary/${id}`, { method: 'DELETE' });
      fetchItinerary();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      {/* Navbar Banner */}
      <header className="bg-sky-700 text-white shadow-md p-4 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold tracking-tight">TripWise 🌍</h1>
          <span className="text-sm bg-sky-800 px-3 py-1 rounded-full border border-sky-600">AWS Builder Group Task</span>
        </div>
      </header>

      {/* Main Core Dashboard Layout */}
      <main className="max-w-6xl mx-auto p-4 grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Interactive Exploration Content Grid */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Controls Filters Deck */}
          <div className="bg-white p-4 rounded-xl shadow-sm border flex flex-col sm:flex-row gap-3">
            <input 
              type="text" 
              placeholder="Search locations..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchDestinations()}
              className="flex-1 px-4 py-2 border rounded-lg focus:outline-sky-600"
            />
            <select 
              value={category} 
              onChange={(e) => setCategory(e.target.value)}
              className="px-4 py-2 border rounded-lg bg-white focus:outline-sky-600"
            >
              <option value="all">All Categories</option>
              <option value="historical">Historical</option>
              <option value="nature">Nature</option>
              <option value="cultural">Cultural</option>
            </select>
            <button 
              onClick={fetchDestinations} 
              className="bg-sky-600 text-white px-5 py-2 rounded-lg font-medium hover:bg-sky-700 transition"
            >
              Search
            </button>
          </div>

          {/* Core System UX Condition Engines */}
          {loading && (
            <div className="text-center py-12 text-slate-500 font-medium">
              Loading beautiful destinations...
            </div>
          )}
          
          {error && (
            <div className="bg-red-50 text-red-700 p-4 rounded-lg border border-red-200 font-medium">
              {error}
            </div>
          )}
          
          {!loading && !error && destinations.length === 0 && (
            <div className="bg-white text-center py-12 rounded-xl border border-dashed text-slate-500">
              No matching destinations found. Try broadening your filter parameters!
            </div>
          )}

          {/* Cards Dynamic Render Engine */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {!loading && destinations.map(dest => (
              <div key={dest.id} className="bg-white rounded-xl shadow-sm border overflow-hidden flex flex-col justify-between hover:shadow-md transition">
                <img src={dest.image} alt={dest.name} className="h-40 w-full object-cover" />
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-xs font-semibold tracking-wide uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                      {dest.category}
                    </span>
                    <h3 className="font-bold text-lg mt-1 text-slate-900">{dest.name}</h3>
                    <p className="text-xs text-slate-500 font-medium mb-2">{dest.location}</p>
                    <p className="text-sm text-slate-600 line-clamp-3">{dest.description}</p>
                  </div>
                  <button 
                    onClick={() => addToItinerary(dest)} 
                    className="mt-4 w-full bg-slate-900 text-white py-2 rounded-lg font-medium text-sm hover:bg-slate-800 transition"
                  >
                    + Add to Itinerary
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Sidebar Itinerary Persistence Drawer Container */}
        <div className="bg-white p-4 rounded-xl shadow-sm border h-fit sticky top-20">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2 border-b pb-2 text-slate-900">
            My Itinerary ({itinerary.length})
          </h2>
          {itinerary.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-6 border border-dashed rounded-lg">
              Your travel itinerary is empty. Start adding places!
            </p>
          ) : (
            <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
              {itinerary.map((item) => (
                <div key={item.id} className="flex gap-3 p-2 bg-slate-50 rounded-lg items-center border justify-between">
                  <div className="flex gap-3 items-center">
                    <img src={item.image} alt={item.name} className="w-12 h-12 object-cover rounded-md" />
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 line-clamp-1">{item.name}</h4>
                      <p className="text-xs text-slate-500">{item.location}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => removeFromItinerary(item.id)} 
                    className="text-xs text-red-500 font-semibold px-2 py-1 rounded hover:bg-red-50 transition"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
