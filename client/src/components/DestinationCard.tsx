import React from 'react';
import type { Destination } from '../types/trip';
import { MapPin, Star, DollarSign, Info, Plus, Check } from 'lucide-react';

interface DestinationCardProps {
  destination: Destination;
  onSelect: (destination: Destination) => void;
  onAddToItinerary: (destination: Destination) => void;
  isSaved: boolean;
}

const categoryColors: Record<string, string> = {
  cultural: 'bg-amber-100 text-amber-800 border-amber-200',
  nature: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  historical: 'bg-violet-100 text-violet-800 border-violet-200',
  adventure: 'bg-orange-100 text-orange-800 border-orange-200',
  beach: 'bg-cyan-100 text-cyan-800 border-cyan-200',
  city: 'bg-blue-100 text-blue-800 border-blue-200'
};

export const DestinationCard: React.FC<DestinationCardProps> = ({
  destination,
  onSelect,
  onAddToItinerary,
  isSaved
}) => {
  const categoryBadgeClass =
    categoryColors[destination.category.toLowerCase()] || 'bg-slate-100 text-slate-700 border-slate-200';

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden flex flex-col justify-between hover:shadow-xl hover:border-sky-300 transition-all duration-300 group">
      {/* Cover Image & Badges */}
      <div className="relative h-48 w-full overflow-hidden bg-slate-100">
        <img
          src={destination.image}
          alt={destination.name}
          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Category Pill */}
        <div className="absolute top-3 left-3">
          <span
            className={`text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border shadow-sm backdrop-blur-sm ${categoryBadgeClass}`}
          >
            {destination.category}
          </span>
        </div>

        {/* Rating & Cost Pills */}
        <div className="absolute bottom-3 left-3 right-3 flex justify-between items-center text-white text-xs font-semibold">
          <div className="flex items-center gap-1 bg-black/40 backdrop-blur-md px-2 py-1 rounded-lg border border-white/20">
            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span>{destination.rating.toFixed(1)}</span>
          </div>
          <div className="flex items-center gap-0.5 bg-black/40 backdrop-blur-md px-2 py-1 rounded-lg border border-white/20">
            <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
            <span>~${destination.estimatedCost}/day</span>
          </div>
        </div>
      </div>

      {/* Destination Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-bold text-lg text-slate-900 group-hover:text-sky-600 transition-colors line-clamp-1">
            {destination.name}
          </h3>
          <p className="text-xs text-slate-500 font-medium flex items-center gap-1 mt-1 mb-3">
            <MapPin className="w-3.5 h-3.5 text-sky-500 flex-shrink-0" />
            <span className="line-clamp-1">{destination.location}</span>
          </p>

          <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed mb-4">
            {destination.description}
          </p>

          {/* Highlights Chips */}
          {destination.highlights && destination.highlights.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {destination.highlights.slice(0, 2).map((h, i) => (
                <span
                  key={i}
                  className="text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-medium"
                >
                  {h}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2">
          <button
            onClick={() => onSelect(destination)}
            className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl font-medium text-xs text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
          >
            <Info className="w-3.5 h-3.5 text-slate-500" />
            Details & Weather
          </button>

          <button
            onClick={() => onAddToItinerary(destination)}
            disabled={isSaved}
            className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl font-medium text-xs transition-colors shadow-sm ${
              isSaved
                ? 'bg-emerald-100 text-emerald-700 border border-emerald-300 cursor-default'
                : 'bg-sky-600 hover:bg-sky-700 text-white active:scale-95'
            }`}
          >
            {isSaved ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                In Itinerary
              </>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5" />
                Add to Trip
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
