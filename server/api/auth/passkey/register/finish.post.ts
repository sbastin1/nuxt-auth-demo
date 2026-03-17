import { verifyRegistrationResponse } from "@simplewebauthn/server";
import { eq } from "drizzle-orm";
import { DbUser } from "~~/server/types/user.db";
import { webauthnConfig } from "~~/server/utils/webauthn";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const db = useDb();

  const session = await requireUserSession(event);

  const expectedChallenge = session.passkeyChallenge;

  if (!expectedChallenge) {
    throw createError({
      statusCode: 400,
      statusMessage: "Missing passkey challenge",
    });
  }

  const verification = await verifyRegistrationResponse({
    response: body,
    expectedChallenge,
    expectedOrigin: webauthnConfig.origin,
    expectedRPID: webauthnConfig.rpID,
  });

  if (!verification.verified || !verification.registrationInfo) {
    throw createError({
      statusCode: 400,
      statusMessage: "Passkey registration failed",
    });
  }

  const { credential, credentialDeviceType, credentialBackedUp } =
    verification.registrationInfo;

  let updatedUser: DbUser | undefined;

  await db.transaction(async (tx) => {
    await tx.insert(schema.passkey).values({
      userId: session.user.id,
      credentialID: credential.id,
      publicKey: Buffer.from(credential.publicKey),
      counter: credential.counter,
      deviceType: credentialDeviceType,
      backedUp: credentialBackedUp,
      transports: body.response.transports ?? [],
      createdAt: new Date(),
    });

    const user = await tx.query.user.findFirst({
      where: eq(schema.user.id, session.user.id),
      columns: { provider: true },
    });

    const providers = [...(user?.provider ?? [])];

    if (!providers.includes("passkey")) {
      providers.push("passkey");

      const result = await tx
        .update(schema.user)
        .set({ provider: providers })
        .where(eq(schema.user.id, session.user.id))
        .returning();

      updatedUser = result[0];
    }
  });

  if (!updatedUser) {
    updatedUser = await db.query.user.findFirst({
      where: eq(schema.user.id, session.user.id),
    });
  }

  if (!updatedUser) {
    throw createError({
      statusCode: 500,
      statusMessage: "User not found after passkey registration",
    });
  }

  await setSanitizedUserSession(event, updatedUser, {
    passkeyChallenge: undefined,
  });

  return { verified: true };
});
