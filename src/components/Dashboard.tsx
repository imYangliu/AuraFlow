import { useState, useEffect } from 'react';
import { safeInvoke, notify } from '../utils/tauri';
import SettingsModal from './SettingsModal';
import TaskEntryModal from './TaskEntryModal';
import StatsView from './StatsView';
import TaskDetailsModal from './TaskDetailsModal';
import TopBar from './TopBar';
import TimerDisplay from './TimerDisplay';
import TaskList from './TaskList';
import { translations } from '../i18n/translations';
import type { Task, Session, AppConfig, Language } from '../types';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<'timer' | 'stats'>('timer');
  const [showArchive, setShowArchive] = useState(false);
  
  // Config
  const [config, setConfig] = useState<AppConfig>(() => {
    const saved = localStorage.getItem('pomodoroConfig');
    return saved ? JSON.parse(saved) : {
      workDuration: 25,
      breakDuration: 5,
      longBreakDuration: 15,
      longBreakInterval: 4,
      language: 'en'
    };
  });

  const t = translations[config.language || 'en'] || translations['en'];

  const [mode, setMode] = useState<'work' | 'short_break'>('work');
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [rounds, setRounds] = useState(0);
  const [trees, setTrees] = useState(() => {
    return parseInt(localStorage.getItem('trees') || '0');
  });

  // Sessions for stats
  const [sessions, setSessions] = useState<Session[]>(() => {
    const saved = localStorage.getItem('sessions');
    return saved ? JSON.parse(saved) : [];
  });

  const [showSettings, setShowSettings] = useState(false);
  const [showTaskEntry, setShowTaskEntry] = useState(true);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // Tasks
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('tasks');
    return saved ? JSON.parse(saved) : [];
  });
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);

  // Persistence
  useEffect(() => { localStorage.setItem('tasks', JSON.stringify(tasks)); }, [tasks]);
  useEffect(() => { localStorage.setItem('trees', trees.toString()); }, [trees]);
  useEffect(() => { localStorage.setItem('sessions', JSON.stringify(sessions)); }, [sessions]);
  
  useEffect(() => {
    localStorage.setItem('pomodoroConfig', JSON.stringify(config));
    if (!isActive) {
      setTimeLeft(mode === 'work' ? Math.floor(config.workDuration * 60) : Math.floor(config.breakDuration * 60));
    }
  }, [config]);

  // Timer Logic
  const handleTimerComplete = () => {
    setIsActive(false);
    if (mode === 'work') {
      const newRounds = rounds + 1;
      setRounds(newRounds);
      setTrees((t: number) => t + 1);
      
      // Update task pomodoros
      if (activeTaskId) {
        setTasks(prev => prev.map(t => 
          t.id === activeTaskId 
            ? { ...t, pomodoros: (t.pomodoros || 0) + 1 } 
            : t
        ));
      }

      // Log session
      const newSession = {
        date: new Date().toISOString().split('T')[0],
        duration: config.workDuration * 60
      };
      setSessions(prev => [...prev, newSession]);

      notify(t.appTitle, "Time to take a break.");
      safeInvoke('update_tray_title', "Break Time");

      if (newRounds % config.longBreakInterval === 0) {
        localStorage.setItem('breakDuration', (config.longBreakDuration * 60).toString());
        safeInvoke('open_break_window'); 
        setTimeLeft(Math.floor(config.workDuration * 60));
      } else {
        setMode('short_break');
        setTimeLeft(Math.floor(config.breakDuration * 60));
      }
    } else {
      setMode('work');
      setTimeLeft(Math.floor(config.workDuration * 60));
      notify(t.appTitle, "Back to work.");
      safeInvoke('update_tray_title', "Focus Time");
    }
  };

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((t) => {
          const newTime = t - 1;
          const m = Math.floor(newTime / 60);
          const s = newTime % 60;
          const timeString = `${m}:${s.toString().padStart(2, '0')}`;
          safeInvoke('update_tray_title', timeString);
          return newTime;
        });
        
        // Accumulate time for active task
        if (mode === 'work' && activeTaskId) {
          setTasks(prevTasks => prevTasks.map(task => 
            task.id === activeTaskId 
              ? { ...task, timeSpent: task.timeSpent + 1 }
              : task
          ));
        }
      }, 1000);
    } else if (isActive && timeLeft === 0) {
      handleTimerComplete();
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft, activeTaskId, mode, config, rounds, t.appTitle]);

  const toggleTimer = () => setIsActive(!isActive);
  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(mode === 'work' ? Math.floor(config.workDuration * 60) : Math.floor(config.breakDuration * 60));
  };

  const finishTaskEarly = () => {
    setIsActive(false);
    setMode('short_break');
    setTimeLeft(config.breakDuration * 60);
    
    if (activeTaskId) {
       setTasks(tasks.map(t => t.id === activeTaskId ? { 
         ...t, 
         completed: true,
         status: 'completed',
         completedAt: new Date().toISOString()
       } : t));
       setActiveTaskId(null);
    }
  };

  const manualCompleteTask = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setTasks(tasks.map(t => t.id === id ? {
      ...t,
      completed: true,
      status: 'completed',
      completedAt: new Date().toISOString()
    } : t));
    
    if (activeTaskId === id) {
      setActiveTaskId(null);
      setIsActive(false);
    }
  };

  const handleStartTask = (taskTitle: string, plan?: string) => {
    let task = tasks.find(t => t.title === taskTitle);
    if (!task) {
      task = {
        id: Date.now().toString(),
        title: taskTitle,
        timeSpent: 0,
        completed: false,
        status: 'pending',
        pomodoros: 0,
        plan
      };
      setTasks(prev => [...prev, task!]);
    }
    
    // Pause any other active task
    setTasks(prev => prev.map(t => {
      if (t.id === activeTaskId) {
        return { ...t, status: 'paused' };
      }
      return t;
    }));

    setActiveTaskId(task!.id);
    setShowTaskEntry(false);
    setMode('work');
    setTimeLeft(config.workDuration * 60);
    setIsActive(true);
    
    // Set new task to in_progress
    setTasks(prev => prev.map(t => t.id === task!.id ? { ...t, status: 'in_progress' } : t));
  };
  
  const toggleTaskActive = (id: string) => {
    if (activeTaskId === id) {
      // Pause current
      setActiveTaskId(null);
      setIsActive(false);
      setTasks(prev => prev.map(t => t.id === id ? { ...t, status: 'paused' } : t));
    } else {
      // Switch to new task
      if (activeTaskId) {
        // Pause previous
        setTasks(prev => prev.map(t => t.id === activeTaskId ? { ...t, status: 'paused' } : t));
      }
      
      setActiveTaskId(id);
      setMode('work');
      setTimeLeft(Math.floor(config.workDuration * 60));
      setIsActive(true);
      // If task was completed, reactivate it (remove completion status for the session)
      // Or just keep it completed but allow timing? Usually we want to mark it in_progress if we are working on it.
      setTasks(prev => prev.map(t => t.id === id ? { ...t, status: 'in_progress', completed: false, completedAt: undefined } : t));
    }
  };

  const deleteTask = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(t.confirmDelete)) {
      setTasks(tasks.filter(t => t.id !== id));
      if (activeTaskId === id) {
        setActiveTaskId(null);
        setIsActive(false);
      }
    }
  };

  const getProgress = () => {
    const totalTime = mode === 'work' ? config.workDuration * 60 : config.breakDuration * 60;
    return timeLeft / totalTime;
  };

  const formatTime = (seconds: number) => {
      const m = Math.floor(seconds / 60);
      const s = seconds % 60;
      return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleDebugFill = () => {
    // Generate random sessions for the last 30 days
    const newSessions: Session[] = [];
    const today = new Date();
    
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      // Random duration between 0 and 200 minutes
      const duration = Math.floor(Math.random() * 200) * 60;
      if (duration > 0) {
        newSessions.push({ date: dateStr, duration });
      }
    }
    
    setSessions(prev => [...prev, ...newSessions]);
    setTrees(prev => prev + 15); // Add 15 trees
    notify(t.appTitle, "Debug data added!");
  };

  const handleBreakTest = () => {
    safeInvoke('open_break_window');
    // Fallback for web preview: simulate by navigating or just notifying
    if (!window.__TAURI_INTERNALS__) {
        window.location.href = '/break';
    }
  };

  return (
    <div className="dashboard-container">
      
      <TopBar 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenSettings={() => setShowSettings(true)}
        language={config.language}
      />

      {/* Main Content */}
      <div className="dashboard-content">
        {activeTab === 'timer' ? (
          <>
            <TimerDisplay 
              mode={mode}
              timeLeft={timeLeft}
              isActive={isActive}
              activeTaskId={activeTaskId}
              activeTaskTitle={tasks.find(t => t.id === activeTaskId)?.title}
              progress={getProgress()}
              language={config.language}
              onToggle={toggleTimer}
              onReset={resetTimer}
              onFinishEarly={finishTaskEarly}
              formatTime={formatTime}
            />

            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <button 
                    onClick={handleBreakTest}
                    style={{ fontSize: '0.8rem', padding: '0.5rem 1rem', background: 'none', border: '1px dashed #ccc', color: '#666', cursor: 'pointer', borderRadius: '4px' }}
                >
                    ☕ Test Break Window
                </button>
            </div>

            <TaskList 
              tasks={tasks}
              activeTaskId={activeTaskId}
              showArchive={showArchive}
              setShowArchive={setShowArchive}
              language={config.language}
              onShowEntry={() => setShowTaskEntry(true)}
              onSelectTask={setSelectedTask}
              onToggleTask={toggleTaskActive}
              onDeleteTask={deleteTask}
              onManualComplete={manualCompleteTask}
              formatTime={formatTime}
            />
          </>
        ) : (
          <StatsView 
            sessions={sessions} 
            totalTrees={trees} 
            language={config.language as Language} 
            tasks={tasks}
            aiConfig={config.aiConfig}
            onDebugFill={handleDebugFill}
          />
        )}
      </div>

      {showTaskEntry && (
        <TaskEntryModal 
          tasks={tasks} 
          onStart={handleStartTask} 
          onCancel={() => setShowTaskEntry(false)}
          language={config.language as Language || 'en'}
          aiConfig={config.aiConfig || { apiKey: '' }}
        />
      )}

      {selectedTask && (
        <TaskDetailsModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onUpdate={(updatedTask) => {
             setTasks(tasks.map(t => t.id === updatedTask.id ? updatedTask : t));
          }}
          language={config.language as Language || 'en'}
          aiConfig={config.aiConfig || { apiKey: '' }}
        />
      )}

      <SettingsModal 
        isOpen={showSettings} 
        onClose={() => setShowSettings(false)} 
        config={config} 
        onSave={setConfig} 
      />
    </div>
  );
}
