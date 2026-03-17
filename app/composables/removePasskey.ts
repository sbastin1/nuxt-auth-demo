export async function removePasskey(id: number) {
  try {
    const response = await $fetch<{ success: boolean; deletedId: number }>(
      "/auth/passkey/remove",
      {
        method: "DELETE",
        body: { id },
      },
    );

    return response;
  } catch (error) {
    if (error instanceof Error) {
      console.error("Passkey removal failed:", error.message);
    }
    throw error;
  }
}
