# TripWise — Smart Travel Planner 🌍✈️

TripWise is a modern, full-stack travel-planning application designed to streamline trip research, discovery, and itinerary management in a single intuitive interface. Users can explore destinations around the globe, view real-time live weather telemetry, search arbitrary places dynamically via external APIs, and curate a persistent, customized travel itinerary with budget tracking and personal notes.

---

## 🌟 Key Features

### 1. 🗺️ Destination Exploration & Discovery
- Explore a rich catalog of world-renowned and domestic travel destinations.
- Each destination includes high-resolution photography, categorized travel types (*Cultural*, *Nature*, *Historical*, *Adventure*, *Beach*, *City*), geographic coordinates, user ratings, estimated daily cost, and points of interest.

### 2. ⚡ Live External API Integration
- **Wikipedia REST API**: Type any city, monument, or region worldwide (e.g. *Kyoto*, *Paris*, *Rome*, *Reykjavík*, *Cairo*). TripWise dynamically queries the Wikipedia API to retrieve real geographic coordinates, travel summaries, and images on demand.
- **Open-Meteo Weather API**: Utilizes precise latitude and longitude coordinates to fetch live, real-time meteorological telemetry without requiring proprietary API keys. Returns current temperatures in Celsius & Fahrenheit, condition summaries (Sunny, Rainy, Foggy, Thunderstorm), wind speeds, and daily min/max forecasts.
- **OpenStreetMap Integration**: Provides direct links to view destinations on interactive global maps.

### 3. 🔍 Search, Filtering & Multi-Criteria Sorting
- **Instant Search**: Search destinations across name, location, and description.
- **Category Filtering**: Filter by *All*, *Cultural*, *Nature*, *Historical*, *Adventure*, *Beach*, or *City*.
- **Flexible Sorting**: Sort destinations by *Top Rated*, *Destination Name (A-Z / Z-A)*, *Estimated Budget (Low to High / High to Low)*, or *Category*.
- **Quick Suggested Chips**: Instant one-click exploration for trending destinations (*Kyoto*, *Paris*, *Ooty*, *Santorini*, *Bali*, *Taj Mahal*, *Rome*, *Grand Canyon*, etc.).

### 4. 📅 Itinerary Management & SQLite Database Persistence
- **Add to Itinerary**: Save destinations to your personal trip planner with custom travel dates, personalized notes (e.g. *pack hiking shoes*, *visit at sunrise*), and customizable budget allocations.
- **Database Persistence**: Backed by a SQLite database (`dev.db`). All saved trips remain available across browser refreshes and server restarts.
- **Visit Status Tracking**: Toggle destinations between **Planned** and **Visited** with one click.
- **Inline Editing**: Update dates, notes, and budgets directly in the itinerary view.
- **Export & Share**: Export your complete itinerary to JSON or copy a formatted travel checklist to your clipboard with one click.

### 5. 📊 Trip Analytics & Insights
- Visual progress bar tracking trip completion percentage.
- Summary cards: Total Places, Completed Trips, Pending Trips, and Cumulative Estimated Travel Budget.
- Interactive category breakdown showing trip preferences.
- Smart travel recommendations for itinerary optimization.

### 6. 🎨 Dynamic, Responsive UI
- Built with React 19, TypeScript, Tailwind CSS, and Lucide React icons.
- Polished micro-interactions: skeleton loaders during fetch states, toast notifications on CRUD actions, modal views with live weather telemetry, and full mobile responsiveness.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, TypeScript, Vite 8, Tailwind CSS, Lucide React |
| **Backend** | Node.js, Express 5, TypeScript (`tsx`), SQLite3, `sqlite` |
| **Database** | SQLite (`dev.db`) with automatic schema migration |
| **External APIs** | Open-Meteo Weather API, Wikipedia REST API, OpenStreetMap |

---

## 🏗️ Architecture & Data Flow

