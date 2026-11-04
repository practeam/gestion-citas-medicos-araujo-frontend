import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import { useLocale, useTranslations } from "@/i18n";
import { useState } from "react";
import { useAppointment } from "../hooks/use-appointment";
import { useAppointmentStatusChange } from "../hooks/use-appointment-status-change";
import { useEntityLabels } from "../hooks/use-entity-labels";
import type {
  Appointment,
  AppointmentStatus,
} from "../types/appointment.types";
import {
  formatDateOnly,
  formatDateTime,
  formatTimeOnly,
} from "../utils/appointment-datetime.utils";
import { getAppointmentErrorMessage } from "../utils/appointment-error.utils";
import {
  getAllowedTransitions,
  isTerminalStatus,
  requiresConfirmation,
} from "../utils/appointment-status.utils";
import { AppointmentDetailList } from "./appointment-detail-list";
import { AppointmentStatusBadge } from "./appointment-status-badge";

interface AppointmentDetailModalProps {
  /** Id de la cita a consultar; `null` mantiene el modal cerrado. */
  appointmentId: number | null;
  onClose: () => void;
  onEdit: (
    appointment: Appointment,
    labels: { patient: string; staff: string },
  ) => void;
  /** Tras un cambio de estado confirmado por la API. */
  onStatusChanged: (
    appointment: Appointment,
    status: AppointmentStatus,
  ) => void;
}

function DetailRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <dt className="font-medium text-gray-500 dark:text-gray-400">{label}</dt>
      <dd className="break-words whitespace-pre-line text-gray-800 dark:text-white/90">
        {children}
      </dd>
    </>
  );
}

export function AppointmentDetailModal({
  appointmentId,
  onClose,
  onEdit,
  onStatusChanged,
}: AppointmentDetailModalProps) {
  const t = useTranslations("appointments.detail");

  return (
    <Dialog
      open={appointmentId !== null}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>
        {appointmentId !== null && (
          <AppointmentDetail
            key={appointmentId}
            appointmentId={appointmentId}
            onClose={onClose}
            onEdit={onEdit}
            onStatusChanged={onStatusChanged}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

function AppointmentDetail({
  appointmentId,
  onClose,
  onEdit,
  onStatusChanged,
}: Omit<AppointmentDetailModalProps, "appointmentId"> & {
  appointmentId: number;
}) {
  const t = useTranslations("appointments.detail");
  const tErrors = useTranslations("appointments.errors");
  const tProcedures = useTranslations("appointments.procedures");
  const locale = useLocale();
  const { appointment, error, isLoading, confirm, reload } =
    useAppointment(appointmentId);
  const patientLabels = useEntityLabels(
    "patient",
    appointment ? [appointment.patient_id] : [],
  );
  const staffLabels = useEntityLabels(
    "staff",
    appointment ? [appointment.staff_member_id] : [],
  );
  const [confirming, setConfirming] = useState<AppointmentStatus | null>(null);

  const statusChange = useAppointmentStatusChange(
    (updated, status) => {
      confirm(updated);
      setConfirming(null);
      onStatusChanged(updated, status);
    },
    (caught) => getAppointmentErrorMessage(caught, tErrors),
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center gap-2 p-8 text-sm text-gray-500 dark:text-gray-400">
        <Spinner />
        {t("loading")}
      </div>
    );
  }

  if (error || !appointment) {
    return (
      <div className="space-y-4">
        <Alert variant="destructive">
          <AlertDescription>
            {getAppointmentErrorMessage(error, tErrors)}
          </AlertDescription>
        </Alert>
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button variant="outline" onClick={onClose}>
            {t("close")}
          </Button>
          <Button variant="outline" onClick={reload}>
            {t("retry")}
          </Button>
        </div>
      </div>
    );
  }

  const patientLabel =
    patientLabels[appointment.patient_id] ?? `#${appointment.patient_id}`;
  const staffLabel =
    staffLabels[appointment.staff_member_id] ??
    `#${appointment.staff_member_id}`;
  const transitions = getAllowedTransitions(appointment.status);
  const canEdit = !isTerminalStatus(appointment.status);

  const requestTransition = (status: AppointmentStatus) => {
    statusChange.clearError();
    if (requiresConfirmation(status)) setConfirming(status);
    else void statusChange.change(appointment.id, status);
  };

  return (
    <div className="space-y-5">
      <dl className="grid gap-3 text-sm sm:grid-cols-[10rem_1fr]">
        <DetailRow label={t("id")}>{appointment.id}</DetailRow>
        <DetailRow label={t("patient")}>{patientLabel}</DetailRow>
        <DetailRow label={t("staff")}>{staffLabel}</DetailRow>
        <DetailRow label={t("date")}>
          {formatDateOnly(appointment.starts_at, locale)}
        </DetailRow>
        <DetailRow label={t("startTime")}>
          {formatTimeOnly(appointment.starts_at, locale)}
        </DetailRow>
        <DetailRow label={t("endTime")}>
          {formatTimeOnly(appointment.ends_at, locale)}
        </DetailRow>
        <DetailRow label={t("status")}>
          <AppointmentStatusBadge status={appointment.status} />
        </DetailRow>
        <DetailRow label={t("reason")}>
          {appointment.reason ?? t("noValue")}
        </DetailRow>
        <DetailRow label={t("createdAt")}>
          {formatDateTime(appointment.created_at, locale)}
        </DetailRow>
        <DetailRow label={t("updatedAt")}>
          {formatDateTime(appointment.updated_at, locale)}
        </DetailRow>
      </dl>

      <section className="space-y-3 border-t border-gray-100 pt-4 dark:border-gray-800">
        <h4 className="text-sm font-semibold text-gray-800 dark:text-white/90">
          {tProcedures("title")}
        </h4>
        <AppointmentDetailList appointment={appointment} />
      </section>

      {transitions.length === 0 && (
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {t(`finalNote.${appointment.status}`)}
        </p>
      )}

      {statusChange.error && (
        <Alert variant="destructive">
          <AlertDescription>{statusChange.error}</AlertDescription>
        </Alert>
      )}

      {confirming ? (
        <Alert variant={confirming === "cancelled" ? "warning" : "info"}>
          <AlertDescription>
            <p>{t(`confirm.${confirming}.description`)}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={statusChange.isPending}
                onClick={() => setConfirming(null)}
              >
                {t("confirm.back")}
              </Button>
              <Button
                type="button"
                size="sm"
                variant={confirming === "cancelled" ? "destructive" : "default"}
                disabled={statusChange.isPending}
                onClick={() =>
                  void statusChange.change(appointment.id, confirming)
                }
              >
                {statusChange.isPending && <Spinner />}
                {statusChange.isPending
                  ? t(`pending.${confirming}`)
                  : t(`confirm.${confirming}.confirm`)}
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      ) : (
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:flex-wrap sm:justify-end">
          <Button variant="outline" onClick={onClose}>
            {t("close")}
          </Button>
          {canEdit && (
            <Button
              variant="outline"
              disabled={statusChange.isPending}
              onClick={() =>
                onEdit(appointment, {
                  patient: patientLabel,
                  staff: staffLabel,
                })
              }
            >
              {t("edit")}
            </Button>
          )}
          {transitions.map((status) => (
            <Button
              key={status}
              variant={status === "cancelled" ? "destructive" : "default"}
              disabled={statusChange.isPending}
              onClick={() => requestTransition(status)}
            >
              {statusChange.pendingStatus === status && <Spinner />}
              {statusChange.pendingStatus === status
                ? t(`pending.${status}`)
                : t(`actions.${status}`)}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}
