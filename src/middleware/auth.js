import { verifyToken } from '../utils/jwt.js';
import { ApiError } from '../utils/ApiError.js';

export function authenticate(req, _res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return next(new ApiError(401, 'Token de autenticação não informado'));
  }

  try {
    const payload = verifyToken(token);
    req.user = { id: payload.sub, role: payload.role, name: payload.name };
    next();
  } catch {
    next(new ApiError(401, 'Token inválido ou expirado'));
  }
}

export function authorize(...roles) {
  return (req, _res, next) => {
    if (!req.user) return next(new ApiError(401, 'Não autenticado'));
    if (!roles.includes(req.user.role)) {
      return next(new ApiError(403, 'Você não tem permissão para esta ação'));
    }
    next();
  };
}
