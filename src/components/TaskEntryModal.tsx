import { useState } from 'react';
import { translations } from '../i18n/translations';
import { analyzeTaskInput } from '../utils/ai';
import type { Task, AIConfig, Language } from '../types';

interface TaskEntryProps {
  tasks: Task[];
  onStart: (taskTitle: string, plan?: string) => void;
  onCancel: () => void;
  language: Language;
  aiConfig?: AIConfig;
}

export default function TaskEntryModal({ tasks, onStart, onCancel, language, aiConfig }: TaskEntryProps) {
  const [input, setInput] = useState('');
  const [plan, setPlan] = useState('');
  const [showPlan, setShowPlan] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const t = translations[language] || translations['en'];

  const suggestions = input.trim() 
    ? Array.from(new Set(tasks.map(t => t.title)))
        .map(title => tasks.find(t => t.title === title)!)
        .filter(t => t.title.toLowerCase().includes(input.toLowerCase()))
        .slice(0, 5)
    : [];

  const handleSubmit = () => {
    if (input.trim()) {
      onStart(input, plan);
    }
  };

  const handleAIAssist = async () => {
    if (!input.trim()) return;
    
    setIsAnalyzing(true);
    try {
      const result = await analyzeTaskInput(input, aiConfig || { apiKey: '' });
      setInput(result.title);
      setPlan(result.plan);
      setShowPlan(true);
    } catch (error) {
      console.error(error);
      alert('AI Analysis failed. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="modal-overlay">
      <h1 className="modal-title">{t.taskPlaceholder}</h1>
      
      <div className="task-input-container">
        <input 
          autoFocus
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSubmit()}
          placeholder={t.enterTask}
          className="task-input"
        />
        
        {suggestions.length > 0 && !showPlan && (
          <ul className="suggestions-list">
            {suggestions.map(t => (
              <li 
                key={t.id}
                onClick={() => onStart(t.title)}
                className="suggestion-item"
              >
                🕒 {t.title}
              </li>
            ))}
          </ul>
        )}

        {showPlan && (
          <div style={{ marginTop: '1rem', width: '100%' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', textAlign: 'left', fontWeight: 500 }}>
              {t.plan || 'Plan'}
            </label>
            <textarea
              value={plan}
              onChange={(e) => setPlan(e.target.value)}
              placeholder="Task plan..."
              style={{
                width: '100%',
                minHeight: '120px',
                padding: '1rem',
                borderRadius: '12px',
                border: '1px solid #ddd',
                fontFamily: 'inherit',
                resize: 'vertical',
                boxSizing: 'border-box'
              }}
            />
          </div>
        )}
      </div>

      <div className="modal-actions">
        <button onClick={onCancel} className="btn-secondary">
          {t.close}
        </button>
        
        <button onClick={handleSubmit} className="btn-primary">
          {t.startFocus}
        </button>

        <button 
          onClick={handleAIAssist}
          disabled={isAnalyzing || !input.trim()}
          className="btn-ai"
          title="Generate task name and plan from description"
        >
          {isAnalyzing ? t.generating : (showPlan ? '✨ Regenerate Plan' : '✨ AI Plan')}
        </button>
      </div>
    </div>
  );
}
