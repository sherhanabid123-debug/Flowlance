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

export const sendDailyReminderEmail = async (email: string, clients: any[]) => {
  const dashboardUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard`;
  
  const clientRows = clients.map(c => `
    <tr>
      <td style="padding: 12px 0; border-bottom: 1px solid #f3f4f6;">
        <div style="font-weight: bold; color: #111827; font-size: 14px;">${c.name}</div>
        <div style="font-size: 12px; color: #6b7280;">${c.projectName}</div>
      </td>
      <td style="padding: 12px 0; border-bottom: 1px solid #f3f4f6; text-align: right;">
        <span style="background: #fef3c7; color: #92400e; padding: 4px 8px; border-radius: 6px; font-size: 10px; font-weight: bold; text-transform: uppercase;">Due Today</span>
      </td>
    </tr>
  `).join('');

  const mailOptions = {
    from: '"Flowlance ⚡" <no-reply@flowlance.com>',
    to: email,
    subject: `⚡ Action Required: ${clients.length} Follow-ups Today`,
    html: `
      <div style="font-family: 'Inter', system-ui, sans-serif; background-color: #f9fafb; padding: 40px 20px;">
        <div style="max-width: 500px; margin: 0 auto; background: white; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
          <div style="background: #4f46e5; padding: 30px; text-align: center;">
             <h1 style="color: white; margin: 0; font-size: 22px;">Daily Follow-up Digest</h1>
             <p style="color: rgba(255,255,255,0.8); margin-top: 5px; font-size: 14px;">Stay on top of your growth.</p>
          </div>
          <div style="padding: 40px 30px;">
            <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
              Hello, you have <b>${clients.length}</b> client follow-up${clients.length > 1 ? 's' : ''} scheduled for today.
            </p>
            
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
              ${clientRows}
            </table>

            <div style="text-align: center; margin-top: 20px;">
              <a href="${dashboardUrl}" style="background: #4f46e5; color: white; padding: 14px 28px; border-radius: 12px; font-weight: bold; text-decoration: none; display: inline-block;">
                Visit Your Dashboard
              </a>
            </div>
          </div>
          <div style="background: #f3f4f6; padding: 20px; text-align: center; color: #9ca3af; font-size: 12px;">
            &copy; ${new Date().getFullYear()} Flowlance CRM. <br/>
            You received this because Email Reminders are ON in your profile.
          </div>
        </div>
      </div>
    `,
  };

  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log('\x1b[33m%s\x1b[0m', `⚠️ SMTP not configured. Daily reminder for ${email} would contain ${clients.length} clients.`);
    return true; 
  }

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Daily reminder email failed:', error);
    return false;
  }
};

export const sendTeamInviteEmail = async (email: string, inviterName: string, workspaceName: string, token: string) => {
  const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard?token=${token}`;

  const mailOptions = {
    from: '"Flowlance Teams" <no-reply@flowlance.com>',
    to: email,
    subject: `⚡ ${inviterName} invited you to join "${workspaceName}" team`,
    html: `
      <div style="font-family: 'Inter', system-ui, sans-serif; background-color: #f9fafb; padding: 40px 20px;">
        <div style="max-width: 500px; margin: 0 auto; background: white; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
          <div style="background: #4f46e5; padding: 30px; text-align: center;">
            <div style="background: rgba(255,255,255,0.2); width: 60px; height: 60px; border-radius: 15px; margin: 0 auto 15px; display: flex; align-items: center; justify-content: center; color: white; font-size: 24px; font-weight: bold;">
              ${workspaceName.charAt(0).toUpperCase()}
            </div>
            <h1 style="color: white; margin: 0; font-size: 22px;">Join Your Team</h1>
          </div>
          <div style="padding: 40px 30px;">
            <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
              Hello! <b>${inviterName}</b> has invited you to join the team for <b>"${workspaceName}"</b> on Flowlance CRM.
            </p>
            <p style="color: #6b7280; font-size: 14px; margin-bottom: 30px;">
              Once you join, you'll be able to collaborate on clients, track project progress, and manage share-based earnings together.
            </p>
            <div style="text-align: center; margin: 35px 0;">
              <a href="${inviteUrl}" style="background: #4f46e5; color: white; padding: 16px 32px; border-radius: 12px; font-weight: bold; text-decoration: none; display: inline-block; box-shadow: 0 10px 15px -3px rgba(79, 70, 229, 0.3);">
                Accept Invitation
              </a>
            </div>
            <p style="color: #9ca3af; font-size: 12px; text-align: center;">
              This invitation link will expire in 7 days.
            </p>
          </div>
          <div style="background: #f3f4f6; padding: 20px; text-align: center; color: #9ca3af; font-size: 12px;">
            &copy; ${new Date().getFullYear()} Flowlance CRM. <br/>
            The minimalist CRM for freelancers and agencies.
          </div>
        </div>
      </div>
    `,
  };

  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log('\x1b[33m%s\x1b[0m', `⚠️ SMTP not configured. Team invite link for ${email}:`);
    console.log('\x1b[36m%s\x1b[0m', inviteUrl);
    return true; 
  }

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Team invite email failed:', error);
    return false;
  }
};
