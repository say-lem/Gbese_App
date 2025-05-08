"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const transaction_controller_1 = require("../../modules/transaction-managemment/controllers/transaction.controller");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const router = (0, express_1.Router)();
router.post('/deposit', auth_middleware_1.authenticate, transaction_controller_1.TransactionController.deposit);
router.post('/withdraw', auth_middleware_1.authenticate, transaction_controller_1.TransactionController.withdraw);
router.get('/', auth_middleware_1.authenticate, transaction_controller_1.TransactionController.history);
exports.default = router;
//# sourceMappingURL=transaction.routes.js.map