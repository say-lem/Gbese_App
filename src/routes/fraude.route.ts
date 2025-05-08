import express from "express";
import { FraudController } from "../modules/fraud-detection-risk-control/controllers/fraud.controllers";

const router = express.Router();

router.post("/", FraudController.reportFraud);
router.get("/", FraudController.getAllFraudReports);
router.get("/:id", FraudController.getFraudReportById);
router.patch("/:id/status", FraudController.updateFraudStatus);
router.delete("/:id", FraudController.softDeleteFraudReport);

export default router;
