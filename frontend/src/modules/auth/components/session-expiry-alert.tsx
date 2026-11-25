import {
  Alert,
  AlertAction,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useTranslations } from "@/i18n";
import { XIcon } from "@/icons/x";
import { useAuth } from "../context/auth-context";

/** Aviso (no bloqueante) cuando falta un minuto para que expire el JWT. */
export function SessionExpiryAlert() {
  const t = useTranslations("auth.expiryWarning");
  const { isExpiryWarningVisible, dismissExpiryWarning } = useAuth();

  if (!isExpiryWarningVisible) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-99999 flex justify-center px-4">
      <Alert
        variant="warning"
        className="pointer-events-auto max-w-md shadow-lg"
        aria-live="assertive"
      >
        <AlertTitle>{t("title")}</AlertTitle>
        <AlertDescription>{t("description")}</AlertDescription>
        <AlertAction>
          <Button
            variant="ghost"
            size="icon-xs"
            aria-label={t("close")}
            onClick={dismissExpiryWarning}
          >
            <XIcon className="size-4" />
          </Button>
        </AlertAction>
      </Alert>
    </div>
  );
}
