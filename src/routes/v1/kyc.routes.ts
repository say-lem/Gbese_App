import { Router } from 'express';
import { KYCController } from '../../modules/kyc/controller/kyc.controller';
import { checkKycSubmission } from '../../middleware/kyc.middleware';

const router = Router();

router.post('/submit', checkKycSubmission, KYCController.submitKyc);
router.post('/review', KYCController.verifyKyc);