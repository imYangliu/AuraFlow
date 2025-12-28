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
      <p style={{ marginTop: '2rem', opacity: 0.7 }}>Window will close automatically when time is up.</p>
    </div>
  );
}
