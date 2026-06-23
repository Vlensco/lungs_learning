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
    introTitle: lang === 'id' ? 'Pengantar & Pembagian Sistem Respirasi' : 'Introduction & Divisions of the Respiratory System',
    introDesc: lang === 'id' 
      ? 'Menurut anatominya, Sistem Respirasi dibagi dalam dua kelompok fungsional utama:'
      : 'Anatomically, the Respiratory System is divided into two primary functional groups:',
    superiorTitle: lang === 'id' ? 'Sistem Respirasi Superior' : 'Superior Respiratory System',
    superiorItems: lang === 'id' ? [
      'Hidung bagian luar (nasus externus) & rongga hidung (cavitas nasi)',
      'Sinus paranasalis',
      'Pharynx: Hanya pars nasalis pharyngis (bagian paling superior) yang sekedar menjadi jalan napas. Di pars oralis pharyngis (bagian tengah), terjadi persilangan antara jalan pernapasan dan jalan makanan.'
    ] : [
      'External nose (nasus externus) & nasal cavity (cavitas nasi)',
      'Paranasal sinuses',
      'Pharynx: Only the pars nasalis pharyngis (most superior part) serves purely as an airway. In the pars oralis pharyngis (middle part), there is a crossover between the respiratory and digestive pathways.'
    ],
    inferiorTitle: lang === 'id' ? 'Sistem Respirasi Inferior' : 'Inferior Respiratory System',
    inferiorItems: lang === 'id' ? [
      'Larynx: Berperan untuk pembentukan suara dan penutupan sementara jalan pernapasan ketika menelan.',
      'Trachea',
      'Dua bronchus utama (Bronchi principales): Lanjutan Trachea yang kemudian bercabang-cabang beberapa kali.',
      'Alveoli: Berada di ujung percabangan ini; di sini, terjadi pertukaran gas.'
    ] : [
      'Larynx: Functions in voice production and temporary closure of the airway when swallowing.',
      'Trachea',
      'Two main bronchi (Bronchi principales): Continuation of the Trachea which then branches multiple times.',
      'Alveoli: Located at the end of the branching tree; the site of gas exchange.'
    ],
    
    // Objectives
    objTitle: lang === 'id' ? 'Capaian Pembelajaran' : 'Learning Objectives',
    objectives: lang === 'id' ? [
      'Mengidentifikasi struktur anatomi makroskopis sistem respirasi pada model 3D',
      'Memvisualisasikan hubungan spasial tiga dimensi',
      'Menelusuri percabangan arbor bronchialis secara berurutan pada model 3D',
      'Membedakan karakteristik anatomi bronchus dextra dan sinistra',
      'Mengidentifikasi lobus pulmonalis, fissura pulmonis, facies pulmonis, margo pulmonis, hilum pulmonis, dan radix pulmonis pada media 3D.',
      'Menentukan lokasi dan batas segmen bronkopulmonal',
      'Mengidentifikasi komponen pleura dan cavitas pleuralis'
    ] : [
      'Identify the macroscopic anatomical structures of the respiratory system on a 3D model',
      'Visualize three-dimensional spatial relationships',
      'Trace the branching of the bronchial tree (arbor bronchialis) sequentially on a 3D model',
      'Differentiate between the anatomical characteristics of the right and left bronchi',
      'Identify the lung lobes, fissures, surfaces, margins, hilum, and root (radix pulmonis) on a 3D medium',
      'Determine the location and boundaries of bronchopulmonary segments',
      'Identify the components of the pleura and pleural cavity'
    ],

    // Terminology
    termTitle: lang === 'id' ? 'Terminologi Dasar & Penting' : 'Basic & Key Terminology',
    terms: [
      {
        name: 'Pulmo (Pulmones)',
        desc: lang === 'id'
          ? 'Paru-paru: Organ utama respirasi tempat pertukaran gas O2 dan CO2 terjadi.'
          : 'Lungs: The primary organs of respiration where O2 and CO2 gas exchange occurs.'
      },
      {
        name: 'Cavitas Thoracis',
        desc: lang === 'id'
          ? 'Rongga dada: Rongga tubuh yang dilindungi oleh sangkar tulang rusuk, berisi paru-paru dan jantung.'
          : 'Thoracic cavity: The body cavity protected by the ribs, containing the lungs and heart.'
      },
      {
        name: 'Cavitas Pleuralis',
        desc: lang === 'id'
          ? 'Rongga pleura: Rongga potensial kedap udara di antara pleura visceralis dan parietalis.'
          : 'Pleural cavity: The potential airtight space between the visceral and parietal pleura.'
      },
      {
        name: 'Cor',
        desc: lang === 'id'
          ? 'Jantung: Organ muscular berongga yang memompa darah ke seluruh tubuh, terletak di mediastinum.'
          : 'Heart: The hollow muscular organ that pumps blood throughout the body, situated in the mediastinum.'
      },
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
      id: 'Trachea',
      title: lang === 'id' ? 'Trachea (Trakea)' : 'Trachea',
      parts: lang === 'id' 
        ? 'Trakea Cervical & Thoracic, Cartilagines Tracheales, Ligamenta Annularia, Bifurcatio Trachea'
        : 'Cervical & Thoracic Trachea, Tracheal Cartilages, Annular Ligaments, Tracheal Bifurcation'
    },
    {
      id: 'Arbor Bronchialis',
      title: lang === 'id' ? 'Arbor Bronchialis (Cabang Bronkus)' : 'Bronchial Tree',
      parts: lang === 'id' 
        ? 'Bronchus Principalis, Bronchus Lobaris (Superior/Medius/Inferior), Bronkiolus, Alveoli'
        : 'Main Bronchus, Lobar Bronchi (Superior/Middle/Inferior), Bronchioles, Alveolar Sacs'
    },
    {
      id: 'Pleura & Cavitas Pleuralis',
      title: lang === 'id' ? 'Pleura & Cavitas Pleuralis' : 'Pleura & Pleural Cavity',
      parts: lang === 'id'
        ? 'Pleura Parietalis, Pleura Visceralis, Cavitas Pleuralis'
        : 'Parietal Pleura, Visceral Pleura, Pleural Cavity'
    },
    {
      id: 'Pulmo',
      title: lang === 'id' ? 'Pulmo (Paru-Paru)' : 'Lungs (Pulmo)',
      parts: lang === 'id'
        ? 'Apex, Basis, Radix, Hilum, Ligamentum Pulmonale, Lobus & Fissura (Dextra/Sinistra), Margines'
        : 'Apex, Base, Root, Hilum, Pulmonary Ligament, Lobes & Fissures (Right/Left), Borders'
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
            <div>
              <h2>{text.introTitle}</h2>
              <p style={{ margin: 0 }}>{text.introDesc}</p>
            </div>
            
            <div className="divisions-grid">
              {/* Superior Respiratory System Column */}
              <div className="division-col superior">
                <strong>
                  {text.superiorTitle}
                </strong>
                <ul>
                  {text.superiorItems.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>
              
              {/* Inferior Respiratory System Column */}
              <div className="division-col inferior">
                <strong>
                  {text.inferiorTitle}
                </strong>
                <ul>
                  {text.inferiorItems.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
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
                      <span>{prog.pretest !== null ? `${prog.pretest}/${seg.id === 'Pleura & Cavitas Pleuralis' ? 5 : 10}` : '-'}</span>
                    </div>
                    <div className="segment-score-badge">
                      <span>{text.posttestScore}</span>
                      <span>{prog.posttest !== null ? `${prog.posttest}/${seg.id === 'Pleura & Cavitas Pleuralis' ? 5 : 10}` : '-'}</span>
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
