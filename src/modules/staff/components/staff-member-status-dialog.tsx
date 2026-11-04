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
import { getPersonFullName } from "@/modules/persons";
import type { StaffMember } from "../types/staff-member.types";

interface StaffMemberStatusDialogProps {
  /** Rol cuyo estado se va a cambiar; `null` mantiene el diálogo cerrado. */
  staffMember: StaffMember | null;
  isPending: boolean;
  error: string | null;
  onConfirm: () => void;
  onClose: () => void;
}

export function StaffMemberStatusDialog({
  staffMember,
  isPending,
  error,
  onConfirm,
  onClose,
}: StaffMemberStatusDialogProps) {
  const t = useTranslations("staff.statusDialog");
  const action = staffMember?.is_active ? "deactivate" : "activate";

  return (
    <Dialog
      open={staffMember !== null}
      onOpenChange={(open) => {
        if (!open && !isPending) onClose();
      }}
    >
      <DialogContent showCloseButton={!isPending}>
        <DialogHeader>
          <DialogTitle>{t(`${action}.title`)}</DialogTitle>
          <DialogDescription>
            {t(`${action}.description`, {
              name: staffMember ? getPersonFullName(staffMember.person) : "",
            })}
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
