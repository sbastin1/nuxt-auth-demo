import { verifyRegistrationResponse } from "@simplewebauthn/server";
import { eq } from "drizzle-orm";
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

    if (!session.user.provider.includes("passkey")) {
      await tx
        .update(schema.user)
        .set({
          provider: [...session.user.provider, "passkey"],
        })
        .where(eq(schema.user.id, session.user.id));
    }
  });

  await setUserSession(event, {
    ...session,
    passkeyChallenge: undefined,
  });

  return { verified: true };
});
