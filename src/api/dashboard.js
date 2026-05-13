import { apiRequest } from './client.js';

export async function getDashboard() {
  const data = await apiRequest('/api/dashboard');
  return data.dashboard;
}
