import mongoose from 'mongoose';
import { env } from './config/env.js';
import User from './models/User.js';
import Product from './models/Product.js';
import Table from './models/Table.js';
import { hashPassword } from './utils/password.js';

const users = [
  { name: 'Administrador', email: 'admin@pdv.com', password: 'Admin@123', role: 'ADMIN' },
  { name: 'Gerente', email: 'gerente@pdv.com', password: 'Gerente@123', role: 'MANAGER' },
  { name: 'Garçom', email: 'garcom@pdv.com', password: 'Garcom@123', role: 'WAITER' },
  { name: 'Cozinha', email: 'cozinha@pdv.com', password: 'Cozinha@123', role: 'KITCHEN' },
  { name: 'Caixa', email: 'caixa@pdv.com', password: 'Caixa@123', role: 'CASHIER' }
];

const products = [
  { name: 'X-Burguer', category: 'Lanches', price: 28.9, description: 'Pão, carne, queijo e molho' },
  { name: 'Pizza Margherita', category: 'Pizzas', price: 49.9, description: 'Molho, mussarela e manjericão' },
  { name: 'Refrigerante Lata', category: 'Bebidas', price: 7.5, description: '350ml' },
  { name: 'Água Mineral', category: 'Bebidas', price: 4.5, description: '500ml' },
  { name: 'Batata Frita', category: 'Acompanhamentos', price: 18.9, description: 'Porção grande' }
];

await mongoose.connect(env.mongoUri);
await Promise.all([
  User.deleteMany({}),
  Product.deleteMany({}),
  Table.deleteMany({})
]);

await User.create(
  await Promise.all(
    users.map(async user => ({
      ...user,
      passwordHash: await hashPassword(user.password)
    }))
  )
);

await Product.create(products);
await Table.create(
  Array.from({ length: 10 }, (_, index) => ({ number: index + 1, seats: 4 }))
);

console.log('Seed concluído.');
await mongoose.disconnect();
