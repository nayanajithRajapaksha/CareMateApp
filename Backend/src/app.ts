import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes';
import childrenRoutes from './routes/childrenRoutes';

const app = express();

// Global Middleware
app.use(express.json());
app.use(cors());

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/children', childrenRoutes);

export default app;
