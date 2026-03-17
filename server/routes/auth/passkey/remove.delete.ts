import { and, eq } from "drizzle-orm";

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event);
  const db = useDb();
  const userId = session.user.id;

  const body = await readBody<{ id: number }>(event);

  if (!body?.id) {
    throw createError({
      statusCode: 400,
      statusMessage: "Passkey id is required",
    });
  }

  const deleted = await db
    .delete(schema.passkey)
    .where(
      and(eq(schema.passkey.id, body.id), eq(schema.passkey.userId, userId)),
    )
    .returning({ id: schema.passkey.id });

  const deletedRow = deleted[0];

  if (!deletedRow) {
    throw createError({
      statusCode: 404,
      statusMessage: "Passkey not found",
    });
  }
  return {
    success: true,
    deletedId: deletedRow.id,
  };
});
