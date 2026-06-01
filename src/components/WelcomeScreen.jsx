import React from 'react';

// Reusable modern vector medical icon for Lungs
export const LungsIcon = ({ size = 22, color = "#2563eb" }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke={color} 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    {/* Trachea */}
    <path d="M12 3v6" strokeWidth="2.5" />
    <path d="M10 5h4" />
    <path d="M10 7h4" />
    
    {/* Left Lobe (clean modern anatomical contour lines) */}
    <path d="M12 9c-1.5 0.8 -3 1.5 -4.5 2.5" />
    <path d="M12 9c-3 0 -5 2 -5 6c0 3.5 1.5 5 4.5 5c1 0 1.5 -0.5 2 -1.5c0.5 -1 0.5 -2.5 0.5 -4.5" fill="none" />
    
    {/* Right Lobe */}
    <path d="M12 9c1.5 0.8 3 1.5 4.5 2.5" />
    <path d="M12 9c3 0 5 2 5 6c0 3.5 -1.5 5 -4.5 5c-1 0 -1.5 -0.5 -2 -1.5c-0.5 -1 -0.5 -2.5 -0.5 -4.5" fill="none" />
  </svg>
);

// Start Language Welcome Modal Component
export default function WelcomeScreen({ onSelectLanguage }) {
  return (
    <div className="welcome-overlay">
      <div className="welcome-modal-card">
        <div className="welcome-icon-box">
          <LungsIcon size={46} color="#0284c7" />
        </div>
        <h2>RESPIRA 3D</h2>
        <h3>Interactive Anatomical Laboratory</h3>
        <p className="welcome-desc">
          Selamat datang di simulator anatomi paru-paru interaktif berbasis referensi kedokteran klinis. 
          Pilih bahasa pengantar sebelum memulai demonstrasi.
          <br /><br />
          Welcome to the interactive lung anatomical simulator based on clinical medical references. 
          Please select your preferred language to begin.
        </p>
        <div className="lang-card-grid">
          <button className="lang-select-card" onClick={() => onSelectLanguage('id')}>
            <span className="lang-flag">🇮🇩</span>
            <strong>Bahasa Indonesia</strong>
            <span>Eksplorasi dalam Bahasa Indonesia</span>
          </button>
          <button className="lang-select-card" onClick={() => onSelectLanguage('en')}>
            <span className="lang-flag">🇺🇸</span>
            <strong>English (US)</strong>
            <span>Explore in US English</span>
          </button>
        </div>
        <p className="welcome-footer">RESPIRA 3D Learning Module • Inspired by TeachMeAnatomy</p>
      </div>
    </div>
  );
}
