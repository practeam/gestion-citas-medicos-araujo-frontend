import { PageBreadcrumb } from "@/components/shared/page-breadcrumb";
import { PageMeta } from "@/components/shared/page-meta";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useTranslations } from "@/i18n";
import { Can } from "@/modules/auth";
import { PersonSelector, type Person } from "@/modules/persons";
import { useState } from "react";
import { Link } from "react-router";
import { GuardedPatientsList } from "../components/guarded-patients-list";
import { GuardianPersonCard } from "../components/guardian-person-card";

/**
 * Consulta de apoderados. El backend no tiene un listado general de apoderados:
 * solo ofrece los apoderados de un paciente y los pacientes de una persona. Por
 * eso esta página parte de una persona (existente, activa o no) y muestra sus
 * datos y los pacientes de los que es apoderada. Los datos personales se
 * administran desde `persons`; aquí solo se consultan.
 */
export default function GuardiansPage() {
  const t = useTranslations("guardians.page");
  const [person, setPerson] = useState<Person | null>(null);

  return (
    <div>
      <PageMeta title={t("meta.title")} description={t("meta.description")} />
      <PageBreadcrumb pageTitle={t("title")} />

      <div className="space-y-6 rounded-2xl border border-gray-200 bg-white p-4 sm:p-6 dark:border-gray-800 dark:bg-white/3">
        <Alert variant="info">
          <AlertDescription>{t("limitation")}</AlertDescription>
        </Alert>

        <section className="space-y-3">
          <h4 className="text-sm font-semibold text-gray-800 dark:text-white/90">
            {t("searchTitle")}
          </h4>
          <PersonSelector value={person?.id ?? null} onSelect={setPerson} />
        </section>

        {person ? (
          <>
            <section className="space-y-3 border-t border-gray-100 pt-5 dark:border-gray-800">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h4 className="text-sm font-semibold text-gray-800 dark:text-white/90">
                  {t("personTitle")}
                </h4>
                <Can permission="person.read">
                  <Button
                    size="xs"
                    variant="outline"
                    nativeButton={false}
                    render={<Link to={`/persons/${person.id}`} />}
                  >
                    {t("viewPerson")}
                  </Button>
                </Can>
              </div>
              <GuardianPersonCard key={person.id} personId={person.id} />
            </section>
            <section className="space-y-3 border-t border-gray-100 pt-5 dark:border-gray-800">
              <h4 className="text-sm font-semibold text-gray-800 dark:text-white/90">
                {t("patientsTitle")}
              </h4>
              <GuardedPatientsList key={person.id} personId={person.id} />
            </section>
          </>
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {t("selectPerson")}
          </p>
        )}
      </div>
    </div>
  );
}
