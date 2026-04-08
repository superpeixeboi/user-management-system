jest.mock('../../models/User');
jest.mock('../../models/Session');
jest.mock('../../utils/hash');
jest.mock('../../utils/jwt');

import { Response, NextFunction } from 'express';
import { login, logout, getCurrentUser } from '../../middleware/session';
import { User } from '../../models/User';
import { Session } from '../../models/Session';
import { comparePassword } from '../../utils/hash';
import { signJWT } from '../../utils/jwt';
import { AuthRequest } from '../../middleware/auth';
import { UnauthorizedError, AppError } from '../../middleware/error';

const mockUser = {
  _id: 'user-id-123',
  email: 'test@example.com',
  firstName: 'John',
  lastName: 'Doe',
  role: 'user',
  status: 'active',
  loginCounter: 0,
  save: jest.fn().mockResolvedValue(true),
};

describe('session middleware', () => {
  let mockReq: Partial<AuthRequest>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    jest.clearAllMocks();
    mockReq = {
      body: {},
      user: undefined,
      cookies: {},
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      cookie: jest.fn().mockReturnThis(),
      clearCookie: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
  });

  describe('login', () => {
    it('should login successfully', async () => {
      const userWithPassword = { ...mockUser, password: 'hashed-password' };
      (User.findOne as jest.Mock).mockReturnValue({
        select: jest.fn().mockResolvedValue(userWithPassword),
      });
      (comparePassword as jest.Mock).mockResolvedValue(true);
      (Session.updateMany as jest.Mock).mockResolvedValue({ modifiedCount: 1 });
      (Session.create as jest.Mock).mockResolvedValue({ _id: 'session-id-123' });
      (signJWT as jest.Mock).mockReturnValue('jwt-token');

      mockReq.body = {
        email: 'test@example.com',
        password: 'password123',
      };

      await login(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(Session.updateMany).toHaveBeenCalledWith(
        { userId: mockUser._id, terminationTime: null },
        { $set: { terminationTime: expect.any(Date) } }
      );
      expect(Session.create).toHaveBeenCalledWith({ userId: mockUser._id });
      expect(mockUser.save).toHaveBeenCalled();
      expect(mockRes.cookie).toHaveBeenCalledWith('token', 'jwt-token', expect.any(Object));
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: {
          user: expect.objectContaining({
            id: mockUser._id,
            email: mockUser.email,
          }),
        },
      });
    });

    it('should throw UnauthorizedError for invalid email', async () => {
      (User.findOne as jest.Mock).mockReturnValue({
        select: jest.fn().mockResolvedValue(null),
      });

      mockReq.body = {
        email: 'wrong@example.com',
        password: 'password123',
      };

      await login(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(UnauthorizedError));
      expect((mockNext as jest.Mock).mock.calls[0][0].message).toBe('Invalid credentials');
    });

    it('should throw UnauthorizedError for invalid password', async () => {
      const userWithPassword = { ...mockUser, password: 'hashed-password' };
      (User.findOne as jest.Mock).mockReturnValue({
        select: jest.fn().mockResolvedValue(userWithPassword),
      });
      (comparePassword as jest.Mock).mockResolvedValue(false);

      mockReq.body = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      await login(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(UnauthorizedError));
    });

    it('should throw UnauthorizedError for inactive user', async () => {
      const inactiveUser = { ...mockUser, status: 'inactive', password: 'hashed-password' };
      (User.findOne as jest.Mock).mockReturnValue({
        select: jest.fn().mockResolvedValue(inactiveUser),
      });
      (comparePassword as jest.Mock).mockResolvedValue(true);

      mockReq.body = {
        email: 'test@example.com',
        password: 'password123',
      };

      await login(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(UnauthorizedError));
      expect((mockNext as jest.Mock).mock.calls[0][0].message).toBe('Account is inactive');
    });
  });

  describe('logout', () => {
    it('should logout successfully', async () => {
      (Session.updateOne as jest.Mock).mockResolvedValue({ modifiedCount: 1 });

      mockReq.user = {
        sessionId: 'session-id-123',
        userId: 'user-id-123',
        email: 'test@example.com',
        role: 'user',
      };

      await logout(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(Session.updateOne).toHaveBeenCalledWith(
        { _id: 'session-id-123', terminationTime: null },
        { $set: { terminationTime: expect.any(Date) } }
      );
      expect(mockRes.clearCookie).toHaveBeenCalledWith('token');
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: 'Logged out successfully',
      });
    });
  });

  describe('getCurrentUser', () => {
    it('should return current user', async () => {
      const mockChain = { select: jest.fn().mockReturnValue(mockUser) };
      (User.findById as jest.Mock).mockReturnValue(mockChain);

      mockReq.user = {
        sessionId: 'session-id-123',
        userId: 'user-id-123',
        email: 'test@example.com',
        role: 'user',
      };

      await getCurrentUser(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(User.findById).toHaveBeenCalledWith('user-id-123');
      expect(mockChain.select).toHaveBeenCalledWith('-password');
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockUser,
      });
    });

    it('should throw AppError if user not found', async () => {
      const mockChain = { select: jest.fn().mockReturnValue(null) };
      (User.findById as jest.Mock).mockReturnValue(mockChain);

      mockReq.user = {
        sessionId: 'session-id-123',
        userId: 'user-id-123',
        email: 'test@example.com',
        role: 'user',
      };

      await getCurrentUser(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(AppError));
    });
  });
});