```text
┌─────────────────────────────────────────────────────────────┐
│                       React 19 Frontend                     │
│   (Vite + Tailwind CSS + TypeScript + Lucide React Icons)    │
└──────────────┬──────────────────────────────▲───────────────┘
               │ HTTP Requests                │ JSON Responses
               ▼                              │
┌─────────────────────────────────────────────┴───────────────┐
│                     Express Backend Server                  │
│                        (TypeScript / Node)                  │
└───┬──────────────────────────┬──────────────────────────┬───┘
    │                          │                          │
    ▼                          ▼                          ▼
┌──────────────┐      ┌─────────────────┐       ┌─────────────────┐
│ SQLite DB    │      │ Wikipedia API   │       │ Open-Meteo API  │
│  (dev.db)    │      │ (Place Lookups) │       │ (Live Weather)  │
└──────────────┘      └─────────────────┘       └─────────────────┘
```

---

## 📡 REST API Reference

Base URL: `http://localhost:5000`

### 1. Health Check
- **Endpoint**: `GET /api/health`
- **Response**:
```json
{
  "status": "healthy",
  "app": "TripWise Smart Travel Planner",
  "uptime": 128.45,
  "database": "connected",
  "savedItineraries": 3,
  "timestamp": "2026-10-18T13:00:00.000Z"
}
```

### 2. Get Destinations (Search, Filter, Sort)
- **Endpoint**: `GET /api/destinations?search=&category=&sortBy=&order=`
- **Query Parameters**:
  - `search` *(optional)*: Search term matching destination name, location, or description.
  - `category` *(optional)*: `all`, `cultural`, `nature`, `historical`, `adventure`, `beach`, `city`.
  - `sortBy` *(optional)*: `rating`, `name`, `cost`, `category` (default: `rating`).
  - `order` *(optional)*: `asc` or `desc` (default: `desc`).
- **Response**:
```json
[
  {
    "id": "dest-1",
    "name": "Shore Temple & Monuments",
    "location": "Mahabalipuram, Tamil Nadu",
    "country": "India",
    "category": "cultural",
    "description": "An iconic UNESCO World Heritage coastal sanctuary...",
    "image": "https://images.unsplash.com/photo-1582510003544-4d00b7f74220",
    "coordinates": { "lat": 12.6166, "lon": 80.1983 },
    "rating": 4.8,
    "estimatedCost": 80,
    "bestTimeToVisit": "November to February",
    "highlights": ["Shore Temple", "Pancha Rathas"]
  }
]
```

### 3. Get Destination Details with Live Weather
- **Endpoint**: `GET /api/destinations/:id`
- **Response**:
```json
{
  "id": "dest-1",
  "name": "Shore Temple & Monuments",
  "location": "Mahabalipuram, Tamil Nadu",
  "coordinates": { "lat": 12.6166, "lon": 80.1983 },
  "weather": {
    "temperature": 27.2,
    "windspeed": 8.5,
    "weathercode": 3,
    "condition": "Overcast",
    "weatherType": "Cloudy",
    "isDay": false,
    "maxTemp": 31.1,
    "minTemp": 24.4,
    "source": "Open-Meteo Live API"
  }
}
```

### 4. Fetch Live Weather for Coordinates
- **Endpoint**: `GET /api/weather?lat=35.0116&lon=135.7681`
- **Response**:
```json
{
  "temperature": 20.3,
  "windspeed": 3.5,
  "weathercode": 1,
  "condition": "Mainly Clear / Partly Cloudy",
  "weatherType": "PartlyCloudy",
  "isDay": false,
  "maxTemp": 22.8,
  "minTemp": 14.5,
  "source": "Open-Meteo Live API"
}
```

