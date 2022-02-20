import { useEffect, useRef } from "react";

export function usePrevious<T>(value: T): T | undefined {
  const prevValue = useRef(value);

  useEffect(() => {
    prevValue.current = value;
  }, [value]);

  return prevValue.current;
}
