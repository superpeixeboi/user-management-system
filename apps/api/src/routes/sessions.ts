import { Router } from 'express';
import { userLoginSchema } from '../models/User.js';
import { validate } from '../middleware/error.js';
import { authenticate } from '../middleware/authenticate.js';
import { login, logout, getCurrentUser } from '../middleware/session.js';

const router = Router();

router.post('/', validate(userLoginSchema), login);
router.delete('/', authenticate, logout);
router.get('/profile', authenticate, getCurrentUser);

export default router;
