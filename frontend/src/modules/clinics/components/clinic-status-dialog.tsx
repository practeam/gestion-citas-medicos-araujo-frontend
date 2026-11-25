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
import type { Clinic } from "../types/clinic.types";

interface ClinicStatusDialogProps {
  /** Rol cuyo estado se va a cambiar; `null` mantiene el diálogo cerrado. */
  clinic: Clinic | null;
  isPending: boolean;
  error: string | null;
  onConfirm: () => void;
  onClose: () => void;
}

export function ClinicStatusDialog({
  clinic,
  isPending,
  error,
  onConfirm,
  onClose,
}: ClinicStatusDialogProps) {
  const t = useTranslations("clinics.statusDialog");
  const action = clinic?.is_active ? "deactivate" : "activate";

  return (
    <Dialog
      open={clinic !== null}
      onOpenChange={(open) => {
        if (!open && !isPending) onClose();
      }}
    >
      <DialogContent showCloseButton={!isPending}>
        <DialogHeader>
          <DialogTitle>{t(`${action}.title`)}</DialogTitle>
          <DialogDescription>
            {t(`${action}.description`, { name: clinic?.name ?? "" })}
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
