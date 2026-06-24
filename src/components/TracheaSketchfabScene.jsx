import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Rotate3D, BookOpen, Maximize2, Minimize2, RefreshCw, Eye, EyeOff } from 'lucide-react';
import { partData } from '../data/partData';
import { playChime } from '../utils/audioSpeech';

export default function TracheaSketchfabScene({ 
  activeId, 
  activePart, 
  onSelect, 
  showLabels, 
  setNotice,
  breathingRate,
  lang,
  isFullscreen,
  setIsFullscreen
}) {
  const [activeTab, setActiveTab] = useState('diagram'); // For mobile tabs: 'diagram' or 'sketchfab'
  const [hoveredId, setHoveredId] = useState(null);
  
  const iframeRef = useRef(null);
  const [sketchfabApi, setSketchfabApi] = useState(null);
  const [annotationsList, setAnnotationsList] = useState([]);
  const [apiLoading, setApiLoading] = useState(true);

  // States for collapsible/floating 2D diagram card (matches PulmoScene.jsx format)
  const [isDiagramCollapsed, setIsDiagramCollapsed] = useState(false);
  const [isDiagramOpen, setIsDiagramOpen] = useState(true);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth > 1024);
  const [position, setPosition] = useState({ x: 20, y: 130 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const [size, setSize] = useState({ width: 380, height: 460 });
  const [isResizing, setIsResizing] = useState(false);
  const resizeStart = useRef({ x: 0, y: 0, w: 0, h: 0 });
  
  const isProgrammaticSelection = useRef(false);
  const activeIdRef = useRef(activeId);

  useEffect(() => {
    activeIdRef.current = activeId;
  }, [activeId]);

  const handleMouseDown = (e) => {
    if (e.target.tagName === 'BUTTON' || e.target.closest('button')) return;
    setIsDragging(true);
    dragStart.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y
    };
  };

  const handleResizeMouseDown = (e) => {
    e.stopPropagation();
    e.preventDefault();
    setIsResizing(true);
    resizeStart.current = {
      x: e.clientX,
      y: e.clientY,
      w: size.width,
      h: size.height
    };
  };

  useEffect(() => {
    if (!isDragging) return;
    const handleMouseMove = (e) => {
      const newX = Math.max(10, Math.min(window.innerWidth - size.width, e.clientX - dragStart.current.x));
      const newY = Math.max(10, Math.min(window.innerHeight - size.height, e.clientY - dragStart.current.y));
      setPosition({ x: newX, y: newY });
    };
    const handleMouseUp = () => {
      setIsDragging(false);
    };
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, size.width, size.height]);

  useEffect(() => {
    if (!isResizing) return;
    const handleMouseMove = (e) => {
      const deltaX = e.clientX - resizeStart.current.x;
      const deltaY = e.clientY - resizeStart.current.y;
      const newWidth = Math.max(300, Math.min(1000, resizeStart.current.w + deltaX));
      const newHeight = Math.max(250, Math.min(900, resizeStart.current.h + deltaY));
      setSize({ width: newWidth, height: newHeight });
    };
    const handleMouseUp = () => {
      setIsResizing(false);
    };
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  // Resize listener to track responsive viewport category
  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth > 1024);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Filter parts specifically for the Trachea segment
  const tracheaParts = useMemo(() => {
    return partData.filter(p => p.layer.id === 'Trachea');
  }, []);

  // Concept definitions for Trachea segment on the 3D model SVG overlay
  const partsList3D = [
    {
      id: 'kartilago-trakea',
      color: '#0d9488', // Teal
      name: { id: 'Cartilagines Tracheales', en: 'Tracheal Cartilages' },
      x: 40,
      y: 150
    },
    {
      id: 'ligamenta-annularia',
      color: '#10b981', // Green
      name: { id: 'Ligamenta Annularia', en: 'Annular Ligaments' },
      x: 40,
      y: 210
    },
    {
      id: 'trachea-pars-cervicalis',
      color: '#0284c7', // Blue
      name: { id: 'Trachea, Pars Cervicalis', en: 'Cervical Trachea' },
      x: 570,
      y: 120
    },
    {
      id: 'trachea-pars-thoracica',
      color: '#0369a1', // Dark Blue
      name: { id: 'Trachea, Pars Thoracica', en: 'Thoracic Trachea' },
      x: 570,
      y: 270
    },
    {
      id: 'karina',
      color: '#d97706', // Amber
      name: { id: 'Bifurcatio Trachea', en: 'Tracheal Bifurcation' },
      x: 570,
      y: 390
    }
  ];

  // Concept definitions for Trachea segment (for name matching)
  const partsList = [
    {
      id: 'kartilago-trakea',
      color: '#0d9488', // Teal
      name: { id: 'Cartilagines Tracheales', en: 'Tracheal Cartilages' }
    },
    {
      id: 'ligamenta-annularia',
      color: '#10b981', // Green
      name: { id: 'Ligamenta Annularia', en: 'Annular Ligaments' }
    },
    {
      id: 'trachea-pars-cervicalis',
      color: '#0284c7', // Blue
      name: { id: 'Trachea, Pars Cervicalis', en: 'Cervical Trachea' }
    },
    {
      id: 'trachea-pars-thoracica',
      color: '#0369a1', // Dark Blue
      name: { id: 'Trachea, Pars Thoracica', en: 'Thoracic Trachea' }
    },
    {
      id: 'karina',
      color: '#d97706', // Amber
      name: { id: 'Bifurcatio Trachea', en: 'Tracheal Bifurcation' }
    }
  ];

  const matchAnnotationToPart = (annotationName) => {
    const name = annotationName.toLowerCase();
    if (name.includes('cervical') || name.includes('cervicalis') || name.includes('leher')) {
      return partsList.find(p => p.id === 'trachea-pars-cervicalis');
    }
    if (name.includes('thoracic') || name.includes('thoracica') || name.includes('dada')) {
      return partsList.find(p => p.id === 'trachea-pars-thoracica');
    }
    if (name.includes('bifurcatio') || name.includes('carina') || name.includes('bifurcation') || name.includes('percabangan') || name.includes('karina')) {
      return partsList.find(p => p.id === 'karina');
    }
    if (name.includes('cartilage') || name.includes('cartilagines') || name.includes('tulang rawan') || name.includes('kartilago')) {
      return partsList.find(p => p.id === 'kartilago-trakea');
    }
    if (name.includes('ligament') || name.includes('ligamenta') || name.includes('annularia')) {
      return partsList.find(p => p.id === 'ligamenta-annularia');
    }
    return null;
  };

  useEffect(() => {
    const scriptId = 'sketchfab-viewer-api-script';
    let script = document.getElementById(scriptId);

    const initViewer = () => {
      if (!iframeRef.current || !window.Sketchfab) return;
      
      const client = new window.Sketchfab(iframeRef.current);
      client.init('5604db883bd640c8b90838bb787340bd', {
        success: (api) => {
          api.start();
          api.addEventListener('viewerready', () => {
            setSketchfabApi(api);
            setApiLoading(false);
            
            // Hide the annotation tooltips (text tags) while preserving number pins
            api.hideAnnotationTooltips((err) => {
              if (err) console.error('Error hiding tooltips on init:', err);
            });
            
            // Get annotation list
            api.getAnnotationList((err, annotations) => {
              if (!err && annotations) {
                setAnnotationsList(annotations);
              }
            });
            
            // Sync selection from Sketchfab to React
            api.addEventListener('annotationSelect', (index) => {
              if (index >= 0) {
                if (isProgrammaticSelection.current) {
                  isProgrammaticSelection.current = false;
                  return;
                }
                api.getAnnotation(index, (err, ann) => {
                  if (!err && ann) {
                    const currentActiveId = activeIdRef.current;
                    const part = matchAnnotationToPart(ann.name);
                    if (part && part.id !== currentActiveId) {
                      onSelect(part.id);
                    }
                  }
                });
                
                // Hide annotation tooltip text tags to keep the 3D canvas clean
                api.hideAnnotationTooltips((err) => {
                  if (err) console.error('Error hiding tooltips on select:', err);
                });
              } else {
                api.hideAnnotationTooltips((err) => {
                  if (err) console.error('Error hiding tooltips on deselect:', err);
                });
              }
            });
          });
        },
        error: (err) => {
          console.error('Sketchfab API error:', err);
          setApiLoading(false);
        },
        annotation_tooltip_visible: 0,
        ui_infos: 0,
        ui_watermark: 0,
        ui_help: 0,
        ui_settings: 0,
        ui_inspector: 0,
        transparent: 1,
        annotations_visible: 1
      });
    };

    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://static.sketchfab.com/api/sketchfab-viewer-1.12.1.js';
      script.async = true;
      document.body.appendChild(script);
      script.onload = () => {
        initViewer();
      };
    } else {
      if (window.Sketchfab) {
        initViewer();
      } else {
        script.addEventListener('load', initViewer);
      }
    }

    return () => {
      if (script) {
        script.removeEventListener('load', initViewer);
      }
    };
  }, []);

  // Sync selection from React to Sketchfab
  useEffect(() => {
    if (sketchfabApi && annotationsList.length > 0 && activeId) {
      const index = annotationsList.findIndex(ann => {
        const part = matchAnnotationToPart(ann.name);
        return part && part.id === activeId;
      });
      if (index >= 0) {
        isProgrammaticSelection.current = true;
        sketchfabApi.gotoAnnotation(index, (err) => {
          if (err) console.warn("Failed to navigate to annotation in Sketchfab", err);
        });
      }
    }
  }, [activeId, sketchfabApi, annotationsList]);

  const handleResetRotation = () => {
    if (sketchfabApi) {
      sketchfabApi.recenterCamera((err) => {
        if (err) console.warn("Failed to recenter camera", err);
      });
    }
  };

  const isHighlighted = (id) => activeId === id || hoveredId === id;

  // Helper styles for 3D leader lines
  const getLineStyle3D = (id, baseColor) => {
    const active = isHighlighted(id);
    return {
      stroke: active ? baseColor : '#94a3b8',
      strokeWidth: active ? 2.5 : 1.2,
      fill: 'none',
      transition: 'all 0.2s ease'
    };
  };

  // Render a target dot on the 3D model overlay
  const renderTargetDot3D = (id, cx, cy, color) => {
    const isActive = activeId === id;
    const isHovered = hoveredId === id;
    const activeOrHovered = isActive || isHovered;
    
    return (
      <g 
        onClick={() => onSelect(id)}
        onMouseEnter={() => setHoveredId(id)}
        onMouseLeave={() => setHoveredId(null)}
        style={{ cursor: 'pointer', pointerEvents: 'auto' }}
      >
        {activeOrHovered && (
          <circle 
            cx={cx} 
            cy={cy} 
            r={12} 
            fill="none" 
            stroke={color} 
            strokeWidth={1.5} 
            opacity={0.6}
            style={{ transformOrigin: `${cx}px ${cy}px`, animation: 'pulse 1.8s infinite ease-in-out' }}
          />
        )}
        <circle 
          cx={cx} 
          cy={cy} 
          r={isActive ? 6 : 4} 
          fill={isActive ? color : '#ffffff'} 
          stroke={color} 
          strokeWidth={2} 
          style={{ transition: 'all 0.2s ease' }}
        />
      </g>
    );
  };

  const renderSvgHotspot = (id, cx, cy, color) => {
    const active = isHighlighted(id);
    return (
      <g
        onClick={() => {
          onSelect(id);
          playChime('click');
        }}
        onMouseEnter={() => setHoveredId(id)}
        onMouseLeave={() => setHoveredId(null)}
        style={{ cursor: 'pointer', pointerEvents: 'auto' }}
      >
        {active && (
          <circle
            cx={cx}
            cy={cy}
            r={14}
            fill={color}
            opacity={0.24}
            style={{ animation: 'pulse 1.8s infinite', transformOrigin: `${cx}px ${cy}px` }}
          />
        )}
        <circle
          cx={cx}
          cy={cy}
          r={active ? 6.5 : 4}
          fill={active ? color : '#ffffff'}
          stroke={color}
          strokeWidth={active ? 2 : 1.5}
          style={{ transition: 'all 0.25s ease' }}
        />
      </g>
    );
  };

  const renderSvgLabel = (id, x, y, width, height, labelText, color) => {
    const active = isHighlighted(id);
    const isHovered = hoveredId === id;
    return (
      <g
        onClick={() => {
          onSelect(id);
          playChime('click');
        }}
        onMouseEnter={() => setHoveredId(id)}
        onMouseLeave={() => setHoveredId(null)}
        style={{ cursor: 'pointer', pointerEvents: 'auto' }}
      >
        {/* Background Card */}
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          rx={8}
          fill={active ? color : isHovered ? 'rgba(240, 246, 255, 0.95)' : '#ffffff'}
          stroke={active || isHovered ? color : '#cbd5e1'}
          strokeWidth={active ? 2 : 1.2}
          style={{ transition: 'all 0.2s ease' }}
        />
        {/* Text */}
        <text
          x={x + width / 2}
          y={y + height / 2 + 4} // vertical centering adjustment
          textAnchor="middle"
          fill={active ? '#ffffff' : isHovered ? color : '#334155'}
          fontSize="10px"
          fontWeight="800"
          style={{ transition: 'all 0.2s ease', fontFamily: 'inherit' }}
        >
          {labelText}
        </text>
      </g>
    );
  };

  // Render the 2D diagram with unified SVG including labels, brackets, arrows, and background image
  // Taller viewBox and expanded image size to fill card space and reduce bottom padding
  const renderSVGDiagram = () => {
    return (
      <svg 
        viewBox="0 0 800 620" 
        style={{ width: '100%', height: 'auto', display: 'block', userSelect: 'none', background: '#ffffff' }}
      >
        <defs>
          {/* Arrow markers */}
          <marker id="arrow-left-normal" viewBox="0 0 10 10" refX="2" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
            <path d="M 10 1.5 L 0 5 L 10 8.5 z" fill="#64748b" />
          </marker>
          <marker id="arrow-left-active" viewBox="0 0 10 10" refX="2" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
            <path d="M 10 1.5 L 0 5 L 10 8.5 z" fill="currentColor" />
          </marker>
          <marker id="arrow-right-normal" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto">
            <path d="M 0 1.5 L 10 5 L 0 8.5 z" fill="#64748b" />
          </marker>
          <marker id="arrow-right-active" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto">
            <path d="M 0 1.5 L 10 5 L 0 8.5 z" fill="currentColor" />
          </marker>
        </defs>

        {/* Trachea Model Image in the center (expanded from width 410 to 550) */}
        <image 
          href="/references/trachea_diagram.png" 
          x="125" 
          y="20" 
          width="550" 
          height="580" 
        />

        {/* Lines, Brackets, and Arrows (perfectly straight and matching the 3D lines) */}
        {/* 1. Cartilagines Tracheales (Teal) */}
        <line 
          x1="180" y1="151" x2="380" y2="151" 
          stroke={isHighlighted('kartilago-trakea') ? '#0d9488' : '#64748b'}
          strokeWidth={isHighlighted('kartilago-trakea') ? 2.5 : 1.2}
          markerStart={isHighlighted('kartilago-trakea') ? "url(#arrow-left-active)" : "url(#arrow-left-normal)"}
          style={{ transition: 'all 0.2s ease', color: '#0d9488' }}
        />

        {/* 2. Ligamenta Annularia (Green) */}
        <line 
          x1="180" y1="213" x2="380" y2="213" 
          stroke={isHighlighted('ligamenta-annularia') ? '#10b981' : '#64748b'}
          strokeWidth={isHighlighted('ligamenta-annularia') ? 2.5 : 1.2}
          markerStart={isHighlighted('ligamenta-annularia') ? "url(#arrow-left-active)" : "url(#arrow-left-normal)"}
          style={{ transition: 'all 0.2s ease', color: '#10b981' }}
        />

        {/* 3. Trachea, Pars Cervicalis Bracket & Line (Blue) */}
        <path 
          d="M 415 50 L 420 50 L 420 140 L 415 140" 
          fill="none" 
          stroke={isHighlighted('trachea-pars-cervicalis') ? '#0284c7' : '#64748b'} 
          strokeWidth={isHighlighted('trachea-pars-cervicalis') ? 3 : 1.5} 
          style={{ transition: 'all 0.2s ease' }}
        />
        <line 
          x1="420" y1="98" x2="620" y2="98" 
          stroke={isHighlighted('trachea-pars-cervicalis') ? '#0284c7' : '#64748b'} 
          strokeWidth={isHighlighted('trachea-pars-cervicalis') ? 2.5 : 1.2} 
          markerEnd={isHighlighted('trachea-pars-cervicalis') ? "url(#arrow-right-active)" : "url(#arrow-right-normal)"}
          style={{ transition: 'all 0.2s ease', color: '#0284c7' }}
        />

        {/* 4. Trachea, Pars Thoracica Bracket & Line (Dark Blue) */}
        <path 
          d="M 415 145 L 420 145 L 420 340 L 415 340" 
          fill="none" 
          stroke={isHighlighted('trachea-pars-thoracica') ? '#0369a1' : '#64748b'} 
          strokeWidth={isHighlighted('trachea-pars-thoracica') ? 3 : 1.5} 
          style={{ transition: 'all 0.2s ease' }}
        />
        <line 
          x1="420" y1="264" x2="620" y2="264" 
          stroke={isHighlighted('trachea-pars-thoracica') ? '#0369a1' : '#64748b'} 
          strokeWidth={isHighlighted('trachea-pars-thoracica') ? 2.5 : 1.2} 
          markerEnd={isHighlighted('trachea-pars-thoracica') ? "url(#arrow-right-active)" : "url(#arrow-right-normal)"}
          style={{ transition: 'all 0.2s ease', color: '#0369a1' }}
        />

        {/* 5. Bifurcatio Trachea Line & Arrow (Amber) */}
        <line 
          x1="410" y1="356" x2="620" y2="356" 
          stroke={isHighlighted('karina') ? '#d97706' : '#64748b'} 
          strokeWidth={isHighlighted('karina') ? 2.5 : 1.2} 
          markerEnd={isHighlighted('karina') ? "url(#arrow-right-active)" : "url(#arrow-right-normal)"}
          style={{ transition: 'all 0.2s ease', color: '#d97706' }}
        />

        {/* Hotspots (Interactive Dots on the trachea) */}
        {renderSvgHotspot('trachea-pars-cervicalis', 400, 98, '#0284c7')}
        {renderSvgHotspot('kartilago-trakea', 400, 151, '#0d9488')}
        {renderSvgHotspot('ligamenta-annularia', 400, 213, '#10b981')}
        {renderSvgHotspot('trachea-pars-thoracica', 400, 264, '#0369a1')}
        {renderSvgHotspot('karina', 400, 356, '#d97706')}

        {/* Interactive Label Cards (aligned perfectly on the sides) */}
        {renderSvgLabel('kartilago-trakea', 15, 133, 165, 36, lang === 'id' ? 'Cartilagines Trachales' : 'Tracheal Cartilages', '#0d9488')}
        {renderSvgLabel('ligamenta-annularia', 15, 195, 165, 36, lang === 'id' ? 'Ligamenta Annularia' : 'Annular Ligaments', '#10b981')}
        
        {renderSvgLabel('trachea-pars-cervicalis', 620, 80, 165, 36, lang === 'id' ? 'Trachea Pars Cervicalis' : 'Cervical Trachea', '#0284c7')}
        {renderSvgLabel('trachea-pars-thoracica', 620, 246, 165, 36, lang === 'id' ? 'Trachea Pars Thoracica' : 'Thoracic Trachea', '#0369a1')}
        {renderSvgLabel('karina', 620, 338, 165, 36, lang === 'id' ? 'Bifurcatio Trachea' : 'Tracheal Bifurcation', '#d97706')}
      </svg>
    );
  };

  const cervicalActive3D = activeId === 'trachea-pars-cervicalis' || hoveredId === 'trachea-pars-cervicalis';
  const thoracicActive3D = activeId === 'trachea-pars-thoracica' || hoveredId === 'trachea-pars-thoracica';

  const diagramPane = (
    <div 
      className={`trachea-diagram-pane ${isDiagramCollapsed ? 'collapsed-card' : ''} ${activeTab === 'diagram' ? 'mobile-visible' : 'mobile-hidden'}`}
      style={(!isFullscreen && isDesktop) ? {
        width: '100%',
        height: 'auto',
        background: '#ffffff',
        border: '1.5px solid #cbd5e1',
        borderRadius: '16px',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 4px 12px rgba(15, 23, 42, 0.04)',
        overflowY: 'visible',
        position: 'relative'
      } : {
        width: '35%',
        height: '100%',
        background: '#ffffff',
        borderRight: '1px solid #cbd5e1',
        padding: '16px 20px',
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto'
      }}
    >
      {isDiagramCollapsed ? (
        <button 
          onClick={() => {
            setIsDiagramCollapsed(false);
            playChime('click');
          }}
          className="soft-button"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '10px 14px',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(15, 23, 42, 0.08)',
            fontWeight: '800',
            fontSize: '11px',
            background: '#ffffff',
            border: '1.5px solid #cbd5e1'
          }}
        >
          <BookOpen size={14} color="#0284c7" />
          <span>{lang === 'id' ? 'Tampilkan Gambar 2D' : 'Show 2D Diagram'}</span>
        </button>
      ) : (
        <>
          {/* Header row with Hide button for Fullscreen */}
          {isFullscreen && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '8px' }}>
              <button 
                onClick={() => {
                  setIsDiagramCollapsed(true);
                  playChime('click');
                }}
                className="desktop-only-hide-btn"
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#64748b',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '10.5px',
                  fontWeight: '700',
                  padding: 0
                }}
                title={lang === 'id' ? 'Sembunyikan Gambar 2D' : 'Hide 2D Diagram'}
              >
                <EyeOff size={13} />
                <span>{lang === 'id' ? 'Sembunyikan' : 'Hide'}</span>
              </button>
            </div>
          )}

          <div style={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: '100%', maxWidth: '100%' }}>
              <h4 style={{ margin: '0 0 10px 0', fontSize: '11px', fontWeight: '800', color: '#1e293b', textAlign: 'center' }}>
                {lang === 'id' ? 'DIAGRAM INTERAKTIF TRAKEA' : 'INTERACTIVE TRACHEA DIAGRAM'}
              </h4>
              {renderSVGDiagram()}
              <p style={{ margin: '14px 0 0 0', fontSize: '10px', color: '#64748b', textAlign: 'center', lineHeight: '1.4' }}>
                {lang === 'id' 
                  ? 'Klik/ketuk nama label di atas atau area diagram untuk menyorot bagian tersebut.' 
                  : 'Click/tap the labels above or the diagram regions to select and view description.'}
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );

  return (
    <div className="segment-scene-container" style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: '#ffffff' }}>
      
      {/* Mobile Tab Selector (Visible only on screens <= 1024px) */}
      <div className="trachea-tab-selector" style={{ background: '#ffffff', borderBottom: '1px solid #cbd5e1', padding: '6px' }}>
        <button 
          className={`trachea-tab-btn ${activeTab === 'diagram' ? 'active' : ''}`}
          onClick={() => setActiveTab('diagram')}
          style={{
            flex: 1,
            padding: '8px',
            fontSize: '12px',
            fontWeight: '700',
            borderRadius: '8px',
            textAlign: 'center',
            background: activeTab === 'diagram' ? '#f0f6ff' : 'transparent',
            color: activeTab === 'diagram' ? '#0284c7' : '#64748b',
          }}
        >
          <BookOpen size={14} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '6px' }} />
          <span>{lang === 'id' ? 'Diagram Label' : 'Labeled Diagram'}</span>
        </button>
        <button 
          className={`trachea-tab-btn ${activeTab === 'sketchfab' ? 'active' : ''}`}
          onClick={() => setActiveTab('sketchfab')}
          style={{
            flex: 1,
            padding: '8px',
            fontSize: '12px',
            fontWeight: '700',
            borderRadius: '8px',
            textAlign: 'center',
            background: activeTab === 'sketchfab' ? '#f0f6ff' : 'transparent',
            color: activeTab === 'sketchfab' ? '#0284c7' : '#64748b',
          }}
        >
          <Rotate3D size={14} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '6px' }} />
          <span>3D Model</span>
        </button>
      </div>

      {/* Split-Screen Layout Grid Container */}
      <div className="trachea-split-container" style={{ display: 'flex', flexGrow: 1, overflow: 'hidden' }}>
        
        {/* On mobile: Render diagramPane as a full-page tab. On desktop: Not rendered here (it floats inside 3D pane instead). */}
        {!isDesktop && activeTab === 'diagram' && diagramPane}

        {/* RIGHT COLUMN: 3D VIEWER (Takes 100% width on desktop) */}
        <div 
          className={`trachea-3d-pane ${activeTab === 'sketchfab' ? 'mobile-visible' : 'mobile-hidden'}`}
          style={{
            width: isDesktop ? '100%' : '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#ffffff',
            position: 'relative'
          }}
        >
          {/* Reset Camera Rotation Button */}
          {!apiLoading && sketchfabApi && (
            <button 
              className="floating-camera-reset-btn"
              onClick={handleResetRotation}
              title={lang === 'id' ? 'Kembali ke Rotasi Awal' : 'Reset View Rotation'}
            >
              <RefreshCw size={13} />
              <span>{lang === 'id' ? 'Rotasi Awal' : 'Reset View'}</span>
            </button>
          )}

          {/* Toggle 2D Diagram Button (Desktop only) */}
          {!apiLoading && isDesktop && (
            <button 
              className="floating-camera-reset-btn"
              style={{ left: '130px' }}
              onClick={() => setIsDiagramOpen(!isDiagramOpen)}
              title={isDiagramOpen ? (lang === 'id' ? 'Sembunyikan Diagram 2D' : 'Hide 2D Diagram') : (lang === 'id' ? 'Tampilkan Diagram 2D' : 'Show 2D Diagram')}
            >
              <BookOpen size={13} />
              <span>{isDiagramOpen ? (lang === 'id' ? 'Sembunyikan Diagram' : 'Hide Diagram') : (lang === 'id' ? 'Tampilkan Diagram' : 'Show Diagram')}</span>
            </button>
          )}

          {/* User notice for pin numbers */}
          {!apiLoading && (
            <div style={{
              position: 'absolute',
              left: '16px',
              top: '16px',
              background: 'rgba(2, 132, 199, 0.08)',
              backdropFilter: 'blur(8px)',
              border: '1.5px solid #bae6fd',
              borderRadius: '10px',
              padding: '8px 12px',
              fontSize: '11px',
              fontWeight: '700',
              color: '#0369a1',
              maxWidth: '300px',
              pointerEvents: 'none',
              zIndex: 5,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 4px 12px rgba(2, 132, 199, 0.04)'
            }}>
              <span>💡</span>
              <span>
                {lang === 'id' 
                  ? 'Ketuk nomor pin pada model 3D untuk mendengar penjelasannya!' 
                  : 'Tap the pin numbers on the 3D model to hear the voice explanation!'}
              </span>
            </div>
          )}

          {/* Inner container forced to 4:3 aspect ratio */}
          <div style={{
            position: 'relative',
            height: '100%',
            width: 'auto',
            maxWidth: '100%',
            aspectRatio: '4 / 3',
            background: '#ffffff'
          }}>

            {/* Sketchfab API Loading overlay */}
            {apiLoading && (
              <div style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#ffffff',
                zIndex: 10
              }}>
                <div className="loader-orb" style={{ margin: '0 0 14px 0' }} />
                <p style={{ fontSize: '11px', fontWeight: '700', color: '#64748b' }}>
                  {lang === 'id' ? 'Menghubungkan laboratorium 3D...' : 'Loading 3D laboratory...'}
                </p>
              </div>
            )}

            {/* Transparent SVG Overlay (Lines, Brackets, and Labels) on top of 3D Canvas */}
            {/* Formatted to match the 2D layout with straight horizontal lines and vertical brackets */}
            {!apiLoading && showLabels && (
              <svg 
                viewBox="0 0 800 600" 
                preserveAspectRatio="xMidYMid meet"
                className="trachea-svg-overlay"
              >
                <defs>
                  {/* Arrow markers for 3D overlay pointing towards labels */}
                  <marker id="arrow-3d-left-normal" viewBox="0 0 10 10" refX="2" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M 10 1.5 L 0 5 L 10 8.5 z" fill="#94a3b8" />
                  </marker>
                  <marker id="arrow-3d-left-active" viewBox="0 0 10 10" refX="2" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M 10 1.5 L 0 5 L 10 8.5 z" fill="currentColor" />
                  </marker>
                  <marker id="arrow-3d-right-normal" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                    <path d="M 0 1.5 L 10 5 L 0 8.5 z" fill="#94a3b8" />
                  </marker>
                  <marker id="arrow-3d-right-active" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                    <path d="M 0 1.5 L 10 5 L 0 8.5 z" fill="currentColor" />
                  </marker>
                </defs>

                {/* ================= LEFT SIDE LEADER LINES & TARGET PIN DOTS ================= */}
                
                {/* 1. Cartilagines Tracheales (Teal) */}
                <line 
                  x1="230" y1="150" x2="344" y2="150" 
                  stroke={isHighlighted('kartilago-trakea') ? '#0d9488' : '#94a3b8'}
                  strokeWidth={isHighlighted('kartilago-trakea') ? 2.5 : 1.2}
                  markerStart={isHighlighted('kartilago-trakea') ? 'url(#arrow-3d-left-active)' : 'url(#arrow-3d-left-normal)'}
                  style={{ transition: 'all 0.2s ease', color: '#0d9488' }}
                />
                {renderTargetDot3D('kartilago-trakea', 344, 150, '#0d9488')}

                {/* 2. Ligamenta Annularia (Green) */}
                <line 
                  x1="230" y1="210" x2="346" y2="210" 
                  stroke={isHighlighted('ligamenta-annularia') ? '#10b981' : '#94a3b8'}
                  strokeWidth={isHighlighted('ligamenta-annularia') ? 2.5 : 1.2}
                  markerStart={isHighlighted('ligamenta-annularia') ? 'url(#arrow-3d-left-active)' : 'url(#arrow-3d-left-normal)'}
                  style={{ transition: 'all 0.2s ease', color: '#10b981' }}
                />
                {renderTargetDot3D('ligamenta-annularia', 346, 210, '#10b981')}

                {/* ================= RIGHT SIDE LEADER LINES & REGIONAL BRACKETS ================= */}

                {/* 3. Trachea, Pars Cervicalis Bracket */}
                <path 
                  d="M 410 70 L 415 70 L 415 170 L 410 170" 
                  stroke={cervicalActive3D ? '#0284c7' : '#94a3b8'} 
                  strokeWidth={cervicalActive3D ? 3 : 1.5} 
                  fill="none" 
                  style={{ transition: 'all 0.2s ease' }}
                />
                <line 
                  x1="415" y1="120" x2="570" y2="120" 
                  stroke={cervicalActive3D ? '#0284c7' : '#94a3b8'} 
                  strokeWidth={cervicalActive3D ? 2.5 : 1.2} 
                  markerEnd={cervicalActive3D ? 'url(#arrow-3d-right-active)' : 'url(#arrow-3d-right-normal)'}
                  style={{ transition: 'all 0.2s ease', color: '#0284c7' }} 
                />

                {/* 4. Trachea, Pars Thoracica Bracket */}
                <path 
                  d="M 410 175 L 415 175 L 415 365 L 410 365" 
                  stroke={thoracicActive3D ? '#0369a1' : '#94a3b8'} 
                  strokeWidth={thoracicActive3D ? 3 : 1.5} 
                  fill="none" 
                  style={{ transition: 'all 0.2s ease' }}
                />
                <line 
                  x1="415" y1="270" x2="570" y2="270" 
                  stroke={thoracicActive3D ? '#0369a1' : '#94a3b8'} 
                  strokeWidth={thoracicActive3D ? 2.5 : 1.2} 
                  markerEnd={thoracicActive3D ? 'url(#arrow-3d-right-active)' : 'url(#arrow-3d-right-normal)'}
                  style={{ transition: 'all 0.2s ease', color: '#0369a1' }} 
                />

                {/* 5. Bifurcatio Trachea (Amber) */}
                <line 
                  x1="410" y1="390" x2="570" y2="390" 
                  stroke={isHighlighted('karina') ? '#d97706' : '#94a3b8'}
                  strokeWidth={isHighlighted('karina') ? 2.5 : 1.2}
                  markerEnd={isHighlighted('karina') ? 'url(#arrow-3d-right-active)' : 'url(#arrow-3d-right-normal)'}
                  style={{ transition: 'all 0.2s ease', color: '#d97706' }}
                />
                {renderTargetDot3D('karina', 410, 390, '#d97706')}

                {/* ================= INTERACTIVE LABELS OVERLAYING 3D ================= */}
                {partsList3D.map((part) => {
                  const isActive = activeId === part.id;
                  const isHovered = hoveredId === part.id;
                  
                  return (
                    <g
                      key={part.id}
                      onClick={() => onSelect(part.id)}
                      onMouseEnter={() => setHoveredId(part.id)}
                      onMouseLeave={() => setHoveredId(null)}
                      style={{ cursor: 'pointer', pointerEvents: 'auto' }}
                    >
                      <rect
                        x={part.x}
                        y={part.y - 18}
                        width={190}
                        height={36}
                        rx={8}
                        fill={isActive ? part.color : isHovered ? 'rgba(240, 246, 255, 0.95)' : 'rgba(255, 255, 255, 0.85)'}
                        stroke={isActive || isHovered ? part.color : '#cbd5e1'}
                        strokeWidth={isActive ? 2 : 1.2}
                        style={{ transition: 'all 0.2s ease' }}
                      />
                      <text
                        x={part.x + 95}
                        y={part.y + 4}
                        textAnchor="middle"
                        fill={isActive ? '#ffffff' : isHovered ? part.color : '#334155'}
                        fontSize="11px"
                        fontWeight="700"
                        style={{ transition: 'all 0.2s ease', userSelect: 'none', fontFamily: 'inherit' }}
                      >
                        {part.name[lang]}
                      </text>
                    </g>
                  );
                })}
              </svg>
            )}

            {/* Sketchfab IFrame Container */}
            <iframe 
              ref={iframeRef}
              id="sketchfab-iframe"
              title="Trachea &amp; Main Bronchi" 
              frameBorder="0" 
              allowFullScreen 
              mozallowfullscreen="true" 
              webkitallowfullscreen="true" 
              allow="autoplay; fullscreen; xr-spatial-tracking; accelerometer; gyroscope" 
              xr-spatial-tracking="true" 
              execution-while-out-of-viewport="true" 
              execution-while-not-rendered="true" 
              web-share="true" 
              src="https://sketchfab.com/models/5604db883bd640c8b90838bb787340bd/embed?annotation_tooltip_visible=0&ui_infos=0&ui_watermark=0&ui_help=0&ui_settings=0&ui_inspector=0&transparent=1&annotations_visible=1"
              style={{ width: '100%', height: '100%', border: '0', display: 'block' }}
            />

            {/* Mode label watermark */}
            <div 
              style={{ 
                position: 'absolute', 
                left: '16px', 
                bottom: '16px', 
                background: 'rgba(255, 255, 255, 0.85)', 
                backdropFilter: 'blur(8px)',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                padding: '6px 12px',
                fontSize: '10.5px',
                fontWeight: '700',
                color: '#475569',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                pointerEvents: 'none',
                zIndex: 5
              }}
            >
              <Rotate3D size={13} />
              <span>
                {lang === 'id' ? 'Sketchfab: Anatomi Trakea 3D' : 'Sketchfab: 3D Trachea Anatomy'}
              </span>
            </div>

            {/* Floating Fullscreen Toggle Button in bottom right */}
            <button 
              className="floating-fullscreen-btn"
              onClick={() => setIsFullscreen()}
              title={isFullscreen ? (lang === 'id' ? 'Keluar Layar Penuh' : 'Exit Fullscreen') : (lang === 'id' ? 'Layar Penuh' : 'Fullscreen')}
              style={{ bottom: '16px', right: '16px' }}
            >
              {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
            </button>

          </div>

          {/* Floating resizable & draggable 2D Diagram Panel (Desktop only) */}
          {isDesktop && isDiagramOpen && (
            <div 
              style={{
                position: 'absolute',
                left: `${position.x}px`,
                top: `${position.y}px`,
                zIndex: 100,
                background: '#ffffff',
                border: '1.5px solid #cbd5e1',
                borderRadius: '16px',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                display: 'flex',
                flexDirection: 'column',
                cursor: isDragging ? 'grabbing' : 'default',
                userSelect: 'none',
                overflow: 'hidden',
                minWidth: '280px',
                minHeight: '250px',
                width: `${size.width}px`,
                height: `${size.height}px`
              }}
            >
              {/* Drag Handle Header */}
              <div 
                onMouseDown={handleMouseDown}
                style={{
                  padding: '10px 14px',
                  background: '#f8fafc',
                  borderBottom: '1px solid #e2e8f0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'grab',
                  fontWeight: 'bold',
                  fontSize: '11px',
                  color: '#475569'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <BookOpen size={14} color="#0284c7" />
                  <span>{lang === 'id' ? 'Diagram 2D Trakea' : '2D Trachea Diagram'}</span>
                </div>
                <button 
                  onClick={() => setIsDiagramOpen(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#94a3b8',
                    cursor: 'pointer',
                    fontSize: '14px',
                    padding: '2px',
                    fontWeight: 'bold'
                  }}
                >
                  ✕
                </button>
              </div>

              {/* diagram wrapper */}
              <div style={{ padding: '12px', flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '10px', overflowY: 'auto' }}>
                <div>
                  <h4 style={{ margin: '0 0 6px 0', fontSize: '9.5px', fontWeight: '800', color: '#1e293b', textAlign: 'center' }}>
                    {lang === 'id' ? 'DIAGRAM INTERAKTIF TRAKEA' : 'INTERACTIVE TRACHEA DIAGRAM'}
                  </h4>
                  <div style={{ position: 'relative', width: '100%' }}>
                    {renderSVGDiagram()}
                  </div>
                </div>
              </div>

              {/* Resize Handle */}
              <div 
                onMouseDown={handleResizeMouseDown}
                style={{
                  position: 'absolute',
                  right: 0,
                  bottom: 0,
                  width: '18px',
                  height: '18px',
                  cursor: 'se-resize',
                  zIndex: 110,
                  display: 'flex',
                  alignItems: 'flex-end',
                  justifyContent: 'flex-end',
                  padding: '2px',
                  pointerEvents: 'auto'
                }}
                title={lang === 'id' ? 'Tarik untuk mengubah ukuran' : 'Drag to resize'}
              >
                <svg width="10" height="10" viewBox="0 0 10 10" style={{ pointerEvents: 'none' }}>
                  <path d="M10,0 L0,10 M10,4 L4,10 M10,8 L8,10" stroke="#cbd5e1" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* CSS Styles injection specifically for the interactive diagram label buttons and animation */}
      <style>{`
        @keyframes pulse {
          0% {
            transform: scale(0.9);
            opacity: 0.8;
          }
          50% {
            transform: scale(1.3);
            opacity: 0.2;
          }
          100% {
            transform: scale(0.9);
            opacity: 0.8;
          }
        }
        
        .trachea-tab-selector {
          display: none !important;
        }

        .trachea-svg-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 20;
        }

        /* Responsive Breakpoints */
        @media (max-width: 1024px) {
          .trachea-tab-selector {
            display: flex !important;
            gap: 6px;
          }
          .trachea-split-container {
            flex-direction: column;
          }
          .trachea-diagram-pane, .trachea-3d-pane {
            width: 100% !important;
            height: 100% !important;
            flex-grow: 1;
          }
          .mobile-hidden {
            display: none !important;
          }
          .mobile-visible {
            display: flex !important;
          }
        }
      `}</style>
    </div>
  );
}
