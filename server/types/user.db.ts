export interface DbUser {
  password: string | null;
  id: number;
  email: string;
  name: string | null;
  login: string | null;
}
