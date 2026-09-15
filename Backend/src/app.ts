import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes';
import childrenRoutes from './routes/childrenRoutes';
import staffRoutes from './routes/staffRoutes';
import userRoutes from './routes/userRoutes';
import clinicRoutes from './routes/clinicRoutes';
import blogRoutes from './routes/blogRoutes';
import { createBlogTableIfNotExists } from './models/blogModel';
import appointmentRoutes from './routes/appointmentRoutes';

const app = express();

// Initialize Database Tables
createBlogTableIfNotExists();

// Global Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cors());

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/children', childrenRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/users', userRoutes);
app.use('/api/clinics', clinicRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/appointments', appointmentRoutes);

export default app;

