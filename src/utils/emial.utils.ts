import nodemailer from 'nodemailer';

export const sendVerificationEmail = async (to: string, otp: string) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail', // or your SMTP provider
    auth: {
      user: process.env.EMAIL_USER!,
      pass: process.env.EMAIL_PASS!
    }
  });

  await transporter.sendMail({
    from: `"Gbese App" <${process.env.EMAIL_USER}>`,
    to,
    subject: 'Verify your email',
    text: `Your verification code is: ${otp}`,
    html: `<p>Your OTP is: <strong>${otp}</strong></p>`
  });
};
