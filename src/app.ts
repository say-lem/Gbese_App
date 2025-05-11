import express from 'express';
import cors from 'cors';
import userRoutes from './routes/v1/user.routes';
import transactionRoutes from './routes/v1/transaction.routes';
import { loanRequestRouter, loanOfferRouter, loanRouter} from './routes/v1/credit-lending.routes';
import  creditScoreRouter  from './routes/v1/reputation-credit-score.routes';
import CryptoTransactionRouter from './routes/v1/crypto-transaction.routes';
import { errorHandler, notFound } from './middleware/error.middleware';
import cookieParser from 'cookie-parser';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors());


app.use('/api/v1/users', userRoutes);
app.use('/api/v1/transactions', transactionRoutes);

// credit-lending routers
app.use("/api/v1/loan-requests", loanRequestRouter);
app.use("/api/v1/loan-offers", loanOfferRouter);
app.use("/api/v1/loans", loanRouter);
app.use("/api/v1/credit-scores", creditScoreRouter);

// crypto transaction routers
app.use("/api/v1/crypto", CryptoTransactionRouter);

app.get('/', (_req, res) => {
  res.send('Welcome to Gbese API');
});

app.use(notFound);

app.use(errorHandler);

export default app;
