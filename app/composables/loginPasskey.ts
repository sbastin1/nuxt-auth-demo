import { startAuthentication } from "@simplewebauthn/browser";
import type { PublicKeyCredentialRequestOptionsJSON } from "@simplewebauthn/browser";

export async function loginWithPasskey() {
  try {
    const options = await $fetch<PublicKeyCredentialRequestOptionsJSON>(
      "/auth/passkey/login/start",
      { method: "POST" },
    );

    const credential = await startAuthentication({
      optionsJSON: options,
    });

    const result = await $fetch("/auth/passkey/login/finish", {
      method: "POST",
      body: credential,
    });

    return result;
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      return null;
    }

    throw error;
  }
}
