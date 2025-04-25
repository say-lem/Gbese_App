import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import userRoutes from './routes/v1/user.routes';

dotenv.config();

const app = express();

// Middleware
app.use(cors()); 
app.use(express.json()); 

// Routes
app.use('/api/v1/users', userRoutes);
app.get('/', (_req, res) => {
  res.send('Welcome to Gbese API'); 
});

export default app;
