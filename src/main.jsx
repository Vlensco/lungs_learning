import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Layers3, Microscope, Rotate3D, Search, X, Volume2, Menu } from 'lucide-react';
import './styles.css';

// Modular data, utilities, and components
import { partData, layerOptions } from './data/partData';
import { playChime, speakTerm } from './utils/audioSpeech';
import WelcomeScreen, { LungsIcon } from './components/WelcomeScreen';
import MiniLegend from './components/MiniLegend';
import PartCard from './components/PartCard';
import LungScene from './components/LungScene';

function App() {
  const [lang, setLang] = useState('id'); // 'id' or 'en'
  const [isLanguageSelected, setIsLanguageSelected] = useState(false); // start selection flag

  const [activeId, setActiveId] = useState('trakea');
  const [activeLayer, setActiveLayer] = useState('Semua');
  const [query, setQuery] = useState('');
  const [showLabels, setShowLabels] = useState(true);
  const [notice, setNotice] = useState('Klik titik + atau daftar bagian untuk mulai belajar.');
  
  const [exploredList, setExploredList] = useState(['trakea']);
  const [breathingRate, setBreathingRate] = useState(1); // 0 = Hold, 1 = Normal, 2 = Cepat
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSheetExpanded, setIsSheetExpanded] = useState(false);
  
  // Custom state for automatic voice guidance
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true);

  const filteredParts = useMemo(() => {
    return partData.filter((part) => {
      const activeLayerVal = activeLayer === 'Semua' ? 'Semua' : activeLayer;
      const isLayerAll = activeLayerVal === 'Semua';
      
      let layerMatch = isLayerAll || part.layer.id === activeLayerVal || part.layer.en === activeLayerVal || part.view.id === activeLayerVal || part.view.en === activeLayerVal;
      
      const q = query.trim().toLowerCase();
      const queryMatch = !q || [
        part.name.id, part.name.en, 
        part.english, 
        part.layer.id, part.layer.en, 
        part.short.id, part.short.en
      ].join(' ').toLowerCase().includes(q);
      
      return layerMatch && queryMatch;
    });
  }, [activeLayer, query]);

  const activePart = partData.find((part) => part.id === activeId) || partData[0];
  
  const counts = useMemo(() => {
    return partData.reduce((acc, part) => {
      const catKey = part.layer.id;
      acc[catKey] = (acc[catKey] || 0) + 1;
      return acc;
    }, {});
  }, []);

  function selectPart(id) {
    setActiveId(id);
    const part = partData.find((item) => item.id === id);
    if (part) {
      setNotice(`${part.name[lang]}: ${part.short[lang]}`);
      playChime('click');
      setIsSheetExpanded(true);
      
      // Auto voice explanation on click!
      if (isVoiceEnabled) {
        speakTerm(`${part.name[lang]}. ${part.short[lang]}`, lang);
      }
    }
    
    if (!exploredList.includes(id)) {
      setExploredList(prev => [...prev, id]);
    }
  }

  function handleToggleLearned(id) {
    if (exploredList.includes(id)) {
      setExploredList(prev => prev.filter(item => item !== id));
      playChime('click');
    } else {
      setExploredList(prev => [...prev, id]);
      playChime('complete');
    }
  }

  function handleSelectLanguage(selectedLang) {
    setLang(selectedLang);
    setIsLanguageSelected(true);
    playChime('complete');
    
    // Play warm vocal welcome!
    setTimeout(() => {
      if (selectedLang === 'id') {
        speakTerm('Selamat datang di Respira 3D. Silakan ketuk bagian paru-paru untuk mulai belajar.', 'id');
      } else {
        speakTerm('Welcome to Respira 3D. Please click on the lung structures to begin learning.', 'en');
      }
    }, 600);
    
    setNotice(selectedLang === 'id' ? 'Klik titik + atau daftar bagian untuk mulai belajar.' : 'Click on the + pins or list items to start learning.');
  }

  // Multi-language UI translations
  const t = {
    brandSubtitle: lang === 'id' ? 'Respira 3D Learning' : 'Respira 3D Clinical Lab',
    brandTitle: lang === 'id' ? 'Anatomi Paru-Paru Interaktif' : 'Interactive Lung Anatomy',
    brandDesc: lang === 'id' 
      ? 'Visualisasi anatomi 3D berbasis kurikulum kedokteran untuk mempermudah pemahaman sistem respirasi secara mendalam.'
      : 'Curriculum-aligned 3D anatomical visualization designed to facilitate in-depth respiratory tract education.',
    searchPlaceholder: lang === 'id' ? 'Cari trakea, alveoli, lobus...' : 'Search trachea, alveoli, lobes...',
    layerFilterTitle: lang === 'id' ? 'Layer anotasi' : 'Anatomy Layers',
    emptyText: lang === 'id' ? 'Tidak ada bagian yang cocok.' : 'No anatomical matches found.',
    toolbarSubtitle: lang === 'id' ? 'Interactive GLB Viewer' : 'Interactive 3D Simulator',
    toolbarTitle: lang === 'id' ? 'Mode eksplorasi 3D' : '3D Exploration Mode',
    toolbarHidePin: lang === 'id' ? 'Sembunyikan pin' : 'Hide Pins',
    toolbarShowPin: lang === 'id' ? 'Tampilkan pin' : 'Show Pins',
    toolbarHint: lang === 'id' ? 'Drag untuk rotasi · Scroll untuk zoom' : 'Drag to rotate · Scroll to zoom',
    simulatorTitle: lang === 'id' ? 'Simulator Laju Pernapasan' : 'Respiratory Simulator',
    simulatorHold: lang === 'id' ? 'Tahan' : 'Hold',
    simulatorNormal: lang === 'id' ? 'Normal' : 'Normal',
    simulatorRapid: lang === 'id' ? 'Cepat' : 'Rapid',
    learningRouteTitle: lang === 'id' ? 'Alur Pembelajaran' : 'Educational Path',
    menuBtn: lang === 'id' ? 'Menu' : 'Menu',
    detailPill: lang === 'id' ? 'Detail' : 'Details'
  };

  const translatedLayerOptions = useMemo(() => {
    if (lang === 'id') return layerOptions;
    return ['All', 'Airways', 'Lobes', 'Fissures', 'Micro', 'Mechanics'];
  }, [lang]);

  function selectCategoryFilter(index) {
    const rawCategory = layerOptions[index];
    setActiveLayer(rawCategory);
  }

  const activeCategoryTranslated = useMemo(() => {
    const idx = layerOptions.indexOf(activeLayer);
    return translatedLayerOptions[idx !== -1 ? idx : 0];
  }, [activeLayer, translatedLayerOptions]);

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      
      {/* Welcoming Screen modal */}
      {!isLanguageSelected && <WelcomeScreen onSelectLanguage={handleSelectLanguage} />}

      <main className="app-shell">
        {/* Mobile Header Toolbar */}
        <header className="mobile-header">
          <button className="menu-btn" onClick={() => setIsSidebarOpen(true)}>
            <Menu size={20} />
            <span>{t.menuBtn}</span>
          </button>
          <span className="mobile-brand">RESPIRA 3D</span>
          <button 
            className={`sheet-toggle-btn ${isSheetExpanded ? 'active' : ''}`}
            onClick={() => setIsSheetExpanded(!isSheetExpanded)}
          >
            {activePart ? activePart.name[lang] : t.detailPill}
          </button>
        </header>

        {/* Backdrop for mobile drawer */}
        {isSidebarOpen && <div className="sidebar-backdrop" onClick={() => setIsSidebarOpen(false)} />}

        <aside className={`left-panel glass-panel ${isSidebarOpen ? 'open' : ''}`}>
          <div className="brand-row">
            <div className="brand-mark">
              <LungsIcon size={24} color="#0284c7" />
            </div>
            <div>
              <p>{t.brandSubtitle}</p>
              <h1>{t.brandTitle}</h1>
            </div>
            <button className="close-sidebar-btn" onClick={() => setIsSidebarOpen(false)}>
              <X size={18} />
            </button>
          </div>
          <p className="intro-copy">{t.brandDesc}</p>

          {/* Circular Progress & Mastered Legend Dashboard */}
          <MiniLegend counts={counts} exploredCount={exploredList.length} lang={lang} />

          <div className="search-box">
            <Search size={17} />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t.searchPlaceholder} />
          </div>
          
          <div className="layer-filter">
            <div className="section-title"><Layers3 size={16} /> {t.layerFilterTitle}</div>
            <div className="chip-grid">
              {translatedLayerOptions.map((layerName, idx) => (
                <button 
                  key={layerName} 
                  className={activeCategoryTranslated === layerName ? 'chip active' : 'chip'} 
                  onClick={() => selectCategoryFilter(idx)}
                >
                  {layerName}
                </button>
              ))}
            </div>
          </div>

          <div className="part-list">
            {filteredParts.map((part) => {
              const isLearned = exploredList.includes(part.id);
              return (
                <button 
                  key={part.id} 
                  className={activeId === part.id ? 'part-row active' : 'part-row'} 
                  onClick={() => {
                    selectPart(part.id);
                    setIsSidebarOpen(false);
                  }}
                  style={{ '--accent': part.color }}
                >
                  <span className="dot" style={{ background: part.color }} />
                  <span className="part-text-box">
                    <strong>{part.name[lang]}</strong>
                    <small>{part.english}</small>
                  </span>
                  {isLearned && <span className="learned-badge">✓</span>}
                </button>
              );
            })}
            {filteredParts.length === 0 && <p className="empty-state">{t.emptyText}</p>}
          </div>
        </aside>

        <section className="viewer-panel">
          <div className="top-toolbar glass-panel">
            <div>
              <p className="eyebrow">{t.toolbarSubtitle}</p>
              <strong>{t.toolbarTitle}</strong>
            </div>
            <div className="toolbar-actions">
              {/* Dynamic Header Quick Language Switcher */}
              <div className="language-selector-pill">
                <button className={`lang-pill-btn ${lang === 'id' ? 'active' : ''}`} onClick={() => handleSelectLanguage('id')}>ID</button>
                <button className={`lang-pill-btn ${lang === 'en' ? 'active' : ''}`} onClick={() => handleSelectLanguage('en')}>EN</button>
              </div>

              {/* Dynamic Voice Guide ON/OFF Toggle switch */}
              <button 
                className={`soft-button voice-toggle-btn ${isVoiceEnabled ? 'active' : ''}`} 
                onClick={() => {
                  setIsVoiceEnabled(!isVoiceEnabled);
                  if (isVoiceEnabled) {
                    window.speechSynthesis.cancel();
                  } else {
                    speakTerm(lang === 'id' ? 'Asisten suara aktif' : 'Voice assistant active', lang);
                  }
                  playChime('click');
                }}
                title={lang === 'id' ? 'Aktifkan/Nonaktifkan Suara Asisten' : 'Toggle Voice Assistant'}
              >
                <Volume2 size={14} style={{ marginRight: '6px', display: 'inline-block', verticalAlign: 'middle' }} />
                <span>{isVoiceEnabled ? (lang === 'id' ? 'Suara: ON' : 'Voice: ON') : (lang === 'id' ? 'Suara: OFF' : 'Voice: OFF')}</span>
              </button>

              <button className="soft-button" onClick={() => setShowLabels((value) => !value)}>
                {showLabels ? t.toolbarHidePin : t.toolbarShowPin}
              </button>
              <span className="hint"><Rotate3D size={16} /> {t.toolbarHint}</span>
            </div>
          </div>

          {/* Dynamic 3D Laboratory Scene */}
          <LungScene
            parts={filteredParts}
            activeId={activeId}
            activePart={activePart}
            onSelect={selectPart}
            showLabels={showLabels}
            setNotice={setNotice}
            breathingRate={breathingRate}
            lang={lang}
          />
          
          {/* Breathing Simulation Controller Panel */}
          <div className="breathing-rate-controller glass-panel">
            <span className="controller-title">{t.simulatorTitle}</span>
            <div className="rate-selector-grid">
              <button className={breathingRate === 0 ? 'rate-btn active hold' : 'rate-btn'} onClick={() => setBreathingRate(0)}>{t.simulatorHold}</button>
              <button className={breathingRate === 1 ? 'rate-btn active normal' : 'rate-btn'} onClick={() => setBreathingRate(1)}>{t.simulatorNormal}</button>
              <button className={breathingRate === 2 ? 'rate-btn active rapid' : 'rate-btn'} onClick={() => setBreathingRate(2)}>{t.simulatorRapid}</button>
            </div>
          </div>

          <div className="notice glass-panel">{notice}</div>
        </section>

        {/* Floating sheet handler for mobile sheet */}
        {isSheetExpanded && <div className="sheet-backdrop" onClick={() => setIsSheetExpanded(false)} />}

        <aside className={`right-panel ${isSheetExpanded ? 'expanded' : ''}`}>
          <div className="sheet-drag-handle" onClick={() => setIsSheetExpanded(!isSheetExpanded)}>
            <div className="handle-bar" />
          </div>
          <PartCard 
            part={activePart} 
            exploredList={exploredList}
            onToggleLearned={handleToggleLearned}
            lang={lang}
            onClose={() => {
              setNotice(lang === 'id' ? 'Panel detail tetap tersedia. Pilih anotasi lain.' : 'Details remain available. Select another structure.');
              setIsSheetExpanded(false);
            }} 
          />
          
          <section className="teacher-panel glass-panel">
            <div className="section-title"><Microscope size={16} /> {t.learningRouteTitle}</div>
            {lang === 'id' ? (
              <ol>
                <li>Mulai dari trakea untuk memahami jalur udara utama.</li>
                <li>Lanjut ke bronkus utama, lobaris, dan segmentalis.</li>
                <li>Masuk ke bronkiolus, otot polos, lalu alveoli.</li>
                <li>Akhiri dengan lobus, fisura, dan diafragma.</li>
              </ol>
            ) : (
              <ol>
                <li>Start at the trachea to understand the primary air pathway.</li>
                <li>Proceed to the main, lobar, and segmental bronchi.</li>
                <li>Explore bronchioles, smooth muscles, and the alveoli.</li>
                <li>Conclude with lobes, fissures, and the diaphragm muscle.</li>
              </ol>
            )}
          </section>
        </aside>
      </main>
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
