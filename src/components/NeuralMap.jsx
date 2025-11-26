import React, { useState, useMemo, useCallback, useImperativeHandle, forwardRef } from 'react'; 
import DeckGL from '@deck.gl/react';
import { ScatterplotLayer, TextLayer } from '@deck.gl/layers';
import { OrthographicView, LinearInterpolator } from '@deck.gl/core';

const INITIAL_VIEW_STATE = {
  target: [8, 5.25, 0], 
  zoom: 6,
  minZoom: 3.5,
  maxZoom: 13
};

const COLORS = [
  [138, 180, 248],   // Soft blue
  [129, 201, 149],   // Sage green
  [255, 183, 178],   // Blush pink
  [179, 136, 255],   // Lavender purple
  [78, 205, 196],    // Teal
  [255, 218, 121],   // Warm gold
  [162, 217, 206],   // Mint
  [255, 154, 162],   // Coral
  [147, 197, 253],   // Sky blue
  [254, 202, 202],   // Rose
  [167, 243, 208],   // Seafoam
  [253, 186, 116],   // Peach
  [196, 181, 253],   // Soft violet
  [110, 231, 183],   // Emerald glow
  [252, 211, 77],    // Amber
];

const NeuralMap = forwardRef(({ data, labels, highlightIds, onPaperClick, showLabels }, ref) => {
  
  const [viewState, setViewState] = useState(INITIAL_VIEW_STATE);
  const [hoverInfo, setHoverInfo] = useState(null);

  const transitionInterpolator = useMemo(() => {
    try {
      return new LinearInterpolator(['target', 'zoom']);
    } catch (e) {
      console.error('Error creating LinearInterpolator:', e);
      return null;
    }
  }, []);

  // Expose zoomToPaper function via ref
  useImperativeHandle(ref, () => ({
    zoomToPaper: (x, y, zoomLevel = 12) => {
      setViewState(prevState => ({
        ...prevState,
        target: [x, y, 0],
        zoom: Math.min(zoomLevel, 13), // Cap at maxZoom
        transitionDuration: 1500,
        transitionInterpolator: transitionInterpolator
      }));
    }
  }), [transitionInterpolator]);

  // Label alpha based on zoom level
  const labelAlpha = Math.max(0, Math.min(255, (viewState.zoom - 5) * 128));

  // Get cluster index from data point
  // Your schema uses 'cluster' (integer)
  const getClusterIndex = (d) => {
    if (d.cluster !== undefined && d.cluster !== null) return d.cluster;
    return 0;
  };

  const layers = [
    new ScatterplotLayer({
      id: 'papers-layer',
      data: data,
      getPosition: d => [d.umap_x, d.umap_y],
      getFillColor: d => {
        if (highlightIds.length > 0) {
          return highlightIds.includes(d.paper_id) ? [0, 255, 255] : [20, 20, 20];
        }
        const idx = getClusterIndex(d);
        return COLORS[Math.abs(idx) % COLORS.length];
      },
      getRadius: 0.05,
      radiusScale: 0.3,
      radiusMinPixels: 1,
      radiusMaxPixels: 5,
      opacity: 0.7,
      stroked: false,
      filled: true,
      pickable: true,
      onClick: ({ object }) => onPaperClick(object),
      onHover: (info) => {
        if (info.object) {
          setHoverInfo({
            x: info.x,
            y: info.y,
            object: info.object
          });
        } else {
          setHoverInfo(null);
        }
      },
      updateTriggers: {
        getFillColor: [highlightIds]
      },
      transitions: {
        getFillColor: {
          duration: 500,
          easing: d => d
        },
        getRadius: {
          duration: 500,
          easing: d => Math.sqrt(d)
        }
      }
    }),

    // CLUSTER LABELS
    new TextLayer({
      id: 'cluster-labels',
      data: labels,
      getPosition: d => [d.x, d.y],
      getText: d => d.cluster_name,
      
      getSize: 14,
      fontFamily: 'Inter, sans-serif',
      fontWeight: 400,
      fontSettings: {
        sdf: true
      },
      
      getColor: [255, 255, 255, labelAlpha],
      outlineColor: [0, 0, 0, labelAlpha],
      outlineWidth: 4,
      background: false,
      
      visible: showLabels,

      updateTriggers: {
        getColor: [viewState.zoom],
        outlineColor: [viewState.zoom]
      }
    })
  ];

  const deckGLProps = {
    viewState: viewState,
    onViewStateChange: ({ viewState }) => setViewState(viewState),
    controller: true,
    layers: layers,
    views: new OrthographicView({ controller: true }),
    getCursor: () => "crosshair",
    style: { background: '#0A0A0A' }
  };

  if (transitionInterpolator) {
    deckGLProps.transitionDuration = 1500;
    deckGLProps.transitionInterpolator = transitionInterpolator;
  }

  return (
    <>
      <DeckGL {...deckGLProps} />
      
      {/* Hover Tooltip */}
      {hoverInfo && hoverInfo.object && (
        <div
          className="absolute pointer-events-none z-50 max-w-md"
          style={{
            left: hoverInfo.x + 10,
            top: hoverInfo.y + 10,
          }}
        >
          <div className="bg-slate-900/95 backdrop-blur-md border border-white/10 rounded-lg p-4 shadow-xl">
            <p className="text-sm font-semibold text-white line-clamp-3 mb-2">
              {hoverInfo.object.paper}
            </p>
            {hoverInfo.object.tldr && (
              <p className="text-sm text-slate-300 line-clamp-4">
                {hoverInfo.object.tldr}
              </p>
            )}
            {!hoverInfo.object.tldr && hoverInfo.object.eli5 && (
              <p className="text-sm text-slate-300 line-clamp-4">
                {hoverInfo.object.eli5}
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
});

NeuralMap.displayName = 'NeuralMap';

export default NeuralMap;