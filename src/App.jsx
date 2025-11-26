import React, { useState, useEffect, useMemo, useRef } from 'react';
import { RotateCcw } from 'lucide-react';
import NeuralMap from './components/NeuralMap';
import PaperSidebar from './components/PaperSidebar';
import ControlPanel from './components/ControlPanel';
import MiniSearch from './components/MiniSearch';

function App() {
  const [currentQuery, setCurrentQuery] = useState("");
  const [data, setData] = useState([]);
  const [labels, setLabels] = useState([]);
  const [filters, setFilters] = useState({ award: 'All', track: 'All', topic: 'All' });
  const [showLabels, setShowLabels] = useState(true);
  const [searchHighlightIds, setSearchHighlightIds] = useState([]);
  
  // App State
  const [selectedPaper, setSelectedPaper] = useState(null);
  const [aiResponse, setAiResponse] = useState(null); 
  const [isSearching, setIsSearching] = useState(false);
  const [searchHistory, setSearchHistory] = useState([]);
  const abortControllerRef = useRef(null);
  const neuralMapRef = useRef(null);

  // Load Data
  useEffect(() => {
    Promise.all([
      fetch('/neurips_data.json').then(res => res.json()),
      fetch('/cluster_labels.json').then(res => res.json())
    ]).then(([points, clusters]) => {
      console.log('✅ Data Loaded:', points.length, 'papers,', clusters.length, 'cluster labels');
      setData(points);
      setLabels(clusters);
    }).catch(err => {
      console.error('❌ Error loading data:', err);
    });
  }, []);

  const handleSearchSubmit = async (query) => {
    // Cancel any ongoing search
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new AbortController for this search
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    setIsSearching(true);
    setCurrentQuery(query);
    try {
      const response = await fetch('http://127.0.0.1:8000/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: query }),
        signal: abortController.signal,
      });

      if (!response.ok) throw new Error("Backend failed");

      const result = await response.json();

      if (result.bestScore !== undefined) {
        console.log(`🔍 Search Query: "${query}"`);
        console.log(`📊 Best Relevance Score: ${(result.bestScore * 100).toFixed(2)}%`);
        console.log(`📋 Individual Paper Scores:`);
        if (result.relatedPapers) {
          result.relatedPapers.forEach((paper, idx) => {
            const score = paper.score !== undefined ? (paper.score * 100).toFixed(2) : 'N/A';
            console.log(`  ${idx + 1}. ${paper.paper.substring(0, 60)}${paper.paper.length > 60 ? '...' : ''} - ${score}%`);
          });
        }
        console.log('─'.repeat(60));
      }

      const responseData = {
        text: result.text,
        relatedIds: result.relatedIds,
        relatedPapers: result.relatedPapers
      };
      setAiResponse(responseData);
      setSearchHighlightIds(result.relatedIds || []);
      
      setSearchHistory(prev => {
        const newHistory = [{ query, response: responseData }, ...prev];
        return newHistory.slice(0, 10);
      });

    } catch (error) {
      // Don't show error if the request was aborted
      if (error.name === 'AbortError') {
        console.log("Search cancelled");
        return;
      }
      console.error("Search Error:", error);
      setAiResponse({
        text: "Sorry, I couldn't reach the search engine. Is the backend running?",
        relatedIds: [],
        relatedPapers: []
      });
      setSearchHighlightIds([]);
    } finally {
      // Only update state if this request wasn't aborted
      if (!abortController.signal.aborted) {
        setIsSearching(false);
      }
    }
  };

  const handleCancelSearch = () => {
    // Cancel ongoing search
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsSearching(false);
    setAiResponse(null);
    setSearchHighlightIds([]);
    setCurrentQuery("");
  };

  const handleFilterChange = (type, value) => {
    const newFilters = { ...filters, [type]: value };
    setFilters(newFilters);
    setAiResponse(null);
  };

  // Compute highlightIds based on filters and search
  const highlightIds = useMemo(() => {
    // Search takes precedence - if there are search results, use those
    if (searchHighlightIds.length > 0) {
      return searchHighlightIds;
    }

    // Otherwise, use filter highlighting
    const hasActiveFilters = filters.award !== 'All' || filters.track !== 'All' || filters.topic !== 'All';

    // If no filters, return empty
    if (!hasActiveFilters) {
      return [];
    }

    // Filter by award/track/topic
    const matches = data.filter(d => {
      const matchAward = filters.award === 'All' || d.award === filters.award;
      const matchTrack = filters.track === 'All' || d.track === filters.track;
      const matchTopic = filters.topic === 'All' || d.cluster_name === filters.topic;
      return matchAward && matchTrack && matchTopic;
    });

    return matches.map(d => d.paper_id);
  }, [data, filters, searchHighlightIds]);

  const handleResetFilters = () => {
    setFilters({ award: 'All', track: 'All', topic: 'All' });
    setAiResponse(null);
    setCurrentQuery("");
  };

  return (
    <div className="relative w-screen h-screen bg-void font-sans">
      
      {/* 1. VISUALIZATION LAYER */}
      <div className="absolute inset-0 z-0">
        <NeuralMap 
          ref={neuralMapRef}
          data={data} 
          labels={labels}
          highlightIds={highlightIds}
          onPaperClick={setSelectedPaper}
          showLabels={showLabels}
        />
      </div>

      {/* 2. HEADER BRANDING */}
      <div className="absolute top-6 left-8 z-10 pointer-events-none">
        
        <div className="relative group">
          <div className="absolute -inset-4 bg-gradient-to-r from-blue-600 via-teal-500 to-purple-600 rounded-full blur-3xl opacity-55 transition duration-1000"></div>
          
          <div className="relative flex items-center gap-3">       
            <h1 className="font-['Space_Grotesk'] text-5xl font-bold tracking-wider text-white drop-shadow-lg">
            NeurIPS 2025
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2 mt-3 pointer-events-auto relative">
          <p className="text-[11px] text-white/40 tracking-widest font-mono uppercase">
            Explore ~6,000 papers // <a href="https://x.com/xhuydng" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">@xhuydng</a>
          </p>
        </div>
        
        <div className="mt-6 pointer-events-auto">
          <MiniSearch 
            onSearch={handleSearchSubmit} 
            isLoading={isSearching}
            onClear={handleCancelSearch}
            onCancel={handleCancelSearch}
            response={aiResponse}
            searchHistory={searchHistory}
            currentQuery={currentQuery}
            onSelectPaper={(paper) => {
              const paperData = data.find(d => d.paper_id === paper.paper_id);
              if (paperData) {
                setSelectedPaper(paperData);
              } else {
                // Fallback: construct paper object from search result
                setSelectedPaper({
                  paper: paper.paper || 'Untitled Paper',
                  paper_id: paper.paper_id || '',
                  abstract: paper.abstract || 'No abstract available.',
                  cluster_name: paper.cluster_name || 'Unknown',
                  eli5: paper.eli5 || 'No summary available.',
                  tldr: paper.tldr || '',
                  problem: paper.problem || 'No problem statement provided.',
                  solution: paper.solution || 'No solution provided.',
                  keywords: paper.keywords || '',
                  authors: paper.authors || '',
                  link: paper.link || '#',
                  track: paper.track || '',
                  award: paper.award || ''
                });
              }
            }}
          />
        </div> 
      </div>

      {/* RESET BUTTON - Top Center */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 z-10 pointer-events-auto">
        <button
          onClick={handleResetFilters}
          className="p-2 text-white/60 hover:text-white transition-colors"
          title="Reset all filters"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* CONTROL PANEL */}
      <div className="absolute top-6 right-8 z-10">
        <div className="pointer-events-auto">
          <ControlPanel 
            data={data} 
            activeFilters={filters} 
            onFilterChange={handleFilterChange}
            showLabels={showLabels}
            onToggleLabels={setShowLabels}
          />
        </div>
      </div>

      {/* 3. INTERACTION LAYERS */}
      <PaperSidebar 
        paper={selectedPaper} 
        onClose={() => setSelectedPaper(null)}
        onZoomToPaper={(paper) => {
          if (neuralMapRef.current && paper.umap_x !== undefined && paper.umap_y !== undefined) {
            neuralMapRef.current.zoomToPaper(paper.umap_x, paper.umap_y, 12);
          }
        }}
      />
      
    </div>
  );
}

export default App;