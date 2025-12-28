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
    <div className="timer-section">
      <div className="timer-mode-label">
        {mode === 'work' ? t.workMode : t.shortBreak}
      </div>
      
      <CircularProgress 
        progress={progress} 
        size={300} 
        strokeWidth={15} 
        color={mode === 'work' ? '#007bff' : '#4caf50'}
      >
        <h1 className="timer-time-text">
          {formatTime(timeLeft)}
        </h1>
      </CircularProgress>
      
      {mode === 'work' && activeTaskId && (
         <div className="current-task-display">
           {t.workingOn} <strong>{activeTaskTitle}</strong>
         </div>
      )}

      <div className="timer-controls">
        <button 
          onClick={onToggle} 
          className={`btn-large ${isActive ? 'btn-pause' : 'btn-start'}`}
        >
          {isActive ? t.pause : t.start}
        </button>
        
        {mode === 'work' && (
           <button 
             onClick={onFinishEarly} 
             className="btn-medium btn-finish-early"
           >
             {t.finishEarly}
           </button>
        )}

        <button 
          onClick={onReset} 
          className="btn-medium btn-reset"
        >
          {t.reset}
        </button>
      </div>
    </div>
  );
}
