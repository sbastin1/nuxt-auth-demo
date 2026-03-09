import { eq } from "drizzle-orm";
import { generateSecret, generateURI } from "otplib";
import QRCode from "qrcode";

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event);
  const user = session.user;
  const db = useDb();

  const secret = generateSecret();

  const uri = generateURI({
    secret,
    label: user.email,
    issuer: "nuxt-auth",
    digits: 6,
    period: 30,
    algorithm: "sha1",
  });

  const qr = await QRCode.toDataURL(uri);

  try {
    await db
      .update(schema.user)
      .set({ twoFactorSecret: secret })
      .where(eq(schema.user.id, user.id));
  } catch (e) {
    throw createError({
      statusCode: 500,
      statusMessage: "Interal Server Error",
    });
  }

  return qr;
});
