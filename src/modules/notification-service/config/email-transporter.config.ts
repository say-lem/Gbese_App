import nodemailer from "nodemailer";
import { GMAIL_APP_EMAIL, GMAIL_APP_PASSWORD } from "../../../config/constants";

function EmailTransporter() {
	const transporter = nodemailer.createTransport({
        // host:"stmp.gmail.com",
        // port:587,
		service: "gmail",
		auth: {
			user: GMAIL_APP_EMAIL,
			pass: GMAIL_APP_PASSWORD,
		},
	});
	return transporter;
}

export default EmailTransporter;
