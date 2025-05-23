import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware";
import CreditScoreController from "../../modules/reputation-credit-scoring/controllers/reputation-credit-scoring.controller";


const router = Router(); 

// Credit Score routes
router.get("/:userId", authenticate, CreditScoreController.getCreditScoreByUserId);
router.get("/loan/limit", authenticate, CreditScoreController.getUserLoanLimit);

export default router;