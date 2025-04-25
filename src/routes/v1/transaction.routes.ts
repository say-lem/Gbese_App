import { Router } from 'express';
import { TransactionController } from '../../modules/transaction-managemment/controllers/transaction.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();

router.post('/deposit', authenticate, TransactionController.deposit);
router.post('/withdraw', authenticate, TransactionController.withdraw);
router.get('/', authenticate, TransactionController.history); 

export default router;