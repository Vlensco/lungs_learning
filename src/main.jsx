import React, { useMemo, useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { Layers3, Microscope, Rotate3D, Search, X, Volume2, Menu, Award, Clock } from 'lucide-react';
import './styles.css';

// Modular data, utilities, and components
import { partData, layerOptions } from './data/partData';
import { playChime, speakTerm } from './utils/audioSpeech';
import WelcomeScreen, { LungsIcon } from './components/WelcomeScreen';
import MiniLegend from './components/MiniLegend';
import PartCard from './components/PartCard';
import LungScene from './components/LungScene';
import AdminDashboard from './components/AdminDashboard';
import AdminLogin from './components/AdminLogin';
import PracticeModule from './components/PracticeModule';
import { supabase } from './utils/supabaseClient';

function App() {
  const [lang, setLang] = useState('id'); // 'id' or 'en'
  const [isLanguageSelected, setIsLanguageSelected] = useState(false); // start selection flag
  const [currentStudent, setCurrentStudent] = useState('');
  const [isAdminActive, setIsAdminActive] = useState(false);
  const [isPracticeActive, setIsPracticeActive] = useState(false);

  // Clean URL Routing state
  const [isAdminRouteActive, setIsAdminRouteActive] = useState(() => {
    const path = window.location.pathname.toLowerCase();
    const hash = window.location.hash.toLowerCase();
    return path === '/admin/login' || hash === '#/admin/login' || hash.includes('/admin/login');
  });

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

  // Student Quiz Attempts history list
  const [quizAttempts, setQuizAttempts] = useState([]);

  // Fetch student's specific quiz attempts (Supabase + Local fallback)
  const fetchStudentAttempts = async (studentName) => {
    if (!studentName) return;
    let loadedFromDb = false;

    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('respira_practice_attempts')
          .select('*')
          .eq('username', studentName)
          .order('created_at', { ascending: false });

        if (!error && data) {
          const formatted = data.map(item => ({
            category: item.category,
            score: item.score,
            totalQuestions: item.total_questions,
            timestamp: new Date(item.created_at).getTime()
          }));
          setQuizAttempts(formatted);
          loadedFromDb = true;
          console.log('[Supabase] Successfully loaded student quiz history.');
        }
      } catch (err) {
        console.warn('[Supabase] Failed to fetch attempts history:', err.message);
      }
    }

    if (!loadedFromDb) {
      try {
        const saved = localStorage.getItem('respira_practice_attempts');
        if (saved) {
          const allAttempts = JSON.parse(saved);
          const studentAttempts = allAttempts
            .filter(a => a.username.toLowerCase() === studentName.toLowerCase())
            .sort((a, b) => b.timestamp - a.timestamp);
          setQuizAttempts(studentAttempts);
        } else {
          setQuizAttempts([]);
        }
      } catch (e) {
        console.error('Failed to load local attempts history:', e);
      }
    }
  };

  // Sync quiz history when practice modal closes or student logs in
  useEffect(() => {
    if (!isPracticeActive && currentStudent) {
      fetchStudentAttempts(currentStudent);
    }
  }, [isPracticeActive, currentStudent]);

  // Router listener for URL updates
  useEffect(() => {
    const handleLocationCheck = () => {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      const isAdm = path === '/admin/login' || hash === '#/admin/login' || hash.includes('/admin/login');
      setIsAdminRouteActive(isAdm);
      
      // If we exit the admin route, disable admin active state
      if (!isAdm) {
        setIsAdminActive(false);
      }
    };

    window.addEventListener('popstate', handleLocationCheck);
    window.addEventListener('hashchange', handleLocationCheck);
    return () => {
      window.removeEventListener('popstate', handleLocationCheck);
      window.removeEventListener('hashchange', handleLocationCheck);
    };
  }, []);

  // Automated Dual-Sync Database Synchronizer (LocalStorage + Supabase)
  useEffect(() => {
    if (!currentStudent || currentStudent.toLowerCase() === 'admin') return;
    
    // 1. Sync to LocalStorage (Offline Mode)
    try {
      const saved = localStorage.getItem('respira_student_records');
      let records = saved ? JSON.parse(saved) : [];
      
      const idx = records.findIndex(r => r.username.toLowerCase() === currentStudent.toLowerCase());
      if (idx !== -1) {
        records[idx].exploredList = exploredList;
        records[idx].lang = lang;
        records[idx].timestamp = Date.now();
      } else {
        records.push({
          username: currentStudent,
          lang: lang,
          exploredList: exploredList,
          timestamp: Date.now()
        });
      }
      localStorage.setItem('respira_student_records', JSON.stringify(records));
    } catch (e) {
      console.error('Failed to sync student session to localStorage:', e);
    }

    // 2. Sync to Supabase Database (Real-time Cloud Mode)
    if (supabase) {
      const syncToDb = async () => {
        try {
          const count = exploredList.length;
          const { error } = await supabase
            .from('respira_students')
            .upsert({
              username: currentStudent,
              lang: lang,
              explored_list: exploredList,
              mastered_count: count,
              updated_at: new Date().toISOString()
            }, { onConflict: 'username' });

          if (error) throw error;
          console.log('[Supabase] Successfully synced student exploration logs.');
        } catch (err) {
          console.warn('[Supabase] Database sync failed:', err.message);
        }
      };

      // Debounced or direct call
      syncToDb();
    }
  }, [exploredList, currentStudent, lang]);

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

  async function handleSelectLanguage(username, selectedLang) {
    if (username.trim().toLowerCase() === 'admin') {
      window.location.hash = '/admin/login';
      return;
    }
    
    const studentName = username.trim();
    setCurrentStudent(studentName);
    setLang(selectedLang);
    setIsLanguageSelected(true);
    playChime('complete');

    // 1. Fetch & Recover from Supabase DB (Real-time Cloud Mode)
    let hasLoadedFromDb = false;
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('respira_students')
          .select('explored_list, lang')
          .eq('username', studentName)
          .maybeSingle();

        if (!error && data) {
          const list = data.explored_list || ['trakea'];
          setExploredList(list);
          if (data.lang) setLang(data.lang);
          if (list.length > 0) {
            setActiveId(list[list.length - 1]);
          }
          hasLoadedFromDb = true;
          console.log('[Supabase] Successfully recovered student profile progress.');
        }
      } catch (err) {
        console.warn('[Supabase] Failed to retrieve student record:', err.message);
      }
    }

    // 2. LocalStorage Fallback (Offline Mode)
    if (!hasLoadedFromDb) {
      try {
        const saved = localStorage.getItem('respira_student_records');
        const records = saved ? JSON.parse(saved) : [];
        const existing = records.find(r => r.username.toLowerCase() === studentName.toLowerCase());
        if (existing) {
          setExploredList(existing.exploredList || ['trakea']);
          if (existing.exploredList && existing.exploredList.length > 0) {
            setActiveId(existing.exploredList[existing.exploredList.length - 1]);
          }
        } else {
          setExploredList(['trakea']);
          setActiveId('trakea');
        }
      } catch (e) {
        console.error('Failed to load existing student record:', e);
      }
    }
    
    // Play warm vocal welcome!
    setTimeout(() => {
      if (selectedLang === 'id') {
        speakTerm(`Selamat datang ${studentName}. Silakan ketuk bagian paru-paru untuk mulai belajar.`, 'id');
      } else {
        speakTerm(`Welcome ${studentName}. Please click on the lung structures to begin learning.`, 'en');
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

  // Route-based View Logic
  if (isAdminRouteActive) {
    if (!isAdminActive) {
      return <AdminLogin onLoginSuccess={() => setIsAdminActive(true)} />;
    }
    return (
      <AdminDashboard 
        onClose={() => {
          setIsAdminActive(false);
          setIsAdminRouteActive(false);
          window.location.hash = '';
          window.location.pathname = '/';
        }} 
      />
    );
  }

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      
      {/* Welcoming Screen modal */}
      {!isLanguageSelected && <WelcomeScreen onSelectLanguage={handleSelectLanguage} />}

      {/* Admin Dashboard overlay fallback if accessed in-app without URL change */}
      {isAdminActive && (
        <AdminDashboard 
          onClose={() => {
            setIsAdminActive(false);
            if (currentStudent === '' || currentStudent.toLowerCase() === 'admin') {
              setIsLanguageSelected(false);
              setCurrentStudent('');
            }
            playChime('click');
          }} 
        />
      )}

      {/* Dynamic Practice/Latihan Quiz Overlay panel */}
      {isPracticeActive && (
        <PracticeModule 
          username={currentStudent || 'Student'} 
          lang={lang} 
          onClose={() => {
            setIsPracticeActive(false);
            playChime('click');
          }} 
        />
      )}

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

          {/* Student Badge overlay */}
          {currentStudent && (
            <div className="student-profile-badge">
              <div className="avatar">{currentStudent.slice(0, 2).toUpperCase()}</div>
              <div>
                <small>{lang === 'id' ? 'Siswa Aktif' : 'Active Student'}</small>
                <strong>{currentStudent}</strong>
              </div>
              <button 
                className="exit-profile-btn" 
                onClick={() => {
                  if (window.confirm(lang === 'id' ? 'Keluar dari profil ini?' : 'Logout from this profile?')) {
                    setIsLanguageSelected(false);
                    setCurrentStudent('');
                    setExploredList(['trakea']);
                    setActiveId('trakea');
                    playChime('click');
                  }
                }}
                title={lang === 'id' ? 'Keluar Sesi' : 'Logout Session'}
              >
                Logout
              </button>
            </div>
          )}

          <p className="intro-copy">{t.brandDesc}</p>

          {/* Circular Progress & Mastered Legend Dashboard */}
          <MiniLegend counts={counts} exploredCount={exploredList.length} lang={lang} />

          {/* Interactive Practice Mode/Latihan Button inside Sidebar */}
          {currentStudent && (
            <button 
              className="sidebar-practice-btn"
              onClick={() => {
                setIsPracticeActive(true);
                setIsSidebarOpen(false);
                playChime('click');
              }}
            >
              <Award size={15} style={{ marginRight: '6px' }} />
              <span>{lang === 'id' ? 'Mulai Kuis Latihan' : 'Start Practice Quiz'}</span>
            </button>
          )}

          {/* Student Quiz History Section */}
          {currentStudent && (
            <div className="quiz-history-panel">
              <div className="quiz-history-header">
                <div className="section-title">
                  <Clock size={14} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '6px' }} /> 
                  <span style={{ verticalAlign: 'middle' }}>{lang === 'id' ? 'Riwayat Latihan' : 'Practice History'}</span>
                </div>
                {quizAttempts.length > 0 && (
                  <span className="attempts-count-badge">
                    {quizAttempts.length} {lang === 'id' ? 'Selesai' : 'Done'}
                  </span>
                )}
              </div>
              
              <div className="quiz-history-list">
                {quizAttempts.map((attempt, idx) => {
                  const percent = Math.round((attempt.score / attempt.totalQuestions) * 100);
                  let scoreClass = 'history-score-badge ';
                  if (percent >= 80) scoreClass += 'high';
                  else if (percent >= 50) scoreClass += 'mid';
                  else scoreClass += 'low';

                  let translatedCat = attempt.category;
                  if (lang === 'en') {
                    if (attempt.category === 'Semua') translatedCat = 'All Layers';
                    else if (attempt.category === 'Saluran Napas') translatedCat = 'Airways';
                    else if (attempt.category === 'Lobus Paru') translatedCat = 'Lung Lobes';
                    else if (attempt.category === 'Fisura') translatedCat = 'Fissures';
                    else if (attempt.category === 'Mikro') translatedCat = 'Micro';
                    else if (attempt.category === 'Mekanisme Bernapas') translatedCat = 'Mechanics';
                  }

                  return (
                    <div key={idx} className="quiz-history-item">
                      <div className="history-info">
                        <strong>{translatedCat}</strong>
                        <small>{new Date(attempt.timestamp).toLocaleTimeString(lang === 'id' ? 'id-ID' : 'en-US', { hour: '2-digit', minute: '2-digit' })}</small>
                      </div>
                      <div className={scoreClass}>
                        {attempt.score}/{attempt.totalQuestions}
                      </div>
                    </div>
                  );
                })}

                {quizAttempts.length === 0 && (
                  <p className="history-empty-text">
                    {lang === 'id'
                      ? 'Belum ada kuis diselesaikan.'
                      : 'No quizzes completed yet.'}
                  </p>
                )}
              </div>
            </div>
          )}

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
                <button className={`lang-pill-btn ${lang === 'id' ? 'active' : ''}`} onClick={() => handleSelectLanguage(currentStudent || 'Student', 'id')}>ID</button>
                <button className={`lang-pill-btn ${lang === 'en' ? 'active' : ''}`} onClick={() => handleSelectLanguage(currentStudent || 'Student', 'en')}>EN</button>
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
