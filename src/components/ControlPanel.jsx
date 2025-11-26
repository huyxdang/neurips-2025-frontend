import React, { useState, useRef, useEffect } from 'react';
import { Filter, Layers, Award, Eye, EyeOff, ChevronDown, Settings2, Tag } from 'lucide-react';

const ControlPanel = ({ data, activeFilters, onFilterChange, showLabels, onToggleLabels }) => {
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Extract unique options from data
  const awards = ['All', ...new Set(data.map(d => d.award).filter(Boolean))].sort();
  const tracks = ['All', ...new Set(data.map(d => d.track).filter(Boolean))].sort();
  const topics = ['All', ...Array.from(new Set(data.map(d => d.cluster_name).filter(Boolean))).sort()];

  const isFiltering = activeFilters.award !== 'All' || activeFilters.track !== 'All' || activeFilters.topic !== 'All';

  return (
    <div className="relative font-sans text-left w-72" ref={panelRef}>
      
      {/* TRIGGER BUTTON */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all duration-300
          ${isOpen 
            ? 'bg-[#0A0A0A] border-white/20 text-white rounded-b-none'
            : 'bg-black/40 backdrop-blur-md border-white/10 text-white/80 hover:bg-black/60 hover:border-white/30 hover:text-white'
          }
        `}
      >
        <div className="flex items-center gap-3">
          <Settings2 className="w-4 h-4" />
          <span className="text-xs font-bold tracking-widest uppercase">
            Configuration
          </span>
        </div>

        <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* DROPDOWN MENU */}
      {isOpen && (
        <div className="absolute top-full left-0 w-full bg-[#0A0A0A] backdrop-blur-xl border-x border-b border-white/20 rounded-b-xl p-5 shadow-[0_10px_40px_rgba(0,0,0,0.8)] animate-in slide-in-from-top-1 fade-in duration-200 z-50">
          
          {/* Filter: AWARD */}
          <div className="mb-5">
            <label className="flex items-center gap-2 text-xs text-white font-bold mb-2">
              <Award className="w-3 h-3" /> Award Type
            </label>
            <div className="relative group">
              <select
                value={activeFilters.award}
                onChange={(e) => onFilterChange('award', e.target.value)}
                className="w-full bg-white/5 border border-white/10 text-white text-xs rounded-lg px-3 py-2.5 appearance-none hover:bg-white/10 focus:outline-none focus:border-blue-500/50 transition cursor-pointer"
              >
                {awards.map(opt => (
                  <option key={opt} value={opt} className="bg-gray-900">
                    {opt === 'All' ? 'Show All Awards' : opt}
                  </option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-white/30 text-xs">▼</div>
            </div>
          </div>

          {/* Filter: TRACK */}
          <div className="mb-5">
            <label className="flex items-center gap-2 text-xs text-white font-bold mb-2">
              <Layers className="w-3 h-3" /> Track
            </label>
            <div className="relative group">
              <select
                value={activeFilters.track}
                onChange={(e) => onFilterChange('track', e.target.value)}
                className="w-full bg-white/5 border border-white/10 text-white text-xs rounded-lg px-3 py-2.5 appearance-none hover:bg-white/10 focus:outline-none focus:border-blue-500/50 transition cursor-pointer"
              >
                {tracks.map(opt => (
                  <option key={opt} value={opt} className="bg-gray-900">
                    {opt === 'All' ? 'Show All Tracks' : opt}
                  </option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-white/30 text-xs">▼</div>
            </div>
          </div>

          {/* Filter: TOPIC */}
          <div className="mb-6">
            <label className="flex items-center gap-2 text-xs text-white font-bold mb-2">
              <Tag className="w-3 h-3" /> Topic
            </label>
            <div className="relative group">
              <select
                value={activeFilters.topic}
                onChange={(e) => onFilterChange('topic', e.target.value)}
                className="w-full bg-white/5 border border-white/10 text-white text-xs rounded-lg px-3 py-2.5 appearance-none hover:bg-white/10 focus:outline-none focus:border-blue-500/50 transition cursor-pointer"
              >
                {topics.map(opt => (
                  <option key={opt} value={opt} className="bg-gray-900">
                    {opt === 'All' ? 'Show All Topics' : opt}
                  </option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-white/30 text-xs">▼</div>
            </div>
          </div>

          {/* VIEW SETTINGS */}
          <div className="border-t border-white/10 pt-4 mt-2">
            <div 
              className="flex items-center justify-between group cursor-pointer" 
              onClick={() => onToggleLabels(!showLabels)}
            >
                <span className="text-xs text-gray-400 font-bold flex items-center gap-2 group-hover:text-white transition-colors">
                  {showLabels ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                  Show Labels
                </span>
                
                {/* Toggle Switch */}
                <div className={`w-8 h-4 rounded-full relative transition-colors duration-300 ${showLabels ? 'bg-blue-600' : 'bg-white/10'}`}>
                  <div className={`w-2.5 h-2.5 bg-white rounded-full absolute top-[3px] transition-all duration-300 shadow-sm ${showLabels ? 'left-[18px]' : 'left-[3px]'}`} />
                </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
};

export default ControlPanel;