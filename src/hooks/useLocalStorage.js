import { useState, useCallback } from "react";

/**
 * useLocalStorage
 * Drop-in replacement for useState that persists value to localStorage.
 *
 * @param {string} key - The localStorage key to store the value under
 * @param {*} initialValue - Default value if nothing is stored yet
 * @returns {[*, Function]} - [storedValue, setValue]
 *
 * Usage:
 *   const [expenses, setExpenses] = useLocalStorage("st_expenses", []);
 */
function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`useLocalStorage: failed to read key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = useCallback(
    (value) => {
      try {
        // Allow value to be a function (same API as useState)
        const valueToStore =
          value instanceof Function ? value(storedValue) : value;

        setStoredValue(valueToStore);
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      } catch (error) {
        console.warn(`useLocalStorage: failed to write key "${key}":`, error);
      }
    },
    [key, storedValue]
  );

  return [storedValue, setValue];
}

export default useLocalStorage;
