import { Router } from 'express';
import { DebtController } from '../../modules/debt-transfer-protocol/controllers/debt.controller';

const router = Router();

router.get('/:userId', DebtController.getUserDebtTransfers);