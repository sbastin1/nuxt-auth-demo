import { isUniqueConstraintError } from "~~/server/utils/sqlite.errors";
import { setSanitizedUserSession } from "~~/server/utils/user.session";

export default defineEventHandler(async (event) => {
  const { name, email, password } = await readBody(event);

  if (!name || !email || !password) {
    throw createError({
      statusCode: 400,
      statusMessage: "Missing required fields.",
    });
  }

  try {
    const result = await useDb()
      .insert(schema.user)
      .values({
        name,
        email,
        password: await hashPassword(password),
        login: email,
        provider: ["credentials"],
      })
      .returning();

    const newUser = result.at(0);

    if (!newUser) {
      throw createError({
        statusCode: 500,
        statusMessage: "Failed to register User.",
      });
    }

    return setSanitizedUserSession(event, newUser);
  } catch (e) {
    if (e instanceof H3Error) {
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
});
