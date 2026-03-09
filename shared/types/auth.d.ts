declare module "#auth-utils" {
  interface User {
    id: number;
    email: string;
    loginname?: string | null;
    name?: string | null;
    provider: ("credentials" | "oauth" | "passkey")[];
    twoFactorEnabled: boolean;
  }

  interface UserSession {
    twoFactor?: { required: boolean };
    passkeyChallenge?: string;
  }

  interface SecureSessionData {
    twoFactorUserId?: number;
  }
}

export {};
