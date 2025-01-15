import { useSyncExternalStore, useCallback, useMemo } from "react";

export const useLocalStorage = <T>(key: string, initialValue?: T) => {
  const getSnapshot = useCallback(() => {
    return localStorage.getItem(key) ?? null;
  }, [key]);

  const getServerSnapshot = useCallback(() => null, []);

  const subscribe = useCallback(
    (onChange: () => void) => {
      const handleStorageChange = (e: StorageEvent) => {
        if (e.key !== key) return;

        onChange();
      };

      window.addEventListener("storage", handleStorageChange);

      return () => {
        window.removeEventListener("storage", handleStorageChange);
      };
    },
    [key]
  );

  const rawData = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );

  const data = useMemo(() => {
    if (rawData === null) return initialValue;
    try {
      return JSON.parse(rawData) as T;
    } catch {
      return initialValue;
    }
  }, [rawData, initialValue]);

  const setData = useCallback(
    (valueOrFn: T | ((prev: T) => T)) => {
      try {
        const currentValue = localStorage.getItem(key);
        const parsedCurrentValue = currentValue
          ? (JSON.parse(currentValue) as T)
          : initialValue;

        const newValue =
          typeof valueOrFn === "function"
            ? (valueOrFn as (prev: T) => T)(parsedCurrentValue as T)
            : valueOrFn;

        const stringValue = JSON.stringify(newValue);
        localStorage.setItem(key, stringValue);

        window.dispatchEvent(
          new StorageEvent("storage", {
            key,
            newValue: stringValue,
            storageArea: localStorage,
          })
        );
      } catch (err) {
        console.error("Failed to save to localStorage:", err);
      }
    },
    [key, initialValue]
  );

  const clearData = useCallback(() => {
    localStorage.removeItem(key);
    window.dispatchEvent(
      new CustomEvent("local-storage-change", { detail: { key } })
    );
  }, [key]);

  return useMemo(
    () => [data, setData, clearData] as const,
    [data, setData, clearData]
  );
};
