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
import { errorHandler, notFound } from "./middleware/error.middleware";
import cookieParser from "cookie-parser";
import session from "express-session";
import {
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
  origin:'http://localhost:3002',
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
    name:"gbese",
		store: new RedisStore({ client: redisClient, prefix: "gbeseapp:" }),
		secret: SESSION_SECRET,
		resave: false,
		saveUninitialized: false,
		cookie: {
      httpOnly: true,
      sameSite: true,
			secure: NODE_ENV === "production",
			maxAge: 1000 * 60 * 60 * 24, // 1 day
		},
	})
);

app.use("/api/v1/users", userRoutes);
app.use("/api/v1/transactions", transactionRoutes);

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
