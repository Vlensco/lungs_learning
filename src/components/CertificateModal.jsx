import React from 'react';
import { Award, Printer, LogOut, CheckCircle, Trophy, BookOpen } from 'lucide-react';
import { LungsIcon } from './WelcomeScreen';

export default function CertificateModal({ username, lang, segmentProgress, onClose, onReset }) {
  
  // Localized texts
  const t = {
    title: lang === 'id' ? 'SERTIFIKAT KELULUSAN' : 'CERTIFICATE OF COMPLETION',
    subtitle: lang === 'id' ? 'RESPIRA 3D CLINICAL ANATOMY LAB' : 'RESPIRA 3D CLINICAL ANATOMY LAB',
    textPresent: lang === 'id' ? 'Dengan ini menyatakan bahwa:' : 'This is to certify that:',
    textBody: lang === 'id'
      ? 'Telah berhasil menyelesaikan seluruh rangkaian pembelajaran interaktif, visualisasi 3D, serta evaluasi kurikulum anatomi paru-paru klinis dengan hasil sebagai berikut:'
      : 'Has successfully completed the entire suite of interactive training, 3D visualizations, and evaluations for the clinical lung anatomy curriculum with the following records:',
    tableSegment: lang === 'id' ? 'Segmen Kurikulum' : 'Curriculum Segment',
    tablePre: lang === 'id' ? 'Pre-test' : 'Pre-test',
    tablePost: lang === 'id' ? 'Post-test' : 'Post-test',
    tableImp: lang === 'id' ? 'Peningkatan' : 'Improvement',
    signDirector: lang === 'id' ? 'Silvy, Sp.P' : 'Silvy, Sp.P',
    signDirectorTitle: lang === 'id' ? 'Direktur Lab Klinis' : 'Clinical Lab Director',
    signCurriculum: lang === 'id' ? 'Ica, M.Biomed' : 'Ica, M.Biomed',
    signCurriculumTitle: lang === 'id' ? 'Spesialis Kurikulum' : 'Curriculum Specialist',
    sealText: lang === 'id' ? 'RESPIRA 3D PASSED' : 'RESPIRA 3D PASSED',
    printBtn: lang === 'id' ? 'Cetak Sertifikat' : 'Print Certificate',
    exitBtn: lang === 'id' ? 'Selesai & Keluar Sesi' : 'Finish & Logout',
    closeBtn: lang === 'id' ? 'Kembali ke Beranda' : 'Return to Dashboard',
    avgScore: lang === 'id' ? 'Rata-rata Skor Akhir:' : 'Average Final Score:',
    totalImp: lang === 'id' ? 'Total Kenaikan Nilai:' : 'Total Score Increase:'
  };

  const segments = [
    { id: 'Saluran Napas', title: lang === 'id' ? 'Saluran Napas Utama' : 'Main Airways' },
    { id: 'Lobus Paru', title: lang === 'id' ? 'Lobus Paru' : 'Lung Lobes' },
    { id: 'Fisura', title: lang === 'id' ? 'Fisura Paru' : 'Anatomical Fissures' },
    { id: 'Mikro', title: lang === 'id' ? 'Struktur Mikroskopis' : 'Microscopic Structures' },
    { id: 'Mekanisme Bernapas', title: lang === 'id' ? 'Mekanisme Bernapas' : 'Respiratory Mechanics' }
  ];

  // Calculate scores
  let totalPre = 0;
  let totalPost = 0;
  let count = 0;

  segments.forEach(seg => {
    const prog = segmentProgress[seg.id];
    if (prog) {
      totalPre += prog.pretest || 0;
      totalPost += prog.posttest || 0;
      count++;
    }
  });

  const avgPostPercent = Math.round(((totalPost / (count * 5)) * 100)) || 0;
  const avgPrePercent = Math.round(((totalPre / (count * 5)) * 100)) || 0;
  const improvement = avgPostPercent - avgPrePercent;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="certificate-overlay">
      <div className="certificate-card">
        
        {/* Decorative Frame border */}
        <div className="certificate-frame" />

        {/* Lungs Logo */}
        <div className="certificate-header-logo">
          <LungsIcon size={38} color="#0284c7" />
        </div>

        {/* Title */}
        <div className="certificate-title-box">
          <h2>{t.title}</h2>
          <h3>{t.subtitle}</h3>
        </div>

        <p className="certificate-text-present">{t.textPresent}</p>

        {/* Student Name */}
        <div className="certificate-recipient-name">
          {username}
        </div>

        <p className="certificate-text-body">{t.textBody}</p>

        {/* Scores Table */}
        <div className="certificate-scores-table-container">
          <table className="certificate-scores-table">
            <thead>
              <tr>
                <th style={{ width: '45%' }}>{t.tableSegment}</th>
                <th style={{ width: '18%', textAlign: 'right' }}>{t.tablePre}</th>
                <th style={{ width: '18%', textAlign: 'right' }}>{t.tablePost}</th>
                <th style={{ width: '19%', textAlign: 'right' }}>{t.tableImp}</th>
              </tr>
            </thead>
            <tbody>
              {segments.map(seg => {
                const prog = segmentProgress[seg.id] || { pretest: 0, posttest: 0 };
                const imp = prog.posttest - prog.pretest;
                const impPercent = imp * 20;

                return (
                  <tr key={seg.id}>
                    <td>{seg.title}</td>
                    <td style={{ textAlign: 'right', fontWeight: 600 }}>{prog.pretest}/5</td>
                    <td style={{ textAlign: 'right', fontWeight: 700, color: '#0284c7' }}>{prog.posttest}/5</td>
                    <td style={{ textAlign: 'right', fontWeight: 800, color: imp >= 0 ? '#10b981' : '#ef4444' }}>
                      {imp >= 0 ? '+' : ''}{impPercent}%
                    </td>
                  </tr>
                );
              })}
              
              {/* Summary Row */}
              <tr style={{ borderTop: '2px solid #cbd5e1', fontWeight: 800 }}>
                <td style={{ paddingTop: '10px' }}><strong>{t.avgScore}</strong></td>
                <td style={{ textAlign: 'right', paddingTop: '10px' }}>{avgPrePercent}%</td>
                <td style={{ textAlign: 'right', color: '#0284c7', paddingTop: '10px' }}>{avgPostPercent}%</td>
                <td style={{ textAlign: 'right', color: improvement >= 0 ? '#10b981' : '#ef4444', paddingTop: '10px' }}>
                  {improvement >= 0 ? '+' : ''}{improvement}%
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Signatures & Seal */}
        <div className="certificate-footer-row">
          
          <div className="certificate-signature-box">
            <div style={{ height: '32px', fontFamily: 'cursive', fontSize: '15px', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              Silvy
            </div>
            <span>{t.signDirector}</span>
            <small>{t.signDirectorTitle}</small>
          </div>

          <div className="certificate-seal-box">
            {t.sealText}
          </div>

          <div className="certificate-signature-box">
            <div style={{ height: '32px', fontFamily: 'cursive', fontSize: '15px', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              Ica
            </div>
            <span>{t.signCurriculum}</span>
            <small>{t.signCurriculumTitle}</small>
          </div>

        </div>

        {/* Buttons Action */}
        <div className="certificate-actions">
          <button className="certificate-actions-btn primary" onClick={handlePrint}>
            <Printer size={14} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '6px' }} />
            <span>{t.printBtn}</span>
          </button>
          
          <button className="certificate-actions-btn secondary" onClick={onClose}>
            <span>{t.closeBtn}</span>
          </button>

          <button className="certificate-actions-btn secondary" onClick={onReset} style={{ color: '#ef4444' }}>
            <LogOut size={14} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '6px' }} />
            <span>{t.exitBtn}</span>
          </button>
        </div>

      </div>
    </div>
  );
}
