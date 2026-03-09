import { AuthenticatorTransportFuture } from "@simplewebauthn/server";
import { sqliteTable, text, integer, blob } from "drizzle-orm/sqlite-core";

export const user = sqliteTable("user", {
  id: integer("id").primaryKey(),
  name: text("name"),
  email: text("email").notNull().unique(),
  login: text("login"),
  password: text("password"),
  provider: text("provider", { mode: "json" })
    .$type<("credentials" | "oauth" | "passkey")[]>()
    .notNull()
    .default([]),
  twoFactorEnabled: integer("two_factor_enabled", { mode: "boolean" })
    .notNull()
    .default(false),
  twoFactorSecret: text("two_factor_secret"),
});

export const loginRateLimit = sqliteTable("login_rate_limit", {
  key: text("key").primaryKey(),
  attempts: integer("attempts").notNull(),
  firstAttemptAt: integer("first_attempt_at").notNull(),
});

export const passkey = sqliteTable("passkey", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  credentialID: text("credential_id").notNull().unique(),
  publicKey: blob("public_key", { mode: "buffer" }).notNull(),
  counter: integer("counter").notNull(),
  deviceType: text("device_type", {
    enum: ["singleDevice", "multiDevice"],
  }).notNull(),
  backedUp: integer("backed_up", { mode: "boolean" }).notNull(),
  transports: text("transports", { mode: "json" }).$type<
    AuthenticatorTransportFuture[]
  >(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});
