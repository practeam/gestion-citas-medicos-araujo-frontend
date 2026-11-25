import { Badge } from "@/components/ui/badge";
import { useTranslations } from "@/i18n";
import type { ConversationStatus } from "../types/conversation.types";

/** Abierta: activa. Cerrada: finalizada (se distinguen por texto y color). */
export function ConversationStatusBadge({
  status,
}: {
  status: ConversationStatus;
}) {
  const t = useTranslations("conversations.status");

  return (
    <Badge size="sm" color={status === "open" ? "success" : "gray"}>
      {t(status)}
    </Badge>
  );
}

/** Canal legible; los canales nuevos se muestran con su nombre sin rediseñar el módulo. */
export function ConversationChannelBadge({ channel }: { channel: string }) {
  const t = useTranslations("conversations.channel");

  return (
    <Badge size="sm" color="light">
      {channel === "whatsapp" ? t("whatsapp") : channel}
    </Badge>
  );
}
