import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { Person } from "@/modules/persons";

/** Iniciales de la persona (sin foto: la API no entrega imágenes). */
export function PersonAvatar({
  person,
  size = "default",
}: {
  person: Pick<Person, "first_name" | "last_name"> | undefined;
  size?: "default" | "sm" | "lg";
}) {
  const initials = person
    ? `${person.first_name.charAt(0)}${person.last_name.charAt(0)}`.toUpperCase()
    : "?";

  return (
    <Avatar size={size}>
      <AvatarFallback>{initials}</AvatarFallback>
    </Avatar>
  );
}
