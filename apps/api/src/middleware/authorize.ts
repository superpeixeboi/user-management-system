import { Response, NextFunction } from 'express';
import { USER_ROLE } from '@user-management-system/types';
import { ForbiddenError } from './error.js';
import { AuthRequest } from './authenticate.js';

export function requireAdmin(req: AuthRequest, _res: Response, next: NextFunction): void {
  if (req.user?.role !== USER_ROLE.ADMIN) {
    return next(new ForbiddenError('Admin access required'));
  }
  next();
}
