import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Table from '../models/Table.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';

function generateOrderCode() {
  return 'PDV-' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(2, 6).toUpperCase();
}

async function buildItems(items) {
  const products = await Product.find({ _id: { $in: items.map(i => i.productId) } });
  const map = new Map(products.map(product => [product._id.toString(), product]));

  return items.map(item => {
    const product = map.get(item.productId);
    if (!product) throw new ApiError(404, 'Produto não encontrado');
    if (!product.available) throw new ApiError(400, `Produto indisponível: ${product.name}`);

    return {
      product: product._id,
      name: product.name,
      quantity: item.quantity,
      unitPrice: product.price,
      notes: item.notes || ''
    };
  });
}

export const list = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.status) filter.status = req.query.status;

  const orders = await Order.find(filter)
    .populate('table', 'number status')
    .populate('waiter', 'name')
    .sort({ openedAt: -1 });

  res.json(orders);
});

export const getOne = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate('table', 'number status')
    .populate('waiter', 'name');

  if (!order) throw new ApiError(404, 'Pedido não encontrado');
  res.json(order);
});

export const create = asyncHandler(async (req, res) => {
  const { tableId, customerName, items } = req.validated;

  const table = await Table.findById(tableId);
  if (!table) throw new ApiError(404, 'Mesa não encontrada');
  if (table.status === 'OCCUPIED') throw new ApiError(400, 'Esta mesa já possui um pedido aberto');

  const order = await Order.create({
    code: generateOrderCode(),
    table: table._id,
    waiter: req.user.id,
    customerName,
    items: await buildItems(items)
  });

  table.status = 'OCCUPIED';
  await table.save();

  res.status(201).json(await order.populate([{ path: 'table', select: 'number status' }, { path: 'waiter', select: 'name' }]));
});

export const addItems = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) throw new ApiError(404, 'Pedido não encontrado');
  if (order.status !== 'OPEN') throw new ApiError(400, 'Só é possível adicionar itens antes de enviar à cozinha');

  order.items.push(...(await buildItems(req.validated.items)));
  await order.save();

  res.json(await order.populate([{ path: 'table', select: 'number status' }, { path: 'waiter', select: 'name' }]));
});

export const sendToKitchen = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) throw new ApiError(404, 'Pedido não encontrado');
  if (order.status !== 'OPEN') throw new ApiError(400, 'Pedido já foi enviado à cozinha');
  if (!order.items.length) throw new ApiError(400, 'Adicione itens antes de enviar');

  order.status = 'SENT';
  order.sentAt = new Date();
  await order.save();

  res.json(order);
});

const allowedTransitions = {
  SENT: ['PREPARING', 'CANCELED'],
  PREPARING: ['READY', 'CANCELED'],
  READY: ['DELIVERED', 'CANCELED'],
  DELIVERED: ['PAID', 'CANCELED']
};

export const changeStatus = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) throw new ApiError(404, 'Pedido não encontrado');

  const next = req.validated.status;
  const allowed = allowedTransitions[order.status] || [];

  if (!allowed.includes(next)) {
    throw new ApiError(400, `Transição inválida de ${order.status} para ${next}`);
  }

  order.status = next;

  if (next === 'PREPARING') order.readyAt = null;
  if (next === 'READY') order.readyAt = new Date();
  if (next === 'DELIVERED') order.deliveredAt = new Date();
  if (next === 'CANCELED') {
    order.closedAt = new Date();
    await Table.findByIdAndUpdate(order.table, { status: 'FREE' });
  }

  await order.save();
  res.json(order);
});

export const registerPayment = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) throw new ApiError(404, 'Pedido não encontrado');

  if (['PAID', 'CANCELED'].includes(order.status)) {
    throw new ApiError(400, 'Este pedido já foi encerrado');
  }

  const { method, amount } = req.validated;

  if (amount > order.remainingAmount + 0.001) {
    throw new ApiError(400, 'O valor informado é maior que o saldo restante');
  }

  order.payments.push({ method, amount, receivedBy: req.user.id });

  if (order.paidAmount >= order.total - 0.001) {
    order.status = 'PAID';
    order.closedAt = new Date();
    await Table.findByIdAndUpdate(order.table, { status: 'FREE' });
  } else if (order.status === 'OPEN') {
    order.status = 'DELIVERED';
    order.deliveredAt = order.deliveredAt || new Date();
  }

  await order.save();
  res.json(order);
});
