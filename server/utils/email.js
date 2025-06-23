import nodemailer from 'nodemailer';

export async function sendEmailNotification({ to, subject, text, html }) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASSWORD
    }
  });

  const mailOptions = {
    from: process.env.EMAIL,
    to,
    subject,
    text,
    html
  };

  return transporter.sendMail(mailOptions);
} 