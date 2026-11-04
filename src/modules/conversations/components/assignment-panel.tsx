import { Alert, AlertDescription } from "@/components/ui/alert";
import { Can } from "@/modules/auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import { useLocale, useTranslations } from "@/i18n";
import { getPersonFullName } from "@/modules/persons";
import { useState } from "react";
import { useStaffMembers } from "../hooks/use-lookup";
import type { useAssignments } from "../hooks/use-assignments";
import type { ConversationAssignment } from "../types/assignment.types";
import type { Conversation } from "../types/conversation.types";
import { formatDateTime } from "../utils/conversation-datetime.utils";
import { getConversationErrorMessage } from "../utils/conversation-error.utils";
import { EntitySelector } from "./entity-selector";

export type AssignmentNotice = "assigned" | "transferred" | "ended";

interface AssignmentPanelProps {
  conversation: Conversation;
  assignments: ReturnType<typeof useAssignments>;
  onNotice: (notice: AssignmentNotice) => void;
}

/**
 * Trabajador asignado a la conversación, acciones (asignar, transferir,
 * finalizar) e historial de asignaciones. El estado de asignación es
 * independiente del estado de la conversación: una conversación abierta puede
 * estar sin asignar y una cerrada no admite nuevas asignaciones. Asignar y
 * transferir usan una única llamada; no se asigna nada automáticamente.
 */
