import { Router } from 'express';
import { list, create, update, remove } from '../controllers/userController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { userSchema, validate } from '../validators/schemas.js';

const router = Router();

router.use(authenticate);
router.get('/', authorize('ADMIN', 'MANAGER'), list);
router.post('/', authorize('ADMIN'), validate(userSchema), create);
router.patch('/:id', authorize('ADMIN'), update);
router.delete('/:id', authorize('ADMIN'), remove);

export default router;
