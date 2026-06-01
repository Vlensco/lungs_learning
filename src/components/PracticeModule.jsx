import React, { useState, useMemo } from 'react';
import { Microscope, Award, ArrowRight, RefreshCw, X, CheckCircle, AlertTriangle, ArrowLeft } from 'lucide-react';
import { partData, layerOptions } from '../data/partData';
import { playChime } from '../utils/audioSpeech';
import { supabase } from '../utils/supabaseClient';
import { set1Airways, set2PulmoPleura } from '../data/quizQuestions';

export default function PracticeModule({ username, lang, onClose }) {
  const [activeCategory, setActiveCategory] = useState('Semua');
  const [quizStarted, setQuizStarted] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false); // guard against double submit

  // Exclude layer options like 'Semua' or 'Mekanisme Bernapas' to map clean category queries
  const categories = useMemo(() => {
    return ['Semua', 'Saluran Napas', 'Lobus Paru', 'Fisura', 'Mikro', 'Mekanisme Bernapas'];
  }, []);

  // Compile interactive anatomical questions from the official DOCX question sets with full ID/EN translations!
  const generateQuestions = (category) => {
    const shuffleArray = (arr) => [...arr].sort(() => Math.random() - 0.5);

    let selectedQuestions = [];

    if (category === 'Saluran Napas' || category === 'Mikro') {
      // Use Set 1: airways & bronchioles questions (exactly 10 questions)
      selectedQuestions = shuffleArray(set1Airways).slice(0, 10);
    } else if (category === 'Lobus Paru' || category === 'Fisura' || category === 'Mekanisme Bernapas') {
      // Use Set 2: pulmo, hilum, & pleura questions (exactly 10 questions from the 12 available)
      selectedQuestions = shuffleArray(set2PulmoPleura).slice(0, 10);
    } else {
      // 'Semua' (All Segments) -> Target exactly 30 questions
      // Combine both official sets (22 questions)
      const officialPool = shuffleArray([...set1Airways, ...set2PulmoPleura]);
      
      // To reach exactly 30, we generate 8 dynamic questions from partData!
      const dynamicCount = 30 - officialPool.length; // 30 - 22 = 8
      const dynamicPool = [];
      const shuffledParts = shuffleArray(partData);

      for (let i = 0; i < dynamicCount; i++) {
        const targetPart = shuffledParts[i % shuffledParts.length];
        const qType = Math.floor(Math.random() * 3); // 0, 1, 2

        let questionText = '';
        let correctAnswer = '';
        let distractors = [];

        if (qType === 0) {
          questionText = lang === 'id' 
            ? `Manakah di bawah ini yang merupakan FUNGSI utama dari "${targetPart.name[lang]}"?`
            : `Which of the following is the primary FUNCTION of the "${targetPart.name[lang]}"?`;
          correctAnswer = targetPart.function[lang];
          distractors = partData
            .filter(p => p.id !== targetPart.id && p.function && p.function[lang] !== correctAnswer)
            .map(p => p.function[lang]);
        } else if (qType === 1) {
          questionText = lang === 'id'
            ? `Landmark anatomi manakah yang memiliki analogi medis: "${targetPart.analogy[lang]}"?`
            : `Which anatomical landmark has the following clinical analogy: "${targetPart.analogy[lang]}"?`;
          correctAnswer = targetPart.name[lang];
          distractors = partData
            .filter(p => p.id !== targetPart.id && p.name && p.name[lang] !== correctAnswer)
            .map(p => p.name[lang]);
        } else {
          questionText = lang === 'id'
            ? `Apa istilah medis/bahasa Inggris resmi untuk organ "${targetPart.name.id}"?`
            : `What is the official English/Latin translation for the structure "${targetPart.name.id}"?`;
          correctAnswer = targetPart.english;
          distractors = partData
            .filter(p => p.id !== targetPart.id && p.english !== correctAnswer)
            .map(p => p.english);
        }

        const uniqueDistractors = shuffleArray(Array.from(new Set(distractors.filter(Boolean)))).slice(0, 3);
        const options = shuffleArray([...uniqueDistractors, correctAnswer]);

        dynamicPool.push({
          id: `dynamic_${i}_${targetPart.id}`,
          questionText,
          options,
          correctAnswer
        });
      }

      // Combine official questions with our dynamic filler questions
      selectedQuestions = [...officialPool, ...dynamicPool];
    }

    // Ensure all options are shuffled and structured correctly based on active language
    return selectedQuestions.map(q => {
      let qText = '';
      let opts = [];
      let correctAns = '';

      if (q.id && q.id.startsWith("dynamic_")) {
        qText = q.questionText;
        opts = shuffleArray(q.options);
        correctAns = q.correctAnswer;
      } else {
        qText = q.questionText[lang] || q.questionText.id;
        opts = shuffleArray(q.options.map(opt => opt[lang] || opt.id));
        correctAns = q.options[q.correctAnswerIndex][lang] || q.options[q.correctAnswerIndex].id;
      }
      
      let partColor = '#0284c7'; // default sky-blue
      let partName = '';

      const textToSearch = typeof q.questionText === 'object' 
        ? (q.questionText.id + " " + q.questionText.en) 
        : q.questionText;

      const foundPart = partData.find(p => {
        return textToSearch.toLowerCase().includes(p.name.id.toLowerCase()) || 
               textToSearch.toLowerCase().includes(p.name.en.toLowerCase());
      });

      if (foundPart) {
        partColor = foundPart.color;
        partName = foundPart.name[lang];
      }

      return {
        questionText: qText,
        options: opts,
        correctAnswer: correctAns,
        partName,
        partColor
      };
    });
  };

  const handleStartQuiz = () => {
    playChime('click');
    const generated = generateQuestions(activeCategory);
    if (generated.length > 0) {
      setQuestions(generated);
      setCurrentIndex(0);
      setSelectedOption(null);
      setIsAnswered(false);
      setScore(0);
      setQuizCompleted(false);
      setIsSubmitting(false);
      setQuizStarted(true);
    }
  };

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
      if (!isSubmitting) handleCompleteQuiz();
    }
  };

  // Submit quiz results to Supabase + localstorage fallback
  const handleCompleteQuiz = async () => {
    if (isSubmitting) return; // prevent double submit
    setIsSubmitting(true);
    setIsLoading(true);
    playChime('complete');

    const totalQuestions = questions.length;
    const finalPercent = Math.round((score / totalQuestions) * 100);

    // 1. Sync to LocalStorage (Offline Mode)
    try {
      const savedAttempts = localStorage.getItem('respira_practice_attempts') || '[]';
      const attempts = JSON.parse(savedAttempts);
      attempts.push({
        username,
        category: activeCategory,
        score,
        totalQuestions,
        timestamp: Date.now()
      });
      localStorage.setItem('respira_practice_attempts', JSON.stringify(attempts));

      // Update student average score in local session
      const savedRecords = localStorage.getItem('respira_student_records') || '[]';
      const records = JSON.parse(savedRecords);
      const studentIdx = records.findIndex(r => r.username.toLowerCase() === username.toLowerCase());
      if (studentIdx !== -1) {
        const studentAttempts = attempts.filter(a => a.username.toLowerCase() === username.toLowerCase());
        const totalQuizScores = studentAttempts.reduce((sum, a) => sum + Math.round((a.score / a.totalQuestions) * 100), 0);
        records[studentIdx].average_score = Math.round(totalQuizScores / studentAttempts.length);
        localStorage.setItem('respira_student_records', JSON.stringify(records));
      }
    } catch (e) {
      console.error('Failed to write attempt to localStorage:', e);
    }

    // 2. Sync to Supabase Database (Real-time Cloud Mode)
    if (supabase) {
      try {
        // Insert practice attempt log
        const { error: attemptError } = await supabase
          .from('respira_practice_attempts')
          .insert({
            username: username,
            category: activeCategory,
            score: score,
            total_questions: totalQuestions
          });

        if (attemptError) throw attemptError;

        // Fetch all attempts for this student to compute the new average score
        const { data: dbAttempts, error: fetchError } = await supabase
          .from('respira_practice_attempts')
          .select('score, total_questions')
          .eq('username', username);

        if (!fetchError && dbAttempts && dbAttempts.length > 0) {
          const totalScores = dbAttempts.reduce((sum, a) => sum + Math.round((a.score / a.total_questions) * 100), 0);
          const newAvg = Math.round(totalScores / dbAttempts.length);

          // Update student average_score in student profile table
          await supabase
            .from('respira_students')
            .update({ average_score: newAvg })
            .eq('username', username);
        }
        console.log('[Supabase] Successfully saved practice quiz report.');
      } catch (err) {
        console.warn('[Supabase] Failed to sync attempts to database:', err.message);
      }
    }

    setIsLoading(false);
    setQuizCompleted(true);
  };

  return (
    <div className="practice-portal-overlay">
      <div className="practice-container glass-panel">
        
        {/* Header toolbar */}
        <header className="practice-header">
          <div className="practice-brand">
            <div className="practice-icon-box">
              <Microscope size={22} color="#0284c7" />
            </div>
            <div>
              <p className="practice-eyebrow">RESPIRA 3D CLINICAL LAB</p>
              <h2>{lang === 'id' ? 'Latihan & Kuis Anatomi' : 'Anatomy Practice & Quiz'}</h2>
            </div>
          </div>
          <button className="practice-close-btn" onClick={onClose} title={lang === 'id' ? 'Kembali ke Lab' : 'Back to Lab'}>
            <X size={18} />
          </button>
        </header>

        {/* QUIZ NOT STARTED SCREEN */}
        {!quizStarted && (
          <div className="practice-start-screen">
            <div className="quiz-banner-avatar">
              <Award size={48} color="#0284c7" />
            </div>
            <h3>{lang === 'id' ? 'Uji Kemampuan Medis Anda' : 'Test Your Medical Knowledge'}</h3>
            <p className="practice-desc-text">
              {lang === 'id' 
                ? 'Pilih kategori anatomi di bawah ini untuk memulai kuis evaluasi dinamis. Setiap kuis terdiri dari 5 soal acak berbasis kurikulum diagnostik kedokteran.' 
                : 'Select an anatomy category below to begin a dynamic evaluation quiz. Each quiz consists of 5 randomized diagnostic curriculum questions.'}
            </p>

            <div className="quiz-category-select-section">
              <h4>{lang === 'id' ? 'Pilih Kategori Kuis' : 'Select Quiz Category'}</h4>
              <div className="quiz-category-grid">
                {categories.map((catName) => {
                  let translatedCat = catName;
                  if (lang === 'en') {
                    if (catName === 'Semua') translatedCat = 'All Layers';
                    else if (catName === 'Saluran Napas') translatedCat = 'Airways';
                    else if (catName === 'Lobus Paru') translatedCat = 'Lung Lobes';
                    else if (catName === 'Fisura') translatedCat = 'Fissures';
                    else if (catName === 'Mikro') translatedCat = 'Micro';
                    else if (catName === 'Mekanisme Bernapas') translatedCat = 'Mechanics';
                  }
                  return (
                    <button
                      key={catName}
                      className={`quiz-cat-card ${activeCategory === catName ? 'active' : ''}`}
                      onClick={() => {
                        setActiveCategory(catName);
                        playChime('click');
                      }}
                    >
                      <strong>{translatedCat}</strong>
                    </button>
                  );
                })}
              </div>
            </div>

            <button className="quiz-launch-btn" onClick={handleStartQuiz}>
              <span>{lang === 'id' ? 'Mulai Latihan Sekarang' : 'Start Practice Now'}</span>
              <ArrowRight size={16} style={{ marginLeft: '8px' }} />
            </button>
          </div>
        )}

        {/* ACTIVE QUIZ SCREEN */}
        {quizStarted && !quizCompleted && (
          <div className="quiz-active-screen">
            <div className="quiz-progress-header">
              <div className="progress-text-label">
                <span>{lang === 'id' ? 'Soal' : 'Question'} {currentIndex + 1} {lang === 'id' ? 'dari' : 'of'} {questions.length}</span>
                <span className="category-tag">{activeCategory}</span>
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
                    <span>{lang === 'id' ? 'Benar! Jawaban Anda tepat.' : 'Correct! Well done.'}</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle size={16} />
                    <span>
                      {lang === 'id' 
                        ? `Salah! Jawaban yang benar adalah: ${questions[currentIndex].correctAnswer}` 
                        : `Incorrect! The correct answer is: ${questions[currentIndex].correctAnswer}`}
                    </span>
                  </>
                )}
              </div>
            )}

            {/* Navigation Button */}
            {isAnswered && (
              <button className="quiz-next-btn" onClick={handleNextQuestion}>
                <span>
                  {currentIndex + 1 === questions.length 
                    ? (lang === 'id' ? 'Selesaikan Kuis' : 'Finish Quiz') 
                    : (lang === 'id' ? 'Soal Berikutnya' : 'Next Question')}
                </span>
                <ArrowRight size={16} style={{ marginLeft: '8px' }} />
              </button>
            )}
          </div>
        )}

        {/* QUIZ COMPLETED SCREEN */}
        {quizCompleted && (
          <div className="quiz-completed-screen">
            {isLoading ? (
              <div className="quiz-saving-loader">
                <div className="loader-orb" />
                <p>{lang === 'id' ? 'Menyimpan riwayat latihan ke database...' : 'Syncing quiz results to database...'}</p>
              </div>
            ) : (
              <>
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

                <h3>{lang === 'id' ? 'Evaluasi Latihan Selesai!' : 'Practice Evaluation Finished!'}</h3>
                
                <p className="score-summary-text">
                  {lang === 'id' 
                    ? `Kerja bagus ${username}! Anda menjawab ${score} dari ${questions.length} soal dengan benar untuk kategori "${activeCategory}". Hasil latihan Anda otomatis terekam secara aman.` 
                    : `Great work ${username}! You answered ${score} of ${questions.length} questions correctly for the "${activeCategory}" layer. Your progress is safely registered.`}
                </p>

                <div className="score-rank-box">
                  <strong>
                    {score / questions.length >= 0.8 
                      ? (lang === 'id' ? '🏆 PENCAPAIAN: MEDIS UTAMA' : '🏆 RANK: CHIEF CLINICIAN') 
                      : score / questions.length >= 0.5 
                        ? (lang === 'id' ? '🩺 PENCAPAIAN: ASISTEN LABORAN' : '🩺 RANK: JUNIOR CLINICIAN')
                        : (lang === 'id' ? '🔬 PENCAPAIAN: MAHASISWA MAGANG' : '🔬 RANK: STUDENT ASSISTENT')}
                  </strong>
                </div>

                <div className="completed-actions-row">
                  <button className="completed-action-btn retry" onClick={handleStartQuiz}>
                    <RefreshCw size={14} style={{ marginRight: '6px' }} />
                    <span>{lang === 'id' ? 'Coba Lagi' : 'Retry Quiz'}</span>
                  </button>
                  <button className="completed-action-btn back" onClick={onClose}>
                    <ArrowLeft size={14} style={{ marginRight: '6px' }} />
                    <span>{lang === 'id' ? 'Kembali ke Lab' : 'Return to Lab'}</span>
                  </button>
                </div>
              </>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
