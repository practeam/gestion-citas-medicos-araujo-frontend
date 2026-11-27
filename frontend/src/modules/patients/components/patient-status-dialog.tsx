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
import { CheckCircleIcon, XIcon } from "@/icons";
import { getPersonFullName } from "@/modules/persons";
import type { Patient } from "../types/patient.types";

interface PatientStatusDialogProps {
  /** Rol cuyo estado se va a cambiar; `null` mantiene el diálogo cerrado. */
  patient: Patient | null;
  isPending: boolean;
  error: string | null;
  onConfirm: () => void;
  onClose: () => void;
}

export function PatientStatusDialog({
  patient,
  isPending,
  error,
  onConfirm,
  onClose,
}: PatientStatusDialogProps) {
  const t = useTranslations("patients.statusDialog");
  const action = patient?.is_active ? "deactivate" : "activate";

  return (
    <Dialog
      open={patient !== null}
      onOpenChange={(open) => {
        if (!open && !isPending) onClose();
      }}
    >
      <DialogContent showCloseButton={!isPending}>
        <DialogHeader>
          <DialogTitle>{t(`${action}.title`)}</DialogTitle>
          <DialogDescription>
            {t(`${action}.description`, {
              name: patient ? getPersonFullName(patient.person) : "",
            })}
          </DialogDescription>
        </DialogHeader>
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <DialogFooter>
          <Button
            variant="outline"
            size="sm"
            disabled={isPending}
            onClick={onClose}
          >
            <XIcon className="fill-current" />
            {t("cancel")}
          </Button>
          <Button
            variant={action === "deactivate" ? "destructive" : "default"}
            size="sm"
            disabled={isPending}
            onClick={onConfirm}
          >
            {isPending ? (
              <Spinner />
            ) : action === "activate" ? (
              <CheckCircleIcon className="fill-current" />
            ) : (
              <XIcon className="fill-current" />
            )}
            {t(`${action}.confirm`)}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
