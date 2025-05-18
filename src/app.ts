import express from "express";
import cors from "cors";
import userRoutes from "./routes/v1/user.routes";
import transactionRoutes from "./routes/v1/transaction.routes";
import {
	loanRequestRouter,
	loanOfferRouter,
	loanRouter,
} from "./routes/v1/credit-lending.routes";
import creditScoreRouter from "./routes/v1/reputation-credit-score.routes";
import CryptoTransactionRouter from "./routes/v1/crypto-transaction.routes";
import debtTransferRoutes from './routes/v1/debt.routes';
import { errorHandler, notFound } from "./middleware/error.middleware";
import cookieParser from "cookie-parser";
import session from "express-session";
import {
  FRONTEND_URL,
	NODE_ENV,
	REDIS_HOST,
	REDIS_PASSWORD,
	REDIS_PORT,
	REDIS_USERNAME,
  SESSION_SECRET,
} from "./config/constants";
import { createClient } from "redis";
import { RedisStore } from "connect-redis";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({
  origin: [FRONTEND_URL, "http://localhost:3000"],
  credentials:true,
}));

const redisClient = createClient({
	username: REDIS_USERNAME,
	password: REDIS_PASSWORD,
	socket: {
		host: REDIS_HOST,
		port: REDIS_PORT,
	},
});
redisClient.connect();

app.use(
	session({
    name:"gbese.sid",
		store: new RedisStore({ client: redisClient, prefix: "gbeseSID:" }),
		secret: SESSION_SECRET,
		resave: false,
		saveUninitialized: false,
		cookie: {
      httpOnly: true,
      sameSite: true,
			secure: NODE_ENV === "production",
			maxAge: 1000 * 60 * 30, // 30 mins for session expiration
		},
	})
);

app.use("/api/v1/users", userRoutes);
app.use("/api/v1/transactions", transactionRoutes);
app.use('/api/v1/debt-transfer', debtTransferRoutes);

// credit-lending routers
app.use("/api/v1/loan-requests", loanRequestRouter);
app.use("/api/v1/loan-offers", loanOfferRouter);
app.use("/api/v1/loans", loanRouter);
app.use("/api/v1/credit-scores", creditScoreRouter);

// crypto transaction routers
app.use("/api/v1/crypto", CryptoTransactionRouter);

app.get("/", (_req, res) => {
	res.send("Welcome to Gbese API");
});

app.use(notFound);

app.use(errorHandler);


export default app;
