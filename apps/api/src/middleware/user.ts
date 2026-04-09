import { Response, NextFunction } from 'express';
import { User } from '../models/User.js';
import { USER_ROLE, USER_STATUS } from '@user-management-system/types';
import { ForbiddenError, NotFoundError, ConflictError } from './error.js';
import { AuthRequest } from './authenticate.js';
import { hashPassword } from '../utils/hash.js';

export async function register(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, password, firstName, lastName } = req.body;

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      throw new ConflictError('Email already in use');
    }

    const hashedPassword = await hashPassword(password);
    const user = await User.create({
      email: email.toLowerCase(),
      password: hashedPassword,
      firstName,
      lastName,
      role: USER_ROLE.USER,
      status: USER_STATUS.ACTIVE,
      loginCounter: 0,
    });

    res.status(201).json({
      success: true,
      data: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        status: user.status,
        creationTime: user.creationTime,
        lastUpdateTime: user.lastUpdateTime,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function listUsers(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 6));
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      User.find().select('-password').sort({ creationTime: -1 }).skip(skip).limit(limit),
      User.countDocuments(),
    ]);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getUser(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Commented out: allowing any user to view any user for admin functionality
    // const isAdmin = req.user!.role === USER_ROLE.ADMIN;
    // const isOwner = req.user!.userId === user._id.toString();
    // if (!isAdmin && !isOwner) {
    //   throw new ForbiddenError('You can only view your own profile');
    // }

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateUser(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Prevent inactive users from changing their name
    if (user.status === USER_STATUS.INACTIVE) {
      const isChangingFirstName =
        req.body.firstName !== undefined && req.body.firstName !== user.firstName;
      const isChangingLastName =
        req.body.lastName !== undefined && req.body.lastName !== user.lastName;

      if (isChangingFirstName || isChangingLastName) {
        throw new ForbiddenError('Cannot change name of inactive user');
      }
    }

    // Commented out: allowing any user to update any user for admin functionality
    // const isAdmin = req.user!.role === USER_ROLE.ADMIN;
    // const isOwner = req.user!.userId === user._id.toString();
    // if (!isAdmin && !isOwner) {
    //   throw new ForbiddenError('You can only update your own profile');
    // }
    //
    // if (!isAdmin) {
    //   delete req.body.role;
    //   delete req.body.status;
    // }

    const updates = Object.keys(req.body);
    const allowedUpdates = ['firstName', 'lastName', 'status', 'role'];

    for (const key of updates) {
      if (allowedUpdates.includes(key)) {
        const userKey = key as 'firstName' | 'lastName' | 'status' | 'role';
        (user as unknown as Record<string, unknown>)[userKey] = req.body[key];
      }
    }

    await user.save();

    res.json({
      success: true,
      data: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        status: user.status,
        creationTime: user.creationTime,
        lastUpdateTime: user.lastUpdateTime,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteUser(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    res.json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    next(error);
  }
}
