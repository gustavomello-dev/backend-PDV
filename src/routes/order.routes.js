import { Router } from 'express';
import {
  list,
  getOne,
  create,
  addItems,
  sendToKitchen,
  changeStatus,
  registerPayment
} from '../controllers/orderController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import {
  createOrderSchema,
  addItemsSchema,
  statusSchema,
  paymentSchema,
  validate
} from '../validators/schemas.js';

const router = Router();

router.use(authenticate);

router.get('/', list);
router.get('/:id', getOne);

router.post('/', authorize('WAITER', 'MANAGER', 'ADMIN'), validate(createOrderSchema), create);
router.patch('/:id/items', authorize('WAITER', 'MANAGER', 'ADMIN'), validate(addItemsSchema), addItems);
router.patch('/:id/send', authorize('WAITER', 'MANAGER', 'ADMIN'), sendToKitchen);
router.patch('/:id/status', authorize('WAITER', 'KITCHEN', 'MANAGER', 'ADMIN'), validate(statusSchema), changeStatus);
router.post('/:id/payments', authorize('CASHIER', 'MANAGER', 'ADMIN'), validate(paymentSchema), registerPayment);

export default router;
