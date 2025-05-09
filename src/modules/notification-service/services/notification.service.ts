import { loanRequestWS, transactionWS } from "../../../server";


export default class NotificationService {
    static async notifyUserLoanRequest(userId: string, messagePayload: any){
        loanRequestWS.sendNotification(userId, messagePayload);
    }

    static async notifyTransactionDone(lenderId:string, borrowerId:string, messagePayload: any){
        // this service is sender and recipient transaction notification
        transactionWS.sendNotification(lenderId, messagePayload.senderTransaction);
        transactionWS.sendNotification(borrowerId, messagePayload.recipientTransaction);
    }

}