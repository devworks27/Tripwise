import express, { Request, Response } from 'express';
import cors from 'cors';
import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import path from 'path';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Database instance
let db: Database;

async function initDatabase() {
  const dbPath = path.resolve(__dirname, 'dev.db');
  db = await open({
    filename: dbPath,
    driver: sqlite3.Database
  });

  // Create table if it doesn't exist
  await db.exec(`
    CREATE TABLE IF NOT EXISTS itinerary (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      destination_id TEXT,
      name TEXT NOT NULL,
      location TEXT NOT NULL,
      category TEXT,
      description TEXT,
      image TEXT,
      travel_date TEXT,
      notes TEXT,
      status TEXT DEFAULT 'planned',
      estimated_cost REAL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Ensure columns exist for seamless backwards compatibility
  const columns = await db.all<{ name: string }[]>("PRAGMA table_info(itinerary)");
  const colNames = columns.map((c: any) => c.name);

  if (!colNames.includes('destination_id')) {
    await db.exec('ALTER TABLE itinerary ADD COLUMN destination_id TEXT');
  }
  if (!colNames.includes('travel_date')) {
    await db.exec('ALTER TABLE itinerary ADD COLUMN travel_date TEXT');
  }
  if (!colNames.includes('notes')) {
    await db.exec('ALTER TABLE itinerary ADD COLUMN notes TEXT');
  }
  if (!colNames.includes('status')) {
    await db.exec("ALTER TABLE itinerary ADD COLUMN status TEXT DEFAULT 'planned'");
  }
  if (!colNames.includes('estimated_cost')) {
    await db.exec('ALTER TABLE itinerary ADD COLUMN estimated_cost REAL DEFAULT 0');
  }
  if (!colNames.includes('created_at')) {
    await db.exec("ALTER TABLE itinerary ADD COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP");
  }

  console.log(`[TripWise Server] SQLite database connected and migrated at ${dbPath}`);
}

initDatabase().catch(err => {
  console.error('[TripWise Server] Database initialization error:', err);
});

// Destination Model Interface
export interface Destination {
  id: string;
  name: string;
  location: string;
  country: string;
  category: 'cultural' | 'nature' | 'historical' | 'adventure' | 'beach' | 'city';
  description: string;
  image: string;
  coordinates: {
    lat: number;
    lon: number;
  };
  rating: number;
  estimatedCost: number; // in USD approx
  bestTimeToVisit: string;
  highlights: string[];
}

// Curated destinations dataset featuring global and regional destinations
const curatedDestinations: Destination[] = [
  {
    id: 'dest-1',
    name: 'Shore Temple & Monuments',
    location: 'Mahabalipuram, Tamil Nadu',
    country: 'India',
    category: 'cultural',
    description: 'An iconic UNESCO World Heritage coastal sanctuary constructed in the 8th century AD during the Pallava dynasty, carved from massive blocks of granite overlooking the Bay of Bengal.',
    image: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1200&q=80',
    coordinates: { lat: 12.6166, lon: 80.1983 },
    rating: 4.8,
    estimatedCost: 80,
    bestTimeToVisit: 'November to February',
    highlights: ['Shore Temple', 'Pancha Rathas', 'Arjuna Penance rock carvings']
  },
  {
    id: 'dest-2',
    name: 'Nilgiri Mountain & Botanical Gardens',
    location: 'Ooty, Tamil Nadu',
    country: 'India',
    category: 'nature',
    description: 'Picturesque hill station situated amidst the blue Nilgiri Mountains, famed for terraced botanical flora, sprawling tea estates, serene lakes, and misty eucalyptus valleys.',
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
    coordinates: { lat: 11.4102, lon: 76.6950 },
    rating: 4.6,
    estimatedCost: 110,
    bestTimeToVisit: 'March to June',
    highlights: ['Nilgiri Mountain Railway', 'Doddabetta Peak', 'Botanical Gardens']
  },
  {
    id: 'dest-3',
    name: 'Kyoto Historic Temples & Arashiyama',
    location: 'Kyoto, Kansai',
    country: 'Japan',
    category: 'cultural',
    description: 'Japan\'s cultural capital featuring thousands of classical Buddhist temples, serene Zen rock gardens, preserved geisha districts in Gion, and the sublime Arashiyama bamboo grove.',
    image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80',
    coordinates: { lat: 35.0116, lon: 135.7681 },
    rating: 4.9,
    estimatedCost: 220,
    bestTimeToVisit: 'March to May & October to November',
    highlights: ['Fushimi Inari Shrine', 'Kinkaku-ji Golden Pavilion', 'Bamboo Grove']
  },
  {
    id: 'dest-4',
    name: 'Eiffel Tower & Seine Riverfront',
    location: 'Paris, Île-de-France',
    country: 'France',
    category: 'city',
    description: 'The City of Light renowned for world-class architectural landmarks, celebrated fine art museums including the Louvre, café culture, and picturesque cobblestone avenues.',
    image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80',
    coordinates: { lat: 48.8566, lon: 2.3522 },
    rating: 4.7,
    estimatedCost: 280,
    bestTimeToVisit: 'April to June & September to November',
    highlights: ['Eiffel Tower', 'Louvre Museum', 'Montmartre & Sacré-Cœur']
  },
  {
    id: 'dest-5',
    name: 'Colosseum & Roman Forum',
    location: 'Rome, Lazio',
    country: 'Italy',
    category: 'historical',
    description: 'The Eternal City where ancient imperial grandeur lives side-by-side with bustling piazza culture, Renaissance masterpieces, and the historic Colosseum amphitheater.',
    image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=1200&q=80',
    coordinates: { lat: 41.9028, lon: 12.4964 },
    rating: 4.8,
    estimatedCost: 210,
    bestTimeToVisit: 'October to April',
    highlights: ['Colosseum', 'Vatican Museums', 'Pantheon']
  },
  {
    id: 'dest-6',
    name: 'Ubud Rice Terraces & Sacred Forests',
    location: 'Bali, Lesser Sunda',
    country: 'Indonesia',
    category: 'nature',
    description: 'An idyllic tropical sanctuary filled with tiered emerald rice paddies, ancient Hindu temples, artisanal craft villages, and holistic wellness retreats.',
    image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=80',
    coordinates: { lat: -8.5069, lon: 115.2625 },
    rating: 4.7,
    estimatedCost: 95,
    bestTimeToVisit: 'May to September',
    highlights: ['Tegallalang Rice Terraces', 'Sacred Monkey Forest', 'Mount Batur Sunrise']
  },
  {
    id: 'dest-7',
    name: 'Taj Mahal & Agra Fort',
    location: 'Agra, Uttar Pradesh',
    country: 'India',
    category: 'historical',
    description: 'A sublime ivory-white marble mausoleum on the southern bank of the Yamuna River, commissioned in 1631 by Mughal Emperor Shah Jahan and hailed as an architectural jewel.',
    image: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=1200&q=80',
    coordinates: { lat: 27.1751, lon: 78.0421 },
    rating: 4.9,
    estimatedCost: 75,
    bestTimeToVisit: 'October to March',
    highlights: ['Taj Mahal Sunrise', 'Agra Fort', 'Mehtab Bagh View']
  },
  {
    id: 'dest-8',
    name: 'Oia Cliffs & Caldera Coastline',
    location: 'Santorini, Cyclades',
    country: 'Greece',
    category: 'beach',
    description: 'Perched along volcanic Aegean sea cliffs, famous for whitewashed cliffside cubic villages, azure-domed churches, dramatic sunsets, and turquoise waters.',
    image: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=1200&q=80',
    coordinates: { lat: 36.3932, lon: 25.4615 },
    rating: 4.8,
    estimatedCost: 260,
    bestTimeToVisit: 'May to October',
    highlights: ['Oia Sunset Viewpoint', 'Red Beach', 'Fira to Oia Hike']
  },
  {
    id: 'dest-9',
    name: 'Lake Louise & Banff Peaks',
    location: 'Banff, Alberta',
    country: 'Canada',
    category: 'adventure',
    description: 'Spectacular glacial lakes with vibrant turquoise waters set amidst the towering peaks of the Canadian Rocky Mountains, offering world-class hiking, wildlife, and alpine scenery.',
    image: 'https://images.unsplash.com/photo-1503614472-8c93d56e92ce?auto=format&fit=crop&w=1200&q=80',
    coordinates: { lat: 51.1784, lon: -115.5708 },
    rating: 4.9,
    estimatedCost: 240,
    bestTimeToVisit: 'June to September & December to March',
    highlights: ['Lake Louise Canoeing', 'Moraine Lake', 'Banff Gondola']
  },
  {
    id: 'dest-10',
    name: 'Palolem Beach & Coastal Coves',
    location: 'South Goa, Goa',
    country: 'India',
    category: 'beach',
    description: 'A crescent-shaped golden sand beach lined with swaying coconut palms, calm swimmable waters, beachfront shacks, and vibrant sunset dolphin cruises.',
    image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1200&q=80',
    coordinates: { lat: 15.0100, lon: 74.0232 },
    rating: 4.6,
    estimatedCost: 65,
    bestTimeToVisit: 'November to March',
    highlights: ['Palolem Bay Kayaking', 'Butterfly Beach Boat Trip', 'Silent Noise Parties']
  },
  {
    id: 'dest-11',
    name: 'Grand Canyon South Rim',
    location: 'Arizona',
    country: 'United States',
    category: 'adventure',
    description: 'One of the world\'s greatest natural wonders, a vast gorge carved by the Colorado River revealing billions of years of geological history and awe-inspiring vistas.',
    image: 'https://images.unsplash.com/photo-1474044159687-1ee9f3a51722?auto=format&fit=crop&w=1200&q=80',
    coordinates: { lat: 36.0544, lon: -112.1401 },
    rating: 4.9,
    estimatedCost: 190,
    bestTimeToVisit: 'March to May & September to November',
    highlights: ['Bright Angel Trail', 'Mather Point Sunrise', 'Desert View Watchtower']
  },
  {
    id: 'dest-12',
    name: 'Jungfrau Region & Lauterbrunnen',
    location: 'Bernese Oberland',
    country: 'Switzerland',
    category: 'adventure',
    description: 'A breathtaking alpine wonderland of 72 cascading waterfalls, traditional wooden chalets, snowcapped peaks, and scenic cogwheel train journeys.',
    image: 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=1200&q=80',
    coordinates: { lat: 46.5935, lon: 7.9077 },
    rating: 4.9,
    estimatedCost: 320,
    bestTimeToVisit: 'June to August & December to March',
    highlights: ['Lauterbrunnen Valley', 'Jungfraujoch Top of Europe', 'First Cliff Walk']
  }
];

// Helper: Open-Meteo Weather Code interpretation
function interpretWeatherCode(code: number): { condition: string; weatherType: string } {
  switch (code) {
    case 0: return { condition: 'Clear Sky', weatherType: 'Sunny' };
    case 1:
    case 2: return { condition: 'Mainly Clear / Partly Cloudy', weatherType: 'PartlyCloudy' };
    case 3: return { condition: 'Overcast', weatherType: 'Cloudy' };
    case 45:
    case 48: return { condition: 'Foggy & Misty', weatherType: 'Fog' };
    case 51:
    case 53:
    case 55: return { condition: 'Light Drizzle', weatherType: 'Rain' };
    case 61:
    case 63:
    case 65: return { condition: 'Rainy Showers', weatherType: 'Rain' };
    case 71:
    case 73:
    case 75: return { condition: 'Snowfall', weatherType: 'Snow' };
    case 80:
    case 81:
    case 82: return { condition: 'Heavy Showers', weatherType: 'Rain' };
    case 95:
    case 96:
    case 99: return { condition: 'Thunderstorm', weatherType: 'Thunder' };
    default: return { condition: 'Pleasant & Mild', weatherType: 'Fair' };
  }
}

// Service: Fetch Live Weather from Open-Meteo
async function fetchLiveWeather(lat: number, lon: number) {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&daily=temperature_2m_max,temperature_2m_min&timezone=auto`;
    const res = await fetch(url, { signal: AbortSignal.timeout(4000) });
    if (!res.ok) throw new Error(`Weather service responded with ${res.status}`);
    const data = await res.json();
    
    const current = data.current_weather;
    const { condition, weatherType } = interpretWeatherCode(current?.weathercode ?? 0);

    return {
      temperature: current?.temperature ?? 22,
      windspeed: current?.windspeed ?? 5,
      weathercode: current?.weathercode ?? 0,
      condition,
      weatherType,
      isDay: current?.is_day === 1,
      maxTemp: data.daily?.temperature_2m_max?.[0] ?? current?.temperature ?? 25,
      minTemp: data.daily?.temperature_2m_min?.[0] ?? current?.temperature ?? 18,
      source: 'Open-Meteo Live API'
    };
  } catch (err: any) {
    console.warn(`[TripWise Server] Weather fetch fallback for (${lat}, ${lon}):`, err.message);
    return {
      temperature: 24,
      windspeed: 8,
      weathercode: 0,
      condition: 'Sunny & Clear (Estimated)',
      weatherType: 'Sunny',
      isDay: true,
      maxTemp: 27,
      minTemp: 20,
      source: 'Fallback Estimate'
    };
  }
}

