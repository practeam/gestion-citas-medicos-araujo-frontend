import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
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
import { Can } from "@/modules/auth";
import { getPersonDocument, getPersonFullName } from "@/modules/persons";
import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router";
import { usePatientGuardians } from "../hooks/use-patient-guardians";
import { guardianApi } from "../services/guardian-api";
import type { Guardian, GuardianRelationship } from "../types/guardian.types";
import { getGuardianErrorMessage } from "../utils/guardian-error.utils";
import { GuardianAddDialog } from "./guardian-add-dialog";
import { GuardianDetailDialog } from "./guardian-detail-dialog";
import { GuardianRelationshipSelect } from "./guardian-relationship-select";

interface GuardiansSectionProps {
  patientId: number;
  /** Permite asociar, cambiar el parentesco y desasociar (según los permisos del usuario). */
  manage?: boolean;
  /** Oculta el encabezado cuando el contenedor ya identifica la sección. */
  showHeading?: boolean;
  /** Permite omitir el texto vacío en flujos compactos. */
  showEmptyMessage?: boolean;
  /** Notifica que una asociación fue agregada, modificada o retirada. */
  onChanged?: () => void;
}

type Notice = "added" | "updated" | "removed";

/**
 * Apoderados de un paciente. En el detalle es de consulta; en la edición
 * (`manage`) permite asociar una persona existente o nueva, cambiar el
 * parentesco y desasociar. Desasociar elimina solo la relación: la persona se
 * conserva. Cada operación se confirma con la respuesta de la API.
 */
export function GuardiansSection(props: GuardiansSectionProps) {
  return (
    <Can
      permission="patient_guardian.read"
      fallback={<NoPermissionNotice showHeading={props.showHeading} />}
    >
      <SectionContent {...props} />
    </Can>
  );
}

/** Sin `patient_guardian.read` la sección no se oculta en silencio: se explica por qué falta. */
function NoPermissionNotice({ showHeading = true }: { showHeading?: boolean }) {
  const t = useTranslations("guardians.section");

  return (
    <section
      id="guardians"
      className="space-y-3 border-t border-gray-100 pt-5 dark:border-gray-800"
    >
      {showHeading && (
        <h4 className="text-sm font-semibold text-gray-800 dark:text-white/90">
          {t("title")}
        </h4>
      )}
      <Alert variant="info">
        <AlertDescription>{t("noPermission")}</AlertDescription>
      </Alert>
    </section>
  );
}

