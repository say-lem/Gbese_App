import { Schema, model } from "mongoose";
import { FraudStatus, FraudType, IFraudDetection } from "../../../common/interfaces/fraud";

const FraudSchema = new Schema<IFraudDetection>({
    userId : {
        type: Schema.Types.ObjectId,
        required: true,
        refernce: 'User'
    },
    fraudType: {
        type: String,
        enum: [ FraudType.LOGIN, FraudType.TRANSACTION, FraudType.DEBT_TRANSFER],
        required: true
    },
    details : {
        type: Object,
        required: true
    },
    status: {
        type: String,
        enum: [FraudStatus.PENDING, FraudStatus.RESOLVED, FraudStatus.FALSE_POSITIVE],
        default: FraudStatus.PENDING
        
    },
    isDeleted :{
        type: Boolean,
        default: false
    }
},
    {
        timestamps: true,
        versionKey: false
    }
)

const FraudDetection = model("FraudDetection", FraudSchema);
export { FraudDetection };

