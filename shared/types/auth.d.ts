declare module "#auth-utils" {
  interface User {
    id: number;
    email: string;
    loginname?: string | null;
    name?: string | null;
  }

  interface UserSession {
    // Add your own fields
  }

  interface SecureSessionData {
    // Add your own fields
  }
}

export {};
