import { Item } from "../types";
import { INITIAL_ITEMS } from "../constants";

// Helper to check if we are in a dev environment without the backend running yet
const isOffline = () => false; // Can be enhanced to check connection

export const loadItems = async (): Promise<Item[]> => {
  try {
    const response = await fetch('/api/items');
    if (!response.ok) {
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
    await fetch('/api/sync', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(items),
    });
  } catch (e) {
    console.error("Failed to save items to API", e);
  }
};