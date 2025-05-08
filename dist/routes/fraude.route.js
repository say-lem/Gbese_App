"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const fraud_controllers_1 = require("../modules/fraud-detection-risk-control/controllers/fraud.controllers");
const router = express_1.default.Router();
router.post("/", fraud_controllers_1.FraudController.reportFraud);
router.get("/", fraud_controllers_1.FraudController.getAllFraudReports);
router.get("/:id", fraud_controllers_1.FraudController.getFraudReportById);
router.patch("/:id/status", fraud_controllers_1.FraudController.updateFraudStatus);
router.delete("/:id", fraud_controllers_1.FraudController.softDeleteFraudReport);
exports.default = router;
//# sourceMappingURL=fraude.route.js.map