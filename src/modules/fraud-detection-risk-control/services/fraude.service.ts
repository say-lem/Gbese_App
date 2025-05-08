import { Types } from "mongoose";
import { FraudDetection } from "../models/fraud-detection";
import { IFraudDetection, FraudStatus, FraudType } from "../../../common/interfaces/fraud";

class FraudService {
  async reportFraud(data: Omit<IFraudDetection, 'status' | 'isDeleted'>): Promise<IFraudDetection> {
    return await FraudDetection.create(data);
  }

  async getAllFraudReports(): Promise<IFraudDetection[]> {
    return await FraudDetection.find({ isDeleted: false });
  }

  async getFraudReportById(id: string): Promise<IFraudDetection | null> {
    return await FraudDetection.findById(id);
  }

  async updateFraudStatus(id: string, status: FraudStatus): Promise<IFraudDetection | null> {
    return await FraudDetection.findByIdAndUpdate(id, { status }, { new: true });
  }

  async softDeleteFraudReport(id: string): Promise<IFraudDetection | null> {
    return await FraudDetection.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
  }
}

export const fraudService = new FraudService();
