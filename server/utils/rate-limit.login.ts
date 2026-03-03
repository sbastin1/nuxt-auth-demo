import { eq, sql } from "drizzle-orm";

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000;

export async function enforceLoginRateLimit(key: string) {
  const db = useDb();
  const now = Date.now();

  const result = await db
    .insert(schema.loginRateLimit)
    .values({
      key,
      attempts: 1,
      firstAttemptAt: now,
    })
    .onConflictDoUpdate({
      target: schema.loginRateLimit.key,
      set: {
        attempts: sql`
            CASE
              WHEN ${now} - ${schema.loginRateLimit.firstAttemptAt} > ${WINDOW_MS}
                THEN 1
              ELSE ${schema.loginRateLimit.attempts} + 1
            END
          `,
        firstAttemptAt: sql`
            CASE
              WHEN ${now} - ${schema.loginRateLimit.firstAttemptAt} > ${WINDOW_MS}
                THEN ${now}
              ELSE ${schema.loginRateLimit.firstAttemptAt}
            END
          `,
      },
    })
    .returning();

  const row = result[0];

  if (!row) {
    throw createError({
      statusCode: 500,
      statusMessage: "Unable to process login request.",
    });
  }

  if (row.attempts > MAX_ATTEMPTS) {
    throw createError({
      statusCode: 429,
      statusMessage: "Too many login attempts. Try again later.",
    });
  }
}

export async function clearRateLimit(key: string) {
  await useDb()
    .delete(schema.loginRateLimit)
    .where(eq(schema.loginRateLimit.key, key));
}
