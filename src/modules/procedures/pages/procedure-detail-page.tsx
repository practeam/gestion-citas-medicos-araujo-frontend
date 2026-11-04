import { ComponentCard } from "@/components/shared/component-card";
import { PageBreadcrumb } from "@/components/shared/page-breadcrumb";
import { PageMeta } from "@/components/shared/page-meta";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useLocale, useTranslations } from "@/i18n";
import { useState } from "react";
import { Link, useParams } from "react-router";
import { ProcedureHierarchy } from "../components/procedure-hierarchy";
import { ProcedureStatusBadge } from "../components/procedure-status-badge";
import { ProcedureStatusDialog } from "../components/procedure-status-dialog";
import { useProcedure } from "../hooks/use-procedure";
import { useProcedureLabels } from "../hooks/use-procedure-labels";
import { procedureApi } from "../services/procedure-api";
import type { Procedure } from "../types/procedure.types";
import { formatDateTime } from "../utils/procedure-date.utils";
import { getProcedureErrorMessage } from "../utils/procedure-error.utils";

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

export default function ProcedureDetailPage() {
  const t = useTranslations("procedures");
  const tErrors = useTranslations("procedures.errors");
  const locale = useLocale();
  const { procedureId } = useParams();
  const { procedure, error, isInvalidId, isLoading } = useProcedure(
    Number(procedureId),
  );
  // Registro actualizado tras un cambio de estado confirmado por la API.
  const [updated, setUpdated] = useState<Procedure | null>(null);
  const current = updated?.id === procedure?.id ? updated : procedure;
  const parentLabels = useProcedureLabels(
    current?.parent_procedure_id == null ? [] : [current.parent_procedure_id],
  );

  const [statusTarget, setStatusTarget] = useState<Procedure | null>(null);
  const [isStatusPending, setIsStatusPending] = useState(false);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [notice, setNotice] = useState<"activated" | "deactivated" | null>(
    null,
  );

  const closeStatusDialog = () => {
    if (isStatusPending) return;
    setStatusTarget(null);
    setStatusError(null);
  };

  const confirmStatusChange = async () => {
    if (!statusTarget || isStatusPending) return;
    setIsStatusPending(true);
    setStatusError(null);
    try {
      // La interfaz solo cambia con la respuesta satisfactoria de la API.
      const result = await procedureApi.updateStatus(statusTarget.id, {
        is_active: !statusTarget.is_active,
      });
      setUpdated(result);
      setNotice(result.is_active ? "activated" : "deactivated");
      setStatusTarget(null);
    } catch (caught) {
      setStatusError(getProcedureErrorMessage(caught, tErrors));
    } finally {
      setIsStatusPending(false);
    }
  };

  const empty = t("noValue");

  return (
    <div>
      <PageMeta title={t("detail.title")} description={t("meta.description")} />
      <PageBreadcrumb pageTitle={t("detail.title")} />

      {isLoading ? (
        <div className="flex items-center justify-center gap-2 p-10 text-sm text-gray-500 dark:text-gray-400">
          <Spinner />
          {t("loading")}
        </div>
      ) : isInvalidId || error || !current ? (
        <div className="space-y-4">
          <Alert variant="destructive">
            <AlertDescription>
              {isInvalidId
                ? tErrors("notFound")
                : getProcedureErrorMessage(error, tErrors)}
            </AlertDescription>
          </Alert>
          <Button
            variant="outline"
            nativeButton={false}
            render={<Link to="/procedures" />}
          >
            {t("form.backToList")}
          </Button>
        </div>
      ) : (
        <ComponentCard title={current.name}>
          {notice && (
            <Alert variant="success">
              <AlertDescription>{t(`notices.${notice}`)}</AlertDescription>
            </Alert>
          )}
          {!current.is_active && (
            <Alert variant="warning">
              <AlertDescription>{t("detail.inactiveNote")}</AlertDescription>
            </Alert>
          )}
          <dl className="grid gap-4 text-sm sm:grid-cols-[12rem_1fr]">
            <DetailRow label={t("columns.id")}>{current.id}</DetailRow>
            <DetailRow label={t("columns.name")}>{current.name}</DetailRow>
            <DetailRow label={t("columns.code")}>
              {current.code ?? empty}
            </DetailRow>
            <DetailRow label={t("columns.basePrice")}>
              {current.base_price}
            </DetailRow>
            <DetailRow label={t("columns.duration")}>
              {t("minutes", { count: current.base_duration_minutes })}
            </DetailRow>
            <DetailRow label={t("columns.description")}>
              {current.description ?? empty}
            </DetailRow>
            <DetailRow label={t("columns.parent")}>
              {current.parent_procedure_id === null ? (
                empty
              ) : (
                <Link
                  to={`/procedures/${current.parent_procedure_id}`}
                  className="text-brand-500 hover:text-brand-600 dark:text-brand-400"
                >
                  {parentLabels[current.parent_procedure_id] ??
                    `#${current.parent_procedure_id}`}
                </Link>
              )}
            </DetailRow>
            <DetailRow label={t("columns.status")}>
              <ProcedureStatusBadge isActive={current.is_active} />
            </DetailRow>
            <DetailRow label={t("columns.createdAt")}>
              {formatDateTime(current.created_at, locale)}
            </DetailRow>
            <DetailRow label={t("columns.updatedAt")}>
              {formatDateTime(current.updated_at, locale)}
            </DetailRow>
          </dl>

          <section className="space-y-3 border-t border-gray-100 pt-5 dark:border-gray-800">
            <h4 className="text-sm font-semibold text-gray-800 dark:text-white/90">
              {t("hierarchy.title")}
            </h4>
            <ProcedureHierarchy procedure={current} />
          </section>

          <p className="text-xs text-gray-500 dark:text-gray-400">
            {t("detail.historyNote")}
          </p>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button
              variant="outline"
              nativeButton={false}
              render={<Link to="/procedures" />}
            >
              {t("form.backToList")}
            </Button>
            <Button variant="outline" onClick={() => setStatusTarget(current)}>
              {current.is_active
                ? t("actions.deactivate")
                : t("actions.activate")}
            </Button>
            <Button
              nativeButton={false}
              render={<Link to={`/procedures/${current.id}/edit`} />}
            >
              {t("actions.edit")}
            </Button>
          </div>
        </ComponentCard>
      )}

      <ProcedureStatusDialog
        procedure={statusTarget}
        isPending={isStatusPending}
        error={statusError}
        onConfirm={confirmStatusChange}
        onClose={closeStatusDialog}
      />
    </div>
  );
}
