import { isAbortError, isApiError } from "@/services/api";
import { useCallback, useEffect, useRef, useState } from "react";
import { messageApi } from "../services/message-api";

export type MediaErrorKind = "unavailable" | "network" | "unexpected";

interface MediaState {
  messageId: number;
  status: "idle" | "loading" | "ready" | "error";
  url?: string;
  error?: MediaErrorKind;
}

function toErrorKind(error: unknown): MediaErrorKind {
  if (!isApiError(error)) return "unexpected";
  if (error.kind === "network") return "network";
  // 404 sin adjunto, 409 archivo no disponible, 502 almacenamiento/WhatsApp.
  if ([404, 409, 502, 503].includes(error.status)) return "unavailable";
  return "unexpected";
}

/**
 * Descarga autenticada del adjunto de un mensaje y lo expone como URL de
 * objeto (la cabecera `Authorization` no viaja en `<img src>`/`<audio src>`).
 * `auto` lo descarga al montar; si no, `load()` lo hace a petición. La URL se
 * libera al desmontar o al cambiar de mensaje.
 */
export function useMediaUrl(
  conversationId: number,
  messageId: number,
  auto: boolean,
) {
  const [state, setState] = useState<MediaState>({
    messageId,
    status: "idle",
  });
  const controllerRef = useRef<AbortController | null>(null);
  const urlRef = useRef<string | null>(null);

  const release = useCallback(() => {
    controllerRef.current?.abort();
    controllerRef.current = null;
    if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    urlRef.current = null;
  }, []);

  const load = useCallback(() => {
    release();
    const controller = new AbortController();
    controllerRef.current = controller;
    setState({ messageId, status: "loading" });
    messageApi
      .downloadMedia(conversationId, messageId, { signal: controller.signal })
      .then((blob) => {
        const url = URL.createObjectURL(blob);
        urlRef.current = url;
        setState({ messageId, status: "ready", url });
      })
      .catch((error: unknown) => {
        if (isAbortError(error)) return;
        setState({ messageId, status: "error", error: toErrorKind(error) });
      });
  }, [conversationId, messageId, release]);

  useEffect(() => {
    if (auto) load();
    return release;
  }, [auto, load, release]);

  // Estado de otro mensaje (la burbuja se reutilizó): se ignora.
  const current: MediaState =
    state.messageId === messageId ? state : { messageId, status: "idle" };

  return { ...current, load };
}
