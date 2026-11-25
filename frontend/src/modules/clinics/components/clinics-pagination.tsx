import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useTranslations } from "@/i18n";

interface ClinicsPaginationProps {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
}

/** Páginas visibles: primera, última y una ventana alrededor de la actual. */
function getVisiblePages(page: number, totalPages: number) {
  const pages: (number | "ellipsis-start" | "ellipsis-end")[] = [];
  for (let p = 1; p <= totalPages; p++) {
    if (p === 1 || p === totalPages || Math.abs(p - page) <= 1) {
      pages.push(p);
    } else if (p === 2) {
      pages.push("ellipsis-start");
    } else if (p === totalPages - 1) {
      pages.push("ellipsis-end");
    }
  }
  return pages;
}

export function ClinicsPagination({
  page,
  pageSize,
  total,
  onPageChange,
}: ClinicsPaginationProps) {
  const t = useTranslations("clinics.pagination");
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <div className="flex flex-col items-center justify-between gap-3 border-t border-gray-100 px-5 py-4 sm:flex-row sm:px-6 dark:border-white/5">
      <p className="text-sm text-gray-500 dark:text-gray-400">
        {t("summary", { from, to, total })}
      </p>
      <Pagination className="mx-0 w-auto">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              text={t("previous")}
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
            />
          </PaginationItem>
          {getVisiblePages(page, totalPages).map((entry) =>
            typeof entry === "number" ? (
              <PaginationItem key={entry}>
                <PaginationLink
                  isActive={entry === page}
                  onClick={() => onPageChange(entry)}
                >
                  {entry}
                </PaginationLink>
              </PaginationItem>
            ) : (
              <PaginationItem key={entry}>
                <PaginationEllipsis />
              </PaginationItem>
            ),
          )}
          <PaginationItem>
            <PaginationNext
              text={t("next")}
              disabled={page >= totalPages}
              onClick={() => onPageChange(page + 1)}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
