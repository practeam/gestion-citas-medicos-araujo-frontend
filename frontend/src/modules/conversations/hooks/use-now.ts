import { useEffect, useState } from "react";

/** Instante actual (ms) que se actualiza cada `intervalMs`; evita `Date.now()` en el render. */
export function useNow(intervalMs: number): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}
