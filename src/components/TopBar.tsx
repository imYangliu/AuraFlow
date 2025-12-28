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
    <div style={{ padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee' }}>
      <div style={{ display: 'flex', gap: '1rem' }}>
        <button 
          onClick={() => setActiveTab('timer')}
          style={{ 
            background: 'none', border: 'none', borderBottom: activeTab === 'timer' ? '2px solid #007bff' : 'none',
            padding: '0.5rem', fontWeight: activeTab === 'timer' ? 'bold' : 'normal', color: activeTab === 'timer' ? '#007bff' : '#666'
          }}
        >
          {t.timer}
        </button>
        <button 
          onClick={() => setActiveTab('stats')}
          style={{ 
            background: 'none', border: 'none', borderBottom: activeTab === 'stats' ? '2px solid #007bff' : 'none',
            padding: '0.5rem', fontWeight: activeTab === 'stats' ? 'bold' : 'normal', color: activeTab === 'stats' ? '#007bff' : '#666'
          }}
        >
          {t.stats}
        </button>
      </div>
      <button 
        onClick={onOpenSettings}
        style={{ background: 'none', color: '#666', fontSize: '1.2rem', padding: '0.5rem' }}
      >
        ⚙️
      </button>
    </div>
  );
}
