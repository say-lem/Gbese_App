import app from './app';
import { connectDB } from './database/db';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 5001;

const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`Gbese API is running on port ${PORT}`);
  });
};

startServer();
