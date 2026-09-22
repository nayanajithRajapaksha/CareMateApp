import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes';
import childrenRoutes from './routes/childrenRoutes';
import staffRoutes from './routes/staffRoutes';
import userRoutes from './routes/userRoutes';
import clinicRoutes from './routes/clinicRoutes';
import blogRoutes from './routes/blogRoutes';
import appointmentRoutes from './routes/appointmentRoutes';
import notificationRoutes from './routes/notificationRoutes';
import vaccineRoutes from './routes/vaccineRoutes';
import { createBlogTableIfNotExists } from './models/blogModel';

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
app.use('/api/notifications', notificationRoutes);
app.use('/api/vaccines', vaccineRoutes);

// Keep-alive ping route
app.get('/ping', (req, res) => {
  res.status(200).send('pong');
});

export default app;
