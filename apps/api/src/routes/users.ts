import { Router } from 'express';
import { userRegisterSchema, userUpdateSchema } from '../models/User.js';
import { validate } from '../middleware/error.js';
import { authenticate } from '../middleware/authenticate.js';

// as instructed, ignoring the admin role verification, allowing every user to the admin features
//import { requireAdmin } from '../middleware/authorize.js';
import { register, listUsers, getUser, updateUser, deleteUser } from '../middleware/user.js';

const router = Router();

router.post('/',
  validate(userRegisterSchema),
  register
);

router.get('/', 
  authenticate, 
  // requireAdmin, 
  listUsers
);

router.get('/:id',
  authenticate,
  // requireAdmin,
  getUser
);

router.patch('/:id',
  authenticate,
  // requireAdmin,
  validate(userUpdateSchema),
  updateUser
);

router.delete('/:id',
  authenticate,
  // requireAdmin,
  deleteUser
);

export default router;
