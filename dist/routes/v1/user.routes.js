"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controller_1 = require("../../modules/user-management/controllers/user.controller");
const router = (0, express_1.Router)();
router.post('/register', user_controller_1.UserController.register);
router.post('/login', user_controller_1.UserController.login);
router.post('/refresh-token', user_controller_1.UserController.refreshToken);
router.get('/test', (_req, res) => {
    res.send('User route is working!');
});
exports.default = router;
//# sourceMappingURL=user.routes.js.map