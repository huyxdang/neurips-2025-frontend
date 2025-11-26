import React, { useState, useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';

const MiniSearch = ({ onSearch, isLoading, onClear, response, onSelectPaper, searchHistory = [], currentQuery = "", onCancel }) => {
  const EXPANDED_WIDTH = 340; 
  
  const [isExpanded, setIsExpanded] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef(null);

  // Determine if dropdown should be shown
  const hasHistory = searchHistory.length > 0;
  const shouldShowDropdown = isLoading || response || (isExpanded && hasHistory);

  useEffect(() => {
    if (inputRef.current && isExpanded) {
      inputRef.current.focus();
    }
  }, [isExpanded]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query);
    }
  };

  // Thinking dots animation component
  const ThinkingDots = () => (
    <div className="flex items-center gap-1">
      <motion.div
        className="w-2 h-2 bg-white rounded-full"
        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1, repeat: Infinity, delay: 0 }}
      />
      <motion.div
        className="w-2 h-2 bg-white rounded-full"
        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
      />
      <motion.div
        className="w-2 h-2 bg-white rounded-full"
        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
      />
    </div>
  );

  return (
    <div className="relative z-50 font-sans">
      {/* SEARCH BAR */}
      <motion.div 
        initial={false}
        animate={{ width: isExpanded ? EXPANDED_WIDTH : 48 }}
        transition={{ 
          duration: 0.01,  // Changed from spring to match dropdown
          ease: "easeOut"
        }}
        className={`
          relative h-11 border flex items-center overflow-hidden transition-all duration-300
          ${isExpanded 
            ? 'bg-white/5 backdrop-blur-md border-white/10 shadow-lg ring-1 ring-white/5' 
            : 'bg-white/5 border-transparent hover:bg-white/10 cursor-pointer'
          }
          ${isExpanded ? 'shadow-[0_0_20px_rgba(0,0,0,0.2)]' : ''}
          ${shouldShowDropdown ? 'rounded-t-3xl' : 'rounded-full'}
        `}
        onClick={(e) => {
          if (!isExpanded) {
            setIsExpanded(true);
          }
        }}
      >
        
        {/* ICON AREA */}
        <div className="absolute left-0 w-12 h-full flex items-center justify-center pointer-events-none">
          <Search className={`w-4 h-4 transition-colors ${isExpanded ? 'text-white/80' : 'text-white/50'}`} />
        </div>

        {/* INPUT AREA */}
        <AnimatePresence>
          {isExpanded && (
            <motion.form 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onSubmit={handleSubmit}
              className="flex-1 pl-10 pr-10 h-full"
            >
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Find me papers on..."
                className="w-full h-full bg-transparent text-[15px] text-white placeholder-white/40 focus:outline-none font-light tracking-wide"
                disabled={isLoading}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') {
                    setIsExpanded(false);
                    setQuery("");
                    if (onCancel) onCancel();
                    if (onClear) onClear();
                  }
                }}
              />
            </motion.form>
          )}
        </AnimatePresence>

        {/* CLOSE BUTTON */}
        {isExpanded && (
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(false);
              setQuery("");
              if (onCancel) onCancel();
              if (onClear) onClear();
            }}
            className="absolute right-3 p-1 text-white/30 hover:text-white/90 rounded-full transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </motion.div>

      {/* DROPDOWN RESULTS - Connected (no gap) */}
      <AnimatePresence>
        {shouldShowDropdown && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="w-[340px] pointer-events-auto max-h-[calc(100vh-12rem)] overflow-hidden"
          >
            <div className="bg-white/5 backdrop-blur-md border border-white/10 border-t-0 rounded-b-3xl shadow-lg ring-1 ring-white/5 overflow-y-auto max-h-[calc(100vh-12rem)]">
              
              {/* LOADING STATE (Thinking) */}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-6"
                >
                  <div className="flex items-center gap-3">
                    <ThinkingDots />
                    <span className="text-[13px] text-gray-400 font-light">
                      Searching papers...
                    </span>
                  </div>
                </motion.div>
              )}

              {/* ALL RESULTS - Current + History in one block */}
              {!isLoading && (response || (isExpanded && hasHistory)) && (
                <>
                  {/* CURRENT SEARCH */}
                  {response && (
                    <div>
                      {/* YOUR SEARCH SECTION */}
                      <div className="p-6 border-b border-white/5">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-blue-400">
                            Your Search
                          </span>
                        </div>
                        <div className="text-[13px] text-white font-medium">
                          {currentQuery || "Current search"}
                        </div>
                      </div>

                      {/* OVERVIEW SECTION */}
                      <div className="p-6 border-b border-white/5">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                            Overview
                          </span>
                        </div>
                        <div className="text-[13px] leading-7 text-gray-300 font-light">
                          <ReactMarkdown 
                            components={{
                              p: ({node, ...props}) => <p className="mb-2" {...props} />,
                              strong: ({node, ...props}) => <span className="font-semibold text-white" {...props} />,
                              ul: ({node, ...props}) => <ul className="list-disc pl-4 space-y-2 my-2" {...props} />,
                              li: ({node, ...props}) => <li className="text-gray-300" {...props} />
                            }}
                          >
                            {response.text}
                          </ReactMarkdown>
                        </div>
                      </div>

                      {/* SOURCES SECTION */}
                      {response.relatedPapers?.length > 0 && (
                        <div className="p-6 bg-black/20">
                          <div className="flex items-center gap-2 mb-3">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                              Sources
                            </span>
                          </div>
                          <div className="flex flex-col gap-2">
                            {response.relatedPapers.map((paper) => (
                              <button
                                key={paper.paper_id}
                                onClick={() => onSelectPaper(paper)}
                                className="text-left px-3 py-2 bg-white/5 border border-white/5 rounded-lg hover:bg-white/10 hover:border-white-500/30 transition-all group"
                              >
                                <span className="text-[11px] font-semibold text-gray-200 group-hover:text-white block truncate">
                                  {paper.paper}
                                </span>
                                {paper.cluster_name && (
                                  <span className="text-[10px] text-gray-500 mt-1 block">
                                    {paper.cluster_name}
                                  </span>
                                )}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* SEARCH HISTORY (always show if exists) */}
                  {isExpanded && hasHistory && searchHistory
                  .filter(historyItem => historyItem.query !== currentQuery)
                  .map((historyItem, index) => (
                    <div key={index} className="border-t border-white/5">
                      {/* YOUR SEARCH SECTION */}
                      <div className="p-6 border-b border-white/5">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-blue-400">
                            Your Search
                          </span>
                        </div>
                        <div className="text-[13px] text-white font-medium">
                          {historyItem.query}
                        </div>
                      </div>

                      {/* OVERVIEW SECTION */}
                      <div className="p-6 border-b border-white/5">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                            Overview
                          </span>
                        </div>
                        <div className="text-[13px] leading-7 text-gray-300 font-light">
                          <ReactMarkdown 
                            components={{
                              p: ({node, ...props}) => <p className="mb-2" {...props} />,
                              strong: ({node, ...props}) => <span className="font-semibold text-white" {...props} />,
                              ul: ({node, ...props}) => <ul className="list-disc pl-4 space-y-2 my-2" {...props} />,
                              li: ({node, ...props}) => <li className="text-gray-300" {...props} />
                            }}
                          >
                            {historyItem.response.text}
                          </ReactMarkdown>
                        </div>
                      </div>

                      {/* SOURCES SECTION */}
                      {historyItem.response.relatedPapers?.length > 0 && (
                        <div className="p-6 bg-black/20">
                          <div className="flex items-center gap-2 mb-3">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                              Sources
                            </span>
                          </div>
                          <div className="flex flex-col gap-2">
                            {historyItem.response.relatedPapers.map((paper) => (
                              <button
                                key={paper.paper_id}
                                onClick={() => onSelectPaper(paper)}
                                className="text-left px-3 py-2 bg-white/5 border border-white/5 rounded-lg hover:bg-white/10 hover:border-white-500/30 transition-all group"
                              >
                                <span className="text-[11px] font-semibold text-gray-200 group-hover:text-white block truncate">
                                  {paper.paper}
                                </span>
                                {paper.cluster_name && (
                                  <span className="text-[10px] text-gray-500 mt-1 block">
                                    {paper.cluster_name}
                                  </span>
                                )}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </>
              )}

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MiniSearch;