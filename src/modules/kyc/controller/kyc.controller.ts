import { Request, Response } from 'express';
import { KYCVerificationModel} from '../models/kyc.model';

export const submitKyc = async (req: Request, res: Response) => {
  const { userId, bvn, nin, selfieURL, idType, idNumber} = req.body;

  if (!userId  || !bvn || !nin || !selfieURL || !idType || !idNumber) {
    return res.status(400).json({ message: 'Missing required KYC fields' });
  }

  try {
    const kyc = await KYCVerificationModel.findByIdAndUpdate(
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

    if (!kyc) return res.status(404).json({ message: 'User not found' });

    res.status(200).json({ message: 'KYC submitted', data: kyc });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};
