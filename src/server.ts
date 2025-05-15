import app from './app';
import { connectDB } from './database/db';
import { PORT } from './config/constants';
import WebSocketManager from "./websocket/websocket";
import { CryptoTransactionService } from './modules/transaction-managemment/services/cryptoTransaction.service';

const startServer = async () => {
  await connectDB();
  await CryptoTransactionService.startTransactionListener();
  
	const server = app.listen(PORT, () => {
		console.log(`Gbese API is running on port ${PORT}`);
	});

	return server;
};

let paymentWS: WebSocketManager;
let loanRequestWS: WebSocketManager;
let debtTransferWS: WebSocketManager;
let transactionWS: WebSocketManager;

startServer().then((server) => {
	paymentWS = new WebSocketManager(server, "/ws/v1/payments");
	loanRequestWS = new WebSocketManager(server, "/ws/v1/loan-requests");
	debtTransferWS = new WebSocketManager(server, "/ws/v1/debt-transfers");
	transactionWS = new WebSocketManager(server, "/ws/v1/transactions");
});

export { paymentWS, loanRequestWS, debtTransferWS, transactionWS };
