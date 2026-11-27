import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useTranslations } from "@/i18n";
import { Can } from "@/modules/auth";
import { Link } from "react-router";
import { GuardedPatientsList } from "./guarded-patients-list";
import { GuardianPersonCard } from "./guardian-person-card";
import type { GuardianRelationship } from "../types/guardian.types";

interface GuardianDetailDialogProps {
  /** Persona apoderada a consultar; `null` mantiene el diálogo cerrado. */
  personId: number | null;
  /** Parentesco con el paciente que se está viendo, si se abrió desde uno. */
  relationship?: GuardianRelationship;
  onClose: () => void;
}

/**
 * Consulta de un apoderado: datos personales y de contacto, y pacientes de los
 * que es apoderado. Los datos personales se modifican desde `persons`.
 */
export function GuardianDetailDialog({
  personId,
  relationship,
  onClose,
}: GuardianDetailDialogProps) {
  const t = useTranslations("guardians.detail");
  const tRelationship = useTranslations("guardians.relationship");

  return (
    <Dialog
      open={personId !== null}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>
        {personId !== null && (
          <div className="space-y-5">
            {relationship && (
              <p className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                {t("relationship")}:{" "}
                <Badge size="sm" color="light">
                  {tRelationship(relationship)}
                </Badge>
              </p>
            )}
            <GuardianPersonCard personId={personId} />
            <section className="space-y-3 border-t border-gray-100 pt-4 dark:border-gray-800">
              <h4 className="text-sm font-semibold text-gray-800 dark:text-white/90">
                {t("patients")}
              </h4>
              <GuardedPatientsList personId={personId} />
            </section>
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Button type="button" variant="outline" onClick={onClose}>
                {t("close")}
              </Button>
              <Can permission="person.update">
                <Button
                  type="button"
                  variant="outline"
                  nativeButton={false}
                  render={<Link to={`/persons/${personId}/edit`} />}
                >
                  {t("editPerson")}
                </Button>
              </Can>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
