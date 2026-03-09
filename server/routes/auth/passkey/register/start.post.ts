import { generateRegistrationOptions } from "@simplewebauthn/server";
import { eq } from "drizzle-orm";
import { webauthnConfig } from "~~/server/utils/webauthn";

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event);
  const db = useDb();

  const existingPasskeys = await db
    .select()
    .from(schema.passkey)
    .where(eq(schema.passkey.userId, session.user.id));

  const excludeCredentials = existingPasskeys.map((pk) => ({
    id: pk.credentialID,
    transports: pk.transports ?? undefined,
  }));

  const options = await generateRegistrationOptions({
    rpName: webauthnConfig.rpName,
    rpID: webauthnConfig.rpID,

    userID: new TextEncoder().encode(session.user.id.toString()),
    userName: session.user.email,
    userDisplayName: session.user.name ?? session.user.email,

    attestationType: "none",

    authenticatorSelection: {
      residentKey: "required",
      userVerification: "preferred",
    },

    timeout: 60000,

    excludeCredentials,
  });

  await setUserSession(event, {
    ...session,
    passkeyChallenge: options.challenge,
  });

  return options;
});
