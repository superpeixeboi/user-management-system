import { Router } from 'express';
import { userLoginSchema } from '../models/User.js';
import { validate } from '../middleware/error.js';
import { authMiddleware } from '../middleware/auth.js';
import { login, logout, getCurrentUser } from '../middleware/session.js';

const router = Router();

router.post('/', validate(userLoginSchema), login);
router.delete('/', authMiddleware, logout);
router.get('/profile', authMiddleware, getCurrentUser);

export default router;
