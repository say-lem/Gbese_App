import { Request, Response, NextFunction } from 'express';
import { IKYCVerificationDocument, KYCVerificationModel } from '../modules/kyc/models/kyc.model';

export const checkKycSubmission = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  const { userId } = req.body;

  if (!userId) return res.status(400).json({ message: 'Missing userId' });

  try {
    const kyc = await KYCVerificationModel.findById(userId);
    if (!kyc) return res.status(404).json({ message: 'User not found' });

    if ((kyc as IKYCVerificationDocument).verification?.status === 'verified') {
      return res.status(400).json({ message: 'KYC already verified' });
    }

    next();
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

  