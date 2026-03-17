import { startRegistration } from "@simplewebauthn/browser";
import type { PublicKeyCredentialCreationOptionsJSON } from "@simplewebauthn/browser";

export async function registerPasskey() {
  try {
    const options = await $fetch<PublicKeyCredentialCreationOptionsJSON>(
      "/api/auth/passkey/register/start",
      {
        method: "POST",
      },
    );

    const credential = await startRegistration({
      optionsJSON: options,
    });

    const verification = await $fetch("/api/auth/passkey/register/finish", {
      method: "POST",
      body: credential,
    });

    return verification;
  } catch (error) {
    if (error instanceof Error) {
      console.error("Passkey registration failed:", error.message);
    }
    throw error;
  }
}
