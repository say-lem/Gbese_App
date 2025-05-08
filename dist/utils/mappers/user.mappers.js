"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mapUserToResponse = mapUserToResponse;
function mapUserToResponse(user) {
    if (!user._id)
        throw new Error('User _id is missing');
    return {
        userId: user._id.toString(),
        username: user.username,
        email: user.email,
        phoneNumber: user.phoneNumber,
        registrationDate: user.registrationDate,
        baseCreditScore: user.baseCreditScore,
        gbeseTokenBalance: user.gbeseTokenBalance,
        role: user.role,
        isKYCVerified: user.isKYCVerified
    };
}
//# sourceMappingURL=user.mappers.js.map