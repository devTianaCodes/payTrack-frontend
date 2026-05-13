import { apiRequest } from './client.js';

export async function getPaymentMethods() {
  const data = await apiRequest('/api/payment-methods');
  return data.paymentMethods;
}
