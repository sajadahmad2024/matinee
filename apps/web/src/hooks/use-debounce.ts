import { useEffect, useState } from "react";

/**
 * Returns `value` (trimmed) once it has stopped changing for `delay` ms — for search inputs, so
 * a request or URL update happens after the user pauses typing instead of on every keystroke.
 */
export function useDebounce(value: string, delay = 500): string {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value.trim());
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
