// Warm up voices as early as possible and handle async voice loading
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  window.speechSynthesis.getVoices();
  window.speechSynthesis.onvoiceschanged = () => {
    window.speechSynthesis.getVoices();
  };
}

// Synthesized clinical chime using Web Audio API
export function playChime(type = 'click') {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    const now = ctx.currentTime;
    
    if (type === 'click') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(1200, now + 0.05);
      
      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      
      osc.start(now);
      osc.stop(now + 0.15);
    } else if (type === 'complete') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.setValueAtTime(659.25, now + 0.06); // E5
      osc.frequency.setValueAtTime(783.99, now + 0.12); // G5
      osc.frequency.exponentialRampToValueAtTime(1046.50, now + 0.24); // C6
      
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
      
      osc.start(now);
      osc.stop(now + 0.6);
    }
  } catch (e) {
    console.warn('AudioContext failed:', e);
  }
}

// Pronounce anatomical terms using window.speechSynthesis
export function speakTerm(text, lang = 'id') {
  if ('speechSynthesis' in window) {
    try {
      // Crucial: Resume in case Chrome's speech engine is stuck in paused state
      window.speechSynthesis.resume();
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang === 'id' ? 'id-ID' : 'en-US';
      
      // Set clinical, calm rate for reading (slightly slower for high-fidelity comprehension)
      utterance.rate = lang === 'id' ? 0.94 : 0.90;
      utterance.pitch = 1.0;
      
      // Select the best voice from loaded voices
      const voices = window.speechSynthesis.getVoices();
      if (voices && voices.length > 0) {
        const targetLang = lang === 'id' ? 'id' : 'en';
        
        // Find all voices matching the target language prefix
        const langVoices = voices.filter(v => {
          const vLang = v.lang.toLowerCase().replace('_', '-');
          return vLang.startsWith(targetLang) || vLang.includes('-' + targetLang) || vLang.includes(targetLang + '-');
        });

        if (langVoices.length > 0) {
          // Priority 1: Microsoft Edge "Natural" Online voices (extremely human-like, e.g. "Gadis Online (Natural)")
          let selectedVoice = langVoices.find(v => v.name.toLowerCase().includes('natural') && v.name.toLowerCase().includes('online'));
          
          // Priority 2: Any "Natural" neural voice (e.g. cloud voices)
          if (!selectedVoice) {
            selectedVoice = langVoices.find(v => v.name.toLowerCase().includes('natural'));
          }
          
          // Priority 3: "Online" cloud-synthesized voices (ultra-clear)
          if (!selectedVoice) {
            selectedVoice = langVoices.find(v => v.name.toLowerCase().includes('online'));
          }
          
          // Priority 4: "Google" neural/web voices (very clear, much better than legacy offline ones)
          if (!selectedVoice) {
            selectedVoice = langVoices.find(v => v.name.toLowerCase().includes('google'));
          }
          
          // Priority 5: Specific known good local voices (e.g., Apple's Damayanti or Windows Gadis/Andika)
          if (!selectedVoice && lang === 'id') {
            selectedVoice = langVoices.find(v => 
              v.name.toLowerCase().includes('damayanti') || 
              v.name.toLowerCase().includes('gadis') || 
              v.name.toLowerCase().includes('andika')
            );
          }
          
          // Priority 6: Fallback to exact match locale
          if (!selectedVoice) {
            selectedVoice = langVoices.find(v => {
              const vLang = v.lang.toLowerCase().replace('_', '-');
              return vLang === (lang === 'id' ? 'id-id' : 'en-us');
            });
          }
          
          // Priority 7: First available voice for this language
          if (!selectedVoice) {
            selectedVoice = langVoices[0];
          }
          
          utterance.voice = selectedVoice;
        }
      }
      
      // CRITICAL: Prevent speech cuts by storing the utterance on the window object
      // to protect it from JavaScript garbage collection.
      window.activeUtterance = utterance;
      
      utterance.onend = () => {
        window.activeUtterance = null;
      };
      
      utterance.onerror = (e) => {
        // Suppress standard SpeechSynthesis interruption logs in the console
        if (e.error !== 'interrupted') {
          console.warn('SpeechSynthesisUtterance status:', e.error || e);
        }
        window.activeUtterance = null;
        window.speechSynthesis.resume();
      };
      
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.error('SpeechSynthesis failed to speak:', e);
    }
  }
}
