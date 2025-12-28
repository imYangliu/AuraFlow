import { useState } from 'react';
import { translations } from '../i18n/translations';
import type { AppConfig, Language } from '../types';

interface SettingsProps {
  isOpen: boolean;
  onClose: () => void;
  config: AppConfig;
  onSave: (newConfig: SettingsProps['config']) => void;
}

export default function SettingsModal({ isOpen, onClose, config, onSave }: SettingsProps) {
  const [localConfig, setLocalConfig] = useState({
    ...config,
    aiConfig: config.aiConfig || { apiKey: '', baseUrl: '' }
  });
  const t = translations[config.language || 'en'] || translations['en'];

  const handleChange = (key: string, value: string | number) => {
    setLocalConfig(prev => ({ ...prev, [key]: typeof value === 'string' ? parseInt(value) || 0 : value }));
  };

  const handleAIChange = (key: string, value: string) => {
    setLocalConfig(prev => ({
      ...prev,
      aiConfig: { ...prev.aiConfig!, [key]: value }
    }));
  };

  const handleLangChange = (lang: Language) => {
    setLocalConfig(prev => ({ ...prev, language: lang }));
  };

  const handleSave = () => {
    onSave(localConfig);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '12px', minWidth: '350px', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
        <h2 style={{marginTop: 0}}>{t.configTitle}</h2>
        
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>{t.language}</label>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button 
              onClick={() => handleLangChange('en')}
              style={{ 
                flex: 1, padding: '0.5rem', 
                backgroundColor: localConfig.language === 'en' ? '#007bff' : '#f0f0f0',
                color: localConfig.language === 'en' ? 'white' : '#333'
              }}
            >
              English
            </button>
            <button 
              onClick={() => handleLangChange('zh')}
              style={{ 
                flex: 1, padding: '0.5rem', 
                backgroundColor: localConfig.language === 'zh' ? '#007bff' : '#f0f0f0',
                color: localConfig.language === 'zh' ? 'white' : '#333'
              }}
            >
              中文
            </button>
          </div>
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem' }}>{t.pomodoroDuration}</label>
          <input 
            type="number" 
            value={localConfig.workDuration} 
            onChange={(e) => handleChange('workDuration', e.target.value)}
            style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem' }}>{t.shortBreakDuration}</label>
          <input 
            type="number" 
            value={localConfig.breakDuration} 
            onChange={(e) => handleChange('breakDuration', e.target.value)}
            style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem' }}>{t.longBreakDuration}</label>
          <input 
            type="number" 
            value={localConfig.longBreakDuration} 
            onChange={(e) => handleChange('longBreakDuration', e.target.value)}
            style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}
          />
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem' }}>{t.longBreakInterval}</label>
          <input 
            type="number" 
            value={localConfig.longBreakInterval} 
            onChange={(e) => handleChange('longBreakInterval', e.target.value)}
            style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}
          />
        </div>

        <div style={{ marginBottom: '1.5rem', borderTop: '1px solid #eee', paddingTop: '1rem' }}>
          <h3 style={{ fontSize: '1rem', marginTop: 0 }}>{t.aiConfig}</h3>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>{t.apiKey}</label>
            <input 
              type="password" 
              value={localConfig.aiConfig?.apiKey || ''} 
              onChange={(e) => handleAIChange('apiKey', e.target.value)}
              placeholder="sk-..."
              style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}
            />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>{t.baseUrl}</label>
            <input 
              type="text" 
              value={localConfig.aiConfig?.baseUrl || ''} 
              onChange={(e) => handleAIChange('baseUrl', e.target.value)}
              placeholder="https://api.openai.com/v1"
              style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}
            />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>{t.model}</label>
            <input 
              type="text" 
              value={localConfig.aiConfig?.model || ''} 
              onChange={(e) => handleAIChange('model', e.target.value)}
              placeholder="gpt-4o-mini"
              style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
          <button onClick={onClose} style={{ backgroundColor: '#f0f0f0', color: '#333', border: '1px solid #ddd' }}>{t.cancel}</button>
          <button onClick={handleSave} style={{ backgroundColor: '#007bff', color: 'white' }}>{t.save}</button>
        </div>
      </div>
    </div>
  );
}
