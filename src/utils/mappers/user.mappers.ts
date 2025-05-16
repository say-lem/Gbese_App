import { IUserResponse } from '../../common/interfaces/user';
import { IUserDocument } from '../../modules/user-management/Models/user.model';

export function mapUserToResponse(user: IUserDocument): IUserResponse {
  if (!user._id) throw new Error('User _id is missing');

  return {
    userId: user._id.toString(),
    username: user.username,
    email: user.email,
    phoneNumber: user.phoneNumber,
    registrationDate: user.registrationDate,
    baseCreditScore: user.baseCreditScore ?? 0,
    gbeseTokenBalance: user.gbeseTokenBalance ?? 0,
    role: user.role,
    isKYCVerified: user.isKYCVerified,
    isEmailVerified: user.isEmailVerified,
    walletAddress: user.walletAddress ?? '',
    usdcBalance: user.usdcBalance ?? 0,
    ethBalance: user.ethBalance ?? 0,
  };
}
