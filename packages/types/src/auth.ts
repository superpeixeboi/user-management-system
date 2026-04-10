export interface JWTPayload {
  sessionId: string;
  userId: string;
  email: string;
  role: string;
}
