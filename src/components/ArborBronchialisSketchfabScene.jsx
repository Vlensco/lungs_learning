import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Rotate3D, BookOpen, Maximize2, Minimize2, RefreshCw } from 'lucide-react';
import { partData } from '../data/partData';

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

  // Filter parts specifically for the Arbor Bronchialis segment
  const arborParts = useMemo(() => {
    return partData.filter(p => p.layer.id === 'Arbor Bronchialis');
  }, []);

  // Concept definitions for Arbor Bronchialis with overlay coordinates for 3D model
  const partsList = [
    {
      id: 'bronkus-lobaris-superior-dextra',
      color: '#f97316', // Orange
      name: { id: 'Bronchus Lobaris Superior Dextra', en: 'Right Superior Lobar' },
      x: 40,
      y: 200,
      targetX: 340,
      targetY: 410
    },
    {
      id: 'bronkus-kanan',
      color: '#ef4444', // Red
      name: { id: 'Bronchus Principalis Dextra', en: 'Right Main Bronchus' },
      x: 40,
      y: 280,
      targetX: 365,
      targetY: 420
    },
    {
      id: 'bronkus-lobaris-medius-dextra',
      color: '#ea580c', // Dark Orange
      name: { id: 'Bronchus Lobaris Medius Dextra', en: 'Right Middle Lobar' },
      x: 40,
      y: 360,
      targetX: 310,
      targetY: 445
    },
    {
      id: 'bronkus-lobaris-inferior-dextra',
      color: '#c2410c', // Rust
      name: { id: 'Bronchus Lobaris Inferior Dextra', en: 'Right Inferior Lobar' },
      x: 40,
      y: 440,
      targetX: 345,
      targetY: 480
    },
    {
      id: 'bronkus-lobaris-superior-sinistra',
      color: '#a855f7', // Purple
      name: { id: 'Bronchus Lobaris Superior Sinistra', en: 'Left Superior Lobar' },
      x: 570,
      y: 220,
      targetX: 475,
      targetY: 420
    },
    {
      id: 'bronkus-kiri',
      color: '#e11d48', // Crimson
      name: { id: 'Bronchus Principalis Sinistra', en: 'Left Main Bronchus' },
      x: 570,
      y: 300,
      targetX: 435,
      targetY: 425
    },
    {
      id: 'bronkus-lobaris-inferior-sinistra',
      color: '#7e22ce', // Dark Purple
      name: { id: 'Bronchus Lobaris Inferior Sinistra', en: 'Left Inferior Lobar' },
      x: 570,
      y: 380,
      targetX: 475,
      targetY: 460
    }
  ];

  // Cartilage rings vertical offsets for 2D diagram
  const cervicalRings = [60, 80, 100, 120];
  const thoracicRings = [148, 168, 188, 208, 228, 248];

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
            
            // Get annotation list
            api.getAnnotationList((err, annotations) => {
              if (!err && annotations) {
                setAnnotationsList(annotations);
              }
            });
            
            // Sync selection from Sketchfab to React
            api.addEventListener('annotationSelect', (index) => {
              if (index >= 0) {
                api.getAnnotation(index, (err, ann) => {
                  if (!err && ann) {
                    const part = matchAnnotationToPart(ann.name);
                    if (part) {
                      onSelect(part.id);
                    }
                  }
                });
              }
            });
          });
        },
        error: (err) => {
          console.error('Sketchfab API error:', err);
          setApiLoading(false);
        },
        ui_infos: 0,
        ui_watermark: 0,
        ui_help: 0,
        ui_settings: 0,
        ui_inspector: 0,
        transparent: 1, // Enable transparent background to blend model with container background
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
    if (sketchfabApi && annotationsList.length > 0) {
      const index = annotationsList.findIndex(ann => {
        const part = matchAnnotationToPart(ann.name);
        return part && part.id === activeId;
      });
      if (index >= 0) {
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

  // Helper styles for 3D leader lines
  const getLineStyle = (id, baseColor) => {
    const active = activeId === id || hoveredId === id;
    return {
      stroke: active ? baseColor : '#94a3b8',
      strokeWidth: active ? 2.5 : 1.2,
      fill: 'none',
      transition: 'all 0.2s ease'
    };
  };

  // Render a target dot on the 3D model overlay
  const renderTargetDot = (id, cx, cy, color) => {
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

  const isHighlighted = (id) => activeId === id || hoveredId === id;

  // Render the 2D diagram on the left for Arbor Bronchialis
  const renderSVGDiagram = () => (
    <svg 
      viewBox="0 0 400 420" 
      className="trachea-svg-diagram"
      style={{ width: '100%', height: '100%', maxHeight: '420px', display: 'block', margin: '0 auto' }}
    >
      <defs>
        <filter id="glow-2d" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
        <marker id="arrow-2d" viewBox="0 0 10 10" refX="0" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
          <path d="M 10 1.5 L 0 5 L 10 8.5 z" fill="#0284c7" />
        </marker>
        <marker id="arrow-normal-2d" viewBox="0 0 10 10" refX="0" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
          <path d="M 10 1.5 L 0 5 L 10 8.5 z" fill="#64748b" />
        </marker>
      </defs>

      <rect width="400" height="420" rx="20" fill="#f8fafc" />

      {/* Gray Trachea outline at top */}
      <path d="M 190 30 L 190 85 Q 190 95 180 100" fill="none" stroke="#cbd5e1" strokeWidth="20" strokeLinecap="round" />
      <path d="M 210 30 L 210 85 Q 210 95 220 100" fill="none" stroke="#cbd5e1" strokeWidth="20" strokeLinecap="round" />
      <path d="M 200 30 L 200 95" fill="none" stroke="#cbd5e1" strokeWidth="22" />

      {/* --- UNDERLAY BRONCHIAL TREE (GRAY) --- */}
      {/* Right Principal */}
      <path d="M 200 95 L 165 145" fill="none" stroke="#cbd5e1" strokeWidth="20" strokeLinecap="round" />
      {/* Left Principal */}
      <path d="M 200 95 Q 220 105 245 120 T 260 165" fill="none" stroke="#cbd5e1" strokeWidth="16" strokeLinecap="round" />
      
      {/* Right Superior Lobar */}
      <path d="M 165 145 L 125 128" fill="none" stroke="#cbd5e1" strokeWidth="11" strokeLinecap="round" />
      {/* Right Middle Lobar */}
      <path d="M 165 145 L 120 178" fill="none" stroke="#cbd5e1" strokeWidth="11" strokeLinecap="round" />
      {/* Right Inferior Lobar */}
      <path d="M 165 145 L 152 225" fill="none" stroke="#cbd5e1" strokeWidth="13" strokeLinecap="round" />

      {/* Left Superior Lobar */}
      <path d="M 260 165 L 305 152" fill="none" stroke="#cbd5e1" strokeWidth="11" strokeLinecap="round" />
      {/* Left Inferior Lobar */}
      <path d="M 260 165 L 282 230" fill="none" stroke="#cbd5e1" strokeWidth="13" strokeLinecap="round" />


      {/* --- ACTIVE PATHS HIGHLIGHTS --- */}
      
      {/* Right Principal */}
      {isHighlighted('bronkus-kanan') && (
        <path d="M 200 95 L 165 145" fill="none" stroke="#ef4444" strokeWidth="22" strokeLinecap="round" filter="url(#glow-2d)" />
      )}
      {/* Left Principal */}
      {isHighlighted('bronkus-kiri') && (
        <path d="M 200 95 Q 220 105 245 120 T 260 165" fill="none" stroke="#e11d48" strokeWidth="18" strokeLinecap="round" filter="url(#glow-2d)" />
      )}

      {/* Right Superior Lobar */}
      {isHighlighted('bronkus-lobaris-superior-dextra') && (
        <path d="M 165 145 L 125 128" fill="none" stroke="#f97316" strokeWidth="13" strokeLinecap="round" filter="url(#glow-2d)" />
      )}
      {/* Right Middle Lobar */}
      {isHighlighted('bronkus-lobaris-medius-dextra') && (
        <path d="M 165 145 L 120 178" fill="none" stroke="#ea580c" strokeWidth="13" strokeLinecap="round" filter="url(#glow-2d)" />
      )}
      {/* Right Inferior Lobar */}
      {isHighlighted('bronkus-lobaris-inferior-dextra') && (
        <path d="M 165 145 L 152 225" fill="none" stroke="#c2410c" strokeWidth="15" strokeLinecap="round" filter="url(#glow-2d)" />
      )}

      {/* Left Superior Lobar */}
      {isHighlighted('bronkus-lobaris-superior-sinistra') && (
        <path d="M 260 165 L 305 152" fill="none" stroke="#a855f7" strokeWidth="13" strokeLinecap="round" filter="url(#glow-2d)" />
      )}
      {/* Left Inferior Lobar */}
      {isHighlighted('bronkus-lobaris-inferior-sinistra') && (
        <path d="M 260 165 L 282 230" fill="none" stroke="#7e22ce" strokeWidth="15" strokeLinecap="round" filter="url(#glow-2d)" />
      )}


      {/* Clickable Overlay Zones for Bronchial Tubes */}
      <path 
        d="M 200 95 L 165 145" 
        fill="none" stroke="transparent" strokeWidth="24" strokeLinecap="round" style={{ cursor: 'pointer' }}
        onClick={() => onSelect('bronkus-kanan')}
        onMouseEnter={() => setHoveredId('bronkus-kanan')}
        onMouseLeave={() => setHoveredId(null)}
      />
      <path 
        d="M 200 95 Q 220 105 245 120 T 260 165" 
        fill="none" stroke="transparent" strokeWidth="24" strokeLinecap="round" style={{ cursor: 'pointer' }}
        onClick={() => onSelect('bronkus-kiri')}
        onMouseEnter={() => setHoveredId('bronkus-kiri')}
        onMouseLeave={() => setHoveredId(null)}
      />
      <path 
        d="M 165 145 L 125 128" 
        fill="none" stroke="transparent" strokeWidth="20" strokeLinecap="round" style={{ cursor: 'pointer' }}
        onClick={() => onSelect('bronkus-lobaris-superior-dextra')}
        onMouseEnter={() => setHoveredId('bronkus-lobaris-superior-dextra')}
        onMouseLeave={() => setHoveredId(null)}
      />
      <path 
        d="M 165 145 L 120 178" 
        fill="none" stroke="transparent" strokeWidth="20" strokeLinecap="round" style={{ cursor: 'pointer' }}
        onClick={() => onSelect('bronkus-lobaris-medius-dextra')}
        onMouseEnter={() => setHoveredId('bronkus-lobaris-medius-dextra')}
        onMouseLeave={() => setHoveredId(null)}
      />
      <path 
        d="M 165 145 L 152 225" 
        fill="none" stroke="transparent" strokeWidth="20" strokeLinecap="round" style={{ cursor: 'pointer' }}
        onClick={() => onSelect('bronkus-lobaris-inferior-dextra')}
        onMouseEnter={() => setHoveredId('bronkus-lobaris-inferior-dextra')}
        onMouseLeave={() => setHoveredId(null)}
      />
      <path 
        d="M 260 165 L 305 152" 
        fill="none" stroke="transparent" strokeWidth="20" strokeLinecap="round" style={{ cursor: 'pointer' }}
        onClick={() => onSelect('bronkus-lobaris-superior-sinistra')}
        onMouseEnter={() => setHoveredId('bronkus-lobaris-superior-sinistra')}
        onMouseLeave={() => setHoveredId(null)}
      />
      <path 
        d="M 260 165 L 282 230" 
        fill="none" stroke="transparent" strokeWidth="20" strokeLinecap="round" style={{ cursor: 'pointer' }}
        onClick={() => onSelect('bronkus-lobaris-inferior-sinistra')}
        onMouseEnter={() => setHoveredId('bronkus-lobaris-inferior-sinistra')}
        onMouseLeave={() => setHoveredId(null)}
      />


      {/* --- LEADER ARROWS & LABELS --- */}
      {showLabels && (
        <>
          {/* 1. Bronchus Principalis Dextra (Left, Top) */}
          <line
            x1="120" y1="100" x2="175" y2="115"
            stroke={isHighlighted('bronkus-kanan') ? '#ef4444' : '#64748b'}
            strokeWidth={isHighlighted('bronkus-kanan') ? '2.5' : '1.2'}
            markerStart={isHighlighted('bronkus-kanan') ? 'url(#arrow-2d)' : 'url(#arrow-normal-2d)'}
          />
          <foreignObject x="5" y="80" width="115" height="40">
            <button
              onClick={() => onSelect('bronkus-kanan')}
              onMouseEnter={() => setHoveredId('bronkus-kanan')}
              onMouseLeave={() => setHoveredId(null)}
              className={`diag-label-btn ${isHighlighted('bronkus-kanan') ? 'active red-badge' : ''}`}
              style={{ fontSize: '10px' }}
            >
              {lang === 'id' ? 'Bronchus Principalis Dextra' : 'Right Main Bronchus'}
            </button>
          </foreignObject>

          {/* 2. Bronchus Lobaris Superior Dextra (Left, Middle-1) */}
          <line
            x1="120" y1="150" x2="145" y2="138"
            stroke={isHighlighted('bronkus-lobaris-superior-dextra') ? '#f97316' : '#64748b'}
            strokeWidth={isHighlighted('bronkus-lobaris-superior-dextra') ? '2.5' : '1.2'}
            markerStart={isHighlighted('bronkus-lobaris-superior-dextra') ? 'url(#arrow-2d)' : 'url(#arrow-normal-2d)'}
          />
          <foreignObject x="5" y="132" width="115" height="40">
            <button
              onClick={() => onSelect('bronkus-lobaris-superior-dextra')}
              onMouseEnter={() => setHoveredId('bronkus-lobaris-superior-dextra')}
              onMouseLeave={() => setHoveredId(null)}
              className={`diag-label-btn ${isHighlighted('bronkus-lobaris-superior-dextra') ? 'active orange-badge' : ''}`}
              style={{ fontSize: '10px' }}
            >
              {lang === 'id' ? 'Bronchus Lobaris Superior Dextra' : 'Right Superior Lobar'}
            </button>
          </foreignObject>

          {/* 3. Bronchus Lobaris Medius Dextra (Left, Middle-2) */}
          <line
            x1="120" y1="202" x2="135" y2="168"
            stroke={isHighlighted('bronkus-lobaris-medius-dextra') ? '#ea580c' : '#64748b'}
            strokeWidth={isHighlighted('bronkus-lobaris-medius-dextra') ? '2.5' : '1.2'}
            markerStart={isHighlighted('bronkus-lobaris-medius-dextra') ? 'url(#arrow-2d)' : 'url(#arrow-normal-2d)'}
          />
          <foreignObject x="5" y="184" width="115" height="40">
            <button
              onClick={() => onSelect('bronkus-lobaris-medius-dextra')}
              onMouseEnter={() => setHoveredId('bronkus-lobaris-medius-dextra')}
              onMouseLeave={() => setHoveredId(null)}
              className={`diag-label-btn ${isHighlighted('bronkus-lobaris-medius-dextra') ? 'active darkorange-badge' : ''}`}
              style={{ fontSize: '10px' }}
            >
              {lang === 'id' ? 'Bronchus Lobaris Medius Dextra' : 'Right Middle Lobar'}
            </button>
          </foreignObject>

          {/* 4. Bronchus Lobaris Inferior Dextra (Left, Bottom) */}
          <line
            x1="120" y1="254" x2="155" y2="195"
            stroke={isHighlighted('bronkus-lobaris-inferior-dextra') ? '#c2410c' : '#64748b'}
            strokeWidth={isHighlighted('bronkus-lobaris-inferior-dextra') ? '2.5' : '1.2'}
            markerStart={isHighlighted('bronkus-lobaris-inferior-dextra') ? 'url(#arrow-2d)' : 'url(#arrow-normal-2d)'}
          />
          <foreignObject x="5" y="236" width="115" height="40">
            <button
              onClick={() => onSelect('bronkus-lobaris-inferior-dextra')}
              onMouseEnter={() => setHoveredId('bronkus-lobaris-inferior-dextra')}
              onMouseLeave={() => setHoveredId(null)}
              className={`diag-label-btn ${isHighlighted('bronkus-lobaris-inferior-dextra') ? 'active rust-badge' : ''}`}
              style={{ fontSize: '10px' }}
            >
              {lang === 'id' ? 'Bronchus Lobaris Inferior Dextra' : 'Right Inferior Lobar'}
            </button>
          </foreignObject>


          {/* 5. Bronchus Principalis Sinistra (Right, Top) */}
          <line
            x1="242" y1="120" x2="280" y2="120"
            stroke={isHighlighted('bronkus-kiri') ? '#e11d48' : '#64748b'}
            strokeWidth={isHighlighted('bronkus-kiri') ? '2.5' : '1.2'}
          />
          <foreignObject x="282" y="100" width="110" height="40">
            <button
              onClick={() => onSelect('bronkus-kiri')}
              onMouseEnter={() => setHoveredId('bronkus-kiri')}
              onMouseLeave={() => setHoveredId(null)}
              className={`diag-label-btn ${isHighlighted('bronkus-kiri') ? 'active crimson-badge' : ''}`}
              style={{ fontSize: '10px' }}
            >
              {lang === 'id' ? 'Bronchus Principalis Sinistra' : 'Left Main Bronchus'}
            </button>
          </foreignObject>

          {/* 6. Bronchus Lobaris Superior Sinistra (Right, Middle) */}
          <line
            x1="290" y1="168" x2="280" y2="175"
            stroke={isHighlighted('bronkus-lobaris-superior-sinistra') ? '#a855f7' : '#64748b'}
            strokeWidth={isHighlighted('bronkus-lobaris-superior-sinistra') ? '2.5' : '1.2'}
          />
          <foreignObject x="282" y="155" width="110" height="40">
            <button
              onClick={() => onSelect('bronkus-lobaris-superior-sinistra')}
              onMouseEnter={() => setHoveredId('bronkus-lobaris-superior-sinistra')}
              onMouseLeave={() => setHoveredId(null)}
              className={`diag-label-btn ${isHighlighted('bronkus-lobaris-superior-sinistra') ? 'active purple-badge' : ''}`}
              style={{ fontSize: '10px' }}
            >
              {lang === 'id' ? 'Bronchus Lobaris Superior Sinistra' : 'Left Superior Lobar'}
            </button>
          </foreignObject>

          {/* 7. Bronchus Lobaris Inferior Sinistra (Right, Bottom) */}
          <line
            x1="272" y1="220" x2="280" y2="225"
            stroke={isHighlighted('bronkus-lobaris-inferior-sinistra') ? '#7e22ce' : '#64748b'}
            strokeWidth={isHighlighted('bronkus-lobaris-inferior-sinistra') ? '2.5' : '1.2'}
          />
          <foreignObject x="282" y="210" width="110" height="40">
            <button
              onClick={() => onSelect('bronkus-lobaris-inferior-sinistra')}
              onMouseEnter={() => setHoveredId('bronkus-lobaris-inferior-sinistra')}
              onMouseLeave={() => setHoveredId(null)}
              className={`diag-label-btn ${isHighlighted('bronkus-lobaris-inferior-sinistra') ? 'active darkpurple-badge' : ''}`}
              style={{ fontSize: '10px' }}
            >
              {lang === 'id' ? 'Bronchus Lobaris Inferior Sinistra' : 'Left Inferior Lobar'}
            </button>
          </foreignObject>
        </>
      )}
    </svg>
  );

  const cervicalActive = activeId === 'trachea-pars-cervicalis' || hoveredId === 'trachea-pars-cervicalis';
  const thoracicActive = activeId === 'trachea-pars-thoracica' || hoveredId === 'trachea-pars-thoracica';

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
        
        {/* LEFT COLUMN: INTERACTIVE DIAGRAM */}
        <div 
          className={`trachea-diagram-pane ${activeTab === 'diagram' ? 'mobile-visible' : 'mobile-hidden'}`}
          style={{
            width: '35%',
            height: '100%',
            background: '#ffffff',
            borderRight: '1px solid #cbd5e1',
            padding: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflowY: 'auto'
          }}
        >
          <div style={{ width: '100%', maxWidth: '340px' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '15px', fontWeight: '800', color: '#0f172a', textAlign: 'center', letterSpacing: '-0.3px' }}>
              {lang === 'id' ? 'DIAGRAM INTERAKTIF ARBOR BRONCHIALIS' : 'INTERACTIVE BRONCHIAL TREE DIAGRAM'}
            </h3>
            {renderSVGDiagram()}
            <p style={{ margin: '14px 0 0 0', fontSize: '11px', color: '#64748b', textAlign: 'center', lineHeight: '1.4' }}>
              {lang === 'id' 
                ? 'Klik/ketuk nama label di atas atau area diagram untuk menyorot bagian tersebut.' 
                : 'Click/tap the labels above or the diagram regions to select and view description.'}
            </p>
          </div>
        </div>

        {/* RIGHT COLUMN: 3D VIEWER (Sketchfab Embed with Interactive Pins & SVG Overlay) */}
        <div 
          className={`trachea-3d-pane ${activeTab === 'sketchfab' ? 'mobile-visible' : 'mobile-hidden'}`}
          style={{
            width: '65%',
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



          {/* Inner container forced to 4:3 aspect ratio to guarantee perfect alignment of overlay and iframe */}
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

            {/* Transparent SVG Overlay (Lines, Brackets, and Labels) */}
            {!apiLoading && showLabels && (
              <svg 
                viewBox="0 0 800 600" 
                preserveAspectRatio="xMidYMid meet"
                className="trachea-svg-overlay"
              >
                <defs>
                  {/* Arrow markers for each part */}
                  <marker id="arrow-normal" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M 0 1.5 L 10 5 L 0 8.5 z" fill="#94a3b8" />
                  </marker>
                  <marker id="arrow-bronkus-lobaris-superior-dextra" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M 0 1.5 L 10 5 L 0 8.5 z" fill="#f97316" />
                  </marker>
                  <marker id="arrow-bronkus-kanan" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M 0 1.5 L 10 5 L 0 8.5 z" fill="#ef4444" />
                  </marker>
                  <marker id="arrow-bronkus-lobaris-medius-dextra" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M 0 1.5 L 10 5 L 0 8.5 z" fill="#ea580c" />
                  </marker>
                  <marker id="arrow-bronkus-lobaris-inferior-dextra" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M 0 1.5 L 10 5 L 0 8.5 z" fill="#c2410c" />
                  </marker>
                  <marker id="arrow-bronkus-lobaris-superior-sinistra" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M 0 1.5 L 10 5 L 0 8.5 z" fill="#a855f7" />
                  </marker>
                  <marker id="arrow-bronkus-kiri" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M 0 1.5 L 10 5 L 0 8.5 z" fill="#e11d48" />
                  </marker>
                  <marker id="arrow-bronkus-lobaris-inferior-sinistra" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M 0 1.5 L 10 5 L 0 8.5 z" fill="#7e22ce" />
                  </marker>
                </defs>

                {/* ================= LEFT SIDE LEADER LINES & TARGET PIN DOTS (DEXTRA) ================= */}
                
                {/* 1. Bronchus Lobaris Superior Dextra (Orange) */}
                <path 
                  d="M 230 200 L 280 200 L 340 410" 
                  {...getLineStyle('bronkus-lobaris-superior-dextra', '#f97316')}
                  markerEnd={activeId === 'bronkus-lobaris-superior-dextra' || hoveredId === 'bronkus-lobaris-superior-dextra' ? 'url(#arrow-bronkus-lobaris-superior-dextra)' : 'url(#arrow-normal)'}
                />
                {renderTargetDot('bronkus-lobaris-superior-dextra', 340, 410, '#f97316')}

                {/* 2. Bronchus Principalis Dextra (Red) */}
                <path 
                  d="M 230 280 L 290 280 L 365 420" 
                  {...getLineStyle('bronkus-kanan', '#ef4444')}
                  markerEnd={activeId === 'bronkus-kanan' || hoveredId === 'bronkus-kanan' ? 'url(#arrow-bronkus-kanan)' : 'url(#arrow-normal)'}
                />
                {renderTargetDot('bronkus-kanan', 365, 420, '#ef4444')}

                {/* 3. Bronchus Lobaris Medius Dextra (Dark Orange) */}
                <path 
                  d="M 230 360 L 280 360 L 310 445" 
                  {...getLineStyle('bronkus-lobaris-medius-dextra', '#ea580c')}
                  markerEnd={activeId === 'bronkus-lobaris-medius-dextra' || hoveredId === 'bronkus-lobaris-medius-dextra' ? 'url(#arrow-bronkus-lobaris-medius-dextra)' : 'url(#arrow-normal)'}
                />
                {renderTargetDot('bronkus-lobaris-medius-dextra', 310, 445, '#ea580c')}

                {/* 4. Bronchus Lobaris Inferior Dextra (Rust) */}
                <path 
                  d="M 230 440 L 290 440 L 345 480" 
                  {...getLineStyle('bronkus-lobaris-inferior-dextra', '#c2410c')}
                  markerEnd={activeId === 'bronkus-lobaris-inferior-dextra' || hoveredId === 'bronkus-lobaris-inferior-dextra' ? 'url(#arrow-bronkus-lobaris-inferior-dextra)' : 'url(#arrow-normal)'}
                />
                {renderTargetDot('bronkus-lobaris-inferior-dextra', 345, 480, '#c2410c')}


                {/* ================= RIGHT SIDE LEADER LINES & TARGET PIN DOTS (SINISTRA) ================= */}

                {/* 5. Bronchus Lobaris Superior Sinistra (Purple) */}
                <path 
                  d="M 570 220 L 520 220 L 475 420" 
                  {...getLineStyle('bronkus-lobaris-superior-sinistra', '#a855f7')} 
                  markerEnd={activeId === 'bronkus-lobaris-superior-sinistra' || hoveredId === 'bronkus-lobaris-superior-sinistra' ? 'url(#arrow-bronkus-lobaris-superior-sinistra)' : 'url(#arrow-normal)'}
                />
                {renderTargetDot('bronkus-lobaris-superior-sinistra', 475, 420, '#a855f7')}

                {/* 6. Bronchus Principalis Sinistra (Crimson) */}
                <path 
                  d="M 570 300 L 500 300 L 435 425" 
                  {...getLineStyle('bronkus-kiri', '#e11d48')} 
                  markerEnd={activeId === 'bronkus-kiri' || hoveredId === 'bronkus-kiri' ? 'url(#arrow-bronkus-kiri)' : 'url(#arrow-normal)'}
                />
                {renderTargetDot('bronkus-kiri', 435, 425, '#e11d48')}

                {/* 7. Bronchus Lobaris Inferior Sinistra (Dark Purple) */}
                <path 
                  d="M 570 380 L 510 380 L 475 460" 
                  {...getLineStyle('bronkus-lobaris-inferior-sinistra', '#7e22ce')} 
                  markerEnd={activeId === 'bronkus-lobaris-inferior-sinistra' || hoveredId === 'bronkus-lobaris-inferior-sinistra' ? 'url(#arrow-bronkus-lobaris-inferior-sinistra)' : 'url(#arrow-normal)'}
                />
                {renderTargetDot('bronkus-lobaris-inferior-sinistra', 475, 460, '#7e22ce')}


                {/* ================= INTERACTIVE LABELS ================= */}
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
                        fontSize="10.5px"
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
              src="https://sketchfab.com/models/5604db883bd640c8b90838bb787340bd/embed"
              style={{ width: '100%', height: '100%', border: '0', display: 'block' }}
            />

            {/* Floating Fullscreen Toggle Button in bottom right */}
            <button 
              className="floating-fullscreen-btn"
              onClick={() => setIsFullscreen()}
              title={isFullscreen ? (lang === 'id' ? 'Keluar Layar Penuh' : 'Exit Fullscreen') : (lang === 'id' ? 'Layar Penuh' : 'Fullscreen')}
              style={{ bottom: '16px', right: '16px' }} // Adjusted for internal container positioning
            >
              {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
            </button>

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

          </div>
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

        .diag-label-btn {
          width: 100%;
          height: 100%;
          border: 1px solid #cbd5e1;
          background: #ffffff;
          border-radius: 8px;
          color: #334155;
          font-weight: 700;
          font-size: 11px;
          line-height: 1.25;
          text-align: center;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 4px;
          box-shadow: 0 2px 4px rgba(15, 23, 42, 0.02);
          transition: all 0.2s cubic-bezier(0.19, 1, 0.22, 1);
          cursor: pointer;
        }
        .diag-label-btn:hover {
          background: #f8fafc;
          border-color: #94a3b8;
          transform: translateY(-1px);
        }
        .diag-label-btn.active {
          color: #ffffff;
          box-shadow: 0 4px 10px rgba(15, 23, 42, 0.06);
        }
        .diag-label-btn.active.red-badge { background: #ef4444; border-color: #ef4444; }
        .diag-label-btn.active.orange-badge { background: #f97316; border-color: #f97316; }
        .diag-label-btn.active.darkorange-badge { background: #ea580c; border-color: #ea580c; }
        .diag-label-btn.active.rust-badge { background: #c2410c; border-color: #c2410c; }
        .diag-label-btn.active.crimson-badge { background: #e11d48; border-color: #e11d48; }
        .diag-label-btn.active.purple-badge { background: #a855f7; border-color: #a855f7; }
        .diag-label-btn.active.darkpurple-badge { background: #7e22ce; border-color: #7e22ce; }

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
