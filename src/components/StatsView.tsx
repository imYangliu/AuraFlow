import { useState } from 'react';
import { translations } from '../i18n/translations';
import type { Task, Session, AIConfig, Language } from '../types';
import { ActivityCalendar } from 'react-activity-calendar';
import { Tooltip } from 'react-tooltip';
import ReactMarkdown from 'react-markdown';
import { generateAIResponse, formatDataForAI } from '../utils/ai';

interface StatsViewProps {
  sessions: Session[];
  totalTrees: number;
  language: Language;
  tasks: Task[];
  aiConfig?: AIConfig;
}

export default function StatsView({ sessions, totalTrees, language, tasks, aiConfig }: StatsViewProps) {
  const t = translations[language] || translations['en'];
  const [aiSummary, setAiSummary] = useState<string>('');
  const [loadingAI, setLoadingAI] = useState(false);

  // Calculate stats
  const today = new Date().toISOString().split('T')[0];
  const todaySessions = sessions.filter(s => s.date === today);
  const todayFocus = todaySessions.reduce((acc, curr) => acc + curr.duration, 0);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${h > 0 ? h + ' ' + t.hours + ' ' : ''}${m} ${t.minutes}`;
  };

  // Prepare Heatmap Data
  // Group sessions by date and sum duration (in minutes)
  const sessionsByDate = sessions.reduce((acc, session) => {
    const date = session.date;
    const mins = Math.round(session.duration / 60);
    acc[date] = (acc[date] || 0) + mins;
    return acc;
  }, {} as Record<string, number>);

  // Generate data for the last 365 days (or at least cover existing data)
  const calendarData = Object.entries(sessionsByDate).map(([date, count]) => {
    // Determine level based on duration (simple heuristic)
    let level = 0;
    if (count > 0) level = 1;
    if (count > 60) level = 2;
    if (count > 120) level = 3;
    if (count > 240) level = 4;
    
    return { date, count, level };
  });

  // Ensure we have at least one entry if empty to avoid crashes (optional, library handles it usually)
  if (calendarData.length === 0) {
      const todayStr = new Date().toISOString().split('T')[0];
      calendarData.push({ date: todayStr, count: 0, level: 0 });
  }

  const handleGenerateSummary = async () => {
    if (!aiConfig?.apiKey) {
      alert('Please set your OpenAI API Key in Settings first.');
      return;
    }
    
    setLoadingAI(true);
    try {
      const promptData = formatDataForAI(sessions, tasks);
      const fullPrompt = `${t.aiPrompt}\n\nData:\n${promptData}`;
      const response = await generateAIResponse(fullPrompt, aiConfig);
      setAiSummary(response);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setAiSummary(`Error: ${errorMessage}`);
    } finally {
      setLoadingAI(false);
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
      <h2>{t.forest}</h2>
      
      {/* Forest Visualization */}
      <div style={{ 
        display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(40px, 1fr))', 
        gap: '10px', padding: '2rem', backgroundColor: '#e8f5e9', borderRadius: '12px',
        marginBottom: '2rem', minHeight: '200px', maxHeight: '300px', overflowY: 'auto'
      }}>
        {Array.from({ length: totalTrees }).map((_, i) => (
          <div key={i} style={{ fontSize: '2rem', animation: 'pulse 1s ease-out' }}>🌲</div>
        ))}
        {totalTrees === 0 && (
          <div style={{ gridColumn: '1/-1', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666' }}>
            {t.noData}
          </div>
        )}
      </div>

      {/* Basic Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{ padding: '1.5rem', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <div style={{ fontSize: '0.9rem', color: '#666', textTransform: 'uppercase' }}>{t.totalTrees}</div>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#2e7d32' }}>{totalTrees}</div>
        </div>
        <div style={{ padding: '1.5rem', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <div style={{ fontSize: '0.9rem', color: '#666', textTransform: 'uppercase' }}>{t.today}</div>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#1976d2' }}>{formatTime(todayFocus)}</div>
        </div>
      </div>

      {/* Heatmap Section */}
      <div style={{ textAlign: 'left', marginBottom: '3rem' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {t.heatmap}
        </h3>
        <div style={{ padding: '2rem', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', overflowX: 'auto' }}>
            <ActivityCalendar 
                data={calendarData}
                labels={{
                    legend: {
                        less: t.less,
                        more: t.more,
                    },
                    months: [
                        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
                    ],
                    weekdays: [
                        'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'
                    ],
                    totalCount: '{{count}} mins in {{year}}'
                }}
                theme={{
                    light: ['#ebedf0', '#9be9a8', '#40c463', '#30a14e', '#216e39'],
                    dark: ['#161b22', '#0e4429', '#006d32', '#26a641', '#39d353'],
                }}
                renderBlock={(block, activity) => (
                    <div data-tooltip-id="react-tooltip" data-tooltip-content={`${activity.date}: ${activity.count} mins`}>
                        {block}
                    </div>
                )}
            />
            <Tooltip id="react-tooltip" />
        </div>
      </div>

      {/* AI Summary Section */}
      <div style={{ textAlign: 'left', marginBottom: '3rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ margin: 0 }}>✨ {t.aiSummary}</h3>
          <button 
            onClick={handleGenerateSummary}
            disabled={loadingAI}
            style={{ 
              padding: '0.5rem 1rem', 
              backgroundColor: loadingAI ? '#ccc' : '#8e44ad', 
              color: 'white', 
              border: 'none', 
              borderRadius: '20px',
              cursor: loadingAI ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', gap: '5px'
            }}
          >
            {loadingAI ? t.generating : t.generateSummary}
          </button>
        </div>
        
        {aiSummary && (
          <div style={{ 
            padding: '1.5rem', 
            backgroundColor: '#f8f9fa', 
            borderRadius: '12px', 
            borderLeft: '4px solid #8e44ad',
            lineHeight: '1.6',
            color: '#333'
          }}>
            <ReactMarkdown>{aiSummary}</ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}
