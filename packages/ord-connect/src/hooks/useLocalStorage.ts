import { Dispatch, SetStateAction, useCallback, useState } from "react";

const KEY_PREFIX = "ord-connect";

// Helper function to get item from localStorage
function getItemFromLocalStorage<T>(_key: string): T | null {
  const key = `${KEY_PREFIX}_${_key}`;
  try {
    const value = localStorage.getItem(key);
    return value !== null && value !== undefined ? JSON.parse(value) : null;
  } catch (error) {
    console.error(`Error retrieving ${key} from localStorage`, error);
    return null;
  }
}

// Helper function to set item to localStorage
function setItemToLocalStorage<T>(_key: string, value: T) {
  const key = `${KEY_PREFIX}_${_key}`;
  try {
    if (value) {
      localStorage.setItem(key, JSON.stringify(value));
    } else {
      localStorage.removeItem(key);
    }
  } catch (error) {
    console.error(`Error saving ${key} to localStorage`, error);
  }
}

export function useLocalStorage<T>(
  key: string,
  initialValue: T,
): [T, Dispatch<SetStateAction<T>>] {
  const [state, setInnerState] = useState<T>(() => {
    const value = getItemFromLocalStorage<T>(key);
    if (!value) {
      setItemToLocalStorage(key, initialValue);
      return initialValue;
    }
    return value;
  });

  const setState: Dispatch<SetStateAction<T>> = useCallback(
    (newValue) => {
      setItemToLocalStorage(key, newValue);
      setInnerState(newValue);
    },
    [key],
  );

  return [state, setState];
}
