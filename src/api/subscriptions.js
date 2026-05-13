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

export async function createSubscription(details) {
  const data = await apiRequest('/api/subscriptions', {
    method: 'POST',
    body: JSON.stringify(details),
  });
  return data.subscription;
}

export async function cancelSubscription(id) {
  const data = await apiRequest(`/api/subscriptions/${id}/cancel`, {
    method: 'POST',
  });
  return data.subscription;
}

export async function deleteSubscription(id) {
  await apiRequest(`/api/subscriptions/${id}`, {
    method: 'DELETE',
  });
}
