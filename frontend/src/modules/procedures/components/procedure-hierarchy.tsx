import { Alert, AlertDescription } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";
import { useTranslations } from "@/i18n";
import { Link } from "react-router";
import { useProcedureHierarchy } from "../hooks/use-procedure-hierarchy";
import type { Procedure } from "../types/procedure.types";
import { ProcedureStatusBadge } from "./procedure-status-badge";

function ProcedureLink({ procedure }: { procedure: Procedure }) {
  return (
    <Link
      to={`/procedures/${procedure.id}`}
      className="text-brand-500 hover:text-brand-600 dark:text-brand-400"
    >
      {procedure.code ? `${procedure.code} · ` : ""}
      {procedure.name}
    </Link>
  );
}

/**
 * Ubicación del procedimiento en el catálogo: ruta de ancestros (siguiendo
 * `parent_procedure_id`) y sus hijos directos (`parent_procedure_id` como
 * filtro del listado). No hay endpoint de árbol, así que solo se muestran los
 * datos que esos endpoints entregan.
 */
export function ProcedureHierarchy({ procedure }: { procedure: Procedure }) {
  const t = useTranslations("procedures.hierarchy");
  const { ancestors, children, childrenTotal, error, isLoading } =
    useProcedureHierarchy(procedure);

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
        <Spinner />
        {t("loading")}
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{t("loadError")}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4 text-sm">
      <div>
        <p className="mb-1 font-medium text-gray-500 dark:text-gray-400">
          {t("path")}
        </p>
        <ol className="flex flex-wrap items-center gap-1.5 text-gray-800 dark:text-white/90">
          {ancestors.map((ancestor) => (
            <li key={ancestor.id} className="flex items-center gap-1.5">
              <ProcedureLink procedure={ancestor} />
              <span aria-hidden className="text-gray-400 rtl:rotate-180">
                ›
              </span>
            </li>
          ))}
          <li className="font-semibold">{procedure.name}</li>
        </ol>
      </div>

      <div>
        <p className="mb-1 font-medium text-gray-500 dark:text-gray-400">
          {t("children", { count: childrenTotal })}
        </p>
        {children.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">{t("noChildren")}</p>
        ) : (
          <ul className="divide-y divide-gray-100 rounded-xl border border-gray-200 dark:divide-white/5 dark:border-gray-800">
            {children.map((child) => (
              <li
                key={child.id}
                className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5"
              >
                <ProcedureLink procedure={child} />
                <ProcedureStatusBadge isActive={child.is_active} />
              </li>
            ))}
          </ul>
        )}
        {childrenTotal > children.length && (
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            {t("moreChildren", {
              shown: children.length,
              total: childrenTotal,
            })}
          </p>
        )}
      </div>
    </div>
  );
}
