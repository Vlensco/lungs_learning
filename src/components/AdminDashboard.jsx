import React, { useMemo, useState, useEffect } from 'react';
import { Users, Award, Trash2, Download, RefreshCw, X, ShieldAlert, Microscope, Calendar, ArrowLeft, BarChart2, Eye, CheckCircle, XCircle, Clock } from 'lucide-react';
import { LungsIcon } from './WelcomeScreen';
import { playChime } from '../utils/audioSpeech';
import { supabase } from '../utils/supabaseClient';

export default function AdminDashboard({ onClose }) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detailStudent, setDetailStudent] = useState(null); // { username, attempts[] }
  const [detailLoading, setDetailLoading] = useState(false);

  // Fetch student logs from Supabase with LocalStorage offline fallback
  const fetchRecords = async () => {
    setLoading(true);
    let loadedFromDb = false;

    // 1. Fetch from Supabase
    if (supabase) {
      try {
        const { data: dbStudents, error } = await supabase
          .from('respira_students')
          .select('*')
          .order('username', { ascending: true });

        if (!error && dbStudents) {
          const formatted = dbStudents.map(s => ({
            username: s.username,
            lang: s.lang || 'id',
            exploredList: s.explored_list || ['trakea'],
            average_score: s.average_score || 0,
            timestamp: s.updated_at || s.created_at || Date.now()
          }));
          setRecords(formatted);
          loadedFromDb = true;
          console.log('[Supabase] Successfully fetched real-time student logs.');
        }
      } catch (err) {
        console.warn('[Supabase] Failed to query database logs:', err.message);
      }
    }

    // 2. LocalStorage Fallback (Offline Mode)
    if (!loadedFromDb) {
      try {
        const saved = localStorage.getItem('respira_student_records');
        setRecords(saved ? JSON.parse(saved) : []);
      } catch (e) {
        console.error('Failed to load local records:', e);
      }
    }
    setLoading(false);
  };

  useEffect(() => { fetchRecords(); }, []);

  // Calculate statistics
  const stats = useMemo(() => {
    const totalStudents = records.length;
    if (totalStudents === 0) {
      return { total: 0, avgMastery: 0, topStudent: '-', avgQuizScore: 0 };
    }

    let totalMastered = 0;
    let totalQuizScores = 0;
    let quizTakers = 0;
    let topProgress = -1;
    let topStudent = '-';

    records.forEach(r => {
      const masteredCount = Array.isArray(r.exploredList) ? r.exploredList.length : 0;
      totalMastered += masteredCount;
      
      if (r.average_score > 0) {
        totalQuizScores += r.average_score;
        quizTakers += 1;
      }

      const percent = Math.round((masteredCount / 19) * 100);
      if (percent > topProgress) {
        topProgress = percent;
        topStudent = `${r.username} (${percent}%)`;
      }
    });

    const avgMastery = Math.round(((totalMastered / (totalStudents * 19)) * 100));
    const avgQuizScore = quizTakers > 0 ? Math.round(totalQuizScores / quizTakers) : 0;

    return {
      total: totalStudents,
      avgMastery: Math.min(100, avgMastery),
      topStudent,
      avgQuizScore
    };
  }, [records]);

  // Delete a single student record (Supabase + LocalStorage sync)
  const handleDeleteRecord = async (username) => {
    if (window.confirm(`Hapus catatan eksplorasi untuk siswa "${username}"?`)) {
      // 1. Delete from Supabase
      if (supabase) {
        try {
          const { error } = await supabase
            .from('respira_students')
            .delete()
            .eq('username', username);
          if (error) throw error;
        } catch (err) {
          console.warn('[Supabase] Failed to delete database record:', err.message);
        }
      }

      // 2. Delete from LocalStorage
      const updated = records.filter(r => r.username !== username);
      localStorage.setItem('respira_student_records', JSON.stringify(updated));
      setRecords(updated);
      playChime('click');
    }
  };

  // Reset entire database
  const handleResetDatabase = async () => {
    if (window.confirm('PERINGATAN: Hapus semua catatan eksplorasi siswa? Tindakan ini tidak bisa dibatalkan!')) {
      // 1. Reset Supabase
      if (supabase) {
        try {
          const { error } = await supabase
            .from('respira_students')
            .delete()
            .neq('username', 'admin'); // Delete all except admin
          if (error) throw error;
        } catch (err) {
          console.warn('[Supabase] Failed to reset database tables:', err.message);
        }
      }

      // 2. Reset LocalStorage
      localStorage.removeItem('respira_student_records');
      localStorage.removeItem('respira_practice_attempts');
      setRecords([]);
      playChime('complete');
    }
  };

  // Export records to CSV format
  const handleExportCSV = () => {
    if (records.length === 0) {
      alert('Tidak ada data siswa untuk diekspor.');
      return;
    }

    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'Nama Siswa (Username),Bahasa,Tanggal Gabung,Jumlah Organ Dipelajari,Progress Mastered (%),Rata-rata Nilai Latihan (%)\n';

    records.forEach(r => {
      const count = Array.isArray(r.exploredList) ? r.exploredList.length : 0;
      const percent = Math.round((count / 19) * 100);
      const scoreStr = r.average_score > 0 ? `${r.average_score}%` : 'N/A';
      const dateStr = new Date(r.timestamp).toLocaleString('id-ID');
      csvContent += `"${r.username}","${r.lang.toUpperCase()}","${dateStr}",${count},${percent}%,${scoreStr}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `respira_3d_student_report_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    playChime('click');
  };

  // Fetch quiz attempts for a specific student (for Detail modal)
  const handleViewDetail = async (username) => {
    setDetailLoading(true);
    setDetailStudent({ username, attempts: [] });

    let attempts = [];
    let loadedFromDb = false;

    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('respira_practice_attempts')
          .select('*')
          .eq('username', username)
          .order('created_at', { ascending: false });

        if (!error && data) {
          attempts = data.map(a => ({
            category: a.category,
            score: a.score,
            totalQuestions: a.total_questions,
            timestamp: a.created_at
          }));
          loadedFromDb = true;
        }
      } catch (err) {
        console.warn('[Supabase] Failed to fetch student attempts:', err.message);
      }
    }

    if (!loadedFromDb) {
      try {
        const saved = localStorage.getItem('respira_practice_attempts');
        if (saved) {
          const all = JSON.parse(saved);
          attempts = all
            .filter(a => a.username?.toLowerCase() === username.toLowerCase())
            .sort((a, b) => b.timestamp - a.timestamp)
            .map(a => ({
              category: a.category,
              score: a.score,
              totalQuestions: a.totalQuestions,
              timestamp: new Date(a.timestamp).toISOString()
            }));
        }
      } catch (e) { console.error(e); }
    }

    setDetailStudent({ username, attempts });
    setDetailLoading(false);
  };

  return (
    <div className="admin-portal-overlay">
      <div className="admin-dashboard-container glass-panel">
        
        {/* Header */}
        <header className="admin-header">
          <div className="admin-brand-group">
            <div className="admin-logo-box">
              <LungsIcon size={26} color="#0284c7" />
            </div>
            <div>
              <p className="admin-subtitle">RESPIRA 3D SYSTEM PORTAL</p>
              <h1 className="admin-title">Anatomical Learning Management</h1>
            </div>
          </div>
          <button className="admin-close-btn" onClick={onClose} title="Kembali ke Laboratorium">
            <ArrowLeft size={16} style={{ marginRight: '6px' }} />
            <span>Kembali ke Lab (Back to Lab)</span>
          </button>
        </header>

        {/* Diagnostic Stats Grid */}
        <section className="admin-stats-grid">
          <article className="admin-stat-card">
            <div className="stat-icon-wrapper blue">
              <Users size={22} />
            </div>
            <div className="stat-info">
              <span className="stat-label">Total Siswa Uji Coba</span>
              <strong className="stat-value">{stats.total}</strong>
              <span className="stat-desc">Siswa terdaftar di database</span>
            </div>
          </article>
          
          <article className="admin-stat-card">
            <div className="stat-icon-wrapper teal">
              <Award size={22} />
            </div>
            <div className="stat-info">
              <span className="stat-label">Rata-rata Penguasaan</span>
              <strong className="stat-value">{stats.avgMastery}%</strong>
              <span className="stat-desc">Dari total 19 struktur klinis</span>
            </div>
          </article>

          <article className="admin-stat-card">
            <div className="stat-icon-wrapper amber">
              <BarChart2 size={22} />
            </div>
            <div className="stat-info">
              <span className="stat-label">Rata-rata Nilai Latihan</span>
              <strong className="stat-value">{stats.avgQuizScore}%</strong>
              <span className="stat-desc">Dari modul latihan kuis</span>
            </div>
          </article>
        </section>

        {/* Data Grid Section */}
        <section className="admin-table-section">
          <div className="table-header-row">
            <h2>Log Aktivitas Eksplorasi & Latihan (Student Logs)</h2>
            <div className="table-actions-group">
              <button 
                className="admin-action-btn reload" 
                onClick={fetchRecords}
                disabled={loading}
                title="Muat ulang data terbaru dari database"
              >
                <RefreshCw size={14} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
                <span>Reload Data</span>
              </button>
              <button className="admin-action-btn csv" onClick={handleExportCSV}>
                <Download size={14} />
                <span>Ekspor CSV (Excel)</span>
              </button>
              <button className="admin-action-btn reset" onClick={handleResetDatabase}>
                <RefreshCw size={14} />
                <span>Reset Database</span>
              </button>
            </div>
          </div>

          <div className="admin-table-wrapper">
            {loading ? (
              <div className="admin-loading-spinner">
                <div className="loader-orb" />
                <p>Memuat rekaman log dari database Supabase...</p>
              </div>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Nama Siswa (Username)</th>
                    <th>Bahasa</th>
                    <th>Tanggal Aktif</th>
                    <th>Progress Belajar</th>
                    <th>Rata-rata Nilai</th>
                    <th>Penguasaan (%)</th>
                    <th style={{ textAlign: 'center' }}>Tindakan</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((student) => {
                    const masteredCount = Array.isArray(student.exploredList) ? student.exploredList.length : 0;
                    const progressPercent = Math.round((masteredCount / 19) * 100);
                    const joinDate = new Date(student.timestamp).toLocaleString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    });

                    return (
                      <tr key={student.username}>
                        <td className="student-name-cell">
                          <span className="name-avatar">{student.username.slice(0,2).toUpperCase()}</span>
                          <strong>{student.username}</strong>
                        </td>
                        <td>
                          <span className={`lang-badge ${student.lang}`}>
                            {student.lang === 'id' ? '🇮🇩 ID' : '🇺🇸 EN'}
                          </span>
                        </td>
                        <td className="date-cell">
                          <Calendar size={13} style={{ marginRight: '6px' }} />
                          <span>{joinDate}</span>
                        </td>
                        <td className="progress-cell">
                          <div className="progress-bar-bg">
                            <div 
                              className="progress-bar-fill" 
                              style={{ 
                                width: `${progressPercent}%`, 
                                background: progressPercent > 75 ? '#16a34a' : progressPercent > 40 ? '#0284c7' : '#f97316'
                              }} 
                            />
                          </div>
                          <small>{masteredCount} / 19 Organ</small>
                        </td>
                        <td>
                          <strong className={`score-badge ${student.average_score >= 80 ? 'high' : student.average_score >= 50 ? 'mid' : 'low'}`}>
                            {student.average_score > 0 ? `${student.average_score}%` : '-'}
                          </strong>
                        </td>
                        <td>
                          <strong className={`percent-badge ${progressPercent > 75 ? 'high' : progressPercent > 40 ? 'mid' : 'low'}`}>
                            {progressPercent}%
                          </strong>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                            <button 
                              className="detail-record-btn" 
                              onClick={() => handleViewDetail(student.username)}
                              title="Lihat Detail Kuis"
                            >
                              <Eye size={13} style={{ marginRight: '4px' }} />
                              Detail
                            </button>
                            <button 
                              className="delete-record-btn" 
                              onClick={() => handleDeleteRecord(student.username)}
                              title="Hapus Data Siswa"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}

                  {records.length === 0 && (
                    <tr>
                      <td colSpan="7" className="admin-empty-state">
                        <ShieldAlert size={26} />
                        <p>Belum ada aktivitas eksplorasi terdaftar. Siswa harus masuk lewat layar Welcome untuk mencatatkan datanya.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </section>

        {/* Footer info */}
        <footer className="admin-portal-footer">
          <p>RESPIRA 3D Clinical Lab Management • Connected to Supabase Cloud Database • v1.2</p>
        </footer>

      </div>

      {/* STUDENT DETAIL MODAL */}
      {detailStudent && (
        <div className="detail-modal-overlay" onClick={() => setDetailStudent(null)}>
          <div className="detail-modal-card glass-panel" onClick={e => e.stopPropagation()}>
            <div className="detail-modal-header">
              <div>
                <p className="detail-modal-eyebrow">RIWAYAT KUIS LATIHAN</p>
                <h3 className="detail-modal-title">{detailStudent.username}</h3>
              </div>
              <button className="detail-modal-close" onClick={() => setDetailStudent(null)}>
                <X size={18} />
              </button>
            </div>

            <div className="detail-modal-body">
              {detailLoading ? (
                <div style={{ textAlign: 'center', padding: '30px' }}>
                  <div className="loader-orb" style={{ margin: '0 auto 12px' }} />
                  <p style={{ color: '#64748b', fontSize: '13px' }}>Memuat riwayat kuis...</p>
                </div>
              ) : detailStudent.attempts.length === 0 ? (
                <div className="detail-empty">
                  <Clock size={28} style={{ color: '#cbd5e1', marginBottom: '10px' }} />
                  <p>Belum ada kuis yang diselesaikan.</p>
                </div>
              ) : (
                <>
                  <div className="detail-summary-row">
                    <span>{detailStudent.attempts.length} percobaan kuis</span>
                    <span className="detail-avg-badge">
                      Rata-rata: {Math.round(detailStudent.attempts.reduce((s, a) => s + Math.round((a.score / a.totalQuestions) * 100), 0) / detailStudent.attempts.length)}%
                    </span>
                  </div>
                  <div className="detail-attempts-list">
                    {detailStudent.attempts.map((attempt, idx) => {
                      const pct = Math.round((attempt.score / attempt.totalQuestions) * 100);
                      const catMap = {
                        'Semua': 'Semua Lapisan',
                        'Saluran Napas': 'Saluran Napas',
                        'Lobus Paru': 'Lobus Paru',
                        'Fisura': 'Fisura',
                        'Mikro': 'Mikro',
                        'Mekanisme Bernapas': 'Mekanisme Bernapas'
                      };
                      const dateStr = new Date(attempt.timestamp).toLocaleString('id-ID', {
                        day: 'numeric', month: 'short', year: 'numeric',
                        hour: '2-digit', minute: '2-digit'
                      });
                      return (
                        <div key={idx} className="detail-attempt-row">
                          <div className="detail-attempt-left">
                            {pct >= 60 
                              ? <CheckCircle size={15} style={{ color: '#16a34a', flexShrink: 0 }} />
                              : <XCircle size={15} style={{ color: '#ef4444', flexShrink: 0 }} />}
                            <div>
                              <strong>{catMap[attempt.category] || attempt.category}</strong>
                              <small>{dateStr}</small>
                            </div>
                          </div>
                          <div className={`detail-score-pill ${pct >= 80 ? 'high' : pct >= 60 ? 'mid' : 'low'}`}>
                            {attempt.score}/{attempt.totalQuestions} <span>({pct}%)</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
