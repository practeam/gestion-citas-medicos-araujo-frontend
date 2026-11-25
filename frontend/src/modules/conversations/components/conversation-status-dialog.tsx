import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import { useTranslations } from "@/i18n";
import type { ConversationStatus } from "../types/conversation.types";

interface ConversationStatusDialogProps {
  /** Estado al que se quiere pasar; `null` mantiene el diálogo cerrado. */
  target: ConversationStatus | null;
  isPending: boolean;
  error: string | null;
  onConfirm: () => void;
  onClose: () => void;
}

/** Confirmación para cerrar o reabrir una conversación. */
export function ConversationStatusDialog({
  target,
  isPending,
  error,
  onConfirm,
  onClose,
}: ConversationStatusDialogProps) {
  const t = useTranslations("conversations.statusDialog");
  const action = target === "closed" ? "close" : "reopen";

  return (
    <Dialog
      open={target !== null}
      onOpenChange={(open) => {
        if (!open && !isPending) onClose();
      }}
    >
      <DialogContent showCloseButton={!isPending}>
        <DialogHeader>
          <DialogTitle>{t(`${action}.title`)}</DialogTitle>
          <DialogDescription>{t(`${action}.description`)}</DialogDescription>
        </DialogHeader>
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <DialogFooter>
          <Button variant="outline" disabled={isPending} onClick={onClose}>
            {t("cancel")}
          </Button>
          <Button
            variant={action === "close" ? "destructive" : "default"}
            disabled={isPending}
            onClick={onConfirm}
          >
            {isPending && <Spinner />}
            {t(`${action}.confirm`)}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
