export default defineOAuthGitHubEventHandler({
  config: {
    emailRequired: true,
  },
  async onSuccess(event, { user }) {
    if (!user.email) {
      throw createError({
        statusCode: 401,
        statusMessage: "Github account must have an email address set.",
      });
    }

    const db = useDb();

    try {
      const result = await db
        .insert(schema.user)
        .values({
          email: user.email,
          login: user.login,
          name: user.name,
          provider: ["oauth"],
        })
        .returning();

      const existingUser = result[0];

      if (!existingUser) {
        throw createError({
          statusCode: 500,
          statusMessage: "Error Authenticating with Github",
        });
      }

      await setSanitizedUserSession(event, existingUser);

      return sendRedirect(event, "/");
    } catch (e) {
      if (e instanceof H3Error && e.statusCode) {
        throw e;
      }

      if (isUniqueConstraintError(e)) {
        throw createError({
          statusCode: 400,
          statusMessage: "Account already exists. Please login.",
        });
      }

      throw createError({
        statusCode: 500,
        statusMessage: "Failed to register user.",
      });
    }
  },

  onError(event, error) {
    console.error("GitHub OAuth error:", error);
    return sendRedirect(event, "/");
  },
});
