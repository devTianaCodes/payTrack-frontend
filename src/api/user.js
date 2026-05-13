import { apiRequest } from './client.js';

export async function updateMe(details) {
  const data = await apiRequest('/api/me', {
    method: 'PATCH',
    body: JSON.stringify(details),
  });
  return data.user;
}
