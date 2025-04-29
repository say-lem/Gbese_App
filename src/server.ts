import app from './app';
import { connectDB } from './database/db';
import { PORT } from './config/constants';

const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`Gbese API is running on port ${PORT}`);
  });
};

startServer();
