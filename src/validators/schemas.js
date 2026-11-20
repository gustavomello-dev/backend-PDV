import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'A senha deve ter no mínimo 6 caracteres')
});

export const userSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['ADMIN', 'MANAGER', 'WAITER', 'KITCHEN', 'CASHIER']),
  active: z.boolean().optional()
});

export const productSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional().default(''),
  category: z.string().optional().default('Geral'),
  price: z.number().nonnegative(),
  available: z.boolean().optional().default(true)
});

export const tableSchema = z.object({
  number: z.number().int().positive(),
  seats: z.number().int().positive().default(4),
  status: z.enum(['FREE', 'OCCUPIED', 'RESERVED']).optional()
});

export const createOrderSchema = z.object({
  tableId: z.string().min(1),
  customerName: z.string().optional().default(''),
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        quantity: z.number().int().positive(),
        notes: z.string().optional().default('')
      })
    )
    .min(1)
});

export const addItemsSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        quantity: z.number().int().positive(),
        notes: z.string().optional().default('')
      })
    )
    .min(1)
});

export const statusSchema = z.object({
  status: z.enum(['PREPARING', 'READY', 'DELIVERED', 'CANCELED'])
});

export const paymentSchema = z.object({
  method: z.enum(['CASH', 'CARD', 'PIX']),
  amount: z.number().positive()
});

export function validate(schema) {
  return (req, _res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return next(
        Object.assign(new Error('Dados inválidos'), {
          status: 422,
          details: result.error.flatten().fieldErrors
        })
      );
    }
    req.validated = result.data;
    next();
  };
}
