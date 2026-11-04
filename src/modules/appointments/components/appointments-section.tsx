import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useLocale, useTranslations } from "@/i18n";
import { Link } from "react-router";
import { useEntityLabels } from "../hooks/use-entity-labels";
import {
  RELATED_APPOINTMENTS_PAGE_SIZE,
  useRelatedAppointments,
  type RelatedOwner,
} from "../hooks/use-related-appointments";
import {
  formatDateTime,
  formatTimeOnly,
} from "../utils/appointment-datetime.utils";
import { AppointmentStatusBadge } from "./appointment-status-badge";

interface AppointmentsSectionProps {
  /** Paciente o miembro del personal cuyas citas se muestran. */
  owner: RelatedOwner;
}

/**
 * Citas de un paciente o de un trabajador, para sus páginas de detalle. Es de
 * solo consulta: la gestión (crear, editar, cambiar estado) se hace desde la
 * agenda general, a la que enlaza filtrada por esa persona.
 */
export function AppointmentsSection({ owner }: AppointmentsSectionProps) {
  const t = useTranslations("appointments.section");
  const tErrors = useTranslations("appointments.errors");
  const locale = useLocale();
  const { data, error, isLoading, page, setPage, reload } =
    useRelatedAppointments(owner);
  const items = data?.items;
  // Se muestra el nombre de la contraparte: personal en pacientes y viceversa.
  const counterpartType = owner.type === "patient" ? "staff" : "patient";
  const counterpartLabels = useEntityLabels(
    counterpartType,
    (items ?? []).map((item) =>
      owner.type === "patient" ? item.staff_member_id : item.patient_id,
    ),
  );
  const totalPages = data
    ? Math.max(1, Math.ceil(data.total / RELATED_APPOINTMENTS_PAGE_SIZE))
    : 1;
  const agendaQuery =
    owner.type === "patient"
      ? `patientId=${owner.id}`
      : `staffMemberId=${owner.id}`;

  return (
    <section className="space-y-3 border-t border-gray-100 pt-5 dark:border-gray-800">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h4 className="text-sm font-semibold text-gray-800 dark:text-white/90">
          {t("title")}
        </h4>
        <Link
          to={`/appointments?${agendaQuery}`}
          className="text-sm text-brand-500 hover:text-brand-600 dark:text-brand-400"
        >
          {t("viewInAgenda")}
        </Link>
      </div>

      {error ? (
        <div className="space-y-3">
          <Alert variant="destructive">
            <AlertDescription>{tErrors("loadList")}</AlertDescription>
          </Alert>
          <Button type="button" variant="outline" size="sm" onClick={reload}>
            {t("retry")}
          </Button>
        </div>
      ) : !items ? (
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <Spinner />
          {t("loading")}
        </div>
      ) : items.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {t(`empty.${owner.type}`)}
        </p>
      ) : (
        <>
          <ul
            className={`divide-y divide-gray-100 rounded-xl border border-gray-200 dark:divide-white/5 dark:border-gray-800 ${isLoading ? "opacity-60" : ""}`}
            aria-busy={isLoading}
          >
            {items.map((appointment) => {
              const counterpartId =
                owner.type === "patient"
                  ? appointment.staff_member_id
                  : appointment.patient_id;
              return (
                <li
                  key={appointment.id}
                  className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
                >
                  <div className="min-w-0 space-y-0.5">
                    <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                      {formatDateTime(appointment.starts_at, locale)} –{" "}
                      {formatTimeOnly(appointment.ends_at, locale)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {t(`counterpart.${owner.type}`)}:{" "}
                      {counterpartLabels[counterpartId] ?? `#${counterpartId}`}
                    </p>
                    {appointment.reason && (
                      <p className="line-clamp-1 text-xs text-gray-500 dark:text-gray-400">
                        {appointment.reason}
                      </p>
                    )}
                  </div>
                  <AppointmentStatusBadge status={appointment.status} />
                </li>
              );
            })}
          </ul>
          {totalPages > 1 && (
            <div className="flex items-center justify-between gap-3 text-sm text-gray-500 dark:text-gray-400">
              <span>{t("page", { page, totalPages })}</span>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                >
                  {t("previous")}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage(page + 1)}
                >
                  {t("next")}
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </section>
  );
}
