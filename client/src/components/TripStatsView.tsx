import React from 'react';
import type { TripStats, ItineraryItem } from '../types/trip';
import {
  Compass,
  CheckCircle2,
  Calendar,
  DollarSign,
  PieChart,
  Lightbulb,
  ArrowRight
} from 'lucide-react';

interface TripStatsViewProps {
  stats: TripStats | null;
  items: ItineraryItem[];
  onNavigateToExplore: () => void;
  onNavigateToItinerary: () => void;
}

export const TripStatsView: React.FC<TripStatsViewProps> = ({
  stats,
  items,
  onNavigateToExplore,
  onNavigateToItinerary
}) => {
  const total = stats?.totalPlaces ?? items.length;
  const visited = stats?.visitedCount ?? items.filter((i) => i.status === 'visited').length;
  const planned = stats?.plannedCount ?? total - visited;
  const budget = stats?.totalEstimatedBudget ?? items.reduce((a, b) => a + (b.estimated_cost || 0), 0);
  const completionPercentage = total > 0 ? Math.round((visited / total) * 100) : 0;

  // Category distribution
  const categories = stats?.categoriesDistribution ?? [];

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800">
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/80 px-3 py-1 rounded-full border border-emerald-800">
          Smart Analytics
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-3">
          Travel Planner Insights
        </h2>
        <p className="text-slate-400 text-sm mt-1 max-w-xl">
          Get a comprehensive overview of your itinerary metrics, budget allocation, and completed travel milestones.
        </p>

        {/* Progress bar */}
        <div className="mt-6 pt-4 border-t border-slate-800">
          <div className="flex justify-between items-center text-xs font-semibold mb-2 text-slate-300">
            <span>Trip Completion Progress</span>
            <span className="text-emerald-400 font-bold">{completionPercentage}% Completed</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden border border-slate-700">
            <div
              className="bg-gradient-to-r from-sky-400 to-emerald-400 h-full rounded-full transition-all duration-700"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* 4 Core Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
            <Compass className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase text-slate-400">Total Destinations</p>
            <p className="text-2xl font-extrabold text-slate-900">{total}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase text-slate-400">Places Visited</p>
            <p className="text-2xl font-extrabold text-emerald-600">{visited}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase text-slate-400">Pending Trips</p>
            <p className="text-2xl font-extrabold text-amber-600">{planned}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-violet-50 text-violet-600 flex items-center justify-center font-bold">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase text-slate-400">Total Budget</p>
            <p className="text-2xl font-extrabold text-violet-600">${budget.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Grid: Category Breakdown & Tips */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <PieChart className="w-4 h-4 text-sky-600" />
              Category Breakdown
            </h3>
            <span className="text-xs text-slate-400 font-semibold">{categories.length} Types</span>
          </div>

          {categories.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center italic">
              No categories recorded yet. Add destinations to your itinerary to view distribution.
            </p>
          ) : (
            <div className="space-y-3">
              {categories.map((c) => {
                const pct = total > 0 ? Math.round((c.count / total) * 100) : 0;
                return (
                  <div key={c.category} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold text-slate-700">
                      <span className="capitalize">{c.category}</span>
                      <span>
                        {c.count} {c.count === 1 ? 'place' : 'places'} ({pct}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-sky-500 h-full rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Travel Tips & Recommendations */}
        <div className="bg-gradient-to-br from-sky-50 to-emerald-50/50 p-6 rounded-2xl border border-sky-100 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-sky-900 font-bold text-base mb-3">
              <Lightbulb className="w-5 h-5 text-amber-500" />
              Smart Travel Recommendations
            </div>
            <ul className="text-xs sm:text-sm text-slate-700 space-y-2.5">
              <li className="flex items-start gap-2">
                <span className="text-sky-500 font-bold">•</span>
                <span>
                  Always check the <strong>live weather</strong> forecast before confirming daily schedules to pack appropriate apparel.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-sky-500 font-bold">•</span>
                <span>
                  Group destinations by geographic proximity to minimize local transit times and taxi costs.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-sky-500 font-bold">•</span>
                <span>
                  Reserve priority time slots for high-traffic monuments during golden hours (early morning & sunset).
                </span>
              </li>
            </ul>
          </div>

          <div className="pt-4 mt-4 border-t border-sky-200/50 flex gap-2">
            <button
              onClick={onNavigateToExplore}
              className="flex-1 inline-flex items-center justify-center gap-1.5 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 px-3 py-2 rounded-xl transition"
            >
              <span>Discover Places</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onNavigateToItinerary}
              className="flex-1 inline-flex items-center justify-center gap-1.5 text-xs font-bold text-slate-800 bg-white hover:bg-slate-100 border border-slate-300 px-3 py-2 rounded-xl transition"
            >
              <span>Manage Itinerary</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
