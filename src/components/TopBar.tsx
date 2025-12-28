import { translations } from '../i18n/translations';
import type { Language } from '../types';

interface TopBarProps {
  activeTab: 'timer' | 'stats';
  setActiveTab: (tab: 'timer' | 'stats') => void;
  onOpenSettings: () => void;
  language: Language;
}

export default function TopBar({ activeTab, setActiveTab, onOpenSettings, language }: TopBarProps) {
  const t = translations[language] || translations['en'];

  return (
    <div className="top-bar">
      <div className="nav-group">
        <button 
          onClick={() => setActiveTab('timer')}
          className={`nav-btn ${activeTab === 'timer' ? 'active' : ''}`}
        >
          {t.timer}
        </button>
        <button 
          onClick={() => setActiveTab('stats')}
          className={`nav-btn ${activeTab === 'stats' ? 'active' : ''}`}
        >
          {t.stats}
        </button>
      </div>
      <button 
        onClick={onOpenSettings}
        className="settings-btn"
      >
        ⚙️
      </button>
    </div>
  );
}
