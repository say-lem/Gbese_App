import { Router } from 'express';
import { DebtController } from '../../modules/debt-transfer-protocol/controllers/debt.controller';

const router = Router();

router.get('/',  DebtController.getAllDebtTransfers);

router.get('/:userId', DebtController.getUserDebtTransfers);

router.post('/', DebtController.postDebtTransferAd);


export default router;