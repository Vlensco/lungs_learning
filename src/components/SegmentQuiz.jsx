import React, { useState, useEffect, useMemo } from 'react';
import { Microscope, Award, ArrowRight, RefreshCw, X, CheckCircle, AlertTriangle, ArrowLeft } from 'lucide-react';
import { segmentQuestions } from '../data/quizQuestions';
import { playChime } from '../utils/audioSpeech';

export default function SegmentQuiz({ 
  segmentId, 
  type, 
  lang, 
  username, 
  pretestScore, 
  onComplete, 
  onClose 
}) {
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);

  // Initialize questions
  useEffect(() => {
    const pool = segmentQuestions[segmentId] || [];
    if (pool.length === 0) return;

    // Shuffle pool
    const shuffledPool = [...pool].sort(() => Math.random() - 0.5);
    
    // Select exactly 5 questions
    const selected = shuffledPool.slice(0, 5);

    // Format options and correct answers for active language
    const formatted = selected.map(q => {
      const qText = q.questionText[lang] || q.questionText.id;
      const opts = [...q.options].map(opt => opt[lang] || opt.id).sort(() => Math.random() - 0.5);
      const correctAns = q.options[q.correctAnswerIndex][lang] || q.options[q.correctAnswerIndex].id;

      return {
        id: q.id,
        questionText: qText,
        options: opts,
        correctAnswer: correctAns
      };
    });

    setQuestions(formatted);
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setQuizCompleted(false);
  }, [segmentId, type, lang]);

  const handleOptionSelect = (option) => {
    if (isAnswered) return;
    setSelectedOption(option);
    setIsAnswered(true);

    const isCorrect = option === questions[currentIndex].correctAnswer;
    if (isCorrect) {
      setScore(prev => prev + 1);
      playChime('complete');
    } else {
      playChime('click');
    }
  };

  const handleNextQuestion = () => {
    playChime('click');
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setQuizCompleted(true);
    }
  };

  const handleSubmitResults = () => {
    playChime('complete');
    onComplete(score);
  };

  // Localized texts
  const t = {
    pretestTitle: lang === 'id' ? 'Pre-test / Kuis Awal' : 'Pre-test / Initial Evaluation',
    posttestTitle: lang === 'id' ? 'Latihan Akhir / Kuis Segmen' : 'Post-test / Segment Quiz',
    questionLabel: lang === 'id' ? 'Soal' : 'Question',
    of: lang === 'id' ? 'dari' : 'of',
    correctFeedback: lang === 'id' ? 'Benar! Jawaban Anda tepat.' : 'Correct! Well done.',
    incorrectFeedback: lang === 'id' 
      ? `Salah! Jawaban yang benar adalah: ` 
      : `Incorrect! The correct answer is: `,
    nextBtn: lang === 'id' ? 'Soal Berikutnya' : 'Next Question',
    finishQuizBtn: lang === 'id' ? 'Lihat Hasil Kuis' : 'View Quiz Results',
    completedTitle: lang === 'id' ? 'Evaluasi Selesai!' : 'Evaluation Completed!',
    scoreLabel: lang === 'id' ? 'Skor Anda:' : 'Your Score:',
    pretestScoreLabel: lang === 'id' ? 'Skor Pre-test Sebelumnya:' : 'Previous Pre-test Score:',
    improvementLabel: lang === 'id' ? 'Peningkatan Pemahaman:' : 'Understanding Improvement:',
    closeBtn: lang === 'id' ? 'Lanjut ke Materi' : 'Proceed to Material',
    returnBtn: lang === 'id' ? 'Simpan & Kembali ke Beranda' : 'Save & Return to Dashboard',
    descPre: lang === 'id'
      ? 'Kuis awal ini bertujuan untuk mengukur pengetahuan dasar Anda mengenai segmen ini sebelum mempelajari materi.'
      : 'This pre-test aims to gauge your baseline knowledge about this segment before you review the materials.',
    descPost: lang === 'id'
      ? 'Kuis segmen ini mengukur tingkat pemahaman akhir Anda setelah melakukan rotasi simulasi dan membaca materi.'
      : 'This segment quiz measures your final understanding level after completing the 3D simulation and reading materials.'
  };

  if (questions.length === 0) return null;

  return (
    <div className="practice-portal-overlay">
      <div className="practice-container glass-panel">
        
        {/* Header */}
        <header className="practice-header">
          <div className="practice-brand">
            <div className="practice-icon-box">
              <Microscope size={22} color="#0284c7" />
            </div>
            <div>
              <p className="practice-eyebrow">{segmentId.toUpperCase()}</p>
              <h2>{type === 'pretest' ? t.pretestTitle : t.posttestTitle}</h2>
            </div>
          </div>
          <button className="practice-close-btn" onClick={onClose} title="Tutup">
            <X size={18} />
          </button>
        </header>

        {/* ACTIVE QUIZ SCREEN */}
        {!quizCompleted && (
          <div className="quiz-active-screen">
            <div className="quiz-progress-header">
              <div className="progress-text-label">
                <span>{t.questionLabel} {currentIndex + 1} {t.of} {questions.length}</span>
                <span className="category-tag">{type === 'pretest' ? 'PRE-TEST' : 'POST-TEST'}</span>
              </div>
              <div className="progress-bar-bg">
                <div 
                  className="progress-bar-fill" 
                  style={{ width: `${((currentIndex + 1) / questions.length) * 100}%`, background: '#0284c7' }} 
                />
              </div>
            </div>

            <div className="question-card">
              <p className="question-text">{questions[currentIndex].questionText}</p>
            </div>

            <div className="options-grid">
              {questions[currentIndex].options.map((option, idx) => {
                const correctOption = questions[currentIndex].correctAnswer;
                let optionClass = 'option-btn';
                
                if (isAnswered) {
                  if (option === correctOption) {
                    optionClass += ' correct';
                  } else if (option === selectedOption) {
                    optionClass += ' incorrect';
                  } else {
                    optionClass += ' disabled';
                  }
                }

                return (
                  <button
                    key={option}
                    className={optionClass}
                    onClick={() => handleOptionSelect(option)}
                    disabled={isAnswered}
                  >
                    <span className="option-indicator">{String.fromCharCode(65 + idx)}</span>
                    <span className="option-text-span">{option}</span>
                  </button>
                );
              })}
            </div>

            {/* Answer Feedbacks */}
            {isAnswered && (
              <div className={`answer-feedback-box ${selectedOption === questions[currentIndex].correctAnswer ? 'correct' : 'incorrect'}`}>
                {selectedOption === questions[currentIndex].correctAnswer ? (
                  <>
                    <CheckCircle size={16} />
                    <span>{t.correctFeedback}</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle size={16} />
                    <span>{t.incorrectFeedback} {questions[currentIndex].correctAnswer}</span>
                  </>
                )}
              </div>
            )}

            {/* Next Button */}
            {isAnswered && (
              <button className="quiz-next-btn" onClick={handleNextQuestion}>
                <span>{currentIndex + 1 === questions.length ? t.finishQuizBtn : t.nextBtn}</span>
                <ArrowRight size={16} style={{ marginLeft: '8px' }} />
              </button>
            )}
          </div>
        )}

        {/* QUIZ COMPLETED SCREEN */}
        {quizCompleted && (
          <div className="quiz-completed-screen">
            <div className="score-circular-chart-container">
              <svg viewBox="0 0 36 36" className="circular-chart score">
                <path className="circle-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                <path 
                  className="circle" 
                  strokeDasharray={`${(score / questions.length) * 100}, 100`} 
                  style={{ stroke: score / questions.length >= 0.8 ? '#16a34a' : score / questions.length >= 0.5 ? '#0284c7' : '#ea580c' }}
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
                />
                <text x="18" y="20.35" className="percentage">{Math.round((score / questions.length) * 100)}%</text>
              </svg>
            </div>

            <h3>{t.completedTitle}</h3>
            
            <div className="score-rank-box" style={{ width: '100%', maxWidth: '360px', display: 'flex', flexDirection: 'column', gap: '8px', padding: '16px', borderRadius: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#475569' }}>
                <span>{t.scoreLabel}</span>
                <strong style={{ color: '#0284c7' }}>{score} / {questions.length} ({Math.round((score / questions.length) * 100)}%)</strong>
              </div>

              {type === 'posttest' && pretestScore !== null && (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#475569', borderTop: '1px solid #e2e8f0', paddingTop: '8px' }}>
                    <span>{t.pretestScoreLabel}</span>
                    <strong>{pretestScore} / {questions.length} ({Math.round((pretestScore / questions.length) * 100)}%)</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#475569', borderTop: '1px solid #e2e8f0', paddingTop: '8px' }}>
                    <span>{t.improvementLabel}</span>
                    <strong style={{ color: score >= pretestScore ? '#16a34a' : '#ef4444' }}>
                      {score >= pretestScore ? '+' : ''}{Math.round(((score - pretestScore) / questions.length) * 100)}%
                    </strong>
                  </div>
                </>
              )}
            </div>

            <p className="score-summary-text" style={{ marginTop: '16px' }}>
              {type === 'pretest' ? t.descPre : t.descPost}
            </p>

            <button 
              className="quiz-launch-btn" 
              onClick={handleSubmitResults}
              style={{ marginTop: '16px', maxWidth: '320px' }}
            >
              <span>{type === 'pretest' ? t.closeBtn : t.returnBtn}</span>
              <ArrowRight size={16} style={{ marginLeft: '8px' }} />
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
