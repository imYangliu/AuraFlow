import { useState } from 'react';
import { translations } from '../i18n/translations';
import { analyzeTaskInput } from '../utils/ai';
import type { Task, AIConfig, Language, Subtask } from '../types';

interface TaskEntryProps {
  tasks: Task[];
  onStart: (taskTitle: string, subtasks?: Subtask[]) => void;
  onCancel: () => void;
  language: Language;
  aiConfig?: AIConfig;
}

export default function TaskEntryModal({ tasks, onStart, onCancel, language, aiConfig }: TaskEntryProps) {
  const [input, setInput] = useState('');
  const [subtasks, setSubtasks] = useState<string[]>([]);
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
      const subtaskObjects: Subtask[] = subtasks.map((st, i) => ({
        id: `${Date.now()}-${i}`,
        title: st,
        completed: false
      }));
      onStart(input, subtaskObjects);
    }
  };

  const handleAIAssist = async () => {
    if (!input.trim()) return;
    
    setIsAnalyzing(true);
    try {
      const result = await analyzeTaskInput(input, aiConfig || { apiKey: '' });
      setInput(result.title);
      setSubtasks(result.subtasks);
      setShowPlan(true);
    } catch (error) {
      console.error(error);
      alert('AI Analysis failed. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAddSubtask = () => {
    setSubtasks([...subtasks, '']);
  };

  const handleUpdateSubtask = (index: number, value: string) => {
    const newSubtasks = [...subtasks];
    newSubtasks[index] = value;
    setSubtasks(newSubtasks);
  };

  const handleRemoveSubtask = (index: number) => {
    setSubtasks(subtasks.filter((_, i) => i !== index));
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <label style={{ fontWeight: 500 }}>
                {t.plan || 'Plan'}
              </label>
              <button 
                onClick={handleAddSubtask}
                style={{ fontSize: '0.8rem', padding: '2px 6px', cursor: 'pointer' }}
              >
                + Add Step
              </button>
            </div>
            
            <div className="subtasks-container" style={{ 
              maxHeight: '200px', 
              overflowY: 'auto',
              border: '1px solid #ddd',
              borderRadius: '8px',
              padding: '0.5rem'
            }}>
              {subtasks.map((step, index) => (
                <div key={index} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                  <span style={{ color: '#888', minWidth: '20px' }}>{index + 1}.</span>
                  <input
                    value={step}
                    onChange={(e) => handleUpdateSubtask(index, e.target.value)}
                    placeholder="Step description..."
                    style={{ flex: 1, padding: '4px', borderRadius: '4px', border: '1px solid #eee' }}
                  />
                  <button 
                    onClick={() => handleRemoveSubtask(index)}
                    style={{ border: 'none', background: 'none', color: '#999', cursor: 'pointer' }}
                  >
                    ×
                  </button>
                </div>
              ))}
              {subtasks.length === 0 && (
                <div style={{ color: '#ccc', textAlign: 'center', fontStyle: 'italic' }}>
                  No steps yet.
                </div>
              )}
            </div>
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
