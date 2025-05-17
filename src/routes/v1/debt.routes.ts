import { Router } from 'express';
import { DebtTransferController } from '../../modules/debt-transfer-protocol/controllers/debt.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();

router.post('/marketplace/upload', authenticate, DebtTransferController.uploadToMarketplace);
router.get('/marketplace', DebtTransferController.getMarketplaceLoans);
router.post('/direct/initiate', authenticate, DebtTransferController.initiateDirectTransfer);
router.post('/direct/accept', authenticate, DebtTransferController.acceptDebtTransfer);
router.post('/direct/decline', authenticate, DebtTransferController.declineDebtTransfer);
router.post('/marketplace/withdraw', authenticate, DebtTransferController.withdrawFromMarketplace);

export default router;