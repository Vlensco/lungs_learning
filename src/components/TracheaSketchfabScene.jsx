import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Rotate3D, BookOpen, Maximize2, Minimize2, RefreshCw } from 'lucide-react';
import { partData } from '../data/partData';

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

  // Filter parts specifically for the Trachea segment
  const tracheaParts = useMemo(() => {
    return partData.filter(p => p.layer.id === 'Trachea');
  }, []);

  // Concept definitions for Trachea segment with overlay coordinates for the 3D model
  const partsList = [
    {
      id: 'kartilago-trakea',
      color: '#0d9488', // Teal
      name: { id: 'Cartilagines Tracheales', en: 'Tracheal Cartilages' },
      x: 40,
      y: 182
    },
    {
      id: 'ligamenta-annularia',
      color: '#10b981', // Green
      name: { id: 'Ligamenta Annularia', en: 'Annular Ligaments' },
      x: 40,
      y: 302
    },
    {
      id: 'trachea-pars-cervicalis',
      color: '#0284c7', // Blue
      name: { id: 'Trachea, Pars Cervicalis', en: 'Cervical Trachea' },
      x: 570,
      y: 142
    },
    {
      id: 'trachea-pars-thoracica',
      color: '#0369a1', // Dark Blue
      name: { id: 'Trachea, Pars Thoracica', en: 'Thoracic Trachea' },
      x: 570,
      y: 282
    },
    {
      id: 'karina',
      color: '#d97706', // Amber
      name: { id: 'Bifurcatio Trachea', en: 'Tracheal Bifurcation' },
      x: 570,
      y: 387
    }
  ];

  // Cartilage rings vertical offsets for 2D diagram
  const cervicalRings = [60, 80, 100, 120];
  const thoracicRings = [148, 168, 188, 208, 228, 248];

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

  // Helper styles for 3D leader lines and brackets
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

  // Render the 2D diagram on the left
  const renderSVGDiagram = () => (
    <svg 
      viewBox="0 0 400 420" 
      className="trachea-svg-diagram"
      style={{ width: '100%', height: '100%', maxHeight: '420px', display: 'block', margin: '0 auto' }}
    >
      <defs>
        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
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

      {/* Trahea tube representation */}
      <rect 
        x="185" 
        y="50" 
        width="30" 
        height="225" 
        fill="#f1f5f9" 
        stroke="#e2e8f0" 
        strokeWidth="1"
      />

      {/* Ligaments */}
      {cervicalRings.slice(0, -1).map((y, idx) => (
        <rect
          key={`c-lig-${idx}`}
          x="182"
          y={y + 14}
          width="36"
          height="6"
          rx="1"
          fill={isHighlighted('ligamenta-annularia') ? '#10b981' : '#cbd5e1'}
          onClick={() => onSelect('ligamenta-annularia')}
          onMouseEnter={() => setHoveredId('ligamenta-annularia')}
          onMouseLeave={() => setHoveredId(null)}
          style={{ cursor: 'pointer', transition: 'fill 0.2s ease' }}
        />
      ))}
      <rect
        x="182"
        y="134"
        width="36"
        height="14"
        rx="1"
        fill={isHighlighted('ligamenta-annularia') ? '#10b981' : '#cbd5e1'}
        onClick={() => onSelect('ligamenta-annularia')}
        onMouseEnter={() => setHoveredId('ligamenta-annularia')}
        onMouseLeave={() => setHoveredId(null)}
        style={{ cursor: 'pointer', transition: 'fill 0.2s ease' }}
      />
      {thoracicRings.slice(0, -1).map((y, idx) => (
        <rect
          key={`t-lig-${idx}`}
          x="182"
          y={y + 14}
          width="36"
          height="6"
          rx="1"
          fill={isHighlighted('ligamenta-annularia') ? '#10b981' : '#cbd5e1'}
          onClick={() => onSelect('ligamenta-annularia')}
          onMouseEnter={() => setHoveredId('ligamenta-annularia')}
          onMouseLeave={() => setHoveredId(null)}
          style={{ cursor: 'pointer', transition: 'fill 0.2s ease' }}
        />
      ))}

      {/* Cartilage rings */}
      {cervicalRings.map((y, idx) => (
        <rect
          key={`c-ring-${idx}`}
          x="180"
          y={y}
          width="40"
          height="14"
          rx="3"
          fill={isHighlighted('kartilago-trakea') ? '#0d9488' : isHighlighted('trachea-pars-cervicalis') ? '#bae6fd' : '#ffffff'}
          stroke={isHighlighted('kartilago-trakea') ? '#0d9488' : isHighlighted('trachea-pars-cervicalis') ? '#0284c7' : '#94a3b8'}
          strokeWidth={isHighlighted('kartilago-trakea') || isHighlighted('trachea-pars-cervicalis') ? "2" : "1.2"}
          onClick={() => onSelect('kartilago-trakea')}
          onMouseEnter={() => setHoveredId('kartilago-trakea')}
          onMouseLeave={() => setHoveredId(null)}
          style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
        />
      ))}
      {thoracicRings.map((y, idx) => (
        <rect
          key={`t-ring-${idx}`}
          x="180"
          y={y}
          width="40"
          height="14"
          rx="3"
          fill={isHighlighted('kartilago-trakea') ? '#0d9488' : isHighlighted('trachea-pars-thoracica') ? '#cfe2ff' : '#ffffff'}
          stroke={isHighlighted('kartilago-trakea') ? '#0d9488' : isHighlighted('trachea-pars-thoracica') ? '#0369a1' : '#94a3b8'}
          strokeWidth={isHighlighted('kartilago-trakea') || isHighlighted('trachea-pars-thoracica') ? "2" : "1.2"}
          onClick={() => onSelect('kartilago-trakea')}
          onMouseEnter={() => setHoveredId('kartilago-trakea')}
          onMouseLeave={() => setHoveredId(null)}
          style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
        />
      ))}

      {/* Bifurcatio */}
      <path 
        d="M 185 262 L 185 282 Q 185 302 165 315 L 140 330 L 130 345 L 140 355 L 155 342 L 175 326 Q 198 308 200 295 Q 202 308 225 326 L 245 342 L 260 355 L 270 345 L 260 330 L 235 315 Q 215 302 215 282 L 215 262 Z" 
        fill={isHighlighted('karina') ? '#f59e0b' : '#ffffff'}
        stroke={isHighlighted('karina') ? '#d97706' : '#94a3b8'}
        strokeWidth={isHighlighted('karina') ? "2.5" : "1.5"}
        onClick={() => onSelect('karina')}
        onMouseEnter={() => setHoveredId('karina')}
        onMouseLeave={() => setHoveredId(null)}
        filter={isHighlighted('karina') ? "url(#glow)" : "none"}
        style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
      />
      <line 
        x1="200" y1="282" x2="200" y2="295" 
        stroke={isHighlighted('karina') ? '#b45309' : '#cbd5e1'} 
        strokeWidth="2" 
        strokeDasharray="2,2" 
        pointerEvents="none"
      />

      {/* Brackets */}
      <path
        d="M 230 54 L 236 54 L 236 126 L 230 126 M 236 90 L 242 90"
        fill="none"
        stroke={isHighlighted('trachea-pars-cervicalis') ? '#0284c7' : '#94a3b8'}
        strokeWidth={isHighlighted('trachea-pars-cervicalis') ? '3.5' : '1.8'}
        onClick={() => onSelect('trachea-pars-cervicalis')}
        onMouseEnter={() => setHoveredId('trachea-pars-cervicalis')}
        onMouseLeave={() => setHoveredId(null)}
        style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
      />
      <path
        d="M 230 142 L 236 142 L 236 256 L 230 256 M 236 199 L 242 199"
        fill="none"
        stroke={isHighlighted('trachea-pars-thoracica') ? '#0369a1' : '#94a3b8'}
        strokeWidth={isHighlighted('trachea-pars-thoracica') ? '3.5' : '1.8'}
        onClick={() => onSelect('trachea-pars-thoracica')}
        onMouseEnter={() => setHoveredId('trachea-pars-thoracica')}
        onMouseLeave={() => setHoveredId(null)}
        style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
      />

      {/* Lines and Labels */}
      {showLabels && (
        <>
          <line
            x1="120" y1="100" x2="175" y2="100"
            stroke={isHighlighted('kartilago-trakea') ? '#0d9488' : '#64748b'}
            strokeWidth={isHighlighted('kartilago-trakea') ? '2.5' : '1.2'}
            markerStart={isHighlighted('kartilago-trakea') ? 'url(#arrow-2d)' : 'url(#arrow-normal-2d)'}
          />
          <foreignObject x="10" y="80" width="115" height="40">
            <button
              onClick={() => onSelect('kartilago-trakea')}
              onMouseEnter={() => setHoveredId('kartilago-trakea')}
              onMouseLeave={() => setHoveredId(null)}
              className={`diag-label-btn ${isHighlighted('kartilago-trakea') ? 'active teal' : ''}`}
            >
              Cartilagines Tracheales
            </button>
          </foreignObject>

          <line
            x1="120" y1="172" x2="178" y2="172"
            stroke={isHighlighted('ligamenta-annularia') ? '#10b981' : '#64748b'}
            strokeWidth={isHighlighted('ligamenta-annularia') ? '2.5' : '1.2'}
            markerStart={isHighlighted('ligamenta-annularia') ? 'url(#arrow-2d)' : 'url(#arrow-normal-2d)'}
          />
          <foreignObject x="10" y="152" width="115" height="40">
            <button
              onClick={() => onSelect('ligamenta-annularia')}
              onMouseEnter={() => setHoveredId('ligamenta-annularia')}
              onMouseLeave={() => setHoveredId(null)}
              className={`diag-label-btn ${isHighlighted('ligamenta-annularia') ? 'active green' : ''}`}
            >
              Ligamenta Annularia
            </button>
          </foreignObject>

          <line
            x1="242" y1="90" x2="280" y2="90"
            stroke={isHighlighted('trachea-pars-cervicalis') ? '#0284c7' : '#64748b'}
            strokeWidth={isHighlighted('trachea-pars-cervicalis') ? '2.5' : '1.2'}
          />
          <foreignObject x="282" y="70" width="110" height="40">
            <button
              onClick={() => onSelect('trachea-pars-cervicalis')}
              onMouseEnter={() => setHoveredId('trachea-pars-cervicalis')}
              onMouseLeave={() => setHoveredId(null)}
              className={`diag-label-btn ${isHighlighted('trachea-pars-cervicalis') ? 'active blue' : ''}`}
            >
              Trachea, Pars Cervicalis
            </button>
          </foreignObject>

          <line
            x1="242" y1="199" x2="280" y2="199"
            stroke={isHighlighted('trachea-pars-thoracica') ? '#0369a1' : '#64748b'}
            strokeWidth={isHighlighted('trachea-pars-thoracica') ? '2.5' : '1.2'}
          />
          <foreignObject x="282" y="179" width="110" height="40">
            <button
              onClick={() => onSelect('trachea-pars-thoracica')}
              onMouseEnter={() => setHoveredId('trachea-pars-thoracica')}
              onMouseLeave={() => setHoveredId(null)}
              className={`diag-label-btn ${isHighlighted('trachea-pars-thoracica') ? 'active darkblue' : ''}`}
            >
              Trachea, Pars Thoracica
            </button>
          </foreignObject>

          <line
            x1="200" y1="292" x2="280" y2="292"
            stroke={isHighlighted('karina') ? '#d97706' : '#64748b'}
            strokeWidth={isHighlighted('karina') ? '2.5' : '1.2'}
            markerStart={isHighlighted('karina') ? 'url(#arrow-2d)' : 'url(#arrow-normal-2d)'}
          />
          <foreignObject x="282" y="272" width="110" height="40">
            <button
              onClick={() => onSelect('karina')}
              onMouseEnter={() => setHoveredId('karina')}
              onMouseLeave={() => setHoveredId(null)}
              className={`diag-label-btn ${isHighlighted('karina') ? 'active amber' : ''}`}
            >
              Bifurcatio Trachea
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
              {lang === 'id' ? 'DIAGRAM INTERAKTIF TRAKEA' : 'INTERACTIVE TRACHEA DIAGRAM'}
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
                <marker id="arrow-kartilago-trakea" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 1.5 L 10 5 L 0 8.5 z" fill="#0d9488" />
                </marker>
                <marker id="arrow-ligamenta-annularia" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 1.5 L 10 5 L 0 8.5 z" fill="#10b981" />
                </marker>
                <marker id="arrow-karina" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 1.5 L 10 5 L 0 8.5 z" fill="#d97706" />
                </marker>
              </defs>

              {/* ================= LEFT SIDE LEADER LINES & TARGET PIN DOTS ================= */}
              
              {/* 1. Cartilagines Tracheales (Teal) */}
              <path 
                d="M 230 182 L 300 182 L 338 196" 
                {...getLineStyle('kartilago-trakea', '#0d9488')}
                markerEnd={activeId === 'kartilago-trakea' || hoveredId === 'kartilago-trakea' ? 'url(#arrow-kartilago-trakea)' : 'url(#arrow-normal)'}
              />
              {renderTargetDot('kartilago-trakea', 344, 198, '#0d9488')}

              {/* 2. Ligamenta Annularia (Green) */}
              <path 
                d="M 230 302 L 300 302 L 340 234" 
                {...getLineStyle('ligamenta-annularia', '#10b981')}
                markerEnd={activeId === 'ligamenta-annularia' || hoveredId === 'ligamenta-annularia' ? 'url(#arrow-ligamenta-annularia)' : 'url(#arrow-normal)'}
              />
              {renderTargetDot('ligamenta-annularia', 346, 230, '#10b981')}

              {/* ================= RIGHT SIDE LEADER LINES & REGIONAL BRACKETS ================= */}

              {/* 3. Trachea, Pars Cervicalis Bracket */}
              <path 
                d="M 412 110 L 417 110 L 417 200 L 412 200" 
                stroke={cervicalActive ? '#0284c7' : '#94a3b8'} 
                strokeWidth={cervicalActive ? 3 : 1.5} 
                fill="none" 
                style={{ transition: 'all 0.2s ease' }}
              />
              <line 
                x1="417" y1="155" x2="425" y2="155" 
                stroke={cervicalActive ? '#0284c7' : '#94a3b8'} 
                strokeWidth={cervicalActive ? 3 : 1.5} 
                style={{ transition: 'all 0.2s ease' }} 
              />
              <path 
                d="M 425 155 L 480 142 L 570 142" 
                {...getLineStyle('trachea-pars-cervicalis', '#0284c7')} 
              />

              {/* 4. Trachea, Pars Thoracica Bracket */}
              <path 
                d="M 412 208 L 417 208 L 417 385 L 412 385" 
                stroke={thoracicActive ? '#0369a1' : '#94a3b8'} 
                strokeWidth={thoracicActive ? 3 : 1.5} 
                fill="none" 
                style={{ transition: 'all 0.2s ease' }}
              />
              <line 
                x1="417" y1="295" x2="425" y2="295" 
                stroke={thoracicActive ? '#0369a1' : '#94a3b8'} 
                strokeWidth={thoracicActive ? 3 : 1.5} 
                style={{ transition: 'all 0.2s ease' }} 
              />
              <path 
                d="M 425 295 L 480 282 L 570 282" 
                {...getLineStyle('trachea-pars-thoracica', '#0369a1')} 
              />

              {/* 5. Bifurcatio Trachea (Amber) */}
              <path 
                d="M 570 387 L 480 387 L 406 406" 
                {...getLineStyle('karina', '#d97706')}
                markerEnd={activeId === 'karina' || hoveredId === 'karina' ? 'url(#arrow-karina)' : 'url(#arrow-normal)'}
              />
              {renderTargetDot('karina', 400, 408, '#d97706')}

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
            src="https://sketchfab.com/models/5604db883bd640c8b90838bb787340bd/embed"
            style={{ width: '100%', height: '100%', border: '0', display: 'block' }}
          />

          {/* Floating Fullscreen Toggle Button in bottom right */}
          <button 
            className="floating-fullscreen-btn"
            onClick={() => setIsFullscreen()}
            title={isFullscreen ? (lang === 'id' ? 'Keluar Layar Penuh' : 'Exit Fullscreen') : (lang === 'id' ? 'Layar Penuh' : 'Fullscreen')}
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
              {lang === 'id' ? 'Sketchfab: Anatomi Trakea 3D' : 'Sketchfab: 3D Trachea Anatomy'}
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
        .diag-label-btn.active.teal { background: #0d9488; border-color: #0d9488; }
        .diag-label-btn.active.green { background: #10b981; border-color: #10b981; }
        .diag-label-btn.active.blue { background: #0284c7; border-color: #0284c7; }
        .diag-label-btn.active.darkblue { background: #0369a1; border-color: #0369a1; }
        .diag-label-btn.active.amber { background: #d97706; border-color: #d97706; }

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
