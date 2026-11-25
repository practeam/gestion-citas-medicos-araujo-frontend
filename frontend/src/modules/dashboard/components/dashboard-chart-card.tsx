import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslations } from "@/i18n";
import type { ReactNode } from "react";

interface DashboardChartCardProps {
  title: string;
  description: string;
  isLoading: boolean;
  hasError: boolean;
  isEmpty: boolean;
  onRetry: () => void;
  children: ReactNode;
}

/** Marco común de los gráficos: título, descripción y estados de carga, error y vacío. */
export function DashboardChartCard({
  title,
  description,
  isLoading,
  hasError,
  isEmpty,
  onRetry,
  children,
}: DashboardChartCardProps) {
  const t = useTranslations("dashboard.states");

  let body: ReactNode = children;
  if (hasError) {
    body = (
      <div className="flex h-72 flex-col items-center justify-center gap-3">
        <Alert variant="destructive">
          <AlertDescription>{t("error")}</AlertDescription>
        </Alert>
        <Button variant="outline" size="sm" onClick={onRetry}>
          {t("retry")}
        </Button>
      </div>
    );
  } else if (isLoading) {
    body = <Skeleton className="h-72 w-full bg-gray-200 dark:bg-gray-800" />;
  } else if (isEmpty) {
    body = (
      <p className="flex h-72 items-center justify-center text-sm text-gray-500 dark:text-gray-400">
        {t("empty")}
      </p>
    );
  }

  return (
    <Card className="min-w-0">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent aria-busy={isLoading}>{body}</CardContent>
    </Card>
  );
}
