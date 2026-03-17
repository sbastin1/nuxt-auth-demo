import { eq } from "drizzle-orm";

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event);
  const userId = session.user.id;

  const db = useDb();

  const passkeys = await db
    .select({
      id: schema.passkey.id,
      credentialId: schema.passkey.credentialID,
      counter: schema.passkey.counter,
      deviceType: schema.passkey.deviceType,
      backedUp: schema.passkey.backedUp,
      transports: schema.passkey.transports,
      createdAt: schema.passkey.createdAt,
    })
    .from(schema.passkey)
    .where(eq(schema.passkey.userId, userId));

  return {
    passkeys,
  };
});
