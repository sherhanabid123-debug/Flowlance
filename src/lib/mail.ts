import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER || 'smtp.example.com',
  port: parseInt(process.env.EMAIL_PORT || '587'),
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendResetPasswordEmail = async (email: string, token: string) => {
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password?token=${token}`;

  const mailOptions = {
    from: '"Flowlance Support" <no-reply@flowlance.com>',
    to: email,
    subject: 'Action Required: Reset Your ⚡ Flowlance Password',
    html: `
      <div style="font-family: 'Inter', system-ui, sans-serif; background-color: #f9fafb; padding: 40px 20px;">
        <div style="max-width: 500px; margin: 0 auto; background: white; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
          <div style="background: #6366f1; padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">Reset Password</h1>
          </div>
          <div style="padding: 40px 30px;">
            <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
              You requested a password reset for your Flowlance account. Click the button below to set a new password. This link will expire in <b>30 minutes</b>.
            </p>
            <div style="text-align: center; margin: 35px 0;">
              <a href="${resetUrl}" style="background: #6366f1; color: white; padding: 16px 32px; border-radius: 12px; font-weight: bold; text-decoration: none; display: inline-block; box-shadow: 0 10px 15px -3px rgba(99, 102, 241, 0.3);">
                Reset Password
              </a>
            </div>
            <p style="color: #6b7280; font-size: 14px; text-align: center;">
              If you didn't request this, you can safely ignore this email.
            </p>
          </div>
          <div style="background: #f3f4f6; padding: 20px; text-align: center; color: #9ca3af; font-size: 12px;">
            &copy; ${new Date().getFullYear()} Flowlance CRM. Built for freelancers.
          </div>
        </div>
      </div>
    `,
  };

  // Development Fallback: If no server is configured
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log('\x1b[33m%s\x1b[0m', '⚠️ SMTP not configured. Login link generated in terminal:');
    console.log('\x1b[36m%s\x1b[0m', resetUrl);
    return true; 
  }

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Email sending failed:', error);
    return false;
  }
};
