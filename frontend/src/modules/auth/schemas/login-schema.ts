import { z } from "zod";

/** `t` recibe mensajes ya traducidos para mantener el schema libre de React. */
export function createLoginSchema(messages: {
  emailRequired: string;
  emailInvalid: string;
  passwordRequired: string;
}) {
  return z.object({
    email: z
      .string()
      .trim()
      .min(1, messages.emailRequired)
      .email(messages.emailInvalid),
    password: z.string().min(1, messages.passwordRequired).max(128),
  });
}

export type LoginFormData = z.infer<ReturnType<typeof createLoginSchema>>;
