import { apiRequest } from './client.js';

export function requestPasswordReset(email) {
  return apiRequest('/api/auth/password-reset/request', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

export function confirmPasswordReset(details) {
  return apiRequest('/api/auth/password-reset/confirm', {
    method: 'POST',
    body: JSON.stringify(details),
  });
}
