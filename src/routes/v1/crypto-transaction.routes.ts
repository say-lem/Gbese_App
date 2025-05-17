import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { CryptoTransactionController } from '../../modules/transaction-managemment/controllers/cryptoTransaction.controller';

const router = Router();

// Balance endpoints
router.get('/balance/usdc', authenticate, CryptoTransactionController.getUSDCBalance);
router.get('/balance', authenticate, CryptoTransactionController.getUserTokenBalances);

// Transaction endpoints
router.post('/transfer/internal', authenticate, CryptoTransactionController.InternalTransfer);
router.post('/transfer/external', authenticate, CryptoTransactionController.externalTransfer);

// Transaction history
router.get('/history/:userName', authenticate, CryptoTransactionController.getTransactionHistory);
router.get('/currency/:currency', authenticate, CryptoTransactionController.getTransactionsByCurrency);
router.delete('/:transactionId', authenticate, CryptoTransactionController.deleteTransaction);

export default router;