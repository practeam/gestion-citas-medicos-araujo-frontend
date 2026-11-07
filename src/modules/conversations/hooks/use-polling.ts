import { useEffect, useRef } from "react";

/**
 * Ejecuta `callback` cada `intervalMs` mientras la pestaña esté visible, y una
 * vez al volver a ella (el backend no ofrece tiempo real: las novedades y los
 * estados de entrega llegan por el webhook y se consultan aquí). `callback` se
 * lee desde una referencia, así que no reinicia el temporizador al cambiar.
 */
export function usePolling(callback: () => void, intervalMs: number) {
  const saved = useRef(callback);
  useEffect(() => {
    saved.current = callback;
  });

  useEffect(() => {
    const tick = () => {
      if (document.visibilityState === "visible") saved.current();
    };
    const id = setInterval(tick, intervalMs);
    document.addEventListener("visibilitychange", tick);
    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", tick);
    };
  }, [intervalMs]);
}
