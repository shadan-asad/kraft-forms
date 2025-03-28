import { Router } from 'express';
import { register, login, logout } from '../controllers/authController';
import { validateRequest } from '../middlewares/validationMiddleware';
import { registerSchema, loginSchema } from '../validations/authValidation';
import { authenticate } from '../middlewares/authMiddleware';

const router = Router();

router.post('/register', validateRequest(registerSchema), register);
router.post('/login', validateRequest(loginSchema), login);
router.post('/logout', authenticate, logout);

export default router; 