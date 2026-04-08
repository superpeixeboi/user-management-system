import { Router } from 'express';
import { userRegisterSchema, userUpdateSchema } from '../models/User.js';
import { validate } from '../middleware/error.js';
import { authMiddleware } from '../middleware/auth.js';
import { register, listUsers, getUser, updateUser, deleteUser } from '../middleware/user.js';

const router = Router();

router.post('/', validate(userRegisterSchema), register);
router.get('/', authMiddleware, listUsers);
router.get('/:id', authMiddleware, getUser);
router.patch('/:id', authMiddleware, validate(userUpdateSchema), updateUser);
router.delete('/:id', authMiddleware, deleteUser);

export default router;
