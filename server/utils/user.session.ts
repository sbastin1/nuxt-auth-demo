import { H3Event } from "#imports";
import { DbUser } from "../types/user.db";

export async function setSanitizedUserSession(
  event: H3Event<globalThis.EventHandlerRequest>,
  user: DbUser,
  optionalFields: Record<string, unknown> = {},
) {
  const {
    password: _password,
    twoFactorSecret: _secret,
    ...userWithoutPassword
  } = user;

  await replaceUserSession(event, {
    user: userWithoutPassword,
    ...optionalFields,
  });

  return userWithoutPassword;
}
