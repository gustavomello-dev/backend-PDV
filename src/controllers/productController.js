import Product from '../models/Product.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';

export const list = asyncHandler(async (_req, res) => {
  const products = await Product.find().sort({ category: 1, name: 1 });
  res.json(products);
});

export const create = asyncHandler(async (req, res) => {
  const product = await Product.create(req.validated);
  res.status(201).json(product);
});

export const update = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if (!product) throw new ApiError(404, 'Produto não encontrado');
  res.json(product);
});

export const remove = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) throw new ApiError(404, 'Produto não encontrado');
  res.status(204).end();
});
