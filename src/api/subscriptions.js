import { apiRequest } from './client.js';

export async function getSubscriptions(filters = {}) {
  const query = new URLSearchParams();

  for (const [key, value] of Object.entries(filters)) {
    if (value) query.set(key, value);
  }

  const suffix = query.toString() ? `?${query.toString()}` : '';
  const data = await apiRequest(`/api/subscriptions${suffix}`);
  return data.subscriptions;
}
