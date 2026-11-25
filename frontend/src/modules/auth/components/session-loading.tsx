import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useTranslations } from "@/i18n";

/** Pantalla completa mientras se comprueba la sesión (o si la comprobación falló). */
export function SessionLoading({
  hasError = false,
  onRetry,
}: {
  hasError?: boolean;
  onRetry?: () => void;
}) {
  const t = useTranslations("auth.session");
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-white p-6 text-center dark:bg-gray-900">
      {hasError ? (
        <>
          <p className="max-w-sm text-sm text-gray-600 dark:text-gray-400">
            {t("error")}
          </p>
          <Button variant="outline" onClick={onRetry}>
            {t("retry")}
          </Button>
        </>
      ) : (
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <Spinner />
          {t("loading")}
        </div>
      )}
    </div>
  );
}
