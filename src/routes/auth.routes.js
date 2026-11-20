import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { login, me } from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';
import { loginSchema, validate } from '../validators/schemas.js';

const router = Router();
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false
});

router.post('/login', loginLimiter, validate(loginSchema), login);
router.get('/me', authenticate, me);

export default router;
