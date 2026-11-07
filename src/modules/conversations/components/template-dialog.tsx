import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { useTranslations } from "@/i18n";
import { useState } from "react";
import type { SendResult } from "../hooks/use-messages";
import {
  TEMPLATE_LANGUAGE_PATTERN,
  TEMPLATE_NAME_PATTERN,
  type TemplateMessageRequest,
} from "../types/message.types";
import { getConversationErrorMessage } from "../utils/conversation-error.utils";

const DEFAULT_LANGUAGE = "es";
const MAX_PARAMETERS = 10;

interface TemplateDialogProps {
  open: boolean;
  isSending: boolean;
  onClose: () => void;
  onSend: (body: TemplateMessageRequest) => Promise<SendResult>;
  /** Tras enviar (volver al último mensaje). */
  onSent: () => void;
}

/**
 * Envío de una plantilla aprobada en Meta. El backend no expone un catálogo de
 * plantillas, así que se indica el nombre y el idioma tal como están aprobados
 * y, si la plantilla los usa, los valores de las variables del cuerpo
 * (`{{1}}`, `{{2}}`, …), que se envían como `components`.
 */
export function TemplateDialog({
  open,
  isSending,
  onClose,
  onSend,
  onSent,
}: TemplateDialogProps) {
  const t = useTranslations("conversations.template");
  const tErrors = useTranslations("conversations.errors");
  const [name, setName] = useState("");
  const [language, setLanguage] = useState(DEFAULT_LANGUAGE);
  const [parameters, setParameters] = useState<string[]>([]);
  const [touched, setTouched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const nameValid = TEMPLATE_NAME_PATTERN.test(name);
  const languageValid = TEMPLATE_LANGUAGE_PATTERN.test(language);
  const parametersValid = parameters.every((value) => value.trim() !== "");

  const close = () => {
    if (isSending) return;
    setError(null);
    setTouched(false);
    onClose();
  };

  const submit = async () => {
    setTouched(true);
    if (!nameValid || !languageValid || !parametersValid || isSending) return;
    setError(null);
    const result = await onSend({
      template_name: name,
      language_code: language,
      ...(parameters.length > 0 && {
        components: [
          {
            type: "body",
            parameters: parameters.map((text) => ({ type: "text", text })),
          },
        ],
      }),
    });
    if (result.ok) {
      setName("");
      setLanguage(DEFAULT_LANGUAGE);
      setParameters([]);
      setTouched(false);
      onSent();
      onClose();
    } else {
      setError(getConversationErrorMessage(result.error, tErrors));
    }
  };

  return (
    <Dialog open={open} onOpenChange={(next) => !next && close()}>
      <DialogContent showCloseButton={!isSending}>
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          <Field data-invalid={touched && !nameValid}>
            <FieldLabel className="mb-1.5 block">
              {t("name")} <span className="text-red-500">*</span>
            </FieldLabel>
            <Input
              value={name}
              placeholder={t("namePlaceholder")}
              disabled={isSending}
              autoComplete="off"
              aria-invalid={touched && !nameValid ? "true" : undefined}
              onChange={(event) => setName(event.target.value.trim())}
            />
            {touched && !nameValid && (
              <FieldError errors={[{ message: t("nameInvalid") }]} />
            )}
          </Field>

          <Field data-invalid={touched && !languageValid}>
            <FieldLabel className="mb-1.5 block">
              {t("language")} <span className="text-red-500">*</span>
            </FieldLabel>
            <Input
              value={language}
              placeholder={t("languagePlaceholder")}
              disabled={isSending}
              autoComplete="off"
              aria-invalid={touched && !languageValid ? "true" : undefined}
              onChange={(event) => setLanguage(event.target.value.trim())}
            />
            {touched && !languageValid && (
              <FieldError errors={[{ message: t("languageInvalid") }]} />
            )}
          </Field>

          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t("parameters")}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {t("parametersHint")}
            </p>
            {parameters.map((value, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input
                  value={value}
                  disabled={isSending}
                  placeholder={t("parameterPlaceholder", { n: index + 1 })}
                  aria-label={t("parameterPlaceholder", { n: index + 1 })}
                  aria-invalid={
                    touched && value.trim() === "" ? "true" : undefined
                  }
                  onChange={(event) =>
                    setParameters((prev) =>
                      prev.map((item, i) =>
                        i === index ? event.target.value : item,
                      ),
                    )
                  }
                />
                <Button
                  type="button"
                  variant="outline"
                  size="xs"
                  disabled={isSending}
                  onClick={() =>
                    setParameters((prev) => prev.filter((_, i) => i !== index))
                  }
                >
                  {t("removeParameter")}
                </Button>
              </div>
            ))}
            {touched && !parametersValid && (
              <p
                role="alert"
                className="text-xs text-red-600 dark:text-red-400"
              >
                {t("parameterEmpty")}
              </p>
            )}
            <Button
              type="button"
              variant="outline"
              size="xs"
              disabled={isSending || parameters.length >= MAX_PARAMETERS}
              onClick={() => setParameters((prev) => [...prev, ""])}
            >
              {t("addParameter")}
            </Button>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" disabled={isSending} onClick={close}>
            {t("cancel")}
          </Button>
          <Button disabled={isSending} onClick={() => void submit()}>
            {isSending && <Spinner />}
            {isSending ? t("sending") : t("send")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
