import { Router } from "express";
import CreditLendingController from "../../modules/credit-lending/controllers/credit-lending.controller";
import { authenticate } from "../../middleware/auth.middleware";

// Create separate routers
const loanRequestRouter = Router();
const loanOfferRouter = Router();
const loanRouter = Router();
const creditScoreRouter = Router(); 

// Loan Request routes
loanRequestRouter.post("/", authenticate, CreditLendingController.createNewLoanRequest);
loanRequestRouter.get("/:loanRequestId", authenticate, CreditLendingController.getLoanRequest);
loanRequestRouter.get("/user/:userId", authenticate, CreditLendingController.getUserLoanRequests);

// Loan Offer routes
loanOfferRouter.post("/", authenticate, CreditLendingController.createLenderLoanOffer);
loanOfferRouter.get("/:loanOfferId", authenticate, CreditLendingController.getLoanOfferById);
loanOfferRouter.get("/loan-request/:loanRequestId", authenticate, CreditLendingController.getLoanOfferByRequestId);

// Loan routes
loanRouter.post("/", authenticate, CreditLendingController.createLoan);
loanRouter.get("/:loanId", authenticate, CreditLendingController.getLoanById);
loanRouter.get("/lender/:lenderId", authenticate, CreditLendingController.getLenderLoans);

// Credit Score routes
creditScoreRouter.get("/:userId", authenticate, CreditLendingController.getCreditScoreByUserId);



export { loanRequestRouter, loanOfferRouter, loanRouter, creditScoreRouter };