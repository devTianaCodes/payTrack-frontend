import { apiRequest } from './client.js';

export async function getCategories() {
  const data = await apiRequest('/api/categories');
  return data.categories;
}
