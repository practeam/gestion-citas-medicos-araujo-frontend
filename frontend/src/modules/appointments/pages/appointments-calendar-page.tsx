import { PageBreadcrumb } from "@/components/shared/page-breadcrumb";
import { Can } from "@/modules/auth";
import { PageMeta } from "@/components/shared/page-meta";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useTranslations } from "@/i18n";
import { PlusIcon } from "@/icons";
import { useCallback, useMemo, useState } from "react";
import { useSearchParams } from "react-router";
import { AppointmentDetailModal } from "../components/appointment-detail-modal";
import {
  AppointmentFormModal,
  type AppointmentFormTarget,
} from "../components/appointment-form-modal";
import {
  AppointmentsCalendar,
  type CalendarSlot,
} from "../components/appointments-calendar";
import { AppointmentsFilters } from "../components/appointments-filters";
import { useAppointments, type VisibleRange } from "../hooks/use-appointments";
import { useEntityLabels } from "../hooks/use-entity-labels";
import {
  APPOINTMENT_STATUSES,
  type AppointmentFilters,
  type AppointmentStatusFilter,
} from "../types/appointment.types";
import { getAppointmentErrorMessage } from "../utils/appointment-error.utils";

type Notice =
  "created" | "updated" | "confirmed" | "completed" | "cancelled" | "pending";

const EMPTY_FILTERS: AppointmentFilters = {
  patientId: null,
  staffMemberId: null,
  status: "all",
};

function parseId(value: string | null): number | null {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

/** Filtros iniciales desde la URL (enlaces de las secciones de paciente y personal). */
function getInitialFilters(params: URLSearchParams): AppointmentFilters {
  const status = params.get("status");
  return {
    patientId: parseId(params.get("patientId")),
    staffMemberId: parseId(params.get("staffMemberId")),
    status: APPOINTMENT_STATUSES.includes(
      status as (typeof APPOINTMENT_STATUSES)[number],
    )
      ? (status as AppointmentStatusFilter)
      : "all",
  };
}

/**
 * Agenda de citas: el calendario es la vista principal. La creación, el
 * detalle, la edición/reprogramación y los cambios de estado se hacen con
 * modales sobre esta misma página (sin rutas propias).
 */
export default function AppointmentsCalendarPage() {
  const t = useTranslations("appointments");
  const tErrors = useTranslations("appointments.errors");
  const [searchParams] = useSearchParams();
  const [filters, setFilters] = useState<AppointmentFilters>(() =>
    getInitialFilters(searchParams),
  );
  const [range, setRange] = useState<VisibleRange | null>(null);
  const [formTarget, setFormTarget] = useState<AppointmentFormTarget | null>(
    null,
  );
  const [detailId, setDetailId] = useState<number | null>(null);
  const [notice, setNotice] = useState<Notice | null>(null);

  const { appointments, isTruncated, error, isLoading, reload } =
    useAppointments(range, filters);

  const patientIds = useMemo(
    () => (appointments ?? []).map((a) => a.patient_id),
    [appointments],
  );
  const staffIds = useMemo(
    () => (appointments ?? []).map((a) => a.staff_member_id),
    [appointments],
  );
  const patientLabels = useEntityLabels("patient", patientIds);
  const staffLabels = useEntityLabels("staff", staffIds);

  const hasFilters =
    filters.patientId !== null ||
    filters.staffMemberId !== null ||
    filters.status !== "all";

  const handleRangeChange = useCallback((next: VisibleRange) => {
    setRange((prev) =>
      prev?.startDate === next.startDate && prev.endDate === next.endDate
        ? prev
        : next,
    );
  }, []);

  const openCreate = (slot?: CalendarSlot) => {
    setNotice(null);
    setFormTarget({ mode: "create", initial: slot });
  };

  return (
    <div>
      <PageMeta title={t("meta.title")} description={t("meta.description")} />
      <PageBreadcrumb pageTitle={t("title")} />

      <div className="space-y-4">
        {notice && (
          <Alert variant="success">
            <AlertDescription className="flex items-center justify-between gap-3">
              <span>{t(`notices.${notice}`)}</span>
              <Button
                type="button"
                variant="ghost"
                size="xs"
                onClick={() => setNotice(null)}
              >
                {t("dismiss")}
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/3">
          <div className="flex flex-col gap-4 p-4 sm:p-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex-1">
              <AppointmentsFilters
                filters={filters}
                hasFilters={hasFilters}
                onChange={(patch) =>
                  setFilters((prev) => ({ ...prev, ...patch }))
                }
                onClear={() => setFilters(EMPTY_FILTERS)}
              />
            </div>
            <Can permission="appointment.create">
              <Button onClick={() => openCreate()}>
                <PlusIcon className="fill-current" />
                {t("newAppointment")}
              </Button>
            </Can>
          </div>

          <div className="space-y-4 border-t border-gray-100 p-4 sm:p-6 dark:border-white/5">
            {error ? (
              <Alert variant="destructive">
                <AlertDescription className="flex flex-wrap items-center justify-between gap-3">
                  <span>{getAppointmentErrorMessage(error, tErrors)}</span>
                  <Button
                    type="button"
                    variant="outline"
                    size="xs"
                    onClick={reload}
                  >
                    {t("retry")}
                  </Button>
                </AlertDescription>
              </Alert>
            ) : isTruncated ? (
              <Alert variant="warning">
                <AlertDescription>{t("truncated")}</AlertDescription>
              </Alert>
            ) : null}

            {appointments?.length === 0 && !isLoading && !error && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {hasFilters ? t("noResults") : t("empty")}
              </p>
            )}

            <AppointmentsCalendar
              appointments={appointments}
              patientLabels={patientLabels}
              staffLabels={staffLabels}
              isLoading={isLoading}
              onRangeChange={handleRangeChange}
              onSelectAppointment={setDetailId}
              onSelectSlot={openCreate}
            />
          </div>
        </div>

        <p className="text-xs text-gray-500 dark:text-gray-400">
          {t("availabilityNote")}
        </p>
      </div>

      <AppointmentDetailModal
        appointmentId={detailId}
        onClose={() => setDetailId(null)}
        onEdit={(appointment, labels) => {
          setDetailId(null);
          setFormTarget({
            mode: "edit",
            appointment,
            patientLabel: labels.patient,
            staffLabel: labels.staff,
          });
        }}
        onStatusChanged={(_updated, status) => {
          setNotice(status);
          reload();
        }}
      />

      <AppointmentFormModal
        target={formTarget}
        onClose={() => setFormTarget(null)}
        onChanged={() => reload()}
        onSaved={(saved, mode) => {
          setFormTarget(null);
          setNotice(mode === "create" ? "created" : "updated");
          reload();
          // Tras reprogramar se vuelve a mostrar el detalle actualizado.
          if (mode === "edit") setDetailId(saved.id);
        }}
      />
    </div>
  );
}
