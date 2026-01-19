import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Debounces a value to limit how often it updates.
 * @param value - The value to debounce
 * @param delay - Delay in milliseconds (default: 300)
 * @returns The debounced value
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Debounces a callback function.
 * @param callback - The callback to debounce
 * @param delay - Delay in milliseconds (default: 300)
 * @returns The debounced callback
 */
export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number = 300
): T {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return useCallback(
    ((...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    }) as T,
    [callback, delay]
  );
}

/**
 * Debounces a function that returns a promise.
 * @param asyncFunction - The async function to debounce
 * @param delay - Delay in milliseconds (default: 300)
 * @returns The debounced async function with loading state
 */
export function useDebouncedAsync<T, Args extends any[]>(
  asyncFunction: (...args: Args) => Promise<T>,
  delay: number = 300
) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [loading, setLoading] = useState(false);

  const debouncedFn = useCallback(
    async (...args: Args) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      return new Promise<T>((resolve, reject) => {
        timeoutRef.current = setTimeout(async () => {
          try {
            setLoading(true);
            const result = await asyncFunction(...args);
            resolve(result);
          } catch (error) {
            reject(error);
          } finally {
            setLoading(false);
          }
        }, delay);
      });
    },
    [asyncFunction, delay]
  );

  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  return { debouncedFn, loading, cancel };
}

/**
 * Hook for managing optimistic updates with rollback support.
 * @param initialValue - The initial value
 * @returns An object with the current value, optimistic updaters, and reset function
 */
export function useOptimistic<T>(
  initialValue: T
): {
  value: T;
  setOptimisticValue: (newValue: T, onError?: (error: Error) => void) => void;
  resetValue: () => void;
  isPending: boolean;
} {
  const [value, setValue] = useState<T>(initialValue);
  const [isPending, setIsPending] = useState(false);
  const previousValue = useRef<T>(initialValue);

  const setOptimisticValue = useCallback(
    (newValue: T, onError?: (error: Error) => void) => {
      previousValue.current = value;
      setIsPending(true);
      setValue(newValue);

      // In a real implementation, you'd wait for the server response here
      // For now, we just mark it as not pending immediately
      // The actual server call would be handled separately
      setIsPending(false);
    },
    [value]
  );

  const resetValue = useCallback(() => {
    setValue(previousValue.current);
    setIsPending(false);
  }, []);

  return { value, setOptimisticValue, resetValue, isPending };
}

/**
 * Hook for tracking upload progress.
 * @param onProgress - Optional callback for progress updates
 * @returns An object with upload function, progress state, and utility methods
 */
export function useUpload(onProgress?: (percentage: number) => void) {
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const upload = useCallback(
    async (file: File, endpoint: string): Promise<any> => {
      setLoading(true);
      setError(null);
      setProgress(0);

      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const percentage = Math.round((event.loaded / event.total) * 100);
            setProgress(percentage);
            onProgress?.(percentage);
          }
        });

        xhr.addEventListener('load', () => {
          setLoading(false);
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const result = JSON.parse(xhr.responseText);
              resolve(result);
            } catch {
              reject(new Error('Invalid response'));
            }
          } else {
            try {
              const errorData = JSON.parse(xhr.responseText);
              reject(new Error(errorData.error || 'Upload failed'));
            } catch {
              reject(new Error(`Request failed with status ${xhr.status}`));
            }
          }
        });

        xhr.addEventListener('error', () => {
          setLoading(false);
          const err = new Error('Network error');
          setError(err);
          reject(err);
        });

        xhr.addEventListener('abort', () => {
          setLoading(false);
          const err = new Error('Upload cancelled');
          setError(err);
          reject(err);
        });

        xhr.open('POST', endpoint);
        xhr.send(new FormData());
      });
    },
    [onProgress]
  );

  const reset = useCallback(() => {
    setProgress(0);
    setLoading(false);
    setError(null);
  }, []);

  return { upload, progress, loading, error, reset };
}

/**
 * Hook for intersection observer to detect when element is visible.
 * @param options - IntersectionObserver options
 * @returns A ref to attach to the target element
 */
export function useIntersectionObserver(
  options: IntersectionObserverInit = {}
): React.RefObject<HTMLDivElement | null> {
  const ref = useRef<HTMLDivElement>(null);
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting);
    }, options);

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [options]);

  return ref;
}

/**
 * Hook for local storage state management.
 * @param key - Storage key
 * @param initialValue - Initial value
 * @returns An array with the stored value and setter function
 */
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') return initialValue;

    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        const valueToStore = value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
        }
      } catch (error) {
        console.error('Error saving to localStorage:', error);
      }
    },
    [key, storedValue]
  );

  return [storedValue, setValue] as const;
}

/**
 * Hook for toggle state.
 * @param initialValue - Initial boolean value
 * @returns An object with toggle state and control functions
 */
export function useToggle(initialValue: boolean = false) {
  const [value, setValue] = useState(initialValue);

  const toggle = useCallback(() => setValue((v) => !v), []);
  const setTrue = useCallback(() => setValue(true), []);
  const setFalse = useCallback(() => setValue(false), []);

  return { value, toggle, setTrue, setFalse, setValue };
}

/**
 * Hook for copy-to-clipboard functionality.
 * @returns An object with copy function and copy status
 */
export function useCopyToClipboard() {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      return true;
    } catch {
      setCopied(false);
      return false;
    }
  }, []);

  return { copied, copy };
}

/**
 * Hook for media query matching.
 * @param query - Media query string
 * @returns Whether the media query matches
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const media = window.matchMedia(query);
    setMatches(media.matches);

    const listener = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, [query]);

  return matches;
}

/**
 * Hook for detecting click outside an element.
 * @param callback - Function to call when clicked outside
 * @returns A ref to attach to the container element
 */
export function useClickOutside<T extends HTMLElement>(
  callback: () => void
): React.RefObject<T | null> {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        callback();
      }
    };

    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [callback]);

  return ref;
}