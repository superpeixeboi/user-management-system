import { Request, Response, NextFunction } from 'express';
import {
  validate,
  AppError,
  ValidationError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  errorHandler,
} from '../../middleware/error';
import { ZodError } from 'zod';

describe('error middleware', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    jest.clearAllMocks();
    mockReq = {
      body: {},
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
  });

  describe('validate middleware', () => {
    it('should call next() on valid data', () => {
      const mockSchema = {
        parse: jest.fn().mockReturnValue({ name: 'test' }),
      };

      mockReq.body = { name: 'test' };

      validate(mockSchema as any)(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should call next with ValidationError on invalid data', () => {
      const mockSchema = {
        parse: jest.fn().mockImplementation(() => {
          throw new ZodError([
            { code: 'invalid_type', path: ['email'], message: 'Invalid email format' },
          ]);
        }),
      };

      mockReq.body = { email: 'invalid' };

      validate(mockSchema as any)(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(ValidationError));
      const validationError = (mockNext as jest.Mock).mock.calls[0][0] as ValidationError;
      expect(validationError.message).toBe('Validation failed');
      expect(validationError.errors).toEqual([{ path: 'email', message: 'Invalid email format' }]);
    });
  });

  describe('error classes', () => {
    it('AppError should set correct statusCode', () => {
      const error = new AppError('Test error', 400);
      expect(error.statusCode).toBe(400);
      expect(error.isOperational).toBe(true);
    });

    it('ValidationError should include errors array', () => {
      const errors = [{ path: 'email', message: 'Invalid' }];
      const error = new ValidationError('Validation failed', errors);
      expect(error.statusCode).toBe(400);
      expect(error.errors).toEqual(errors);
    });

    it('UnauthorizedError should default to 401', () => {
      const error = new UnauthorizedError();
      expect(error.statusCode).toBe(401);
      expect(error.message).toBe('Unauthorized');
    });

    it('ForbiddenError should default to 403', () => {
      const error = new ForbiddenError();
      expect(error.statusCode).toBe(403);
      expect(error.message).toBe('Forbidden');
    });

    it('NotFoundError should default to 404', () => {
      const error = new NotFoundError();
      expect(error.statusCode).toBe(404);
      expect(error.message).toBe('Not found');
    });

    it('ConflictError should default to 409', () => {
      const error = new ConflictError();
      expect(error.statusCode).toBe(409);
      expect(error.message).toBe('Conflict');
    });
  });

  describe('errorHandler', () => {
    it('should return 400 for ValidationError', () => {
      const error = new ValidationError('Validation failed', []);

      errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Validation failed',
        errors: [],
      });
    });

    it('should return 401 for UnauthorizedError', () => {
      const error = new UnauthorizedError('Not authorized');

      errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Not authorized',
      });
    });

    it('should return 403 for ForbiddenError', () => {
      const error = new ForbiddenError('Access denied');

      errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Access denied',
      });
    });

    it('should return 404 for NotFoundError', () => {
      const error = new NotFoundError('Resource not found');

      errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Resource not found',
      });
    });

    it('should return 409 for ConflictError', () => {
      const error = new ConflictError('Resource already exists');

      errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(409);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Resource already exists',
      });
    });

    it('should return 500 for unknown errors', () => {
      const error = new Error('Unknown error');

      errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Internal server error',
      });
    });
  });
});
