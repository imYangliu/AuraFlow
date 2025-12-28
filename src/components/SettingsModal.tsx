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
    <div className="modal-backdrop">
      <div className="settings-modal-content">
        <h2 style={{marginTop: 0}}>{t.configTitle}</h2>
        
        <div className="form-group">
          <label className="form-label">{t.language}</label>
          <div className="lang-toggle">
            <button 
              onClick={() => handleLangChange('en')}
              className={`lang-btn ${localConfig.language === 'en' ? 'active' : 'inactive'}`}
            >
              English
            </button>
            <button 
              onClick={() => handleLangChange('zh')}
              className={`lang-btn ${localConfig.language === 'zh' ? 'active' : 'inactive'}`}
            >
              中文
            </button>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">{t.pomodoroDuration}</label>
          <input 
            type="number" 
            value={localConfig.workDuration} 
            onChange={(e) => handleChange('workDuration', e.target.value)}
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label className="form-label">{t.shortBreakDuration}</label>
          <input 
            type="number" 
            value={localConfig.breakDuration} 
            onChange={(e) => handleChange('breakDuration', e.target.value)}
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label className="form-label">{t.longBreakDuration}</label>
          <input 
            type="number" 
            value={localConfig.longBreakDuration} 
            onChange={(e) => handleChange('longBreakDuration', e.target.value)}
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label className="form-label">{t.longBreakInterval}</label>
          <input 
            type="number" 
            value={localConfig.longBreakInterval} 
            onChange={(e) => handleChange('longBreakInterval', e.target.value)}
            className="form-input"
          />
        </div>

        <div className="settings-ai-section">
          <h3 style={{ fontSize: '1rem', marginTop: 0 }}>{t.aiConfig}</h3>
          <div className="form-group">
            <label className="form-label" style={{ fontSize: '0.9rem' }}>{t.apiKey}</label>
            <input 
              type="password" 
              value={localConfig.aiConfig?.apiKey || ''} 
              onChange={(e) => handleAIChange('apiKey', e.target.value)}
              placeholder="sk-..."
              className="form-input"
            />
          </div>
          <div className="form-group">
            <label className="form-label" style={{ fontSize: '0.9rem' }}>{t.baseUrl}</label>
            <input 
              type="text" 
              value={localConfig.aiConfig?.baseUrl || ''} 
              onChange={(e) => handleAIChange('baseUrl', e.target.value)}
              placeholder="https://api.openai.com/v1"
              className="form-input"
            />
          </div>
          <div className="form-group">
            <label className="form-label" style={{ fontSize: '0.9rem' }}>{t.model}</label>
            <input 
              type="text" 
              value={localConfig.aiConfig?.model || ''} 
              onChange={(e) => handleAIChange('model', e.target.value)}
              placeholder="gpt-4o-mini"
              className="form-input"
            />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
          <button onClick={onClose} className="btn-cancel">{t.cancel}</button>
          <button onClick={handleSave} className="btn-save">{t.save}</button>
        </div>
      </div>
    </div>
  );
}
