import { eq } from "drizzle-orm";

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000;

export async function enforceLoginRateLimit(key: string) {
  const db = useDb();
  const now = Date.now();

  try {
    const existing = await db.query.loginRateLimit.findFirst({
      where: eq(schema.loginRateLimit.key, key),
    });

    if (!existing) {
      await db.insert(schema.loginRateLimit).values({
        key,
        attempts: 1,
        firstAttemptAt: now,
      });
      return;
    }

    const windowExpired = now - existing.firstAttemptAt > WINDOW_MS;

    if (windowExpired) {
      await db
        .update(schema.loginRateLimit)
        .set({
          attempts: 1,
          firstAttemptAt: now,
        })
        .where(eq(schema.loginRateLimit.key, key));

      return;
    }

    if (existing.attempts >= MAX_ATTEMPTS) {
      throw createError({
        statusCode: 429,
        statusMessage: "Too many login attempts. Try again later.",
      });
    }

    await db
      .update(schema.loginRateLimit)
      .set({
        attempts: existing.attempts + 1,
      })
      .where(eq(schema.loginRateLimit.key, key));
  } catch (e) {
    if (isError(e)) {
      throw e;
    }

    console.error("Rate limit failure:", e);

    throw createError({
      statusCode: 500,
      statusMessage: "Unable to process login request.",
    });
  }
}

export async function clearRateLimit(key: string) {
  await useDb()
    .delete(schema.loginRateLimit)
    .where(eq(schema.loginRateLimit.key, key));
}
