import { PageBreadcrumb } from "@/components/shared/page-breadcrumb";
import { Can } from "@/modules/auth";
import { PageMeta } from "@/components/shared/page-meta";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useTranslations } from "@/i18n";
import { PlusIcon } from "@/icons";
import { useState } from "react";
import { useSearchParams } from "react-router";
import {
  ConversationChat,
  type ChatNotice,
} from "../components/conversation-chat";
import { ConversationCreateModal } from "../components/conversation-create-modal";
import { ConversationFilters } from "../components/conversation-filters";
import { ConversationsList } from "../components/conversations-list";
import { useInbox } from "../hooks/use-inbox";

type Notice = ChatNotice | "created";

function parseId(value: string | null): number | null {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

/**
 * Atención al cliente: una única pantalla estilo chat con el listado (con
 * búsqueda y filtros) a la izquierda, la conversación con sus mensajes en el
 * centro y la información de la persona y la asignación a la derecha. La
 * conversación seleccionada se guarda en `?conversation=` (sin rutas propias
 * para mensajes ni asignaciones). La bandeja y el historial se consultan por cursor y se actualizan periódicamente.
 */
export default function ConversationsPage() {
  const t = useTranslations("conversations");
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedId = parseId(searchParams.get("conversation"));
  const list = useInbox();
  const [createOpen, setCreateOpen] = useState(false);
  const [notice, setNotice] = useState<Notice | null>(null);

  const select = (id: number | null) =>
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (id === null) next.delete("conversation");
      else next.set("conversation", String(id));
      return next;
    });

  return (
    <div>
      <PageMeta title={t("meta.title")} description={t("meta.description")} />
      <PageBreadcrumb pageTitle={t("title")} />

      {notice && (
        <Alert variant="success" className="mb-4">
          <AlertDescription className="flex items-center justify-between gap-3">
            <span>{t(`notices.${notice}`)}</span>
            <Button
              type="button"
              variant="ghost"
              size="xs"
              onClick={() => setNotice(null)}
            >
              {t("dismiss")}
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <div className="flex h-[calc(100dvh-13rem)] min-h-[34rem] overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/3">
        <aside
          className={`${selectedId === null ? "flex" : "hidden md:flex"} w-full shrink-0 flex-col border-gray-100 md:w-80 md:border-e lg:w-96 dark:border-white/5`}
        >
          <div className="space-y-3 border-b border-gray-100 p-4 dark:border-white/5">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-base font-semibold text-gray-800 dark:text-white/90">
                {t("list.title")}
              </h3>
              <Can permission="conversation.create">
                <Button size="sm" onClick={() => setCreateOpen(true)}>
                  <PlusIcon className="fill-current" />
                  {t("newConversation")}
                </Button>
              </Can>
            </div>
            <ConversationFilters
              filters={list.filters}
              hasFilters={list.hasFilters}
              onChange={list.updateFilters}
              onClear={list.clearFilters}
            />
          </div>
          <ConversationsList
            items={list.items}
            error={list.error}
            isLoading={list.isLoading}
            hasFilters={list.hasFilters}
            hasMore={list.hasMore}
            isLoadingMore={list.isLoadingMore}
            selectedId={selectedId}
            onSelect={select}
            onLoadMore={() => void list.loadMore()}
            onRetry={list.reload}
          />
        </aside>

        <main
          className={`${selectedId === null ? "hidden md:flex" : "flex"} min-w-0 flex-1 flex-col`}
        >
          {selectedId === null ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
              <p className="text-base font-medium text-gray-800 dark:text-white/90">
                {t("chat.noSelection")}
              </p>
              <p className="max-w-sm text-sm text-gray-500 dark:text-gray-400">
                {t("chat.noSelectionHint")}
              </p>
              <Can permission="conversation.create">
                <Button onClick={() => setCreateOpen(true)}>
                  <PlusIcon className="fill-current" />
                  {t("newConversation")}
                </Button>
              </Can>
            </div>
          ) : (
            <ConversationChat
              key={selectedId}
              conversationId={selectedId}
              onBack={() => select(null)}
              onListChanged={list.reload}
              onNotice={setNotice}
            />
          )}
        </main>
      </div>

      <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
        {t("internalNote")}
      </p>

      <ConversationCreateModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={(conversation) => {
          setCreateOpen(false);
          setNotice("created");
          list.reload();
          select(conversation.id);
        }}
      />
    </div>
  );
}
