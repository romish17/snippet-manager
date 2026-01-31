import { Item } from "../types";
import { INITIAL_ITEMS } from "../constants";

// Helper to get authorization headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('auth_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

export const loadItems = async (): Promise<Item[]> => {
  try {
    const response = await fetch('/api/items', {
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        // Token expired or invalid, clear auth state
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
        window.location.reload();
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // If DB is empty, return empty array (or INITIAL_ITEMS if you want to seed)
    if (Array.isArray(data) && data.length === 0) {
      // Optional: Return INITIAL_ITEMS on first load if desired, otherwise empty
      return [];
    }
    return data;
  } catch (e) {
    console.error("Failed to load items from API", e);
    // Fallback to empty array to prevent crashing
    return [];
  }
};

export const saveItems = async (items: Item[]) => {
  try {
    const response = await fetch('/api/sync', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(items),
    });

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        // Token expired or invalid, clear auth state
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
        window.location.reload();
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  } catch (e) {
    console.error("Failed to save items to API", e);
  }
};