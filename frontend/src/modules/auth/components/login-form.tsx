import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { useTranslations } from "@/i18n";
import { EyeCloseIcon, EyeIcon } from "@/icons";
import { isApiError } from "@/services/api";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useAuth } from "../context/auth-context";
import { createLoginSchema, type LoginFormData } from "../schemas/login-schema";

export function LoginForm() {
  const t = useTranslations("auth.login");
  const tErrors = useTranslations("auth.login.errors");
  const tValidation = useTranslations("auth.login.validation");
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const schema = useMemo(
    () =>
      createLoginSchema({
        emailRequired: tValidation("emailRequired"),
        emailInvalid: tValidation("emailInvalid"),
        passwordRequired: tValidation("passwordRequired"),
      }),
    [tValidation],
  );

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
    mode: "onTouched",
  });

  const onSubmit = async ({ email, password }: LoginFormData) => {
    setSubmitError(null);
    try {
      // PublicOnlyRoute redirige a la app en cuanto la sesión queda activa.
      await login(email, password);
    } catch (error) {
      if (!isApiError(error)) setSubmitError(tErrors("unexpected"));
      else if (error.kind === "network") setSubmitError(tErrors("network"));
      else if (error.status === 401)
        setSubmitError(tErrors("invalidCredentials"));
      else if (error.status >= 500) setSubmitError(tErrors("server"));
      else setSubmitError(error.message || tErrors("unexpected"));
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-5"
      noValidate
      aria-busy={isSubmitting}
    >
      {submitError && (
        <p
          role="alert"
          className="rounded-lg border border-red-500 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400"
        >
          {submitError}
        </p>
      )}

      <Field data-invalid={Boolean(errors.email)}>
        <FieldLabel className="mb-1.5 block">
          {t("email")} <span className="text-red-500">*</span>
        </FieldLabel>
        <Input
          {...register("email")}
          type="email"
          autoComplete="username"
          placeholder={t("emailPlaceholder")}
          aria-invalid={errors.email ? "true" : undefined}
        />
        <FieldError errors={[errors.email]} />
      </Field>

      <Field data-invalid={Boolean(errors.password)}>
        <FieldLabel className="mb-1.5 block">
          {t("password")} <span className="text-red-500">*</span>
        </FieldLabel>
        <InputGroup>
          <InputGroupInput
            {...register("password")}
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            placeholder={t("passwordPlaceholder")}
            aria-invalid={errors.password ? "true" : undefined}
          />
          <InputGroupAddon align="inline-end">
            <InputGroupButton
              size="icon-xs"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? t("hidePassword") : t("showPassword")}
              className="text-gray-500 dark:text-gray-400"
            >
              {showPassword ? (
                <EyeIcon className="fill-current" />
              ) : (
                <EyeCloseIcon className="fill-current" />
              )}
            </InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
        <FieldError errors={[errors.password]} />
      </Field>

      <Button
        className="w-full"
        size="lg"
        type="submit"
        disabled={isSubmitting}
      >
        {isSubmitting ? t("submitting") : t("submit")}
      </Button>
    </form>
  );
}
