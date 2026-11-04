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
import type { Procedure } from "../types/procedure.types";

interface ProcedureStatusDialogProps {
  /** Rol cuyo estado se va a cambiar; `null` mantiene el diálogo cerrado. */
  procedure: Procedure | null;
  isPending: boolean;
  error: string | null;
  onConfirm: () => void;
  onClose: () => void;
}

export function ProcedureStatusDialog({
  procedure,
  isPending,
  error,
  onConfirm,
  onClose,
}: ProcedureStatusDialogProps) {
  const t = useTranslations("procedures.statusDialog");
  const action = procedure?.is_active ? "deactivate" : "activate";

  return (
    <Dialog
      open={procedure !== null}
      onOpenChange={(open) => {
        if (!open && !isPending) onClose();
      }}
    >
      <DialogContent showCloseButton={!isPending}>
        <DialogHeader>
          <DialogTitle>{t(`${action}.title`)}</DialogTitle>
          <DialogDescription>
            {t(`${action}.description`, { name: procedure?.name ?? "" })}
          </DialogDescription>
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
            variant={action === "deactivate" ? "destructive" : "default"}
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
