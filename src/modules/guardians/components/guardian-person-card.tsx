import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { useTranslations } from "@/i18n";
import {
  getPersonDocument,
  getPersonFullName,
  personApi,
  type Person,
} from "@/modules/persons";
import { isAbortError } from "@/services/api";
import { useEffect, useState } from "react";

interface PersonResult {
  personId: number;
  person?: Person;
  error?: unknown;
}

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-0.5">
      <dt className="text-xs text-gray-500 dark:text-gray-400">{label}</dt>
      <dd className="text-sm break-words text-gray-800 dark:text-white/90">
        {children}
      </dd>
    </div>
  );
}

/**
 * Datos personales y de contacto de un apoderado. Los datos viven en `persons`
 * (`GET /persons/{id}`); aquí solo se muestran, no se editan.
 */
export function GuardianPersonCard({ personId }: { personId: number }) {
  const t = useTranslations("guardians.detail");
  const [result, setResult] = useState<PersonResult | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    personApi
      .getById(personId, { signal: controller.signal })
      .then((person) => setResult({ personId, person }))
      .catch((error: unknown) => {
        if (isAbortError(error)) return;
        setResult({ personId, error });
      });
    return () => controller.abort();
  }, [personId]);

  const current = result?.personId === personId ? result : null;

  if (!current) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
        <Spinner />
        {t("loading")}
      </div>
    );
  }

  if (current.error || !current.person) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{t("personError")}</AlertDescription>
      </Alert>
    );
  }

  const person = current.person;
  const empty = t("noValue");

  return (
    <dl className="grid gap-3 sm:grid-cols-2">
      <Row label={t("name")}>{getPersonFullName(person)}</Row>
      <Row label={t("document")}>{getPersonDocument(person) ?? empty}</Row>
      <Row label={t("phone")}>{person.phone ?? empty}</Row>
      <Row label={t("whatsapp")}>{person.phone_whatsapp ?? empty}</Row>
      <Row label={t("email")}>{person.email ?? empty}</Row>
      <Row label={t("status")}>
        <Badge size="sm" color={person.is_active ? "success" : "gray"}>
          {person.is_active ? t("active") : t("inactive")}
        </Badge>
      </Row>
    </dl>
  );
}
