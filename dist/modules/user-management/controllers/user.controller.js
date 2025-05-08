"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const auth_service_1 = require("../services/auth.service");
const auth_utils_1 = require("../../../utils/auth.utils");
class UserController {
    static async register(req, res) {
        try {
            const { accessToken, refreshToken, user } = await auth_service_1.AuthService.register(req.body);
            res
                .cookie('refreshToken', refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 1 * 24 * 60 * 60 * 1000 // 1 days
            })
                .status(201)
                .json({ accessToken, user });
        }
        catch (err) {
            res.status(400).json({ error: err.message });
        }
    }
    static async login(req, res) {
        try {
            const { accessToken, refreshToken, user } = await auth_service_1.AuthService.login(req.body);
            res
                .cookie('refreshToken', refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 1 * 24 * 60 * 60 * 1000 // 1 days
            })
                .status(200)
                .json({ accessToken, user });
        }
        catch (err) {
            res.status(401).json({ error: err.message });
        }
    }
    static async refreshToken(req, res, next) {
        try {
            const token = req.cookies.refreshToken;
            if (!token)
                return next(res.status(401).json({ error: 'Refresh token not found' }));
            const payload = (0, auth_utils_1.verifyRefreshToken)(token);
            const newAccessToken = (0, auth_utils_1.generateAccessToken)(payload.userId);
            return next(res.status(200).json({ accessToken: newAccessToken }));
        }
        catch (err) {
            return next(res.status(403).json({ error: 'Invalid or expired refresh token' }));
        }
    }
}
exports.UserController = UserController;
//# sourceMappingURL=user.controller.js.map