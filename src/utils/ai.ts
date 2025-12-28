import type { AIConfig } from '../types';

export async function generateAIResponse(prompt: string, config: AIConfig): Promise<string> {
  let baseUrl = config.baseUrl || import.meta.env.VITE_AI_BASE_URL || 'https://api.openai.com/v1';
  const apiKey = config.apiKey || import.meta.env.VITE_AI_API_KEY;
  const model = config.model || import.meta.env.VITE_AI_MODEL || 'gpt-4o-mini';

  // Use proxy in dev mode if baseUrl is the default ECNU URL
  if (import.meta.env.DEV && baseUrl.includes('chat.ecnu.edu.cn')) {
    baseUrl = '/api/v1';
  }

  if (!apiKey) {
    throw new Error('API Key is missing');
  }

  try {
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: 'system',
            content: 'You are a helpful productivity assistant. Analyze the user\'s Pomodoro focus data and provide a concise, encouraging summary and 1-2 specific actionable tips to improve their workflow. Keep it friendly and motivating.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `API Error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || 'No response from AI.';
  } catch (error) {
    console.error('AI Request Failed:', error);
    throw error;
  }
}

export async function generateTaskPlan(taskTitle: string, config: AIConfig): Promise<string> {
  let baseUrl = config.baseUrl || import.meta.env.VITE_AI_BASE_URL || 'https://api.openai.com/v1';
  const apiKey = config.apiKey || import.meta.env.VITE_AI_API_KEY;

  // Use proxy in dev mode if baseUrl is the default ECNU URL
  if (import.meta.env.DEV && baseUrl.includes('chat.ecnu.edu.cn')) {
    baseUrl = '/api/v1';
  }

  if (!apiKey) {
    throw new Error('API Key is missing');
  }

  try {
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: import.meta.env.VITE_AI_MODEL || 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful productivity assistant. Given a task title, generate a simple, actionable 3-5 step plan to complete it. Keep it concise.'
          },
          {
            role: 'user',
            content: `Task: ${taskTitle}`
          }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `API Error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || 'No response from AI.';
  } catch (error) {
    console.error('AI Request Failed:', error);
    throw error;
  }
}

export async function analyzeTaskInput(input: string, config: AIConfig): Promise<{ title: string; plan: string }> {
  let baseUrl = config.baseUrl || import.meta.env.VITE_AI_BASE_URL || 'https://api.openai.com/v1';
  const apiKey = config.apiKey || import.meta.env.VITE_AI_API_KEY;
  const model = config.model || import.meta.env.VITE_AI_MODEL || 'gpt-4o-mini';

  // Use proxy in dev mode if baseUrl is the default ECNU URL
  if (import.meta.env.DEV && baseUrl.includes('chat.ecnu.edu.cn')) {
    baseUrl = '/api/v1';
  }

  if (!apiKey) {
    throw new Error('API Key is missing');
  }

  try {
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: 'system',
            content: 'You are a helpful productivity assistant. Analyze the user input. Return a JSON object with "title" (concise task name) and "plan" (markdown list of steps). Output ONLY valid JSON.'
          },
          {
            role: 'user',
            content: input
          }
        ],
        temperature: 0.7,
        response_format: { type: "json_object" }
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `API Error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;
    return JSON.parse(content);
  } catch (error) {
    console.error('AI Request Failed:', error);
    throw error;
  }
}

export function formatDataForAI(
  sessions: { date: string; duration: number }[],
  tasks: { title: string; completed: boolean }[]
): string {
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  
  // Simple filtering (enhance as needed)
  const relevantSessions = sessions.filter(s => s.date === today);
  const totalMinutes = relevantSessions.reduce((acc, s) => acc + s.duration, 0) / 60;
  
  const completedTasks = tasks.filter(t => t.completed).map(t => t.title).join(', ');
  const activeTasks = tasks.filter(t => !t.completed).map(t => t.title).join(', ');

  return `
    Date: ${today}
    Total Focus Time Today: ${totalMinutes.toFixed(1)} minutes.
    Completed Tasks: ${completedTasks || 'None'}.
    Ongoing Tasks: ${activeTasks || 'None'}.
    
    Please analyze my productivity today.
  `;
}
