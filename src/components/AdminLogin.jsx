import React, { useState } from 'react';
import { Shield, Key, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { LungsIcon } from './WelcomeScreen';
import { playChime } from '../utils/audioSpeech';

export default function AdminLogin({ onLoginSuccess }) {
  const [username, setUsername] = useState('dr.chairunnisa');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isShaking, setIsShaking] = useState(false);

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    
    if (username === 'dr.chairunnisa' && password === 'Qwerty123$%') {
      playChime('complete');
      onLoginSuccess();
    } else {
      playChime('click');
      setError('Username atau password salah! / Incorrect credentials!');
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
    }
  };

  const handleBackToLab = () => {
    playChime('click');
    // Clear URL paths and redirect back to standard homepage
    window.location.hash = '';
    window.location.pathname = '/';
  };

  return (
    <div className="admin-login-overlay">
      <div className={`admin-login-card glass-panel ${isShaking ? 'shake-anim' : ''}`}>
        
        <div className="admin-login-icon">
          <LungsIcon size={38} color="#0284c7" />
        </div>
        
        <h2>RESPIRA 3D SYSTEM</h2>
        <h3>Portal Admin Terproteksi</h3>
        <p className="admin-login-desc">
          Masuk untuk memonitor data pembelajaran siswa dan mengunduh laporan Excel (CSV).
        </p>

        <form onSubmit={handleLoginSubmit} className="admin-login-form">
          <div className="form-group">
            <label htmlFor="admin-username">Username</label>
            <div className="password-input-wrapper">
              <Key size={16} className="input-icon-left" />
              <input 
                id="admin-username" 
                type="text" 
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  if (error) setError('');
                }}
                placeholder="Masukkan username admin..."
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="admin-password">Kata Sandi / Password</label>
            <div className="password-input-wrapper">
              <Key size={16} className="input-icon-left" />
              <input 
                id="admin-password" 
                type={showPassword ? 'text' : 'password'} 
                placeholder="Masukkan password admin..." 
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError('');
                }}
                autoFocus
              />
              <button 
                type="button" 
                className="password-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {error && <p className="admin-login-error">{error}</p>}
          </div>

          <button type="submit" className="admin-submit-btn">
            <Shield size={16} style={{ marginRight: '6px' }} />
            <span>Verifikasi & Masuk</span>
          </button>
        </form>

        <button className="admin-back-link" onClick={handleBackToLab}>
          <ArrowLeft size={13} style={{ marginRight: '5px' }} />
          <span>Kembali ke Laboratorium (Back to Lab)</span>
        </button>

        <p className="admin-login-footer">
          Sistem Terproteksi • Hanya untuk penggunaan internal
        </p>

      </div>
    </div>
  );
}
