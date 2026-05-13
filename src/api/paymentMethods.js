import { apiRequest } from './client.js';

export async function getPaymentMethods() {
  const data = await apiRequest('/api/payment-methods');
  return data.paymentMethods;
}

export async function createPaymentMethod(details) {
  const data = await apiRequest('/api/payment-methods', {
    method: 'POST',
    body: JSON.stringify(details),
  });
  return data.paymentMethod;
}

export async function deletePaymentMethod(id) {
  await apiRequest(`/api/payment-methods/${id}`, {
    method: 'DELETE',
  });
}
