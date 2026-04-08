jest.mock('../../models/Session');
jest.mock('../../utils/jwt');

import { Response, NextFunction } from 'express';
import { authMiddleware, extractBearerToken } from '../../middleware/auth';
import { verifyJWT } from '../../utils/jwt';
import { Session } from '../../models/Session';
import { AuthRequest } from '../../middleware/auth';
import { UnauthorizedError } from '../../middleware/error';

describe('auth middleware', () => {
  let mockReq: Partial<AuthRequest>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    jest.clearAllMocks();
    mockReq = {
      cookies: {},
      headers: {},
    };
    mockRes = {};
    mockNext = jest.fn();
  });

  describe('extractBearerToken', () => {
    it('should return token from valid Bearer header', () => {
      const result = extractBearerToken('Bearer my-token-123');
      expect(result).toBe('my-token-123');
    });

    it('should return undefined for non-Bearer header', () => {
      const result = extractBearerToken('Basic auth-token');
      expect(result).toBe(undefined);
    });

    it('should return undefined for missing header', () => {
      const result = extractBearerToken(undefined);
      expect(result).toBe(undefined);
    });

    it('should return undefined for empty Bearer', () => {
      const result = extractBearerToken('Bearer ');
      expect(result).toBe('');
    });
  });

  describe('authMiddleware', () => {
    it('should set req.user on valid cookie', async () => {
      (verifyJWT as jest.Mock).mockReturnValue({
        sessionId: 'session-id-123',
        userId: 'user-id-123',
        email: 'test@example.com',
        role: 'user',
      });
      (Session.findOne as jest.Mock).mockResolvedValue({
        _id: 'session-id-123',
        userId: 'user-id-123',
      });

      mockReq.cookies = { token: 'valid-jwt-token' };

      await authMiddleware(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
      expect((mockReq as AuthRequest).user).toEqual({
        sessionId: 'session-id-123',
        userId: 'user-id-123',
        email: 'test@example.com',
        role: 'user',
      });
    });

    it('should set req.user on valid bearer token', async () => {
      (verifyJWT as jest.Mock).mockReturnValue({
        sessionId: 'session-id-123',
        userId: 'user-id-123',
        email: 'test@example.com',
        role: 'user',
      });
      (Session.findOne as jest.Mock).mockResolvedValue({
        _id: 'session-id-123',
        userId: 'user-id-123',
      });

      mockReq.headers = { authorization: 'Bearer valid-jwt-token' };

      await authMiddleware(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
      expect((mockReq as AuthRequest).user).toEqual({
        sessionId: 'session-id-123',
        userId: 'user-id-123',
        email: 'test@example.com',
        role: 'user',
      });
    });

    it('should throw error when both cookie and bearer present', async () => {
      mockReq.cookies = { token: 'cookie-token' };
      mockReq.headers = { authorization: 'Bearer bearer-token' };

      await authMiddleware(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(UnauthorizedError));
      expect((mockNext as jest.Mock).mock.calls[0][0].message).toBe(
        'Cannot use both cookie and bearer token'
      );
    });

    it('should throw "No token provided" when neither cookie nor bearer', async () => {
      await authMiddleware(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(UnauthorizedError));
      expect((mockNext as jest.Mock).mock.calls[0][0].message).toBe('No token provided');
    });

    it('should throw "Invalid token" on malformed JWT', async () => {
      (verifyJWT as jest.Mock).mockReturnValue(null);

      mockReq.cookies = { token: 'malformed-token' };

      await authMiddleware(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(UnauthorizedError));
      expect((mockNext as jest.Mock).mock.calls[0][0].message).toBe('Invalid token');
    });

    it('should throw "Session expired" when session not in DB', async () => {
      (verifyJWT as jest.Mock).mockReturnValue({
        sessionId: 'session-id-123',
        userId: 'user-id-123',
        email: 'test@example.com',
        role: 'user',
      });
      (Session.findOne as jest.Mock).mockResolvedValue(null);

      mockReq.cookies = { token: 'valid-jwt-token' };

      await authMiddleware(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(UnauthorizedError));
      expect((mockNext as jest.Mock).mock.calls[0][0].message).toBe('Session expired or invalid');
    });
  });
});
