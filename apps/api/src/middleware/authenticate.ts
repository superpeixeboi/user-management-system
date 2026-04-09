import { Request, Response, NextFunction } from 'express';
import { verifyJWT, JWTPayload } from '../utils/jwt.js';
import { UnauthorizedError } from './error.js';
import { Session } from '../models/Session.js';

export interface AuthRequest extends Request {
  user?: JWTPayload;
}

export function extractBearerToken(authHeader?: string): string | undefined {
  if (!authHeader?.startsWith('Bearer ')) {
    return undefined;
  }
  return authHeader.slice(7);
}

export async function authenticate(
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): Promise<void> {
  const cookieToken = req.cookies?.token;
  const bearerToken = extractBearerToken(req.headers.authorization);

  if (cookieToken && bearerToken) {
    return next(new UnauthorizedError('Cannot use both cookie and bearer token'));
  }

  const token = bearerToken || cookieToken;
  if (!token) {
    return next(new UnauthorizedError('No token provided'));
  }

  const payload = verifyJWT(token);
  if (!payload) {
    return next(new UnauthorizedError('Invalid token'));
  }

  const session = await Session.findOne({
    _id: payload.sessionId,
    userId: payload.userId,
    terminationTime: null,
  });

  if (!session) {
    return next(new UnauthorizedError('Session expired or invalid'));
  }

  req.user = payload;
  next();
}
