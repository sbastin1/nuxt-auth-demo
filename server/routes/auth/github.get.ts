import { eq } from "drizzle-orm";

export default defineOAuthGitHubEventHandler({
  config: {
    emailRequired: true,
  },
  async onSuccess(event, { user, tokens }) {
    if (!user.email) {
      throw createError({
        statusCode: 401,
        statusMessage: "Github account must have an email address set.",
      });
    }

    const db = useDb();
    let existingUser = await db.query.user.findFirst({
      where: eq(schema.user.email, user.email),
    });

    if (!existingUser) {
      const result = await db
        .insert(schema.user)
        .values({
          email: user.email,
          login: user.login,
          name: user.name,
          provider: "credentials",
        })
        .returning();
      existingUser = result.at(0);
    }

    if (!existingUser) {
      throw createError({
        statusCode: 500,
        statusMessage: "Error Authenticating with Github",
      });
    }

    const { password, ...userWithoutPass } = existingUser;
    await setUserSession(event, {
      user: userWithoutPass,
    });
    return sendRedirect(event, "/");
  },

  onError(event, error) {
    console.error("GitHub OAuth error:", error);
    return sendRedirect(event, "/");
  },
});
