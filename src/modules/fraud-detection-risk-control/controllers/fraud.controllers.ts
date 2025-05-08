import { Request, Response } from "express";
import { fraudService } from "../services/fraude.service";
import { FraudStatus } from "../../../common/interfaces/fraud";

export const FraudController = {
  async reportFraud(req: Request, res: Response) {
    try {
      const fraud = await fraudService.reportFraud(req.body);
      res.status(201).json(fraud);
    } catch (error) {
      res.status(500).json({ message: "Error reporting fraud", error });
    }
  },

  async getAllFraudReports(req: Request, res: Response) {
    try {
      const reports = await fraudService.getAllFraudReports();
      res.json(reports);
    } catch (error) {
      res.status(500).json({ message: "Error fetching fraud reports", error });
    }
  },

  async getFraudReportById(req: Request, res: Response) {
    try {
      const report = await fraudService.getFraudReportById(req.params.id);
      if (!report) {

           res.status(404).json({ message: "Report not found" });
           return;
      }
      res.json(report);
    } catch (error) {
      res.status(500).json({ message: "Error fetching report", error });
    }
  },

  async updateFraudStatus(req: Request, res: Response) {
    try {
      const updated = await fraudService.updateFraudStatus(req.params.id, req.body.status);
      if (!updated){
        res.status(404).json({ message: "Report not found" });
        return;
      } 
      res.json(updated);
    } catch (error) {
      res.status(500).json({ message: "Error updating fraud status", error });
    }
  },

  async softDeleteFraudReport(req: Request, res: Response) {
    try {
      const deleted = await fraudService.softDeleteFraudReport(req.params.id);
      if (!deleted){
        res.status(404).json({ message: "Report not found" });
        return;
      } 
      res.json({ message: "Report deleted", deleted });
    } catch (error) {
      res.status(500).json({ message: "Error deleting report", error });
    }
  }
};
