jest.mock('@user-management-system/types', () => ({
  USER_ROLE: { USER: 'user', ADMIN: 'admin' },
}));

import { Response, NextFunction } from 'express';
import { requireAdmin } from '../../middleware/authorize';
import { AuthRequest } from '../../middleware/authenticate';
import { ForbiddenError } from '../../middleware/error';

describe('authorize middleware', () => {
  let mockReq: Partial<AuthRequest>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    jest.clearAllMocks();
    mockReq = {};
    mockRes = {};
    mockNext = jest.fn();
  });

  describe('requireAdmin', () => {
    it('should allow admin user', () => {
      mockReq.user = { role: 'admin' };

      requireAdmin(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should block non-admin user', () => {
      mockReq.user = { role: 'user' };

      requireAdmin(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(ForbiddenError));
      expect((mockNext as jest.Mock).mock.calls[0][0].message).toBe('Admin access required');
    });

    it('should block user with no role', () => {
      mockReq.user = {};

      requireAdmin(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(ForbiddenError));
    });
  });
});
