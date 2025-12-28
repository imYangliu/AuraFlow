import { invoke as tauriInvoke } from '@tauri-apps/api/core';

declare global {
  interface Window {
    __TAURI_INTERNALS__?: unknown;
  }
}

export const safeInvoke = async <T>(cmd: string, args?: any): Promise<T | null> => {
  try {
    // Check if running in Tauri environment
    if (window.__TAURI_INTERNALS__) {
      return await tauriInvoke(cmd, args);
    } else {
      console.log(`[Mock Tauri] Invoking command: ${cmd}`, args);
      return null;
    }
  } catch (e) {
    console.warn(`Tauri invoke failed (likely running in browser): ${e}`);
    return null;
  }
};

export const notify = (title: string, body: string) => {
  if ('Notification' in window && Notification.permission !== 'denied') {
    Notification.requestPermission().then((permission) => {
      if (permission === 'granted') {
        new Notification(title, { body });
      }
    });
  } else {
     console.log(`[Notification] ${title}: ${body}`);
  }
};
