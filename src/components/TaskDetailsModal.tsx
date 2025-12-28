import { useState } from 'react';
import { translations } from '../i18n/translations';
import { generateTaskPlan } from '../utils/ai';
import type { Task, AIConfig, Language, Subtask } from '../types';

interface TaskDetailsProps {
  task: Task;
  onClose: () => void;
  onUpdate: (task: Task) => void;
  language: Language;
  aiConfig: AIConfig;
}

export default function TaskDetailsModal({ task, onClose, onUpdate, language, aiConfig }: TaskDetailsProps) {
  const t = translations[language] || translations['en'];
  
  const [subtasks, setSubtasks] = useState<Subtask[]>(() => {
    if (task.subtasks && task.subtasks.length > 0) return task.subtasks;
    if (task.plan) {
      return task.plan.split('\n')
        .filter(line => line.trim())
        .map((line, index) => ({
          id: `legacy-${Date.now()}-${index}`,
          title: line.replace(/^-\s*\[[ xX]?\]\s*/, '').replace(/^-\s*/, '').trim(),
          completed: line.includes('[x]') || line.includes('[X]')
        }));
    }
    return [];
  });

  const [isGenerating, setIsGenerating] = useState(false);

  const handleSave = () => {
    // Convert subtasks back to plan string for backward compatibility if needed, 
    // but we primarily use subtasks now.
    onUpdate({ ...task, subtasks });
    onClose();
  };

  const handleGeneratePlan = async () => {
    setIsGenerating(true);
    try {
      const steps = await generateTaskPlan(task.title, aiConfig);
      const newSubtasks: Subtask[] = steps.map((step, index) => ({
        id: `${Date.now()}-${index}`,
        title: step,
        completed: false
      }));
      setSubtasks(newSubtasks);
    } catch (error) {
      alert('Failed to generate plan. Please check your AI configuration.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAddSubtask = () => {
    setSubtasks([...subtasks, {
      id: `${Date.now()}`,
      title: '',
      completed: false
    }]);
  };

  const handleUpdateSubtask = (id: string, updates: Partial<Subtask>) => {
    setSubtasks(subtasks.map(st => st.id === id ? { ...st, ...updates } : st));
  };

  const handleDeleteSubtask = (id: string) => {
    setSubtasks(subtasks.filter(st => st.id !== id));
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
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={handleAddSubtask}
                className="btn-secondary"
                style={{ padding: '4px 8px', fontSize: '0.9rem' }}
              >
                + Add Step
              </button>
              <button 
                onClick={handleGeneratePlan}
                disabled={isGenerating}
                className="btn-generate-plan"
              >
                {isGenerating ? t.generating : `✨ ${t.generatePlan}`}
              </button>
            </div>
          </div>
          
          <div className="subtasks-list" style={{ maxHeight: '300px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {subtasks.length === 0 && (
              <div style={{ color: '#888', fontStyle: 'italic', padding: '1rem', textAlign: 'center' }}>
                No plan yet. generate one with AI or add steps manually.
              </div>
            )}
            {subtasks.map((subtask) => (
              <div key={subtask.id} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  checked={subtask.completed}
                  onChange={(e) => handleUpdateSubtask(subtask.id, { completed: e.target.checked })}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
                <input
                  type="text"
                  value={subtask.title}
                  onChange={(e) => handleUpdateSubtask(subtask.id, { title: e.target.value })}
                  placeholder="Step description..."
                  style={{ 
                    flex: 1, 
                    padding: '6px', 
                    borderRadius: '4px', 
                    border: '1px solid #ddd',
                    textDecoration: subtask.completed ? 'line-through' : 'none',
                    color: subtask.completed ? '#888' : 'inherit'
                  }}
                />
                <button
                  onClick={() => handleDeleteSubtask(subtask.id)}
                  style={{ 
                    background: 'none', 
                    border: 'none', 
                    cursor: 'pointer', 
                    color: '#999',
                    fontSize: '1.2rem',
                    padding: '0 4px'
                  }}
                  title="Remove step"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
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
