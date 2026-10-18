export interface WeatherInfo {
  temperature: number;
  windspeed: number;
  weathercode: number;
  condition: string;
  weatherType: string;
  isDay: boolean;
  maxTemp: number;
  minTemp: number;
  source: string;
}

export interface Destination {
  id: string;
  name: string;
  location: string;
  country?: string;
  category: 'cultural' | 'nature' | 'historical' | 'adventure' | 'beach' | 'city';
  description: string;
  image: string;
  coordinates: {
    lat: number;
    lon: number;
  };
  rating: number;
  estimatedCost: number;
  bestTimeToVisit?: string;
  highlights?: string[];
  weather?: WeatherInfo;
}

export interface ItineraryItem {
  id: number;
  destination_id?: string | null;
  name: string;
  location: string;
  category: string;
  description: string;
  image: string;
  travel_date?: string | null;
  notes?: string;
  status: 'planned' | 'visited';
  estimated_cost: number;
  created_at?: string;
}

export interface TripStats {
  totalPlaces: number;
  plannedCount: number;
  visitedCount: number;
  totalEstimatedBudget: number;
  categoriesDistribution: { category: string; count: number }[];
}
