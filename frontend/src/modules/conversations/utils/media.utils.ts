import { MEDIA_RULES, type MediaKind } from "../types/message.types";

export type MediaFileError = "unsupported" | "tooLarge" | "empty";

/** Tipo de mensaje que corresponde al MIME del archivo, o `null` si WhatsApp no lo admite. */
export function getMediaKind(mime: string): MediaKind | null {
  const base = mime.split(";")[0].trim().toLowerCase();
  for (const kind of Object.keys(MEDIA_RULES) as MediaKind[]) {
    if (MEDIA_RULES[kind].mimes.includes(base)) return kind;
  }
  return null;
}

/**
 * Validación previa al envío (tipo y tamaño de la spec 26). Es solo una ayuda:
 * el backend vuelve a validar MIME, extensión, firma y tamaño.
 */
export function validateMediaFile(
  file: File,
): { kind: MediaKind; error: null } | { kind: null; error: MediaFileError } {
  if (file.size === 0) return { kind: null, error: "empty" };
  const kind = getMediaKind(file.type);
  if (!kind) return { kind: null, error: "unsupported" };
  if (file.size > MEDIA_RULES[kind].maxBytes)
    return { kind: null, error: "tooLarge" };
  return { kind, error: null };
}

/** Atributo `accept` del selector de archivos. */
export const MEDIA_ACCEPT = Object.values(MEDIA_RULES)
  .flatMap((rule) => rule.mimes)
  .join(",");

export function formatFileSize(bytes: number | null): string {
  if (bytes === null) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
