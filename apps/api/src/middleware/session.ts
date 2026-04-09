import { Response, NextFunction } from 'express';
import { User } from '../models/User.js';
import { Session } from '../models/Session.js';
import { UnauthorizedError, AppError } from './error.js';
import { AuthRequest } from './authenticate.js';
import { comparePassword } from '../utils/hash.js';
import { signJWT } from '../utils/jwt.js';
import { USER_STATUS } from '@user-management-system/types';

const DAYS = 24 * 60 * 60 * 1000;

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  maxAge: 7 * DAYS,
};

export async function login(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      throw new UnauthorizedError('Invalid credentials');
    }

    const isValidPassword = await comparePassword(password, user.password);
    if (!isValidPassword) {
      throw new UnauthorizedError('Invalid credentials');
    }

    if (user.status === USER_STATUS.INACTIVE) {
      throw new UnauthorizedError('Account is inactive');
    }

    await Session.updateMany(
      { userId: user._id, terminationTime: null },
      { $set: { terminationTime: new Date() } }
    );

    const session = await Session.create({ userId: user._id });

    user.loginCounter += 1;
    await user.save();

    const token = signJWT({
      sessionId: session._id.toString(),
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    res.cookie('token', token, COOKIE_OPTIONS);

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          status: user.status,
        },
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function logout(req: AuthRequest, _res: Response, next: NextFunction): Promise<void> {
  try {
    await Session.updateOne(
      { _id: req.user!.sessionId, terminationTime: null },
      { $set: { terminationTime: new Date() } }
    );

    _res.clearCookie('token');
    _res.json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    next(error);
  }
}

export async function getCurrentUser(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const user = await User.findById(req.user!.userId).select('-password');
    if (!user) {
      throw new AppError('User not found', 404);
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
}
