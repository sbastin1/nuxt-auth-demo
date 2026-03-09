export interface DbUser {
  password: string | null;
  id: number;
  email: string;
  name: string | null;
  login: string | null;
  provider: "credentials" | "oauth" | "passkey";
  twoFactorEnabled: boolean;
  twoFactorSecret: string | null;
}
