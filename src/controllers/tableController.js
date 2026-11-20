import Table from '../models/Table.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';

export const list = asyncHandler(async (_req, res) => {
  const tables = await Table.find().sort({ number: 1 });
  res.json(tables);
});

export const create = asyncHandler(async (req, res) => {
  const table = await Table.create(req.validated);
  res.status(201).json(table);
});

export const update = asyncHandler(async (req, res) => {
  const table = await Table.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if (!table) throw new ApiError(404, 'Mesa não encontrada');
  res.json(table);
});

export const remove = asyncHandler(async (req, res) => {
  const table = await Table.findByIdAndDelete(req.params.id);
  if (!table) throw new ApiError(404, 'Mesa não encontrada');
  res.status(204).end();
});
