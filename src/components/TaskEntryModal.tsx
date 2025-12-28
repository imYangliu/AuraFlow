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
      onStart(input);
    }
  };

  const handleAIAssist = async () => {
    if (!input.trim() || !aiConfig?.apiKey) return;
    
    setIsAnalyzing(true);
    try {
      const result = await analyzeTaskInput(input, aiConfig);
      onStart(result.title, result.plan);
    } catch (error) {
      alert('AI Analysis failed. Starting with original input.');
      onStart(input);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(255,255,255,0.95)', display: 'flex', flexDirection: 'column', 
      alignItems: 'center', justifyContent: 'center', zIndex: 900
    }}>
      <h1 style={{ marginBottom: '2rem', color: '#333' }}>{t.taskPlaceholder}</h1>
      
      <div style={{ width: '100%', maxWidth: '500px', position: 'relative' }}>
        <input 
          autoFocus
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          placeholder={t.enterTask}
          style={{ 
            width: '100%', padding: '1.5rem', fontSize: '1.5rem', 
            borderRadius: '50px', border: '2px solid #007bff',
            outline: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }}
        />
        
        {suggestions.length > 0 && (
          <ul style={{
            position: 'absolute', top: '100%', left: 0, right: 0,
            backgroundColor: 'white', listStyle: 'none', padding: 0, margin: '10px 0',
            borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            overflow: 'hidden'
          }}>
            {suggestions.map(t => (
              <li 
                key={t.id}
                onClick={() => onStart(t.title)}
                style={{ 
                  padding: '1rem', cursor: 'pointer', borderBottom: '1px solid #eee',
                  textAlign: 'left', transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
              >
                🕒 {t.title}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <button onClick={onCancel} style={{ 
          backgroundColor: 'transparent', color: '#666', border: '1px solid #ccc',
          padding: '0.8rem 2rem', fontSize: '1.1rem', borderRadius: '30px'
        }}>
          {t.close}
        </button>
        
        <button onClick={handleSubmit} style={{ 
          padding: '0.8rem 3rem', fontSize: '1.1rem', borderRadius: '30px',
          backgroundColor: '#007bff', color: 'white', border: 'none'
        }}>
          {t.startFocus}
        </button>

        {aiConfig?.apiKey && (
          <button 
            onClick={handleAIAssist}
            disabled={isAnalyzing || !input.trim()}
            style={{ 
              padding: '0.8rem 1.5rem', fontSize: '1.1rem', borderRadius: '30px',
              backgroundColor: '#6f42c1', color: 'white', border: 'none',
              opacity: (isAnalyzing || !input.trim()) ? 0.6 : 1,
              cursor: (isAnalyzing || !input.trim()) ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', gap: '0.5rem'
            }}
            title="Generate task name and plan from description"
          >
            {isAnalyzing ? t.generating : '✨ AI'}
          </button>
        )}
      </div>
    </div>
  );
}
