import app from './app';
import { connectDB } from './database/db';
import { PORT } from './config/constants';
import { CryptoTransactionService } from './modules/transaction-managemment/services/cryptoTransaction.service';

const startServer = async () => {
  await connectDB();
  await CryptoTransactionService.startTransactionListener();

  app.listen(PORT, () => {
    console.log(`Gbese API is running on port ${PORT}`);
  });
};

startServer();
