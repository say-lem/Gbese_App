import { Request, Response } from 'express';
import { KYCVerificationModel} from '../models/kyc.model';


export class KYCController {
   static async submitKyc  (req: Request, res: Response): Promise<any>  {
  const { userId, bvn, nin, selfieURL, idType, idNumber} = req.body;

  if (!userId  || !bvn || !nin || !selfieURL || !idType || !idNumber) {
    return res.status(400).json({ message: 'Missing required KYC fields' });
  }

  try {
    const Kyc = await KYCVerificationModel.findByIdAndUpdate(
      userId,
      {
        kyc: {
          bvn,
          nin,
          selfieURL,
          idType,
          idNumber,
          verificationStatus: 'pending',
        },
      },
      { new: true }
    );

    if (!Kyc) return res.status(404).json({ message: 'User not found' });

    res.status(200).json({ message: 'KYC submitted', data: Kyc });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

static async verifyKyc (req: Request, res: Response): Promise<any> {
  const { userId, action, adminId } = req.body;

  if (!userId || !['approve', 'reject'].includes(action)) {
    return res.status(400).json({ message: 'Invalid input' });
  }

  try {
    const status = action === 'approve' ? 'verified' : 'rejected';

    const verifyKyc = await KYCVerificationModel.findByIdAndUpdate(
      userId,
      {
        'kyc.verification.status': status,
        'kyc.verification.reviewedAt': new Date(),
        'kyc.verification.reviewedBy': adminId,
      },
      { new: true }
    );

    if (!verifyKyc) return res.status(404).json({ message: 'User not found' });

    res.status(200).json({ message: `KYC ${status}`, data: verifyKyc.verification });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
}

};