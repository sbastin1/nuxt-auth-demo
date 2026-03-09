import { verifyAuthenticationResponse } from "@simplewebauthn/server";
import { eq } from "drizzle-orm";
import { webauthnConfig } from "~~/server/utils/webauthn";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const db = useDb();

  const session = await getUserSession(event);
  console.log(session.passkeyChallenge);
  const expectedChallenge = session.passkeyChallenge;

  if (!expectedChallenge) {
    throw createError({
      statusCode: 400,
      statusMessage: "Missing passkey challenge",
    });
  }

  const credentialID = body.id;

  const passkey = await db.query.passkey.findFirst({
    where: eq(schema.passkey.credentialID, credentialID),
  });

  if (!passkey) {
    throw createError({
      statusCode: 404,
      statusMessage: "Passkey not found",
    });
  }

  const verification = await verifyAuthenticationResponse({
    response: body,

    expectedChallenge,
    expectedOrigin: webauthnConfig.origin,
    expectedRPID: webauthnConfig.rpID,

    credential: {
      id: passkey.credentialID,
      publicKey: new Uint8Array(passkey.publicKey),
      counter: passkey.counter,
      transports: passkey.transports ?? undefined,
    },
  });

  if (!verification.verified) {
    throw createError({
      statusCode: 401,
      statusMessage: "Authentication failed",
    });
  }

  const user = await db.transaction(async (tx) => {
    await tx
      .update(schema.passkey)
      .set({
        counter: verification.authenticationInfo.newCounter,
      })
      .where(eq(schema.passkey.id, passkey.id));

    const user = await tx.query.user.findFirst({
      where: eq(schema.user.id, passkey.userId),
    });

    if (!user) {
      throw createError({
        statusCode: 404,
        statusMessage: "User not found",
      });
    }

    return user;
  });

  await setSanitizedUserSession(event, user);

  return { verified: true };
});
