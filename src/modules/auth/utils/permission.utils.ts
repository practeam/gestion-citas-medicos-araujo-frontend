export function hasPermission(
  granted: ReadonlySet<string>,
  permission: string,
) {
  return granted.has(permission);
}

export function hasAnyPermission(
  granted: ReadonlySet<string>,
  permissions: readonly string[],
) {
  return permissions.some((permission) => granted.has(permission));
}

export function hasAllPermissions(
  granted: ReadonlySet<string>,
  permissions: readonly string[],
) {
  return permissions.every((permission) => granted.has(permission));
}
