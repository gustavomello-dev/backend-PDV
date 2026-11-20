import User from '../models/User.js';
import { comparePassword } from '../utils/password.js';
import { signToken } from '../utils/jwt.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.validated;

  const user = await User.findOne({ email: email.toLowerCase() });
  const valid = user && (await comparePassword(password, user.passwordHash));

  if (!valid || !user.active) {
    throw new ApiError(401, 'E-mail ou senha inválidos');
  }

  res.json({
    token: signToken(user),
    user: { id: user._id, name: user.name, email: user.email, role: user.role }
  });
});

export const me = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) throw new ApiError(404, 'Usuário não encontrado');
  res.json({ id: user._id, name: user.name, email: user.email, role: user.role });
});
