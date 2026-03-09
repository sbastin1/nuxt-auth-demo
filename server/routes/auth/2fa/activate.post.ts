import { eq } from "drizzle-orm";
import { verify } from "otplib";

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event);
  const body = await readBody(event);
  const db = useDb();

  if (!body?.token) {
    throw createError({
      statusCode: 400,
      statusMessage: "Missing OTP",
    });
  }

  const otp = body.token;

  await db.transaction(async (tx) => {
    const user = await tx.query.user.findFirst({
      where: eq(schema.user.id, session.user.id),
    });

    if (!user?.twoFactorSecret) {
      throw createError({
        statusCode: 500,
        statusMessage: "Internal Server Error",
      });
    }

    if (user.twoFactorEnabled) {
      throw createError({
        statusCode: 400,
        statusMessage: "2FA is already enabled",
      });
    }

    if (!otp || otp.length !== 6) {
      throw createError({
        statusCode: 400,
        statusMessage: "OTP must be 6 digits",
      });
    }

    const verification = await verify({
      token: otp,
      secret: user.twoFactorSecret,
    });

    if (!verification.valid) {
      throw createError({
        statusCode: 400,
        statusMessage: "Invalid OTP",
      });
    }

    await tx
      .update(schema.user)
      .set({ twoFactorEnabled: true })
      .where(eq(schema.user.id, user.id));
  });

  return setUserSession(event, {
    user: {
      ...session.user,
      twoFactorEnabled: true,
    },
  });
});
