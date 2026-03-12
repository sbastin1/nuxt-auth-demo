import { generateAuthenticationOptions } from "@simplewebauthn/server";
import { webauthnConfig } from "~~/server/utils/webauthn";

export default defineEventHandler(async (event) => {
  const options = await generateAuthenticationOptions({
    rpID: webauthnConfig.rpID,

    userVerification: "preferred",

    timeout: 60000,
  });

  const session = await getUserSession(event);

  await setUserSession(event, {
    ...session,
    passkeyChallenge: options.challenge,
  });

  return options;
});
