import { Router } from 'express';
import { queue, updateStatus } from '../controllers/kitchenController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);
router.get('/queue', authorize('KITCHEN', 'MANAGER', 'ADMIN'), queue);
router.patch('/orders/:id/status', authorize('KITCHEN', 'MANAGER', 'ADMIN'), updateStatus);

export default router;
