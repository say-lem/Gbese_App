"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fraudService = void 0;
const fraud_detection_1 = require("../models/fraud-detection");
class FraudService {
    async reportFraud(data) {
        return await fraud_detection_1.FraudDetection.create(data);
    }
    async getAllFraudReports() {
        return await fraud_detection_1.FraudDetection.find({ isDeleted: false });
    }
    async getFraudReportById(id) {
        return await fraud_detection_1.FraudDetection.findById(id);
    }
    async updateFraudStatus(id, status) {
        return await fraud_detection_1.FraudDetection.findByIdAndUpdate(id, { status }, { new: true });
    }
    async softDeleteFraudReport(id) {
        return await fraud_detection_1.FraudDetection.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
    }
}
exports.fraudService = new FraudService();
//# sourceMappingURL=fraude.service.js.map