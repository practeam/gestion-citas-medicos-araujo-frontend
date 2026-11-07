import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { useTranslations } from "@/i18n";
import { useMediaUrl } from "../hooks/use-media-url";
import type { Message, MessageMedia } from "../types/message.types";
import { formatFileSize } from "../utils/media.utils";

function mediaName(media: MessageMedia, fallback: string) {
  return media.file_name || fallback;
}

/**
 * Adjunto de un mensaje. Imágenes se muestran al cargar; audios y documentos
 * se descargan a petición (pueden pesar decenas de MB). Si el backend aún no
 * guardó el archivo (`is_stored = false`) se ofrece reintentar: la consulta
 * misma reintenta la descarga en el servidor.
 */
export function MessageMediaView({
  message,
  media,
}: {
  message: Message;
  media: MessageMedia;
}) {
  const t = useTranslations("conversations.media");
  const kind = message.message_type;
  const isImage = kind === "image";
  const state = useMediaUrl(message.conversation_id, message.id, isImage);
  const name = mediaName(media, t(`defaultName.${kind}`));

  const failed = state.status === "error";
  const pendingStorage = !media.is_stored && state.status === "idle";

  if (failed || pendingStorage) {
    return (
      <div className="space-y-1.5 rounded-lg bg-black/5 p-2.5 text-xs dark:bg-white/10">
        <p className="font-medium">{name}</p>
        <p className="opacity-80">
          {failed ? t(`errors.${state.error}`) : t("notStored")}
        </p>
        <Button type="button" variant="outline" size="xs" onClick={state.load}>
          {t("retry")}
        </Button>
      </div>
    );
  }

  if (isImage) {
    if (state.status !== "ready" || !state.url)
      return <Skeleton className="h-40 w-56 max-w-full bg-black/10" />;
    return (
      <a href={state.url} target="_blank" rel="noopener noreferrer">
        <img
          src={state.url}
          alt={name}
          className="max-h-72 max-w-full rounded-lg object-contain"
        />
      </a>
    );
  }

  if (state.status === "loading") {
    return (
      <div className="flex items-center gap-2 text-xs">
        <Spinner />
        {t("loading")}
      </div>
    );
  }

  if (kind === "audio" && state.status === "ready" && state.url) {
    return <audio controls src={state.url} className="max-w-full" />;
  }

  if (kind === "document" && state.status === "ready" && state.url) {
    return (
      <a
        href={state.url}
        download={name}
        className="flex items-center gap-2 rounded-lg bg-black/5 p-2.5 text-xs underline dark:bg-white/10"
      >
        <span className="truncate font-medium">{name}</span>
        <span className="shrink-0 opacity-80">
          {formatFileSize(media.file_size_bytes)}
        </span>
      </a>
    );
  }

  // Audio o documento aún sin descargar.
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-lg bg-black/5 p-2.5 text-xs dark:bg-white/10">
      <span className="truncate font-medium">{name}</span>
      <span className="opacity-80">
        {formatFileSize(media.file_size_bytes)}
      </span>
      <Button type="button" variant="outline" size="xs" onClick={state.load}>
        {kind === "audio" ? t("loadAudio") : t("download")}
      </Button>
    </div>
  );
}
