import React from 'react';
import { BookOpen, Brain, CheckCircle2, Target, X, Volume2, Award } from 'lucide-react';
import { speakTerm } from '../utils/audioSpeech';

export default function PartCard({ part, onClose, exploredList, onToggleLearned, lang }) {
  const isMastered = exploredList.includes(part.id);
  
  return (
    <section className="part-card" style={{ '--accent': part.color }}>
      <div className="part-card-top">
        <div className="part-card-title-group">
          <p className="eyebrow">{part.layer[lang]} · {part.view[lang]}</p>
          <div className="part-title-row">
            <h2>{part.name[lang]}</h2>
            <button 
              className="pronounce-button" 
              onClick={() => speakTerm(`${part.name[lang]}. ${part.short[lang]}. ${lang === 'id' ? 'Fungsinya:' : 'Function:'} ${part.function[lang]}`, lang)} 
              title={lang === 'id' ? 'Dengarkan Penjelasan Suara' : 'Listen to Voice Explanation'}
            >
              <Volume2 size={15} />
            </button>
          </div>
          <div className="part-title-row english-row">
            <p className="english">{part.english}</p>
            {lang === 'id' && (
              <button 
                className="pronounce-button secondary" 
                onClick={() => speakTerm(`${part.english}. ${part.short.en}. Function: ${part.function.en}`, 'en')} 
                title="Dengarkan penjelasan dalam Bahasa Inggris"
              >
                <Volume2 size={12} />
              </button>
            )}
          </div>
        </div>
        <button className="icon-button" onClick={onClose} aria-label="Tutup panel detail">
          <X size={18} />
        </button>
      </div>

      <button 
        className={`mastery-toggle-btn ${isMastered ? 'mastered' : ''}`}
        onClick={() => onToggleLearned(part.id)}
      >
        <Award size={15} />
        <span>
          {isMastered 
            ? (lang === 'id' ? 'Sudah Dikuasai ✓' : 'Mastered ✓') 
            : (lang === 'id' ? 'Tandai Sudah Dipelajari' : 'Mark as Studied')}
        </span>
      </button>

      <p className="short-copy">{part.short[lang]}</p>
      
      <div className="info-grid">
        <article>
          <Target size={17} />
          <div>
            <strong>{lang === 'id' ? 'Fungsi' : 'Function'}</strong>
            <p>{part.function[lang]}</p>
          </div>
        </article>
        <article>
          <BookOpen size={17} />
          <div>
            <strong>{lang === 'id' ? 'Penjelasan' : 'Explanation'}</strong>
            <p>{part.explanation[lang]}</p>
          </div>
        </article>
        <article>
          <CheckCircle2 size={17} />
          <div>
            <strong>{lang === 'id' ? 'Tugasnya' : 'Biological Role'}</strong>
            <p>{part.task[lang]}</p>
          </div>
        </article>
        <article>
          <Brain size={17} />
          <div>
            <strong>{lang === 'id' ? 'Analogi mudah' : 'Analogy'}</strong>
            <p>{part.analogy[lang]}</p>
          </div>
        </article>
      </div>
    </section>
  );
}
