import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useState,
} from "react";

const KEY_PREFIX = "ord-connect";

// Helper function to get item from localStorage
function getItemFromLocalStorage<T>(_key: string): T | null {
  if (typeof window === "undefined") {
    console.warn(
      `Attempted to read local storage key ${_key} even though environment is not a browser.`,
    );
  }

  const key = `${KEY_PREFIX}_${_key}`;
  try {
    const value = window.localStorage.getItem(key);
    return value !== null && value !== undefined ? JSON.parse(value) : null;
  } catch (error) {
    console.error(`Error retrieving ${key} from localStorage`, error);
    return null;
  }
}

// Helper function to set item to localStorage
function setItemToLocalStorage<T>(_key: string, value: T) {
  if (typeof window === "undefined") {
    console.warn(
      `Attempted to set local storage key ${_key} even though environment is not a browser.`,
    );
  }

  const key = `${KEY_PREFIX}_${_key}`;
  try {
    if (value) {
      window.localStorage.setItem(key, JSON.stringify(value));
    } else {
      window.localStorage.removeItem(key);
    }
  } catch (error) {
    console.error(`Error saving ${key} to localStorage`, error);
  }
}

export function useLocalStorage<T>(
  key: string,
  initialValue: T,
  options: { initializeWithValue?: boolean } = {},
): [T, Dispatch<SetStateAction<T>>] {
  const { initializeWithValue = true } = options;
  const readValue = useCallback(() => {
    const value = getItemFromLocalStorage<T>(key);
    if (!value) {
      setItemToLocalStorage(key, initialValue);
      return initialValue;
    }
    return value;
  }, [initialValue, key]);

  const [state, setInnerState] = useState<T>(() => {
    if (initializeWithValue) {
      return readValue();
    }
    return initialValue;
  });

  const setState: Dispatch<SetStateAction<T>> = useCallback(
    (newValue) => {
      setItemToLocalStorage(key, newValue);
      setInnerState(newValue);
    },
    [key],
  );

  useEffect(() => {
    setInnerState(readValue());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return [state, setState];
}
