import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink, ChevronDown, Lightbulb, AlertCircle, CheckCircle2, FileText, ZoomIn } from 'lucide-react';

const PaperSidebar = ({ paper, onClose, onZoomToPaper }) => {
  const [abstractExpanded, setAbstractExpanded] = useState(false);

  // Parse authors - handle both string and array formats
  const parseAuthors = (authors) => {
    if (!authors) return "Unknown Authors";
    if (Array.isArray(authors)) return authors.join(", ");
    // Handle string format like "['Author1', 'Author2']"
    if (typeof authors === 'string') {
      try {
        // Try to parse as JSON-like string
        const cleaned = authors.replace(/'/g, '"');
        const parsed = JSON.parse(cleaned);
        if (Array.isArray(parsed)) return parsed.join(", ");
      } catch {
        // If parsing fails, return as-is (might be comma-separated)
        return authors;
      }
    }
    return String(authors);
  };

  // Parse keywords - handle both string and array formats
  const parseKeywords = (keywords) => {
    if (!keywords) return [];
    if (Array.isArray(keywords)) return keywords;
    if (typeof keywords === 'string') {
      // Split by comma and trim whitespace
      return keywords.split(',').map(k => k.trim()).filter(k => k.length > 0);
    }
    return [];
  };

  return (
    <AnimatePresence>
      {paper && (
        <>
          {/* Backdrop for mobile */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden"
          />
          
          <motion.div
            initial={{ x: "100%", opacity: 0.8 }}
            animate={{ x: "0%", opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed top-0 right-0 w-full md:w-[460px] h-full z-50 flex flex-col
                       bg-slate-900/95 backdrop-blur-xl border-l border-white/10"
          >
            {/* Zoom Button - Above Header */}
            {paper.umap_x !== undefined && paper.umap_y !== undefined && onZoomToPaper && (
              <div className="px-6 pt-4 pb-2">
                <button
                  onClick={() => onZoomToPaper(paper)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white/5 border border-white/10 text-white text-xs rounded-lg hover:bg-white/10 hover:border-white/20 focus:outline-none focus:border-blue-500/50 transition cursor-pointer"
                >
                  <ZoomIn className="w-3 h-3" />
                  <span className="font-medium">Zoom to Paper</span>
                </button>
              </div>
            )}

            {/* Header - Topic Cluster, Track, Award */}
            <div className="px-6 py-4 border-b border-white/10 flex justify-between items-start gap-4">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span className="text-white font-medium">{paper.cluster_name || "Topic"}</span>
                {paper.track && (
                  <>
                    <span className="text-slate-600">•</span>
                    <span>{paper.track}</span>
                  </>
                )}
                {paper.award && (
                  <>
                    <span className="text-slate-600">•</span>
                    <span className="text-amber-400">{paper.award}</span>
                  </>
                )}
              </div>
              <button 
                onClick={onClose} 
                className="p-1.5 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-6 space-y-6">
                
                {/* Title */}
                <div>
                  <h2 className="text-lg font-semibold text-white leading-snug tracking-tight">
                    {paper.paper}
                  </h2>
                  
                  {/* Authors */}
                  <p className="mt-2 text-xs text-slate-400">
                    {parseAuthors(paper.authors)}
                  </p>

                  {/* Keywords - Right after authors */}
                  {paper.keywords && parseKeywords(paper.keywords).length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {parseKeywords(paper.keywords).slice(0, 3).map((keyword, i) => (
                        <span 
                          key={i}
                          className="px-2.5 py-1 text-xs text-slate-300 bg-white/5 rounded-full border border-white/10"
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Divider */}
                <div className="h-px bg-gradient-to-r from-white/10 via-white/5 to-transparent" />

                {/* ELI5 */}
                {paper.eli5 && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Lightbulb className="w-4 h-4 text-cyan-400" />
                      <span className="text-xs font-medium text-cyan-400 uppercase tracking-wide">
                        Explain Like I'm 5
                      </span>
                    </div>
                    <p className="text-slate-300 text-sm leading-relaxed">
                      {paper.eli5}
                    </p>
                  </div>
                )}

                {/* Problem */}
                {paper.problem && (
                  <section>
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle className="w-4 h-4 text-amber-400/80" />
                      <h3 className="text-xs font-medium text-slate-400 uppercase tracking-wide">
                        The Problem
                      </h3>
                    </div>
                    <p className="text-slate-300 text-sm leading-relaxed">
                      {paper.problem}
                    </p>
                  </section>
                )}

                {/* Solution */}
                {paper.solution && (
                  <section>
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400/80" />
                      <h3 className="text-xs font-medium text-slate-400 uppercase tracking-wide">
                        The Solution
                      </h3>
                    </div>
                    <p className="text-slate-300 text-sm leading-relaxed">
                      {paper.solution}
                    </p>
                  </section>
                )}

                {/* Abstract - Collapsible (After Solution) */}
                {paper.abstract && (
                  <div className="rounded-lg bg-white/5 border border-white/10 overflow-hidden">
                    <button
                      onClick={() => setAbstractExpanded(!abstractExpanded)}
                      className="w-full px-4 py-3 flex items-center justify-between gap-2 hover:bg-white/5 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-slate-400" />
                        <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">
                          Abstract
                        </span>
                      </div>
                      <ChevronDown 
                        className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                          abstractExpanded ? 'rotate-180' : ''
                        }`} 
                      />
                    </button>
                    
                    <AnimatePresence initial={false}>
                      {abstractExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <p className="px-4 pb-4 text-slate-300 text-sm leading-relaxed">
                            {paper.abstract}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

              </div>
            </div>

            {/* Footer CTA */}
            <div className="p-5 border-t border-white/10 bg-slate-900/50">
              <a 
                href={paper.link} 
                target="_blank" 
                rel="noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3 
                           bg-white text-black
                           hover:bg-gray-200
                           text-sm font-medium rounded-lg transition-colors"
              >
                Read Full Paper <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default PaperSidebar;