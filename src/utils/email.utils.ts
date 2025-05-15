import EmailTransporter from '../modules/notification-service/config/email-transporter.config';

export const sendVerificationEmail = async (to: string, otp: string) => {
  const transporter = EmailTransporter();

  await transporter.sendMail({
    from: `"Gbese App" <${process.env.EMAIL_USER}>`,
    to,
    subject: 'Verify your email',
    text: `Your verification code is: ${otp}`,
    html: `<p>Your OTP is: <strong>${otp}</strong></p>`
  });
};
