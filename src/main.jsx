import React, { useMemo, useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { Layers3, Microscope, Rotate3D, Search, X, Volume2, Menu, Award, Clock, ArrowLeft, ArrowRight, Maximize2, Minimize2, ChevronLeft, ChevronRight } from 'lucide-react';
import './styles.css';

// Modular data, utilities, and components
import { partData, layerOptions } from './data/partData';
import { playChime, speakTerm } from './utils/audioSpeech';
import WelcomeScreen, { LungsIcon } from './components/WelcomeScreen';
import MiniLegend from './components/MiniLegend';
import PartCard from './components/PartCard';
import LungScene from './components/LungScene';
import TracheaSketchfabScene from './components/TracheaSketchfabScene';
import ArborBronchialisSketchfabScene from './components/ArborBronchialisSketchfabScene';
import PleuraScene from './components/PleuraScene';
import PulmoScene from './components/PulmoScene';
import AdminDashboard from './components/AdminDashboard';
import AdminLogin from './components/AdminLogin';
import PracticeModule from './components/PracticeModule';
import { supabase } from './utils/supabaseClient';

// New Restructure Components
import HomePage from './components/HomePage';
import SegmentQuiz from './components/SegmentQuiz';
import SegmentMaterial from './components/SegmentMaterial';
import CertificateModal from './components/CertificateModal';

function App() {
  const [lang, setLang] = useState('id'); // 'id' or 'en'
  const [isLanguageSelected, setIsLanguageSelected] = useState(false); // start selection flag
  const [currentStudent, setCurrentStudent] = useState('');
  const [isAdminActive, setIsAdminActive] = useState(false);
  const [isPracticeActive, setIsPracticeActive] = useState(false);

  // New Restructure States
  const [currentView, setCurrentView] = useState('welcome');
  const [activeSegment, setActiveSegment] = useState('Trachea');
  const [showCertificate, setShowCertificate] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLeftSidebarCollapsed, setIsLeftSidebarCollapsed] = useState(false);
  const [isRightPanelCollapsed, setIsRightPanelCollapsed] = useState(false);
  const [prevLeftCollapsed, setPrevLeftCollapsed] = useState(false);
  const [prevRightCollapsed, setPrevRightCollapsed] = useState(false);

  // Sync state if user exits HTML5 fullscreen using ESC key
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!document.fullscreenElement;
      if (!isCurrentlyFullscreen && isFullscreen) {
        setIsFullscreen(false);
        setIsLeftSidebarCollapsed(prevLeftCollapsed);
        setIsRightPanelCollapsed(prevRightCollapsed);
      }
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [isFullscreen, prevLeftCollapsed, prevRightCollapsed]);

  const handleToggleFullscreenState = (value) => {
    const nextFullscreen = typeof value === 'boolean' ? value : !isFullscreen;
    setIsFullscreen(nextFullscreen);
    if (nextFullscreen) {
      setPrevLeftCollapsed(isLeftSidebarCollapsed);
      setPrevRightCollapsed(isRightPanelCollapsed);
      setIsLeftSidebarCollapsed(true);
      setIsRightPanelCollapsed(true);
      
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => {
          console.warn("Failed to enter browser fullscreen:", err);
        });
      }
    } else {
      setIsLeftSidebarCollapsed(prevLeftCollapsed);
      setIsRightPanelCollapsed(prevRightCollapsed);
      
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(err => {
          console.warn("Failed to exit browser fullscreen:", err);
        });
      }
    }
  };

  const [segmentProgress, setSegmentProgress] = useState({
    'Trachea': { status: 'not_started', pretest: null, posttest: null },
    'Arbor Bronchialis': { status: 'not_started', pretest: null, posttest: null },
    'Pleura & Cavitas Pleuralis': { status: 'not_started', pretest: null, posttest: null },
    'Pulmo': { status: 'not_started', pretest: null, posttest: null }
  });

  // Rebuild Segment Progress based on completed quiz attempts
  const rebuildSegmentProgress = (attemptsList) => {
    const defaultProgress = {
      'Trachea': { status: 'not_started', pretest: null, posttest: null },
      'Arbor Bronchialis': { status: 'not_started', pretest: null, posttest: null },
      'Pleura & Cavitas Pleuralis': { status: 'not_started', pretest: null, posttest: null },
      'Pulmo': { status: 'not_started', pretest: null, posttest: null }
    };

    // Sort attempts chronologically
    const sorted = [...attemptsList].sort((a, b) => a.timestamp - b.timestamp);

    sorted.forEach(attempt => {
      const cat = attempt.category;
      if (cat.startsWith('Pre-test: ')) {
        const segId = cat.replace('Pre-test: ', '');
        if (defaultProgress[segId] !== undefined) {
          defaultProgress[segId].pretest = attempt.score;
          if (defaultProgress[segId].status === 'not_started') {
            defaultProgress[segId].status = 'in_progress';
          }
        }
      } else if (cat.startsWith('Kuis: ')) {
        const segId = cat.replace('Kuis: ', '');
        if (defaultProgress[segId] !== undefined) {
          defaultProgress[segId].posttest = attempt.score;
          defaultProgress[segId].status = 'completed';
        }
      }
    });

    setSegmentProgress(defaultProgress);
  };

  // Clean URL Routing state
  const [isAdminRouteActive, setIsAdminRouteActive] = useState(() => {
    const path = window.location.pathname.toLowerCase();
    const hash = window.location.hash.toLowerCase();
    return path === '/admin/login' || hash === '#/admin/login' || hash.includes('/admin/login');
  });

  const [activeId, setActiveId] = useState('trachea-pars-cervicalis');
  const [activeLayer, setActiveLayer] = useState('Semua');
  const [query, setQuery] = useState('');
  const [showLabels, setShowLabels] = useState(true);
  const [notice, setNotice] = useState('Klik titik + atau daftar bagian untuk mulai belajar.');
  
  const [exploredList, setExploredList] = useState(['trachea-pars-cervicalis']);
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
          rebuildSegmentProgress(formatted);
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
          rebuildSegmentProgress(studentAttempts);
        } else {
          setQuizAttempts([]);
          rebuildSegmentProgress([]);
        }
      } catch (e) {
        console.error('Failed to load local attempts history:', e);
      }
    }
  };

  // Log Practice Attempt to localstorage + Supabase
  const logPracticeAttempt = async (category, score, totalQuestions) => {
    const total = totalQuestions;
    
    // 1. LocalStorage Sync
    try {
      const savedAttempts = localStorage.getItem('respira_practice_attempts') || '[]';
      const attempts = JSON.parse(savedAttempts);
      attempts.push({
        username: currentStudent,
        category: category,
        score: score,
        totalQuestions: total,
        timestamp: Date.now()
      });
      localStorage.setItem('respira_practice_attempts', JSON.stringify(attempts));

      // Update student average score in local session
      const savedRecords = localStorage.getItem('respira_student_records') || '[]';
      const records = JSON.parse(savedRecords);
      const studentIdx = records.findIndex(r => r.username.toLowerCase() === currentStudent.toLowerCase());
      if (studentIdx !== -1) {
        const studentAttempts = attempts.filter(a => a.username.toLowerCase() === currentStudent.toLowerCase());
        const totalQuizScores = studentAttempts.reduce((sum, a) => sum + Math.round((a.score / a.totalQuestions) * 100), 0);
        records[studentIdx].average_score = Math.round(totalQuizScores / studentAttempts.length);
        localStorage.setItem('respira_student_records', JSON.stringify(records));
      }
    } catch (e) {
      console.error('Failed to write attempt to localStorage:', e);
    }

    // 2. Supabase Sync
    if (supabase) {
      try {
        const { error: attemptError } = await supabase
          .from('respira_practice_attempts')
          .insert({
            username: currentStudent,
            category: category,
            score: score,
            total_questions: total
          });

        if (attemptError) throw attemptError;

        // Fetch all attempts for this student to compute the new average score
        const { data: dbAttempts, error: fetchError } = await supabase
          .from('respira_practice_attempts')
          .select('score, total_questions')
          .eq('username', currentStudent);

        if (!fetchError && dbAttempts && dbAttempts.length > 0) {
          const totalScores = dbAttempts.reduce((sum, a) => sum + Math.round((a.score / a.total_questions) * 100), 0);
          const newAvg = Math.round(totalScores / dbAttempts.length);

          // Update student average_score in student profile table
          await supabase
            .from('respira_students')
            .update({ average_score: newAvg })
            .eq('username', currentStudent);
        }
        console.log('[Supabase] Successfully saved practice quiz report.');
      } catch (err) {
        console.warn('[Supabase] Failed to sync attempts to database:', err.message);
      }
    }

    // Refresh attempts
    await fetchStudentAttempts(currentStudent);
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

  async function handleChangeLanguage(selectedLang) {
    setLang(selectedLang);
    playChime('click');
    
    if (currentStudent) {
      // 1. Update LocalStorage
      try {
        const saved = localStorage.getItem('respira_student_records');
        const records = saved ? JSON.parse(saved) : [];
        const updated = records.map(r => 
          r.username.toLowerCase() === currentStudent.toLowerCase() 
            ? { ...r, lang: selectedLang } 
            : r
        );
        localStorage.setItem('respira_student_records', JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to save language locally:', e);
      }

      // 2. Update Supabase
      if (supabase) {
        try {
          await supabase
            .from('respira_students')
            .update({ lang: selectedLang })
            .eq('username', currentStudent);
        } catch (err) {
          console.warn('[Supabase] Failed to update language preference:', err.message);
        }
      }
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
    setCurrentView('home');
    playChime('complete');

    // Fetch attempts and scores immediately
    await fetchStudentAttempts(studentName);
    let hasLoadedFromDb = false;
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('respira_students')
          .select('explored_list, lang')
          .eq('username', studentName)
          .maybeSingle();

        if (!error && data) {
          const list = data.explored_list || ['trachea-pars-cervicalis'];
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
          setExploredList(existing.exploredList || ['trachea-pars-cervicalis']);
          if (existing.exploredList && existing.exploredList.length > 0) {
            setActiveId(existing.exploredList[existing.exploredList.length - 1]);
          }
        } else {
          setExploredList(['trachea-pars-cervicalis']);
          setActiveId('trachea-pars-cervicalis');
        }
      } catch (e) {
        console.error('Failed to load existing student record:', e);
      }
    }
    
    // Play warm vocal welcome!
    setTimeout(() => {
      if (selectedLang === 'id') {
        speakTerm(`Selamat datang ${studentName}. Silakan pilih segmen pembelajaran untuk mulai belajar.`, 'id');
      } else {
        speakTerm(`Welcome ${studentName}. Please select a learning segment to begin.`, 'en');
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

  const segmentParts = useMemo(() => {
    return partData.filter(p => p.layer.id === activeSegment);
  }, [activeSegment]);

  const segmentExploredCount = useMemo(() => {
    return segmentParts.filter(p => exploredList.includes(p.id)).length;
  }, [segmentParts, exploredList]);

  const handleProceedToPosttest = () => {
    const prog = segmentProgress[activeSegment] || { status: 'not_started', pretest: null, posttest: null };
    if (prog.posttest !== null) {
      if (window.confirm(lang === 'id' ? 'Anda sudah mengerjakan kuis ini. Kembali ke halaman utama?' : 'You have already taken this quiz. Return to homepage?')) {
        setCurrentView('home');
      }
    } else {
      setCurrentView('posttest');
    }
  };

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

  // 1. Welcoming Screen - if not logged in
  if (!isLanguageSelected) {
    return <WelcomeScreen onSelectLanguage={handleSelectLanguage} />;
  }

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>

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

      {/* Home Page View */}
      {currentView === 'home' && (
        <HomePage 
          username={currentStudent}
          lang={lang}
          segmentProgress={segmentProgress}
          onStartSegment={(segId) => {
            setActiveSegment(segId);
            const prog = segmentProgress[segId] || { status: 'not_started', pretest: null, posttest: null };
            if (prog.pretest === null) {
              setCurrentView('pretest');
            } else {
              setCurrentView('material');
            }
            playChime('click');
          }}
          onShowCertificate={() => {
            setShowCertificate(true);
            playChime('complete');
          }}
          onLogout={() => {
            setIsLanguageSelected(false);
            setCurrentStudent('');
            setExploredList(['trachea-pars-cervicalis']);
            setActiveId('trachea-pars-cervicalis');
            setCurrentView('welcome');
            playChime('click');
          }}
        />
      )}

      {/* Pre-test View */}
      {currentView === 'pretest' && (
        <SegmentQuiz 
          segmentId={activeSegment}
          type="pretest"
          lang={lang}
          username={currentStudent}
          onComplete={async (score, total) => {
            await logPracticeAttempt(`Pre-test: ${activeSegment}`, score, total);
            setCurrentView('material');
          }}
          onClose={() => {
            setCurrentView('home');
            playChime('click');
          }}
        />
      )}

      {/* Material View */}
      {currentView === 'material' && (
        <SegmentMaterial 
          segmentId={activeSegment}
          lang={lang}
          onNext={() => {
            setActiveLayer(activeSegment);
            const segParts = partData.filter(p => p.layer.id === activeSegment);
            if (segParts.length > 0) {
              setActiveId(segParts[0].id);
            }
            setCurrentView('3d_view');
            playChime('click');
          }}
          onClose={() => {
            setCurrentView('home');
            playChime('click');
          }}
        />
      )}

      {/* Post-test View */}
      {currentView === 'posttest' && (
        <SegmentQuiz 
          segmentId={activeSegment}
          type="posttest"
          lang={lang}
          username={currentStudent}
          pretestScore={segmentProgress[activeSegment]?.pretest}
          onComplete={async (score, total) => {
            await logPracticeAttempt(`Kuis: ${activeSegment}`, score, total);
            setCurrentView('home');
          }}
          onClose={() => {
            setCurrentView('home');
            playChime('click');
          }}
        />
      )}

      {/* Certificate Modal */}
      {showCertificate && (
        <CertificateModal 
          username={currentStudent}
          lang={lang}
          segmentProgress={segmentProgress}
          onClose={() => {
            setShowCertificate(false);
            playChime('click');
          }}
          onReset={() => {
            setShowCertificate(false);
            setIsLanguageSelected(false);
            setCurrentStudent('');
            setExploredList(['trachea-pars-cervicalis']);
            setActiveId('trachea-pars-cervicalis');
            setCurrentView('welcome');
            playChime('click');
          }}
        />
      )}

      {/* 3D Simulation Viewer (only rendered in '3d_view' view state) */}
      {currentView === '3d_view' && (
        <>


          <main 
            className={`app-shell ${isFullscreen ? 'fullscreen-mode' : ''}`}
            style={{
              gridTemplateColumns: `${isLeftSidebarCollapsed ? '0px' : '350px'} minmax(0, 1fr) ${isRightPanelCollapsed ? '0px' : '400px'}`,
              gap: (isLeftSidebarCollapsed && isRightPanelCollapsed) ? '0px' : '20px',
              padding: (isLeftSidebarCollapsed && isRightPanelCollapsed) ? '0px' : '20px'
            }}
          >
            {/* Desktop Floating Expand Buttons */}
            {isLeftSidebarCollapsed && (
              <button 
                className="floating-expand-btn left"
                onClick={() => setIsLeftSidebarCollapsed(false)}
                title={lang === 'id' ? 'Tampilkan Sidebar' : 'Show Sidebar'}
              >
                <ChevronRight size={18} />
              </button>
            )}

            {isRightPanelCollapsed && (
              <button 
                className="floating-expand-btn right"
                onClick={() => setIsRightPanelCollapsed(false)}
                title={lang === 'id' ? 'Tampilkan Detail' : 'Show Details'}
              >
                <ChevronLeft size={18} />
              </button>
            )}

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

            <aside 
              className={`left-panel glass-panel ${isSidebarOpen ? 'open' : ''}`}
              style={{ display: isLeftSidebarCollapsed ? 'none' : 'flex' }}
            >
              
              {/* Return to Dashboard back button */}
              <button 
                className="sidebar-practice-btn"
                style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', color: '#475569', boxShadow: 'none', marginBottom: '14px' }}
                onClick={() => {
                  setCurrentView('home');
                  playChime('click');
                }}
              >
                <ArrowLeft size={15} style={{ marginRight: '6px' }} />
                <span>{lang === 'id' ? 'Kembali ke Beranda' : 'Return to Dashboard'}</span>
              </button>

              <div className="brand-row">
                <div className="brand-mark">
                  <LungsIcon size={24} color="#0284c7" />
                </div>
                <div>
                  <p>{t.brandSubtitle}</p>
                  <h1>{t.brandTitle}</h1>
                </div>
                <button 
                  className="desktop-collapse-btn" 
                  onClick={() => setIsLeftSidebarCollapsed(true)}
                  title={lang === 'id' ? 'Sembunyikan Sidebar' : 'Collapse Sidebar'}
                  style={{ marginLeft: 'auto' }}
                >
                  <ChevronLeft size={16} />
                </button>
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
              
              {!isFullscreen && (
                <div id="segment-2d-portal-target" style={{ width: '100%', marginBottom: '14px' }} />
              )}

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
              {/* Floating progress banner for active segment */}
              <div className="viewer-progress-banner">
                <Microscope size={14} color="#0284c7" />
                <span>
                  {lang === 'id' ? 'Segmen:' : 'Segment:'} <strong>{activeSegment}</strong> · {lang === 'id' ? 'Eksplorasi:' : 'Explored:'} <strong>{segmentExploredCount} / {segmentParts.length}</strong>
                </span>
              </div>

              {/* Floating proceed to post-test button */}
              <button className="viewer-next-step-btn" onClick={handleProceedToPosttest}>
                <span>{lang === 'id' ? 'Lanjut ke Kuis Segmen' : 'Proceed to Segment Quiz'}</span>
                <ArrowRight size={15} />
              </button>

              <div className="top-toolbar glass-panel">
                <div>
                  <p className="eyebrow">{t.toolbarSubtitle}</p>
                  <strong>{t.toolbarTitle}</strong>
                </div>
                <div className="toolbar-actions">

                  {/* Dynamic Header Quick Language Switcher */}
                  <div className="language-selector-pill">
                    <button className={`lang-pill-btn ${lang === 'id' ? 'active' : ''}`} onClick={() => handleChangeLanguage('id')}>ID</button>
                    <button className={`lang-pill-btn ${lang === 'en' ? 'active' : ''}`} onClick={() => handleChangeLanguage('en')}>EN</button>
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

                  <button 
                    className={`soft-button ${isFullscreen ? 'active' : ''}`}
                    onClick={() => {
                      handleToggleFullscreenState();
                      playChime('click');
                    }}
                    title={lang === 'id' ? 'Layar Penuh' : 'Fullscreen'}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                  >
                    {isFullscreen ? (
                      <>
                        <Minimize2 size={13} />
                        <span>{lang === 'id' ? 'Keluar Layar Penuh' : 'Exit Fullscreen'}</span>
                      </>
                    ) : (
                      <>
                        <Maximize2 size={13} />
                        <span>{lang === 'id' ? 'Layar Penuh' : 'Fullscreen'}</span>
                      </>
                    )}
                  </button>
                  <span className="hint"><Rotate3D size={16} /> {t.toolbarHint}</span>
                </div>
              </div>

              {/* Dynamic 3D Laboratory Scene */}
              {activeSegment === 'Trachea' ? (
                <TracheaSketchfabScene
                  activeId={activeId}
                  activePart={activePart}
                  onSelect={selectPart}
                  showLabels={showLabels}
                  setNotice={setNotice}
                  breathingRate={breathingRate}
                  lang={lang}
                  isFullscreen={isFullscreen}
                  setIsFullscreen={handleToggleFullscreenState}
                />
              ) : activeSegment === 'Arbor Bronchialis' ? (
                <ArborBronchialisSketchfabScene
                  activeId={activeId}
                  activePart={activePart}
                  onSelect={selectPart}
                  showLabels={showLabels}
                  setNotice={setNotice}
                  breathingRate={breathingRate}
                  lang={lang}
                  isFullscreen={isFullscreen}
                  setIsFullscreen={handleToggleFullscreenState}
                />
              ) : activeSegment === 'Pleura & Cavitas Pleuralis' ? (
                <PleuraScene
                  activeId={activeId}
                  activePart={activePart}
                  onSelect={selectPart}
                  showLabels={showLabels}
                  setNotice={setNotice}
                  breathingRate={breathingRate}
                  lang={lang}
                  isFullscreen={isFullscreen}
                  setIsFullscreen={handleToggleFullscreenState}
                />
              ) : activeSegment === 'Pulmo' ? (
                <PulmoScene
                  activeId={activeId}
                  activePart={activePart}
                  onSelect={selectPart}
                  showLabels={showLabels}
                  setNotice={setNotice}
                  breathingRate={breathingRate}
                  lang={lang}
                  isFullscreen={isFullscreen}
                  setIsFullscreen={handleToggleFullscreenState}
                />
              ) : (
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
              )}
              
              {/* Breathing Simulation Controller Panel (Only visible for segments other than Trachea, Arbor Bronchialis, Pulmo, and Pleura) */}
              {activeSegment !== 'Trachea' && activeSegment !== 'Arbor Bronchialis' && activeSegment !== 'Pulmo' && activeSegment !== 'Pleura & Cavitas Pleuralis' && (
                <div className="breathing-rate-controller glass-panel">
                  <span className="controller-title">{t.simulatorTitle}</span>
                  <div className="rate-selector-grid">
                    <button className={breathingRate === 0 ? 'rate-btn active hold' : 'rate-btn'} onClick={() => setBreathingRate(0)}>{t.simulatorHold}</button>
                    <button className={breathingRate === 1 ? 'rate-btn active normal' : 'rate-btn'} onClick={() => setBreathingRate(1)}>{t.simulatorNormal}</button>
                    <button className={breathingRate === 2 ? 'rate-btn active rapid' : 'rate-btn'} onClick={() => setBreathingRate(2)}>{t.simulatorRapid}</button>
                  </div>
                </div>
              )}

              <div className="notice glass-panel">{notice}</div>
            </section>

            {/* Floating sheet handler for mobile sheet */}
            {isSheetExpanded && <div className="sheet-backdrop" onClick={() => setIsSheetExpanded(false)} />}

            <aside 
              className={`right-panel ${isSheetExpanded ? 'expanded' : ''}`}
              style={{ display: isRightPanelCollapsed ? 'none' : 'flex' }}
            >
              <div className="sheet-drag-handle" onClick={() => setIsSheetExpanded(!isSheetExpanded)}>
                <div className="handle-bar" />
              </div>

              {/* Desktop Collapse Button */}
              <div className="right-panel-header-desktop" style={{ width: '100%', display: 'flex', justifyContent: 'flex-end', padding: '0 8px 8px 0' }}>
                <button 
                  className="desktop-collapse-btn text-btn"
                  onClick={() => setIsRightPanelCollapsed(true)}
                  title={lang === 'id' ? 'Sembunyikan Panel' : 'Collapse Panel'}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: '700', color: '#64748b' }}
                >
                  <span>{lang === 'id' ? 'Sembunyikan Detail' : 'Sembunyikan Detail'}</span>
                  <ChevronRight size={15} />
                </button>
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
        </>
      )}

    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
