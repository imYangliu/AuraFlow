import { useState, useEffect } from 'react';
import { safeInvoke } from '../utils/tauri';

export default function BreakView() {
  const [timeLeft, setTimeLeft] = useState(() => {
    const storedDuration = localStorage.getItem('breakDuration');
    return storedDuration ? parseInt(storedDuration) : 300;
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          safeInvoke('close_break_window');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleSkip = () => {
    safeInvoke('close_break_window');
    // Fallback for browser preview
    if (!window.__TAURI_INTERNALS__) {
        window.history.back();
    }
  };

  return (
    <div className="break-container" style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      backgroundColor: '#2c3e50',
      color: 'white',
      textAlign: 'center'
    }}>
      <h1>🌲 Take a Deep Breath 🌲</h1>
      <div style={{ fontSize: '5rem', margin: '2rem 0' }}>{formatTime(timeLeft)}</div>
      <p style={{ fontSize: '1.5rem' }}>Your forest is growing...</p>
      <div style={{ fontSize: '4rem', animation: 'pulse 2s infinite' }}>🌳</div>
      
      <button 
        onClick={handleSkip}
        style={{
            marginTop: '3rem',
            padding: '0.8rem 2rem',
            backgroundColor: 'transparent',
            border: '1px solid rgba(255,255,255,0.3)',
            color: 'rgba(255,255,255,0.6)',
            borderRadius: '30px',
            cursor: 'pointer',
            fontSize: '1rem',
            transition: 'all 0.2s'
        }}
        onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'white';
            e.currentTarget.style.color = 'white';
        }}
        onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)';
            e.currentTarget.style.color = 'rgba(255,255,255,0.6)';
        }}
      >
        Skip Break
      </button>
    </div>
  );
}
