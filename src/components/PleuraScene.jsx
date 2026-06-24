import React, { useState, useMemo, useEffect, useRef } from 'react';
import { BookOpen, Maximize2, Minimize2 } from 'lucide-react';
import { partData } from '../data/partData';
import { playChime } from '../utils/audioSpeech';

export default function PleuraScene({
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
  const [activeTab, setActiveTab] = useState('diagram'); // For mobile tabs: 'diagram' or 'canvas'
  const [hoveredId, setHoveredId] = useState(null);

  // States for collapsible/floating 2D diagram card (matches PulmoScene.jsx/Trachea format)
  const [isDiagramCollapsed, setIsDiagramCollapsed] = useState(false);
  const [isDiagramOpen, setIsDiagramOpen] = useState(true);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth > 1024);
  const [position, setPosition] = useState({ x: 20, y: 130 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const [size, setSize] = useState({ width: 380, height: 490 });
  const [isResizing, setIsResizing] = useState(false);
  const resizeStart = useRef({ x: 0, y: 0, w: 0, h: 0 });

  // Filter parts specifically for this segment
  const pleuraParts = useMemo(() => {
    return partData.filter(p => p.layer.id === 'Pleura & Cavitas Pleuralis');
  }, []);

  // Sync notice when active item changes
  useEffect(() => {
    if (activePart && activePart.layer.id === 'Pleura & Cavitas Pleuralis') {
      const desc = activePart.short[lang] || activePart.short.id;
      setNotice(desc);
    }
  }, [activePart, lang, setNotice]);

  const isHighlighted = (id) => {
    return activeId === id || hoveredId === id;
  };

  const getLineStyle = (id, color) => {
    const active = isHighlighted(id);
    return {
      stroke: active ? color : '#94a3b8',
      strokeWidth: active ? 2.5 : 1.2,
      fill: 'none',
      strokeDasharray: active ? 'none' : '4,4',
      style: { transition: 'all 0.2s ease' }
    };
  };

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

  const renderTargetDot = (id, tx, ty, color) => {
    const active = isHighlighted(id);
    return (
      <g 
        style={{ cursor: 'pointer', pointerEvents: 'auto' }}
        onClick={() => { onSelect(id); playChime('click'); }}
        onMouseEnter={() => setHoveredId(id)}
        onMouseLeave={() => setHoveredId(null)}
      >
        {active && (
          <circle
            cx={tx}
            cy={ty}
            r={11}
            fill={color}
            opacity={0.24}
            style={{ animation: 'pulse 1.8s infinite' }}
          />
        )}
        <circle
          cx={tx}
          cy={ty}
          r={5.5}
          fill={active ? color : '#64748b'}
          stroke="#ffffff"
          strokeWidth={1.5}
          style={{ transition: 'all 0.25s ease' }}
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

  const renderSVGDiagram = () => {
    return (
      <svg
        viewBox="0 0 552 863"
        style={{ width: '100%', height: 'auto', display: 'block', userSelect: 'none', background: '#ffffff' }}
      >
        <defs>
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

        {/* Background image4.jpeg */}
        <image 
          href="/references/image4.jpeg" 
          x="0" 
          y="0" 
          width="552" 
          height="863" 
        />

        {/* Left Arrow (Parietalis) - Perfectly horizontal at y=60 */}
        <line 
          x1="130" y1="60" x2="140" y2="60" 
          stroke={isHighlighted('pleura-parietalis') ? '#16a34a' : '#64748b'}
          strokeWidth={isHighlighted('pleura-parietalis') ? 2.5 : 1.2}
          markerStart={isHighlighted('pleura-parietalis') ? "url(#arrow-left-active)" : "url(#arrow-left-normal)"}
          style={{ transition: 'all 0.2s ease', color: '#16a34a' }}
        />

        {/* Left Arrow (Cavitas) - Perfectly horizontal at y=120 */}
        <line 
          x1="130" y1="120" x2="145" y2="120" 
          stroke={isHighlighted('cavitas-pleuralis') ? '#22c55e' : '#64748b'}
          strokeWidth={isHighlighted('cavitas-pleuralis') ? 2.5 : 1.2}
          markerStart={isHighlighted('cavitas-pleuralis') ? "url(#arrow-left-active)" : "url(#arrow-left-normal)"}
          style={{ transition: 'all 0.2s ease', color: '#22c55e' }}
        />

        {/* Right Arrow (Visceralis) - Perfectly horizontal at y=120 */}
        <line 
          x1="160" y1="120" x2="370" y2="120" 
          stroke={isHighlighted('pleura-visceralis') ? '#15803d' : '#64748b'}
          strokeWidth={isHighlighted('pleura-visceralis') ? 2.5 : 1.2}
          markerEnd={isHighlighted('pleura-visceralis') ? "url(#arrow-right-active)" : "url(#arrow-right-normal)"}
          style={{ transition: 'all 0.2s ease', color: '#15803d' }}
        />

        {/* Hotspots */}
        {renderSvgHotspot('pleura-parietalis', 140, 60, '#16a34a')}
        {renderSvgHotspot('cavitas-pleuralis', 145, 120, '#22c55e')}
        {renderSvgHotspot('pleura-visceralis', 160, 120, '#15803d')}

        {/* Interactive Label Cards (positioned exactly on top of pre-printed texts) */}
        {renderSvgLabel('pleura-parietalis', 10, 42, 120, 36, lang === 'id' ? 'Pleura Parietalis' : 'Parietal Pleura', '#16a34a')}
        {renderSvgLabel('cavitas-pleuralis', 10, 102, 120, 36, lang === 'id' ? 'Cavitas Pleuralis' : 'Pleural Cavity', '#22c55e')}
        {renderSvgLabel('pleura-visceralis', 370, 102, 120, 36, lang === 'id' ? 'Pleura Visceralis' : 'Visceral Pleura', '#15803d')}
      </svg>
    );
  };

  return (
    <div className="segment-scene-container" style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: '#ffffff', position: 'relative' }}>
      
      {/* Mobile Tab Selector (Visible only on screens <= 1024px) */}
      <div className="trachea-tab-selector" style={{ background: '#ffffff', borderBottom: '1px solid #cbd5e1', padding: '6px' }}>
        <button 
          className={`trachea-tab-btn ${activeTab === 'diagram' ? 'active' : ''}`}
          onClick={() => { setActiveTab('diagram'); playChime('click'); }}
          style={{
            flex: 1,
            padding: '8px',
            fontSize: '12px',
            fontWeight: '700',
            borderRadius: '8px',
            textAlign: 'center',
            background: activeTab === 'diagram' ? '#f0f6ff' : 'transparent',
            color: activeTab === 'diagram' ? '#0284c7' : '#64748b',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          <BookOpen size={14} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '6px' }} />
          <span>{lang === 'id' ? 'Diagram Label' : 'Labeled Diagram'}</span>
        </button>
        <button 
          className={`trachea-tab-btn ${activeTab === 'canvas' ? 'active' : ''}`}
          onClick={() => { setActiveTab('canvas'); playChime('click'); }}
          style={{
            flex: 1,
            padding: '8px',
            fontSize: '12px',
            fontWeight: '700',
            borderRadius: '8px',
            textAlign: 'center',
            background: activeTab === 'canvas' ? '#f0f6ff' : 'transparent',
            color: activeTab === 'canvas' ? '#0284c7' : '#64748b',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          <BookOpen size={14} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '6px' }} />
          <span>{lang === 'id' ? 'Visualisasi Utama' : 'Main View'}</span>
        </button>
      </div>

      {/* Main Split-Screen Layout Container */}
      <div className="trachea-split-container" style={{ display: 'flex', flexGrow: 1, overflow: 'hidden', position: 'relative', width: '100%', height: '100%' }}>
        
        {/* Mobile Diagram View (only visible on mobile when tab is 'diagram') */}
        {!isDesktop && activeTab === 'diagram' && (
          <div style={{ width: '100%', height: '100%', overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <h4 style={{ margin: '0 0 12px 0', fontSize: '13px', fontWeight: '800', color: '#1e293b', textAlign: 'center' }}>
              {lang === 'id' ? 'DIAGRAM INTERAKTIF PLEURA & CAVITAS' : 'INTERACTIVE PLEURA & CAVITY DIAGRAM'}
            </h4>
            <div style={{ width: '100%', maxWidth: '340px' }}>
              {renderSVGDiagram()}
            </div>
            <p style={{ margin: '14px 0 0 0', fontSize: '10px', color: '#64748b', textAlign: 'center', lineHeight: '1.4' }}>
              {lang === 'id' 
                ? 'Klik/ketuk nama label di atas atau area diagram untuk menyorot bagian tersebut.' 
                : 'Click/tap the labels above or the diagram regions to select and view description.'}
            </p>
          </div>
        )}

        {/* 3D Model Pane (Desktop occupies 100%, Mobile occupies 100% when activeTab is 'canvas') */}
        {(isDesktop || activeTab === 'canvas') && (
          <div 
            className="trachea-3d-pane"
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#ffffff',
              position: 'relative'
            }}
          >
            {/* Toggle 2D Diagram Button (Desktop only) */}
            {isDesktop && (
              <button 
                className="floating-camera-reset-btn"
                style={{ left: '16px' }}
                onClick={() => { setIsDiagramOpen(!isDiagramOpen); playChime('click'); }}
                title={isDiagramOpen ? (lang === 'id' ? 'Sembunyikan Diagram 2D' : 'Hide 2D Diagram') : (lang === 'id' ? 'Tampilkan Diagram 2D' : 'Show 2D Diagram')}
              >
                <BookOpen size={13} />
                <span>{isDiagramOpen ? (lang === 'id' ? 'Sembunyikan Diagram' : 'Hide Diagram') : (lang === 'id' ? 'Tampilkan Diagram' : 'Show Diagram')}</span>
              </button>
            )}

            {/* Centered Image Container with 4:3 wrapper */}
            <div style={{
              position: 'relative',
              height: '100%',
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#eaeff5',
              borderRadius: '12px',
              overflow: 'hidden'
            }}>
              <div 
                onClick={(e) => {
                  if (e.target.tagName === 'IMG' || e.target.tagName === 'svg') {
                    playChime('click');
                    if (activeId === 'pleura-visceralis') {
                      onSelect('pleura-parietalis');
                    } else if (activeId === 'pleura-parietalis') {
                      onSelect('cavitas-pleuralis');
                    } else {
                      onSelect('pleura-visceralis');
                    }
                  }
                }}
                style={{
                  position: 'relative',
                  height: '100%',
                  aspectRatio: '552 / 863',
                  background: '#ffffff',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                  cursor: 'pointer'
                }}
              >
                <img 
                  src="/references/image4.jpeg" 
                  alt="Pleura Diagram"
                  style={{
                    width: '100%',
                    height: '100%',
                    display: 'block',
                    pointerEvents: 'none',
                    userSelect: 'none'
                  }}
                />

                {/* SVG Overlay for interactive targets and labels in main view */}
                {showLabels && (
                  <svg 
                    viewBox="0 0 552 863" 
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      pointerEvents: 'none',
                      zIndex: 10
                    }}
                  >
                    <defs>
                      <marker id="arrow-main-left-normal" viewBox="0 0 10 10" refX="2" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
                        <path d="M 10 1.5 L 0 5 L 10 8.5 z" fill="#64748b" />
                      </marker>
                      <marker id="arrow-main-left-active" viewBox="0 0 10 10" refX="2" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
                        <path d="M 10 1.5 L 0 5 L 10 8.5 z" fill="currentColor" />
                      </marker>
                      <marker id="arrow-main-right-normal" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto">
                        <path d="M 0 1.5 L 10 5 L 0 8.5 z" fill="#64748b" />
                      </marker>
                      <marker id="arrow-main-right-active" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto">
                        <path d="M 0 1.5 L 10 5 L 0 8.5 z" fill="currentColor" />
                      </marker>
                    </defs>

                    {/* Left Arrow (Parietalis) - Perfectly horizontal at y=60 */}
                    <line 
                      x1="130" y1="60" x2="140" y2="60" 
                      stroke={isHighlighted('pleura-parietalis') ? '#16a34a' : '#64748b'}
                      strokeWidth={isHighlighted('pleura-parietalis') ? 2.5 : 1.2}
                      markerStart={isHighlighted('pleura-parietalis') ? "url(#arrow-main-left-active)" : "url(#arrow-main-left-normal)"}
                      style={{ transition: 'all 0.2s ease', color: '#16a34a' }}
                    />

                    {/* Left Arrow (Cavitas) - Perfectly horizontal at y=120 */}
                    <line 
                      x1="130" y1="120" x2="145" y2="120" 
                      stroke={isHighlighted('cavitas-pleuralis') ? '#22c55e' : '#64748b'}
                      strokeWidth={isHighlighted('cavitas-pleuralis') ? 2.5 : 1.2}
                      markerStart={isHighlighted('cavitas-pleuralis') ? "url(#arrow-main-left-active)" : "url(#arrow-main-left-normal)"}
                      style={{ transition: 'all 0.2s ease', color: '#22c55e' }}
                    />

                    {/* Right Arrow (Visceralis) - Perfectly horizontal at y=120 */}
                    <line 
                      x1="160" y1="120" x2="370" y2="120" 
                      stroke={isHighlighted('pleura-visceralis') ? '#15803d' : '#64748b'}
                      strokeWidth={isHighlighted('pleura-visceralis') ? 2.5 : 1.2}
                      markerEnd={isHighlighted('pleura-visceralis') ? "url(#arrow-main-right-active)" : "url(#arrow-main-right-normal)"}
                      style={{ transition: 'all 0.2s ease', color: '#15803d' }}
                    />

                    {/* Hotspots */}
                    {renderSvgHotspot('pleura-parietalis', 140, 60, '#16a34a')}
                    {renderSvgHotspot('cavitas-pleuralis', 145, 120, '#22c55e')}
                    {renderSvgHotspot('pleura-visceralis', 160, 120, '#15803d')}

                    {/* Interactive Label Cards (positioned exactly on top of pre-printed texts) */}
                    {renderSvgLabel('pleura-parietalis', 10, 42, 120, 36, lang === 'id' ? 'Pleura Parietalis' : 'Parietal Pleura', '#16a34a')}
                    {renderSvgLabel('cavitas-pleuralis', 10, 102, 120, 36, lang === 'id' ? 'Cavitas Pleuralis' : 'Pleural Cavity', '#22c55e')}
                    {renderSvgLabel('pleura-visceralis', 370, 102, 120, 36, lang === 'id' ? 'Pleura Visceralis' : 'Visceral Pleura', '#15803d')}
                  </svg>
                )}
              </div>

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
                <BookOpen size={13} />
                <span>
                  {lang === 'id' ? 'Lokal: Diagram Pleura & Rongga Paru' : 'Local: Pleura & Pleural Cavity Diagram'}
                </span>
              </div>

              {/* Floating Fullscreen Toggle Button in bottom right */}
              <button 
                className="floating-fullscreen-btn"
                onClick={() => { setIsFullscreen(); playChime('click'); }}
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
                    <span>{lang === 'id' ? 'Diagram 2D Pleura' : '2D Pleura Diagram'}</span>
                  </div>
                  <button 
                    onClick={() => { setIsDiagramOpen(false); playChime('click'); }}
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
                      {lang === 'id' ? 'DIAGRAM INTERAKTIF PLEURA & CAVITAS' : 'INTERACTIVE PLEURA & CAVITY DIAGRAM'}
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
        )}

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