// Service: Search and lookup destination from Wikipedia External REST API
async function lookupWikipediaPlace(query: string): Promise<Destination | null> {
  try {
    // 1. Search Wikipedia for best match
    const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&format=json&origin=*`;
    const searchRes = await fetch(searchUrl, {
      headers: { 'User-Agent': 'TripWisePlanner/1.0 (travel-planner-app)' },
      signal: AbortSignal.timeout(4000)
    });
    if (!searchRes.ok) return null;
    const searchData = await searchRes.json();
    const hits = searchData?.query?.search;
    if (!hits || hits.length === 0) return null;

    const bestTitle = hits[0].title;

    // 2. Fetch page summary for the best title
    const summaryUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(bestTitle)}`;
    const summaryRes = await fetch(summaryUrl, {
      headers: { 'User-Agent': 'TripWisePlanner/1.0 (travel-planner-app)' },
      signal: AbortSignal.timeout(4000)
    });
    if (!summaryRes.ok) return null;
    const summary = await summaryRes.json();

    const lat = summary.coordinates?.lat || 13.0827;
    const lon = summary.coordinates?.lon || 80.2707;
    const imgUrl = summary.originalimage?.source || summary.thumbnail?.source || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80';

    return {
      id: `wiki-${Buffer.from(bestTitle).toString('base64url').slice(0, 10)}`,
      name: summary.title,
      location: summary.description || `${summary.title}`,
      country: summary.description?.split(',').pop()?.trim() || 'Global',
      category: 'cultural',
      description: summary.extract || 'A fascinating destination rich in culture and scenic highlights.',
      image: imgUrl,
      coordinates: { lat, lon },
      rating: 4.7,
      estimatedCost: 150,
      bestTimeToVisit: 'Year-round',
      highlights: [summary.title, 'Historical Landmark', 'Scenic Views']
    };
  } catch (err: any) {
    console.error(`[TripWise Server] Wikipedia lookup failed for "${query}":`, err.message);
    return null;
  }
}