### 5. On-Demand Dynamic Destination Lookup
- **Endpoint**: `POST /api/destinations/lookup`
- **Request Body**:
```json
{
  "query": "Reykjavik"
}
```
- **Response**:
```json
{
  "id": "wiki-UmV5a2phds",
  "name": "Reykjavík",
  "location": "Capital and largest city of Iceland",
  "category": "cultural",
  "coordinates": { "lat": 64.1458, "lon": -21.9425 },
  "weather": { "temperature": 6.8, "condition": "Overcast" }
}
```

### 6. Get Saved Itinerary Items
- **Endpoint**: `GET /api/itinerary?status=all&sortBy=id`
- **Response**:
```json
[
  {
    "id": 1,
    "destination_id": "dest-3",
    "name": "Kyoto Historic Temples & Arashiyama",
    "location": "Kyoto, Japan",
    "category": "cultural",
    "travel_date": "2026-11-20",
    "notes": "Wake up early for Fushimi Inari torii gates",
    "status": "planned",
    "estimated_cost": 220,
    "created_at": "2026-10-18 13:03:10"
  }
]
```

### 7. Add Destination to Itinerary
- **Endpoint**: `POST /api/itinerary`
- **Request Body**:
```json
{
  "destination_id": "dest-3",
  "name": "Kyoto Historic Temples & Arashiyama",
  "location": "Kyoto, Japan",
  "category": "cultural",
  "description": "Historical Japanese capital",
  "image": "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e",
  "travel_date": "2026-11-20",
  "notes": "Visit Bamboo Grove",
  "status": "planned",
  "estimated_cost": 220
}
```
- **Response Status**: `201 Created`

### 8. Update Itinerary Item
- **Endpoint**: `PUT /api/itinerary/:id`
- **Request Body**:
```json
{
  "travel_date": "2026-11-22",
  "notes": "Booked tea ceremony at 3 PM",
  "status": "visited",
  "estimated_cost": 250
}
```

### 9. Delete Itinerary Item
- **Endpoint**: `DELETE /api/itinerary/:id`
- **Response**:
```json
{
  "message": "Destination removed from itinerary successfully.",
  "id": 1
}
```

### 10. Get Itinerary Statistics & Analytics
- **Endpoint**: `GET /api/itinerary/stats`
- **Response**:
```json
{
  "totalPlaces": 4,
  "plannedCount": 3,
  "visitedCount": 1,
  "totalEstimatedBudget": 820,
  "categoriesDistribution": [
    { "category": "cultural", "count": 2 },
    { "category": "nature", "count": 1 },
    { "category": "adventure", "count": 1 }
  ]
}
```

---

## 🗄️ Database Schema

The database uses SQLite (`server/dev.db`) with the following table schema:

```sql
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
);
```

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- `npm`

### 1. Setup & Run the Backend Server
```bash
# Navigate to the server folder
cd server

# Install dependencies (if not already installed)
npm install

# Start the server (runs on http://localhost:5000)
npm start
```
*For development mode with auto-reload, run:*
```bash
npm run dev
```

### 2. Setup & Run the Frontend Client
Open a second terminal window:
```bash
# Navigate to the client folder
cd client

# Install dependencies (if not already installed)
npm install

# Start the Vite development server (runs on http://localhost:5173)
npm run dev
```

### 3. Build for Production
```bash
# Build frontend for production
cd client
npm run build
```

---

## 🧪 Verification & Testing

TripWise includes automated test verification scripts. You can test all backend endpoints using Node.js:

```bash
node -e "
async function verify() {
  const health = await fetch('http://localhost:5000/api/health').then(r => r.json());
  console.log('Health:', health.status);

  const dests = await fetch('http://localhost:5000/api/destinations?category=cultural').then(r => r.json());
  console.log('Destinations fetched:', dests.length);

  const weather = await fetch('http://localhost:5000/api/weather?lat=35.0116&lon=135.7681').then(r => r.json());
  console.log('Live weather in Kyoto:', weather.temperature + '°C', weather.condition);
}
verify();
"
```

---

## 📄 License
This project is open-source and available under the ISC License.
