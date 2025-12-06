import express from 'express';
import cors from 'cors';
import authRoutes from './modules/auth/auth.routes.js';
import usersRoutes from './modules/users/users.routes.js';
import storesRoutes from './modules/stores/stores.routes.js';
import productsRoutes from './modules/products/products.routes.js';
import visitsRoutes from './modules/visits/visits.routes.js';
import ordersRoutes from './modules/orders/orders.routes.js';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (_req, res) => {
    res.send('Hola!')
});

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/stores', storesRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/visits', visitsRoutes);
app.use('/api/orders', ordersRoutes);

export default app;