function SectionContent({
  patientId,
  manage = false,
  showHeading = true,
  showEmptyMessage = true,
  onChanged,
}: GuardiansSectionProps) {
  const location = useLocation();
  const sectionRef = useRef<HTMLElement>(null);
  const isLoaded = useRef(false);
  const t = useTranslations("guardians.section");
  const tRelationship = useTranslations("guardians.relationship");
  const tErrors = useTranslations("guardians.errors");
  const { guardians, error, isLoading, reload } =
    usePatientGuardians(patientId);
  // Enlace directo desde el listado (`#guardians`): se baja a la sección al cargar.
  useEffect(() => {
    if (location.hash !== "#guardians" || !guardians || isLoaded.current)
      return;
    isLoaded.current = true;
    sectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [location.hash, guardians]);
  const [notice, setNotice] = useState<Notice | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [viewing, setViewing] = useState<Guardian | null>(null);
  const [editing, setEditing] = useState<Guardian | null>(null);
  const [removing, setRemoving] = useState<Guardian | null>(null);

  return (
    <section
      id="guardians"
      ref={sectionRef}
      className={
        showHeading
          ? "space-y-3 border-t border-gray-100 pt-5 dark:border-gray-800"
          : "space-y-3"
      }
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        {showHeading && (
          <h4 className="text-sm font-semibold text-gray-800 dark:text-white/90">
            {t("title")}
          </h4>
        )}
        {manage && (
          <Can permission="patient_guardian.create">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setAddOpen(true)}
            >
              {t("add")}
            </Button>
          </Can>
        )}
      </div>

      {notice && (
        <Alert variant="success">
          <AlertDescription>{t(`notices.${notice}`)}</AlertDescription>
        </Alert>
      )}

      {error ? (
        <div className="space-y-3">
          <Alert variant="destructive">
            <AlertDescription>
              {getGuardianErrorMessage(error, tErrors)}
            </AlertDescription>
          </Alert>
          <Button type="button" variant="outline" size="sm" onClick={reload}>
            {t("retry")}
          </Button>
        </div>
      ) : isLoading || !guardians ? (
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <Spinner />
          {t("loading")}
        </div>
      ) : guardians.length === 0 && showEmptyMessage ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {manage ? t("emptyManage") : t("empty")}
        </p>
      ) : (
        <ul className="divide-y divide-gray-100 rounded-xl border border-gray-200 dark:divide-white/5 dark:border-gray-800">
          {guardians.map((guardian) => (
            <li
              key={guardian.id}
              className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-gray-800 dark:text-white/90">
                  {getPersonFullName(guardian.person)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {getPersonDocument(guardian.person) ?? t("noValue")}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge size="sm" color="light">
                  {tRelationship(guardian.relationship)}
                </Badge>
                {!guardian.person.is_active && (
                  <Badge size="sm" color="gray">
                    {t("personInactive")}
                  </Badge>
                )}
                <Button
                  type="button"
                  size="xs"
                  variant="outline"
                  onClick={() => setViewing(guardian)}
                >
                  {t("view")}
                </Button>
                {manage && (
                  <>
                    <Can permission="patient_guardian.update">
                      <Button
                        type="button"
                        size="xs"
                        variant="outline"
                        onClick={() => setEditing(guardian)}
                      >
                        {t("editRelationship")}
                      </Button>
                    </Can>
                    <Can permission="patient_guardian.delete">
                      <Button
                        type="button"
                        size="xs"
                        variant="outline"
                        onClick={() => setRemoving(guardian)}
                      >
                        {t("remove")}
                      </Button>
                    </Can>
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      <GuardianAddDialog
        open={addOpen}
        onClose={() => setAddOpen(false)}
        excludePersonIds={(guardians ?? []).map((item) => item.person_id)}
        getErrorMessage={(caught) => getGuardianErrorMessage(caught, tErrors)}
        onConfirm={async (person, relationship) => {
          await guardianApi.create(patientId, {
            person_id: person.id,
            relationship,
          });
          setNotice("added");
          onChanged?.();
          reload();
        }}
      />

      <GuardianDetailDialog
        personId={viewing?.person_id ?? null}
        relationship={viewing?.relationship}
        onClose={() => setViewing(null)}
      />

      <RelationshipDialog
        guardian={editing}
        onClose={() => setEditing(null)}
        onSave={async (guardian, relationship) => {
          await guardianApi.updateRelationship(
            patientId,
            guardian.id,
            relationship,
          );
          setNotice("updated");
          onChanged?.();
          reload();
        }}
      />

      <RemoveDialog
        guardian={removing}
        onClose={() => setRemoving(null)}
        onConfirm={async (guardian) => {
          await guardianApi.remove(patientId, guardian.id);
          setNotice("removed");
          onChanged?.();
          reload();
        }}
      />
    </section>
  );
}

function RelationshipDialog({
  guardian,
  onClose,
  onSave,
}: {
  guardian: Guardian | null;
  onClose: () => void;
  onSave: (
    guardian: Guardian,
    relationship: GuardianRelationship,
  ) => Promise<void>;
}) {
  const t = useTranslations("guardians.relationshipDialog");
  const tErrors = useTranslations("guardians.errors");
  const [selected, setSelected] = useState<GuardianRelationship | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const value = selected ?? guardian?.relationship ?? null;

  const close = () => {
    if (isPending) return;
    setSelected(null);
    setError(null);
    onClose();
  };

  const save = async () => {
    if (!guardian || value === null || isPending) return;
    if (value === guardian.relationship) {
      close();
      return;
    }
    setIsPending(true);
    setError(null);
    try {
      await onSave(guardian, value);
      setSelected(null);
      onClose();
    } catch (caught) {
      setError(getGuardianErrorMessage(caught, tErrors));
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Dialog
      open={guardian !== null}
      onOpenChange={(open) => {
        if (!open) close();
      }}
    >
      <DialogContent showCloseButton={!isPending}>
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>
            {t("description", {
              name: guardian ? getPersonFullName(guardian.person) : "",
            })}
          </DialogDescription>
        </DialogHeader>
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <GuardianRelationshipSelect
          value={value}
          onChange={setSelected}
          disabled={isPending}
          ariaLabel={t("label")}
        />
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            disabled={isPending}
            onClick={close}
          >
            {t("cancel")}
          </Button>
          <Button
            type="button"
            disabled={isPending}
            onClick={() => void save()}
          >
            {isPending && <Spinner />}
            {t("save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function RemoveDialog({
  guardian,
  onClose,
  onConfirm,
}: {
  guardian: Guardian | null;
  onClose: () => void;
  onConfirm: (guardian: Guardian) => Promise<void>;
}) {
  const t = useTranslations("guardians.removeDialog");
  const tErrors = useTranslations("guardians.errors");
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  const close = () => {
    if (isPending) return;
    setError(null);
    onClose();
  };

  const confirm = async () => {
    if (!guardian || isPending) return;
    setIsPending(true);
    setError(null);
    try {
      await onConfirm(guardian);
      onClose();
    } catch (caught) {
      setError(getGuardianErrorMessage(caught, tErrors));
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Dialog
      open={guardian !== null}
      onOpenChange={(open) => {
        if (!open) close();
      }}
    >
      <DialogContent showCloseButton={!isPending}>
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>
            {t("description", {
              name: guardian ? getPersonFullName(guardian.person) : "",
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
            type="button"
            variant="outline"
            disabled={isPending}
            onClick={close}
          >
            {t("cancel")}
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={isPending}
            onClick={() => void confirm()}
          >
            {isPending && <Spinner />}
            {t("confirm")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
