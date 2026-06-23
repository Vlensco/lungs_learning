import React, { useState, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Rotate3D, BookOpen, Maximize2, Minimize2, RefreshCw, Eye, EyeOff } from 'lucide-react';
import { partData } from '../data/partData';
import { playChime } from '../utils/audioSpeech';

export default function PulmoScene({
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
  const [active2DView, setActive2DView] = useState('lateral_kanan'); // 'lateral_kanan', 'medial_kanan', 'diafragma_kanan', 'lateral_kiri', 'medial_kiri'
  const [activeModel, setActiveModel] = useState('dextra'); // 'dextra' (Right Lung), 'sinistra' (Left Lung)
  const [hoveredId, setHoveredId] = useState(null);
  const [isDiagramCollapsed, setIsDiagramCollapsed] = useState(false);
  const [portalTarget, setPortalTarget] = useState(null);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth > 1024);

  // Floating diagram states
  const [isDiagramOpen, setIsDiagramOpen] = useState(true);
  const [position, setPosition] = useState({ x: 20, y: 130 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });

  const [size, setSize] = useState({ width: 380, height: 460 });
  const [isResizing, setIsResizing] = useState(false);
  const resizeStart = useRef({ x: 0, y: 0, w: 0, h: 0 });

  const activeIdRef = useRef(activeId);
  useEffect(() => {
    activeIdRef.current = activeId;
  }, [activeId]);

  const isProgrammaticSelection = useRef(false);

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

  // Locate the DOM portal container when not in fullscreen mode (desktop only)
  useEffect(() => {
    // Disabled portalTarget to keep 2D diagram side-by-side with 3D model in the main content pane
    setPortalTarget(null);
  }, [isFullscreen, isDesktop]);

  const iframeRef = useRef(null);
  const [sketchfabApi, setSketchfabApi] = useState(null);
  const [annotationsList, setAnnotationsList] = useState([]);
  const [apiLoading, setApiLoading] = useState(true);

  // Sync notice when active item changes
  useEffect(() => {
    if (activePart && activePart.layer.id === 'Pulmo') {
      const desc = activePart.short[lang] || activePart.short.id;
      setNotice(desc);
    }
  }, [activePart, lang, setNotice]);

  // If a part is selected elsewhere, automatically switch the 2D view and 3D model to display it!
  useEffect(() => {
    if (activeId) {
      if (
        [
          'lobus-superior-kanan',
          'lobus-medial-kanan',
          'lobus-inferior-kanan',
          'fisura-horizontal-kanan',
          'fisura-oblique-kanan'
        ].includes(activeId)
      ) {
        setActive2DView('lateral_kanan');
        setActiveModel('dextra');
      } else if (
        ['radix-pulmonis', 'hilum-pulmonis', 'ligamentum-pulmonale', 'margo-anterior'].includes(activeId)
      ) {
        if (activeModel === 'dextra') {
          setActive2DView('medial_kanan');
        } else {
          setActive2DView('medial_kiri');
        }
      } else if (['basis-pulmonis', 'margo-inferior'].includes(activeId)) {
        if (activeModel === 'dextra') {
          setActive2DView('diafragma_kanan');
        } else {
          setActive2DView('medial_kiri');
        }
      } else if (
        [
          'lobus-superior-kiri',
          'lobus-inferior-kiri',
          'fisura-oblique-kiri',
          'margo-posterior',
          'incisura-cardiaca',
          'lingula-pulmonis'
        ].includes(activeId)
      ) {
        if (['lobus-superior-kiri', 'lobus-inferior-kiri', 'fisura-oblique-kiri'].includes(activeId)) {
          setActive2DView('lateral_kiri');
        } else {
          setActive2DView('medial_kiri');
        }
        setActiveModel('sinistra');
      }
    }
  }, [activeId]);

  // Sketchfab model definitions
  const models = {
    dextra: {
      id: 'ebbabc25a36c4e1ebab3f7addf707b10',
      embedUrl: 'https://sketchfab.com/models/ebbabc25a36c4e1ebab3f7addf707b10/embed?annotation_tooltip_visible=0&ui_infos=0&ui_watermark=0&ui_help=0&ui_settings=0&ui_inspector=0&transparent=1&annotations_visible=1'
    },
    sinistra: {
      id: '955017951967406b944ce671727e2fbb',
      embedUrl: 'https://sketchfab.com/models/955017951967406b944ce671727e2fbb/embed?annotation_tooltip_visible=0&ui_infos=0&ui_watermark=0&ui_help=0&ui_settings=0&ui_inspector=0&transparent=1&annotations_visible=1'
    }
  };

  // Annotation Index mappings for Sketchfab Model APIs
  const matchAnnotationToPart = (name, index) => {
    const n = name.toLowerCase();
    if (activeModel === 'dextra') {
      // Dextra annotations:
      // Annotation 1-3 inside hilum: 1 is Bronchus, 2 is Arteria, 3 is Vena, 4 is Pulm. Ligament
      if (index === 0) return 'bronkus-kanan'; // Bronchus Principalis
      if (index === 1) return 'arteria-pulmonalis'; // Arteriae Pulmonales
      if (index === 2) return 'vena-pulmonalis'; // Venae Pulmonales
      if (index === 3) return 'ligamentum-pulmonale'; // Ligamentum pulmonale
      if (index === 4) return 'lobus-superior-kanan'; // Lobus superior
      if (index === 5) return 'lobus-medial-kanan'; // Lobus medius
      if (index === 6) return 'lobus-inferior-kanan'; // Lobus inferior
      if (index === 7) return 'fisura-oblique-kanan'; // Fissura obliqua
      if (index === 8) return 'fisura-horizontal-kanan'; // Fissura horizontalis
    } else {
      // Sinistra annotations:
      if (index === 0) return 'bronkus-kiri'; // Bronchus Principalis
      if (index === 1) return 'arteria-pulmonalis'; // Arteria pulmonalis
      if (index === 2) return 'vena-pulmonalis'; // Vena pulmonalis
      if (index === 3) return 'ligamentum-pulmonale'; // Ligamentum pulmonale
      if (index === 4) return 'lobus-superior-kiri'; // Lobus superior
      if (index === 5) return 'lobus-inferior-kiri'; // Lobus inferior
      if (index === 6) return 'fisura-oblique-kiri'; // Fissura obliqua
      if (index === 7) return 'incisura-cardiaca'; // Incisura cardiaca
      if (index === 8) return 'lingula-pulmonis'; // Lingula pulmonis
    }

    // Name fallback
    if (n.includes('superior') && activeModel === 'dextra') return 'lobus-superior-kanan';
    if (n.includes('medius') || n.includes('middle')) return 'lobus-medial-kanan';
    if (n.includes('inferior') && activeModel === 'dextra') return 'lobus-inferior-kanan';
    if (n.includes('superior') && activeModel === 'sinistra') return 'lobus-superior-kiri';
    if (n.includes('inferior') && activeModel === 'sinistra') return 'lobus-inferior-kiri';
    if (n.includes('horizontal')) return 'fisura-horizontal-kanan';
    if (n.includes('oblique') && activeModel === 'dextra') return 'fisura-oblique-kanan';
    if (n.includes('oblique') && activeModel === 'sinistra') return 'fisura-oblique-kiri';
    if (n.includes('ligament')) return 'ligamentum-pulmonale';
    if (n.includes('incisura') || n.includes('notch')) return 'incisura-cardiaca';
    if (n.includes('lingula')) return 'lingula-pulmonis';
    
    return null;
  };

  // Reload/Initialize Sketchfab API
  useEffect(() => {
    setApiLoading(true);
    setSketchfabApi(null);
    setAnnotationsList([]);

    const scriptId = 'sketchfab-viewer-api-script';
    let script = document.getElementById(scriptId);

    const initViewer = () => {
      if (!iframeRef.current || !window.Sketchfab) return;
      const client = new window.Sketchfab(iframeRef.current);
      client.init(models[activeModel].id, {
        success: (api) => {
          api.start();
          api.addEventListener('viewerready', () => {
            setSketchfabApi(api);
            setApiLoading(false);

            // Hide the annotation tooltips (text tags) while preserving number pins
            api.hideAnnotationTooltips((err) => {
              if (err) console.error('Error hiding tooltips:', err);
            });

            api.getAnnotationList((err, annotations) => {
              if (!err && annotations) {
                setAnnotationsList(annotations);
              }
            });
            api.addEventListener('annotationSelect', (index) => {
              if (index !== -1) {
                if (isProgrammaticSelection.current) {
                  isProgrammaticSelection.current = false;
                  return;
                }
                api.getAnnotation(index, (err, ann) => {
                  if (!err && ann) {
                    const currentActiveId = activeIdRef.current;
                    const matchedId = matchAnnotationToPart(ann.name, index);
                    if (matchedId) {
                      // Check if the current selection in React maps to the same annotation index.
                      // If it does, we return early and keep the sub-part selected!
                      const activeIdIndex = currentActiveId ? getAnnotationIndexForPart(currentActiveId) : -1;
                      if (activeIdIndex === index) {
                        return; // Keep the activeId selection
                      }
                      
                      if (matchedId !== currentActiveId) {
                        onSelect(matchedId);
                      }
                    }
                  }
                });
                
                // Show the tooltip for the selected annotation only
                api.showAnnotationTooltip(index, (err) => {
                  if (err) console.error('Error showing tooltip:', err);
                });
              } else {
                // Hide tooltip when deselected
                api.hideAnnotationTooltips((err) => {
                  if (err) console.error('Error hiding tooltip:', err);
                });
              }
            });
          });
        },
        error: () => {
          console.error('Sketchfab loading error');
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
      script.onload = initViewer;
      document.head.appendChild(script);
    } else {
      if (window.Sketchfab) {
        initViewer();
      } else {
        script.onload = initViewer;
      }
    }
  }, [activeModel]);

  // Helper to map part ID (including unpinned ones) to closest Sketchfab annotation index
  const getAnnotationIndexForPart = (partId) => {
    if (activeModel === 'dextra') {
      switch (partId) {
        case 'bronkus-kanan':
        case 'radix-pulmonis':
        case 'hilum-pulmonis':
          return 0; // Focus on Bronchus Principalis pin
        case 'arteria-pulmonalis':
          return 1; // Focus on Arteriae Pulmonales pin
        case 'vena-pulmonalis':
          return 2; // Focus on Venae Pulmonales pin
        case 'ligamentum-pulmonale':
          return 3;
        case 'lobus-superior-kanan':
        case 'apex-pulmonis':
          return 4; // Focus on Superior Lobe pin
        case 'lobus-medial-kanan':
          return 5;
        case 'lobus-inferior-kanan':
        case 'basis-pulmonis':
        case 'margo-inferior':
          return 6; // Focus on Inferior Lobe pin
        case 'fisura-oblique-kanan':
          return 7;
        case 'fisura-horizontal-kanan':
        case 'margo-anterior':
          return 8; // Focus on Horizontal Fissure pin
        default:
          return -1;
      }
    } else {
      switch (partId) {
        case 'bronkus-kiri':
        case 'radix-pulmonis':
        case 'hilum-pulmonis':
          return 0;
        case 'arteria-pulmonalis':
          return 1;
        case 'vena-pulmonalis':
          return 2;
        case 'ligamentum-pulmonale':
          return 3;
        case 'lobus-superior-kiri':
        case 'apex-pulmonis':
          return 4;
        case 'lobus-inferior-kiri':
        case 'basis-pulmonis':
        case 'margo-inferior':
          return 5;
        case 'fisura-oblique-kiri':
          return 6;
        case 'incisura-cardiaca':
        case 'margo-anterior':
          return 7;
        case 'lingula-pulmonis':
          return 8;
        default:
          return -1;
      }
    }
  };

  // Sync Sketchfab annotation selection with activeId
  useEffect(() => {
    if (sketchfabApi && annotationsList.length > 0 && activeId) {
      const index = getAnnotationIndexForPart(activeId);
      if (index !== -1) {
        isProgrammaticSelection.current = true;
        sketchfabApi.gotoAnnotation(index, {}, (err) => {
          if (err) console.error('Error selecting annotation:', err);
        });
      }
    }
  }, [activeId, sketchfabApi, annotationsList]);

  // Auto-rotate 3D camera to match the selected 2D aspect view
  useEffect(() => {
    if (sketchfabApi && annotationsList.length > 0) {
      let index = -1;
      if (active2DView === 'lateral_kanan') index = 4;
      else if (active2DView === 'medial_kanan') index = 0;
      else if (active2DView === 'diafragma_kanan') index = 6;
      else if (active2DView === 'lateral_kiri') index = 4;
      else if (active2DView === 'medial_kiri') index = 0;

      const doesAnnotationMatchView = (annIndex, view) => {
        if (view === 'lateral_kanan') return [4, 5, 7, 8].includes(annIndex);
        if (view === 'medial_kanan') return [0, 1, 2, 3].includes(annIndex);
        if (view === 'diafragma_kanan') return [6].includes(annIndex);
        if (view === 'lateral_kiri') return [4, 5, 6].includes(annIndex);
        if (view === 'medial_kiri') return [0, 1, 2, 3, 7, 8].includes(annIndex);
        return false;
      };

      const activePartIndex = activeId ? getAnnotationIndexForPart(activeId) : -1;
      const isPartMatchingView = activeId && doesAnnotationMatchView(activePartIndex, active2DView);

      // Only auto-rotate if the activeId is not already matching this view aspect
      if (!isPartMatchingView && index !== -1) {
        isProgrammaticSelection.current = true;
        sketchfabApi.gotoAnnotation(index, {}, (err) => {
          if (err) console.error('Error auto-rotating camera:', err);
        });
      }
    }
  }, [active2DView, sketchfabApi, annotationsList]);

  const handleResetRotation = () => {
    if (sketchfabApi) {
      sketchfabApi.recenterCamera(() => {});
    }
  };

  const handleSet2DView = (view) => {
    setActive2DView(view);
    if (view === 'lateral_kiri' || view === 'medial_kiri') {
      setActiveModel('sinistra');
      if (activeId && !activeId.endsWith('-kiri') && !['incisura-cardiaca', 'lingula-pulmonis', 'apex-pulmonis', 'basis-pulmonis', 'margo-inferior', 'hilum-pulmonis', 'radix-pulmonis', 'ligamentum-pulmonale', 'margo-anterior'].includes(activeId)) {
        onSelect(null);
      }
    } else {
      setActiveModel('dextra');
      if (activeId && (activeId.endsWith('-kiri') || ['incisura-cardiaca', 'lingula-pulmonis'].includes(activeId))) {
        onSelect(null);
      }
    }
  };

  const handleSetModel = (model) => {
    setActiveModel(model);
    if (model === 'sinistra') {
      setActive2DView('lateral_kiri');
      if (activeId && !activeId.endsWith('-kiri') && !['incisura-cardiaca', 'lingula-pulmonis', 'apex-pulmonis', 'basis-pulmonis', 'margo-inferior', 'hilum-pulmonis', 'radix-pulmonis', 'ligamentum-pulmonale', 'margo-anterior'].includes(activeId)) {
        onSelect(null);
      }
    } else {
      setActive2DView('lateral_kanan');
      if (activeId && (activeId.endsWith('-kiri') || ['incisura-cardiaca', 'lingula-pulmonis'].includes(activeId))) {
        onSelect(null);
      }
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

  const renderHotspot = (id, top, left, label = '', isPin = false) => {
    const active = isHighlighted(id);
    return (
      <button
        onClick={() => {
          onSelect(id);
          playChime('click');
        }}
        onMouseEnter={() => setHoveredId(id)}
        onMouseLeave={() => setHoveredId(null)}
        style={{
          position: 'absolute',
          top: top,
          left: left,
          transform: 'translate(-50%, -50%)',
          width: isPin ? '30px' : '26px', // Expanded click target area
          height: isPin ? '30px' : '26px', // Expanded click target area
          borderRadius: '50%',
          border: active ? '2.5px solid #0284c7' : '2px solid transparent',
          background: active 
            ? 'rgba(2, 132, 199, 0.25)' 
            : 'rgba(255, 255, 255, 0.05)',
          boxShadow: active 
            ? '0 0 14px rgba(2, 132, 199, 0.8), inset 0 0 8px rgba(2, 132, 199, 0.4)' 
            : 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '10px',
          fontWeight: '800',
          color: active ? '#0284c7' : '#475569',
          outline: 'none',
          transition: 'all 0.2s ease',
          zIndex: active ? 25 : 20
        }}
        title={label}
      >
        {!isPin && (
          <span style={{
            width: '8px', // Slightly larger center dot for visibility
            height: '8px',
            borderRadius: '50%',
            background: active ? '#0284c7' : '#64748b',
            boxShadow: active ? '0 0 8px #0284c7' : 'none',
            display: 'block'
          }} />
        )}
      </button>
    );
  };

  const renderTextLabelHotspot = (id, top, left, width = '100px', height = '22px', label = '') => {
    const active = isHighlighted(id);
    return (
      <button
        onClick={() => {
          onSelect(id);
          playChime('click');
        }}
        onMouseEnter={() => setHoveredId(id)}
        onMouseLeave={() => setHoveredId(null)}
        style={{
          position: 'absolute',
          top: top,
          left: left,
          transform: 'translate(-50%, -50%)',
          width: width,
          height: height,
          borderRadius: '4px',
          border: active ? '1.5px solid #0284c7' : '1.5px solid transparent',
          background: active 
            ? 'rgba(2, 132, 199, 0.12)' 
            : hoveredId === id 
              ? 'rgba(2, 132, 199, 0.05)' 
              : 'transparent',
          cursor: 'pointer',
          outline: 'none',
          transition: 'all 0.15s ease',
          zIndex: active ? 30 : 15,
        }}
        title={label}
      />
    );
  };

  // Renders the 2D SVGs based on selection
  const renderSVG2D = () => {
    if (activeModel === 'dextra') {
      if (active2DView === 'lateral_kanan') {
        return (
          <div style={{ position: 'relative', width: '100%', maxWidth: '100%', margin: '0 auto', userSelect: 'none' }}>
            <img 
              src="/references/pulmo_dextra_lateral.png" 
              alt="Pulmo Dextra Lateral" 
              style={{ width: '100%', height: 'auto', borderRadius: '16px', display: 'block', border: '1px solid #cbd5e1' }}
            />
            {renderHotspot('apex-pulmonis', '7.2%', '47.5%', 'Apex Pulmonis', false)}
            {renderHotspot('lobus-superior-kanan', '36.5%', '51.8%', '5', true)}
            {renderHotspot('fisura-oblique-kanan', '45.5%', '40.2%', '8', true)}
            {renderHotspot('lobus-inferior-kanan', '76.5%', '39%', '7', true)}
            {renderHotspot('fisura-horizontal-kanan', '67.5%', '60.5%', '9', true)}
            {renderHotspot('lobus-medial-kanan', '75.5%', '55.5%', '6', true)}

            {/* Clickable text labels aligned with pulmo_dextra_lateral.png */}
            {renderTextLabelHotspot('fisura-oblique-kanan', '48.2%', '14.9%', '14.1%', '22px', 'Fissura Obliqua')}
            {renderTextLabelHotspot('lobus-inferior-kanan', '80.7%', '12.5%', '19.0%', '22px', 'Lobus Inferior')}
            {renderTextLabelHotspot('apex-pulmonis', '14.7%', '83.8%', '11.8%', '22px', 'Apex Pulmonis')}
            {renderTextLabelHotspot('lobus-superior-kanan', '35.0%', '87.3%', '18.9%', '22px', 'Lobus Superior')}
            {renderTextLabelHotspot('fisura-horizontal-kanan', '61.3%', '86.6%', '17.5%', '22px', 'Fissura Horizontalis')}
            {renderTextLabelHotspot('lobus-medial-kanan', '77.0%', '86.4%', '17.1%', '22px', 'Lobus Medius')}
          </div>
        );
      }
      
      if (active2DView === 'medial_kanan') {
        return (
          <div style={{ position: 'relative', width: '100%', maxWidth: '100%', margin: '0 auto', userSelect: 'none' }}>
            <img 
              src="/references/pulmo_dextra_medial.png" 
              alt="Pulmo Dextra Medial" 
              style={{ width: '100%', height: 'auto', borderRadius: '16px', display: 'block', border: '1px solid #cbd5e1' }}
            />
            {renderHotspot('radix-pulmonis', '24%', '54%', 'Radix Pulmonis', false)}
            {renderHotspot('hilum-pulmonis', '38%', '58%', 'Hilum Pulmonis', false)}
            {renderHotspot('margo-anterior', '39%', '31%', 'Margo Anterior', false)}
            {renderHotspot('arteria-pulmonalis', '47%', '50.8%', '2', true)}
            {renderHotspot('bronkus-kanan', '48.5%', '54.8%', '1', true)}
            {renderHotspot('vena-pulmonalis', '60.5%', '49.5%', '3', true)}
            {renderHotspot('ligamentum-pulmonale', '86.8%', '60.5%', '4', true)}

            {/* Clickable text labels aligned with pulmo_dextra_medial.png */}
            {renderTextLabelHotspot('margo-anterior', '37.4%', '15.5%', '12.9%', '22px', 'Margo Anterior')}
            {renderTextLabelHotspot('arteria-pulmonalis', '46.9%', '14.0%', '15.9%', '22px', 'Arteria Pulmonalis')}
            {renderTextLabelHotspot('vena-pulmonalis', '59.3%', '13.8%', '16.4%', '22px', 'Vena Pulmonalis')}
            {renderTextLabelHotspot('radix-pulmonis', '25.1%', '85.5%', '14.5%', '22px', 'Radix Pulmonis')}
            {renderTextLabelHotspot('hilum-pulmonis', '39.7%', '83.7%', '11.7%', '22px', 'Hilum Pulmonis')}
            {renderTextLabelHotspot('bronkus-kanan', '50.8%', '85.8%', '15.9%', '22px', 'Bronchus Principalis')}
            {renderTextLabelHotspot('ligamentum-pulmonale', '86.9%', '85.1%', '11.5%', '22px', 'Ligamentum Pulmonale')}
          </div>
        );
      }
      
      if (active2DView === 'diafragma_kanan') {
        return (
          <div style={{ position: 'relative', width: '100%', maxWidth: '100%', margin: '0 auto', userSelect: 'none' }}>
            <img 
              src="/references/pulmo_dextra_diafragma.png" 
              alt="Pulmo Dextra Diafragma" 
              style={{ width: '100%', height: 'auto', borderRadius: '16px', display: 'block', border: '1px solid #cbd5e1' }}
            />
            {renderHotspot('basis-pulmonis', '68%', '42%', 'Basis Pulmonis', false)}
            {renderHotspot('margo-inferior', '85%', '41%', 'Margo Inferior', false)}
            {renderHotspot('bronkus-kanan', '25.5%', '37.8%', '1', true)}
            {renderHotspot('arteria-pulmonalis', '27.5%', '34.5%', '2', true)}
            {renderHotspot('vena-pulmonalis', '32.5%', '31.5%', '3', true)}
            {renderHotspot('ligamentum-pulmonale', '33.5%', '43.5%', '4', true)}

            {/* Clickable text labels aligned with pulmo_dextra_diafragma.png */}
            {renderTextLabelHotspot('basis-pulmonis', '66.5%', '88.5%', '21.0%', '22px', 'Basis Pulmonis')}
            {renderTextLabelHotspot('margo-inferior', '91.9%', '89.0%', '16.4%', '22px', 'Margo Inferior')}
          </div>
        );
      }
    } else {
      // Left Lung (Pulmo Sinistra)
      if (active2DView === 'lateral_kiri') {
        return (
          <div style={{ position: 'relative', width: '100%', maxWidth: '100%', margin: '0 auto', userSelect: 'none' }}>
            <img 
              src="/references/pulmo_sinistra_lateral.png" 
              alt="Pulmo Sinistra Lateral" 
              style={{ width: '100%', height: 'auto', borderRadius: '16px', display: 'block', border: '1px solid #cbd5e1' }}
            />
            {renderHotspot('apex-pulmonis', '10%', '45%', 'Apex Pulmonis', false)}
            {renderHotspot('lobus-superior-kiri', '35.9%', '46.6%', '5', true)}
            {renderHotspot('fisura-oblique-kiri', '52.2%', '49.5%', '7', true)}
            {renderHotspot('lobus-inferior-kiri', '67.9%', '54.4%', '6', true)}
            {renderHotspot('basis-pulmonis', '88%', '46%', 'Basis Pulmonis', false)}
            {renderHotspot('margo-inferior', '91%', '44%', 'Margo Inferior', false)}

            {/* Clickable text labels aligned with pulmo_sinistra_lateral.png */}
            {renderTextLabelHotspot('fisura-oblique-kiri', '51.1%', '13.6%', '16.5%', '22px', 'Fissura Obliqua')}
            {renderTextLabelHotspot('lobus-superior-kiri', '37.9%', '85.3%', '14.7%', '32px', 'Lobus Superior')}
            {renderTextLabelHotspot('lobus-inferior-kiri', '70.2%', '87.9%', '19.8%', '32px', 'Lobus Inferior')}
          </div>
        );
      }
      
      if (active2DView === 'medial_kiri') {
        return (
          <div style={{ position: 'relative', width: '100%', maxWidth: '100%', margin: '0 auto', userSelect: 'none' }}>
            <img 
              src="/references/pulmo_sinistra_medial.png" 
              alt="Pulmo Sinistra Medial" 
              style={{ width: '100%', height: 'auto', borderRadius: '16px', display: 'block', border: '1px solid #cbd5e1' }}
            />
            {renderHotspot('apex-pulmonis', '23.9%', '48.6%', 'Apex Pulmonis', false)}
            {renderHotspot('arteria-pulmonalis', '37.7%', '56.5%', '2', true)}
            {renderHotspot('bronkus-kiri', '44.7%', '56.7%', '1', true)}
            {renderHotspot('vena-pulmonalis', '40.3%', '59.9%', '3', true)}
            {renderHotspot('margo-posterior', '61.8%', '51.8%', '4', true)}
            {renderHotspot('incisura-cardiaca', '56.7%', '59.1%', '8', true)}
            {renderHotspot('lingula-pulmonis', '64.0%', '58.8%', '9', true)}
            
            {renderHotspot('radix-pulmonis', '41%', '57%', 'Radix Pulmonis', false)}
            {renderHotspot('hilum-pulmonis', '43%', '58%', 'Hilum Pulmonis', false)}
            {renderHotspot('margo-anterior', '48%', '60%', 'Margo Anterior', false)}
            {renderHotspot('ligamentum-pulmonale', '69.2%', '57.4%', 'Pulmonary Ligament', false)}
            {renderHotspot('basis-pulmonis', '88.3%', '45.5%', 'Basis Pulmonis', false)}
            {renderHotspot('margo-inferior', '91%', '45%', 'Margo Inferior', false)}

            {/* Clickable text labels aligned with pulmo_sinistra_medial.png */}
            {renderTextLabelHotspot('margo-posterior', '50.0%', '13.0%', '17.7%', '22px', 'Margo Posterior')}
            {renderTextLabelHotspot('incisura-cardiaca', '57.4%', '88.4%', '20.9%', '22px', 'Incisura Cardiaca')}
            {renderTextLabelHotspot('lingula-pulmonis', '69.7%', '87.5%', '19.1%', '22px', 'Lingula Pulmonis')}
          </div>
        );
      }
    }
  };

  // Determine current active labels and coordinates for overlay
  const overlayLabels = useMemo(() => {
    if (activeModel === 'dextra') {
      if (active2DView === 'lateral_kanan') {
        return [
          { id: 'apex-pulmonis', name: { id: 'Apex Pulmonis', en: 'Apex of Lung' }, color: '#ec4899', x: 560, y: 160, tx: 400, ty: 180, line: 'd="M 560 160 L 480 160 L 400 180"' },
          { id: 'lobus-superior-kanan', name: { id: 'Lobus Superior Pulmo Dextra', en: 'Right Superior Lobe' }, color: '#e11d48', x: 560, y: 240, tx: 420, ty: 260, line: 'd="M 560 240 L 490 240 L 420 260"' },
          { id: 'fisura-horizontal-kanan', name: { id: 'Fissura Horizontalis', en: 'Horizontal Fissure' }, color: '#fbbf24', x: 560, y: 320, tx: 430, ty: 315, line: 'd="M 560 320 L 495 320 L 430 315"' },
          { id: 'lobus-medial-kanan', name: { id: 'Lobus Medius Pulmo Dextra', en: 'Right Middle Lobe' }, color: '#f97316', x: 560, y: 400, tx: 435, ty: 370, line: 'd="M 560 400 L 490 400 L 435 370"' },
          { id: 'fisura-oblique-kanan', name: { id: 'Fissura Obliqua Dextra', en: 'Right Oblique Fissure' }, color: '#f97316', x: 60, y: 240, tx: 375, ty: 310, line: 'd="M 250 240 L 310 240 L 375 310"' },
          { id: 'lobus-inferior-kanan', name: { id: 'Lobus Inferior Pulmo Dextra', en: 'Right Inferior Lobe' }, color: '#16a34a', x: 60, y: 320, tx: 365, ty: 380, line: 'd="M 250 320 L 305 320 L 365 380"' }
        ];
      } else if (active2DView === 'medial_kanan') {
        return [
          { id: 'margo-anterior', name: { id: 'Margo Anterior', en: 'Anterior Border' }, color: '#10b981', x: 60, y: 200, tx: 360, ty: 280, line: 'd="M 250 200 L 300 200 L 360 280"' },
          { id: 'radix-pulmonis', name: { id: 'Radix Pulmonis (Arteri/Vena/Bronkus)', en: 'Root / Radix Pulmonis' }, color: '#8b5cf6', x: 560, y: 180, tx: 415, ty: 270, line: 'd="M 560 180 L 480 180 L 415 270"' },
          { id: 'hilum-pulmonis', name: { id: 'Hilum Pulmonis', en: 'Hilum of Lung' }, color: '#6366f1', x: 560, y: 260, tx: 430, ty: 310, line: 'd="M 560 260 L 490 260 L 430 310"' },
          { id: 'ligamentum-pulmonale', name: { id: 'Ligamentum Pulmonale', en: 'Pulmonary Ligament' }, color: '#06b6d4', x: 560, y: 340, tx: 415, ty: 380, line: 'd="M 560 340 L 480 340 L 415 380"' }
        ];
      } else {
        // diafragma_kanan
        return [
          { id: 'basis-pulmonis', name: { id: 'Basis Pulmonis', en: 'Base of Lung' }, color: '#65a30d', x: 560, y: 280, tx: 420, ty: 380, line: 'd="M 560 280 L 490 280 L 420 380"' },
          { id: 'margo-inferior', name: { id: 'Margo Inferior', en: 'Inferior Border' }, color: '#14b8a6', x: 560, y: 360, tx: 380, ty: 420, line: 'd="M 560 360 L 470 360 L 380 420"' }
        ];
      }
    } else {
      // sinistra / Left lung view
      if (active2DView === 'lateral_kiri') {
        return [
          { id: 'apex-pulmonis', name: { id: 'Apex Pulmonis', en: 'Apex of Lung' }, color: '#ec4899', x: 560, y: 160, tx: 400, ty: 180, line: 'd="M 560 160 L 480 160 L 400 180"' },
          { id: 'lobus-superior-kiri', name: { id: 'Lobus Superior Pulmo Sinistra', en: 'Left Superior Lobe' }, color: '#8b5cf6', x: 560, y: 240, tx: 420, ty: 260, line: 'd="M 560 240 L 490 240 L 420 260"' },
          { id: 'fisura-oblique-kiri', name: { id: 'Fissura Obliqua Sinistra', en: 'Left Oblique Fissure' }, color: '#f43f5e', x: 60, y: 220, tx: 375, ty: 280, line: 'd="M 250 220 L 310 220 L 375 280"' },
          { id: 'lobus-inferior-kiri', name: { id: 'Lobus Inferior Pulmo Sinistra', en: 'Left Inferior Lobe' }, color: '#ec4899', x: 560, y: 260, tx: 420, ty: 340, line: 'd="M 560 260 L 490 260 L 420 340"' },
          { id: 'basis-pulmonis', name: { id: 'Basis Pulmonis', en: 'Base of Lung' }, color: '#65a30d', x: 560, y: 280, tx: 420, ty: 380, line: 'd="M 560 280 L 490 280 L 420 380"' },
          { id: 'margo-inferior', name: { id: 'Margo Inferior', en: 'Inferior Border' }, color: '#14b8a6', x: 560, y: 360, tx: 380, ty: 420, line: 'd="M 560 360 L 470 360 L 380 420"' }
        ];
      } else {
        return [
          { id: 'apex-pulmonis', name: { id: 'Apex Pulmonis', en: 'Apex of Lung' }, color: '#ec4899', x: 560, y: 160, tx: 400, ty: 180, line: 'd="M 560 160 L 480 160 L 400 180"' },
          { id: 'margo-posterior', name: { id: 'Margo Posterior', en: 'Posterior Border' }, color: '#6b7280', x: 60, y: 320, tx: 360, ty: 310, line: 'd="M 250 320 L 300 320 L 360 310"' },
          { id: 'incisura-cardiaca', name: { id: 'Incisura Cardiaca', en: 'Cardiac Notch' }, color: '#f43f5e', x: 560, y: 340, tx: 430, ty: 320, line: 'd="M 560 340 L 495 340 L 430 320"' },
          { id: 'lingula-pulmonis', name: { id: 'Lingula Pulmonis', en: 'Lingula of Left Lung' }, color: '#ec4899', x: 560, y: 420, tx: 435, ty: 370, line: 'd="M 560 420 L 490 420 L 435 370"' },
          { id: 'radix-pulmonis', name: { id: 'Radix Pulmonis (Arteri/Vena/Bronkus)', en: 'Root / Radix Pulmonis' }, color: '#8b5cf6', x: 560, y: 180, tx: 415, ty: 270, line: 'd="M 560 180 L 480 180 L 415 270"' },
          { id: 'hilum-pulmonis', name: { id: 'Hilum Pulmonis', en: 'Hilum of Lung' }, color: '#6366f1', x: 560, y: 260, tx: 430, ty: 310, line: 'd="M 560 260 L 490 260 L 430 310"' },
          { id: 'ligamentum-pulmonale', name: { id: 'Ligamentum Pulmonale', en: 'Pulmonary Ligament' }, color: '#06b6d4', x: 560, y: 340, tx: 415, ty: 380, line: 'd="M 560 340 L 480 340 L 415 380"' },
          { id: 'margo-anterior', name: { id: 'Margo Anterior', en: 'Anterior Border' }, color: '#10b981', x: 60, y: 200, tx: 360, ty: 280, line: 'd="M 250 200 L 300 200 L 360 280"' },
          { id: 'basis-pulmonis', name: { id: 'Basis Pulmonis', en: 'Base of Lung' }, color: '#65a30d', x: 560, y: 280, tx: 420, ty: 380, line: 'd="M 560 280 L 490 280 L 420 380"' },
          { id: 'margo-inferior', name: { id: 'Margo Inferior', en: 'Inferior Border' }, color: '#14b8a6', x: 560, y: 360, tx: 380, ty: 420, line: 'd="M 560 360 L 470 360 L 380 420"' }
        ];
      }
    }
  }, [activeModel, active2DView]);

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
          {/* Paru Dextra vs Sinistra Toggle */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '10.5px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {lang === 'id' ? 'PILIH PARU-PARU' : 'SELECT LUNG'}
              </span>
              {isFullscreen && (
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
              )}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <button
                onClick={() => handleSetModel('dextra')}
                className={`soft-button ${activeModel === 'dextra' ? 'active' : ''}`}
                style={{ fontSize: '11px', padding: '8px 12px', fontWeight: '700', borderRadius: '8px' }}
              >
                {lang === 'id' ? 'Paru Kanan (Dextra)' : 'Right Lung'}
              </button>
              <button
                onClick={() => handleSetModel('sinistra')}
                className={`soft-button ${activeModel === 'sinistra' ? 'active' : ''}`}
                style={{ fontSize: '11px', padding: '8px 12px', fontWeight: '700', borderRadius: '8px' }}
              >
                {lang === 'id' ? 'Paru Kiri (Sinistra)' : 'Left Lung'}
              </button>
            </div>
          </div>

          {/* Diagram View Selector Tabs */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '16px' }}>
            <span style={{ fontSize: '10.5px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {lang === 'id' ? 'PILIH ASPEK GAMBAR' : 'CHOOSE DIAGRAM VIEW'}
            </span>
            {activeModel === 'dextra' ? (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '4px' }}>
                <button
                  onClick={() => handleSet2DView('lateral_kanan')}
                  className={`soft-button ${active2DView === 'lateral_kanan' ? 'active' : ''}`}
                  style={{ fontSize: '9.5px', padding: '6px 4px', fontWeight: '700', borderRadius: '6px' }}
                >
                  {lang === 'id' ? 'Lateral' : 'Lateral'}
                </button>
                <button
                  onClick={() => handleSet2DView('medial_kanan')}
                  className={`soft-button ${active2DView === 'medial_kanan' ? 'active' : ''}`}
                  style={{ fontSize: '9.5px', padding: '6px 4px', fontWeight: '700', borderRadius: '6px' }}
                >
                  {lang === 'id' ? 'Medial (Hilum)' : 'Medial (Hilum)'}
                </button>
                <button
                  onClick={() => handleSet2DView('diafragma_kanan')}
                  className={`soft-button ${active2DView === 'diafragma_kanan' ? 'active' : ''}`}
                  style={{ fontSize: '9.5px', padding: '6px 4px', fontWeight: '700', borderRadius: '6px' }}
                >
                  {lang === 'id' ? 'Diafragma' : 'Base'}
                </button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px' }}>
                <button
                  onClick={() => handleSet2DView('lateral_kiri')}
                  className={`soft-button ${active2DView === 'lateral_kiri' ? 'active' : ''}`}
                  style={{ fontSize: '9.5px', padding: '6px 4px', fontWeight: '700', borderRadius: '6px' }}
                >
                  {lang === 'id' ? 'Lateral' : 'Lateral'}
                </button>
                <button
                  onClick={() => handleSet2DView('medial_kiri')}
                  className={`soft-button ${active2DView === 'medial_kiri' ? 'active' : ''}`}
                  style={{ fontSize: '9.5px', padding: '6px 4px', fontWeight: '700', borderRadius: '6px' }}
                >
                  {lang === 'id' ? 'Medial (Hilum)' : 'Medial (Hilum)'}
                </button>
              </div>
            )}
          </div>

          <div style={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: '100%', maxWidth: '100%' }}>
              <h4 style={{ margin: '0 0 10px 0', fontSize: '11px', fontWeight: '800', color: '#1e293b', textAlign: 'center' }}>
                {active2DView === 'lateral_kanan' && (lang === 'id' ? 'PARU KANAN: ASPEK LATERAL' : 'RIGHT LUNG: LATERAL ASPECT')}
                {active2DView === 'medial_kanan' && (lang === 'id' ? 'PARU KANAN: ASPEK MEDIAL (HILUM)' : 'RIGHT LUNG: MEDIAL ASPECT (HILUM)')}
                {active2DView === 'diafragma_kanan' && (lang === 'id' ? 'PARU KANAN: ASPEK DIAFRAGMATIK' : 'RIGHT LUNG: BASE')}
                {active2DView === 'lateral_kiri' && (lang === 'id' ? 'PARU KIRI: ASPEK LATERAL' : 'LEFT LUNG: LATERAL ASPECT')}
                {active2DView === 'medial_kiri' && (lang === 'id' ? 'PARU KIRI: ASPEK MEDIAL (HILUM)' : 'LEFT LUNG: MEDIAL ASPECT (HILUM)')}
              </h4>
              {renderSVG2D()}
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
                  ? 'Ketuk nomor pin (1-9) pada model 3D untuk mendengar penjelasannya!' 
                  : 'Tap the pin numbers (1-9) on the 3D model to hear the voice explanation!'}
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

            {/* Sketchfab IFrame Container */}
            <iframe 
              ref={iframeRef}
              id="sketchfab-iframe"
              title={activeModel === 'dextra' ? 'Pulmo dexter' : 'Pulmo sinister'}
              frameBorder="0" 
              allowFullScreen 
              mozallowfullscreen="true" 
              webkitallowfullscreen="true" 
              allow="autoplay; fullscreen; xr-spatial-tracking; accelerometer; gyroscope" 
              xr-spatial-tracking="true" 
              execution-while-out-of-viewport="true" 
              execution-while-not-rendered="true" 
              web-share="true" 
              src={models[activeModel].embedUrl}
              style={{ width: '100%', height: '100%', border: '0', display: 'block' }}
            />

            {/* Floating Model Switcher (Visible on desktop and mobile) */}
            <div style={{
              position: 'absolute',
              top: '16px',
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(8px)',
              border: '1.5px solid #cbd5e1',
              borderRadius: '12px',
              padding: '4px',
              display: 'flex',
              gap: '4px',
              zIndex: 60,
              boxShadow: '0 4px 12px rgba(15, 23, 42, 0.08)',
              pointerEvents: 'auto'
            }}>
              <button
                onClick={() => handleSetModel('dextra')}
                style={{
                  fontSize: '10px',
                  fontWeight: '700',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  background: activeModel === 'dextra' ? '#0284c7' : 'transparent',
                  color: activeModel === 'dextra' ? '#ffffff' : '#64748b',
                  transition: 'all 0.2s ease',
                  outline: 'none'
                }}
              >
                {lang === 'id' ? 'Paru Kanan' : 'Right Lung'}
              </button>
              <button
                onClick={() => handleSetModel('sinistra')}
                style={{
                  fontSize: '10px',
                  fontWeight: '700',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  background: activeModel === 'sinistra' ? '#0284c7' : 'transparent',
                  color: activeModel === 'sinistra' ? '#ffffff' : '#64748b',
                  transition: 'all 0.2s ease',
                  outline: 'none'
                }}
              >
                {lang === 'id' ? 'Paru Kiri' : 'Left Lung'}
              </button>
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
                {activeModel === 'dextra' 
                  ? (lang === 'id' ? 'Sketchfab: Pulmo Dextra 3D' : 'Sketchfab: Right Lung 3D')
                  : (lang === 'id' ? 'Sketchfab: Pulmo Sinistra 3D' : 'Sketchfab: Left Lung 3D')}
              </span>
            </div>

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
                  <span>{lang === 'id' ? 'Diagram 2D Paru' : '2D Lung Diagram'}</span>
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

              {/* Selector controls & diagram wrapper */}
              <div style={{ padding: '12px', flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '10px', overflowY: 'auto' }}>
                <div style={{ display: 'grid', gridTemplateRows: 'auto auto', gap: '8px' }}>
                  {/* Select Lung */}
                  <div>
                    <span style={{ fontSize: '9px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '3px' }}>
                      {lang === 'id' ? 'PILIH PARU-PARU' : 'SELECT LUNG'}
                    </span>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px' }}>
                      <button
                        onClick={() => handleSetModel('dextra')}
                        className={`soft-button ${activeModel === 'dextra' ? 'active' : ''}`}
                        style={{ fontSize: '9.5px', padding: '4px 6px', fontWeight: '700', borderRadius: '4px' }}
                      >
                        {lang === 'id' ? 'Kanan' : 'Right'}
                      </button>
                      <button
                        onClick={() => handleSetModel('sinistra')}
                        className={`soft-button ${activeModel === 'sinistra' ? 'active' : ''}`}
                        style={{ fontSize: '9.5px', padding: '4px 6px', fontWeight: '700', borderRadius: '4px' }}
                      >
                        {lang === 'id' ? 'Kiri' : 'Left'}
                      </button>
                    </div>
                  </div>

                  {/* Select Aspect */}
                  <div>
                    <span style={{ fontSize: '9px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '3px' }}>
                      {lang === 'id' ? 'PILIH ASPEK GAMBAR' : 'CHOOSE DIAGRAM VIEW'}
                    </span>
                    {activeModel === 'dextra' ? (
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '4px' }}>
                        <button
                          onClick={() => handleSet2DView('lateral_kanan')}
                          className={`soft-button ${active2DView === 'lateral_kanan' ? 'active' : ''}`}
                          style={{ fontSize: '9px', padding: '4px 2px', fontWeight: '700', borderRadius: '4px' }}
                        >
                          Lateral
                        </button>
                        <button
                          onClick={() => handleSet2DView('medial_kanan')}
                          className={`soft-button ${active2DView === 'medial_kanan' ? 'active' : ''}`}
                          style={{ fontSize: '9px', padding: '4px 2px', fontWeight: '700', borderRadius: '4px' }}
                        >
                          Medial
                        </button>
                        <button
                          onClick={() => handleSet2DView('diafragma_kanan')}
                          className={`soft-button ${active2DView === 'diafragma_kanan' ? 'active' : ''}`}
                          style={{ fontSize: '9px', padding: '4px 2px', fontWeight: '700', borderRadius: '4px' }}
                        >
                          Base
                        </button>
                      </div>
                    ) : (
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px' }}>
                        <button
                          onClick={() => handleSet2DView('lateral_kiri')}
                          className={`soft-button ${active2DView === 'lateral_kiri' ? 'active' : ''}`}
                          style={{ fontSize: '9px', padding: '4px 2px', fontWeight: '700', borderRadius: '4px' }}
                        >
                          Lateral
                        </button>
                        <button
                          onClick={() => handleSet2DView('medial_kiri')}
                          className={`soft-button ${active2DView === 'medial_kiri' ? 'active' : ''}`}
                          style={{ fontSize: '9px', padding: '4px 2px', fontWeight: '700', borderRadius: '4px' }}
                        >
                          Medial
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <hr style={{ border: '0', borderTop: '1px solid #f1f5f9', margin: '4px 0' }} />

                <div>
                  <h4 style={{ margin: '0 0 6px 0', fontSize: '9.5px', fontWeight: '800', color: '#1e293b', textAlign: 'center' }}>
                    {active2DView === 'lateral_kanan' && (lang === 'id' ? 'PARU KANAN: ASPEK LATERAL' : 'RIGHT LUNG: LATERAL ASPECT')}
                    {active2DView === 'medial_kanan' && (lang === 'id' ? 'PARU KANAN: ASPEK MEDIAL (HILUM)' : 'RIGHT LUNG: MEDIAL ASPECT (HILUM)')}
                    {active2DView === 'diafragma_kanan' && (lang === 'id' ? 'PARU KANAN: ASPEK DIAFRAGMATIK' : 'RIGHT LUNG: BASE')}
                    {active2DView === 'lateral_kiri' && (lang === 'id' ? 'PARU KIRI: ASPEK LATERAL' : 'LEFT LUNG: LATERAL ASPECT')}
                    {active2DView === 'medial_kiri' && (lang === 'id' ? 'PARU KIRI: ASPEK MEDIAL (HILUM)' : 'LEFT LUNG: MEDIAL ASPECT (HILUM)')}
                  </h4>
                  <div style={{ position: 'relative', width: '100%' }}>
                    {renderSVG2D()}
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
