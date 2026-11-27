import { Alert, AlertDescription } from "@/components/ui/alert";
import { Can } from "@/modules/auth";
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
import {
  CalendarIcon,
  CheckCircleIcon,
  ClockIcon,
  DocIcon,
  PencilIcon,
  TaskIcon,
  UserIcon,
  UsersIcon,
  XIcon,
} from "@/icons";
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

function DetailCard({
  icon: Icon,
  tone,
  label,
  children,
}: {
  icon: typeof UserIcon;
  tone: "blue" | "purple" | "green" | "amber" | "gray";
  label: string;
  children: React.ReactNode;
}) {
  const tones = {
    blue: "border-blue-200 bg-blue-50 text-blue-600 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-400",
    purple:
      "border-purple-200 bg-purple-50 text-purple-600 dark:border-purple-500/30 dark:bg-purple-500/10 dark:text-purple-400",
    green:
      "border-green-200 bg-green-50 text-green-600 dark:border-green-500/30 dark:bg-green-500/10 dark:text-green-400",
    amber:
      "border-amber-200 bg-amber-50 text-amber-600 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-400",
    gray: "border-gray-200 bg-gray-50 text-gray-600 dark:border-gray-800 dark:bg-white/3 dark:text-gray-400",
  } as const;

  return (
    <div className={`rounded-xl border p-4 ${tones[tone]}`}>
      <div className="flex items-start gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-white/70 shadow-theme-xs dark:bg-white/10">
          <Icon className="size-5 fill-current" />
        </span>
        <div className="min-w-0">
          <p className="text-xs font-medium opacity-75">{label}</p>
          <div className="mt-1 text-sm font-semibold break-words whitespace-pre-line text-gray-800 dark:text-white/90">
            {children}
          </div>
        </div>
      </div>
    </div>
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
      <DialogContent className="custom-scrollbar max-h-[90dvh] overflow-y-auto sm:max-w-3xl">
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
      <div className="grid gap-3 sm:grid-cols-2">
        <DetailCard icon={TaskIcon} tone="gray" label={t("id")}>
          #{appointment.id}
        </DetailCard>
        <DetailCard icon={CheckCircleIcon} tone="green" label={t("status")}>
          <AppointmentStatusBadge status={appointment.status} />
        </DetailCard>
        <DetailCard icon={UserIcon} tone="blue" label={t("patient")}>
          {patientLabel}
        </DetailCard>
        <DetailCard icon={UsersIcon} tone="purple" label={t("staff")}>
          {staffLabel}
        </DetailCard>
      </div>

      <div className="grid overflow-hidden rounded-xl border border-gray-200 bg-white sm:grid-cols-3 dark:border-gray-800 dark:bg-white/3">
        <div className="border-b border-gray-200 p-4 sm:border-e sm:border-b-0 dark:border-gray-800">
          <CalendarIcon className="size-5 fill-current text-blue-500" />
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            {t("date")}
          </p>
          <p className="mt-1 text-sm font-semibold text-gray-800 dark:text-white/90">
            {formatDateOnly(appointment.starts_at, locale)}
          </p>
        </div>
        <div className="border-b border-gray-200 p-4 sm:border-e sm:border-b-0 dark:border-gray-800">
          <ClockIcon className="size-5 fill-current text-green-500" />
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            {t("startTime")}
          </p>
          <p className="mt-1 text-sm font-semibold text-gray-800 dark:text-white/90">
            {formatTimeOnly(appointment.starts_at, locale)}
          </p>
        </div>
        <div className="p-4">
          <ClockIcon className="size-5 fill-current text-amber-500" />
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            {t("endTime")}
          </p>
          <p className="mt-1 text-sm font-semibold text-gray-800 dark:text-white/90">
            {formatTimeOnly(appointment.ends_at, locale)}
          </p>
        </div>
      </div>

      <DetailCard icon={DocIcon} tone="amber" label={t("reason")}>
        {appointment.reason ?? t("noValue")}
      </DetailCard>

      <div className="grid gap-3 sm:grid-cols-2">
        <DetailCard icon={CalendarIcon} tone="gray" label={t("createdAt")}>
          {formatDateTime(appointment.created_at, locale)}
        </DetailCard>
        <DetailCard icon={ClockIcon} tone="gray" label={t("updatedAt")}>
          {formatDateTime(appointment.updated_at, locale)}
        </DetailCard>
      </div>

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
            <XIcon className="fill-current" />
            {t("close")}
          </Button>
          {canEdit && (
            <Can permission="appointment.update">
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
                <PencilIcon className="fill-current" />
                {t("edit")}
              </Button>
            </Can>
          )}
          {transitions.map((status) => (
            <Can key={status} permission="appointment.update">
              <Button
                variant={status === "cancelled" ? "destructive" : "default"}
                disabled={statusChange.isPending}
                onClick={() => requestTransition(status)}
              >
                {statusChange.pendingStatus === status && <Spinner />}
                {statusChange.pendingStatus === status
                  ? t(`pending.${status}`)
                  : t(`actions.${status}`)}
              </Button>
            </Can>
          ))}
        </div>
      )}
    </div>
  );
}
