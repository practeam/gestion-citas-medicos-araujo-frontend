import { useState } from "react";
import { scheduleOverrideApi } from "../services/schedule-override-api";
import type { ScheduleOverride } from "../types/schedule-override.types";

/**
 * Cambio de estado con confirmación mediante el endpoint específico
 * `/status`. La interfaz solo se actualiza (`onChanged`) tras la respuesta
 * satisfactoria de la API; si el backend rechaza el cambio se muestra su error
 * y el estado confirmado no cambia.
 */
export function useOverrideStatusChange(
  onChanged: (override: ScheduleOverride) => void,
  getErrorMessage: (error: unknown) => string,
) {
  const [target, setTarget] = useState<ScheduleOverride | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cancel = () => {
    if (isPending) return;
    setTarget(null);
    setError(null);
  };

  const confirm = async () => {
    if (!target || isPending) return;
    setIsPending(true);
    setError(null);
    try {
      const updated = await scheduleOverrideApi.updateStatus(
        target.id,
        !target.is_active,
      );
      setTarget(null);
      onChanged(updated);
    } catch (caught) {
      setError(getErrorMessage(caught));
    } finally {
      setIsPending(false);
    }
  };

  return { target, isPending, error, request: setTarget, cancel, confirm };
}
