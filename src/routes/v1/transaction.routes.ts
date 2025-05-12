import { Router } from 'express';
import { TransactionController } from '../../modules/transaction-managemment/controllers/transaction.controller';

import { authenticate } from '../../middleware/auth.middleware';
import { FundController } from '../../modules/transaction-managemment/controllers/paystackFund.controller';

const router = Router();

// Internal transactions
router.post('/withdraw', authenticate, TransactionController.withdraw);
router.post('/loan/pay-due', authenticate, TransactionController.payDueLoan);
router.get('/', authenticate, TransactionController.history);

// Paystack funding routes
router.post('/fund/initiate', authenticate, FundController.initiateFunding);
router.post('/fund/verify', authenticate, FundController.verifyFunding);

export default router;
