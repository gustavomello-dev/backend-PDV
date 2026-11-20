import { Router } from 'express';
import authRoutes from './auth.routes.js';
import userRoutes from './user.routes.js';
import productRoutes from './product.routes.js';
import tableRoutes from './table.routes.js';
import orderRoutes from './order.routes.js';
import kitchenRoutes from './kitchen.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/products', productRoutes);
router.use('/tables', tableRoutes);
router.use('/orders', orderRoutes);
router.use('/kitchen', kitchenRoutes);

export default router;
