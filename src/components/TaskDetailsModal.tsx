import { useState } from 'react';
import { translations } from '../i18n/translations';
import { generateTaskPlan } from '../utils/ai';
import type { Task, AIConfig, Language } from '../types';

interface TaskDetailsProps {
  task: Task;
  onClose: () => void;
  onUpdate: (task: Task) => void;
  language: Language;
  aiConfig: AIConfig;
}

export default function TaskDetailsModal({ task, onClose, onUpdate, language, aiConfig }: TaskDetailsProps) {
  const t = translations[language] || translations['en'];
  const [plan, setPlan] = useState(task.plan || '');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleSave = () => {
    onUpdate({ ...task, plan });
    onClose();
  };

  const handleGeneratePlan = async () => {
    setIsGenerating(true);
    try {
      const generatedPlan = await generateTaskPlan(task.title, aiConfig);
      setPlan(generatedPlan);
    } catch (error) {
      alert('Failed to generate plan. Please check your AI configuration.');
    } finally {
      setIsGenerating(false);
    }
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${h}h ${m}m`;
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', 
      alignItems: 'center', justifyContent: 'center', zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white', borderRadius: '12px', padding: '2rem',
        width: '90%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ margin: 0 }}>{t.details}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ margin: '0 0 0.5rem 0', color: '#333' }}>{task.title}</h3>
          <div style={{ display: 'flex', gap: '1rem', color: '#666', fontSize: '0.9rem' }}>
            <span>{t.status}: {task.status || (task.completed ? t.completed : t.pending)}</span>
            <span>{t.totalFocus}: {formatTime(task.timeSpent)}</span>
            <span>{t.pomodoros}: {task.pomodoros || 0}</span>
          </div>
          {task.completedAt && (
            <div style={{ color: '#666', fontSize: '0.9rem', marginTop: '0.5rem' }}>
              {t.completedAt}: {new Date(task.completedAt).toLocaleString()}
            </div>
          )}
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <label style={{ fontWeight: 600 }}>{t.plan}</label>
            <button 
              onClick={handleGeneratePlan}
              disabled={isGenerating || !aiConfig.apiKey}
              style={{
                fontSize: '0.8rem', padding: '0.3rem 0.8rem', borderRadius: '12px',
                backgroundColor: '#e3f2fd', color: '#0d47a1', border: 'none',
                cursor: isGenerating || !aiConfig.apiKey ? 'not-allowed' : 'pointer',
                opacity: isGenerating || !aiConfig.apiKey ? 0.6 : 1
              }}
            >
              {isGenerating ? t.generating : `✨ ${t.generatePlan}`}
            </button>
          </div>
          <textarea
            value={plan}
            onChange={(e) => setPlan(e.target.value)}
            placeholder={t.aiPlanPrompt + task.title}
            style={{
              width: '100%', minHeight: '150px', padding: '1rem',
              borderRadius: '8px', border: '1px solid #ddd',
              fontFamily: 'inherit', resize: 'vertical'
            }}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
          <button onClick={onClose} style={{ padding: '0.6rem 1.5rem', borderRadius: '20px', border: '1px solid #ddd', background: 'white' }}>
            {t.cancel}
          </button>
          <button onClick={handleSave} style={{ padding: '0.6rem 1.5rem', borderRadius: '20px', border: 'none', background: '#007bff', color: 'white' }}>
            {t.save}
          </button>
        </div>
      </div>
    </div>
  );
}