// ----------------------------------------------------
// REST API ROUTES
// ----------------------------------------------------

// Root Route: API Portal & Status Dashboard
app.get('/', async (_req: Request, res: Response) => {
  const itemCount = await db.get<{ count: number }>('SELECT count(*) as count FROM itinerary').catch(() => ({ count: 0 }));
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>TripWise API Portal</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0f172a; color: #f8fafc; margin: 0; padding: 40px 20px; line-height: 1.6; }
        .container { max-width: 800px; margin: 0 auto; background: #1e293b; border-radius: 16px; padding: 32px; border: 1px solid #334155; box-shadow: 0 10px 25px rgba(0,0,0,0.4); }
        h1 { color: #38bdf8; margin-top: 0; font-size: 28px; }
        .badge { display: inline-block; padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: 600; background: #064e3b; color: #34d399; margin-bottom: 20px; }
        .link-btn { display: inline-block; background: #0284c7; color: #ffffff; text-decoration: none; padding: 10px 20px; border-radius: 8px; font-weight: 600; margin-top: 15px; }
        .link-btn:hover { background: #0369a1; }
        ul { list-style: none; padding: 0; }
        li { padding: 8px 12px; background: #0f172a; margin-bottom: 8px; border-radius: 8px; font-family: monospace; font-size: 14px; border: 1px solid #334155; }
        a { color: #38bdf8; text-decoration: none; }
        a:hover { text-decoration: underline; }
      </style>
    </head>
    <body>
      <div class="container">
        <span class="badge">● TripWise Backend API Live</span>
        <h1>TripWise Server & Database Services</h1>
        <p>The TripWise backend REST API is active and connected to SQLite with persistent storage (${itemCount?.count ?? 0} saved itinerary destinations).</p>
        <p>To view the full user interface, open the frontend client:</p>
        <p><a href="http://localhost:5173" class="link-btn">👉 Open TripWise Web App (http://localhost:5173)</a></p>
        <hr style="border: none; border-top: 1px solid #334155; margin: 24px 0;">
        <h3>Available API Endpoints:</h3>
        <ul>
          <li><strong>GET</strong> <a href="/api/health">/api/health</a> - Health check & server status</li>
          <li><strong>GET</strong> <a href="/api/destinations">/api/destinations</a> - Explore destinations catalog</li>
          <li><strong>GET</strong> <a href="/api/destinations?category=cultural">/api/destinations?category=cultural</a> - Filter by category</li>
          <li><strong>GET</strong> <a href="/api/destinations/dest-1">/api/destinations/dest-1</a> - Destination details + Live Open-Meteo weather</li>
          <li><strong>GET</strong> <a href="/api/weather?lat=35.0116&lon=135.7681">/api/weather?lat=35.0116&lon=135.7681</a> - Live Open-Meteo weather coordinates</li>
          <li><strong>GET</strong> <a href="/api/itinerary">/api/itinerary</a> - Saved itinerary list (persisted in SQLite)</li>
          <li><strong>GET</strong> <a href="/api/itinerary/stats">/api/itinerary/stats</a> - Trip statistics & metrics</li>
        </ul>
      </div>
    </body>
    </html>
  `);
});

// 1. Health & Status
app.get('/api/health', async (_req: Request, res: Response) => {
  try {
    const itemCount = await db.get<{ count: number }>('SELECT count(*) as count FROM itinerary');
    res.json({
      status: 'healthy',
      app: 'TripWise Smart Travel Planner',
      uptime: process.uptime(),
      database: 'connected',
      savedItineraries: itemCount?.count ?? 0,
      timestamp: new Date().toISOString()
    });
  } catch (err: any) {
    res.status(500).json({ status: 'unhealthy', error: err.message });
  }
});

// 2. Destination Discovery with Search, Filter, and Sort
app.get('/api/destinations', async (req: Request, res: Response) => {
  try {
    const { search, category, sortBy, order } = req.query;
    let list: Destination[] = [...curatedDestinations];

    // Filter by Category
    if (category && category !== 'all') {
      list = list.filter(d => d.category.toLowerCase() === (category as string).toLowerCase());
    }

    // Filter by Search Query
    if (search && typeof search === 'string' && search.trim() !== '') {
      const q = search.trim().toLowerCase();
      const localMatches = list.filter(d =>
        d.name.toLowerCase().includes(q) ||
        d.location.toLowerCase().includes(q) ||
        d.description.toLowerCase().includes(q) ||
        d.highlights.some(h => h.toLowerCase().includes(q))
      );

      // If local matches exist, use them
      if (localMatches.length > 0) {
        list = localMatches;
      } else {
        // Dynamic Live Fallback: Query real Wikipedia API for arbitrary destination
        const liveWikiResult = await lookupWikipediaPlace(search as string);
        if (liveWikiResult) {
          list = [liveWikiResult];
        } else {
          list = [];
        }
      }
    }

    // Sorting Engine
    const sortField = (sortBy as string) || 'rating';
    const sortOrder = (order as string) || (sortField === 'name' ? 'asc' : 'desc');

    list.sort((a, b) => {
      let valA: any = a[sortField as keyof Destination];
      let valB: any = b[sortField as keyof Destination];

      if (sortField === 'cost') {
        valA = a.estimatedCost;
        valB = b.estimatedCost;
      }

      if (typeof valA === 'string') {
        const cmp = valA.localeCompare(valB as string);
        return sortOrder === 'asc' ? cmp : -cmp;
      } else if (typeof valA === 'number') {
        return sortOrder === 'asc' ? valA - (valB as number) : (valB as number) - valA;
      }
      return 0;
    });

    res.json(list);
  } catch (error: any) {
    console.error('[TripWise Server] Destinations query failed:', error);
    res.status(500).json({ error: 'Failed to retrieve destination list.' });
  }
});

// 3. Destination Details with Live Open-Meteo Weather
app.get('/api/destinations/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    let dest = curatedDestinations.find(d => d.id === id);

    if (!dest) {
      return res.status(404).json({ error: 'Destination not found in catalog.' });
    }

    // Fetch real-time live weather using coordinates
    const weather = await fetchLiveWeather(dest.coordinates.lat, dest.coordinates.lon);

    res.json({
      ...dest,
      weather
    });
  } catch (error: any) {
    console.error('[TripWise Server] Destination details fetch failed:', error);
    res.status(500).json({ error: 'Failed to retrieve destination details.' });
  }
});

// 4. Live Weather Endpoint for any coordinates
app.get('/api/weather', async (req: Request, res: Response) => {
  try {
    const lat = parseFloat(req.query.lat as string);
    const lon = parseFloat(req.query.lon as string);

    if (isNaN(lat) || isNaN(lon)) {
      return res.status(400).json({ error: 'Valid latitude and longitude are required.' });
    }

    const weather = await fetchLiveWeather(lat, lon);
    res.json(weather);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch live weather.' });
  }
});

// 5. On-Demand Dynamic External Destination Lookup
app.post('/api/destinations/lookup', async (req: Request, res: Response) => {
  try {
    const { query } = req.body;
    if (!query || typeof query !== 'string' || query.trim() === '') {
      return res.status(400).json({ error: 'Search destination query is required.' });
    }

    const result = await lookupWikipediaPlace(query.trim());
    if (!result) {
      return res.status(404).json({ error: `Could not find any global destination matching "${query}".` });
    }

    const weather = await fetchLiveWeather(result.coordinates.lat, result.coordinates.lon);
    res.json({
      ...result,
      weather
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to execute destination lookup.' });
  }
});

// 6. Itinerary Management - Get All Items
app.get('/api/itinerary', async (req: Request, res: Response) => {
  try {
    const { status, sortBy } = req.query;
    let query = 'SELECT * FROM itinerary';
    const params: any[] = [];

    if (status && status !== 'all') {
      query += ' WHERE status = ?';
      params.push(status);
    }

    if (sortBy === 'name') {
      query += ' ORDER BY name ASC';
    } else if (sortBy === 'travel_date') {
      query += ' ORDER BY travel_date ASC';
    } else if (sortBy === 'cost') {
      query += ' ORDER BY estimated_cost DESC';
    } else {
      query += ' ORDER BY id DESC';
    }

    const items = await db.all(query, params);
    res.json(items);
  } catch (error: any) {
    console.error('[TripWise Server] Fetch itinerary failed:', error);
    res.status(500).json({ error: 'Failed to retrieve itinerary items.' });
  }
});

// 7. Itinerary Management - Add New Item
app.post('/api/itinerary', async (req: Request, res: Response) => {
  try {
    const {
      name,
      location,
      category = 'cultural',
      description = '',
      image = '',
      destination_id = '',
      travel_date = '',
      notes = '',
      status = 'planned',
      estimated_cost = 0
    } = req.body;

    if (!name || !location) {
      return res.status(400).json({ error: 'Destination name and location are required.' });
    }

    // Check for duplicate in planned itinerary
    const existing = await db.get(
      'SELECT id FROM itinerary WHERE name = ? AND location = ?',
      [name, location]
    );

    if (existing) {
      return res.status(409).json({
        error: 'This place is already in your itinerary.',
        existingId: existing.id
      });
    }

    const result = await db.run(
      `INSERT INTO itinerary 
       (destination_id, name, location, category, description, image, travel_date, notes, status, estimated_cost) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        destination_id || null,
        name,
        location,
        category,
        description,
        image,
        travel_date || null,
        notes || '',
        status || 'planned',
        Number(estimated_cost) || 0
      ]
    );

    const insertedItem = await db.get('SELECT * FROM itinerary WHERE id = ?', [result.lastID]);
    res.status(201).json(insertedItem);
  } catch (error: any) {
    console.error('[TripWise Server] Add itinerary item failed:', error);
    res.status(500).json({ error: 'Failed to save item to itinerary.' });
  }
});

// 8. Itinerary Management - Update Item (Date, Notes, Status, Cost)
app.put('/api/itinerary/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { travel_date, notes, status, estimated_cost } = req.body;

    const existing = await db.get('SELECT * FROM itinerary WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ error: 'Itinerary item not found.' });
    }

    await db.run(
      `UPDATE itinerary 
       SET travel_date = COALESCE(?, travel_date),
           notes = COALESCE(?, notes),
           status = COALESCE(?, status),
           estimated_cost = COALESCE(?, estimated_cost)
       WHERE id = ?`,
      [
        travel_date !== undefined ? travel_date : null,
        notes !== undefined ? notes : null,
        status !== undefined ? status : null,
        estimated_cost !== undefined ? Number(estimated_cost) : null,
        id
      ]
    );

    const updated = await db.get('SELECT * FROM itinerary WHERE id = ?', [id]);
    res.json(updated);
  } catch (error: any) {
    console.error('[TripWise Server] Update itinerary item failed:', error);
    res.status(500).json({ error: 'Failed to update itinerary item.' });
  }
});

// 9. Itinerary Management - Delete Item
app.delete('/api/itinerary/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const existing = await db.get('SELECT id FROM itinerary WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ error: 'Itinerary item not found.' });
    }

    await db.run('DELETE FROM itinerary WHERE id = ?', [id]);
    res.json({ message: 'Destination removed from itinerary successfully.', id: Number(id) });
  } catch (error: any) {
    console.error('[TripWise Server] Delete itinerary item failed:', error);
    res.status(500).json({ error: 'Failed to delete itinerary item.' });
  }
});

// 10. Itinerary Statistics & Analytics
app.get('/api/itinerary/stats', async (_req: Request, res: Response) => {
  try {
    const totalRow = await db.get<{ total: number }>('SELECT count(*) as total FROM itinerary');
    const plannedRow = await db.get<{ count: number }>("SELECT count(*) as count FROM itinerary WHERE status = 'planned'");
    const visitedRow = await db.get<{ count: number }>("SELECT count(*) as count FROM itinerary WHERE status = 'visited'");
    const budgetRow = await db.get<{ totalCost: number }>('SELECT SUM(estimated_cost) as totalCost FROM itinerary');
    const categories = await db.all<{ category: string; count: number }[]>(
      'SELECT category, count(*) as count FROM itinerary GROUP BY category ORDER BY count DESC'
    );

    res.json({
      totalPlaces: totalRow?.total ?? 0,
      plannedCount: plannedRow?.count ?? 0,
      visitedCount: visitedRow?.count ?? 0,
      totalEstimatedBudget: budgetRow?.totalCost ?? 0,
      categoriesDistribution: categories
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to generate itinerary statistics.' });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`[TripWise Server] Smart Travel Planner API running on http://localhost:${PORT}`);
});
