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
    <div className="tasks-section" style={{ textAlign: 'left', maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', gap: '1rem' }}>
           <button 
             onClick={() => setShowArchive(false)}
             style={{ 
               background: 'none', border: 'none', fontWeight: !showArchive ? 'bold' : 'normal',
               color: !showArchive ? '#333' : '#999', cursor: 'pointer', fontSize: '1.1rem'
             }}
           >
             {t.activeTasks}
           </button>
           <button 
             onClick={() => setShowArchive(true)}
             style={{ 
               background: 'none', border: 'none', fontWeight: showArchive ? 'bold' : 'normal',
               color: showArchive ? '#333' : '#999', cursor: 'pointer', fontSize: '1.1rem'
             }}
           >
             {t.archive}
           </button>
        </div>
        <button 
          onClick={onShowEntry} 
          style={{ fontSize: '0.9rem', padding: '0.5rem 1rem', borderRadius: '20px', backgroundColor: '#007bff', color: 'white', border: 'none' }}
        >
          {t.newSession}
        </button>
      </div>
      
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {filteredTasks.slice().reverse().map((task) => (
          <li 
            key={task.id} 
            onClick={() => onSelectTask(task)}
            style={{ 
              marginBottom: '0.8rem', 
              padding: '1rem', 
              border: '1px solid #eee', 
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: activeTaskId === task.id ? '#f0f9ff' : 'white',
              boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
              transition: 'all 0.2s',
              cursor: 'pointer'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flex: 1 }}>
              {!task.completed && (
                <button 
                  onClick={(e) => { e.stopPropagation(); onToggleTask(task.id); }}
                  style={{ 
                    borderRadius: '50%', 
                    width: '40px', 
                    height: '40px', 
                    padding: 0,
                    fontSize: '1.2rem',
                    backgroundColor: activeTaskId === task.id ? '#007bff' : '#f5f5f5',
                    color: activeTaskId === task.id ? 'white' : '#666',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  {activeTaskId === task.id ? '⏸' : '▶'}
                </button>
              )}
              
              <div style={{ opacity: task.completed ? 0.6 : 1 }}>
                <div style={{ 
                  fontWeight: 600, 
                  fontSize: '1.1rem', 
                  marginBottom: '4px',
                  textDecoration: task.completed ? 'line-through' : 'none'
                }}>
                  {task.title}
                </div>
                <div style={{ fontSize: '0.85rem', color: '#888' }}>
                  {formatTime(task.timeSpent)} • {task.pomodoros || 0} 🍅 
                  {task.status === 'paused' && <span style={{ color: '#ff9800', marginLeft: '5px' }}>({t.paused})</span>}
                </div>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {!task.completed && (
                <button
                  onClick={(e) => onManualComplete(task.id, e)}
                  style={{
                    background: 'none', border: 'none', fontSize: '1.2rem',
                    cursor: 'pointer', color: '#28a745',
                    padding: '0.5rem'
                  }}
                  title={t.markComplete}
                >
                  ✔
                </button>
              )}
              <button 
                onClick={(e) => onDeleteTask(task.id, e)}
                style={{ background: 'none', color: '#ff4d4f', fontSize: '1.2rem', padding: '0.5rem', border: 'none', cursor: 'pointer', opacity: 0.5 }}
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
