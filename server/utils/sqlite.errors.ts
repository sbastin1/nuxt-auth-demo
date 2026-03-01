export function isUniqueConstraintError(err: unknown): boolean {
  //@ts-expect-error
  const cause = err.cause;
  if (!(err instanceof Error)) return false;
  if (!(cause instanceof Error)) return false;

  return cause.message.includes("UNIQUE constraint failed");
}
