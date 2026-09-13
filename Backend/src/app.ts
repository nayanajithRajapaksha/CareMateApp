import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes';
import childrenRoutes from './routes/childrenRoutes';
import staffRoutes from './routes/staffRoutes';
import userRoutes from './routes/userRoutes';
import clinicRoutes from './routes/clinicRoutes';

const app = express();

// Global Middleware
app.use(express.json());
app.use(cors());

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/children', childrenRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/users', userRoutes);
app.use('/api/clinics', clinicRoutes);

export default app;
