import { H3Event } from "#imports";
import { DbUser } from "../types/user.db";

export async function setSanitizedUserSession(
  event: H3Event<globalThis.EventHandlerRequest>,
  user: DbUser,
) {
  const {
    password: _password,
    twoFactorSecret: _secret,
    ...userWithoutPassword
  } = user;

  await setUserSession(event, {
    user: userWithoutPassword,
  });

  return userWithoutPassword;
}
