import { ComponentCard } from "@/components/shared/component-card";
import { PageBreadcrumb } from "@/components/shared/page-breadcrumb";
import { PageMeta } from "@/components/shared/page-meta";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useTranslations } from "@/i18n";
import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { ClinicForm } from "../components/clinic-form";
import { ClinicSchedulesDrafts } from "../components/clinic-schedules-drafts";
import type { ClinicFormValues } from "../schemas/clinic-schema";
import { clinicApi } from "../services/clinic-api";
import type { Clinic } from "../types/clinic.types";
import type {
  ScheduleDraft,
  ScheduleOperationResult,
} from "../types/clinic-schedule.types";
import { toCreatePayload } from "../utils/clinic-payload.utils";
import {
  findOverlappingKeys,
  getScheduleOperationErrorMessage,
  normalizeTime,
  runScheduleOperations,
  validateSchedule,
} from "../utils/clinic-schedule.utils";

const EMPTY_VALUES: ClinicFormValues = {
  name: "",
  address: "",
  description: "",
  phone: "",
  email: "",
};

/** Resultado del registro de horarios tras crear la clínica. */
interface ScheduleOutcome {
  created: ScheduleDraft[];
  failed: { draft: ScheduleDraft; result: ScheduleOperationResult }[];
}

export default function ClinicCreatePage() {
  const t = useTranslations("clinics");
  const tErrors = useTranslations("clinics.schedules.errors");
  const navigate = useNavigate();

  const [drafts, setDrafts] = useState<ScheduleDraft[]>([]);
  const [draftErrors, setDraftErrors] = useState<Record<string, string>>({});
  // Clínica ya creada en este flujo: no debe volver a crearse.
  const [createdClinic, setCreatedClinic] = useState<Clinic | null>(null);
  const [outcome, setOutcome] = useState<ScheduleOutcome | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);

  const finish = () =>
    void navigate("/clinics", { state: { notice: "created" } });

  /** Validación preventiva de los intervalos; el backend decide definitivamente. */
  const validateDrafts = () => {
    const errors: Record<string, string> = {};
    for (const draft of drafts) {
      const key = validateSchedule(draft.values);
      if (key) errors[draft.key] = key;
    }
    const overlapping = findOverlappingKeys(
      drafts.map((draft) => ({
        key: draft.key,
        values: draft.values,
        isActive: true,
      })),
    );
    for (const key of overlapping) errors[key] ??= "overlap";
    return errors;
  };

  /**
   * Registra los intervalos indicados (un POST por intervalo, secuencial). Si
   * todo sale bien termina el flujo; si no, deja el detalle de lo creado y lo
   * fallido —con los valores introducidos— para reintentar solo lo pendiente.
   */
  const createSchedules = async (
    clinicId: number,
    pending: ScheduleDraft[],
    alreadyCreated: ScheduleDraft[],
  ) => {
    if (pending.length === 0) {
      finish();
      return;
    }
    const results = await runScheduleOperations(
      clinicId,
      pending.map((draft) => ({
        kind: "create",
        draftKey: draft.key,
        values: draft.values,
        summary: {
          day_of_week: draft.values.day_of_week,
          starts_at: draft.values.starts_at,
          ends_at: draft.values.ends_at,
        },
      })),
    );
    const failed = results
      .filter((result) => result.error)
      .map((result) => ({
        draft: pending.find(
          (draft) => draft.key === result.operation.draftKey,
        )!,
        result,
      }));
    if (failed.length === 0) {
      finish();
      return;
    }
    const failedKeys = new Set(failed.map(({ draft }) => draft.key));
    setOutcome({
      created: [
        ...alreadyCreated,
        ...pending.filter((draft) => !failedKeys.has(draft.key)),
      ],
      failed,
    });
  };

  /** Primero POST /clinics; solo si tiene éxito se registran los horarios. */
  const handleSubmit = async (values: ClinicFormValues) => {
    const errors = validateDrafts();
    setDraftErrors(errors);
    if (Object.keys(errors).length > 0) return;
    // Si falla, ClinicForm muestra el error de la clínica y no se crea ningún horario.
    const clinic = await clinicApi.create(toCreatePayload(values));
    setCreatedClinic(clinic);
    await createSchedules(clinic.id, drafts, []);
  };

  /** Reintenta únicamente los intervalos fallidos de la clínica ya creada. */
  const retry = async () => {
    if (!createdClinic || !outcome || isRetrying) return;
    setIsRetrying(true);
    try {
      await createSchedules(
        createdClinic.id,
        outcome.failed.map(({ draft }) => draft),
        outcome.created,
      );
    } finally {
      setIsRetrying(false);
    }
  };

  const summaryOf = (draft: ScheduleDraft) =>
    `${t(`schedules.days.${draft.values.day_of_week}`)} ${normalizeTime(draft.values.starts_at)}–${normalizeTime(draft.values.ends_at)}`;

  return (
    <div>
      <PageMeta
        title={t("form.createTitle")}
        description={t("meta.description")}
      />
      <PageBreadcrumb pageTitle={t("form.createTitle")} />
      <ComponentCard title={t("form.createTitle")}>
        {createdClinic ? (
          !outcome ? (
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <Spinner />
              {t("schedules.creating")}
            </div>
          ) : (
            <div className="space-y-6">
              <Alert variant="warning">
                <AlertTitle>{t("schedules.partial.title")}</AlertTitle>
                <AlertDescription>
                  {t("schedules.partial.description", {
                    name: createdClinic.name,
                  })}
                </AlertDescription>
              </Alert>
              {outcome.created.length > 0 && (
                <section className="space-y-2">
                  <h4 className="text-sm font-semibold text-gray-800 dark:text-white/90">
                    {t("schedules.partial.created")}
                  </h4>
                  <ul className="list-disc ps-5 text-sm text-gray-700 dark:text-gray-300">
                    {outcome.created.map((draft) => (
                      <li key={draft.key}>{summaryOf(draft)}</li>
                    ))}
                  </ul>
                </section>
              )}
              <section className="space-y-2">
                <h4 className="text-sm font-semibold text-gray-800 dark:text-white/90">
                  {t("schedules.partial.failed")}
                </h4>
                <ul className="list-disc ps-5 text-sm text-gray-700 dark:text-gray-300">
                  {outcome.failed.map(({ draft, result }) => (
                    <li key={draft.key}>
                      <strong>{summaryOf(draft)}</strong>:{" "}
                      {getScheduleOperationErrorMessage(
                        result.error,
                        "create",
                        tErrors,
                      )}
                    </li>
                  ))}
                </ul>
              </section>
              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <Button
                  variant="outline"
                  disabled={isRetrying}
                  nativeButton={false}
                  render={<Link to="/clinics" />}
                >
                  {t("schedules.partial.goToList")}
                </Button>
                <Button
                  variant="outline"
                  disabled={isRetrying}
                  nativeButton={false}
                  render={<Link to={`/clinics/${createdClinic.id}/edit`} />}
                >
                  {t("schedules.partial.editClinic")}
                </Button>
                <Button disabled={isRetrying} onClick={() => void retry()}>
                  {isRetrying && <Spinner />}
                  {isRetrying ? t("form.saving") : t("schedules.partial.retry")}
                </Button>
              </div>
            </div>
          )
        ) : (
          <ClinicForm
            defaultValues={EMPTY_VALUES}
            submitLabel={t("form.create")}
            onSubmit={handleSubmit}
          >
            <section className="space-y-4 border-t border-gray-100 pt-6 dark:border-gray-800">
              <div>
                <h4 className="text-sm font-semibold text-gray-800 dark:text-white/90">
                  {t("schedules.title")}
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {t("schedules.createHint")}
                </p>
              </div>
              <ClinicSchedulesDrafts
                drafts={drafts}
                onChange={setDrafts}
                errors={draftErrors}
              />
            </section>
          </ClinicForm>
        )}
      </ComponentCard>
    </div>
  );
}
