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
import type { Specialty } from "../types/specialty.types";

interface SpecialtyStatusDialogProps {
  /** Rol cuyo estado se va a cambiar; `null` mantiene el diálogo cerrado. */
  specialty: Specialty | null;
  isPending: boolean;
  error: string | null;
  onConfirm: () => void;
  onClose: () => void;
}

export function SpecialtyStatusDialog({
  specialty,
  isPending,
  error,
  onConfirm,
  onClose,
}: SpecialtyStatusDialogProps) {
  const t = useTranslations("specialties.statusDialog");
  const action = specialty?.is_active ? "deactivate" : "activate";

  return (
    <Dialog
      open={specialty !== null}
      onOpenChange={(open) => {
        if (!open && !isPending) onClose();
      }}
    >
      <DialogContent showCloseButton={!isPending}>
        <DialogHeader>
          <DialogTitle>{t(`${action}.title`)}</DialogTitle>
          <DialogDescription>
            {t(`${action}.description`, { name: specialty?.name ?? "" })}
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
