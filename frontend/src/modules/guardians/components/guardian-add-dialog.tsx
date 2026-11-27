import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldLabel } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { useTranslations } from "@/i18n";
import { Can } from "@/modules/auth";
import {
  EMPTY_PERSON_FORM_VALUES,
  PersonForm,
  PersonSelector,
  getPersonDocument,
  getPersonFullName,
  personApi,
  toCreatePayload as toCreatePersonPayload,
  type Person,
  type PersonFormValues,
} from "@/modules/persons";
import { ApiError } from "@/services/api";
import { useState } from "react";
import type { GuardianRelationship } from "../types/guardian.types";
import { GuardianRelationshipSelect } from "./guardian-relationship-select";

interface GuardianAddDialogProps {
  open: boolean;
  onClose: () => void;
  /** Ids de personas que ya son apoderadas: no se pueden agregar de nuevo. */
  excludePersonIds: readonly number[];
  /**
   * Recibe la persona (siempre ya registrada) y el parentesco. Debe lanzar el
   * error original si la operación falla; el diálogo lo muestra y conserva la
   * persona para reintentar sin volver a registrarla.
   */
  onConfirm: (
    person: Person,
    relationship: GuardianRelationship,
  ) => Promise<void>;
  /** Mensaje comprensible para un error lanzado por `onConfirm`. */
  getErrorMessage: (error: unknown) => string;
}

type Mode = "existing" | "new";

/**
 * Agregar un apoderado: buscar una persona existente (`PersonSelector`) o
 * registrar una nueva con `PersonForm`, y elegir el parentesco. Seleccionar un
 * resultado nunca crea una persona; la persona nueva se registra una sola vez
 * (si la asociación posterior falla, queda seleccionada para reintentar).
 */
export function GuardianAddDialog({
  open,
  onClose,
  excludePersonIds,
  onConfirm,
  getErrorMessage,
}: GuardianAddDialogProps) {
  const t = useTranslations("guardians.addDialog");

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose();
      }}
    >
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>
        {/*
          Este diálogo puede abrirse dentro de otro formulario (alta de paciente).
          React propaga los eventos a través del portal: se detiene el `submit`
          para que el formulario de búsqueda o de persona no envíe el exterior.
        */}
        <div onSubmit={(event) => event.stopPropagation()}>
          {open && (
            <AddForm
              onClose={onClose}
              excludePersonIds={excludePersonIds}
              onConfirm={onConfirm}
              getErrorMessage={getErrorMessage}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function AddForm({
  onClose,
  excludePersonIds,
  onConfirm,
  getErrorMessage,
}: Omit<GuardianAddDialogProps, "open">) {
  const t = useTranslations("guardians.addDialog");
  const tRelationship = useTranslations("guardians");
  const [mode, setMode] = useState<Mode>("existing");
  const [person, setPerson] = useState<Person | null>(null);
  const [relationship, setRelationship] = useState<GuardianRelationship | null>(
    null,
  );
  const [relationshipError, setRelationshipError] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  const duplicate = person !== null && excludePersonIds.includes(person.id);

  /** Valida y entrega la persona al módulo consumidor. */
  const confirm = async (target: Person) => {
    if (relationship === null) {
      setRelationshipError(true);
      return false;
    }
    setRelationshipError(false);
    setError(null);
    setIsPending(true);
    try {
      await onConfirm(target, relationship);
      onClose();
      return true;
    } catch (caught) {
      setError(getErrorMessage(caught));
      return false;
    } finally {
      setIsPending(false);
    }
  };

  const submitNewPerson = async (values: PersonFormValues) => {
    if (relationship === null) {
      setRelationshipError(true);
      // PersonForm muestra el mensaje de un `ApiError` como alerta del formulario.
      throw new ApiError("http", 422, t("relationshipRequired"));
    }
    // 1) Registrar la persona (error → lo muestra `PersonForm`).
    const created = await personApi.create(toCreatePersonPayload(values));
    // 2) Pasa a ser la persona elegida: si la asociación falla, se reintenta sin duplicarla.
    setPerson(created);
    const ok = await confirm(created);
    if (!ok) setMode("existing");
  };

  const relationshipField = (
    <Field data-invalid={relationshipError}>
      <FieldLabel className="mb-1.5 block">
        {t("relationshipLabel")} <span className="text-red-500">*</span>
      </FieldLabel>
      <GuardianRelationshipSelect
        value={relationship}
        onChange={(value) => {
          setRelationship(value);
          setRelationshipError(false);
        }}
        disabled={isPending}
        invalid={relationshipError}
        ariaLabel={t("relationshipLabel")}
      />
      {relationshipError && (
        <p className="text-xs text-red-500">{t("relationshipRequired")}</p>
      )}
    </Field>
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-2 sm:flex-row">
        <Button
          type="button"
          variant={mode === "existing" ? "default" : "outline"}
          aria-pressed={mode === "existing"}
          disabled={isPending}
          onClick={() => setMode("existing")}
        >
          {t("modeExisting")}
        </Button>
        <Can permission="person.create">
          <Button
            type="button"
            variant={mode === "new" ? "default" : "outline"}
            aria-pressed={mode === "new"}
            disabled={isPending}
            onClick={() => setMode("new")}
          >
            {t("modeNew")}
          </Button>
        </Can>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {mode === "existing" ? (
        <div className="space-y-5">
          <PersonSelector
            value={person?.id ?? null}
            onSelect={setPerson}
            activeOnly
          />
          {person ? (
            <Alert variant={duplicate ? "warning" : "success"}>
              <AlertTitle>{t("selectedPerson")}</AlertTitle>
              <AlertDescription>
                {getPersonFullName(person)}
                {" · "}
                {getPersonDocument(person) ?? tRelationship("noValue")}
                {duplicate && <p className="mt-1">{t("duplicate")}</p>}
              </AlertDescription>
            </Alert>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t("selectPersonFirst")}
            </p>
          )}
          {relationshipField}
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              disabled={isPending}
              onClick={onClose}
            >
              {t("cancel")}
            </Button>
            <Button
              type="button"
              disabled={!person || duplicate || isPending}
              onClick={() => person && void confirm(person)}
            >
              {isPending && <Spinner />}
              {isPending ? t("adding") : t("confirm")}
            </Button>
          </div>
        </div>
      ) : (
        <PersonForm
          defaultValues={EMPTY_PERSON_FORM_VALUES}
          submitLabel={t("confirmNew")}
          onSubmit={submitNewPerson}
          onCancel={onClose}
        >
          {relationshipField}
        </PersonForm>
      )}
    </div>
  );
}
