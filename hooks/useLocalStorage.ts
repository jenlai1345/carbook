import {
  Dispatch,
  SetStateAction,
  useEffect,
  useState,
  useCallback,
} from "react";

type Remover = () => void;

export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, Dispatch<SetStateAction<T>>, Remover] {
  const read = useCallback((): T => {
    if (typeof window === "undefined") return initialValue;
    try {
      const raw = window.localStorage.getItem(key);
      return raw != null ? (JSON.parse(raw) as T) : initialValue;
    } catch (e) {
      console.error("[useLocalStorage] read parse error:", e);
      return initialValue;
    }
  }, [key, initialValue]);

  // Lazy init for SSR safety
  const [storedValue, setStoredValue] = useState<T>(() => read());

  // ✅ Sync once on client mount (covers SSR→CSR hydration)
  useEffect(() => {
    setStoredValue(read());
  }, [read]);

  // ✅ Cross-tab sync (handle remove=null safely)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const handler = (e: StorageEvent) => {
      if (e.key !== key) return;
      try {
        setStoredValue(
          e.newValue != null ? (JSON.parse(e.newValue) as T) : initialValue
        );
      } catch (err) {
        console.error("[useLocalStorage] storage event parse error:", err);
        setStoredValue(initialValue);
      }
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, [key, initialValue]);

  const setValue: Dispatch<SetStateAction<T>> = useCallback(
    (action) => {
      if (typeof window === "undefined") {
        setStoredValue(action as T | ((prev: T) => T));
        return;
      }
      setStoredValue((prev) => {
        const valueToStore =
          action instanceof Function ? (action as (p: T) => T)(prev) : action;
        try {
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
        } catch (e) {
          console.error("[useLocalStorage] write error:", e);
          // fall through; we still updated state
        }
        return valueToStore as T;
      });
    },
    [key]
  );

  const removeValue = useCallback(() => {
    setStoredValue(initialValue);
    try {
      if (typeof window !== "undefined") {
        window.localStorage.removeItem(key);
      }
    } catch (e) {
      console.error("[useLocalStorage] remove error:", e);
    }
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue];
}
