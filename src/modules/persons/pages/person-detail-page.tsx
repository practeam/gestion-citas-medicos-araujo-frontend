import { ComponentCard } from "@/components/shared/component-card";
import { Can } from "@/modules/auth";
import { PageBreadcrumb } from "@/components/shared/page-breadcrumb";
import { PageMeta } from "@/components/shared/page-meta";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useLocale, useTranslations } from "@/i18n";
import { Link, useParams } from "react-router";
import { PersonStatusBadge } from "../components/person-status-badge";
import { usePerson } from "../hooks/use-person";
import { formatDate, formatDateTime } from "../utils/person-date.utils";
import { getPersonErrorMessage } from "../utils/person-error.utils";
import {
  getPersonDocument,
  getPersonFullName,
} from "../utils/person-payload.utils";

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
      <dd className="break-words text-gray-800 dark:text-white/90">
        {children}
      </dd>
    </>
  );
}

export default function PersonDetailPage() {
  const t = useTranslations("persons");
  const tErrors = useTranslations("persons.errors");
  const locale = useLocale();
  const { personId } = useParams();
  const { person, error, isInvalidId, isLoading } = usePerson(Number(personId));
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
      ) : isInvalidId || error || !person ? (
        <div className="space-y-4">
          <Alert variant="destructive">
            <AlertDescription>
              {isInvalidId
                ? tErrors("notFound")
                : getPersonErrorMessage(error, tErrors)}
            </AlertDescription>
          </Alert>
          <Button
            variant="outline"
            nativeButton={false}
            render={<Link to="/persons" />}
          >
            {t("form.backToList")}
          </Button>
        </div>
      ) : (
        <ComponentCard title={getPersonFullName(person)}>
          <section className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-800 dark:text-white/90">
              {t("detail.personalData")}
            </h4>
            <dl className="grid gap-4 text-sm sm:grid-cols-[12rem_1fr]">
              <DetailRow label={t("form.first_nameLabel")}>
                {person.first_name}
              </DetailRow>
              <DetailRow label={t("form.last_nameLabel")}>
                {person.last_name}
              </DetailRow>
              <DetailRow label={t("form.maternal_last_nameLabel")}>
                {person.maternal_last_name ?? empty}
              </DetailRow>
              <DetailRow label={t("columns.document")}>
                {getPersonDocument(person) ?? empty}
              </DetailRow>
              <DetailRow label={t("form.birth_dateLabel")}>
                {person.birth_date
                  ? formatDate(person.birth_date, locale)
                  : empty}
              </DetailRow>
              <DetailRow label={t("form.phoneLabel")}>
                {person.phone ?? empty}
              </DetailRow>
              <DetailRow label={t("form.phone_whatsappLabel")}>
                {person.phone_whatsapp ?? empty}
              </DetailRow>
              <DetailRow label={t("form.emailLabel")}>
                {person.email ?? empty}
              </DetailRow>
              <DetailRow label={t("form.addressLabel")}>
                {person.address ?? empty}
              </DetailRow>
              <DetailRow label={t("columns.status")}>
                <PersonStatusBadge isActive={person.is_active} />
              </DetailRow>
            </dl>
          </section>

          <section className="space-y-3 border-t border-gray-100 pt-5 dark:border-gray-800">
            <h4 className="text-sm font-semibold text-gray-800 dark:text-white/90">
              {t("detail.audit")}
            </h4>
            <dl className="grid gap-4 text-sm sm:grid-cols-[12rem_1fr]">
              <DetailRow label={t("columns.id")}>{person.id}</DetailRow>
              <DetailRow label={t("columns.createdAt")}>
                {formatDateTime(person.created_at, locale)}
              </DetailRow>
              <DetailRow label={t("columns.updatedAt")}>
                {formatDateTime(person.updated_at, locale)}
              </DetailRow>
            </dl>
          </section>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button
              variant="outline"
              nativeButton={false}
              render={<Link to="/persons" />}
            >
              {t("form.backToList")}
            </Button>
            <Can permission="person.update">
              <Button
                nativeButton={false}
                render={<Link to={`/persons/${person.id}/edit`} />}
              >
                {t("actions.edit")}
              </Button>
            </Can>
          </div>
        </ComponentCard>
      )}
    </div>
  );
}
