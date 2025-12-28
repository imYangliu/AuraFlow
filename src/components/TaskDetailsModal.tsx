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
    <div className="modal-backdrop">
      <div className="modal-content">
        <div className="modal-header">
          <h2>{t.details}</h2>
          <button onClick={onClose} className="modal-close-btn">×</button>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ margin: '0 0 0.5rem 0', color: '#333' }}>{task.title}</h3>
          <div className="details-stats">
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

        <div className="plan-section">
          <div className="plan-header">
            <label style={{ fontWeight: 600 }}>{t.plan}</label>
            <button 
              onClick={handleGeneratePlan}
              disabled={isGenerating}
              className="btn-generate-plan"
            >
              {isGenerating ? t.generating : `✨ ${t.generatePlan}`}
            </button>
          </div>
          <textarea
            value={plan}
            onChange={(e) => setPlan(e.target.value)}
            placeholder={t.aiPlanPrompt + task.title}
            className="plan-textarea"
          />
        </div>

        <div className="modal-footer">
          <button onClick={onClose} className="btn-cancel">
            {t.cancel}
          </button>
          <button onClick={handleSave} className="btn-save">
            {t.save}
          </button>
        </div>
      </div>
    </div>
  );
}
