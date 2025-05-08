"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FraudController = void 0;
const fraude_service_1 = require("../services/fraude.service");
exports.FraudController = {
    async reportFraud(req, res) {
        try {
            const fraud = await fraude_service_1.fraudService.reportFraud(req.body);
            res.status(201).json(fraud);
        }
        catch (error) {
            res.status(500).json({ message: "Error reporting fraud", error });
        }
    },
    async getAllFraudReports(req, res) {
        try {
            const reports = await fraude_service_1.fraudService.getAllFraudReports();
            res.json(reports);
        }
        catch (error) {
            res.status(500).json({ message: "Error fetching fraud reports", error });
        }
    },
    async getFraudReportById(req, res) {
        try {
            const report = await fraude_service_1.fraudService.getFraudReportById(req.params.id);
            if (!report) {
                res.status(404).json({ message: "Report not found" });
                return;
            }
            res.json(report);
        }
        catch (error) {
            res.status(500).json({ message: "Error fetching report", error });
        }
    },
    async updateFraudStatus(req, res) {
        try {
            const updated = await fraude_service_1.fraudService.updateFraudStatus(req.params.id, req.body.status);
            if (!updated) {
                res.status(404).json({ message: "Report not found" });
                return;
            }
            res.json(updated);
        }
        catch (error) {
            res.status(500).json({ message: "Error updating fraud status", error });
        }
    },
    async softDeleteFraudReport(req, res) {
        try {
            const deleted = await fraude_service_1.fraudService.softDeleteFraudReport(req.params.id);
            if (!deleted) {
                res.status(404).json({ message: "Report not found" });
                return;
            }
            res.json({ message: "Report deleted", deleted });
        }
        catch (error) {
            res.status(500).json({ message: "Error deleting report", error });
        }
    }
};
//# sourceMappingURL=fraud.controllers.js.map