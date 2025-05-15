import { MailOptions } from "../../../common/interfaces/EmailOptions";
import {EMAIL_USER } from "../../../config/constants";
import { loanRequestWS, transactionWS } from "../../../server";
import EmailTransporter from "../config/email-transporter.config";

export default class NotificationService {
	static async notifyUserLoanRequest(userId: string, messagePayload: any) {
		loanRequestWS.sendNotification(userId, messagePayload);
	}

	static async notifyTransactionDone(
		lenderId: string,
		borrowerId: string,
		messagePayload: any
	) {
		// this service is sender and recipient transaction notification
		transactionWS.sendNotification(lenderId, messagePayload.senderTransaction);
		transactionWS.sendNotification(
			borrowerId,
			messagePayload.recipientTransaction
		);
	}

	static async sendEmailNotification(mailTo: string, mailOptions: MailOptions) {
		const transporter = EmailTransporter();
		try {
			await transporter.sendMail({
				from: `GBESE APP<${EMAIL_USER}>`,
				to: mailTo,
				subject: mailOptions.subject,
				text: mailOptions.text,
				html: mailOptions.html,
			});
		} catch (error) {
			console.log("email error:", error);
		}
	}
}
