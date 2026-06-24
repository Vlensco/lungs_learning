import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Rotate3D, BookOpen, Maximize2, Minimize2, RefreshCw, Eye, EyeOff } from 'lucide-react';
import { partData } from '../data/partData';
import { playChime } from '../utils/audioSpeech';

export default function ArborBronchialisSketchfabScene({ 
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

  // States for collapsible/floating 2D diagram card (matches TracheaScene.jsx format)
  const [isDiagramCollapsed, setIsDiagramCollapsed] = useState(false);
  const [isDiagramOpen, setIsDiagramOpen] = useState(true);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth > 1024);
  const [position, setPosition] = useState({ x: 20, y: 130 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const [size, setSize] = useState({ width: 380, height: 460 });
  const [isResizing, setIsResizing] = useState(false);
  const resizeStart = useRef({ x: 0, y: 0, w: 0, h: 0 });

  const [active2DView, setActive2DView] = useState('principal'); // 'principal', 'lobaris_dextra', 'lobaris_sinistra'
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

  // Filter parts specifically for the Arbor Bronchialis segment
  const arborParts = useMemo(() => {
    return partData.filter(p => p.layer.id === 'Arbor Bronchialis');
  }, []);

  // Concept definitions for Arbor Bronchialis with overlay coordinates for 3D model
  // Spaced vertically to allow straight horizontal lines with 0 label overlaps
  const partsList = [
    {
      id: 'bronkus-lobaris-superior-dextra',
      color: '#f97316', // Orange
      name: { id: 'Bronchus Lobaris Superior Dextra', en: 'Right Superior Lobar' },
      x: 40,
      y: 385,
      targetX: 340,
      targetY: 385
    },
    {
      id: 'bronkus-kanan',
      color: '#ef4444', // Red
      name: { id: 'Bronchus Principalis Dextra', en: 'Right Main Bronchus' },
      x: 40,
      y: 412,
      targetX: 365,
      targetY: 412
    },
    {
      id: 'bronkus-lobaris-medius-dextra',
      color: '#ea580c', // Dark Orange
      name: { id: 'Bronchus Lobaris Medius Dextra', en: 'Right Middle Lobar' },
      x: 40,
      y: 440,
      targetX: 310,
      targetY: 440
    },
    {
      id: 'bronkus-lobaris-inferior-dextra',
      color: '#c2410c', // Rust
      name: { id: 'Bronchus Lobaris Inferior Dextra', en: 'Right Inferior Lobar' },
      x: 40,
      y: 475,
      targetX: 345,
      targetY: 475
    },
    {
      id: 'bronkus-lobaris-superior-sinistra',
      color: '#a855f7', // Purple
      name: { id: 'Bronchus Lobaris Superior Sinistra', en: 'Left Superior Lobar' },
      x: 570,
      y: 395,
      targetX: 475,
      targetY: 395
    },
    {
      id: 'bronkus-kiri',
      color: '#e11d48', // Crimson
      name: { id: 'Bronchus Principalis Sinistra', en: 'Left Main Bronchus' },
      x: 570,
      y: 425,
      targetX: 435,
      targetY: 425
    },
    {
      id: 'bronkus-lobaris-inferior-sinistra',
      color: '#7e22ce', // Dark Purple
      name: { id: 'Bronchus Lobaris Inferior Sinistra', en: 'Left Inferior Lobar' },
      x: 570,
      y: 465,
      targetX: 475,
      targetY: 465
    }
  ];

  // Sync notice when active item changes
  useEffect(() => {
    if (activePart && activePart.layer.id === 'Arbor Bronchialis') {
      const desc = activePart.short[lang] || activePart.short.id;
      setNotice(desc);
    }
  }, [activePart, lang, setNotice]);

  // Sync selected part to appropriate 2D aspect view
  useEffect(() => {
    if (activeId) {
      if (['bronkus-kanan', 'bronkus-kiri'].includes(activeId)) {
        setActive2DView('principal');
      } else if (['bronkus-lobaris-superior-dextra', 'bronkus-lobaris-medius-dextra', 'bronkus-lobaris-inferior-dextra'].includes(activeId)) {
        setActive2DView('lobaris_dextra');
      } else if (['bronkus-lobaris-superior-sinistra', 'bronkus-lobaris-inferior-sinistra'].includes(activeId)) {
        setActive2DView('lobaris_sinistra');
      }
    }
  }, [activeId]);

  const matchAnnotationToPart = (annotationName) => {
    const name = annotationName.toLowerCase();
    
    // Check main bronchi
    if (name.includes('principalis dextra') || name.includes('right main') || (name.includes('bronkus') && name.includes('kanan') && !name.includes('lobaris'))) {
      return partsList.find(p => p.id === 'bronkus-kanan');
    }
    if (name.includes('principalis sinistra') || name.includes('left main') || (name.includes('bronkus') && name.includes('kiri') && !name.includes('lobaris'))) {
      return partsList.find(p => p.id === 'bronkus-kiri');
    }
    
    // Check right lobar bronchi
    if (name.includes('superior dextra') || name.includes('right superior lobar') || name.includes('lobaris superior dexter')) {
      return partsList.find(p => p.id === 'bronkus-lobaris-superior-dextra');
    }
    if (name.includes('medius dextra') || name.includes('right middle lobar') || name.includes('lobaris medius dexter')) {
      return partsList.find(p => p.id === 'bronkus-lobaris-medius-dextra');
    }
    if (name.includes('inferior dextra') || name.includes('right inferior lobar') || name.includes('lobaris inferior dexter')) {
      return partsList.find(p => p.id === 'bronkus-lobaris-inferior-dextra');
    }
    
    // Check left lobar bronchi
    if (name.includes('superior sinistra') || name.includes('left superior lobar') || name.includes('lobaris superior sinister')) {
      return partsList.find(p => p.id === 'bronkus-lobaris-superior-sinistra');
    }
    if (name.includes('inferior sinistra') || name.includes('left inferior lobar') || name.includes('lobaris inferior sinister')) {
      return partsList.find(p => p.id === 'bronkus-lobaris-inferior-sinistra');
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

  // Render the 2D diagram based on selected aspect view with overlay elements
  const renderSVGDiagram = () => {
    if (active2DView === 'principal') {
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

          {/* Background main bronchi image (trachea_diagram.png, identical view to Trachea segment) */}
          <image 
            href="/references/trachea_diagram.png" 
            x="125" 
            y="20" 
            width="550" 
            height="580" 
          />

          {/* Left Arrow (Dextra) - Perfectly horizontal at y=410 */}
          <line 
            x1="180" y1="410" x2="350" y2="410" 
            stroke={isHighlighted('bronkus-kanan') ? '#ef4444' : '#64748b'}
            strokeWidth={isHighlighted('bronkus-kanan') ? 2.5 : 1.2}
            markerStart={isHighlighted('bronkus-kanan') ? "url(#arrow-left-active)" : "url(#arrow-left-normal)"}
            style={{ transition: 'all 0.2s ease', color: '#ef4444' }}
          />

          {/* Right Arrow (Sinistra) - Perfectly horizontal at y=420 */}
          <line 
            x1="450" y1="420" x2="620" y2="420" 
            stroke={isHighlighted('bronkus-kiri') ? '#e11d48' : '#64748b'}
            strokeWidth={isHighlighted('bronkus-kiri') ? 2.5 : 1.2}
            markerEnd={isHighlighted('bronkus-kiri') ? "url(#arrow-right-active)" : "url(#arrow-right-normal)"}
            style={{ transition: 'all 0.2s ease', color: '#e11d48' }}
          />

          {/* Hotspots */}
          {renderSvgHotspot('bronkus-kanan', 350, 410, '#ef4444')}
          {renderSvgHotspot('bronkus-kiri', 450, 420, '#e11d48')}

          {/* Labels */}
          {renderSvgLabel('bronkus-kanan', 15, 392, 165, 36, lang === 'id' ? 'Bronchus Principalis Dextra' : 'Right Main Bronchus', '#ef4444')}
          {renderSvgLabel('bronkus-kiri', 620, 402, 165, 36, lang === 'id' ? 'Bronchus Principalis Sinistra' : 'Left Main Bronchus', '#e11d48')}
        </svg>
      );
    }

    if (active2DView === 'lobaris_dextra') {
      return (
        <svg 
          viewBox="0 0 360 352" 
          style={{ width: '100%', height: 'auto', display: 'block', userSelect: 'none', background: '#ffffff' }}
        >
          <defs>
            <marker id="arrow-left-normal" viewBox="0 0 10 10" refX="2" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
              <path d="M 10 1.5 L 0 5 L 10 8.5 z" fill="#64748b" />
            </marker>
            <marker id="arrow-left-active" viewBox="0 0 10 10" refX="2" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
              <path d="M 10 1.5 L 0 5 L 10 8.5 z" fill="currentColor" />
            </marker>
          </defs>

          {/* Background right lobar bronchi image (image2.png) shifted right */}
          <image 
            href="/references/image2.png" 
            x="29" 
            y="0" 
            width="331" 
            height="352" 
          />

          {/* Superior Dextra Line - Perfectly horizontal at y=78 */}
          <line 
            x1="165" y1="78" x2="272" y2="78" 
            stroke={isHighlighted('bronkus-lobaris-superior-dextra') ? '#f97316' : '#64748b'}
            strokeWidth={isHighlighted('bronkus-lobaris-superior-dextra') ? 2.5 : 1.2}
            markerStart={isHighlighted('bronkus-lobaris-superior-dextra') ? "url(#arrow-left-active)" : "url(#arrow-left-normal)"}
            style={{ transition: 'all 0.2s ease', color: '#f97316' }}
          />

          {/* Medius Dextra Line - Perfectly horizontal at y=165 */}
          <line 
            x1="165" y1="165" x2="258" y2="165" 
            stroke={isHighlighted('bronkus-lobaris-medius-dextra') ? '#ea580c' : '#64748b'}
            strokeWidth={isHighlighted('bronkus-lobaris-medius-dextra') ? 2.5 : 1.2}
            markerStart={isHighlighted('bronkus-lobaris-medius-dextra') ? "url(#arrow-left-active)" : "url(#arrow-left-normal)"}
            style={{ transition: 'all 0.2s ease', color: '#ea580c' }}
          />

          {/* Inferior Dextra Line - Perfectly horizontal at y=265 */}
          <line 
            x1="165" y1="265" x2="262" y2="265" 
            stroke={isHighlighted('bronkus-lobaris-inferior-dextra') ? '#c2410c' : '#64748b'}
            strokeWidth={isHighlighted('bronkus-lobaris-inferior-dextra') ? 2.5 : 1.2}
            markerStart={isHighlighted('bronkus-lobaris-inferior-dextra') ? "url(#arrow-left-active)" : "url(#arrow-left-normal)"}
            style={{ transition: 'all 0.2s ease', color: '#c2410c' }}
          />

          {/* Hotspots */}
          {renderSvgHotspot('bronkus-lobaris-superior-dextra', 272, 78, '#f97316')}
          {renderSvgHotspot('bronkus-lobaris-medius-dextra', 258, 165, '#ea580c')}
          {renderSvgHotspot('bronkus-lobaris-inferior-dextra', 262, 265, '#c2410c')}

          {/* Labels */}
          {renderSvgLabel('bronkus-lobaris-superior-dextra', 10, 60, 155, 36, lang === 'id' ? 'Bronchus Lobaris Sup. Dextra' : 'Right Superior Lobar', '#f97316')}
          {renderSvgLabel('bronkus-lobaris-medius-dextra', 10, 147, 155, 36, lang === 'id' ? 'Bronchus Lobaris Med. Dextra' : 'Right Middle Lobar', '#ea580c')}
          {renderSvgLabel('bronkus-lobaris-inferior-dextra', 10, 247, 155, 36, lang === 'id' ? 'Bronchus Lobaris Inf. Dextra' : 'Right Inferior Lobar', '#c2410c')}
        </svg>
      );
    }

    if (active2DView === 'lobaris_sinistra') {
      return (
        <svg 
          viewBox="0 0 470 402" 
          style={{ width: '100%', height: 'auto', display: 'block', userSelect: 'none', background: '#ffffff' }}
        >
          <defs>
            <marker id="arrow-right-normal" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto">
              <path d="M 0 1.5 L 10 5 L 0 8.5 z" fill="#64748b" />
            </marker>
            <marker id="arrow-right-active" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto">
              <path d="M 0 1.5 L 10 5 L 0 8.5 z" fill="currentColor" />
            </marker>
          </defs>

          {/* Background left lobar bronchi image (image3.png) */}
          <image 
            href="/references/image3.png" 
            x="0" 
            y="0" 
            width="292" 
            height="402" 
          />

          {/* Superior Sinistra Line - Perfectly horizontal at y=113 */}
          <line 
            x1="146" y1="113" x2="295" y2="113" 
            stroke={isHighlighted('bronkus-lobaris-superior-sinistra') ? '#a855f7' : '#64748b'}
            strokeWidth={isHighlighted('bronkus-lobaris-superior-sinistra') ? 2.5 : 1.2}
            markerEnd={isHighlighted('bronkus-lobaris-superior-sinistra') ? "url(#arrow-right-active)" : "url(#arrow-right-normal)"}
            style={{ transition: 'all 0.2s ease', color: '#a855f7' }}
          />

          {/* Inferior Sinistra Line - Perfectly horizontal at y=299 */}
          <line 
            x1="146" y1="299" x2="295" y2="299" 
            stroke={isHighlighted('bronkus-lobaris-inferior-sinistra') ? '#7e22ce' : '#64748b'}
            strokeWidth={isHighlighted('bronkus-lobaris-inferior-sinistra') ? 2.5 : 1.2}
            markerEnd={isHighlighted('bronkus-lobaris-inferior-sinistra') ? "url(#arrow-right-active)" : "url(#arrow-right-normal)"}
            style={{ transition: 'all 0.2s ease', color: '#7e22ce' }}
          />

          {/* Hotspots */}
          {renderSvgHotspot('bronkus-lobaris-superior-sinistra', 146, 113, '#a855f7')}
          {renderSvgHotspot('bronkus-lobaris-inferior-sinistra', 146, 299, '#7e22ce')}

          {/* Labels */}
          {renderSvgLabel('bronkus-lobaris-superior-sinistra', 295, 95, 165, 36, lang === 'id' ? 'Bronchus Lobaris Sup. Sinistra' : 'Left Superior Lobar', '#a855f7')}
          {renderSvgLabel('bronkus-lobaris-inferior-sinistra', 295, 281, 165, 36, lang === 'id' ? 'Bronchus Lobaris Inf. Sinistra' : 'Left Inferior Lobar', '#7e22ce')}
        </svg>
      );
    }
  };

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

          {/* Select Aspect Selector */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '14px' }}>
            <span style={{ fontSize: '10.5px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {lang === 'id' ? 'PILIH ASPEK GAMBAR' : 'CHOOSE DIAGRAM VIEW'}
            </span>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
              <button
                onClick={() => { setActive2DView('principal'); playChime('click'); }}
                className={`soft-button ${active2DView === 'principal' ? 'active' : ''}`}
                style={{ fontSize: '10.5px', padding: '8px 12px', fontWeight: '700', borderRadius: '8px' }}
              >
                {lang === 'id' ? 'Utama (Principalis)' : 'Main (Principalis)'}
              </button>
              <button
                onClick={() => { setActive2DView('lobaris_dextra'); playChime('click'); }}
                className={`soft-button ${active2DView === 'lobaris_dextra' ? 'active' : ''}`}
                style={{ fontSize: '10.5px', padding: '8px 12px', fontWeight: '700', borderRadius: '8px' }}
              >
                {lang === 'id' ? 'Lobaris Kanan' : 'Right Lobar'}
              </button>
              <button
                onClick={() => { setActive2DView('lobaris_sinistra'); playChime('click'); }}
                className={`soft-button ${active2DView === 'lobaris_sinistra' ? 'active' : ''}`}
                style={{ fontSize: '10.5px', padding: '8px 12px', fontWeight: '700', borderRadius: '8px' }}
              >
                {lang === 'id' ? 'Lobaris Kiri' : 'Left Lobar'}
              </button>
            </div>
          </div>

          <div style={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: '100%', maxWidth: '100%' }}>
              <h4 style={{ margin: '0 0 10px 0', fontSize: '11px', fontWeight: '800', color: '#1e293b', textAlign: 'center' }}>
                {active2DView === 'principal' && (lang === 'id' ? 'BRONKUS UTAMA (PRINCIPALIS)' : 'MAIN BRONCHI (PRINCIPALIS)')}
                {active2DView === 'lobaris_dextra' && (lang === 'id' ? 'BRONKUS LOBARIS KANAN' : 'RIGHT LOBAR BRONCHI')}
                {active2DView === 'lobaris_sinistra' && (lang === 'id' ? 'BRONKUS LOBARIS KIRI' : 'LEFT LOBAR BRONCHI')}
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

                {/* ================= LEFT SIDE LEADER LINES & TARGET PIN DOTS (DEXTRA) ================= */}
                
                {/* 1. Bronchus Lobaris Superior Dextra (Orange) */}
                <line 
                  x1="230" y1="385" x2="340" y2="385" 
                  stroke={isHighlighted('bronkus-lobaris-superior-dextra') ? '#f97316' : '#94a3b8'}
                  strokeWidth={isHighlighted('bronkus-lobaris-superior-dextra') ? 2.5 : 1.2}
                  markerStart={isHighlighted('bronkus-lobaris-superior-dextra') ? 'url(#arrow-3d-left-active)' : 'url(#arrow-3d-left-normal)'}
                  style={{ transition: 'all 0.2s ease', color: '#f97316' }}
                />
                {renderTargetDot3D('bronkus-lobaris-superior-dextra', 340, 385, '#f97316')}

                {/* 2. Bronchus Principalis Dextra (Red) */}
                <line 
                  x1="230" y1="412" x2="365" y2="412" 
                  stroke={isHighlighted('bronkus-kanan') ? '#ef4444' : '#94a3b8'}
                  strokeWidth={isHighlighted('bronkus-kanan') ? 2.5 : 1.2}
                  markerStart={isHighlighted('bronkus-kanan') ? 'url(#arrow-3d-left-active)' : 'url(#arrow-3d-left-normal)'}
                  style={{ transition: 'all 0.2s ease', color: '#ef4444' }}
                />
                {renderTargetDot3D('bronkus-kanan', 365, 412, '#ef4444')}

                {/* 3. Bronchus Lobaris Medius Dextra (Dark Orange) */}
                <line 
                  x1="230" y1="440" x2="310" y2="440" 
                  stroke={isHighlighted('bronkus-lobaris-medius-dextra') ? '#ea580c' : '#94a3b8'}
                  strokeWidth={isHighlighted('bronkus-lobaris-medius-dextra') ? 2.5 : 1.2}
                  markerStart={isHighlighted('bronkus-lobaris-medius-dextra') ? 'url(#arrow-3d-left-active)' : 'url(#arrow-3d-left-normal)'}
                  style={{ transition: 'all 0.2s ease', color: '#ea580c' }}
                />
                {renderTargetDot3D('bronkus-lobaris-medius-dextra', 310, 440, '#ea580c')}

                {/* 4. Bronchus Lobaris Inferior Dextra (Rust) */}
                <line 
                  x1="230" y1="475" x2="345" y2="475" 
                  stroke={isHighlighted('bronkus-lobaris-inferior-dextra') ? '#c2410c' : '#94a3b8'}
                  strokeWidth={isHighlighted('bronkus-lobaris-inferior-dextra') ? 2.5 : 1.2}
                  markerStart={isHighlighted('bronkus-lobaris-inferior-dextra') ? 'url(#arrow-3d-left-active)' : 'url(#arrow-3d-left-normal)'}
                  style={{ transition: 'all 0.2s ease', color: '#c2410c' }}
                />
                {renderTargetDot3D('bronkus-lobaris-inferior-dextra', 345, 475, '#c2410c')}

                {/* ================= RIGHT SIDE LEADER LINES & TARGET PIN DOTS (SINISTRA) ================= */}

                {/* 5. Bronchus Lobaris Superior Sinistra (Purple) */}
                <line 
                  x1="475" y1="395" x2="570" y2="395" 
                  stroke={isHighlighted('bronkus-lobaris-superior-sinistra') ? '#a855f7' : '#94a3b8'} 
                  strokeWidth={isHighlighted('bronkus-lobaris-superior-sinistra') ? 2.5 : 1.2}
                  markerEnd={isHighlighted('bronkus-lobaris-superior-sinistra') ? 'url(#arrow-3d-right-active)' : 'url(#arrow-3d-right-normal)'}
                  style={{ transition: 'all 0.2s ease', color: '#a855f7' }} 
                />
                {renderTargetDot3D('bronkus-lobaris-superior-sinistra', 475, 395, '#a855f7')}

                {/* 6. Bronchus Principalis Sinistra (Crimson) */}
                <line 
                  x1="435" y1="425" x2="570" y2="425" 
                  stroke={isHighlighted('bronkus-kiri') ? '#e11d48' : '#94a3b8'} 
                  strokeWidth={isHighlighted('bronkus-kiri') ? 2.5 : 1.2}
                  markerEnd={isHighlighted('bronkus-kiri') ? 'url(#arrow-3d-right-active)' : 'url(#arrow-3d-right-normal)'}
                  style={{ transition: 'all 0.2s ease', color: '#e11d48' }} 
                />
                {renderTargetDot3D('bronkus-kiri', 435, 425, '#e11d48')}

                {/* 7. Bronchus Lobaris Inferior Sinistra (Dark Purple) */}
                <line 
                  x1="475" y1="465" x2="570" y2="465" 
                  stroke={isHighlighted('bronkus-lobaris-inferior-sinistra') ? '#7e22ce' : '#94a3b8'} 
                  strokeWidth={isHighlighted('bronkus-lobaris-inferior-sinistra') ? 2.5 : 1.2}
                  markerEnd={isHighlighted('bronkus-lobaris-inferior-sinistra') ? 'url(#arrow-3d-right-active)' : 'url(#arrow-3d-right-normal)'}
                  style={{ transition: 'all 0.2s ease', color: '#7e22ce' }} 
                />
                {renderTargetDot3D('bronkus-lobaris-inferior-sinistra', 475, 465, '#7e22ce')}

                {/* ================= INTERACTIVE LABELS OVERLAYING 3D ================= */}
                {partsList.map((part) => {
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
                        y={part.y - 12}
                        width={190}
                        height={24}
                        rx={6}
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
                        fontSize="10px"
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
                {lang === 'id' ? 'Sketchfab: Anatomi Percabangan Bronkus 3D' : 'Sketchfab: 3D Bronchial Tree Anatomy'}
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
                  <span>{lang === 'id' ? 'Diagram 2D Bronkus' : '2D Bronchial Diagram'}</span>
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
              <div style={{ padding: '12px', flexGrow: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                
                {/* Aspect Selector */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '6px', flexShrink: 0 }}>
                  <span style={{ fontSize: '9px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    {lang === 'id' ? 'PILIH ASPEK GAMBAR' : 'CHOOSE DIAGRAM VIEW'}
                  </span>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '4px' }}>
                    <button
                      onClick={() => { setActive2DView('principal'); playChime('click'); }}
                      className={`soft-button ${active2DView === 'principal' ? 'active' : ''}`}
                      style={{ fontSize: '9px', padding: '4px 2px', fontWeight: '700', borderRadius: '4px' }}
                    >
                      {lang === 'id' ? 'Utama' : 'Main'}
                    </button>
                    <button
                      onClick={() => { setActive2DView('lobaris_dextra'); playChime('click'); }}
                      className={`soft-button ${active2DView === 'lobaris_dextra' ? 'active' : ''}`}
                      style={{ fontSize: '9px', padding: '4px 2px', fontWeight: '700', borderRadius: '4px' }}
                    >
                      {lang === 'id' ? 'Kanan' : 'Right'}
                    </button>
                    <button
                      onClick={() => { setActive2DView('lobaris_sinistra'); playChime('click'); }}
                      className={`soft-button ${active2DView === 'lobaris_sinistra' ? 'active' : ''}`}
                      style={{ fontSize: '9px', padding: '4px 2px', fontWeight: '700', borderRadius: '4px' }}
                    >
                      {lang === 'id' ? 'Kiri' : 'Left'}
                    </button>
                  </div>
                </div>

                <hr style={{ border: '0', borderTop: '1px solid #f1f5f9', margin: '4px 0', flexShrink: 0 }} />

                <h4 style={{ margin: '0 0 6px 0', fontSize: '9.5px', fontWeight: '800', color: '#1e293b', textAlign: 'center', flexShrink: 0 }}>
                  {active2DView === 'principal' && (lang === 'id' ? 'BRONKUS UTAMA (PRINCIPALIS)' : 'MAIN BRONCHI (PRINCIPALIS)')}
                  {active2DView === 'lobaris_dextra' && (lang === 'id' ? 'BRONKUS LOBARIS KANAN' : 'RIGHT LOBAR BRONCHI')}
                  {active2DView === 'lobaris_sinistra' && (lang === 'id' ? 'BRONKUS LOBARIS KIRI' : 'LEFT LOBAR BRONCHI')}
                </h4>
                
                <div style={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', minHeight: 0 }}>
                  {renderSVGDiagram()}
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
        
        .trachea-svg-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 20;
        }

        .trachea-tab-selector {
          display: none !important;
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
