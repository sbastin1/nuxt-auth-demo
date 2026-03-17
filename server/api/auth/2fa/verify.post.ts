import { eq } from "drizzle-orm";
import { verify } from "otplib";

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event);
  const body = await readBody(event);
  const db = useDb();

  if (!body?.token) {
    throw createError({
      statusCode: 400,
      statusMessage: "Missing OTP",
    });
  }

  if (!session.secure?.twoFactorUserId) {
    throw createError({
      statusCode: 500,
      statusMessage: "Internal Server Error",
    });
  }

  const otp = body.token;

  const user = await useDb().query.user.findFirst({
    where: eq(schema.user.id, session.secure?.twoFactorUserId),
  });

  if (!user || !user.twoFactorSecret) {
    throw createError({
      statusCode: 500,
      statusMessage: "Internal Server Error",
    });
  }

  const verified = await verify({
    token: otp,
    secret: user?.twoFactorSecret,
  });

  if (!verified.valid) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid One Time Password",
    });
  }

  return setSanitizedUserSession(event, user);
});
