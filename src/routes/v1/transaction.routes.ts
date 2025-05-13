import { Router } from 'express';
import { TransactionController } from '../../modules/transaction-managemment/controllers/transaction.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { FundController } from '../../modules/transaction-managemment/controllers/paystackFund.controller';

const router = Router();

// Internal transactions
router.post('/withdraw', authenticate, TransactionController.withdraw);
router.post('/loan/pay-due', authenticate, TransactionController.payDueLoan);
router.get('/', authenticate, TransactionController.history);
router.post('/transfer', authenticate, TransactionController.transfer);
router.get('/:transactionId', authenticate, TransactionController.getTransactionById);

// Paystack funding routes
router.post('/fund/initiate', authenticate, FundController.initiateFunding);
router.post('/fund/verify', authenticate, FundController.verifyFunding);

export default router;
