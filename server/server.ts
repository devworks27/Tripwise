import express, { Request, Response } from 'express';
import cors from 'cors';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Initialize a pure, direct native SQLite database file dynamically
let db: any;
(async () => {
  db = await open({
    filename: './dev.db',
    driver: sqlite3.Database
  });
  
  // Create our itinerary table structure instantly if it doesn't exist
  await db.exec(`
    CREATE TABLE IF NOT EXISTS itinerary (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      location TEXT,
      category TEXT,
      description TEXT,
      image TEXT
    )
  `);
  console.log("Database connected and table initialized successfully.");
})();

// Destination Discovery API Proxy with Filter Engine
app.get('/api/destinations', async (req: Request, res: Response) => {
  try {
    const { search, category } = req.query;
    
    let mockDestinations = [
      { id: '1', name: 'Mahabalipuram Shore Temple', location: 'Tamil Nadu, India', category: 'cultural', description: 'Stunning 8th-century structural temples carved from granite blocks along the coast.', image: 'https://unsplash.com' },
      { id: '2', name: 'Ooty Botanical Gardens', location: 'Tamil Nadu, India', category: 'nature', description: 'Lush green terraced gardens featuring thousands of exotic plant species and fossil tree trunks.', image: 'https://unsplash.com' },
      { id: '3', name: 'Fort St. George', location: 'Chennai, India', category: 'historical', description: 'The first English fortress built in India, founded in 1644, now hosting historic museum pieces.', image: 'https://unsplash.com' }
    ];

    if (search) {
      mockDestinations = mockDestinations.filter(d => d.name.toLowerCase().includes((search as string).toLowerCase()));
    }
    if (category && category !== 'all') {
      mockDestinations = mockDestinations.filter(d => d.category === category);
    }

    res.json(mockDestinations);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve destination details.' });
  }
});

// Itinerary Database Actions
app.get('/api/itinerary', async (req: Request, res: Response) => {
  const items = await db.all('SELECT * FROM itinerary');
  res.json(items);
});

app.post('/api/itinerary', async (req: Request, res: Response) => {
  const { name, location, category, description, image } = req.body;
  const result = await db.run(
    'INSERT INTO itinerary (name, location, category, description, image) VALUES (?, ?, ?, ?, ?)',
    [name, location, category, description, image]
  );
  res.json({ id: result.lastID, name, location, category, description, image });
});

app.delete('/api/itinerary/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  await db.run('DELETE FROM itinerary WHERE id = ?', [id]);
  res.json({ message: 'Destination removed successfully.' });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
