"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FraudStatus = exports.FraudType = void 0;
var FraudType;
(function (FraudType) {
    FraudType["LOGIN"] = "login";
    FraudType["TRANSACTION"] = "transaction";
    FraudType["DEBT_TRANSFER"] = "debt-transfer";
})(FraudType || (exports.FraudType = FraudType = {}));
var FraudStatus;
(function (FraudStatus) {
    FraudStatus["PENDING"] = "pending";
    FraudStatus["RESOLVED"] = "resolved";
    FraudStatus["FALSE_POSITIVE"] = "false positive";
})(FraudStatus || (exports.FraudStatus = FraudStatus = {}));
//# sourceMappingURL=fraud.js.map