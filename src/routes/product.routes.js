import { Router } from 'express';
import { list, create, update, remove } from '../controllers/productController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { productSchema, validate } from '../validators/schemas.js';

const router = Router();

router.use(authenticate);
router.get('/', list);
router.post('/', authorize('ADMIN', 'MANAGER'), validate(productSchema), create);
router.patch('/:id', authorize('ADMIN', 'MANAGER'), update);
router.delete('/:id', authorize('ADMIN', 'MANAGER'), remove);

export default router;
