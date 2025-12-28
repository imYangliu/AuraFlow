import { translations } from '../i18n/translations';
import type { Task, Language } from '../types';

interface TaskListProps {
  tasks: Task[];
  activeTaskId: string | null;
  showArchive: boolean;
  setShowArchive: (show: boolean) => void;
  language: Language;
  onShowEntry: () => void;
  onSelectTask: (task: Task) => void;
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string, e: React.MouseEvent) => void;
  onManualComplete: (id: string, e: React.MouseEvent) => void;
  formatTime: (seconds: number) => string;
}

export default function TaskList({
  tasks,
  activeTaskId,
  showArchive,
  setShowArchive,
  language,
  onShowEntry,
  onSelectTask,
  onToggleTask,
  onDeleteTask,
  onManualComplete,
  formatTime
}: TaskListProps) {
  const t = translations[language] || translations['en'];
  const filteredTasks = tasks.filter(t => showArchive ? t.completed : !t.completed);

  return (
    <div className="tasks-section">
      <div className="tasks-header">
        <div className="tasks-tabs">
           <button 
             onClick={() => setShowArchive(false)}
             className={`tab-btn ${!showArchive ? 'active' : ''}`}
           >
             {t.activeTasks}
           </button>
           <button 
             onClick={() => setShowArchive(true)}
             className={`tab-btn ${showArchive ? 'active' : ''}`}
           >
             {t.archive}
           </button>
        </div>
        <button 
          onClick={onShowEntry} 
          className="btn-new-session"
        >
          {t.newSession}
        </button>
      </div>
      
      <ul className="tasks-list">
        {filteredTasks.slice().reverse().map((task) => (
          <li 
            key={task.id} 
            onClick={() => onSelectTask(task)}
            className={`task-item ${activeTaskId === task.id ? 'active' : ''}`}
          >
            <div className="task-content">
              {!task.completed && (
                <button 
                  onClick={(e) => { e.stopPropagation(); onToggleTask(task.id); }}
                  className={`btn-play-pause ${activeTaskId === task.id ? 'active' : 'inactive'}`}
                >
                  {activeTaskId === task.id ? '⏸' : '▶'}
                </button>
              )}
              
              <div className={`task-info ${task.completed ? 'opacity-60' : ''}`}>
                <div className={`task-title ${task.completed ? 'text-strike' : ''}`}>
                  {task.title}
                </div>
                <div className="task-meta">
                  {formatTime(task.timeSpent)} • {task.pomodoros || 0} 🍅 
                  {task.status === 'paused' && <span className="text-warning" style={{ marginLeft: '5px' }}>({t.paused})</span>}
                </div>
              </div>
            </div>
            
            <div className="task-actions">
              {!task.completed && (
                <button
                  onClick={(e) => onManualComplete(task.id, e)}
                  className="btn-icon text-success"
                  title={t.markComplete}
                >
                  ✔
                </button>
              )}
              <button 
                onClick={(e) => onDeleteTask(task.id, e)}
                className="btn-icon text-danger"
                title={t.delete}
              >
                ×
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
