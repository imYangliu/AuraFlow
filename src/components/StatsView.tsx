import React, { useState } from 'react';
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
  onDebugFill?: () => void;
}

export default function StatsView({ sessions, totalTrees, language, tasks, aiConfig, onDebugFill }: StatsViewProps) {
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

  // Generate data for the last 365 days
  const calendarData: { date: string; count: number; level: number }[] = [];
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - 364);

  // Helper to format date as YYYY-MM-DD safely in local time
  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Clone startDate to iterate without modifying the original
  const currentDate = new Date(startDate);
  
  while (currentDate <= endDate) {
    const dateStr = formatDate(currentDate);
    const count = sessionsByDate[dateStr] || 0;
    
    // Determine level based on duration
    let level = 0;
    if (count > 0) level = 1;
    if (count > 60) level = 2;
    if (count > 120) level = 3;
    if (count > 240) level = 4;

    calendarData.push({ date: dateStr, count, level });
    
    // Move to next day
    currentDate.setDate(currentDate.getDate() + 1);
  }

  const handleGenerateSummary = async () => {
    // Removed strict API Key check to allow Mock mode
    
    setLoadingAI(true);
    try {
      const promptData = formatDataForAI(sessions, tasks);
      const fullPrompt = `${t.aiPrompt}\n\nData:\n${promptData}`;
      const response = await generateAIResponse(fullPrompt, aiConfig || { apiKey: '' });
      setAiSummary(response);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setAiSummary(`Error: ${errorMessage}`);
    } finally {
      setLoadingAI(false);
    }
  };

  return (
    <div className="stats-container">
      <h2>{t.forest}</h2>
      
      {/* Forest Visualization */}
      <div className="forest-grid">
        {Array.from({ length: totalTrees }).map((_, i) => (
          <div key={i} className="forest-tree">🌲</div>
        ))}
        {totalTrees === 0 && (
          <div className="no-data-msg">
            {t.noData}
          </div>
        )}
      </div>

      {/* Basic Stats Cards */}
      <div className="stats-cards">
        <div className="stat-card">
          <div className="stat-label">{t.totalTrees}</div>
          <div className="stat-value green">{totalTrees}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">{t.today}</div>
          <div className="stat-value blue">{formatTime(todayFocus)}</div>
        </div>
      </div>

      {/* Heatmap Section */}
      <div className="heatmap-section">
        <h3 className="heatmap-header">
          {t.heatmap}
        </h3>
        <div className="heatmap-content">
            <ActivityCalendar 
                data={calendarData}
                colorScheme="light"
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
                    React.cloneElement(block, {
                        'data-tooltip-id': 'react-tooltip',
                        'data-tooltip-content': `${activity.date}: ${activity.count} ${t.minutes}`,
                    })
                )}
            />
            <Tooltip id="react-tooltip" />
        </div>
      </div>

      {/* AI Summary Section */}
      <div className="ai-section">
        <div className="ai-header">
          <h3>✨ {t.aiSummary}</h3>
          <button 
            onClick={handleGenerateSummary}
            disabled={loadingAI}
            className="btn-generate-ai"
          >
            {loadingAI ? t.generating : t.generateSummary}
          </button>
        </div>
        
        {aiSummary && (
          <div className="ai-summary-box">
            <ReactMarkdown>{aiSummary}</ReactMarkdown>
          </div>
        )}
      </div>

      {/* Debug Tools (Only in Dev or if explicitly enabled) */}
      <div className="debug-section">
          <p className="debug-label">🔧 Developer Tools</p>
          <button 
            onClick={onDebugFill}
            className="btn-debug"
          >
            Generate Test Data (Forest & Commit)
          </button>
      </div>
    </div>
  );
}
