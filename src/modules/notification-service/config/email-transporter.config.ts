import nodemailer from "nodemailer";
import { EMAIL_USER, EMAIL_PASS } from "../../../config/constants";

function EmailTransporter() {
	const transporter = nodemailer.createTransport({
		service: "gmail",
		auth: {
			user: EMAIL_USER,
			pass: EMAIL_PASS,
		},
	});
	return transporter;
}

export default EmailTransporter;
