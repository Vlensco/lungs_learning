import React, { useState, useMemo, useEffect, useRef, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Html, Environment, ContactShadows } from '@react-three/drei';
import { Rotate3D, BookOpen, Maximize2, Minimize2, RefreshCw } from 'lucide-react';
import * as THREE from 'three';
import LungsModel from './LungsModel';
import { partData } from '../data/partData';

function Loader() {
  return (
    <Html center>
      <div className="loader-card">
        <div className="loader-orb" style={{ margin: '0 auto 12px auto' }} />
        <p style={{ fontSize: '11px', fontWeight: '700', color: '#64748b', textAlign: 'center' }}>
          Loading 3D Model...
        </p>
      </div>
    </Html>
  );
}

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
  const controlsRef = useRef(null);

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

  const partsList = [
    {
      id: 'pleura-parietalis',
      color: '#16a34a', // Green
      name: { id: 'Pleura Parietalis', en: 'Parietal Pleura' },
      x: 60,
      y: 250,
      targetX: 280,
      targetY: 310,
      badgeClass: 'green-badge'
    },
    {
      id: 'cavitas-pleuralis',
      color: '#22c55e', // Light Green
      name: { id: 'Cavitas Pleuralis', en: 'Pleural Cavity' },
      x: 60,
      y: 330,
      targetX: 295,
      targetY: 360,
      badgeClass: 'lightgreen-badge'
    },
    {
      id: 'pleura-visceralis',
      color: '#15803d', // Dark Green
      name: { id: 'Pleura Visceralis', en: 'Visceral Pleura' },
      x: 550,
      y: 280,
      targetX: 480,
      targetY: 320,
      badgeClass: 'darkgreen-badge'
    }
  ];

  const handleResetRotation = () => {
    if (controlsRef.current) {
      controlsRef.current.reset();
    }
  };

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

  const renderTargetDot = (id, tx, ty, color) => {
    const active = isHighlighted(id);
    return (
      <g 
        style={{ cursor: 'pointer', pointerEvents: 'auto' }}
        onClick={() => onSelect(id)}
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

  // Renders the high-fidelity 2D interactive vector diagram
  const render2DDiagram = () => {
    return (
      <svg
        viewBox="0 0 340 380"
        className="pleura-2d-svg"
        style={{ width: '100%', height: 'auto', display: 'block', overflow: 'visible' }}
      >
        <defs>
          {/* Shadow Filter for Zoom Lens */}
          <filter id="shadow" x="-10%" y="-10%" width="130%" height="130%">
            <feDropShadow dx="0" dy="4" stdDeviation="5" floodOpacity="0.16" />
          </filter>

          {/* Gradients */}
          <linearGradient id="lungGradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#fae8ff" />
            <stop offset="100%" stopColor="#fbcfe8" />
          </linearGradient>
          <linearGradient id="diaphragmGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f97316" />
            <stop offset="100%" stopColor="#ea580c" />
          </linearGradient>

          {/* Magnifier Glass Clip Path */}
          <clipPath id="magnifierClip">
            <circle cx="130" cy="95" r="45" />
          </clipPath>
        </defs>

        {/* ================= MAIN ANATOMY BACKGROUND ================= */}
        
        {/* Vertebral column representation at bottom center */}
        <rect x="158" y="280" width="24" height="40" rx="4" fill="#cbd5e1" opacity={0.6} />
        <circle cx="170" cy="290" r="8" fill="#94a3b8" opacity={0.5} />
        <circle cx="170" cy="315" r="8" fill="#94a3b8" opacity={0.5} />

        {/* Diaphragma at the bottom */}
        <path
          d="M 60 300 Q 115 250 170 258 Q 225 250 280 300 L 280 315 Q 225 265 170 273 Q 115 265 60 315 Z"
          fill="url(#diaphragmGradient)"
          stroke="#c2410c"
          strokeWidth={0.8}
        />
        <text x="170" y="305" textAnchor="middle" fill="#ffffff" fontSize="9px" fontWeight="600" opacity={0.8} style={{ userSelect: 'none' }}>
          {lang === 'id' ? 'DIAPHRAGMA' : 'DIAPHRAGM'}
        </text>

        {/* Trachea & main bronchi behind for visual reference */}
        <path d="M 166 120 L 166 160 L 140 180 M 174 120 L 174 160 L 200 180" stroke="#cbd5e1" strokeWidth={5} fill="none" strokeLinecap="round" opacity={0.7} />

        {/* Heart shadow in mediastinum */}
        <path d="M 150 175 Q 170 165 190 175 Q 200 205 180 235 Q 165 240 150 230 Z" fill="#fda4af" opacity={0.3} />

        {/* 1. Lungs outline (acts as base for Pleura Visceralis highlight) */}
        {/* Right Lung (viewer's left) */}
        <path
          d="M 124 135 C 124 115, 88 115, 78 145 C 68 175, 62 215, 66 242 C 70 262, 114 265, 124 250 Z"
          fill="url(#lungGradient)"
          stroke={isHighlighted('pleura-visceralis') ? '#15803d' : '#94a3b8'}
          strokeWidth={isHighlighted('pleura-visceralis') ? 2.5 : 1.2}
          style={{ transition: 'all 0.2s ease', cursor: 'pointer' }}
          onClick={() => onSelect('pleura-visceralis')}
          onMouseEnter={() => setHoveredId('pleura-visceralis')}
          onMouseLeave={() => setHoveredId(null)}
        />
        
        {/* Left Lung (viewer's right) */}
        <path
          d="M 152 135 C 152 115, 188 115, 198 145 C 208 175, 214 215, 210 242 C 206 262, 162 265, 152 250 Z"
          fill="url(#lungGradient)"
          stroke={isHighlighted('pleura-visceralis') ? '#15803d' : '#94a3b8'}
          strokeWidth={isHighlighted('pleura-visceralis') ? 2.5 : 1.2}
          style={{ transition: 'all 0.2s ease', cursor: 'pointer' }}
          onClick={() => onSelect('pleura-visceralis')}
          onMouseEnter={() => setHoveredId('pleura-visceralis')}
          onMouseLeave={() => setHoveredId(null)}
        />

        {/* 2. Pleura Parietalis outer layer line */}
        {/* Right Lung outer border */}
        <path
          d="M 128 131 C 128 108, 82 108, 72 140 C 60 173, 56 220, 61 249 C 66 270, 114 274, 129 258 Z"
          fill="none"
          stroke={isHighlighted('pleura-parietalis') ? '#16a34a' : '#cbd5e1'}
          strokeWidth={isHighlighted('pleura-parietalis') ? 3.0 : 1.5}
          style={{ transition: 'all 0.2s ease', cursor: 'pointer' }}
          onClick={() => onSelect('pleura-parietalis')}
          onMouseEnter={() => setHoveredId('pleura-parietalis')}
          onMouseLeave={() => setHoveredId(null)}
        />
        {/* Left Lung outer border */}
        <path
          d="M 148 131 C 148 108, 194 108, 204 140 C 216 173, 220 220, 215 249 C 210 270, 162 274, 147 258 Z"
          fill="none"
          stroke={isHighlighted('pleura-parietalis') ? '#16a34a' : '#cbd5e1'}
          strokeWidth={isHighlighted('pleura-parietalis') ? 3.0 : 1.5}
          style={{ transition: 'all 0.2s ease', cursor: 'pointer' }}
          onClick={() => onSelect('pleura-parietalis')}
          onMouseEnter={() => setHoveredId('pleura-parietalis')}
          onMouseLeave={() => setHoveredId(null)}
        />

        {/* 3. Cavitas Pleuralis (the space in between) interactive overlay */}
        {/* Right pleural cavity */}
        <path
          d="M 128 131 C 128 108, 82 108, 72 140 C 60 173, 56 220, 61 249 C 66 270, 114 274, 129 258 Z
             L 124 250 C 114 265, 70 262, 66 242 C 62 215, 68 175, 78 145 C 88 115, 124 115, 124 135 Z"
          fill={isHighlighted('cavitas-pleuralis') ? 'rgba(34, 197, 94, 0.28)' : 'rgba(34, 197, 94, 0.08)'}
          style={{ transition: 'all 0.2s ease', cursor: 'pointer' }}
          onClick={() => onSelect('cavitas-pleuralis')}
          onMouseEnter={() => setHoveredId('cavitas-pleuralis')}
          onMouseLeave={() => setHoveredId(null)}
        />
        {/* Left pleural cavity */}
        <path
          d="M 148 131 C 148 108, 194 108, 204 140 C 216 173, 220 220, 215 249 C 210 270, 162 274, 147 258 Z
             L 152 250 C 162 265, 206 262, 210 242 C 214 215, 208 175, 198 145 C 188 115, 152 115, 152 135 Z"
          fill={isHighlighted('cavitas-pleuralis') ? 'rgba(34, 197, 94, 0.28)' : 'rgba(34, 197, 94, 0.08)'}
          style={{ transition: 'all 0.2s ease', cursor: 'pointer' }}
          onClick={() => onSelect('cavitas-pleuralis')}
          onMouseEnter={() => setHoveredId('cavitas-pleuralis')}
          onMouseLeave={() => setHoveredId(null)}
        />


        {/* ================= MAGNIFIER ZOOM GLASS CALLOUT ================= */}
        
        {/* 1. Zoom Target ring on the right lung's outer chest border */}
        <circle
          cx="65"
          cy="200"
          r="8"
          fill="none"
          stroke="#0284c7"
          strokeWidth={1.5}
          strokeDasharray="2,2"
        />

        {/* 2. Projection Lines (magnifying cone) from target to bubble */}
        <line
          x1="58"
          y1="195"
          x2="85"
          y2="95"
          stroke="#0284c7"
          strokeWidth={0.8}
          opacity={0.6}
        />
        <line
          x1="73"
          y1="200"
          x2="130"
          y2="140"
          stroke="#0284c7"
          strokeWidth={0.8}
          opacity={0.6}
        />

        {/* 3. Magnified View Container (with ClipPath applied) */}
        <g clipPath="url(#magnifierClip)">
          <rect x="80" y="45" width="100" height="100" fill="#ffffff" />
          
          {/* Rib cage / Chest wall blocks on the left of magnifier */}
          <path d="M 80 50 C 95 50, 95 62, 80 65" fill="#e6dfd5" stroke="#94a3b8" strokeWidth={0.8} />
          <path d="M 80 75 C 95 75, 95 87, 80 90" fill="#e6dfd5" stroke="#94a3b8" strokeWidth={0.8} />
          <path d="M 80 100 C 95 100, 95 112, 80 115" fill="#e6dfd5" stroke="#94a3b8" strokeWidth={0.8} />
          <path d="M 80 125 C 95 125, 95 137, 80 140" fill="#e6dfd5" stroke="#94a3b8" strokeWidth={0.8} />
          <rect x="80" y="45" width="15" height="100" fill="#fda4af" opacity={0.4} /> {/* Intercostal muscle */}

          {/* Pleura Parietalis (thick outer layer) */}
          <path
            d="M 100 45 Q 102 95 100 145"
            fill="none"
            stroke={isHighlighted('pleura-parietalis') ? '#16a34a' : '#94a3b8'}
            strokeWidth={isHighlighted('pleura-parietalis') ? 6.5 : 3.0}
            style={{ transition: 'all 0.2s ease', cursor: 'pointer' }}
            onClick={() => onSelect('pleura-parietalis')}
            onMouseEnter={() => setHoveredId('pleura-parietalis')}
            onMouseLeave={() => setHoveredId(null)}
          />

          {/* Cavitas Pleuralis (middle fluid layer) */}
          <path
            d="M 100 45 Q 102 95 100 145 L 120 145 Q 122 95 120 45 Z"
            fill={isHighlighted('cavitas-pleuralis') ? 'rgba(34, 197, 94, 0.42)' : 'rgba(34, 197, 94, 0.15)'}
            style={{ transition: 'all 0.2s ease', cursor: 'pointer' }}
            onClick={() => onSelect('cavitas-pleuralis')}
            onMouseEnter={() => setHoveredId('cavitas-pleuralis')}
            onMouseLeave={() => setHoveredId(null)}
          />

          {/* Pleura Visceralis (thick inner layer) */}
          <path
            d="M 120 45 Q 122 95 120 145"
            fill="none"
            stroke={isHighlighted('pleura-visceralis') ? '#15803d' : '#94a3b8'}
            strokeWidth={isHighlighted('pleura-visceralis') ? 6.5 : 3.0}
            style={{ transition: 'all 0.2s ease', cursor: 'pointer' }}
            onClick={() => onSelect('pleura-visceralis')}
            onMouseEnter={() => setHoveredId('pleura-visceralis')}
            onMouseLeave={() => setHoveredId(null)}
          />

          {/* Lungs Tissue on the right side of magnifier */}
          <path
            d="M 120 45 Q 122 95 120 145 L 180 145 L 180 45 Z"
            fill="url(#lungGradient)"
            opacity={0.85}
          />
          {/* Subtle alveoli circles in lung tissue */}
          <circle cx="138" cy="65" r="3" fill="#fda4af" opacity={0.5} />
          <circle cx="150" cy="80" r="4" fill="#fda4af" opacity={0.5} />
          <circle cx="135" cy="100" r="3" fill="#fda4af" opacity={0.5} />
          <circle cx="148" cy="115" r="4" fill="#fda4af" opacity={0.5} />
        </g>

        {/* 4. Magnifier Frame border (glass style) */}
        <circle
          cx="130"
          cy="95"
          r="45"
          fill="none"
          stroke="#0284c7"
          strokeWidth={3}
          style={{ filter: 'url(#shadow)' }}
        />


        {/* ================= DIAGRAM LABELS AND LEADERS ================= */}
        
        {/* Label 1: Pleura Parietalis */}
        <g
          style={{ cursor: 'pointer', pointerEvents: 'auto' }}
          onClick={() => onSelect('pleura-parietalis')}
          onMouseEnter={() => setHoveredId('pleura-parietalis')}
          onMouseLeave={() => setHoveredId(null)}
        >
          {/* Leader line arrow */}
          <path
            d="M 72 38 L 94 38 L 99 65"
            fill="none"
            stroke={isHighlighted('pleura-parietalis') ? '#16a34a' : '#475569'}
            strokeWidth={isHighlighted('pleura-parietalis') ? 1.8 : 1.0}
            style={{ transition: 'all 0.2s ease' }}
          />
          <polygon
            points="99,65 96,59 102,60"
            fill={isHighlighted('pleura-parietalis') ? '#16a34a' : '#475569'}
          />
          <rect x="5" y="27" width="90" height="18" rx="4" fill={activeId === 'pleura-parietalis' ? '#16a34a' : 'transparent'} style={{ transition: 'all 0.2s ease' }} />
          <text
            x="10"
            y="39"
            fill={activeId === 'pleura-parietalis' ? '#ffffff' : isHighlighted('pleura-parietalis') ? '#16a34a' : '#334155'}
            fontSize="9px"
            fontWeight="700"
            style={{ transition: 'all 0.2s ease', fontFamily: 'inherit' }}
          >
            Pleura Parietalis
          </text>
        </g>

        {/* Label 2: Cavitas Pleuralis */}
        <g
          style={{ cursor: 'pointer', pointerEvents: 'auto' }}
          onClick={() => onSelect('cavitas-pleuralis')}
          onMouseEnter={() => setHoveredId('cavitas-pleuralis')}
          onMouseLeave={() => setHoveredId(null)}
        >
          {/* Leader line arrow */}
          <path
            d="M 72 88 L 100 88 Q 106 88 109 90"
            fill="none"
            stroke={isHighlighted('cavitas-pleuralis') ? '#22c55e' : '#475569'}
            strokeWidth={isHighlighted('cavitas-pleuralis') ? 1.8 : 1.0}
            style={{ transition: 'all 0.2s ease' }}
          />
          <polygon
            points="109,90 103,87 106,93"
            fill={isHighlighted('cavitas-pleuralis') ? '#22c55e' : '#475569'}
          />
          <rect x="5" y="77" width="90" height="18" rx="4" fill={activeId === 'cavitas-pleuralis' ? '#22c55e' : 'transparent'} style={{ transition: 'all 0.2s ease' }} />
          <text
            x="10"
            y="89"
            fill={activeId === 'cavitas-pleuralis' ? '#ffffff' : isHighlighted('cavitas-pleuralis') ? '#22c55e' : '#334155'}
            fontSize="9px"
            fontWeight="700"
            style={{ transition: 'all 0.2s ease', fontFamily: 'inherit' }}
          >
            Cavitas Pleuralis
          </text>
        </g>

        {/* Label 3: Pleura Visceralis */}
        <g
          style={{ cursor: 'pointer', pointerEvents: 'auto' }}
          onClick={() => onSelect('pleura-visceralis')}
          onMouseEnter={() => setHoveredId('pleura-visceralis')}
          onMouseLeave={() => setHoveredId(null)}
        >
          {/* Leader line arrow */}
          <path
            d="M 205 92 L 180 92 L 122 92"
            fill="none"
            stroke={isHighlighted('pleura-visceralis') ? '#15803d' : '#475569'}
            strokeWidth={isHighlighted('pleura-visceralis') ? 1.8 : 1.0}
            style={{ transition: 'all 0.2s ease' }}
          />
          <polygon
            points="122,92 128,95 128,89"
            fill={isHighlighted('pleura-visceralis') ? '#15803d' : '#475569'}
          />
          <rect x="200" y="81" width="90" height="18" rx="4" fill={activeId === 'pleura-visceralis' ? '#15803d' : 'transparent'} style={{ transition: 'all 0.2s ease' }} />
          <text
            x="205"
            y="93"
            fill={activeId === 'pleura-visceralis' ? '#ffffff' : isHighlighted('pleura-visceralis') ? '#15803d' : '#334155'}
            fontSize="9px"
            fontWeight="700"
            style={{ transition: 'all 0.2s ease', fontFamily: 'inherit' }}
          >
            Pleura Visceralis
          </text>
        </g>
      </svg>
    );
  };

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
          className={`trachea-tab-btn ${activeTab === 'canvas' ? 'active' : ''}`}
          onClick={() => setActiveTab('canvas')}
          style={{
            flex: 1,
            padding: '8px',
            fontSize: '12px',
            fontWeight: '700',
            borderRadius: '8px',
            textAlign: 'center',
            background: activeTab === 'canvas' ? '#f0f6ff' : 'transparent',
            color: activeTab === 'canvas' ? '#0284c7' : '#64748b',
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
              {lang === 'id' ? 'DIAGRAM INTERAKTIF PLEURA & CAVITAS' : 'INTERACTIVE PLEURA & CAVITY DIAGRAM'}
            </h3>
            {render2DDiagram()}
            <p style={{ margin: '14px 0 0 0', fontSize: '11px', color: '#64748b', textAlign: 'center', lineHeight: '1.4' }}>
              {lang === 'id' 
                ? 'Klik/ketuk nama label di atas atau area diagram untuk menyorot bagian tersebut.' 
                : 'Click/tap the labels above or the diagram regions to select and view description.'}
            </p>
          </div>
        </div>

        {/* RIGHT COLUMN: 3D CANVAS VIEWER */}
        <div 
          className={`trachea-3d-pane ${activeTab === 'canvas' ? 'mobile-visible' : 'mobile-hidden'}`}
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
          {/* Reset Camera Rotation Button (Placed below top toolbar on desktop) */}
          <button 
            className="floating-camera-reset-btn"
            onClick={handleResetRotation}
            title={lang === 'id' ? 'Kembali ke Rotasi Awal' : 'Reset View Rotation'}
          >
            <RefreshCw size={13} />
            <span>{lang === 'id' ? 'Rotasi Awal' : 'Reset View'}</span>
          </button>

          {/* Inner container forced to 4:3 aspect ratio to guarantee perfect alignment of overlay and Canvas */}
          <div style={{
            position: 'relative',
            height: '100%',
            width: 'auto',
            maxWidth: '100%',
            aspectRatio: '4 / 3',
            background: '#eaeff5',
            borderRadius: '12px',
            overflow: 'hidden'
          }}>

            {/* Three.js Canvas */}
            <div style={{ width: '100%', height: '100%' }}>
              <Canvas
                camera={{ position: [0, 0.58, 2.95], fov: 32 }}
                shadows
                dpr={[1, 2]}
                gl={{ antialias: true, alpha: true }}
              >
                <ambientLight intensity={0.8} />
                <directionalLight position={[2.8, 3.5, 2.4]} intensity={2.2} castShadow />
                <pointLight position={[-2, 1.4, 2.2]} intensity={1.0} color="#cce6ff" />
                
                <Suspense fallback={<Loader />}>
                  <group scale={7.2} position={[0, -1.03, 0]} rotation={[0.02, 0, 0]}>
                    <LungsModel 
                      activePart={activePart}
                      breathingRate={breathingRate}
                      onSurfaceClick={(meshName) => {
                        // Click on the 3D surface selects the current highlighted part or defaults to visceral pleura
                        if (activeId === 'pleura-visceralis') {
                          onSelect('pleura-parietalis');
                        } else if (activeId === 'pleura-parietalis') {
                          onSelect('cavitas-pleuralis');
                        } else {
                          onSelect('pleura-visceralis');
                        }
                      }}
                    />
                  </group>
                  <Environment preset="city" />
                  <ContactShadows position={[0, -1.43, 0]} opacity={0.16} scale={4.2} blur={2.2} far={2} />
                </Suspense>

                <OrbitControls
                  ref={controlsRef}
                  makeDefault
                  enableDamping
                  dampingFactor={0.08}
                  minDistance={1.2}
                  maxDistance={5.0}
                  target={[0, 0.12, 0]}
                />
              </Canvas>
            </div>

            {/* Transparent SVG Overlay (Lines and Labels) */}
            {showLabels && (
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
                  <marker id="arrow-pleura-parietalis" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M 0 1.5 L 10 5 L 0 8.5 z" fill="#16a34a" />
                  </marker>
                  <marker id="arrow-cavitas-pleuralis" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M 0 1.5 L 10 5 L 0 8.5 z" fill="#22c55e" />
                  </marker>
                  <marker id="arrow-pleura-visceralis" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M 0 1.5 L 10 5 L 0 8.5 z" fill="#15803d" />
                  </marker>
                </defs>

                {/* ================= LEADER LINES & TARGET PIN DOTS ================= */}
                
                {/* 1. Pleura Parietalis (Green) */}
                <path 
                  d="M 250 250 L 260 250 L 280 310" 
                  {...getLineStyle('pleura-parietalis', '#16a34a')}
                  markerEnd={isHighlighted('pleura-parietalis') ? 'url(#arrow-pleura-parietalis)' : 'url(#arrow-normal)'}
                />
                {renderTargetDot('pleura-parietalis', 280, 310, '#16a34a')}

                {/* 2. Cavitas Pleuralis (Light Green) */}
                <path 
                  d="M 250 330 L 270 330 L 295 360" 
                  {...getLineStyle('cavitas-pleuralis', '#22c55e')}
                  markerEnd={isHighlighted('cavitas-pleuralis') ? 'url(#arrow-cavitas-pleuralis)' : 'url(#arrow-normal)'}
                />
                {renderTargetDot('cavitas-pleuralis', 295, 360, '#22c55e')}

                {/* 3. Pleura Visceralis (Dark Green) */}
                <path 
                  d="M 550 280 L 510 280 L 480 320" 
                  {...getLineStyle('pleura-visceralis', '#15803d')} 
                  markerEnd={isHighlighted('pleura-visceralis') ? 'url(#arrow-pleura-visceralis)' : 'url(#arrow-normal)'}
                />
                {renderTargetDot('pleura-visceralis', 480, 320, '#15803d')}


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
                        {part.name[lang] || part.name.id}
                      </text>
                    </g>
                  );
                })}
              </svg>
            )}

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
                {lang === 'id' ? 'Lokal: Pleura & Rongga Paru 3D' : 'Local: 3D Pleura & Lungs Anatomy'}
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
