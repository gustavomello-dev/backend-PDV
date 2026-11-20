import User from '../models/User.js';
import { hashPassword } from '../utils/password.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';

export const list = asyncHandler(async (_req, res) => {
  const users = await User.find().sort({ createdAt: -1 });
  res.json(users);
});

export const create = asyncHandler(async (req, res) => {
  const { name, email, password, role, active } = req.validated;

  const exists = await User.findOne({ email: email.toLowerCase() });
  if (exists) throw new ApiError(409, 'E-mail já cadastrado');

  const user = await User.create({
    name,
    email,
    passwordHash: await hashPassword(password),
    role,
    active: active ?? true
  });

  res.status(201).json(user);
});

export const update = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new ApiError(404, 'Usuário não encontrado');

  const { name, role, active, password } = req.body;
  if (name) user.name = name;
  if (role) user.role = role;
  if (typeof active === 'boolean') user.active = active;
  if (password) user.passwordHash = await hashPassword(password);

  await user.save();
  res.json(user);
});

export const remove = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new ApiError(404, 'Usuário não encontrado');

  if (user._id.toString() === req.user.id) {
    throw new ApiError(400, 'Você não pode excluir seu próprio usuário');
  }

  await user.deleteOne();
  res.status(204).end();
});
