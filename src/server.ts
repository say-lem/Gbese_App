import app from './app';
import { connectDB } from './database/db';
import dotenv from 'dotenv';

// Determine the environment and load the corresponding file
const envFile = process.env.NODE_ENV === "production" ? ".env" : ".env.local";
dotenv.config({ path: envFile });


const PORT = process.env.PORT || 5001;

const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`Gbese API is running on port ${PORT}`);
  });
};

startServer();
