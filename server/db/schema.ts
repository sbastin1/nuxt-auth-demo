import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const user = sqliteTable("user", {
  id: integer("id").primaryKey(),
  name: text("name"),
  email: text("email").notNull().unique(),
  login: text("login"),
  password: text("password"),
  provider: text("provider", {
    enum: ["credentials", "oauth", "passkey"],
  }).notNull(),
});

export const loginRateLimit = sqliteTable("login_rate_limit", {
  key: text("key").primaryKey(),
  attempts: integer("attempts").notNull(),
  firstAttemptAt: integer("first_attempt_at").notNull(),
});
