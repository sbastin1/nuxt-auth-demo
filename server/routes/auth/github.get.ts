import { eq } from "drizzle-orm";

export default defineOAuthGitHubEventHandler({
  config: {
    emailRequired: true,
  },

  async onSuccess(event, { user }) {
    const db = useDb();

    const dbUser = await db.transaction(async (tx) => {
      if (!user.email) {
        throw createError({
          statusCode: 401,
          statusMessage: "GitHub account must have an email address set.",
        });
      }

      const existingUser = await tx.query.user.findFirst({
        where: eq(schema.user.email, user.email),
      });

      if (existingUser) {
        return existingUser;
      }

      const result = await tx
        .insert(schema.user)
        .values({
          email: user.email,
          login: user.login,
          name: user.name,
          provider: ["oauth"],
        })
        .returning();

      const newUser = result[0];

      if (!newUser) {
        throw createError({
          statusCode: 500,
          statusMessage: "Failed to create user.",
        });
      }

      return newUser;
    });

    await setSanitizedUserSession(event, dbUser);

    return sendRedirect(event, "/");
  },

  onError(event, error) {
    console.error("GitHub OAuth error:", error);
    return sendRedirect(event, "/");
  },
});
