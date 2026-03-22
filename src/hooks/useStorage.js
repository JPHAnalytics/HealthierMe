import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "healthierme-data";

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveToStorage(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error("Save failed:", e);
  }
}

export function useStorage(defaultData) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = loadFromStorage();
    setData(saved || defaultData());
    setLoading(false);
  }, []);

  const saveData = useCallback((newData) => {
    setData(newData);
    saveToStorage(newData);
  }, []);

  const resetData = useCallback(() => {
    const fresh = defaultData();
    setData(fresh);
    saveToStorage(fresh);
  }, []);

  return { data, loading, saveData, resetData };
}
