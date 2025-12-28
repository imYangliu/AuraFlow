import CircularProgress from './CircularProgress';
import { translations } from '../i18n/translations';
import type { Language } from '../types';

interface TimerDisplayProps {
  mode: 'work' | 'short_break';
  timeLeft: number;
  isActive: boolean;
  activeTaskId: string | null;
  activeTaskTitle?: string;
  progress: number;
  language: Language;
  onToggle: () => void;
  onReset: () => void;
  onFinishEarly: () => void;
  formatTime: (seconds: number) => string;
}

export default function TimerDisplay({
  mode,
  timeLeft,
  isActive,
  activeTaskId,
  activeTaskTitle,
  progress,
  language,
  onToggle,
  onReset,
  onFinishEarly,
  formatTime
}: TimerDisplayProps) {
  const t = translations[language] || translations['en'];

  return (
    <div className="timer-section" style={{ marginBottom: '3rem' }}>
      <div style={{ fontSize: '1.2rem', color: '#666', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '2px' }}>
        {mode === 'work' ? t.workMode : t.shortBreak}
      </div>
      
      <CircularProgress 
        progress={progress} 
        size={300} 
        strokeWidth={15} 
        color={mode === 'work' ? '#007bff' : '#4caf50'}
      >
        <h1 style={{ fontSize: '5rem', margin: '0', fontWeight: 200, lineHeight: 1, fontFamily: 'monospace' }}>
          {formatTime(timeLeft)}
        </h1>
      </CircularProgress>
      
      {mode === 'work' && activeTaskId && (
         <div style={{ color: '#007bff', fontSize: '1.2rem', margin: '2rem 0' }}>
           {t.workingOn} <strong>{activeTaskTitle}</strong>
         </div>
      )}

      <div className="controls" style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '2rem' }}>
        <button onClick={onToggle} style={{ padding: '1rem 3rem', fontSize: '1.2rem', borderRadius: '50px', backgroundColor: isActive ? '#f8f9fa' : '#007bff', color: isActive ? '#333' : 'white', border: isActive ? '1px solid #ddd' : 'none' }}>
          {isActive ? t.pause : t.start}
        </button>
        
        {mode === 'work' && (
           <button onClick={onFinishEarly} style={{ padding: '1rem 2rem', fontSize: '1.2rem', borderRadius: '50px', backgroundColor: '#e8f5e9', color: '#2e7d32', border: 'none' }}>
             {t.finishEarly}
           </button>
        )}

        <button onClick={onReset} style={{ padding: '1rem 2rem', fontSize: '1.2rem', borderRadius: '50px', backgroundColor: '#f8f9fa', color: '#666', border: '1px solid #ddd' }}>
          {t.reset}
        </button>
      </div>
    </div>
  );
}
