import React, { useState } from 'react';
import type { ItineraryItem } from '../types/trip';
import {
  Calendar,
  MapPin,
  Trash2,
  CheckCircle,
  Circle,
  DollarSign,
  Download,
  Share2,
  Edit2,
  Save,
  Compass,
  AlertCircle
} from 'lucide-react';

interface ItineraryViewProps {
  items: ItineraryItem[];
  onRemove: (id: number) => void;
  onUpdate: (id: number, updates: Partial<ItineraryItem>) => void;
  onNavigateToExplore: () => void;
}

export const ItineraryView: React.FC<ItineraryViewProps> = ({
  items,
  onRemove,
  onUpdate,
  onNavigateToExplore
}) => {
  const [filter, setFilter] = useState<'all' | 'planned' | 'visited'>('all');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editDate, setEditDate] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [editCost, setEditCost] = useState<number>(0);
  const [copiedNotification, setCopiedNotification] = useState(false);

  const filteredItems = items.filter((item) => {
    if (filter === 'planned') return item.status === 'planned';
    if (filter === 'visited') return item.status === 'visited';
    return true;
  });

  const totalCost = items.reduce((acc, item) => acc + (item.estimated_cost || 0), 0);
  const visitedCount = items.filter((item) => item.status === 'visited').length;

  const startEdit = (item: ItineraryItem) => {
    setEditingId(item.id);
    setEditDate(item.travel_date || '');
    setEditNotes(item.notes || '');
    setEditCost(item.estimated_cost || 0);
  };

  const saveEdit = (id: number) => {
    onUpdate(id, {
      travel_date: editDate,
      notes: editNotes,
      estimated_cost: Number(editCost)
    });
    setEditingId(null);
  };

  const exportItinerary = () => {
    const dataStr =
      'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(items, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', 'tripwise-itinerary.json');
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const copySummary = () => {
    const summary = items
      .map(
        (it, idx) =>
          `${idx + 1}. ${it.name} (${it.location}) - Date: ${it.travel_date || 'TBD'} | Budget: $${it.estimated_cost} | Status: ${it.status}`
      )
      .join('\n');
    navigator.clipboard.writeText(`TripWise Itinerary Summary:\n\n${summary}`);
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 2500);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Banner & Trip Summary Bar */}
      <div className="bg-gradient-to-r from-slate-900 to-sky-950 text-white rounded-3xl p-6 shadow-xl border border-slate-800">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-sky-400 bg-sky-950/80 px-3 py-1 rounded-full border border-sky-800">
              Personal Trip Planner
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-2">
              My Travel Itinerary
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm mt-1">
              Organize destinations, schedule travel dates, manage notes, and track your travel budget.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-3 bg-slate-800/80 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-slate-700">
            <div className="text-center px-2">
              <span className="text-xs text-slate-400 block font-medium">Destinations</span>
              <span className="text-lg font-bold text-white">{items.length}</span>
            </div>
            <div className="h-8 w-px bg-slate-700" />
            <div className="text-center px-2">
              <span className="text-xs text-slate-400 block font-medium">Completed</span>
              <span className="text-lg font-bold text-emerald-400">
                {visitedCount}/{items.length}
              </span>
            </div>
            <div className="h-8 w-px bg-slate-700" />
            <div className="text-center px-2">
              <span className="text-xs text-slate-400 block font-medium">Est. Budget</span>
              <span className="text-lg font-bold text-sky-400">${totalCost.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Action Controls & Filtering Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 mt-6 pt-4 border-t border-slate-800/80">
          <div className="flex items-center gap-1.5 bg-slate-800/60 p-1 rounded-xl border border-slate-700/60">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                filter === 'all' ? 'bg-sky-500 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              All Places ({items.length})
            </button>
            <button
              onClick={() => setFilter('planned')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                filter === 'planned' ? 'bg-sky-500 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Planned ({items.length - visitedCount})
            </button>
            <button
              onClick={() => setFilter('visited')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                filter === 'visited' ? 'bg-sky-500 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Visited ({visitedCount})
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={copySummary}
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-3 py-2 rounded-xl transition"
              title="Copy formatted summary to clipboard"
            >
              <Share2 className="w-3.5 h-3.5 text-sky-400" />
              <span>{copiedNotification ? 'Copied!' : 'Share'}</span>
            </button>

            <button
              onClick={exportItinerary}
              disabled={items.length === 0}
              className="flex items-center gap-1.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold px-3 py-2 rounded-xl transition disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export JSON</span>
            </button>
          </div>
        </div>
      </div>

      {/* Itinerary Items Content */}
      {items.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-slate-300 shadow-sm max-w-xl mx-auto my-8">
          <div className="w-16 h-16 bg-sky-50 text-sky-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Compass className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">Your Itinerary is Empty</h3>
          <p className="text-sm text-slate-500 mb-6 max-w-md mx-auto">
            Discover breathtaking places around the world or search for any custom destination to build your personal travel itinerary.
          </p>
          <button
            onClick={onNavigateToExplore}
            className="inline-flex items-center gap-2 bg-sky-600 hover:bg-sky-700 text-white px-6 py-2.5 rounded-xl font-semibold text-sm shadow-md transition"
          >
            <Compass className="w-4 h-4" />
            Explore Destinations
          </button>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center border border-slate-200 text-slate-500">
          <AlertCircle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
          <p className="text-sm font-medium">No destinations match the selected filter.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredItems.map((item, index) => {
            const isEditing = editingId === item.id;
            const isVisited = item.status === 'visited';

            return (
              <div
                key={item.id}
                className={`bg-white rounded-2xl border transition-all duration-200 p-4 sm:p-5 shadow-sm hover:shadow-md flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between ${
                  isVisited ? 'border-emerald-200 bg-emerald-50/20' : 'border-slate-200'
                }`}
              >
                {/* Left: Thumbnail & Info */}
                <div className="flex items-start sm:items-center gap-4 flex-1">
                  {/* Status Toggle Checkbox */}
                  <button
                    onClick={() =>
                      onUpdate(item.id, {
                        status: isVisited ? 'planned' : 'visited'
                      })
                    }
                    className="mt-1 sm:mt-0 flex-shrink-0 text-slate-400 hover:text-emerald-600 transition"
                    title={isVisited ? 'Mark as planned' : 'Mark as visited'}
                  >
                    {isVisited ? (
                      <CheckCircle className="w-6 h-6 text-emerald-500 fill-emerald-100" />
                    ) : (
                      <Circle className="w-6 h-6 hover:text-slate-600" />
                    )}
                  </button>

                  {/* Thumbnail */}
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover flex-shrink-0 shadow-sm border border-slate-200"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=400&q=80';
                    }}
                  />

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-400">#{index + 1}</span>
                      <h4
                        className={`font-bold text-base text-slate-900 truncate ${
                          isVisited ? 'line-through text-slate-500' : ''
                        }`}
                      >
                        {item.name}
                      </h4>
                      <span className="text-[11px] font-semibold uppercase tracking-wider bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">
                        {item.category}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-sky-500" />
                      <span>{item.location}</span>
                    </p>

                    {/* Editable / Display Meta */}
                    {isEditing ? (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Date</label>
                          <input
                            type="date"
                            value={editDate}
                            onChange={(e) => setEditDate(e.target.value)}
                            className="w-full text-xs bg-white border border-slate-300 rounded-lg p-1.5 focus:outline-sky-500"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Budget ($)</label>
                          <input
                            type="number"
                            min="0"
                            value={editCost}
                            onChange={(e) => setEditCost(Number(e.target.value))}
                            className="w-full text-xs bg-white border border-slate-300 rounded-lg p-1.5 focus:outline-sky-500"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Notes</label>
                          <input
                            type="text"
                            placeholder="Add quick notes..."
                            value={editNotes}
                            onChange={(e) => setEditNotes(e.target.value)}
                            className="w-full text-xs bg-white border border-slate-300 rounded-lg p-1.5 focus:outline-sky-500"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 mt-2">
                        <span className="flex items-center gap-1 bg-slate-100 px-2 py-1 rounded-md font-medium">
                          <Calendar className="w-3.5 h-3.5 text-slate-500" />
                          {item.travel_date ? item.travel_date : 'Date TBD'}
                        </span>

                        <span className="flex items-center gap-1 bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-1 rounded-md font-medium">
                          <DollarSign className="w-3 h-3 text-emerald-600" />
                          ${item.estimated_cost || 0}
                        </span>

                        {item.notes && (
                          <span className="italic text-slate-500 truncate max-w-xs">
                            "{item.notes}"
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2 self-end sm:self-center">
                  {isEditing ? (
                    <button
                      onClick={() => saveEdit(item.id)}
                      className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm transition"
                    >
                      <Save className="w-3.5 h-3.5" />
                      Save
                    </button>
                  ) : (
                    <button
                      onClick={() => startEdit(item)}
                      className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
                      title="Edit date, notes & budget"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  )}

                  <button
                    onClick={() => onRemove(item.id)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                    title="Remove destination"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
