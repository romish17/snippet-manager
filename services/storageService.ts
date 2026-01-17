import { Item } from "../types";
import { INITIAL_ITEMS } from "../constants";

const STORAGE_KEY = 'dev_snippet_manager_data_v1';

export const loadItems = (): Item[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_ITEMS));
      return INITIAL_ITEMS;
    }
    return JSON.parse(data);
  } catch (e) {
    console.error("Failed to load items", e);
    return INITIAL_ITEMS;
  }
};

export const saveItems = (items: Item[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (e) {
    console.error("Failed to save items", e);
  }
};
