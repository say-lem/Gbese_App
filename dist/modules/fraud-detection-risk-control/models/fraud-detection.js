"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FraudDetection = void 0;
const mongoose_1 = require("mongoose");
const fraud_1 = require("../../../common/interfaces/fraud");
const FraudSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: true,
        refernce: 'User'
    },
    fraudType: {
        type: String,
        enum: [fraud_1.FraudType.LOGIN, fraud_1.FraudType.TRANSACTION, fraud_1.FraudType.DEBT_TRANSFER],
        required: true
    },
    details: {
        type: Object,
        required: true
    },
    status: {
        type: String,
        enum: [fraud_1.FraudStatus.PENDING, fraud_1.FraudStatus.RESOLVED, fraud_1.FraudStatus.FALSE_POSITIVE],
        default: fraud_1.FraudStatus.PENDING
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true,
    versionKey: false
});
const FraudDetection = (0, mongoose_1.model)("FraudDetection", FraudSchema);
exports.FraudDetection = FraudDetection;
//# sourceMappingURL=fraud-detection.js.map