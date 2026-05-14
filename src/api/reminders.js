import { apiRequest } from './client.js';

export async function getReminderHistory() {
  const data = await apiRequest('/api/reminders/history');
  return data.reminders;
}
