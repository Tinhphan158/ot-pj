export interface JwtPayload {
  id: string;
  email: string;
  name: string;
  avatar?: string | null;
}
