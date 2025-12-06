import express from 'express';
import cors from 'cors';
import authRoutes from './modules/auth/auth.routes.js';
import usersRoutes from './modules/users/users.routes.js';
import storesRoutes from './modules/stores/stores.routes.js';

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

export default app;