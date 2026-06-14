import React from 'react';
import { Award, BookOpen, GraduationCap, CheckCircle2, Layers3, Volume2, HelpCircle, LogOut } from 'lucide-react';
import { LungsIcon } from './WelcomeScreen';

export default function HomePage({ 
  username, 
  lang, 
  onLogout, 
  segmentProgress, 
  onStartSegment, 
  onShowCertificate 
}) {

  // Localized texts
  const text = {
    title: lang === 'id' ? 'Modul Anatomi Paru-Paru' : 'Lungs Anatomy Module',
    subtitle: lang === 'id' ? 'Menu Utama Pembelajaran' : 'Main Learning Dashboard',
    logout: lang === 'id' ? 'Keluar Sesi' : 'Logout Session',
    studentActive: lang === 'id' ? 'Mahasiswa Aktif' : 'Active Student',
    
    // Intro
    introTitle: lang === 'id' ? 'Pengantar Modul Respirasi' : 'Introduction to Respiratory Module',
    introDesc: lang === 'id' 
      ? 'Modul ini dirancang khusus untuk mahasiswa kedokteran dan profesional medis untuk memahami anatomi sistem respirasi secara mendalam. Pembelajaran dibagi menjadi 5 segmen terstruktur, masing-masing dilengkapi dengan evaluasi sebelum (Pre-test) dan sesudah (Post-test) untuk mengukur pemahaman akademis Anda secara presisi.'
      : 'This module is specifically designed for medical students and clinical professionals to comprehend the respiratory system. The learning is divided into 5 structured segments, each equipped with evaluations before (Pre-test) and after (Post-test) to measure your academic retention precisely.',
    
    // Objectives
    objTitle: lang === 'id' ? 'Tujuan Pembelajaran Klinis' : 'Clinical Learning Objectives',
    objectives: lang === 'id' ? [
      'Memahami anatomi makroskopis & mikroskopis dari saluran napas konduksi hingga alveolus.',
      'Mengidentifikasi pembagian lobus dan fisura paru kanan dan kiri secara tiga dimensi.',
      'Menganalisis hubungan antara bronkiolus, otot polos, dan patofisiologi konstriksi jalan napas.',
      'Mengkorelasikan fungsi piston diafragma terhadap fluktuasi tekanan udara rongga dada.',
    ] : [
      'Comprehend the macroscopic & microscopic anatomy from conducting airways to the alveoli.',
      'Identify the three-dimensional division of lobes and fissures in both right and left lungs.',
      'Analyze the relationship between bronchioles, smooth muscle, and the pathophysiology of airway constriction.',
      'Correlate the piston-like function of the diaphragm with pressure changes in the thoracic cavity.',
    ],

    // Terminology
    termTitle: lang === 'id' ? 'Terminologi Penting (Glossary)' : 'Key Clinical Terminology',
    terms: [
      {
        name: 'Bifurcatio Tracheae',
        desc: lang === 'id' 
          ? 'Titik percabangan trakea menjadi bronkus utama kanan dan kiri setinggi vertebra T4-T5.'
          : 'The anatomical division of the trachea into left and right main bronchi at T4-T5 vertebral levels.'
      },
      {
        name: 'Carina Tracheae',
        desc: lang === 'id'
          ? 'Batas tulang rawan di dalam bifurkasi trakea yang kaya akan reseptor refleks batuk.'
          : 'A highly sensitive cartilaginous ridge at the tracheal bifurcation that triggers the cough reflex.'
      },
      {
        name: 'Facies Mediastinalis',
        desc: lang === 'id'
          ? 'Permukaan paru-paru bagian dalam yang menghadap ke jantung, tempat hilum berada.'
          : 'The medial lung surface facing the heart/mediastinum, housing the hilum gateway.'
      },
      {
        name: 'Lingula Pulmonis',
        desc: lang === 'id'
          ? 'Bagian lobus superior kiri berbentuk lidah kecil, homolog dengan lobus medius kanan.'
          : 'A small tongue-like projection on the left superior lobe, homologue of the right middle lobe.'
      },
      {
        name: 'Bronkokonstriksi',
        desc: lang === 'id'
          ? 'Penyempitan lumen bronkiolus akibat kontraksi lapisan otot polos otonom.'
          : 'The narrowing of bronchiolar airways caused by autonomic smooth muscle contraction.'
      },
      {
        name: 'Pneumosit Tipe II',
        desc: lang === 'id'
          ? 'Sel sekretori kuboid alveolus penghasil surfaktan yang mencegah alveolus kolaps.'
          : 'Secretory cuboidal alveolar cells that synthesize surfactant to lower surface tension.'
      },
      {
        name: 'Recessus Pleura',
        desc: lang === 'id'
          ? 'Rongga pleura potensial (seperti kostodiafragmatikus) tempat berkumpulnya cairan efusi.'
          : 'Potential pleural spaces (like costodiaphragmatic) where pathologic fluids accumulate.'
      },
      {
        name: 'Nervus Phrenicus',
        desc: lang === 'id'
          ? 'Saraf motorik diafragma yang berasal dari akar saraf servikal spinal C3-C5.'
          : 'The motor innervation of the diaphragm originating from cervical spinal roots C3-C5.'
      }
    ],

    // Segments
    segTitle: lang === 'id' ? 'Kurikulum Segmen Pembelajaran' : 'Learning Segment Curriculum',
    segSub: lang === 'id' ? 'Selesaikan semua segmen untuk mendapatkan sertifikat kelulusan.' : 'Complete all segments to earn your completion certificate.',
    
    // Status
    notStarted: lang === 'id' ? 'Belum Dimulai' : 'Not Started',
    completed: lang === 'id' ? 'Selesai' : 'Completed',
    pretestScore: lang === 'id' ? 'Pre-test:' : 'Pre-test:',
    posttestScore: lang === 'id' ? 'Kuis Segmen:' : 'Segment Quiz:',
    startBtn: lang === 'id' ? 'Mulai Belajar' : 'Start Learning',
    reviewBtn: lang === 'id' ? 'Ulangi Materi' : 'Review Material',

    // Complete Banner
    completeBannerTitle: lang === 'id' ? '🎉 Selamat! Modul Selesai' : '🎉 Congratulations! Module Finished',
    completeBannerDesc: lang === 'id' 
      ? 'Anda telah menyelesaikan seluruh materi dan evaluasi klinis. Silakan buka sertifikat kelulusan akademis Anda.'
      : 'You have completed all materials and clinical evaluations. Please view your academic graduation certificate.',
    completeBannerBtn: lang === 'id' ? 'Selesaikan & Lihat Sertifikat' : 'Finish & View Certificate'
  };

  // Define segments static details
  const segments = [
    {
      id: 'Saluran Napas',
      title: lang === 'id' ? 'Saluran Napas Utama (Airways)' : 'Main Airways & Bronchi',
      parts: lang === 'id' 
        ? 'Trakea, Kartilago Trakea, Karina, Bronkus Utama Kanan/Kiri, Bronkus Lobaris, Bronkus Segmentalis'
        : 'Trachea, Tracheal Cartilages, Carina, Right/Left Main Bronchi, Lobar Bronchi, Segmental Bronchi'
    },
    {
      id: 'Lobus Paru',
      title: lang === 'id' ? 'Lobus Paru (Lung Lobes)' : 'Lung Lobes & Facies',
      parts: lang === 'id'
        ? 'Lobus Superior Kanan, Lobus Medius Kanan, Lobus Inferior Kanan, Lobus Superior Kiri, Lobus Inferior Kiri'
        : 'Right Superior, Middle, and Inferior Lobes; Left Superior and Inferior Lobes'
    },
    {
      id: 'Fisura',
      title: lang === 'id' ? 'Fisura Paru (Fissures)' : 'Anatomical Fissures',
      parts: lang === 'id'
        ? 'Fisura Horizontal Kanan, Fisura Oblique Kanan, Fisura Oblique Kiri'
        : 'Right Horizontal Fissure, Right Oblique Fissure, Left Oblique Fissure'
    },
    {
      id: 'Mikro',
      title: lang === 'id' ? 'Mikroskopis Paru (Microscopic)' : 'Microscopic Structures',
      parts: lang === 'id'
        ? 'Bronkiolus Terminalis/Respiratorius, Otot Polos Bronkiolus, Sakus Alveolar'
        : 'Terminal/Respiratory Bronchioles, Bronchial Smooth Muscles, Alveoli'
    },
    {
      id: 'Mekanisme Bernapas',
      title: lang === 'id' ? 'Mekanisme Bernapas (Mechanics)' : 'Respiratory Mechanics',
      parts: lang === 'id'
        ? 'Diafragma Utama, Pleura Parietalis/Visceralis, Cavitas Pleuralis'
        : 'Primary Diaphragm, Parietal/Visceral Pleura, Pleural Cavity'
    }
  ];

  // Check if all segments are completed (post-test taken)
  const allCompleted = segments.every(seg => segmentProgress[seg.id]?.status === 'completed');

  return (
    <div className="homepage-container">
      
      {/* Clinician Header */}
      <header className="homepage-header">
        <div className="homepage-header-inner">
          <div className="homepage-brand">
            <div className="homepage-logo-box">
              <LungsIcon size={24} color="#0284c7" />
            </div>
            <div className="homepage-title-box">
              <h1>RESPIRA 3D</h1>
              <p>{text.title}</p>
            </div>
          </div>

          <div className="homepage-profile-group">
            <div className="homepage-student-badge">
              <div className="avatar-circle">{username.slice(0, 2).toUpperCase()}</div>
              <div className="homepage-student-info">
                <small>{text.studentActive}</small>
                <strong>{username}</strong>
              </div>
            </div>
            <button className="homepage-logout-btn" onClick={onLogout}>
              <LogOut size={14} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '6px' }} />
              <span>{text.logout}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Layout */}
      <main className="homepage-content">
        
        {/* Intro & Objectives */}
        <section className="intro-objectives-card glass-panel">
          <article className="intro-part">
            <h2>{text.introTitle}</h2>
            <p>{text.introDesc}</p>
          </article>
          <article className="objectives-part">
            <h3>{text.objTitle}</h3>
            <div className="objectives-list">
              {text.objectives.map((obj, i) => (
                <div key={i} className="objective-item">
                  <CheckCircle2 size={16} color="#16a34a" />
                  <span>{obj}</span>
                </div>
              ))}
            </div>
          </article>
        </section>

        {/* Key Terminology glossary */}
        <section className="terminology-section">
          <h3>
            <BookOpen size={16} color="#0284c7" />
            <span>{text.termTitle}</span>
          </h3>
          <div className="terminology-grid">
            {text.terms.map((term, i) => (
              <div key={i} className="terminology-card">
                <strong>{term.name}</strong>
                <p>{term.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Segments Curriculum List */}
        <section className="segments-section">
          <div>
            <h3>
              <Layers3 size={16} color="#0284c7" />
              <span>{text.segTitle}</span>
            </h3>
            <p style={{ margin: '4px 0 0 24px', fontSize: '12px', color: '#64748b' }}>{text.segSub}</p>
          </div>

          <div className="segments-grid">
            {segments.map((seg, index) => {
              const prog = segmentProgress[seg.id] || { status: 'not_started', pretest: null, posttest: null };
              const isDone = prog.status === 'completed';

              return (
                <div key={seg.id} className={`segment-card glass-panel ${isDone ? 'completed' : ''}`}>
                  <div className="segment-card-header">
                    <span className="segment-index">Segmen {index + 1}</span>
                    <span className={`segment-badge ${isDone ? 'completed' : 'not-started'}`}>
                      {isDone ? text.completed : text.notStarted}
                    </span>
                  </div>

                  <h4>{seg.title}</h4>
                  <p className="segment-parts-list">{seg.parts}</p>

                  <div className="segment-status-row">
                    <div className="segment-score-badge">
                      <span>{text.pretestScore}</span>
                      <span>{prog.pretest !== null ? `${prog.pretest}/5` : '-'}</span>
                    </div>
                    <div className="segment-score-badge">
                      <span>{text.posttestScore}</span>
                      <span>{prog.posttest !== null ? `${prog.posttest}/5` : '-'}</span>
                    </div>
                  </div>

                  <button className="segment-action-btn" onClick={() => onStartSegment(seg.id)}>
                    {isDone ? text.reviewBtn : text.startBtn}
                  </button>
                </div>
              );
            })}
          </div>
        </section>

        {/* If all segments are completed, show the premium Certificate trigger */}
        {allCompleted && (
          <section className="homepage-complete-banner">
            <div className="complete-banner-text">
              <h3>{text.completeBannerTitle}</h3>
              <p>{text.completeBannerDesc}</p>
            </div>
            <button className="complete-module-btn" onClick={onShowCertificate}>
              <Award size={18} />
              <span>{text.completeBannerBtn}</span>
            </button>
          </section>
        )}

      </main>
    </div>
  );
}
