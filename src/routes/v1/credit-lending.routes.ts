import { Router } from "express";
import CreditLendingController from "../../modules/credit-lending/controllers/credit-lending.controller";
import { authenticate } from "../../middleware/auth.middleware";

// Create separate routers
const loanRequestRouter = Router();
const loanOfferRouter = Router();
const loanRouter = Router();


// Loan Request routes
loanRequestRouter.post("/create", authenticate, CreditLendingController.createNewLoanRequest);
loanRequestRouter.post("/approve", CreditLendingController.approveLoanRequest);
loanRequestRouter.post("/reject", CreditLendingController.rejectLoanRequest);
loanRequestRouter.get("/:loanRequestId", authenticate, CreditLendingController.getLoanRequest);
loanRequestRouter.get("/user/:userId", authenticate, CreditLendingController.getUserLoanRequests);

// Loan Offer routes
loanOfferRouter.post("/", authenticate, CreditLendingController.createLenderLoanOffer);
loanOfferRouter.get("", authenticate, CreditLendingController.getAllLoanOffers);
loanOfferRouter.get("/:loanOfferId", authenticate, CreditLendingController.getLoanOfferById);
loanOfferRouter.get("/loan-request/:loanRequestId", authenticate, CreditLendingController.getLoanOfferByRequestId);

// Loan routes
loanRouter.post("/", authenticate, CreditLendingController.getUserLoans);
loanRouter.get("/:loanId", authenticate, CreditLendingController.getLoanById);
loanRouter.get("/lender", authenticate, CreditLendingController.getUserLoans);





export { loanRequestRouter, loanOfferRouter, loanRouter};