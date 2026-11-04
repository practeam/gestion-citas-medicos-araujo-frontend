import { PageMeta } from "@/components/shared/page-meta";
import { Button } from "@/components/ui/button";
import { useTranslations } from "@/i18n";
import { Link } from "react-router";

export default function ForbiddenPage() {
  const t = useTranslations("auth.forbidden");
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
      <PageMeta title={t("title")} description={t("description")} />
      <h1 className="text-title-sm font-semibold text-gray-800 dark:text-white/90">
        {t("title")}
      </h1>
      <p className="text-sm text-gray-500 dark:text-gray-400">
        {t("description")}
      </p>
      <Button nativeButton={false} render={<Link to="/" />}>
        {t("back")}
      </Button>
    </div>
  );
}
