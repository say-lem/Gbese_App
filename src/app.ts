import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import userRoutes from './routes/v1/user.routes';
import transactionRoutes from './routes/v1/transaction.routes';
import { errorHandler } from './middleware/error.middleware';
import fraudRoute from './routes/fraude.route';
import cookieParser from 'cookie-parser';


dotenv.config();

const app = express();

app.use(cookieParser());
app.use(cors()); 
app.use(express.json()); 

app.use('/api/v1/users', userRoutes);
app.use('/api/v1/transactions', transactionRoutes);
app.use('/api/v1/fraud', fraudRoute); // Add this line to include the fraud route
app.get('/', (_req, res) => {
  res.send('Welcome to Gbese API'); 
});

app.use(errorHandler);

export default app;
