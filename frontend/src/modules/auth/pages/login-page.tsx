import { PageMeta } from "@/components/shared/page-meta";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useTranslations } from "@/i18n";
import { LoginForm } from "../components/login-form";
import { useAuth } from "../context/auth-context";

export default function LoginPage() {
  const t = useTranslations("auth.login");
  const { sessionEndReason } = useAuth();

  return (
    <div className="flex w-full flex-1 flex-col lg:w-1/2">
      <PageMeta title={t("meta.title")} description={t("meta.description")} />
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center">
        <div className="mb-5 sm:mb-8">
          <h1 className="sm:text-title-md mb-2 text-title-sm font-semibold text-gray-800 dark:text-white/90">
            {t("title")}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {t("description")}
          </p>
        </div>

        {(sessionEndReason === "expired" ||
          sessionEndReason === "unauthorized") && (
          <Alert variant="warning" className="mb-5">
            <AlertDescription>
              {t(`notices.${sessionEndReason}`)}
            </AlertDescription>
          </Alert>
        )}

        <LoginForm />
      </div>
    </div>
  );
}