export function AssignmentPanel({
  conversation,
  assignments: state,
  onNotice,
}: AssignmentPanelProps) {
  const t = useTranslations("conversations.assignments");
  const tErrors = useTranslations("conversations.errors");
  const locale = useLocale();
  const [dialog, setDialog] = useState<"assign" | "transfer" | "end" | null>(
    null,
  );
  const { assignments, active, isLoading, error, isPending } = state;
  const staff = useStaffMembers(
    assignments.map((item) => item.staff_member_id),
  );
  const isOpen = conversation.status === "open";

  const staffName = (assignment: ConversationAssignment) => {
    const member = staff[assignment.staff_member_id];
    return member
      ? getPersonFullName(member.person)
      : `#${assignment.staff_member_id}`;
  };

  return (
    <section className="space-y-3">
      <h4 className="text-sm font-semibold text-gray-800 dark:text-white/90">
        {t("title")}
      </h4>

      {error ? (
        <div className="space-y-2">
          <Alert variant="destructive">
            <AlertDescription>
              {getConversationErrorMessage(error, tErrors)}
            </AlertDescription>
          </Alert>
          <Button variant="outline" size="xs" onClick={state.reload}>
            {t("retry")}
          </Button>
        </div>
      ) : isLoading ? (
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <Spinner />
          {t("loading")}
        </div>
      ) : (
        <>
          {active ? (
            <div className="space-y-3 rounded-xl border border-gray-200 p-3 dark:border-gray-800">
              <div className="flex flex-wrap items-center gap-2">
                <Badge size="sm" color="success">
                  {t("active")}
                </Badge>
                <span className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {staffName(active)}
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {t("assignedAt", {
                  date: formatDateTime(active.assigned_at, locale),
                })}
              </p>
              {isOpen && (
                <div className="flex flex-wrap gap-2">
                  <Can permission="conversation.assign">
                    <Button
                      size="xs"
                      variant="outline"
                      disabled={isPending}
                      onClick={() => setDialog("transfer")}
                    >
                      {t("transfer")}
                    </Button>
                  </Can>
                  <Can permission="conversation.assign">
                    <Button
                      size="xs"
                      variant="outline"
                      disabled={isPending}
                      onClick={() => setDialog("end")}
                    >
                      {t("end")}
                    </Button>
                  </Can>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3 rounded-xl border border-dashed border-gray-300 p-3 dark:border-gray-700">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {t("unassigned")}
              </p>
              {isOpen ? (
                <Can permission="conversation.assign">
                  <Button
                    size="xs"
                    disabled={isPending}
                    onClick={() => setDialog("assign")}
                  >
                    {t("assign")}
                  </Button>
                </Can>
              ) : (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {t("closedNote")}
                </p>
              )}
            </div>
          )}

          <div className="space-y-2">
            <h5 className="text-xs font-medium text-gray-500 dark:text-gray-400">
              {t("history")}
            </h5>
            {assignments.length === 0 ? (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {t("historyEmpty")}
              </p>
            ) : (
              <ul className="space-y-2">
                {assignments.map((assignment) => (
                  <li
                    key={assignment.id}
                    className="rounded-lg bg-gray-50 p-2.5 text-xs dark:bg-white/3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-medium text-gray-800 dark:text-white/90">
                        {staffName(assignment)}
                      </span>
                      <Badge
                        size="sm"
                        color={assignment.ended_at ? "gray" : "success"}
                      >
                        {assignment.ended_at ? t("finished") : t("active")}
                      </Badge>
                    </div>
                    <p className="mt-1 text-gray-500 dark:text-gray-400">
                      {t("from", {
                        date: formatDateTime(assignment.assigned_at, locale),
                      })}
                      {assignment.ended_at &&
                        ` · ${t("until", { date: formatDateTime(assignment.ended_at, locale) })}`}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}

      {dialog && dialog !== "end" && (
        <AssignDialog
          mode={dialog}
          conversationId={conversation.id}
          currentName={active ? staffName(active) : null}
          currentStaffId={active?.staff_member_id ?? null}
          state={state}
          onClose={() => setDialog(null)}
          onDone={() => {
            setDialog(null);
            onNotice(dialog === "transfer" ? "transferred" : "assigned");
          }}
        />
      )}
      {dialog === "end" && active && (
        <EndDialog
          assignment={active}
          name={staffName(active)}
          state={state}
          onClose={() => setDialog(null)}
          onDone={() => {
            setDialog(null);
            onNotice("ended");
          }}
        />
      )}
    </section>
  );
}

function AssignDialog({
  mode,
  currentName,
  currentStaffId,
  state,
  onClose,
  onDone,
}: {
  mode: "assign" | "transfer";
  conversationId: number;
  currentName: string | null;
  currentStaffId: number | null;
  state: ReturnType<typeof useAssignments>;
  onClose: () => void;
  onDone: () => void;
}) {
  const t = useTranslations("conversations.assignments.dialog");
  const tErrors = useTranslations("conversations.errors");
  const [selected, setSelected] = useState<{
    id: number;
    label: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const confirm = async () => {
    if (!selected) return;
    setError(null);
    const result = await state.assign(selected.id);
    if (result.ok) onDone();
    else setError(getConversationErrorMessage(result.error, tErrors));
  };

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open && !state.isPending) onClose();
      }}
    >
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{t(`${mode}.title`)}</DialogTitle>
          <DialogDescription>{t(`${mode}.description`)}</DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <EntitySelector
          kind="staff"
          value={selected?.id ?? null}
          excludeIds={currentStaffId === null ? [] : [currentStaffId]}
          disabled={state.isPending}
          onSelect={(option) => {
            setSelected({ id: option.id, label: option.label });
            setError(null);
          }}
        />
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {t("eligibilityNote")}
        </p>

        {selected && (
          <Alert variant="info">
            <AlertDescription>
              {mode === "transfer" && currentName
                ? t("transfer.summary", {
                    from: currentName,
                    to: selected.label,
                  })
                : t("assign.summary", { to: selected.label })}
            </AlertDescription>
          </Alert>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            disabled={state.isPending}
            onClick={onClose}
          >
            {t("cancel")}
          </Button>
          <Button
            disabled={!selected || state.isPending}
            onClick={() => void confirm()}
          >
            {state.isPending && <Spinner />}
            {t(`${mode}.confirm`)}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function EndDialog({
  assignment,
  name,
  state,
  onClose,
  onDone,
}: {
  assignment: ConversationAssignment;
  name: string;
  state: ReturnType<typeof useAssignments>;
  onClose: () => void;
  onDone: () => void;
}) {
  const t = useTranslations("conversations.assignments.dialog.end");
  const tCommon = useTranslations("conversations.assignments.dialog");
  const tErrors = useTranslations("conversations.errors");
  const [error, setError] = useState<string | null>(null);

  const confirm = async () => {
    setError(null);
    const result = await state.end(assignment.id);
    if (result.ok) onDone();
    else setError(getConversationErrorMessage(result.error, tErrors));
  };

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open && !state.isPending) onClose();
      }}
    >
      <DialogContent showCloseButton={!state.isPending}>
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>{t("description", { name })}</DialogDescription>
        </DialogHeader>
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <DialogFooter>
          <Button
            variant="outline"
            disabled={state.isPending}
            onClick={onClose}
          >
            {tCommon("cancel")}
          </Button>
          <Button
            variant="destructive"
            disabled={state.isPending}
            onClick={() => void confirm()}
          >
            {state.isPending && <Spinner />}
            {t("confirm")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
