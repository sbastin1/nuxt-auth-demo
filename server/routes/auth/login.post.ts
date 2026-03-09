import { eq } from "drizzle-orm";
import { enforceLoginRateLimit } from "~~/server/utils/rate-limit.login";
import { setSanitizedUserSession } from "~~/server/utils/user.session";

export default defineEventHandler(async (event) => {
  const { email, password } = await readBody(event);
  const ip = getRequestIP(event) ?? "unknown";
  const ipKey = `ip:${ip}`;
  const emailKey = `email:${email}`;

  if (!email || !password) {
    throw createError({
      statusCode: 400,
      statusMessage: "Missing required fields",
    });
  }

  await enforceLoginRateLimit(ipKey);
  await enforceLoginRateLimit(emailKey);

  const existingUser = await useDb().query.user.findFirst({
    where: eq(schema.user.email, email),
  });

  if (!existingUser || !existingUser.password) {
    throw createError({
      statusCode: 401,
      statusMessage: "Invalid email or password. Please try again.",
    });
  }

  const isPasswordValid = await verifyPassword(existingUser.password, password);

  if (!isPasswordValid) {
    throw createError({
      statusCode: 401,
      statusMessage: "Invalid email or password. Please try again.",
    });
  }

  await clearRateLimit(ipKey);
  await clearRateLimit(emailKey);

  if (existingUser.twoFactorEnabled) {
    return await setUserSession(event, {
      secure: {
        twoFactorUserId: existingUser.id,
      },
      twoFactor: {
        required: true,
      },
    });
  }

  return await setSanitizedUserSession(event, existingUser);
});
