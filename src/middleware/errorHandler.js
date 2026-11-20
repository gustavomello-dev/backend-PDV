import { ApiError } from '../utils/ApiError.js';

export function notFound(_req, _res, next) {
  next(new ApiError(404, 'Rota não encontrada'));
}

export function errorHandler(err, _req, res, _next) {
  if (err instanceof ApiError) {
    return res.status(err.status).json({ message: err.message, details: err.details });
  }

  if (err.name === 'ValidationError') {
    return res.status(422).json({ message: 'Dados inválidos', details: err.errors });
  }

  if (err.code === 11000) {
    return res.status(409).json({ message: 'Registro duplicado' });
  }

  console.error(err);
  res.status(500).json({ message: 'Erro interno do servidor' });
}
